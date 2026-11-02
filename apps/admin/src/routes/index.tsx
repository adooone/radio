import { createRoute } from '@tanstack/react-router';
import { OnAirPage } from '../features';
import { Root } from './root';

export const indexRoute = createRoute({
  getParentRoute: () => Root,
  path: '/',
  component: OnAirPage,
});
