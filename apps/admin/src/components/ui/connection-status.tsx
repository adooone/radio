import { useWebSocket } from '@/hooks/use-websocket';
import { isSocketUrlConfigured } from '@/services/env';
import clsx from 'clsx';
import type React from 'react';

export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionState } = useWebSocket();

  if (!isSocketUrlConfigured) {
    return null;
  }

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-moss-400';
      case 'connecting':
        return 'text-amber-400';
      case 'disconnected':
      case 'error':
        return 'text-red-400';
      default:
        return 'text-white/40';
    }
  };

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <div
        className={clsx(
          'flex items-center space-x-2 px-3 py-2 rounded-full',
          'bg-coal-deep/80 backdrop-blur-sm border border-white/10',
          'shadow-lg transition-all duration-300',
        )}
      >
        {/* Status indicator dot */}
        <div className="relative">
          <div
            className={clsx(
              'w-2 h-2 rounded-full transition-colors duration-300',
              getStatusColor().replace('text-', 'bg-'),
            )}
          />
          {isConnected && (
            <div
              className={clsx(
                'absolute inset-0 w-2 h-2 rounded-full animate-ping',
                getStatusColor().replace('text-', 'bg-'),
                'opacity-75',
              )}
            />
          )}
        </div>

        {/* Status text */}
        <span
          className={clsx(
            'text-xs font-medium transition-colors duration-300',
            getStatusColor(),
          )}
        >
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};
