import clsx from 'clsx';
import { useUserList } from '@/features/radio/hooks/use-user-list';
import { StatusIcon } from '../icons/status-icon';
import { useUserColor } from '../../hooks/use-user-color';
import { CloseButton } from '@/components/ui';
import { formatRelativeTime } from '../../utils/time';

interface UserListProps {
  isOpen: boolean;
  nickname: string;
  onClose: () => void;
}

export const UserList = ({
  isOpen,
  onClose,
  nickname,
}: UserListProps) => {
  const users = useUserList();
  const { getEffectiveColor } = useUserColor();

  if (!isOpen) return null;

  return (
    <div
      className={clsx(styles.overlay)}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="presentation"
    >
      <dialog
        className={clsx(styles.modal)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        open
        aria-labelledby="user-list-title"
      >
        <div className={clsx(styles.header)}>
          <h3 id="user-list-title" className={clsx(styles.title)}>
            Меломани на Городі
          </h3>
          <CloseButton
            onClick={onClose}
            onKeyDown={(e) => e.key === 'Enter' && onClose()}
            aria-label="Close user list"
          />
        </div>
        <div className={clsx(styles.list)}>
          {users.length === 0 ? (
            <div className={clsx(styles.empty)}>Список порожній</div>
          ) : (
            users.map((user) => {
              const wasHere = formatRelativeTime(user.lastSeen);
              return (
                <div key={user.nickname} className={clsx(styles.user)}>
                  <span
                    className={clsx(
                      styles.nickname,
                      getEffectiveColor(user.nickname, false),
                    )}
                  >
                    {user.nickname}
                    {user.nickname === nickname && (
                      <span className={clsx(styles.self)}>{'<- це ти'}</span>
                    )}
                  </span>
                  <span className={clsx(styles.statusWrapper)}>
                    {wasHere && (
                      <span className={clsx(styles.wasHere)}>{wasHere}</span>
                    )}
                    <StatusIcon
                      className={clsx(
                        styles.status,
                        user.isOnline ? 'text-green-500' : 'text-gray-500',
                      )}
                      aria-label={user.isOnline ? 'Онлайн' : 'Офлайн'}
                    />
                  </span>
                </div>
              );
            })
          )}
        </div>
      </dialog>
    </div>
  );
};

const styles = {
  overlay: [
    'fixed inset-0 bg-black/50 backdrop-blur-sm z-50',
    'flex items-center justify-center p-4',
  ],
  modal: [
    'w-full max-w-md bg-coal-relic/95 backdrop-blur-l rounded-2xl border border-moss/20',
    'flex flex-col max-h-[80vh]',
  ],
  header: ['flex items-center justify-between p-4'],
  title: ['text-lg font-display text-white/40 px-2'],

  list: [
    'flex flex-col gap-2 p-4 overflow-y-auto',
    'scrollbar-thin scrollbar-thumb-moss/30 scrollbar-track-transparent',
    'overflow-y-auto',
  ],
  user: [
    'flex items-center justify-between gap-2 p-2 rounded-lg bg-neutral-900/40',
    'hover:bg-neutral-900/60 transition-colors duration-200',
  ],
  nickname: ['font-display uppercase'],
  statusWrapper: ['flex items-center gap-2'],
  status: ['transition-colors duration-200 cursor-help'],
  empty: ['text-white/40 text-center py-4'],
  self: ['ml-2 text-white/20 text-center'],
  wasHere: ['ml-2 text-white/10 text-center'],
} as const;
