import { createRoute, redirect } from '@tanstack/react-router';
import { Root } from './root';

export const digitizationRedirectRoute = createRoute({
  getParentRoute: () => Root,
  path: '/digitization',
  beforeLoad: () => {
    throw redirect({ to: '/studio' });
  },
});

export const digitizationDetailRedirectRoute = createRoute({
  getParentRoute: () => Root,
  path: '/digitization/$slug',
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/studio/$slug', params });
  },
});

export const streamControlRedirectRoute = createRoute({
  getParentRoute: () => Root,
  path: '/stream-control',
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
});

export const usersRedirectRoute = createRoute({
  getParentRoute: () => Root,
  path: '/users',
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
});
