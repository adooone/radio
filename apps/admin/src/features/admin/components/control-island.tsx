import { SplatRecord } from '@radio/stage';
import { useNavigate } from '@tanstack/react-router';
import { GhostNav } from '../ui';
import { TrackStrip } from './track-strip';
import { UserMenu } from './user-menu';

interface ControlIslandProps {
  currentRoute: string;
}

const NAV_ITEMS = [
  { path: '/', label: 'Ефір' },
  { path: '/collection', label: 'Колекція' },
  { path: '/studio', label: 'Студія' },
] as const;

const isActive = (current: string, path: string) =>
  path === '/' ? current === '/' : current.startsWith(path);

/**
 * The admin's island — the player's pill, carrying the back room's
 * controls: the splat record as the sign home, the three pages as ghost
 * labels underlined where you are, the track strip with its one lamp, and
 * the person at the end.
 */
export const ControlIsland = ({ currentRoute }: ControlIslandProps) => {
  const navigate = useNavigate();

  return (
    <div className="control-island relative flex max-w-full items-center gap-4 rounded-full border border-cream/10 py-2 pr-5 pl-3">
      <button
        type="button"
        aria-label="Ефір"
        onClick={() => navigate({ to: '/' })}
        className="shrink-0 cursor-pointer"
      >
        <SplatRecord className="w-9" />
      </button>

      <nav className="flex shrink-0 items-center gap-1">
        {NAV_ITEMS.map((item) => (
          <GhostNav
            key={item.path}
            active={isActive(currentRoute, item.path)}
            onClick={() => navigate({ to: item.path })}
          >
            {item.label}
          </GhostNav>
        ))}
      </nav>

      <div className="hidden min-w-0 shrink items-center border-l border-cream/10 pl-4 sm:flex">
        <TrackStrip />
      </div>

      <div className="shrink-0 border-l border-cream/10 pl-4">
        <UserMenu />
      </div>
    </div>
  );
};
