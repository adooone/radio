import { useNotificationStore } from '@/stores/notification-store';
import type React from 'react';
import { createPortal } from 'react-dom';
import { NotificationToast } from './notification-toast';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div className="flex flex-col items-end justify-start min-h-screen p-4 space-y-3">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationToast
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
};
