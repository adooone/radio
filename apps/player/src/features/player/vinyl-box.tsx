import { useEffect, useRef } from 'react';
import type { NowPlaying } from '@/features/stream/use-now-playing';

/** Bars across the disc's exposed arc. */
const BAR_COUNT = 46;
/** The exposed arc: the right side of the disc, past the sleeve's mouth. */
const ARC = Math.PI * 0.84;
const TAU = Math.PI * 2;

type VinylBoxProps = {
  playing: boolean;
  quiet: boolean;
  song: NowPlaying | null;
  getLevels: () => Uint8Array | null;
  onToggle: () => void;
};

/**
 * The centerpiece: the album sleeve of the song on air with the red disc
 * half slid out of it. The disc spins while playing; bars breathe from its
 * exposed edge — on the real sound where the analyser hears it, on a
 * time-driven swell of the same shape where it doesn't.
 */
export const VinylBox = ({
  playing,
  quiet,
  song,
  getLevels,
  onToggle,
}: VinylBoxProps) => {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sleeveRef = useRef<HTMLButtonElement | null>(null);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  useEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    const sleeve = sleeveRef.current;
    if (!box || !canvas || !sleeve) return;
    const ctx = canvas.getContext('2d');

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let frame = 0;
    let angle = 0;
    let amp = 0.14;
    let t = 0;
    const geo = { w: 0, h: 0, cx: 0, cy: 0, r: 0, maxBar: 0 };

    const resize = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The sleeve is square; the disc's exposed half and its halo trail right.
      const side = Math.min(h * 0.92, w / 1.62);
      const groupWidth = side * 1.58;
      const sleeveX = (w - groupWidth) / 2;
      const sleeveY = (h - side) / 2;
      sleeve.style.left = `${sleeveX}px`;
      sleeve.style.top = `${sleeveY}px`;
      sleeve.style.width = `${side}px`;
      sleeve.style.height = `${side}px`;
      geo.w = w;
      geo.h = h;
      geo.cx = sleeveX + side * 0.96;
      geo.cy = sleeveY + side * 0.5;
      geo.r = side * 0.44;
      geo.maxBar = side * 0.16;
      if (reduced) draw();
    };

    const draw = () => {
      if (!ctx) return;
      const { w, h, cx, cy, r, maxBar } = geo;
      ctx.clearRect(0, 0, w, h);

      const levels = playingRef.current ? getLevels() : null;
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < BAR_COUNT; i++) {
        const a = -ARC / 2 + (i / (BAR_COUNT - 1)) * ARC;
        let v: number;
        if (levels) {
          // Spread the bars over the lower ~two thirds of the spectrum.
          const bin = 2 + Math.floor((i / (BAR_COUNT - 1)) * (levels.length * 0.6));
          v = (levels[bin] ?? 0) / 255;
        } else {
          v =
            (0.5 + 0.5 * Math.sin(i * 0.5 + t * 2.3)) *
              (0.5 + 0.5 * Math.sin(i * 0.17 - t * 1.6)) +
            0.18 * Math.sin(i * 1.7 + t * 4.1);
        }
        const len = (maxBar * 0.12 + maxBar * Math.max(0, v)) * amp + 3;
        const x1 = cx + Math.cos(a) * (r + 6);
        const y1 = cy + Math.sin(a) * (r + 6);
        ctx.strokeStyle = 'rgba(255, 86, 71, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(cx + Math.cos(a) * (r + 6 + len), cy + Math.sin(a) * (r + 6 + len));
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 190, 80, 0.16)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
          cx + Math.cos(a) * (r + 6 + len * 0.5),
          cy + Math.sin(a) * (r + 6 + len * 0.5),
        );
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.fillStyle = '#160807';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 86, 71, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, TAU);
      ctx.stroke();
      for (let g = 1; g <= 6; g++) {
        ctx.strokeStyle = `rgba(255, 86, 71, ${0.07 + 0.03 * (g % 2)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, r - r * 0.07 - g * r * 0.065, 0, TAU);
        ctx.stroke();
      }
      // A worn sheen across the grooves, so the turning reads.
      ctx.strokeStyle = 'rgba(255, 190, 80, 0.22)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(r * 0.42, 0);
      ctx.lineTo(r * 0.9, 0);
      ctx.stroke();
      ctx.shadowColor = 'rgba(255, 170, 60, 0.9)';
      ctx.shadowBlur = r * 0.2;
      ctx.fillStyle = '#ff5647';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.33, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0a0605';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(2.5, r * 0.03), 0, TAU);
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      t += 0.016;
      amp += ((playingRef.current ? 1 : 0.14) - amp) * 0.06;
      angle += playingRef.current ? 0.03 : 0.002;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(box);
    resize();
    if (!reduced) frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [getLevels]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: clicking anywhere on the box is a mouse convenience; the sleeve button inside is the keyboard path
    <div
      ref={boxRef}
      onClick={quiet ? undefined : onToggle}
      className={`relative size-full ${quiet ? '' : 'cursor-pointer'}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <button
        ref={sleeveRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!quiet) onToggle();
        }}
        disabled={quiet}
        aria-label={playing ? 'Пауза' : 'Слухати ефір'}
        className="vinyl-sleeve absolute cursor-pointer overflow-hidden bg-[#17100c] text-left transition-[filter] duration-700 disabled:cursor-default disabled:brightness-[0.65] disabled:saturate-50"
      >
        {song?.cover ? (
          <img
            src={song.cover}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col justify-between p-[9%]">
            <span className="font-sans text-[clamp(9px,1vw,13px)] tracking-[0.3em] text-cream/90">
              PUGET SOUND
            </span>
            <span>
              {song && (
                <span className="block font-serif text-[clamp(13px,1.5vw,19px)] text-cream">
                  {song.title}
                </span>
              )}
              <span className="neon-soft mt-1 block font-serif text-[clamp(10px,1.1vw,14px)] italic">
                вінілове радіо · 33⅓
              </span>
            </span>
          </span>
        )}
        {/* The mouth of the sleeve: a hint of the ring inside. */}
        <span
          aria-hidden="true"
          className="absolute top-[28%] right-[-18%] block aspect-square w-[46%] rounded-full border border-accent/30"
        />
      </button>
    </div>
  );
};
