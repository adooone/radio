import { useLogs, useServiceLogs } from '@/services/api/hooks/use-monitoring';
import type { LogEntry } from '@radio/types';
import { useMemo, useState } from 'react';

export type JournalSource = 'all' | 'rtmp' | 'wave';

/**
 * The journal's state: which service's lines show, newest first, with
 * each source's line count at hand so the switch can say how much it
 * holds. All three queries run so switching is instant.
 */
export const useJournal = (lines = 100) => {
  const [source, setSource] = useState<JournalSource>('all');
  const all = useLogs('all', lines);
  const rtmp = useServiceLogs('rtmp', lines);
  const wave = useServiceLogs('wave', lines);

  const current = source === 'rtmp' ? rtmp : source === 'wave' ? wave : all;

  // Wave hands the lines oldest first; the feed reads newest first.
  const entries: LogEntry[] = useMemo(
    () => [...(current.data?.entries ?? [])].reverse(),
    [current.data],
  );

  const sources: Array<{ id: JournalSource; label: string; count: number }> = [
    { id: 'all', label: 'Усі', count: all.data?.totalLines ?? 0 },
    { id: 'rtmp', label: 'RTMP', count: rtmp.data?.totalLines ?? 0 },
    { id: 'wave', label: 'Wave', count: wave.data?.totalLines ?? 0 },
  ];

  return {
    source,
    setSource,
    sources,
    entries,
    isLoading: current.isLoading,
    lastUpdated: current.data?.lastUpdated ?? null,
  };
};
