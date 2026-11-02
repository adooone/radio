import {
  useDeleteUser,
  useUpdateUser,
} from '@/services/api/hooks/use-user-management';
import clsx from 'clsx';
import { useState } from 'react';

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type UserListProps = {
  users: User[];
};

export const UserList = ({ users }: UserListProps) => {
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"?`))
      return;

    setDeletingId(user.id);
    try {
      await deleteUser.mutateAsync(user.id);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { isActive: !user.isActive },
      });
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user status');
    }
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { role: newRole },
      });
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  if (users.length === 0) {
    return (
      <p className="py-6 text-center font-sans text-sm text-cream/45">
        Користувачів немає.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {users.map((user) => (
        <li
          key={user.id}
          className="flex flex-col gap-2 rounded-2xl bg-cream/5 p-3 ring-1 ring-cream/10"
        >
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                'size-2 shrink-0 rounded-full',
                user.isActive ? 'bg-glow' : 'bg-cream/25',
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-sm font-semibold text-cream">
                {user.username}
              </p>
              <p className="truncate font-sans text-xs text-cream/45">
                {user.email}
              </p>
            </div>
            <select
              value={user.role}
              onChange={(e) => handleRoleChange(user, e.target.value)}
              className="rounded-md bg-ink px-2 py-1 font-sans text-xs text-cream ring-1 ring-cream/15 focus:outline-none focus:ring-accent"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-3 font-sans text-xs text-cream/45">
            <span>
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString('uk-UA')
                : 'Не входив'}
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => handleToggleActive(user)}
              className="text-cream/70 transition-colors hover:text-cream"
            >
              {user.isActive ? 'Деактивувати' : 'Активувати'}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(user)}
              disabled={deletingId === user.id}
              className="text-accent transition-colors hover:text-accent/70 disabled:opacity-50"
            >
              {deletingId === user.id ? '...' : 'Видалити'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};
