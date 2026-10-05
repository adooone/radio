import { useDiscogsSearch, useFetchDraftMetadata } from '@/services/api';
import { Button, Input, Modal } from '@dendelion/mojo-ui';
import clsx from 'clsx';
import { useState } from 'react';

type MetadataModalProps = {
  slug: string;
  force: boolean;
  onClose: () => void;
};

type Mode = 'url' | 'search';

export const MetadataModal = ({ slug, force, onClose }: MetadataModalProps) => {
  const [mode, setMode] = useState<Mode>('url');
  const [releaseRef, setReleaseRef] = useState('');
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: results, isFetching: isSearching } =
    useDiscogsSearch(searchTerm);
  const fetchMetadata = useFetchDraftMetadata();

  const submitRelease = async (release: string) => {
    try {
      await fetchMetadata.mutateAsync({ slug, release, force });
      onClose();
    } catch (error) {
      console.error('Failed to fetch Discogs metadata:', error);
    }
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!releaseRef.trim()) return;
    submitRelease(releaseRef.trim());
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearchTerm(query.trim());
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={force ? 'Замінити метадані' : 'Отримати метадані з Discogs'}
      maxWidth="max-w-xl"
    >
      <div className={clsx(styles.tabs)}>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={clsx(mode === 'url' ? styles.tabActive : styles.tab)}
        >
          URL / ID
        </button>
        <button
          type="button"
          onClick={() => setMode('search')}
          className={clsx(mode === 'search' ? styles.tabActive : styles.tab)}
        >
          Пошук
        </button>
      </div>

      {mode === 'url' ? (
        <form onSubmit={handleUrlSubmit} className={clsx(styles.form)}>
          <Input
            label="Discogs URL або release id"
            value={releaseRef}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setReleaseRef(event.target.value)
            }
            placeholder="https://www.discogs.com/release/2243449-... або 2243449"
            required
          />
          {fetchMetadata.isError && (
            <p className={clsx(styles.error)}>
              {getErrorMessage(fetchMetadata.error)}
            </p>
          )}
          <div className={clsx(styles.actions)}>
            <Button
              type="button"
              variant="gray"
              size="medium"
              title="Скасувати"
              onClick={onClose}
            />
            <Button
              type="submit"
              variant="dark"
              size="medium"
              title={
                fetchMetadata.isPending ? 'Завантаження...' : 'Завантажити'
              }
              disabled={fetchMetadata.isPending || !releaseRef.trim()}
            />
          </div>
        </form>
      ) : (
        <div className={clsx(styles.form)}>
          <form
            onSubmit={handleSearchSubmit}
            className={clsx(styles.searchRow)}
          >
            <Input
              label="Пошук на Discogs (потрібен DISCOGS_TOKEN)"
              value={query}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setQuery(event.target.value)
              }
              placeholder="jethro tull aqualung"
            />
            <Button
              type="submit"
              variant="dark"
              size="medium"
              title="Шукати"
              disabled={!query.trim()}
            />
          </form>

          {isSearching && <p className={clsx(styles.hint)}>Пошук...</p>}
          {results?.length === 0 && !isSearching && searchTerm && (
            <p className={clsx(styles.hint)}>Нічого не знайдено.</p>
          )}

          <ul className={clsx(styles.results)}>
            {results?.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  className={clsx(styles.resultRow)}
                  onClick={() => submitRelease(String(result.id))}
                  disabled={fetchMetadata.isPending}
                >
                  <span className={clsx(styles.resultTitle)}>
                    {result.title}
                  </span>
                  <span className={clsx(styles.resultMeta)}>
                    {result.year} · {result.country} ·{' '}
                    {[...result.label, result.catno].filter(Boolean).join(' ')}{' '}
                    · {result.format.join(', ')}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {fetchMetadata.isError && (
            <p className={clsx(styles.error)}>
              {getErrorMessage(fetchMetadata.error)}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
};

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { error?: string } } })
      .response;
    if (response?.data?.error) {
      return response.data.error;
    }
  }
  return 'Не вдалося отримати метадані з Discogs.';
}

const styles = {
  tabs: ['flex gap-2 mb-4 border-b border-gray-700/50'],
  tab: [
    'px-3 py-2 text-sm text-gray-400 hover:text-gray-200 border-b-2 border-transparent',
  ],
  tabActive: ['px-3 py-2 text-sm text-gray-100 border-b-2 border-sun'],
  form: ['flex flex-col gap-4'],
  searchRow: ['flex items-end gap-3'],
  actions: ['flex justify-end gap-3 pt-2'],
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
  results: ['flex flex-col gap-2 max-h-80 overflow-y-auto'],
  resultRow: [
    'w-full flex flex-col gap-1 p-3 rounded-lg text-left',
    'bg-gray-800/40 hover:bg-gray-800/70 transition-colors disabled:opacity-50',
  ],
  resultTitle: ['font-medium text-gray-200'],
  resultMeta: ['text-xs text-gray-400'],
} as const;
