import { createRouter } from '@tanstack/react-router';
import { collectionRoute } from './routes/collection';
import { digitizationRoute } from './routes/digitization';
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
  ]),
});

export default router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
