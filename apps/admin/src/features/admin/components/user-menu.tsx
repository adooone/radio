import { PeopleSheet } from '@/features/users';
import { useLogout } from '@/services/api/hooks/use-auth';
import { useAuthStore } from '@/stores/auth-store';
import clsx from 'clsx';
import { useState } from 'react';

/** The person at the island's end: a ghost ring with their initial, lit
    while the people sheet is open. */
export const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();
  const logout = useLogout();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label={user.username}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border font-sans text-[13px] font-semibold transition-colors',
          open
            ? 'border-lamp/50 bg-lamp/[0.18] text-glow shadow-[0_0_14px_rgba(224,139,38,0.3)]'
            : 'border-cream/20 text-cream/80 hover:text-cream',
        )}
      >
        {user.username.charAt(0).toUpperCase()}
      </button>
      {open && (
        <PeopleSheet
          selfId={Number(user.id)}
          onClose={() => setOpen(false)}
          onLogout={handleLogout}
          isLoggingOut={logout.isPending}
        />
      )}
    </>
  );
};
