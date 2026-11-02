import { createRouter } from '@tanstack/react-router';
import { collectionRoute } from './routes/collection';
import { indexRoute } from './routes/index';
import {
  digitizationDetailRedirectRoute,
  digitizationRedirectRoute,
  streamControlRedirectRoute,
  usersRedirectRoute,
} from './routes/redirects';
import { Root } from './routes/root';
import { studioRoute } from './routes/studio';
import { studioDetailRoute } from './routes/studio-detail';

const router = createRouter({
  routeTree: Root.addChildren([
    indexRoute,
    collectionRoute,
    studioRoute,
    studioDetailRoute,
    digitizationRedirectRoute,
    digitizationDetailRedirectRoute,
    streamControlRedirectRoute,
    usersRedirectRoute,
  ]),
  // Pages scroll their own columns; the ones that survive a route change
  // carry a data-scroll-restoration-id, so going back lands where you left.
  scrollRestoration: true,
});

export default router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
