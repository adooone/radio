import { ListItem, Tabs } from '@dendelion/func-ui';
import type { LogEntry } from '@radio/types';
import { useJournal } from '../hooks/use-journal';

const TONES: Record<LogEntry['level'], 'default' | 'warn' | 'alert'> = {
  error: 'alert',
  warn: 'warn',
  info: 'default',
  debug: 'default',
};

const clock = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

/** The station's journal: the services' lines, newest first. */
export const JournalFeed = () => {
  const { source, setSource, sources, entries, isLoading, lastUpdated } =
    useJournal();

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <Tabs
        variant="ghost"
        size="sm"
        value={source}
        onChange={(value) => setSource(value as typeof source)}
        items={sources.map((item) => ({
          value: item.id,
          label: (
            <>
              {item.label}
              {item.count > 0 && (
                <span className="ml-1.5 text-cream/45">{item.count}</span>
              )}
            </>
          ),
        }))}
      />

      {isLoading ? (
        <p className="type-body text-cream/45">Завантаження журналу…</p>
      ) : entries.length === 0 ? (
        <p className="type-body text-cream/45">Журнал порожній.</p>
      ) : (
        <div className="flex flex-col gap-3.5">
          {entries.map((entry, index) => (
            <ListItem
              key={`${entry.timestamp}-${entry.source}-${index}`}
              icon={
                <span className="type-meta text-cream/55">
                  {clock(entry.timestamp)}
                </span>
              }
              tone={TONES[entry.level]}
              className={entry.level === 'debug' ? 'text-cream/45' : undefined}
            >
              {source === 'all' && (
                <span className="type-label mr-2 text-cream/45">
                  {entry.source}
                </span>
              )}
              {entry.message}
            </ListItem>
          ))}
        </div>
      )}

      {lastUpdated && (
        <p className="type-meta text-cream/45">оновлено {clock(lastUpdated)}</p>
      )}
    </div>
  );
};
