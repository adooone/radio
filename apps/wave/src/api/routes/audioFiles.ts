import { audioFileHandlers } from '@/api/handlers/audioFileHandlers';
import { authMiddleware } from '@/services/auth';
import { Hono } from 'hono';

type Variables = {
  accountId: number;
};

const audioFilesRoutes = new Hono<{ Variables: Variables }>();

audioFilesRoutes.get('/:id', audioFileHandlers.getAudioFileHandler);

audioFilesRoutes.get('/:id/stream', audioFileHandlers.streamAudioFileHandler);

audioFilesRoutes.delete(
  '/:id',
  authMiddleware,
  audioFileHandlers.deleteAudioFileHandler,
);

export { audioFilesRoutes };
