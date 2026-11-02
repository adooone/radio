import { useNotificationStore } from '@/stores/notification-store';
import type React from 'react';
import { createPortal } from 'react-dom';
import { NotificationToast } from './notification-toast';

/** The toasts, stacked at the top right under the sign's line. */
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[46] flex flex-col items-end gap-2.5 p-6">
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast
            notification={notification}
            onRemove={removeNotification}
          />
        </div>
      ))}
    </div>,
    document.body,
  );
};
