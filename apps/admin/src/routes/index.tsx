import { createRoute } from '@tanstack/react-router';
import { MainPage } from '../features';
import { Root } from './root';

export const indexRoute = createRoute({
  getParentRoute: () => Root,
  path: '/',
  component: MainPage,
});
