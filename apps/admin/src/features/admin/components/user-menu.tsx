import { useLogout } from '@/services/api/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-ember/0 rounded-full transition-all duration-300 hover:bg-white/5 text-paper-calm hover:text-paper-fog"
      >
        <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-sm font-medium text-coal">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block font-display font-medium">
          {user.username}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          role="img"
          aria-label="Toggle menu"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 bottom-full mb-2 w-48 bg-stone-900/90 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl py-1"
          >
            <div className="px-4 py-2 border-b border-white/10">
              <p className="text-sm font-medium text-stone-100">
                {user.username}
              </p>
              <p className="text-xs text-stone-400">{user.email}</p>
              <p className="text-xs text-amber-400 capitalize">{user.role}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              {logout.isPending ? 'Signing out...' : 'Sign Out'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
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
