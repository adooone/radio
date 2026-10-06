import clsx from 'clsx';
import type { FC, ReactNode } from 'react';
import styles from './badge.module.scss';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'moss'
  | 'ember'
  | 'sun'
  | 'river';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  dot = false,
  pulse = false,
  className,
}) => {
  return (
    <span
      className={clsx(
        styles.badge,
        styles[size],
        styles[variant],
        dot && styles.withDot,
        pulse && styles.pulse,
        className,
      )}
    >
      {dot && <span className={styles.dot} />}
      <span className={styles.content}>{children}</span>
    </span>
  );
};
