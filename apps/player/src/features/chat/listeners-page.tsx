import { nicknameColor } from './colors';
import { StatusIcon } from './icons';
import { formatLastSeen } from './time';
import type { UserWithStatus } from './types';

type ListenersPageProps = {
  users: UserWithStatus[];
  nickname: string;
};

/**
 * Who is in the room: every nick in its colour, the listener's own marked
 * out, the on-air status mark and when each was last seen.
 */
export const ListenersPage = ({ users, nickname }: ListenersPageProps) => {
  if (users.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-4">
        <p className="text-center text-sm text-cream/40">No one is here yet</p>
      </div>
    );
  }

  return (
    <div className="chat-scroll min-h-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden py-2">
      {users.map((user, index) => {
        const isSelf = user.nickname === nickname;
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
                aria-label={user.isOnline ? 'Online' : 'Offline'}
              />
              <span
                className="truncate font-sans text-xs font-medium uppercase tracking-wide"
                style={{ color: nicknameColor(user.nickname, isSelf) }}
              >
                {user.nickname}
              </span>
              {isSelf && (
                <span className="shrink-0 text-xs text-cream/40">
                  that's you
                </span>
              )}
            </span>
            <span className="shrink-0 font-mono text-[10px] text-cream/40">
              {formatLastSeen(user.lastSeen)}
            </span>
          </div>
        );
      })}
    </div>
  );
};
