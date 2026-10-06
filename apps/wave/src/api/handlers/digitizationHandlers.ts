import { syncMediaToDatabase } from '@/services/albums';
import {
  applySplits,
  completeUpload,
  createDraft,
  deleteDraftFolder,
  deleteDraftSideWavs,
  encodeDraft,
  fetchAndSaveDraftMetadata,
  getDraft,
  getDraftCover,
  getJob,
  getUploadStatus,
  initUpload,
  listDrafts,
  planSplits,
  resolveDraftAudioPath,
  runJob,
  searchReleases,
  writeChunk,
  writeDraftMetadata,
} from '@/services/digitization';
import { env } from '@/utils/env';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import { digitizationSchemas } from '@/utils/validation';
import type { Context } from 'hono';

function parseRangeHeader(
  range: string,
  size: number,
): { start: number; end: number } | undefined {
  const match = range.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) {
    return undefined;
  }
  const start = match[1] ? Number(match[1]) : size - Number(match[2]);
  const end = match[1] && match[2] ? Number(match[2]) : size - 1;
  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    start > end ||
    start >= size
  ) {
    return undefined;
  }
  return { start, end: Math.min(end, size - 1) };
}

export const digitizationHandlers = {
  get listDraftsHandler() {
    return withErrorHandling(async (c: Context) => {
      const drafts = listDrafts(env.mediaInboxPath, env.mediaRootPath);
      return ResponseHelper.success(c, drafts);
    });
  },

  get createDraftHandler() {
    return withErrorHandling(async (c: Context) => {
      const input = digitizationSchemas.createDraft.parse(await c.req.json());
      const draft = createDraft(env.mediaInboxPath, env.mediaRootPath, input);
      return ResponseHelper.created(c, draft);
    });
  },

  get initUploadHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const { filename, size, chunkSize } =
        digitizationSchemas.uploadInit.parse(await c.req.json());
      const session = initUpload(
        env.mediaInboxPath,
        slug,
        filename,
        size,
        chunkSize,
      );
      return ResponseHelper.created(c, session);
    });
  },

  get putUploadChunkHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const uploadId = c.req.param('uploadId');
      const chunkIndex = Number.parseInt(c.req.param('n'), 10);
      const data = Buffer.from(await c.req.arrayBuffer());
      writeChunk(env.mediaInboxPath, slug, uploadId, chunkIndex, data);
      return ResponseHelper.success(c, { received: chunkIndex });
    });
  },

  get getUploadStatusHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const uploadId = c.req.param('uploadId');
      const session = getUploadStatus(env.mediaInboxPath, slug, uploadId);
      return ResponseHelper.success(c, session);
    });
  },

  get completeUploadHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const uploadId = c.req.param('uploadId');
      const result = await completeUpload(env.mediaInboxPath, slug, uploadId);
      return ResponseHelper.success(c, result);
    });
  },

  get getDraftHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const draft = getDraft(env.mediaInboxPath, env.mediaRootPath, slug);
      return ResponseHelper.success(c, draft);
    });
  },

  get getDraftCoverHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const cover = getDraftCover(env.mediaInboxPath, slug);

      return new Response(cover.buffer, {
        headers: {
          'Content-Type': cover.mimeType,
          'Content-Length': cover.size.toString(),
          'Cache-Control': 'private, max-age=3600',
        },
      });
    });
  },

  get fetchDraftMetadataHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const { release, force } = digitizationSchemas.fetchMetadata.parse(
        await c.req.json(),
      );
      const data = await fetchAndSaveDraftMetadata(
        env.mediaInboxPath,
        slug,
        release,
        { force, token: env.discogsToken },
      );
      return ResponseHelper.success(c, data);
    });
  },

  get updateDraftMetadataHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const data = digitizationSchemas.updateMetadata.parse(await c.req.json());
      const saved = writeDraftMetadata(env.mediaInboxPath, slug, data);
      return ResponseHelper.success(c, saved);
    });
  },

  get searchDiscogsHandler() {
    return withErrorHandling(async (c: Context) => {
      const { q } = digitizationSchemas.search.parse({
        q: c.req.query('q'),
      });
      const results = await searchReleases(q, env.discogsToken);
      return ResponseHelper.success(c, results);
    });
  },

  get planSplitHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const { noise, minSilence, tolerance, manualCuts } =
        digitizationSchemas.splitPlan.parse(await c.req.json());
      const result = await planSplits(env.mediaInboxPath, slug, {
        noiseDb: noise,
        minSilence,
        tolerance,
        manualCuts,
      });
      return ResponseHelper.success(c, result);
    });
  },

  get applySplitHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const { sides } = digitizationSchemas.splitApply.parse(
        await c.req.json(),
      );
      const result = await applySplits(env.mediaInboxPath, slug, sides);
      return ResponseHelper.success(c, result);
    });
  },

  get getDraftAudioHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const file = c.req.param('file');
      const filePath = resolveDraftAudioPath(env.mediaInboxPath, slug, file);
      const audioFile = Bun.file(filePath);
      const size = audioFile.size;
      const range = c.req.header('range');

      if (!range) {
        return new Response(audioFile, {
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Length': size.toString(),
            'Accept-Ranges': 'bytes',
          },
        });
      }

      const parsed = parseRangeHeader(range, size);
      if (!parsed) {
        return new Response(null, {
          status: 416,
          headers: { 'Content-Range': `bytes */${size}` },
        });
      }

      return new Response(audioFile.slice(parsed.start, parsed.end + 1), {
        status: 206,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': (parsed.end - parsed.start + 1).toString(),
          'Content-Range': `bytes ${parsed.start}-${parsed.end}/${size}`,
          'Accept-Ranges': 'bytes',
        },
      });
    });
  },

  get publishDraftHandler() {
    return withErrorHandling(
      async (c: Context<{ Variables: { accountId: number } }>) => {
        const slug = c.req.param('slug');
        const accountId = c.get('accountId');
        const job = runJob('publish', `publish:${slug}`, async (log) => {
          const encodeResult = await encodeDraft(
            env.mediaInboxPath,
            env.mediaRootPath,
            slug,
            log,
          );
          log('encoding done, syncing media library...');
          const syncResult = await syncMediaToDatabase(
            env.mediaRootPath,
            env.mediaBaseUrl,
            accountId,
          );
          log('published');
          return { encode: encodeResult, sync: syncResult };
        });
        return ResponseHelper.success(c, job);
      },
    );
  },

  get cleanupDraftHandler() {
    return withErrorHandling(async (c: Context) => {
      const slug = c.req.param('slug');
      const { target } = digitizationSchemas.cleanup.parse(await c.req.json());
      if (target === 'folder') {
        deleteDraftFolder(env.mediaInboxPath, env.mediaRootPath, slug);
        return ResponseHelper.success(c, { deletedFolder: true });
      }
      const deleted = deleteDraftSideWavs(
        env.mediaInboxPath,
        env.mediaRootPath,
        slug,
      );
      return ResponseHelper.success(c, { deletedFiles: deleted });
    });
  },

  get getJobHandler() {
    return withErrorHandling(async (c: Context) => {
      const id = c.req.param('id');
      const job = getJob(id);
      return ResponseHelper.success(c, job);
    });
  },
};
