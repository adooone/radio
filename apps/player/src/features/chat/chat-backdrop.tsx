import { useEffect, useRef } from 'react';

/** Overhang past the section's edge, so the rim can swing across the seam. */
const BLEED = 32;

/**
 * The chat's ground, drawn whole on canvas underneath the room: a slab
 * darker than the radio's black, whose edge toward the radio — left in the
 * split, top when portrait stacks
 * the halves — is the record's rim itself, the same cream weight and glow
 * the vinyl box strokes, with its two waves travelling slowly along it. It
 * holds still under prefers-reduced-motion.
 */
export const ChatBackdrop = () => {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    let frame = 0;
    let t = 0;
    const size = { w: 0, h: 0, portrait: false };

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size.w = w;
      size.h = h;
      size.portrait = window.matchMedia('(orientation: portrait)').matches;
      if (reduced) draw();
    };

    const draw = () => {
      const { w, h, portrait } = size;
      ctx.clearRect(0, 0, w, h);

      // The rim rides the section's edge, swinging a little past it both
      // ways — the same slow wave pair the vinyl box runs around the disc.
      const edge = (p: number) =>
        BLEED +
        Math.sin(p * 0.006 - t * 1.4) * 7 +
        Math.sin(p * 0.014 - t * 2.1) * 5;

      const rim = new Path2D();
      const slab = new Path2D();
      const span = portrait ? w : h;
      for (let p = 0; p <= span; p += 6) {
        const e = edge(p);
        const x = portrait ? p : e;
        const y = portrait ? e : p;
        if (p === 0) {
          rim.moveTo(x, y);
          slab.moveTo(x, y);
        } else {
          rim.lineTo(x, y);
          slab.lineTo(x, y);
        }
      }
      if (portrait) {
        slab.lineTo(w, h);
        slab.lineTo(0, h);
      } else {
        slab.lineTo(w, h);
        slab.lineTo(w, 0);
      }
      slab.closePath();

      const ground = ctx.createLinearGradient(0, 0, 0, h);
      ground.addColorStop(0, 'rgba(6, 3, 2, 0.97)');
      ground.addColorStop(1, 'rgba(3, 1, 1, 0.97)');
      ctx.fillStyle = ground;
      ctx.fill(slab);

      ctx.strokeStyle = '#e7d2ae';
      ctx.lineWidth = 7;
      ctx.shadowColor = 'rgba(231, 210, 174, 0.4)';
      ctx.shadowBlur = 14;
      ctx.stroke(rim);
      ctx.shadowBlur = 0;
    };

    const tick = () => {
      t += 0.004;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    if (!reduced) frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute"
      style={{
        top: -BLEED,
        left: -BLEED,
        width: `calc(100% + ${BLEED}px)`,
        height: `calc(100% + ${BLEED}px)`,
      }}
    />
  );
};
