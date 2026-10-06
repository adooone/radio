import { CollectionLayout } from '@/features/collection';
import { createRoute } from '@tanstack/react-router';
import { Root } from './root';

const Collection = () => {
  return <CollectionLayout />;
};

export const collectionRoute = createRoute({
  getParentRoute: () => Root,
  path: '/collection',
  component: Collection,
});
