import { createRoute } from '@tanstack/react-router';
import { StreamControlPage } from '../features';
import { Root } from './root';

export const indexRoute = createRoute({
  getParentRoute: () => Root,
  path: '/',
  component: StreamControlPage,
});
