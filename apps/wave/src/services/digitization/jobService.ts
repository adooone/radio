import { randomUUID } from 'node:crypto';
import type { DigitizationJob, DigitizationJobKind } from '@radio/types';

const jobs = new Map<string, DigitizationJob>();
const activeJobKeys = new Map<string, string>();

const FINISHED_JOB_TTL_MS = 60 * 60 * 1000;
const MAX_FINISHED_JOBS = 100;

function nowIso(): string {
  return new Date().toISOString();
}

/** Drops finished jobs that are old or beyond the cap, oldest first. */
function evictFinishedJobs(): void {
  const cutoff = Date.now() - FINISHED_JOB_TTL_MS;
  const finished = [...jobs.values()]
    .filter((job) => job.status !== 'running')
    .sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  const excess = finished.length - MAX_FINISHED_JOBS;
  finished.forEach((job, i) => {
    if (i < excess || Date.parse(job.updatedAt) < cutoff) {
      jobs.delete(job.id);
    }
  });
}

/**
 * Starts a job, running `task` in the background; returns the job immediately
 * for polling. `key` (e.g. `publish:<slug>`) rejects a second concurrent run
 * for the same target — two publishes of one draft would race ffmpeg into the
 * same output files.
 */
export function runJob<T>(
  kind: DigitizationJobKind,
  key: string,
  task: (log: (line: string) => void) => Promise<T>,
): DigitizationJob {
  const activeId = activeJobKeys.get(key);
  if (activeId && jobs.get(activeId)?.status === 'running') {
    throw new Error(`A ${kind} job is already running for this draft`);
  }
  evictFinishedJobs();

  const job: DigitizationJob = {
    id: randomUUID(),
    kind,
    status: 'running',
    progress: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  jobs.set(job.id, job);
  activeJobKeys.set(key, job.id);

  const log = (line: string) => {
    job.progress.push(line);
    job.updatedAt = nowIso();
  };

  task(log)
    .then((result) => {
      job.status = 'success';
      job.result = result;
      job.updatedAt = nowIso();
    })
    .catch((error) => {
      job.status = 'error';
      job.error = error instanceof Error ? error.message : String(error);
      job.updatedAt = nowIso();
    })
    .finally(() => {
      if (activeJobKeys.get(key) === job.id) {
        activeJobKeys.delete(key);
      }
    });

  return job;
}

export function getJob(id: string): DigitizationJob {
  const job = jobs.get(id);
  if (!job) {
    throw new Error('Not found');
  }
  return job;
}
