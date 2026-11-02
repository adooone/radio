import { Outlet, useLocation } from '@tanstack/react-router';
import { LayoutGroup } from 'framer-motion';
import type React from 'react';
import { FilmOverlay } from '../film/film-overlay';
import { ControlIsland, Wordmark } from './components';

export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="stage flex flex-col bg-ink">
      <div className="sign-corner">
        <Wordmark className="sign-lockup" />
      </div>

      <div
        className="relative z-10 flex-1 overflow-y-auto pb-32"
        data-scroll-restoration-id="admin-content"
      >
        <LayoutGroup>
          <Outlet />
        </LayoutGroup>
      </div>

      <ControlIsland currentRoute={pathname} />
      <FilmOverlay />
    </div>
  );
};
