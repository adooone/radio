import { afterAll } from 'bun:test';
import childProcess, { type ChildProcess } from 'node:child_process';

const registry = new Set<ChildProcess>();

function track<T extends ChildProcess>(child: T): T {
  registry.add(child);
  child.once('exit', () => registry.delete(child));
  return child;
}

const originalSpawn = childProcess.spawn;
const originalExecFile = childProcess.execFile;

childProcess.spawn = ((...args: Parameters<typeof originalSpawn>) =>
  track(originalSpawn(...args))) as typeof originalSpawn;

childProcess.execFile = ((...args: Parameters<typeof originalExecFile>) =>
  track(originalExecFile(...args))) as typeof originalExecFile;

afterAll(() => {
  for (const child of registry) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGKILL');
    }
  }
  registry.clear();
});
