import {
  useRtmpConfig,
  useUpdateRtmpConfig,
} from '@/services/api/hooks/use-stream-control';
import type { RtmpServerConfig } from '@radio/types';
import { useState } from 'react';

/* Sets a value by dotted path ("application.hls.enabled") on a copy. */
const setPath = (
  config: RtmpServerConfig,
  path: string,
  value: unknown,
): RtmpServerConfig => {
  const keys = path.split('.');
  const copy = structuredClone(config) as unknown as Record<string, unknown>;
  let node = copy;
  for (let i = 0; i < keys.length - 1; i++) {
    node = node[keys[i]] as Record<string, unknown>;
  }
  node[keys[keys.length - 1]] = value;
  return copy as unknown as RtmpServerConfig;
};

/**
 * The RTMP configuration as an edit session: the saved config shows until
 * editing starts, a draft copy takes the changes, and saving sends the
 * draft or cancelling drops it.
 */
export const useRtmpConfigForm = () => {
  const { data: saved, isLoading } = useRtmpConfig();
  const update = useUpdateRtmpConfig();
  const [draft, setDraft] = useState<RtmpServerConfig | null>(null);

  const editing = draft !== null;
  const config = draft ?? saved ?? null;

  const start = () => {
    if (saved) setDraft(structuredClone(saved));
  };
  const cancel = () => setDraft(null);
  const save = async () => {
    if (!draft) return;
    try {
      await update.mutateAsync(draft);
      setDraft(null);
    } catch (error) {
      console.error('Failed to update RTMP config:', error);
    }
  };
  const set = (path: string, value: unknown) =>
    setDraft((prev) => (prev ? setPath(prev, path, value) : prev));
  /** A comma-separated field (allowed publishers) kept as a list. */
  const setList = (path: string, csv: string) =>
    set(
      path,
      csv
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    );

  return {
    config,
    editing,
    isLoading,
    saving: update.isPending,
    error: update.error,
    start,
    cancel,
    save,
    set,
    setList,
  };
};
