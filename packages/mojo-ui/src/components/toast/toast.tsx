import clsx from 'clsx';
import { type FC, type ReactNode, useEffect, useState } from 'react';
import styles from './toast.module.scss';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center';

export interface ToastProps {
  id: string;
  title?: string;
  message: ReactNode;
  variant?: ToastVariant;
  duration?: number;
  onClose?: (id: string) => void;
  className?: string;
}

// Default icons for each variant
const VariantIcon: Record<ToastVariant, ReactNode> = {
  info: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label="Information"
      role="img"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  success: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label="Success"
      role="img"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  warning: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label="Warning"
      role="img"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-label="Error"
      role="img"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

export const Toast: FC<ToastProps> = ({
  id,
  title,
  message,
  variant = 'info',
  duration = 5000,
  onClose,
  className,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === Number.POSITIVE_INFINITY) return;

    const startTime = Date.now();
    const endTime = startTime + duration;

    const updateProgress = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;
      setProgress(newProgress);

      if (now < endTime) {
        requestAnimationFrame(updateProgress);
      }
    };

    const progressAnimation = requestAnimationFrame(updateProgress);

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(progressAnimation);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };

  return (
    <div
      className={clsx(
        styles.toast,
        styles[variant],
        isExiting && styles.exiting,
        className,
      )}
      role="alert"
    >
      <div className={styles.iconWrapper}>{VariantIcon[variant]}</div>
      <div className={styles.content}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <div className={styles.message}>{message}</div>
      </div>
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {duration !== Number.POSITIVE_INFINITY && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast container component
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
  onClose?: (id: string) => void;
  className?: string;
}

export const ToastContainer: FC<ToastContainerProps> = ({
  toasts,
  position = 'bottom-right',
  onClose,
  className,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className={clsx(styles.container, styles[position], className)}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Hook for managing toasts
export interface UseToastReturn {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

let toastIdCounter = 0;

export const generateToastId = (): string => {
  return `toast-${++toastIdCounter}-${Date.now()}`;
};
