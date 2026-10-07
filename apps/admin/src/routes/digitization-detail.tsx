import { createRoute } from '@tanstack/react-router';
import { DraftDetailPage } from '../features';
import { Root } from './root';

export const digitizationDetailRoute = createRoute({
  getParentRoute: () => Root,
  path: '/digitization/$slug',
  component: DraftDetailPage,
});
