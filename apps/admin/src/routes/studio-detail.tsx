import { createRoute } from '@tanstack/react-router';
import { DraftDetailPage } from '../features';
import { Root } from './root';

export const studioDetailRoute = createRoute({
  getParentRoute: () => Root,
  path: '/studio/$slug',
  component: DraftDetailPage,
});
