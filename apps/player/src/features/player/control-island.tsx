import { ChatInput } from '@/features/chat/chat-input';
import { ChatLamps } from '@/features/chat/chat-lamps';
import { ChatBubbleIcon, CollapseIcon } from '@/features/chat/icons';
import { NicknameInput } from '@/features/chat/nickname-input';
import type { ChatRoom } from '@/features/chat/use-chat-room';
import type { NowPlaying } from '@/features/stream/use-now-playing';
import { useT } from '@/i18n';
import { useMedia } from '@/lib/use-media';
import { LampIconButton, LampMeter } from '@dendelion/func-ui';
import { TrackStrip } from './track-strip';

type ControlIslandProps = {
  playing: boolean;
  quiet: boolean;
  onToggle: () => void;
  volume: number;
  onVolume: (volume: number) => void;
  song: NowPlaying | null;
  /** The air's state in words, read where no track names itself. */
  status: string;
  /** Small screens keep the chat behind the island's last lamp, which
      opens the room; while the room is open the island carries the room's
      input instead of the music controls, led by the lamp back to the
      radio. */
  chatOpen: boolean;
  onToggleChat: () => void;
  room: ChatRoom;
};

/**
 * The listening controls on an island, like the admin's navigation island —
 * the same pill — with func-ui's lamp controls glowing on it: the track
 * strip (play lamp and the words), the on-air dot and a lamp-meter volume
 * with an invisible range input over it for the hand and the keyboard. On
 * small portrait screens the pill turns compact — the strip and the chat
 * lamp that opens the room as its own view — doubling as the page's
 * navigation; and with the room open, the same pill holds the lamp back to
 * the radio, then the message (or name) field with its send (or join) lamp
 * at the right end, under the thumb.
 */
export const ControlIsland = ({
  playing,
  quiet,
  onToggle,
  volume,
  onVolume,
  song,
  status,
  chatOpen,
  onToggleChat,
  room,
}: ControlIslandProps) => {
  const t = useT();
  // Thumbs need bigger lamps than a pointer does.
  const portrait = useMedia('(orientation: portrait)');
  const lampSize = portrait ? 'md' : 'sm';
  const chatMode = portrait && chatOpen;
  return (
    <div className="control-island relative flex max-w-full items-center gap-4 rounded-full border border-cream/10 py-2 pr-6 pl-2 portrait:w-full portrait:py-3 portrait:pr-3 portrait:pl-3">
      {chatMode ? (
        <>
          <LampIconButton
            tone="dark"
            size={lampSize}
            onClick={onToggleChat}
            label={t('island.backToRadio')}
            icon={<CollapseIcon />}
            className="shrink-0 text-cream"
          />
          {room.nickname ? (
            <ChatInput island onSend={room.sendMessage} />
          ) : (
            <NicknameInput
              island
              onSetNickname={room.setNickname}
              onNicknameChange={room.clearNicknameError}
              error={room.nicknameError}
            />
          )}
        </>
      ) : (
        <>
          <TrackStrip
            playing={playing}
            quiet={quiet}
            onToggle={onToggle}
            song={song}
            status={status}
            lampSize={lampSize}
            wordsClassName="w-[340px] min-w-0 shrink portrait:w-auto portrait:flex-1"
          />
          <div className="relative hidden shrink-0 border-l border-cream/10 pl-4 sm:landscape:block">
            <LampMeter
              aria-hidden="true"
              value={volume}
              max={1}
              tone="red"
              size="sm"
              lampCount={8}
              className="block"
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolume(Number(e.target.value))}
              aria-label={t('island.volume')}
              className="absolute inset-y-0 left-4 right-0 cursor-pointer appearance-none opacity-0"
            />
          </div>
          {/* The room's lamps on wide screens — mute, then settings — at the
              island's end; phones stack them over the input instead. */}
          <div className="hidden shrink-0 border-l border-cream/10 pl-4 sm:landscape:block">
            <ChatLamps
              lampSize={lampSize}
              sound={room.sound}
              page={room.page}
              onTogglePage={room.togglePage}
              soundFirst
            />
          </div>
        </>
      )}
      {!chatMode && (
        <LampIconButton
          tone="red"
          size={lampSize}
          label={t('island.openChat')}
          icon={<ChatBubbleIcon />}
          onClick={onToggleChat}
          className="hidden shrink-0 text-ink portrait:inline-block"
        />
      )}
    </div>
  );
};
