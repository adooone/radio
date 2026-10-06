import { createRouter } from '@tanstack/react-router';
import { collectionRoute } from './routes/collection';
import { homeRoute } from './routes/home';
import { Root } from './routes/root';

const router = createRouter({
  routeTree: Root.addChildren([homeRoute, collectionRoute]),
});

export default router;
