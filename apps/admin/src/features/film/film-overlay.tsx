import { useEffect, useRef, useState } from 'react';

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
    const v = 118 + (Math.random() - 0.5) * 150 + (Math.random() - 0.5) * 60;
    px[i] = px[i + 1] = px[i + 2] = v;
    px[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return `url(${canvas.toDataURL('image/png')})`;
};

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
      ctx.clearRect(0, 0, W, H);
      ctx.lineCap = 'round';
      for (let i = 0; i < 10; i++) {
        const long = Math.random() < 0.6;
        const len =
          (long ? 0.25 + 0.55 * Math.random() : 0.05 + 0.12 * Math.random()) *
          Math.max(W, H);
        const a = Math.random() * Math.PI;
        const x = Math.random() * W;
        const y = Math.random() * H;
        ctx.strokeStyle = `rgb(255 255 255 / ${long ? 0.22 + 0.2 * Math.random() : 0.45 + 0.3 * Math.random()})`;
        ctx.lineWidth = 0.5 + 0.5 * Math.random();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
        ctx.stroke();
      }
      for (let i = 0; i < 30; i++) {
        const r = 0.4 + Math.random() * 1.3;
        ctx.fillStyle = `rgb(255 255 255 / ${0.3 + 0.5 * Math.random()})`;
        ctx.beginPath();
        ctx.arc(Math.random() * W, Math.random() * H, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);
  return <canvas ref={ref} className="film-scratches" />;
};

export const FilmOverlay = () => {
  const [grain] = useState(grainTile);
  return (
    <div aria-hidden="true" className="film">
      <div className="film-warm" />
      <div className="film-grain" style={{ backgroundImage: grain }} />
      <Scratches />
      <div className="film-vignette" />
      <div className="film-gate" />
    </div>
  );
};
