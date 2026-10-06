import clsx from 'clsx';
import type { FC } from 'react';
import styles from './skeleton.module.scss';

export interface SkeletonProps {
  /** Width of skeleton (px, %, or css value) */
  width?: string | number;
  /** Height of skeleton (px, %, or css value) */
  height?: string | number;
  /** Skeleton variant */
  variant?: 'text' | 'rectangular' | 'circular';
  /** Add animation */
  animated?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * Skeleton - Loading placeholder with pulse animation
 *
 * @example
 * ```tsx
 * // Text line
 * <Skeleton variant="text" width="200px" />
 *
 * // Rectangle
 * <Skeleton variant="rectangular" width="100%" height="120px" />
 *
 * // Circle/Avatar
 * <Skeleton variant="circular" width="48px" height="48px" />
 * ```
 */
export const Skeleton: FC<SkeletonProps> = ({
  width = '100%',
  height,
  variant = 'rectangular',
  animated = true,
  className,
}) => {
  const getHeight = (): string | number => {
    if (height) return height;
    if (variant === 'text') return '1em';
    if (variant === 'circular') return width;
    return '100%';
  };

  return (
    <span
      className={clsx(
        styles.skeleton,
        styles[variant],
        animated && styles.animated,
        className,
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height:
          typeof getHeight() === 'number' ? `${getHeight()}px` : getHeight(),
      }}
    />
  );
};

/**
 * SkeletonText - Multi-line text skeleton
 */
export interface SkeletonTextProps {
  /** Number of lines */
  lines?: number;
  /** Width of last line (percentage) */
  lastLineWidth?: string;
  /** Additional class name */
  className?: string;
}

export const SkeletonText: FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '60%',
  className,
}) => {
  return (
    <div className={clsx(styles.textContainer, className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={`skeleton-line-${index}-${lines}-${lastLineWidth}`}
          variant="text"
          width={index === lines - 1 ? lastLineWidth : '100%'}
          className={styles.textLine}
        />
      ))}
    </div>
  );
};

Skeleton.displayName = 'Skeleton';
SkeletonText.displayName = 'SkeletonText';
