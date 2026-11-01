import { getSocket } from '@/lib/socket';
import { clearSoundSettings, playSound } from '@/lib/sound';
import { useEffect, useRef, useState } from 'react';
import { writeColorChoice } from './colors';
import { useChat } from './use-chat';
import { useSound } from './use-sound';
import { useUserList } from './use-user-list';

/** The chat panel's three faces: the room itself, who is here, and the
    listener's own settings — swapped in place behind the header's lamps. */
export type ChatPage = 'room' | 'listeners' | 'settings';

/** How long a run of joins waits before it is judged settled enough to chime. */
const JOIN_SOUND_DEBOUNCE_MS = 1_500;

export type ChatRoom = {
  nickname: string;
  nicknameError: string | null;
  clearNicknameError: () => void;
  /** Validates and joins; on a bad name sets `nicknameError` instead. */
  setNickname: (name: string) => void;
  messages: ReturnType<typeof useChat>['messages'];
  sendMessage: (text: string) => void;
  users: ReturnType<typeof useUserList>;
  sound: ReturnType<typeof useSound>;
  page: ChatPage;
  /** Opens a page, or closes it back to the room if it (or the other one) is already open. */
  togglePage: (target: 'listeners' | 'settings') => void;
  /** Wipes the nickname, sound settings and colour choice back to a clean slate. */
  clearData: () => void;
};

/**
 * The room's state, lifted above the chat so the island can hold its input
 * on small screens: the nickname and its gate's validation, the messages
 * and who is listening, the chat sounds — speaking to wave's WebSocket as
 * the old player did.
 */
export const useChatRoom = (): ChatRoom => {
  const [nickname, setNicknameState] = useState(
    () => localStorage.getItem('nickname') ?? '',
  );
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const { messages, sendMessage } = useChat(nickname || null);
  const users = useUserList();
  const sound = useSound();
  const [page, setPage] = useState<ChatPage>('room');

  // A reconnect can re-announce a whole room at once; the old bar's 1.5s
  // debounce waits for the count to settle before chiming once for the batch.
  const settledCount = useRef(users.length);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (users.length > settledCount.current) playSound('join');
      settledCount.current = users.length;
    }, JOIN_SOUND_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [users.length]);

  useEffect(() => {
    if (page === 'room') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPage('room');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page]);

  const togglePage = (target: 'listeners' | 'settings') => {
    setPage((current) => (current === 'room' ? target : 'room'));
  };

  const setNickname = (name: string) => {
    const trimmedName = name.trim();
    setNicknameError(null);

    if (trimmedName.length < 2) {
      setNicknameError('The name has to be at least 2 characters');
      return;
    }
    if (trimmedName.length > 20) {
      setNicknameError('The name has to be at most 20 characters');
      return;
    }
    if (['anonymous', 'anon', 'анонім'].includes(trimmedName.toLowerCase())) {
      setNicknameError('That name is reserved, try another');
      return;
    }
    if (
      trimmedName.toLowerCase() !== nickname.toLowerCase() &&
      users.some(
        (user) => user.nickname.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setNicknameError('That name is already taken, try another');
      return;
    }

    setNicknameState(trimmedName);
    localStorage.setItem('nickname', trimmedName);
    try {
      const ws = getSocket();
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'join', nickname: trimmedName }));
      }
    } catch {
      // The socket is down; it will rejoin from localStorage on reconnect.
    }
  };

  const clearData = () => {
    localStorage.removeItem('nickname');
    clearSoundSettings();
    writeColorChoice(null);
    setNicknameState('');
    setNicknameError(null);
    setPage('room');
  };

  return {
    nickname,
    nicknameError,
    clearNicknameError: () => setNicknameError(null),
    setNickname,
    messages,
    sendMessage,
    users,
    sound,
    page,
    togglePage,
    clearData,
  };
};
