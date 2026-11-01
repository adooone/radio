import { useMedia } from '@/lib/use-media';
import type { ReactNode } from 'react';
import { ChatBackdrop } from './chat-backdrop';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { ListenersPage } from './listeners-page';
import { NicknameInput } from './nickname-input';
import { SettingsPage } from './settings-page';
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
  const { nickname, colorChoice, messages, users, sound, page, togglePage } =
    room;
  const othersCount = users.filter((user) => user.nickname !== nickname).length;

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
        <ChatHeader
          lampSize={lampSize}
          sound={sound}
          nickname={nickname}
          colorChoice={colorChoice}
          page={page}
          othersCount={othersCount}
          onTogglePage={togglePage}
          onBack={onClose}
        />

        <div className="relative min-h-0 flex-1">
          <div
            className={`chat-page ${page === 'room' ? 'chat-page-active' : ''}`}
          >
            <ChatMessages
              messages={messages}
              nickname={nickname}
              users={users}
            />

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

          <div
            className={`chat-page ${
              page === 'listeners' ? 'chat-page-active' : ''
            }`}
          >
            <ListenersPage users={users} nickname={nickname} />
          </div>

          <div
            className={`chat-page ${
              page === 'settings' ? 'chat-page-active' : ''
            }`}
          >
            <SettingsPage room={room} />
          </div>
        </div>
      </div>
    </section>
  );
};
