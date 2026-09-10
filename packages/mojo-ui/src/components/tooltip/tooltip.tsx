import clsx from 'clsx';
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react';
import styles from './tooltip.module.scss';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: TooltipPlacement;
  delay?: number;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

export const Tooltip: FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  delay = 200,
  disabled = false,
  className,
  contentClassName,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsMounted(true);
      // Small delay to allow mount before adding visible class for animation
      setTimeout(() => setIsVisible(true), 10);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
    setTimeout(() => setIsMounted(false), 200);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsMounted(true);
    setTimeout(() => setIsVisible(true), 10);
  };

  const handleBlur = () => {
    setIsVisible(false);
    setTimeout(() => setIsMounted(false), 200);
  };

  return (
    <div
      ref={triggerRef}
      className={clsx(styles.trigger, className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {isMounted && (
        <div
          className={clsx(
            styles.tooltip,
            styles[placement],
            isVisible && styles.visible,
            contentClassName,
          )}
          role="tooltip"
        >
          <div className={styles.content}>{content}</div>
          <div className={clsx(styles.arrow, styles[`arrow${placement}`])} />
        </div>
      )}
    </div>
  );
};
