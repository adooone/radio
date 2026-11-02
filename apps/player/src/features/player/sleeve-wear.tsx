import { mulberry32 } from '@/lib/rng';
import { useEffect, useRef } from 'react';

/** The canvas's own size; CSS stretches it over the sleeve. */
const SIZE = 640;

/** A steady number from a string (FNV-1a), so one album always wears alike. */
export const seedOf = (key: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/**
 * Years of handling on the sleeve: flecks where the board rubbed through
 * along the edges, thickest at the corners, a few fine scratches across the
 * face and soft patches rubbed by hands. Drawn once per album, in pale ink
 * through `difference`, so the wear shows light on a dark print and dark on
 * a pale one.
 */
export const SleeveWear = ({ wearKey }: { wearKey: string }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const W = SIZE;
    const rng = mulberry32(seedOf(wearKey));
    ctx.clearRect(0, 0, W, W);

    // Edge and corner scuffs: flecks hugging the border, deeper and bigger
    // near the corners.
    for (let i = 0; i < 900; i++) {
      const side = Math.floor(rng() * 4);
      const along = rng();
      const depth = rng() ** 3 * W * 0.035;
      const corner = Math.min(along, 1 - along) < 0.08 ? 2.2 : 1;
      const inset = depth * corner;
      const [x, y] =
        side === 0
          ? [along * W, inset]
          : side === 1
            ? [W - inset, along * W]
            : side === 2
              ? [along * W, W - inset]
              : [inset, along * W];
      const alpha = 0.12 + 0.45 * rng() * (1 - depth / (W * 0.08));
      const size = 0.6 + rng() * 1.8 * corner;
      ctx.fillStyle = `rgb(250 244 232 / ${alpha.toFixed(3)})`;
      ctx.fillRect(x, y, size, size * (0.4 + rng()));
    }

    // A few hairline scratches, each bent a little.
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const x = rng() * W;
      const y = rng() * W;
      const len = W * (0.03 + 0.12 * rng());
      const a = rng() * Math.PI;
      const bend = (rng() - 0.5) * 0.3 * len;
      ctx.strokeStyle = `rgb(255 255 255 / ${(0.1 + 0.16 * rng()).toFixed(3)})`;
      ctx.lineWidth = 0.3 + 0.35 * rng();
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

    // Soft patches where hands held it.
    for (let i = 0; i < 3; i++) {
      const x = rng() * W;
      const y = rng() * W;
      const patch = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        W * (0.06 + 0.08 * rng()),
      );
      patch.addColorStop(0, 'rgb(255 250 240 / 0.07)');
      patch.addColorStop(1, 'rgb(255 250 240 / 0)');
      ctx.fillStyle = patch;
      ctx.fillRect(0, 0, W, W);
    }
  }, [wearKey]);

  return (
    <canvas ref={ref} width={SIZE} height={SIZE} className="sleeve-wear" />
  );
};
