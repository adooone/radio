import { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import {
  useDeleteUser,
  useUpdateUser,
} from '@/services/api/hooks/use-user-management';

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
      <div className="text-center py-8 text-stone-400">No users found.</div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={clsx(sharedStyles.recentItem, 'flex-col gap-4')}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-600/30 rounded-full flex items-center justify-center">
                <span className="text-stone-200 font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="font-medium text-stone-100">{user.username}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive
                        ? 'bg-green-900/50 text-green-300 border border-green-500/50'
                        : 'bg-red-900/50 text-red-300 border border-red-500/50'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin'
                        ? 'bg-amber-900/50 text-amber-300 border border-amber-500/50'
                        : 'bg-stone-900/50 text-stone-300 border border-stone-500/50'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user, e.target.value)}
                className="px-3 py-1 bg-coal/60 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <button
                type="button"
                onClick={() => handleToggleActive(user)}
                className={clsx(
                  'px-3 py-1 rounded text-sm font-medium transition-colors',
                  user.isActive
                    ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70 border border-red-500/50'
                    : 'bg-green-900/50 text-green-300 hover:bg-green-900/70 border border-green-500/50',
                )}
              >
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(user)}
                disabled={deletingId === user.id}
                className="px-3 py-1 bg-red-900/50 text-red-300 hover:bg-red-900/70 border border-red-500/50 rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {deletingId === user.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between w-full text-xs text-stone-400">
            <span>
              Created: {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <span>
              Last login:{' '}
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleDateString()
                : 'Never'}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
