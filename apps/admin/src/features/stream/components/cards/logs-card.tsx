import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useLogs, useServiceLogs } from '@/services/api/hooks/use-monitoring';
import { sharedStyles } from '@dendelion/mojo-ui/styles';
import clsx from 'clsx';

interface LogsCardProps {
  className?: string;
}

const LOG_LEVELS = {
  error: { color: 'text-red-400', bg: 'bg-red-400/10' },
  warn: { color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  info: { color: 'text-blue-400', bg: 'bg-coal-relic-400/10' },
  debug: { color: 'text-gray-400', bg: 'bg-gray-400/10' },
} as const;

const SOURCE_COLORS = {
  telegram: 'text-blue-400 bg-blue-400/10',
  rtmp: 'text-green-400 bg-green-400/10',
  wave: 'text-ember bg-ember/10',
} as const;

export const LogsCard: React.FC<LogsCardProps> = ({ className }) => {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [lines, setLines] = useState<number>(50);
  const [sortOrder, setSortOrder] = useState<'chronological' | 'reverse'>(
    'reverse',
  );
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const { data: allLogs, isLoading: isLoadingAll } = useLogs('all', lines);
  const { data: telegramLogs, isLoading: isLoadingTelegram } = useServiceLogs(
    'telegram',
    lines,
  );
  const { data: rtmpLogs, isLoading: isLoadingRtmp } = useServiceLogs(
    'rtmp',
    lines,
  );
  const { data: waveLogs, isLoading: isLoadingWave } = useServiceLogs(
    'wave',
    lines,
  );

  const getCurrentLogs = () => {
    switch (selectedSource) {
      case 'telegram':
        return { data: telegramLogs, isLoading: isLoadingTelegram };
      case 'rtmp':
        return { data: rtmpLogs, isLoading: isLoadingRtmp };
      case 'wave':
        return { data: waveLogs, isLoading: isLoadingWave };
      default:
        return { data: allLogs, isLoading: isLoadingAll };
    }
  };

  const { data: logs, isLoading } = getCurrentLogs();

  // Sort logs based on selected order
  const sortedLogs = logs
    ? {
        ...logs,
        entries:
          sortOrder === 'chronological'
            ? [...logs.entries] // Already sorted oldest first from backend
            : [...logs.entries].reverse(), // Reverse for newest first
      }
    : null;

  // Auto-scroll behavior based on sort order
  useEffect(() => {
    if (logsContainerRef.current && sortedLogs?.entries.length) {
      if (sortOrder === 'chronological') {
        // Scroll to bottom for chronological (newest at bottom)
        logsContainerRef.current.scrollTop =
          logsContainerRef.current.scrollHeight;
      } else {
        // Scroll to top for reverse chronological (newest at top)
        logsContainerRef.current.scrollTop = 0;
      }
    }
  }, [sortedLogs?.entries.length, sortOrder]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isRecentLog = (timestamp: string) => {
    const logTime = new Date(timestamp).getTime();
    const now = Date.now();
    return now - logTime < 30000; // Less than 30 seconds old
  };

  const sources = [
    { id: 'all', label: 'All Services', count: allLogs?.totalLines || 0 },
    { id: 'telegram', label: 'Telegram', count: telegramLogs?.totalLines || 0 },
    { id: 'rtmp', label: 'RTMP', count: rtmpLogs?.totalLines || 0 },
    { id: 'wave', label: 'Wave', count: waveLogs?.totalLines || 0 },
  ];

  return (
    <div className={clsx(sharedStyles.statsCard, className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={clsx(sharedStyles.statsTitle, 'mb-0')}>System Logs</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setSortOrder(
                sortOrder === 'chronological' ? 'reverse' : 'chronological',
              )
            }
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg border backdrop-blur-sm transition-all duration-200',
              sortOrder === 'chronological'
                ? 'bg-amber-500/20 text-amber-400 border-amber-400/30'
                : 'bg-coal/60 text-white/80 border-white/10 hover:border-white/20',
            )}
            title={
              sortOrder === 'chronological'
                ? 'Chronological (oldest first)'
                : 'Reverse (newest first)'
            }
          >
            {sortOrder === 'chronological'
              ? '↑ Oldest First'
              : '↓ Newest First'}
          </button>
          <select
            value={lines}
            onChange={(e) => setLines(Number.parseInt(e.target.value, 10))}
            className="px-3 py-1.5 text-sm bg-coal/80 border border-white/20 rounded-lg text-white focus:border-amber-400/60 focus:bg-coal/90 focus:outline-none backdrop-blur-sm"
          >
            <option value={25}>25 lines</option>
            <option value={50}>50 lines</option>
            <option value={100}>100 lines</option>
            <option value={200}>200 lines</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {sources.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => setSelectedSource(source.id)}
            className={clsx(
              'px-4 py-2 text-sm font-display rounded-full whitespace-nowrap border backdrop-blur-sm',
              selectedSource === source.id
                ? 'bg-ember/10 text-ember border-ember/30'
                : 'bg-coal/60 text-white/80 border-white/10',
            )}
          >
            {source.label}
            {source.count > 0 && (
              <span className="ml-1 text-xs opacity-75">({source.count})</span>
            )}
          </button>
        ))}
      </div>

      <div
        ref={logsContainerRef}
        className="bg-coal/40 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm border border-white/10 backdrop-blur-sm"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-amber-400/60">
            Loading logs...
          </div>
        ) : !sortedLogs?.entries.length ? (
          <div className="flex items-center justify-center h-full text-amber-400/60">
            No logs available
          </div>
        ) : (
          <div className="space-y-1">
            {sortedLogs.entries.map((entry, index) => {
              const isRecent = isRecentLog(entry.timestamp);
              return (
                <div
                  key={`${entry.timestamp}-${entry.source}-${index}`}
                  className={clsx(
                    'flex items-start gap-3 px-3 py-2 rounded-lg border transition-all duration-200',
                    LOG_LEVELS[entry.level].bg,
                    isRecent ? 'border-ember/0' : 'border-white/0',
                  )}
                >
                  <span className="text-amber-400/60 text-xs mt-0.5 flex-shrink-0 font-mono">
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <span
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                      LOG_LEVELS[entry.level].color,
                      LOG_LEVELS[entry.level].bg,
                    )}
                  >
                    {entry.level.toUpperCase()}
                  </span>
                  <span
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded-full flex-shrink-0',
                      SOURCE_COLORS[
                        entry.source as keyof typeof SOURCE_COLORS
                      ] || 'text-amber-400/80',
                    )}
                  >
                    {entry.source}
                  </span>
                  <span className="text-white/90 flex-1 break-words font-mono text-xs leading-relaxed">
                    {entry.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {sortedLogs && (
        <div className="mt-3 text-xs text-amber-400/60 text-center border-t border-white/10 pt-3">
          Last updated: {new Date(sortedLogs.lastUpdated).toLocaleTimeString()}
          <span className="ml-2 text-white/40">
            • {sortOrder === 'chronological' ? 'Oldest first' : 'Newest first'}
          </span>
        </div>
      )}
    </div>
  );
};
