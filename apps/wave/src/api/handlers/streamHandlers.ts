import { airStatus } from '@/services/stream/airStatus';
import { onAirService } from '@/services/stream/onAirService';
import { rotationService } from '@/services/stream/rotationService';
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
      // Interrupts the station's rotation, which resumes after the record.
      await rotationService.playAlbum(albumId, songId);
      return ResponseHelper.success(c, onAirService.getOnAir());
    });
  },

  /** Takes the record off: silence — the rotation goes off too, the mark clears. */
  get clearOnAirHandler() {
    return withErrorHandling(async (c: Context) => {
      await rotationService.disable();
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

  /**
   * Stops the sound but keeps the mark — the record stays "on air" as a
   * label. The rotation goes off too, or its watchdog would play again.
   */
  get stopTurntableHandler() {
    return withErrorHandling(async (c: Context) => {
      await rotationService.disable();
      const wasPlaying = turntableService.stop();
      return ResponseHelper.message(
        c,
        wasPlaying ? 'Turntable stopped' : 'Turntable was not playing',
      );
    });
  },

  get getRotationHandler() {
    return withErrorHandling(async (c: Context) => {
      return ResponseHelper.success(c, await rotationService.getState());
    });
  },

  /** `{ enabled }`: the station on or off. */
  get setRotationHandler() {
    return withErrorHandling(async (c: Context) => {
      const { enabled } = (await c.req.json()) as { enabled: boolean };
      const state = enabled
        ? await rotationService.enable()
        : await rotationService.disable();
      return ResponseHelper.success(c, state);
    });
  },

  get skipRotationHandler() {
    return withErrorHandling(async (c: Context) => {
      return ResponseHelper.success(c, await rotationService.skip());
    });
  },

  /** `{ songId }`: plays after the current track. */
  get playNextHandler() {
    return withErrorHandling(async (c: Context) => {
      const { songId } = (await c.req.json()) as { songId: number };
      return ResponseHelper.success(c, await rotationService.playNext(songId));
    });
  },
};
