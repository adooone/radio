import { FilmOverlay, Wordmark } from '@radio/stage';
import { Outlet, useLocation } from '@tanstack/react-router';
import { LayoutGroup } from 'framer-motion';
import type React from 'react';
import { ControlIsland } from './components';

/**
 * The player's stage, for the back room: one fixed screen split two to one,
 * the sign in the corner, the island docked under the work column, the film
 * over everything. Each page renders its two columns into the split.
 */
export const AdminLayout: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <div className="stage split bg-ink text-cream">
      <header className="sign-corner pointer-events-none select-none">
        <Wordmark className="sign-lockup" />
      </header>

      <LayoutGroup>
        <Outlet />
      </LayoutGroup>

      <div className="island-dock">
        <ControlIsland currentRoute={pathname} />
      </div>
      <FilmOverlay />
    </div>
  );
};
