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
