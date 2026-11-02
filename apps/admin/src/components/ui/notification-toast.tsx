import { Dot, type DotTone } from '@/features/admin/ui';
import type { Notification } from '@/stores/notification-store';
import clsx from 'clsx';
import type React from 'react';
import { useEffect, useState } from 'react';

/* A toast is a line in the island's glass: a light for what kind of news,
   the words, and a close. Trouble reads red; the rest keeps to cream and the
   glow. */
const TONES: Record<Notification['type'], { dot: DotTone; rim: string }> = {
  success: { dot: 'lit', rim: 'border-cream/15' },
  error: { dot: 'live', rim: 'border-accent/40' },
  warning: { dot: 'lit', rim: 'border-glow/40' },
  info: { dot: 'quiet', rim: 'border-cream/15' },
};

export const NotificationToast: React.FC<{
  notification: Notification;
  onRemove: (id: string) => void;
}> = ({ notification, onRemove }) => {
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const tone = TONES[notification.type];

  useEffect(() => {
    const timer = setTimeout(() => setShown(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const remove = () => {
    setLeaving(true);
    setTimeout(() => onRemove(notification.id), 300);
  };

  return (
    <div
      className={clsx(
        'control-island flex w-[22rem] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-300',
        tone.rim,
        shown && !leaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      <Dot tone={tone.dot} className="mt-1.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="type-ui break-words text-cream">{notification.title}</p>
        {notification.message && (
          <p className="type-meta break-words text-cream/70">{notification.message}</p>
        )}
        {notification.action && (
          <button
            type="button"
            onClick={() => {
              notification.action?.onClick();
              remove();
            }}
            className="type-label mt-1.5 self-start text-cream/70 underline decoration-accent decoration-2 underline-offset-[6px] hover:text-cream"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={remove}
        aria-label="Закрити"
        className="shrink-0 px-1 text-cream/45 transition-colors hover:text-cream"
      >
        ✕
      </button>
    </div>
  );
};
