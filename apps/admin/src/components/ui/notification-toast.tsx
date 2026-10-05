import type { Notification } from '@/stores/notification-store';
import clsx from 'clsx';
import type React from 'react';
import { useEffect, useState } from 'react';

interface NotificationToastProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const getIconForType = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'error':
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'warning':
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'info':
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

const getStylesForType = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return {
        container: 'bg-moss-deep/30 border-moss-accent/40 text-white',
        icon: 'text-moss-accent',
        button: 'text-moss-fog hover:text-white',
      };
    case 'error':
      return {
        container: 'bg-red-900/40 border-red-400/50 text-red-100',
        icon: 'text-red-400',
        button: 'text-red-300 hover:text-red-100',
      };
    case 'warning':
      return {
        container: 'bg-sun-deep/30 border-sun/40 text-white',
        icon: 'text-sun',
        button: 'text-sun-fog hover:text-white',
      };
    case 'info':
      return {
        container: 'bg-river-deep/30 border-river/40 text-white',
        icon: 'text-river',
        button: 'text-river-fog hover:text-white',
      };
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onRemove,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const styles = getStylesForType(notification.type);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const handleActionClick = () => {
    if (notification.action?.onClick) {
      notification.action.onClick();
      handleRemove();
    }
  };

  return (
    <div
      className={clsx(
        'min-w-80 max-w-md w-full rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 transform',
        styles.container,
        isVisible && !isRemoving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0',
      )}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className={clsx('flex-shrink-0', styles.icon)}>
            {getIconForType(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium break-words">
              {notification.title}
            </p>
            {notification.message && (
              <p className="mt-1 text-sm opacity-80 break-words">
                {notification.message}
              </p>
            )}

            {notification.action && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleActionClick}
                  className={clsx(
                    'text-sm font-medium underline transition-colors',
                    styles.button,
                  )}
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={handleRemove}
              className={clsx(
                'rounded-md inline-flex transition-colors p-1.5',
                styles.button,
              )}
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
