import { Link } from '@tanstack/react-router';
import { NavigationIsland } from '@dendelion/mojo-ui';
import { RadioLogo, NowPlaying, UserMenu } from './';

interface BottomNavigationProps {
  currentRoute: string;
}

export const BottomNavigation = ({ currentRoute }: BottomNavigationProps) => {
  const navItems = [
    { path: '/', label: 'Головна' },
    { path: '/collection', label: 'Колекція' },
    { path: '/users', label: 'Користувачі' },
    { path: '/stream-control', label: 'Стрім' },
  ];

  return (
    <NavigationIsland
      items={navItems}
      currentPath={currentRoute}
      logo={
        <>
          <RadioLogo />
          <NowPlaying />
        </>
      }
      actions={<UserMenu />}
      linkComponent={Link}
    />
  );
};
