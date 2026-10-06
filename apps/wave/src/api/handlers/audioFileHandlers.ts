import { audioFileService } from '@/services/audioFiles';
import { ResponseHelper } from '@/utils/response';
import { withErrorHandling } from '@/utils/routeHandler';
import type { Context } from 'hono';

export const audioFileHandlers = {
  get getAudioFileHandler() {
    return withErrorHandling(async (c: Context) => {
      const id = Number.parseInt(c.req.param('id'));
      const audioFile = await audioFileService.getAudioFileById(id);
      return ResponseHelper.success(c, audioFile);
    });
  },

  get streamAudioFileHandler() {
    return withErrorHandling(async (c: Context) => {
      const id = Number.parseInt(c.req.param('id'));
      const stream = await audioFileService.streamAudioFile(id);

      return new Response(stream.buffer, {
        headers: {
          'Content-Type': stream.mimeType,
          'Content-Length': stream.size.toString(),
          'Accept-Ranges': 'bytes',
        },
      });
    });
  },

  get deleteAudioFileHandler() {
    return withErrorHandling(async (c: Context) => {
      const id = Number.parseInt(c.req.param('id'));
      const accountId = c.get('accountId') as number;

      await audioFileService.deleteAudioFile(id, accountId);
      return ResponseHelper.message(c, 'Audio file deleted successfully');
    });
  },
};
