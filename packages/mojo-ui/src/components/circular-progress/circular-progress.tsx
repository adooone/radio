import clsx from 'clsx';
import type { FC } from 'react';
import styles from './circular-progress.module.scss';

export interface CircularProgressProps {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Color (hex or css color) */
  color?: string;
  /** Additional class name */
  className?: string;
  /** Show percentage text */
  showLabel?: boolean;
  /** Label formatter */
  labelFormatter?: (value: number) => string;
}

/**
 * CircularProgress - SVG-based circular progress indicator with gradient
 *
 * @example
 * ```tsx
 * <CircularProgress percentage={75} size={120} color="#47f57d" />
 * <CircularProgress percentage={50} size={80} strokeWidth={6} showLabel={false} />
 * ```
 */
export const CircularProgress: FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#47f57d',
  className,
  showLabel = true,
  labelFormatter = (value) => `${value}%`,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Create unique gradient ID based on color to avoid conflicts
  const gradientId = `progressGradient-${color.replace('#', '')}`;

  // Convert hex color to rgba for drop shadow
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      className={clsx(styles.container, className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={styles.svg}
        style={{ filter: `drop-shadow(0 0 8px ${hexToRgba(color, 0.3)})` }}
        aria-label={`Progress: ${percentage}%`}
      >
        <title>Progress: {percentage}%</title>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          className={styles.backgroundCircle}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={styles.progressCircle}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.8} />
            <stop offset="100%" stopColor={color} stopOpacity={1} />
          </linearGradient>
        </defs>
      </svg>
      {/* Percentage text */}
      {showLabel && (
        <div className={styles.label} style={{ color }}>
          <span className={styles.labelText}>{labelFormatter(percentage)}</span>
        </div>
      )}
    </div>
  );
};

CircularProgress.displayName = 'CircularProgress';
