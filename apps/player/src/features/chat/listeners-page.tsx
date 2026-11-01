import { useT } from '@/i18n';
import { effectiveColor } from './colors';
import { StatusIcon } from './icons';
import { formatLastSeen } from './time';
import type { UserWithStatus } from './types';
import { isSelf } from './use-user-list';

type ListenersPageProps = {
  users: UserWithStatus[];
  nickname: string;
};

/**
 * Who is in the room: every nick in its colour, the listener's own marked
 * out, the on-air status mark and when each was last seen.
 */
export const ListenersPage = ({ users, nickname }: ListenersPageProps) => {
  const t = useT();
  if (users.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <p className="type-body text-center text-cream/45">
          {t('listeners.empty')}
        </p>
      </div>
    );
  }

  return (
    <div className="chat-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden py-2">
      {users.map((user, index) => {
        const own = isSelf(user, nickname);
        return (
          <div
            key={`${user.nickname}-${index}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-cream/5 px-3 py-2"
          >
            <span className="flex min-w-0 items-center gap-2">
              <StatusIcon
                className={`size-4 shrink-0 ${
                  user.isOnline ? 'text-glow' : 'text-cream/25'
                }`}
                aria-label={t(
                  user.isOnline ? 'chat.status.online' : 'chat.status.offline',
                )}
              />
              <span
                className="type-label truncate"
                style={{ color: effectiveColor(user.nickname, user.color) }}
              >
                {user.nickname || t('chat.anonymous')}
              </span>
              {own && (
                <span className="type-meta shrink-0 text-cream/45">
                  {t('listeners.self')}
                </span>
              )}
            </span>
            <span className="type-meta shrink-0 text-cream/45">
              {formatLastSeen(user.lastSeen, t)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
