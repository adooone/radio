import { promisify } from 'node:util';

// Mock data for different commands
const mockResponses: Record<string, { stdout: string; stderr?: string }> = {
  'pm2 jlist': {
    stdout: JSON.stringify([
      {
        name: 'telegram-stream',
        pid: 12345,
        pm2_env: {
          status: 'online',
          pm_uptime: 1641981000000,
        },
        monit: {
          cpu: 15.2,
          memory: 125829120,
        },
      },
    ]),
  },
  'docker ps --filter "name=rtmp-server" --format "{{.Status}}"': {
    stdout: 'Up 2 hours (healthy)',
  },
  'docker stats rtmp-server --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}}"':
    {
      stdout: '5.2%,128MiB / 2GiB,6.25%,1.23kB / 4.56MB',
    },
  "docker exec rtmp-server curl -s http://localhost:8080/stat 2>/dev/null || echo '{}'":
    {
      stdout: '{}',
    },
  'pgrep -f "ffmpeg.*rtmps://dc4-1.rtmp.t.me"': {
    stdout: '12346',
  },
};

// Mock exec function
const mockExec = (
  command: string,
  callback?: (error: Error | null, stdout: string, stderr: string) => void,
) => {
  const response = mockResponses[command] || { stdout: '', stderr: '' };

  if (callback) {
    // Simulate async behavior
    setTimeout(() => {
      callback(null, response.stdout, response.stderr || '');
    }, 10);
  }

  return {
    stdout: response.stdout,
    stderr: response.stderr || '',
  };
};

// Mock execAsync (promisified version)
const mockExecAsync = async (command: string) => {
  const response = mockResponses[command] || { stdout: '', stderr: '' };
  return {
    stdout: response.stdout,
    stderr: response.stderr || '',
  };
};

// Export mocks
export const exec = mockExec;
export const execAsync = promisify(mockExec);

// Helper to update mock responses for testing
export const setMockResponse = (
  command: string,
  response: { stdout: string; stderr?: string },
) => {
  mockResponses[command] = response;
};

// Helper to simulate command failures
export const simulateCommandFailure = (command: string, error: string) => {
  mockResponses[command] = { stdout: '', stderr: error };
};
