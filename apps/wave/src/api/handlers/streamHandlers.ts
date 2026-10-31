import { airStatus } from '@/services/stream/airStatus';
import { onAirService } from '@/services/stream/onAirService';
import { turntableService } from '@/services/stream/turntableService';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import type { Context } from 'hono';

/** Whether a publisher other than the turntable holds the stream. */
const liveElsewhere = async () =>
  turntableService.getState().status !== 'playing' &&
  (await airStatus.isLive());

export const streamHandlers = {
  get getOnAirHandler() {
    return withErrorHandling(async (c: Context) => {
      return ResponseHelper.success(c, onAirService.getOnAir());
    });
  },

  /**
   * Puts the record on: played by the turntable when the air is free,
   * marked only while OBS is live.
   */
  get setOnAirHandler() {
    return withErrorHandling(async (c: Context) => {
      const { albumId, songId } = (await c.req.json()) as {
        albumId: number;
        songId?: number;
      };

      if (await liveElsewhere()) {
        const state = await onAirService.setOnAir(albumId, songId, 'admin');
        return ResponseHelper.success(c, state);
      }
      await turntableService.play(albumId, songId);
      return ResponseHelper.success(c, onAirService.getOnAir());
    });
  },

  /** Takes the record off: stops the turntable and clears the mark. */
  get clearOnAirHandler() {
    return withErrorHandling(async (c: Context) => {
      turntableService.stop();
      onAirService.clearOnAir();
      return ResponseHelper.message(c, 'On-air state cleared successfully');
    });
  },

  get getTurntableHandler() {
    return withErrorHandling(async (c: Context) => {
      const state = turntableService.getState();
      return ResponseHelper.success(c, {
        ...state,
        live: await liveElsewhere(),
      });
    });
  },

  /** Stops the sound but keeps the mark — the record stays "on air" as a label. */
  get stopTurntableHandler() {
    return withErrorHandling(async (c: Context) => {
      const wasPlaying = turntableService.stop();
      return ResponseHelper.message(
        c,
        wasPlaying ? 'Turntable stopped' : 'Turntable was not playing',
      );
    });
  },
};
