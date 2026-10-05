import { RadioLayout } from '@/features';
import { createRoute } from '@tanstack/react-router';
import { Root } from './root';

const Home = () => {
  return <RadioLayout />;
};

export const homeRoute = createRoute({
  getParentRoute: () => Root,
  path: '/',
  component: Home,
});
