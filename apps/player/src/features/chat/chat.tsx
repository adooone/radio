import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { SoundOffIcon, SoundOnIcon } from './icons';
import { NicknameInput } from './nickname-input';
import { useChat } from './use-chat';
import { useSound } from './use-sound';
import { useUserList } from './use-user-list';

/**
 * The old player's chat, structurally intact: the «Чатік» header with the
 * sound toggle, the bubbles, and the nickname gate with its validation —
 * speaking to wave's WebSocket as before.
 */
export const Chat = () => {
  const [nickname, setNickname] = useState(
    () => localStorage.getItem('nickname') ?? '',
  );
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const { messages, sendMessage } = useChat(nickname || null);
  const users = useUserList();
  const { isEnabled, toggle } = useSound();

  const handleSetNickname = (name: string) => {
    const trimmedName = name.trim();
    setNicknameError(null);

    if (trimmedName.length < 2) {
      setNicknameError("Ім'я має бути не менше 2 символів");
      return;
    }
    if (trimmedName.length > 20) {
      setNicknameError("Ім'я має бути не більше 20 символів");
      return;
    }
    if (
      trimmedName.toLowerCase() === 'анонім' ||
      trimmedName.toLowerCase() === 'анon'
    ) {
      setNicknameError("Це ім'я зарезервоване, спробуй інше");
      return;
    }
    if (
      users.some(
        (user) => user.nickname.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      setNicknameError("Це ім'я вже зайняте, спробуй інше");
      return;
    }

    setNickname(trimmedName);
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

  return (
    <section className="flex min-h-0 flex-col">
      <header className="flex w-full items-center justify-between pb-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={isEnabled ? 'Вимкнути звуки' : 'Увімкнути звуки'}
          className="cursor-pointer text-cream/60"
        >
          {isEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
        <h2 className="font-sans text-base font-medium uppercase tracking-wide text-cream/80">
          Чатік
        </h2>
      </header>

      <ChatMessages messages={messages} nickname={nickname} users={users} />

      {nickname ? (
        <ChatInput onSend={sendMessage} />
      ) : (
        <NicknameInput
          onSetNickname={handleSetNickname}
          onNicknameChange={() => setNicknameError(null)}
          error={nicknameError}
        />
      )}
    </section>
  );
};
