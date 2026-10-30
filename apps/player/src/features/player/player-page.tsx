import { Chat } from '@/features/chat/chat';
import { statusLine } from '@/features/stream/radio-state';
import { useNowPlaying } from '@/features/stream/use-now-playing';
import { useRadio } from '@/features/stream/use-radio';
import { Controls } from './controls';
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
        <Wordmark />
        <div className="min-h-0 w-full flex-1 py-[1.5vmin]">
          <VinylBox
            playing={playing}
            quiet={quiet}
            song={song}
            getLevels={getLevels}
            onToggle={toggle}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-3 px-6">
          {song && (
            <p className="text-center text-[clamp(13px,1.5vw,17px)] text-cream/90">
              {song.artist ? `${song.artist} — ${song.title}` : song.title}
            </p>
          )}
          <p className="neon-soft text-center font-serif text-[clamp(13px,1.6vw,18px)] italic">
            {statusLine(status, playing)}
          </p>
          <Controls
            playing={playing}
            quiet={quiet}
            onToggle={toggle}
            volume={volume}
            onVolume={setVolume}
          />
        </div>
      </section>

      <Chat />
    </main>
  );
};
