import { useEffect, useRef, useState } from 'react';
import { mulberry32 } from '@/lib/rng';

/**
 * A tile of film grain: grey noise, drawn once into a small canvas and
 * kept as a data URL for the grain layer's background. Empty where there
 * is no canvas (tests, servers).
 */
const grainTile = (size = 192): string => {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const image = ctx.createImageData(size, size);
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    // Mostly mid grey, with a scatter of lighter and darker specks: soft
    // light leaves the middle alone and only the specks show.
    const v = 118 + (Math.random() - 0.5) * 150 + (Math.random() - 0.5) * 60;
    px[i] = px[i + 1] = px[i + 2] = v;
    px[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return `url(${canvas.toDataURL('image/png')})`;
};

/**
 * The wear on the lens: fine scratches at all angles and specks of dust,
 * different wear on every visit, drawn once on a small canvas over
 * everything in grey through `difference`, so a mark is light on the dark
 * room and dark on the bright label. Redrawn only when the window resizes.
 */
const Scratches = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const draw = () => {
      const W = Math.ceil(window.innerWidth / 2);
      const H = Math.ceil(window.innerHeight / 2);
      canvas.width = W;
      canvas.height = H;
      const rng = mulberry32(Math.floor(Math.random() * 1e9));
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      // Long faint scratches, a few sharper short ones.
      for (let i = 0; i < 26; i++) {
        const long = rng() < 0.6;
        const len =
          (long ? 0.25 + 0.55 * rng() : 0.05 + 0.12 * rng()) * Math.max(W, H);
        const a = rng() * Math.PI;
        const x = rng() * W;
        const y = rng() * H;
        const bend = (rng() - 0.5) * 0.25 * len;
        ctx.strokeStyle = `rgb(255 255 255 / ${long ? 0.22 + 0.2 * rng() : 0.45 + 0.3 * rng()})`;
        ctx.lineWidth = long ? 0.5 + 0.5 * rng() : 0.6 + 0.3 * rng();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + (Math.cos(a) * len) / 2 - Math.sin(a) * bend,
          y + (Math.sin(a) * len) / 2 + Math.cos(a) * bend,
          x + Math.cos(a) * len,
          y + Math.sin(a) * len,
        );
        ctx.stroke();
      }
      // Dust: specks and the odd hair.
      for (let i = 0; i < 70; i++) {
        const x = rng() * W;
        const y = rng() * H;
        const r = 0.4 + rng() * 1.3;
        ctx.fillStyle = `rgb(255 255 255 / ${0.3 + 0.5 * rng()})`;
        ctx.beginPath();
        ctx.ellipse(
          x,
          y,
          r,
          r * (0.4 + 0.6 * rng()),
          rng() * Math.PI,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);
  return <canvas ref={ref} className="film-scratches" />;
};

/** The viewfinder's marks: thin brackets in the corners and a faint meter ring in the middle. */
const Frame = () => (
  <svg
    className="film-frame"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path
      d="M2.2 7 V2.2 H6.5 M93.5 2.2 H97.8 V7 M97.8 93 V97.8 H93.5 M6.5 97.8 H2.2 V93"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="square"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

/**
 * Old film over everything, after fo.band's camera eye: a vignette
 * darkening the corners like a lens, grain that jitters a few times a
 * second, a warm cast, light leaks that pass through a corner now and
 * then, the gate of a viewfinder with its soft edge, corner marks and the
 * meter's circle, and the wear of its glass, drawn once. All but the wear
 * are CSS layers composited by the GPU; the strengths are the `--film-*`
 * variables, and the frame's weave lives on `.stage` in the stylesheet.
 */
export const FilmOverlay = () => {
  const [grain] = useState(grainTile);
  return (
    <div aria-hidden="true" className="film">
      <div className="film-warm" />
      <div className="film-leak film-leak-a" />
      <div className="film-leak film-leak-b" />
      <div className="film-grain" style={{ backgroundImage: grain }} />
      <Scratches />
      <div className="film-vignette" />
      <div className="film-gate" />
      <Frame />
      <div className="film-meter" />
    </div>
  );
};
