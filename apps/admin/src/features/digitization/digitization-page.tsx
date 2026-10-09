import { useDigitizationDrafts } from '@/services/api';
import { LampButton } from '@dendelion/func-ui';
import { PageLayout } from '@dendelion/mojo-ui';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { useState } from 'react';
import { CreateDraftModal, DraftList, RadioFolderPanel } from './components';

export const DigitizationPage = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
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
        <div className={clsx(styles.headerActions)}>
          <LampButton tone="dark" size="md" onClick={() => setIsCreating(true)}>
            Новий запис
          </LampButton>
          <LampButton
            tone="gray"
            size="md"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            {isFetching ? 'Оновлення...' : 'Оновити'}
          </LampButton>
        </div>
      }
    >
      {isError ? (
        <div className={clsx(styles.error)}>
          <p>Не вдалося завантажити драфти.</p>
          <LampButton
            tone="gray"
            size="md"
            disabled={isFetching}
            onClick={() => refetch()}
          >
            Спробувати ще раз
          </LampButton>
        </div>
      ) : (
        <div className={clsx(styles.layout)}>
          <div className={clsx(styles.main)}>
            <DraftList
              drafts={drafts ?? []}
              isLoading={isLoading}
              onSelect={(slug) =>
                navigate({ to: '/digitization/$slug', params: { slug } })
              }
            />
          </div>
          <aside className={clsx(styles.sidebar)}>
            <RadioFolderPanel />
          </aside>
        </div>
      )}
      {isCreating && <CreateDraftModal onClose={() => setIsCreating(false)} />}
    </PageLayout>
  );
};

const styles = {
  headerActions: ['flex items-center gap-2'],
  layout: ['flex flex-col lg:flex-row gap-6 items-start'],
  main: ['min-w-0 flex-1'],
  sidebar: ['w-full lg:w-80 lg:shrink-0'],
  error: [
    'flex flex-col items-center gap-3 p-8',
    'text-red-400',
    'bg-red-900/30 rounded-lg border border-red-500/30',
  ],
} as const;
