import { useDiscogsSearch, useFetchDraftMetadata } from '@/services/api';
import { Button, Input, Tabs } from '@dendelion/func-ui';
import { useState } from 'react';

type Mode = 'url' | 'search';

const errorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } })
      .response;
    if (response?.data?.error) return response.data.error;
  }
  return 'Не вдалося отримати метадані з Discogs.';
};

/** data.json from Discogs, by release link or by search — in place, no modal. */
export const DiscogsLookup = ({
  slug,
  force,
  onClose,
}: {
  slug: string;
  force: boolean;
  onClose: () => void;
}) => {
  const [mode, setMode] = useState<Mode>('url');
  const [releaseRef, setReleaseRef] = useState('');
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  const { data: results, isFetching } = useDiscogsSearch(term);
  const fetchMetadata = useFetchDraftMetadata();

  const submitRelease = async (release: string) => {
    try {
      await fetchMetadata.mutateAsync({ slug, release, force });
      onClose();
    } catch (error) {
      console.error('Failed to fetch Discogs metadata:', error);
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="type-label text-cream/60">
          {force ? 'Замінити метадані з Discogs' : 'Метадані з Discogs'}
        </span>
        <span className="flex-1" />
        <Tabs
          variant="ghost"
          size="sm"
          value={mode}
          onChange={(value) => setMode(value as typeof mode)}
          items={[
            { value: 'url', label: 'URL / ID' },
            { value: 'search', label: 'Пошук' },
          ]}
        />
      </div>

      {mode === 'url' ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (releaseRef.trim()) submitRelease(releaseRef.trim());
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Посилання на реліз або його id"
            id="discogs-ref"
            value={releaseRef}
            onChange={(e) => setReleaseRef(e.target.value)}
            placeholder="https://www.discogs.com/release/2243449-… або 2243449"
            required
          />
          <div className="flex gap-2.5">
            <Button
              type="submit"
              variant="lit"
              size="sm"
              disabled={fetchMetadata.isPending || !releaseRef.trim()}
            >
              {fetchMetadata.isPending ? 'Завантаження…' : 'Завантажити'}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Скасувати
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setTerm(query.trim());
            }}
            className="flex items-end gap-2.5"
          >
            <Input
              label="Пошук на Discogs"
              className="flex-1"
              id="discogs-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="jethro tull aqualung"
            />
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              disabled={!query.trim()}
            >
              Шукати
            </Button>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Скасувати
            </Button>
          </form>
          {isFetching && <p className="type-body text-cream/45">Пошук…</p>}
          {!isFetching && term && results?.length === 0 && (
            <p className="type-body text-cream/45">Нічого не знайдено.</p>
          )}
          {results && results.length > 0 && (
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto [scrollbar-width:thin]">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  disabled={fetchMetadata.isPending}
                  onClick={() => submitRelease(String(result.id))}
                  className="flex cursor-pointer flex-col gap-0.5 rounded-[14px] border border-cream/[0.08] px-4 py-2.5 text-left transition-colors hover:border-cream/20 disabled:opacity-50"
                >
                  <span className="font-serif text-base font-semibold text-cream">
                    {result.title}
                  </span>
                  <span className="font-sans text-xs text-cream/60">
                    {result.year} · {result.country} ·{' '}
                    {[...result.label, result.catno].filter(Boolean).join(' ')}{' '}
                    · {result.format.join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {fetchMetadata.isError && (
        <p className="font-sans text-xs text-accent">
          {errorMessage(fetchMetadata.error)}
        </p>
      )}
    </section>
  );
};
