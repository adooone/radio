import clsx from 'clsx';
import { useChat } from '@/features/radio/hooks/use-chat';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { NicknameInput } from './nickname-input';
import type { ChatProps } from './types';
import { SoundControl } from '../settings/sound-control';
import { getSocket } from '@/services/socket';
import { useUserList } from '../../hooks/use-user-list';
import { useState } from 'react';

export const Chat = ({ nickname, setNickname }: ChatProps) => {
  const { messages, sendMessage } = useChat(nickname || null);
  const users = useUserList();
  const [nicknameError, setNicknameError] = useState<string | null>(null);

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

    const isNicknameTaken = users.some(
      (user) => user.nickname.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (isNicknameTaken) {
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
      // Пофіг
    }
  };

  return (
    <div className={clsx(styles.container)}>
      <div className={clsx(styles.chatHeader)}>
        <SoundControl />
        <h2 className={clsx(styles.title)}>Чатік</h2>
      </div>

      <ChatMessages messages={messages} nickname={nickname} users={users} />
      {nickname ? (
        <ChatInput onSend={sendMessage} />
      ) : (
        <NicknameInput
          initialNickname={''}
          onSetNickname={handleSetNickname}
          onNicknameChange={() => setNicknameError(null)}
          error={nicknameError}
        />
      )}
    </div>
  );
};

const styles = {
  container: ['flex flex-col w-full h-full'],
  chatHeader: [
    'flex p-2 font-display uppercase w-full items-center justify-between',
    'border-b border-moss/40',
  ],
  title: ['text-lg md:text-xl font-bold text-white/80'],
} as const;
