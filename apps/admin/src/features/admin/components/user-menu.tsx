import { useLogout } from '@/services/api/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import { LampButton } from '@dendelion/func-ui';
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();

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
            className="control-island absolute right-0 bottom-full z-50 mb-4 w-56 rounded-3xl border border-cream/10 py-2"
          >
            <div className="border-b border-cream/10 px-4 py-2">
              <p className="font-sans text-sm font-semibold text-cream">
                {user.username}
              </p>
              <p className="font-sans text-xs text-cream/70">{user.email}</p>
              <p className="font-sans text-xs text-glow capitalize">
                {user.role}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate({ to: '/users' });
              }}
              className="w-full px-4 py-2 text-left font-sans text-sm text-cream/70 transition-colors hover:text-cream"
            >
              Користувачі
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="w-full px-4 py-2 text-left font-sans text-sm text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
            >
              {logout.isPending ? 'Signing out...' : 'Sign Out'}
            </button>
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
