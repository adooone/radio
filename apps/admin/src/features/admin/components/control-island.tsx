import { LampButton } from '@dendelion/func-ui';
import { useNavigate } from '@tanstack/react-router';
import { NowPlaying } from './now-playing';
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

export const ControlIsland = ({ currentRoute }: ControlIslandProps) => {
  const navigate = useNavigate();

  return (
    <div className="island-dock">
      <div className="control-island relative flex max-w-full items-center gap-4 rounded-full border border-cream/10 py-2 pr-3 pl-2">
        <button
          type="button"
          aria-label="Ефір"
          onClick={() => navigate({ to: '/' })}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ink ring-1 ring-cream/15"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-glow">
            <span className="size-1.5 rounded-full bg-ink" />
          </span>
        </button>

        <nav className="flex shrink-0 items-center gap-2 border-l border-cream/10 pl-4">
          {NAV_ITEMS.map((item) => {
            const active = isActive(currentRoute, item.path);
            return (
              <LampButton
                key={item.path}
                tone={active ? 'red' : 'dark'}
                size="sm"
                aria-current={active ? 'page' : undefined}
                onClick={() => navigate({ to: item.path })}
                className={active ? 'text-ink' : 'text-cream'}
              >
                {item.label}
              </LampButton>
            );
          })}
        </nav>

        <div className="hidden min-w-0 shrink items-center border-l border-cream/10 pl-4 sm:flex">
          <NowPlaying />
        </div>

        <div className="shrink-0 border-l border-cream/10 pl-4">
          <UserMenu />
        </div>
      </div>
    </div>
  );
};
