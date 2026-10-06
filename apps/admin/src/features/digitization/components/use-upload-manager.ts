import { digitizationApi } from '@/services/api/digitization-api';
import { digitizationKeys } from '@/services/api/hooks/use-digitization-api';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import { getErrorMessage } from './split-review/split-review-utils';

const CHUNK_SIZE = 8 * 1024 * 1024;
const MAX_UPLOAD_SIZE = 2 * 1024 ** 3;
export const SIDE_FILENAME_PATTERN = /^side-[a-z]\.wav$/;

export type UploadTaskStatus =
  | 'queued'
  | 'uploading'
  | 'paused'
  | 'error'
  | 'done';

export type UploadTask = {
  id: string;
  file: File;
  filename: string;
  size: number;
  uploadedBytes: number;
  status: UploadTaskStatus;
  error?: string;
};

export const useUploadManager = (slug: string) => {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const uploadIdsRef = useRef(new Map<string, string>());
  const controllersRef = useRef(new Map<string, AbortController>());
  const filesRef = useRef(new Map<string, File>());

  const patchTask = useCallback((id: string, patch: Partial<UploadTask>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    );
  }, []);

  const runUpload = useCallback(
    async (taskId: string) => {
      const file = filesRef.current.get(taskId);
      if (!file) return;

      patchTask(taskId, { status: 'uploading', error: undefined });

      const markDone = () => {
        uploadIdsRef.current.delete(taskId);
        patchTask(taskId, { status: 'done', uploadedBytes: file.size });
        queryClient.invalidateQueries({
          queryKey: digitizationKeys.detail(slug),
        });
        queryClient.invalidateQueries({ queryKey: digitizationKeys.drafts() });
      };

      try {
        let uploadId = uploadIdsRef.current.get(taskId);
        let session: Awaited<
          ReturnType<typeof digitizationApi.getUploadStatus>
        > | null = null;
        if (uploadId) {
          try {
            session = await digitizationApi.getUploadStatus(slug, uploadId);
          } catch (error) {
            if (!axios.isAxiosError(error) || error.response?.status !== 404) {
              throw error;
            }
            // The session is gone — a complete that timed out client-side
            // may still have finished server-side. Check if the file landed.
            uploadIdsRef.current.delete(taskId);
            uploadId = undefined;
            const draft = await digitizationApi.getDraft(slug);
            if (draft.sides.includes(file.name)) {
              markDone();
              return;
            }
          }
        }
        if (!session) {
          session = await digitizationApi.initUpload(slug, {
            filename: file.name,
            size: file.size,
            chunkSize: CHUNK_SIZE,
          });
        }
        uploadId = session.uploadId;
        uploadIdsRef.current.set(taskId, uploadId);

        const received = new Set(session.receivedChunks);
        for (let index = 0; index < session.totalChunks; index++) {
          if (received.has(index)) continue;

          const start = index * session.chunkSize;
          const end = Math.min(start + session.chunkSize, session.size);
          const chunk = file.slice(start, end);

          const controller = new AbortController();
          controllersRef.current.set(taskId, controller);

          await digitizationApi.uploadChunk(slug, uploadId, index, chunk, {
            signal: controller.signal,
            onUploadProgress: (sent) => {
              patchTask(taskId, { uploadedBytes: start + sent });
            },
          });
          patchTask(taskId, { uploadedBytes: end });
        }

        await digitizationApi.completeUpload(slug, uploadId);
        markDone();
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        patchTask(taskId, { status: 'error', error: getErrorMessage(error) });
      } finally {
        controllersRef.current.delete(taskId);
      }
    },
    [slug, patchTask, queryClient],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      const accepted: UploadTask[] = [];
      const rejected: string[] = [];

      for (const file of files) {
        if (!SIDE_FILENAME_PATTERN.test(file.name)) {
          rejected.push(file.name);
          continue;
        }
        if (file.size > MAX_UPLOAD_SIZE) {
          rejected.push(file.name);
          continue;
        }
        const id = crypto.randomUUID();
        filesRef.current.set(id, file);
        accepted.push({
          id,
          file,
          filename: file.name,
          size: file.size,
          uploadedBytes: 0,
          status: 'queued',
        });
      }

      if (accepted.length > 0) {
        setTasks((prev) => [...prev, ...accepted]);
        for (const task of accepted) {
          runUpload(task.id);
        }
      }

      return { rejected };
    },
    [runUpload],
  );

  const pause = useCallback(
    (taskId: string) => {
      controllersRef.current.get(taskId)?.abort();
      patchTask(taskId, { status: 'paused' });
    },
    [patchTask],
  );

  const resume = useCallback(
    (taskId: string) => {
      runUpload(taskId);
    },
    [runUpload],
  );

  const isUploading = tasks.some(
    (task) => task.status === 'uploading' || task.status === 'queued',
  );

  return { tasks, addFiles, pause, resume, retry: resume, isUploading };
};
