import { useMedia } from '@/lib/use-media';
import { LampIconButton } from '@dendelion/func-ui';
import type { ReactNode } from 'react';
import { ChatBackdrop } from './chat-backdrop';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { CollapseIcon, SoundOffIcon, SoundOnIcon } from './icons';
import { NicknameInput } from './nickname-input';
import type { ChatRoom } from './use-chat-room';

type ChatProps = {
  /** The room's state, held above (`useChatRoom`) and shared with the island. */
  room: ChatRoom;
  /** Small screens show the chat as its own view, crossfaded over the radio. */
  mobileOpen: boolean;
  onClose: () => void;
  /** What rides above the rim while the view is open on a small screen:
      the track strip, so the music stays in hand inside the room. */
  controls?: ReactNode;
};

/**
 * The old player's chat, structurally intact: the chatroom header with the
 * sound toggle, the bubbles, and the nickname gate with its validation —
 * speaking to wave's WebSocket as before. On small screens the input is
 * not here but on the island, in the controls' place.
 */
export const Chat = ({ room, mobileOpen, onClose, controls }: ChatProps) => {
  // The header's lamps grow with the island's, for thumbs.
  const portrait = useMedia('(orientation: portrait)');
  const lampSize = portrait ? 'md' : 'sm';
  const { nickname, messages, users, sound } = room;

  return (
    <section
      className={`chat-view relative flex min-h-0 flex-col ${
        mobileOpen ? 'chat-view-open' : ''
      }`}
    >
      {/* The room's ground, one canvas shape: a darker slab rimmed like the
          record toward the radio. */}
      <ChatBackdrop />
      {portrait && controls && (
        <div className="chat-topbar flex">{controls}</div>
      )}
      <div className="chat-panel relative z-10 flex min-h-0 flex-1 flex-col">
        <header className="flex w-full items-center justify-between pb-3">
          <span className="flex items-center gap-3">
            <LampIconButton
              tone="dark"
              size={lampSize}
              onClick={onClose}
              label="Back to the radio"
              icon={<CollapseIcon />}
              className="hidden text-cream portrait:inline-block"
            />
            <LampIconButton
              tone={sound.isEnabled ? 'red' : 'dark'}
              size={lampSize}
              onClick={sound.toggle}
              label={
                sound.isEnabled ? 'Mute chat sounds' : 'Unmute chat sounds'
              }
              icon={sound.isEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
              className={sound.isEnabled ? 'text-ink' : 'text-cream'}
            />
          </span>
          <h2 className="font-serif text-xl font-semibold tracking-wide text-cream/90">
            Chat
          </h2>
        </header>

        <ChatMessages messages={messages} nickname={nickname} users={users} />

        {!portrait &&
          (nickname ? (
            <ChatInput onSend={room.sendMessage} />
          ) : (
            <NicknameInput
              onSetNickname={room.setNickname}
              onNicknameChange={room.clearNicknameError}
              error={room.nicknameError}
            />
          ))}
      </div>
    </section>
  );
};
