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
