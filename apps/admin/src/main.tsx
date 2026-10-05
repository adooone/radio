import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthGuard } from './components/auth/auth-guard';
import {
  ConnectionStatus,
  GlobalLoadingIndicator,
  NotificationContainer,
} from './components/ui';
import router from './router';
import { queryClient } from './services/api';

// Import styles and fonts
import './styles/index';
import '@fontsource/tiny5';
import '@fontsource/ponomar';
import '@fontsource/jetbrains-mono/800.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthGuard>
        <RouterProvider router={router} />
        <NotificationContainer />
        <GlobalLoadingIndicator />
        <ConnectionStatus />
      </AuthGuard>
    </QueryClientProvider>
  </StrictMode>,
);
