import { LampIconButton } from '@dendelion/func-ui';
import { useState } from 'react';
import { getSocket } from '@/lib/socket';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { SoundOffIcon, SoundOnIcon } from './icons';
import { NicknameInput } from './nickname-input';
import { useChat } from './use-chat';
import { ChatBackdrop } from './chat-backdrop';
import { useSound } from './use-sound';
import { useUserList } from './use-user-list';

/**
 * The old player's chat, structurally intact: the chatroom header with the
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
    <section className="relative flex min-h-0 flex-col">
      {/* The room's ground, one canvas shape: a darker slab rimmed like the
          record toward the radio. */}
      <ChatBackdrop />
      <div className="chat-panel relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="flex w-full items-center justify-between pb-3">
          <LampIconButton
            tone={isEnabled ? 'red' : 'dark'}
            size="sm"
            onClick={toggle}
            label={isEnabled ? 'Mute chat sounds' : 'Unmute chat sounds'}
            icon={isEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
            className={isEnabled ? 'text-ink' : 'text-cream'}
          />
          <h2 className="font-serif text-xl font-semibold tracking-wide text-cream/90">
            Chat
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
      </div>
    </section>
  );
};
