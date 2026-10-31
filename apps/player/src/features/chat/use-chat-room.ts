import { getSocket } from '@/lib/socket';
import { useState } from 'react';
import { useChat } from './use-chat';
import { useSound } from './use-sound';
import { useUserList } from './use-user-list';

export type ChatRoom = {
  nickname: string;
  nicknameError: string | null;
  clearNicknameError: () => void;
  /** Validates and joins; on a bad name sets `nicknameError` instead. */
  setNickname: (name: string) => void;
  messages: ReturnType<typeof useChat>['messages'];
  sendMessage: (text: string) => void;
  users: ReturnType<typeof useUserList>;
  sound: { isEnabled: boolean; toggle: () => void };
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

  return {
    nickname,
    nicknameError,
    clearNicknameError: () => setNicknameError(null),
    setNickname,
    messages,
    sendMessage,
    users,
    sound,
  };
};
