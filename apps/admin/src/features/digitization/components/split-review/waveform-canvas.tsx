import type {
  DigitizationCut,
  DigitizationCutKind,
  DigitizationPeaks,
} from '@radio/types';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

const HEIGHT = 140;
const DRAG_THRESHOLD_PX = 4;

const CUT_COLORS: Record<DigitizationCutKind, string> = {
  gap: '#60a5fa',
  refined: '#fbbf24',
  expected: '#f87171',
  manual: '#c084fc',
};

type WaveformCanvasProps = {
  peaks: DigitizationPeaks;
  duration: number;
  cuts: DigitizationCut[];
  onCutsChange: (times: number[]) => void;
  onAudition: (time: number) => void;
};

export const WaveformCanvas = ({
  peaks,
  duration,
  cuts,
  onCutsChange,
  onAudition,
}: WaveformCanvasProps) => {
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
    canvas.width = width;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, HEIGHT);
    ctx.fillStyle = '#4b5563';
    const bucketCount = peaks.min.length;
    const centerY = HEIGHT / 2;
    for (let x = 0; x < width; x++) {
      const bucket = Math.min(
        bucketCount - 1,
        Math.floor((x / width) * bucketCount),
      );
      const min = peaks.min[bucket] ?? 0;
      const max = peaks.max[bucket] ?? 0;
      const yTop = centerY - max * centerY;
      const yBottom = centerY - min * centerY;
      ctx.fillRect(x, yTop, 1, Math.max(1, yBottom - yTop));
    }
  }, [peaks, width]);

  const timeToX = (time: number) =>
    duration > 0 ? (time / duration) * width : 0;
  const xToTime = (x: number) => (width > 0 ? (x / width) * duration : 0);

  const displayCuts = cuts.map((cut, i) =>
    i === dragIndex ? { ...cut, time: dragTime } : cut,
  );

  const handleMarkerPointerDown = (
    index: number,
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
    movedRef.current = false;
    setDragIndex(index);
    setDragTime(cuts[index].time);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMarkerPointerMove = (
    index: number,
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (dragIndex !== index) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextTime = Math.min(
      duration,
      Math.max(0, xToTime(event.clientX - rect.left)),
    );
    if (
      Math.abs(timeToX(nextTime) - timeToX(cuts[index].time)) >
      DRAG_THRESHOLD_PX
    ) {
      movedRef.current = true;
    }
    setDragTime(nextTime);
  };

  const handleMarkerPointerUp = (index: number) => {
    if (dragIndex !== index) return;
    setDragIndex(null);
    if (movedRef.current) {
      const next = cuts
        .map((cut, i) => (i === index ? dragTime : cut.time))
        .sort((a, b) => a - b);
      onCutsChange(next);
    } else {
      onAudition(cuts[index].time);
    }
  };

  const handleMarkerDoubleClick = (
    index: number,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
    onCutsChange(cuts.filter((_, i) => i !== index).map((cut) => cut.time));
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const time = Math.min(
      duration,
      Math.max(0, xToTime(event.clientX - rect.left)),
    );
    onCutsChange([...cuts.map((cut) => cut.time), time].sort((a, b) => a - b));
  };

  return (
    <div
      ref={containerRef}
      className={clsx(styles.container)}
      style={{ height: HEIGHT }}
    >
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: waveform canvas is a pointer-only editing surface */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={clsx(styles.canvas)}
      />
      {displayCuts.map((cut, index) => (
        <div
          key={`${cuts[index].kind}-${cuts[index].time.toFixed(3)}`}
          className={clsx(styles.marker)}
          style={{
            left: timeToX(cut.time),
            backgroundColor: CUT_COLORS[cut.kind],
          }}
          onPointerDown={(event) => handleMarkerPointerDown(index, event)}
          onPointerMove={(event) => handleMarkerPointerMove(index, event)}
          onPointerUp={() => handleMarkerPointerUp(index)}
          onDoubleClick={(event) => handleMarkerDoubleClick(index, event)}
        />
      ))}
    </div>
  );
};

const styles = {
  container: [
    'relative w-full bg-gray-900 rounded-lg overflow-hidden cursor-crosshair select-none',
  ],
  canvas: ['absolute inset-0 w-full h-full'],
  marker: [
    'absolute top-0 bottom-0 w-[3px] -translate-x-1/2 cursor-grab touch-none',
  ],
} as const;
