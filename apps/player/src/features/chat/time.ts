import type { T } from '@/i18n';

/** A message's hour and minute, Ukrainian clock. */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/** How long ago a listener was last seen, for the listeners page. */
export const formatLastSeen = (timestamp: string, t: T): string => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return t('listeners.lastSeen.now');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('listeners.lastSeen.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('listeners.lastSeen.hours', { count: hours });
  const days = Math.floor(hours / 24);
  return t('listeners.lastSeen.days', { count: days });
};
