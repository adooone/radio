import { useDigitizationDrafts } from '@/services/api';
import { Button, PageLayout } from '@dendelion/mojo-ui';
import clsx from 'clsx';
import { useState } from 'react';
import { DraftDetailModal, DraftList } from './components';

export const DigitizationPage = () => {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const {
    data: drafts,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useDigitizationDrafts();

  return (
    <PageLayout
      title="Оцифровка"
      headerRight={
        <Button
          variant="gray"
          size="medium"
          title={isFetching ? 'Оновлення...' : 'Оновити'}
          disabled={isFetching}
          onClick={() => refetch()}
        />
      }
    >
      {isError ? (
        <div className={clsx(styles.error)}>
          <p>Не вдалося завантажити драфти.</p>
          <Button
            variant="gray"
            size="medium"
            title="Спробувати ще раз"
            disabled={isFetching}
            onClick={() => refetch()}
          />
        </div>
      ) : (
        <DraftList
          drafts={drafts ?? []}
          isLoading={isLoading}
          onSelect={setSelectedSlug}
        />
      )}
      <DraftDetailModal
        slug={selectedSlug}
        onClose={() => setSelectedSlug(null)}
      />
    </PageLayout>
  );
};

const styles = {
  error: [
    'flex flex-col items-center gap-3 p-8',
    'text-red-400',
    'bg-red-900/30 rounded-lg border border-red-500/30',
  ],
} as const;
