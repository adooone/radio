import { createRoute } from '@tanstack/react-router';
import { DigitizationPage } from '../features';
import { Root } from './root';

export const studioRoute = createRoute({
  getParentRoute: () => Root,
  path: '/studio',
  component: DigitizationPage,
});
