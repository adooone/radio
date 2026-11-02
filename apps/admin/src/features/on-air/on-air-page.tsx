import { useWebSocket } from '@/hooks/use-websocket';
import { Journal, ServiceCards, TurntablePanel } from './components';

export const OnAirPage = () => {
  useWebSocket({ autoConnect: true });

  return (
    <div className="grid h-full grid-cols-[2fr_1fr] gap-[var(--gutter)] px-[var(--gutter)] pt-[calc(var(--gutter)*0.8+7rem)]">
      <div className="flex min-h-0 flex-col gap-10 overflow-y-auto pb-8 [scrollbar-width:none]">
        <TurntablePanel />
        <ServiceCards />
      </div>
      <div className="min-h-0 overflow-y-auto pb-8 [scrollbar-width:none]">
        <Journal />
      </div>
    </div>
  );
};
