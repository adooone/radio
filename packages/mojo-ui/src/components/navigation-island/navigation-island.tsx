import clsx from 'clsx';
import type { ComponentType, FC, ReactNode } from 'react';
import styles from './navigation-island.module.scss';

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
  /** Navigation items */
  items: NavigationItem[];
  /** Current active path */
  currentPath: string;
  /** Logo or brand element (left side) */
  logo?: ReactNode;
  /** Actions or user menu (right side) */
  actions?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Custom link component (e.g., React Router's Link) */
  linkComponent?: ComponentType<NavigationLinkProps>;
}

/**
 * NavigationIsland - A floating navigation bar with glass morphism effect
 *
 * @example
 * ```tsx
 * // With default anchor tags
 * <NavigationIsland
 *   items={[
 *     { path: '/', label: 'Home' },
 *     { path: '/collection', label: 'Collection' },
 *   ]}
 *   currentPath="/"
 * />
 *
 * // With React Router
 * <NavigationIsland
 *   items={[...]}
 *   currentPath="/"
 *   linkComponent={Link}
 * />
 * ```
 */
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
      styles.navLink,
      isActive && styles.navLinkActive,
    );

    const linkContent = (
      <>
        {item.icon && <span className={styles.icon}>{item.icon}</span>}
        <span className={styles.label}>{item.label}</span>
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
    <div className={clsx(styles.container, className)}>
      <div className={styles.island}>
        <nav className={styles.nav}>
          {/* Left Section - Logo */}
          {logo && <div className={styles.leftSection}>{logo}</div>}

          {/* Center Section - Navigation Links */}
          <div className={styles.centerSection}>
            {items.map((item) => {
              const isActive = currentPath === item.path;
              return renderLink(item, isActive);
            })}
          </div>

          {/* Right Section - Actions */}
          {actions && <div className={styles.rightSection}>{actions}</div>}
        </nav>
      </div>
    </div>
  );
};

NavigationIsland.displayName = 'NavigationIsland';
