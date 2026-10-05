import { useNotificationStore } from '@/stores/notification-store';
import clsx from 'clsx';
import type React from 'react';

export const GlobalLoadingIndicator: React.FC = () => {
  const { loadingStates } = useNotificationStore();

  if (loadingStates.length === 0) {
    return null;
  }

  const primaryLoading = loadingStates[0]; // Show the first loading state
  const totalLoading = loadingStates.length;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
      <div
        className={clsx(
          'bg-coal-deep/95 backdrop-blur-sm border border-amber-400/30 rounded-full px-6 py-3',
          'shadow-lg shadow-amber-400/10 transition-all duration-300',
          'flex items-center space-x-3',
        )}
      >
        {/* Spinner */}
        <div className="relative">
          <div className="w-5 h-5 border-2 border-amber-400/30 rounded-full animate-spin">
            <div className="absolute inset-0 border-2 border-transparent border-t-amber-400 rounded-full" />
          </div>
        </div>

        {/* Loading message */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-amber-400">
            {primaryLoading.message}
          </span>
          {totalLoading > 1 && (
            <span className="text-xs text-amber-400/70">
              +{totalLoading - 1} more operation{totalLoading > 2 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Progress bar if available */}
        {primaryLoading.progress !== undefined && (
          <div className="w-20 h-1.5 bg-coal-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300 ease-out"
              style={{ width: `${primaryLoading.progress}%` }}
            />
          </div>
        )}

        {/* Count indicator */}
        {totalLoading > 1 && (
          <div className="bg-amber-400/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
            {totalLoading}
          </div>
        )}
      </div>
    </div>
  );
};
