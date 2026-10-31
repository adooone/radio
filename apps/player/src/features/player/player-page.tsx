import { Chat } from '@/features/chat/chat';
import { statusLine } from '@/features/stream/radio-state';
import { useNowPlaying } from '@/features/stream/use-now-playing';
import { useRadio } from '@/features/stream/use-radio';
import { ControlIsland } from './control-island';
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

  return (
    <main className="stage split h-dvh overflow-hidden bg-ink text-cream">
      {/* biome-ignore lint/a11y/useMediaCaption: a live radio stream carries no captions */}
      <audio ref={audioRef} className="hidden" />

      <section className="relative flex min-h-0 flex-col items-center justify-between py-[3.5vmin]">
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
          <Wordmark spinning={playing} className="sign-lockup" />
        </header>
        <div className="relative min-h-0 w-full flex-1 py-[1.5vmin]">
          <VinylBox
            playing={playing}
            quiet={quiet}
            song={song}
            getLevels={getLevels}
            onToggle={toggle}
          />
        </div>
        <div className="relative flex w-full justify-center px-6">
          <ControlIsland
            playing={playing}
            quiet={quiet}
            onToggle={toggle}
            volume={volume}
            onVolume={setVolume}
            song={song}
            status={statusLine(status, playing)}
          />
        </div>
      </section>

      <Chat />
    </main>
  );
};
