import { useEffect, useRef } from 'react';
import type { NowPlaying } from '@/features/stream/use-now-playing';

/** Points along the splat's outline: enough for a smooth, organic edge. */
const POINTS = 220;
const TAU = Math.PI * 2;

/**
 * The record is the logo's own splat: this is the outline path from
 * `public/brand/splat-outside.svg` (viewBox 173.052 × 156.967), and the
 * colours below are the export's — ink fill, cream border.
 */
const SPLAT_D =
  'M23.0068 51.0012C26.9787 41.3408 23.5663 9.3161 44.5603 2.78105C65.5544 -3.75394 73.7737 17.9223 85.981 18.1243C98.1883 18.3262 114.351 2.49692 124.565 6.19074C134.778 9.88464 127.402 25.2274 131.949 28.2707C136.496 31.3141 165.418 27.5004 169.957 48.2424C174.496 68.9835 153.502 68.6997 147.828 79.4967C142.154 90.2936 154.637 111.603 142.154 120.127C129.671 128.651 117.479 127.716 105.84 133.481C94.2003 139.246 82.8599 158.485 61.2986 153.939C39.7374 149.393 44.2844 123.455 37.184 117.57C30.0836 111.685 4.84184 115.013 1.72108 90.2936C-1.39961 65.5739 19.0349 60.6616 23.0068 51.0012Z';

/** The splat's frame in the SVG's own units: the label's centre and the radii. */
const SPLAT = { width: 173.052, cx: 82.9, cy: 75.93, labelR: 34.95, holeR: 7.7 };

type Sample = { ux: number; uy: number; dist: number; theta: number };

/**
 * Walk the real outline once and keep each point as a direction and distance
 * from the label's centre, so the wobble can breathe the shape radially. A
 * plain circle stands in where SVG geometry isn't implemented (jsdom).
 */
const sampleSplat = (): Sample[] => {
  try {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', SPLAT_D);
    svg.appendChild(path);
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.position = 'absolute';
    document.body.appendChild(svg);
    try {
      const total = path.getTotalLength();
      const samples: Sample[] = [];
      for (let i = 0; i < POINTS; i++) {
        const p = path.getPointAtLength((i / POINTS) * total);
        const dx = p.x - SPLAT.cx;
        const dy = p.y - SPLAT.cy;
        const dist = Math.hypot(dx, dy) || 1;
        samples.push({
          ux: dx / dist,
          uy: dy / dist,
          dist,
          theta: Math.atan2(dy, dx),
        });
      }
      return samples;
    } finally {
      document.body.removeChild(svg);
    }
  } catch {
    return Array.from({ length: POINTS }, (_, i) => {
      const a = (i / POINTS) * TAU;
      return {
        ux: Math.cos(a),
        uy: Math.sin(a),
        dist: SPLAT.width * 0.47,
        theta: a,
      };
    });
  }
};

type VinylBoxProps = {
  playing: boolean;
  quiet: boolean;
  song: NowPlaying | null;
  getLevels: () => Uint8Array | null;
  onToggle: () => void;
};

