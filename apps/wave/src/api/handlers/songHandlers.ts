import { songService } from '@/services/albums';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import { commonSchemas } from '@/utils/validation';
import type { Context } from 'hono';

export const songHandlers = {
  get getSongsByAlbumHandler() {
    return withErrorHandling(async (c: Context) => {
      const albumId = commonSchemas.id.parse(c.req.param('albumId'));
      const songs = await songService.getSongsByAlbum(albumId);
      return ResponseHelper.success(c, songs);
    });
  },

  get addSongToAlbumHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const albumId = commonSchemas.id.parse(c.req.param('albumId'));
        const data = await c.req.json();

        const songId = await songService.addSongToAlbum(
          albumId,
          accountId,
          data.audioFileId,
          {
            trackNumber: data.trackNumber,
            title: data.title,
            artist: data.artist,
          },
        );

        return ResponseHelper.success(c, { id: songId }, 201);
      },
    );
  },

  get updateSongHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const id = commonSchemas.id.parse(c.req.param('id'));
        const data = await c.req.json();

        await songService.updateSong(id, accountId, data);
        return ResponseHelper.message(c, 'Song updated successfully');
      },
    );
  },

  get deleteSongHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const id = commonSchemas.id.parse(c.req.param('id'));

        await songService.deleteSong(id, accountId);
        return ResponseHelper.message(c, 'Song deleted successfully');
      },
    );
  },

  get reorderSongsHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const albumId = commonSchemas.id.parse(c.req.param('albumId'));
        const { songs } = await c.req.json();

        await songService.reorderSongs(albumId, accountId, songs);
        return ResponseHelper.message(c, 'Songs reordered successfully');
      },
    );
  },
};
