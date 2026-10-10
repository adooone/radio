import clsx from 'clsx';
import type { ComponentType, FC, ReactNode } from 'react';

export interface NavigationItem {
  path: string;
  label: string;
  icon?: ReactNode;
}

export interface NavigationLinkProps {
  to: string;
  className?: string;
  children: ReactNode;
}

export interface NavigationIslandProps {
  items: NavigationItem[];
  currentPath: string;
  logo?: ReactNode;
  actions?: ReactNode;
  className?: string;
  linkComponent?: ComponentType<NavigationLinkProps>;
}

export const NavigationIsland: FC<NavigationIslandProps> = ({
  items,
  currentPath,
  logo,
  actions,
  className,
  linkComponent: LinkComponent,
}) => {
  const renderLink = (item: NavigationItem, isActive: boolean) => {
    const linkClassName = clsx(
      'flex flex-col items-center gap-1 rounded-full border border-transparent px-4 py-2 text-gray-400 no-underline transition-colors hover:bg-white/5 hover:text-white',
      isActive &&
        'border-sun/40 bg-gradient-to-b from-sun/25 to-sun/15 text-sun shadow-md',
    );

    const linkContent = (
      <>
        {item.icon && (
          <span className="flex h-5 w-5 items-center justify-center">
            {item.icon}
          </span>
        )}
        <span className="whitespace-nowrap font-display text-sm font-medium uppercase tracking-wide">
          {item.label}
        </span>
      </>
    );

    if (LinkComponent) {
      return (
        <LinkComponent key={item.path} to={item.path} className={linkClassName}>
          {linkContent}
        </LinkComponent>
      );
    }

    return (
      <a key={item.path} href={item.path} className={linkClassName}>
        {linkContent}
      </a>
    );
  };

  return (
    <div
      className={clsx(
        'fixed bottom-6 left-1/2 z-50 -translate-x-1/2',
        className,
      )}
    >
      <div className="min-w-fit rounded-full border border-white/10 bg-stone-950/90 px-4 py-3 shadow-2xl backdrop-blur-2xl transition-shadow hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)]">
        <nav className="flex items-center justify-between gap-4">
          {logo && (
            <div className="flex items-center gap-4 border-r border-white/10 pr-4">
              {logo}
            </div>
          )}

          <div className="flex items-center gap-2">
            {items.map((item) =>
              renderLink(
                item,
                currentPath === item.path ||
                  currentPath.startsWith(`${item.path}/`),
              ),
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-4 border-l border-white/10 pl-4">
              {actions}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};
