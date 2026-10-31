import 'dotenv/config';
import { join } from 'node:path';

// Determine environment
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Set chat history file based on environment
const getChatHistoryFile = () => {
  const dataDir = join(process.cwd(), 'data');
  if (isProduction) {
    return join(dataDir, 'prod-chats.json');
  }
  return join(dataDir, 'dev-chats.json');
};

export const env = {
  port: Number.parseInt(process.env.PORT || '6870'),
  socketPort: Number.parseInt(process.env.SOCKET_PORT || '6871'),
  environment: isProduction ? 'production' : 'development',
  chatHistoryFile: getChatHistoryFile(),
  dbFileName: process.env.DB_FILE_NAME || 'data/wave.sqlite',
  mediaRootPath: getRequiredEnv('MEDIA_ROOT_PATH'),
  mediaBaseUrl: getRequiredEnv('MEDIA_BASE_URL'),
  mediaInboxPath: getRequiredEnv('MEDIA_INBOX_PATH'),
  discogsToken: process.env.DISCOGS_TOKEN || undefined,
  // The relay the turntable publishes to and the stream the player plays.
  streamKey: process.env.STREAM_KEY || 'test',
  rtmpPublishUrl: process.env.RTMP_PUBLISH_URL || 'rtmp://127.0.0.1:1935/live',
  rtmpHttpUrl: process.env.RTMP_HTTP_URL || 'http://127.0.0.1:8069',
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Please set it in your .env file or environment.`,
    );
  }
  return value;
}
