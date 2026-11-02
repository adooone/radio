import { Split } from '@/features/admin/split';
import { useWebSocket } from '@/hooks/use-websocket';
import { AirFigures, CornerStatus, OnAirSlab, Turntable } from './components';

/** «Ефір»: what is on air, on the left; the station's journal, on the slab. */
export const OnAirPage = () => {
  useWebSocket({ autoConnect: true });

  return (
    <Split
      corner={<CornerStatus />}
      left={
        <div className="work-scroll flex flex-col gap-10">
          <Turntable />
          <AirFigures />
        </div>
      }
      right={
        <div className="slab-scroll">
          <OnAirSlab />
        </div>
      }
    />
  );
};
