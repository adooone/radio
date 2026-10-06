import { createRoute } from '@tanstack/react-router';
import { UsersPage } from '../features/users';
import { Root } from './root';

export const userManagementRoute = createRoute({
  getParentRoute: () => Root,
  path: '/users',
  component: UsersPage,
});
