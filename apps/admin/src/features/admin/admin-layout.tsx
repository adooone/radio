import { Outlet, useLocation } from '@tanstack/react-router';
import clsx from 'clsx';
import { LayoutGroup } from 'framer-motion';
import type React from 'react';
import { BottomNavigation } from './components';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <div className={clsx(styles.container)}>
      <div className={clsx(styles.backgroundOverlay)} />
      <div className={clsx(styles.dimOverlay)} />
      <div className={clsx(styles.gradientOverlay)} />

      <div
        className={clsx(styles.content)}
        data-scroll-restoration-id="admin-content"
      >
        <LayoutGroup>
          <Outlet />
        </LayoutGroup>
      </div>

      <BottomNavigation currentRoute={currentRoute} />
    </div>
  );
};

const styles = {
  container: ['w-full h-screen bg-coal flex flex-col relative'],
  backgroundOverlay: [
    'absolute inset-0 bg-[url("/login-bg.jpg")] bg-cover bg-center bg-no-repeat',
  ],
  dimOverlay: ['absolute inset-0 bg-coal-relic/80'],
  gradientOverlay: [
    'absolute inset-0 bg-gradient-to-br from-coal/40 via-transparent to-coal/60',
  ],
  content: ['flex-1 overflow-y-auto relative z-10'],
} as const;
