import { join } from 'node:path';

// Mock file system data
const mockFiles: Record<string, string> = {
  [join('./data', 'telegram-stream-status.json')]: JSON.stringify({
    status: 'running',
    pid: 12345,
    timestamp: '2024-01-15T10:29:00.000Z',
    ffmpegPid: 12346,
    restartAttempts: 0,
    streamHealth: {
      isConnected: true,
      lastConnectionTime: '2024-01-15T10:25:00.000Z',
      totalFramesSent: 15420,
      currentBitrate: 2500,
      connectionErrors: 0,
      lastHealthCheck: '2024-01-15T10:29:30.000Z',
    },
  }),
};

// Mock readFile
export const readFile = async (
  filePath: string,
  encoding: string,
): Promise<string> => {
  const content = mockFiles[filePath];
  if (content === undefined) {
    throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
  }
  return content;
};

// Mock existsSync
export const existsSync = (filePath: string): boolean => {
  return mockFiles[filePath] !== undefined;
};

// Helper to set mock file content
export const setMockFile = (filePath: string, content: string) => {
  mockFiles[filePath] = content;
};

// Helper to remove mock file
export const removeMockFile = (filePath: string) => {
  delete mockFiles[filePath];
};

// Helper to clear all mock files
export const clearMockFiles = () => {
  for (const key of Object.keys(mockFiles)) {
    delete mockFiles[key];
  }
};
