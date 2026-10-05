import { createRoute } from '@tanstack/react-router';
import { StreamControlPage } from '../features';
import { Root } from './root';

export const streamControlRoute = createRoute({
  getParentRoute: () => Root,
  path: '/stream-control',
  component: StreamControlPage,
});
