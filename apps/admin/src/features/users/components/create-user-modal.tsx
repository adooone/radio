import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { Input, Select } from '@dendelion/mojo-ui';
import { sharedStyles } from '@/styles/shared-styles';
import { useCreateUser } from '@/services/api/hooks/use-user-management';

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export const CreateUserModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateUserModalProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const createUser = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim()) return;

    try {
      await createUser.mutateAsync({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });

      // Reset form
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user');
    }
  };

  const handleClose = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('user');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl bg-gray-900/25 backdrop-blur-2xl border border-white/5 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] w-full max-w-md before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none before:rounded-2xl"
          >
            <h2 className="text-xl font-display font-bold text-sun mb-6 tracking-wide">
              Create New User
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="username"
                label="Username *"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />

              <Input
                id="email"
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />

              <Input
                id="password"
                label="Password *"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />

              <Select
                id="role"
                label="Role"
                value={role}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
                options={[
                  { value: 'user', label: 'User' },
                  { value: 'admin', label: 'Administrator' },
                ]}
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className={clsx(sharedStyles.buttonSecondary)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !username.trim() ||
                    !email.trim() ||
                    !password.trim() ||
                    createUser.isPending
                  }
                  className={clsx(sharedStyles.buttonPrimary)}
                >
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
