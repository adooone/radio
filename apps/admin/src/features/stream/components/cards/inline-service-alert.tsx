import clsx from 'clsx';
import type React from 'react';

interface InlineServiceAlertProps {
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const alertStyles = {
  warning: {
    container: 'bg-amber-500/10 border-amber-400/20 text-amber-400',
    icon: 'text-amber-400',
  },
  error: {
    container: 'bg-red-500/10 border-red-400/20 text-red-400',
    icon: 'text-red-400',
  },
  info: {
    container: 'bg-blue-500/10 border-blue-400/20 text-blue-400',
    icon: 'text-blue-400',
  },
  success: {
    container: 'bg-green-500/10 border-green-400/20 text-green-400',
    icon: 'text-green-400',
  },
};

const getIcon = (type: InlineServiceAlertProps['type']): string => {
  switch (type) {
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'info':
      return 'ℹ️';
    case 'success':
      return '✅';
    default:
      return 'ℹ️';
  }
};

export const InlineServiceAlert: React.FC<InlineServiceAlertProps> = ({
  type,
  message,
  action,
  className,
}) => {
  const styles = alertStyles[type];

  return (
    <div
      className={clsx(
        'p-3 rounded-lg border text-sm',
        styles.container,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={clsx('text-sm flex-shrink-0', styles.icon)}>
          {getIcon(type)}
        </span>
        <span className="flex-1 text-xs leading-relaxed">{message}</span>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={clsx(
              'px-2 py-1 text-xs rounded border transition-all duration-200',
              'bg-current/10 border-current/30 hover:bg-current/20',
            )}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
