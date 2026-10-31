import { Chat } from '@/features/chat/chat';
import { useChatRoom } from '@/features/chat/use-chat-room';
import { statusLine } from '@/features/stream/radio-state';
import { useNowPlaying } from '@/features/stream/use-now-playing';
import { useRadio } from '@/features/stream/use-radio';
import { useState } from 'react';
import { ControlIsland } from './control-island';
import { TrackStrip } from './track-strip';
import { VinylBox } from './vinyl-box';
import { Wordmark } from './wordmark';

/**
 * The listening room, planned together on IDEA-11: one black screen split
 * 2 : 1 with no dividers — the radio on the left (sign, vinyl box, controls),
 * the chat on the right; portrait stacks them. Audio only: the stream feeds
 * a hidden audio element and the canvas is the whole picture.
 */
export const PlayerPage = () => {
  const { audioRef, status, playing, toggle, volume, setVolume, getLevels } =
    useRadio();
  const song = useNowPlaying();
  const quiet = status === 'offline';
  // Small screens keep the chat as its own view behind the island's lamp.
  // While it is open there, the island carries the room's input and the
  // track strip rides the top of the screen; the room's state lives here,
  // shared by both.
  const [chatOpen, setChatOpen] = useState(false);
  const room = useChatRoom();

  return (
    <main className="stage split h-dvh overflow-hidden bg-ink text-cream">
      {/* biome-ignore lint/a11y/useMediaCaption: a live radio stream carries no captions */}
      <audio ref={audioRef} className="hidden" />

      <section
        className={`radio-view relative flex min-h-0 flex-col items-center justify-between py-[3.5vmin] ${
          chatOpen ? 'radio-view-away' : ''
        }`}
      >
        {/* The room behind the radio: the old frontend's waiting-room
            photograph under the warm shade, below everything on this side.
            Both bleed past the chat's boundary, under its slab, so the rim's
            swing never uncovers the bare page between them. */}
        <img
          alt=""
          src="/brand/room.jpg"
          className="absolute top-0 left-0 max-w-none object-cover"
          style={{
            objectPosition: '62% 50%',
            width: 'calc(100% + 32px)',
            height: 'calc(100% + 32px)',
          }}
        />
        <div
          aria-hidden="true"
          className="room-shade absolute top-0 left-0"
          style={{ width: 'calc(100% + 32px)', height: 'calc(100% + 32px)' }}
        />
        <header className="sign-corner pointer-events-none select-none">
          <Wordmark className="sign-lockup" />
        </header>
        {/* Portrait lets the vinyl run the full screen width, past the gutters. */}
        <div className="relative min-h-0 w-full flex-1 py-[1.5vmin] portrait:w-[calc(100%+var(--gutter)*2)]">
          <VinylBox
            playing={playing}
            quiet={quiet}
            song={song}
            getLevels={getLevels}
            onToggle={toggle}
          />
        </div>
      </section>

      <Chat
        room={room}
        mobileOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        controls={
          <TrackStrip
            playing={playing}
            quiet={quiet}
            onToggle={toggle}
            song={song}
            status={statusLine(status, playing)}
            lampSize="md"
          />
        }
      />

      {/* The island docks over the radio column's foot — and, on portrait,
          stays put above both views, the same pill: music controls, or the
          room's input while the chat is open. */}
      <div className="island-dock">
        <ControlIsland
          playing={playing}
          quiet={quiet}
          onToggle={toggle}
          volume={volume}
          onVolume={setVolume}
          song={song}
          status={statusLine(status, playing)}
          chatOpen={chatOpen}
          onToggleChat={() => setChatOpen((open) => !open)}
          room={room}
        />
      </div>
    </main>
  );
};