/**
 * The centerpiece: the album sleeve of the song on air with the record half
 * slid out of it. The record is the logo's splat, outline and colours taken
 * from the export, alive — its edge rides slow waves, barely while the air
 * idles, harder with the actual sound while playing (a time-driven swell of
 * the same shape where the analyser can't hear the stream).
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
    const samples = sampleSplat();
    const meanDist =
      samples.reduce((sum, s) => sum + s.dist, 0) / samples.length;
    let frame = 0;
    let amp = 0.14;
    let morphPhase = 0;
    let t = 0;
    const geo = { w: 0, h: 0, cx: 0, cy: 0, r: 0 };

    const resize = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The sleeve is square; the splat's exposed half trails right of it,
      // with a sliver of width held back from the screen's edge.
      const side = Math.min(h * 0.92, (w - 24) / 1.62);
      const groupWidth = side * 1.58;
      const sleeveX = (w - groupWidth) / 2;
      const sleeveY = (h - side) / 2;
      sleeve.style.left = `${sleeveX}px`;
      sleeve.style.top = `${sleeveY}px`;
      sleeve.style.width = `${side}px`;
      sleeve.style.height = `${side}px`;
      geo.w = w;
      geo.h = h;
      // The label's centre just clears the sleeve, so the spindle hole shows.
      geo.cx = sleeveX + side * 1.04;
      geo.cy = sleeveY + side * 0.5;
      geo.r = side * 0.44;
      if (reduced) draw();
    };

    const draw = () => {
      if (!ctx) return;
      const { w, h, cx, cy, r } = geo;
      ctx.clearRect(0, 0, w, h);

      // The air leans on the waves: the mean level deepens every lobe.
      const levels = playingRef.current ? getLevels() : null;
      let push = 0;
      if (levels) {
        const n = Math.floor(levels.length * 0.5);
        let sum = 0;
        for (let i = 2; i < n; i++) sum += levels[i];
        push = sum / ((n - 2) * 255);
      }
      const depth = 0.35 + amp * (0.5 + push * 1.8);
      const scale = (r * 2) / SPLAT.width;

      // The splat, mirrored so its left side shows past the sleeve. It
      // breathes between the logo's outline and a rounder shape and back,
      // with a soft travelling wave on the edge.
      const round = ((1 - Math.cos(morphPhase)) / 2) * 0.65;
      const splat = new Path2D();
      for (let i = 0; i <= POINTS; i++) {
        const s = samples[i % POINTS];
        const wave =
          0.022 * Math.sin(3 * s.theta - t * 1.4) +
          0.016 * Math.sin(5 * s.theta - t * 2.1);
        const base = s.dist + (meanDist - s.dist) * round;
        const d = base * scale * (1 + wave * depth);
        if (i === 0) splat.moveTo(cx - s.ux * d, cy + s.uy * d);
        else splat.lineTo(cx - s.ux * d, cy + s.uy * d);
      }
      splat.closePath();

      ctx.fillStyle = '#1f1b12';
      ctx.fill(splat);

      // The logo's warm light inside the edge: the SVG's two inner shadows.
      // The world outside the splat is drawn far off-canvas, so only its
      // blurred shadow falls into the clipped shape — a band along the rim.
      ctx.save();
      ctx.clip(splat);
      const off = w * 2;
      const inverse = new Path2D();
      inverse.rect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);
      inverse.addPath(splat);
      ctx.translate(-off, 0);
      ctx.shadowOffsetX = off;
      ctx.shadowBlur = 8 * scale;
      ctx.fillStyle = '#000000';
      ctx.shadowColor = '#fbeed4';
      ctx.shadowOffsetY = 8 * scale;
      ctx.fill(inverse, 'evenodd');
      ctx.shadowColor = '#e8d7b4';
      ctx.shadowOffsetY = -8 * scale;
      ctx.fill(inverse, 'evenodd');
      ctx.restore();

      ctx.shadowColor = 'rgba(231, 210, 174, 0.4)';
      ctx.shadowBlur = r * 0.07;
      ctx.strokeStyle = '#e7d2ae';
      ctx.lineWidth = Math.max(1.5, scale * 3.2);
      ctx.stroke(splat);
      ctx.shadowBlur = 0;

      // The label, as its SVG draws it: a wide white halo and a tight red
      // aura outside, a yellow gradient rising to the rim inside, a thin
      // orange outline, and the spindle hole.
      const lr = SPLAT.labelR * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, lr, 0, TAU);
      ctx.shadowColor = 'rgba(255, 255, 255, 0.22)';
      ctx.shadowBlur = lr * 1.5;
      ctx.fillStyle = '#ff5647';
      ctx.fill();
      ctx.shadowColor = 'rgba(255, 45, 40, 0.6)';
      ctx.shadowBlur = lr * 0.75;
      ctx.fill();
      ctx.shadowBlur = 0;
      const labelFill = ctx.createRadialGradient(cx, cy, lr * 0.3, cx, cy, lr);
      labelFill.addColorStop(0, '#ff5647');
      labelFill.addColorStop(0.6, '#ff5647');
      labelFill.addColorStop(0.85, '#ff7a42');
      labelFill.addColorStop(1, '#ffbd3a');
      ctx.fillStyle = labelFill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 155, 62, 0.95)';
      ctx.lineWidth = Math.max(1.2, 2 * scale);
      ctx.stroke();
      ctx.fillStyle = '#1f1b12';
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(2.5, SPLAT.holeR * scale), 0, TAU);
      ctx.fill();
    };

    const tick = () => {
      t += playingRef.current ? 0.042 : 0.018;
      // The breath between splat and round: quicker while the air plays.
      morphPhase += playingRef.current ? 0.028 : 0.012;
      amp += ((playingRef.current ? 1 : 0.14) - amp) * 0.06;
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
        aria-label={playing ? 'Pause' : 'Listen live'}
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
              <span className="mt-1 block font-serif text-[clamp(10px,1.1vw,14px)] text-cream/55">
                vinyl radio · 33⅓
              </span>
            </span>
          </span>
        )}
      </button>
    </div>
  );
};
