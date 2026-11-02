import { PeoplePanel } from '@/features/users';
import { useLogout } from '@/services/api/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { LampButton } from '@dendelion/func-ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const logout = useLogout();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <LampButton
        tone={isOpen ? 'red' : 'dark'}
        size="sm"
        aria-label={user.username}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'text-ink' : 'text-cream'}
      >
        {user.username.charAt(0).toUpperCase()}
      </LampButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="control-island absolute right-0 bottom-full z-50 mb-4 rounded-3xl border border-cream/10 p-4"
          >
            <PeoplePanel
              onLogout={handleLogout}
              isLoggingOut={logout.isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </div>
  );
};
