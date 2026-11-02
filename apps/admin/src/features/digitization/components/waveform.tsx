import type {
  DigitizationCut,
  DigitizationCutKind,
  DigitizationPeaks,
} from '@radio/types';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { formatSeconds } from '../lib/split-review-utils';

const HEIGHT = 140;
const DRAG_THRESHOLD_PX = 4;
const RULER_TICKS = 6;

/* One hue per cut kind, from the room's palette: the hand's own marks in
   cream, the final cuts in the label red, detected gaps in the glow,
   expected positions as faint cream. */
export const CUT_COLORS: Record<DigitizationCutKind, string> = {
  manual: '#f5f2ec',
  refined: '#ff5647',
  gap: '#ffb84d',
  expected: 'rgba(245, 242, 236, 0.35)',
};

type WaveformProps = {
  peaks: DigitizationPeaks;
  duration: number;
  cuts: DigitizationCut[];
  selected: number | null;
  onSelect: (index: number | null) => void;
  onCutsChange: (times: number[]) => void;
  onAudition: (time: number) => void;
};

/**
 * The side's sound as the board draws it — a cream trace on the ink — with
 * the cuts as lines over it. A click on the trace adds a cut there; a cut
 * drags to move, a click on it selects and auditions it, a double click
 * removes it.
 */
export const Waveform = ({
  peaks,
  duration,
  cuts,
  selected,
  onSelect,
  onCutsChange,
  onAudition,
}: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragTime, setDragTime] = useState(0);
  const movedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = HEIGHT * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, HEIGHT);
    const centerY = HEIGHT / 2;

    // The midline, faint.
    ctx.fillStyle = 'rgba(245, 242, 236, 0.15)';
    ctx.fillRect(0, centerY, width, 1);

    // The peaks per pixel column as a single cream trace.
    ctx.fillStyle = 'rgba(245, 242, 236, 0.45)';
    const buckets = peaks.min.length;
    for (let x = 0; x < width; x++) {
      const bucket = Math.min(buckets - 1, Math.floor((x / width) * buckets));
      const min = peaks.min[bucket] ?? 0;
      const max = peaks.max[bucket] ?? 0;
      const top = centerY - max * (centerY - 4);
      const bottom = centerY - min * (centerY - 4);
      ctx.fillRect(x, top, 1, Math.max(1, bottom - top));
    }
  }, [peaks, width]);

  const timeToX = (time: number) =>
    duration > 0 ? (time / duration) * width : 0;
  const xToTime = (x: number) => (width > 0 ? (x / width) * duration : 0);
  const clampTime = (time: number) => Math.min(duration, Math.max(0, time));

  const shown = cuts.map((cut, i) =>
    i === dragIndex ? { ...cut, time: dragTime } : cut,
  );

  const onMarkerDown = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    movedRef.current = false;
    setDragIndex(index);
    setDragTime(cuts[index].time);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMarkerMove = (index: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIndex !== index) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = clampTime(xToTime(e.clientX - rect.left));
    if (Math.abs(timeToX(next) - timeToX(cuts[index].time)) > DRAG_THRESHOLD_PX) {
      movedRef.current = true;
    }
    setDragTime(next);
  };

  const onMarkerUp = (index: number) => {
    if (dragIndex !== index) return;
    setDragIndex(null);
    if (movedRef.current) {
      const times = cuts
        .map((cut, i) => (i === index ? dragTime : cut.time))
        .sort((a, b) => a - b);
      onSelect(times.indexOf(dragTime));
      onCutsChange(times);
    } else {
      onSelect(index);
      onAudition(cuts[index].time);
    }
  };

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const time = clampTime(xToTime(e.clientX - rect.left));
    const times = [...cuts.map((cut) => cut.time), time].sort((a, b) => a - b);
    onSelect(times.indexOf(time));
    onCutsChange(times);
  };

  const ticks = Array.from({ length: RULER_TICKS }, (_, i) =>
    formatSeconds((duration * i) / (RULER_TICKS - 1)),
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div
        ref={containerRef}
        style={{ height: HEIGHT }}
        className="relative w-full cursor-crosshair select-none overflow-hidden"
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: the trace is a pointer editing surface; the pills below reach the same actions */}
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          className="absolute inset-0 size-full"
          style={{ width, height: HEIGHT }}
        />
        {shown.map((cut, index) => (
          <div
            key={`${cuts[index].kind}-${cuts[index].time.toFixed(3)}`}
            role="presentation"
            onPointerDown={(e) => onMarkerDown(index, e)}
            onPointerMove={(e) => onMarkerMove(index, e)}
            onPointerUp={() => onMarkerUp(index)}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              onCutsChange(cuts.filter((_, i) => i !== index).map((c) => c.time));
            }}
            className={clsx(
              'absolute top-2 bottom-2 -translate-x-1/2 cursor-grab touch-none',
              selected === index ? 'w-[3px]' : 'w-[2px]',
            )}
            style={{
              left: timeToX(cut.time),
              backgroundColor: CUT_COLORS[cut.kind],
              boxShadow:
                selected === index
                  ? `0 0 10px ${CUT_COLORS[cut.kind]}`
                  : undefined,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between type-meta text-cream/55">
        {ticks.map((tick, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: evenly spaced marks
          <span key={i}>{tick}</span>
        ))}
      </div>
    </div>
  );
};
