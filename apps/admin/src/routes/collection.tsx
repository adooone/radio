import { createRoute } from '@tanstack/react-router';
import { CollectionPage } from '../features';
import { Root } from './root';

export const collectionRoute = createRoute({
  getParentRoute: () => Root,
  path: '/collection',
  component: CollectionPage,
});
