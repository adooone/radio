import { createRoute } from '@tanstack/react-router';
import { DigitizationPage } from '../features';
import { Root } from './root';

export const digitizationRoute = createRoute({
  getParentRoute: () => Root,
  path: '/digitization',
  component: DigitizationPage,
});
