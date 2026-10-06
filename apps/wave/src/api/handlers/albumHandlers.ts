import { albumService, syncMediaToDatabase } from '@/services/albums';
import { authService } from '@/services/auth';
import { env } from '@/utils/env';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import { commonSchemas } from '@/utils/validation';
import type { Context } from 'hono';

export const albumHandlers = {
  get getPublicAlbumsHandler() {
    return withErrorHandling(async (c: Context) => {
      const { limit, offset } = commonSchemas.pagination.parse({
        limit: c.req.query('limit'),
        offset: c.req.query('offset'),
      });

      const filters = {
        artist: c.req.query('artist'),
        year: c.req.query('year')
          ? Number.parseInt(c.req.query('year') as string)
          : undefined,
        tags: c.req.query('tags')?.split(','),
        search: c.req.query('search'),
      };

      const hasFilters = Object.values(filters).some(
        (v) => v !== undefined && v !== null,
      );

      const albums = hasFilters
        ? await albumService.getPublicAlbumsWithFilters(filters, limit, offset)
        : await albumService.getPublicAlbums(limit, offset);

      return ResponseHelper.success(c, albums);
    });
  },

  get getUserAlbumsHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const { limit, offset } = commonSchemas.pagination.parse({
          limit: c.req.query('limit'),
          offset: c.req.query('offset'),
        });

        const albums = await albumService.getUserAlbums(
          accountId,
          limit,
          offset,
        );
        return ResponseHelper.success(c, albums);
      },
    );
  },

  get getAlbumByIdHandler() {
    return withErrorHandling(async (c: Context) => {
      const id = commonSchemas.id.parse(c.req.param('id'));
      const album = await albumService.getAlbumById(id);

      const authHeader = c.req.header('Authorization');
      let accountId: number | undefined;

      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const session = await authService.validateToken(token);
        if (session) {
          accountId = session.accountId;
        }
      }

      await albumService.checkAlbumAccess(album, accountId);
      const albumWithSongs = await albumService.getAlbumWithSongs(id);

      return ResponseHelper.success(c, albumWithSongs);
    });
  },

  get createAlbumHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const data = await c.req.json();

        const albumId = await albumService.createAlbum(accountId, data);
        return ResponseHelper.success(c, { id: albumId }, 201);
      },
    );
  },

  get updateAlbumHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const id = commonSchemas.id.parse(c.req.param('id'));
        const data = await c.req.json();

        await albumService.updateAlbum(id, accountId, data);
        return ResponseHelper.message(c, 'Album updated successfully');
      },
    );
  },

  get deleteAlbumHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const id = commonSchemas.id.parse(c.req.param('id'));

        await albumService.deleteAlbum(id, accountId);
        return ResponseHelper.message(c, 'Album deleted successfully');
      },
    );
  },

  get uploadCoverArtHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const id = commonSchemas.id.parse(c.req.param('id'));
        const body = await c.req.parseBody();

        const file = body.cover as File;
        if (!file) {
          return ResponseHelper.error(c, 'No cover image provided', 400);
        }

        const result = await albumService.uploadCoverArt(id, accountId, file);
        return ResponseHelper.success(c, result);
      },
    );
  },

  get getCoverArtHandler() {
    return withErrorHandling(async (c: Context) => {
      const id = commonSchemas.id.parse(c.req.param('id'));
      const cover = await albumService.getCoverArt(id);

      return new Response(cover.buffer, {
        headers: {
          'Content-Type': cover.mimeType,
          'Content-Length': cover.size.toString(),
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    });
  },

  get getAlbumPhotosHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const id = commonSchemas.id.parse(c.req.param('id'));
        const album = await albumService.getAlbumById(id);
        await authService.requireOwnershipOrAdmin(accountId, album.ownerId);
        const photos = await albumService.listAlbumPhotos(id);
        return ResponseHelper.success(c, { photos });
      },
    );
  },

  get getAlbumPhotoHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');
        const id = commonSchemas.id.parse(c.req.param('id'));
        const filename = c.req.param('filename');
        if (!filename) {
          return ResponseHelper.error(c, 'Filename required', 400);
        }
        const album = await albumService.getAlbumById(id);
        await authService.requireOwnershipOrAdmin(accountId, album.ownerId);
        const photo = await albumService.getAlbumPhoto(id, filename);
        return new Response(photo.buffer, {
          headers: {
            'Content-Type': photo.mimeType,
            'Content-Length': photo.size.toString(),
            'Cache-Control': 'private, max-age=3600',
          },
        });
      },
    );
  },

  get syncMediaHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const accountId = c.get('accountId');

        const result = await syncMediaToDatabase(
          env.mediaRootPath,
          env.mediaBaseUrl,
          accountId,
        );

        if (result.errors.length > 0) {
          return c.json(
            {
              success: true,
              message: 'Media sync completed with warnings',
              data: result,
            },
            200,
          );
        }

        return ResponseHelper.success(c, result);
      },
    );
  },
};
