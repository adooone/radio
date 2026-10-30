import { statusLine } from '@/features/stream/radio-state';
import { useRadio } from '@/features/stream/use-radio';
import { SignText, SplatMark } from './sign';

/**
 * The listening room: the Figma hero as the resting poster — the turntable
 * photograph under a warm shade, the neon sign over it — and the live
 * picture once the air plays. The splat record is the play control.
 */
export const PlayerPage = () => {
  const { videoRef, status, playing, toggle, volume, setVolume } = useRadio();
  const watching = playing;
  const quiet = status === 'offline';

  return (
    <main className="stage relative h-dvh overflow-hidden bg-ink text-cream">
      {/* The room: the photograph, a warm shade, a film of dust. */}
      <img
        alt=""
        src="/brand/background.jpg"
        className="absolute inset-0 size-full -scale-x-100 object-cover"
      />
      <div className="room-shade absolute inset-0" />
      <img
        alt=""
        src="/brand/dust.jpg"
        className="absolute inset-0 size-full object-cover opacity-10"
      />

      {/* The projection: the live picture, shown while the air plays. */}
      {/* biome-ignore lint/a11y/useMediaCaption: a live radio stream carries no captions */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: clicking the picture is a mouse convenience; the pause button below is the keyboard path */}
      <video
        ref={videoRef}
        playsInline
        onClick={toggle}
        className={`absolute inset-0 size-full bg-ink object-cover transition-opacity duration-700 ${
          watching ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* The sign: lit while the air can play, unlit while it is quiet. */}
      <div
        className={`absolute inset-0 z-10 flex flex-col items-center justify-center transition-opacity duration-700 ${
          watching ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div
          className={`hero-cluster relative transition-[filter,opacity] duration-700 ${
            quiet ? 'sign-off' : ''
          }`}
        >
          <button
            type="button"
            onClick={toggle}
            disabled={quiet}
            aria-label={playing ? 'Пауза' : 'Слухати ефір'}
            className="hero-splat cursor-pointer disabled:cursor-default"
          >
            <SplatMark spinning={playing} />
          </button>
          <SignText className="hero-sign pointer-events-none" />
        </div>
        <p
          className="mt-[6vmin] px-6 text-center font-serif text-cream/75"
          style={{ fontSize: 'clamp(15px, calc(22 * var(--k)), 24px)' }}
        >
          {statusLine(status, playing)}
        </p>
      </div>

      {/* The station bug, while the picture plays. */}
      <header
        className={`absolute left-4 top-4 z-10 transition-opacity duration-700 ${
          watching ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <img
          alt="Puget Sound"
          src="/brand/puget-sound.svg"
          className="h-9 w-auto"
        />
      </header>

      {/* The controls, over the picture's lower edge. */}
      <footer
        className={`absolute inset-x-0 bottom-0 z-10 transition-opacity duration-700 ${
          watching ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <div className="scrim pointer-events-none absolute inset-0" />
        <div
          className="relative mx-auto flex max-w-xl items-center justify-center gap-6 px-6 pt-12"
          style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label="Пауза"
            className="w-11 shrink-0 cursor-pointer"
          >
            <SplatMark spinning={playing} />
          </button>
          <span className="flex items-center gap-2 whitespace-nowrap text-sm text-cream/85">
            <span
              className="live-dot inline-block h-2 w-2 rounded-full bg-accent"
              aria-hidden="true"
            />
            в ефірі
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Гучність"
            className="volume w-32"
          />
        </div>
      </footer>
    </main>
  );
};
