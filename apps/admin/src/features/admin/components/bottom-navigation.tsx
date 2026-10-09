import { NavigationIsland } from '@/components';
import { Link } from '@tanstack/react-router';
import { NowPlaying, RadioLogo, UserMenu } from './';

interface BottomNavigationProps {
  currentRoute: string;
}

export const BottomNavigation = ({ currentRoute }: BottomNavigationProps) => {
  const navItems = [
    { path: '/', label: 'Головна' },
    { path: '/collection', label: 'Колекція' },
    { path: '/users', label: 'Користувачі' },
    { path: '/stream-control', label: 'Стрім' },
    { path: '/digitization', label: 'Оцифровка' },
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
