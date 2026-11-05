import { useWebSocket } from '@/hooks/use-websocket';
import { isSocketUrlConfigured } from '@/services/env';
import { StatusDot } from '@dendelion/func-ui';
import type React from 'react';

const WORDS: Record<string, string> = {
  connected: 'на звʼязку',
  connecting: 'зʼєднання…',
  disconnected: 'без звʼязку',
  error: 'помилка звʼязку',
};

/** Wave's live line, in the corner under the slab: a light and a word. */
export const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionState } = useWebSocket();

  if (!isSocketUrlConfigured) return null;

  return (
    <div className="fixed right-10 bottom-[3.5vmin] z-30 flex items-center gap-2">
      <StatusDot
        variant={isConnected ? 'error' : 'neutral'}
        pulse={isConnected}
      />
      <span className="type-label text-cream/45">
        {WORDS[connectionState] ?? connectionState}
      </span>
    </div>
  );
};
