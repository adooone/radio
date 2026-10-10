import { createRouter } from '@tanstack/react-router';
import { collectionRoute } from './routes/collection';
import { digitizationRoute } from './routes/digitization';
import { digitizationDetailRoute } from './routes/digitization-detail';
import { indexRoute } from './routes/index';
import { Root } from './routes/root';
import { streamControlRoute } from './routes/stream-control';
import { userManagementRoute } from './routes/user-management';

const router = createRouter({
  routeTree: Root.addChildren([
    indexRoute,
    collectionRoute,
    userManagementRoute,
    streamControlRoute,
    digitizationRoute,
    digitizationDetailRoute,
  ]),
  scrollRestoration: true,
  // The layout scrolls an inner div, not window — point forward-navigation
  // scroll-to-top at it, or pages open pre-scrolled to the previous offset.
  scrollToTopSelectors: ['[data-scroll-restoration-id="admin-content"]'],
});

export default router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
