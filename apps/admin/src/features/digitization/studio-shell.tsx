import { useDigitizationDrafts } from '@/services/api';
import { LampButton } from '@dendelion/func-ui';
import type { DigitizationDraft } from '@radio/types';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { type ReactNode, useState } from 'react';
import { CreateDraftModal, DraftList, RadioFolderPanel } from './components';

type StudioShellProps = {
  children: ReactNode;
  activeSlug?: string;
  onBack?: () => void;
};

type StageKey = 'upload' | 'split' | 'metadata' | 'publish' | 'on-air';

const STAGES: Array<{ key: StageKey; label: string }> = [
  { key: 'upload', label: 'Завантаження' },
  { key: 'metadata', label: 'Метадані' },
  { key: 'split', label: 'Розкрій' },
  { key: 'publish', label: 'Публікація' },
  { key: 'on-air', label: 'В ефірі' },
];

const stageKeyOf = (draft: DigitizationDraft): StageKey => {
  if (draft.stage === 'awaiting-sides') return 'upload';
  if (draft.stage === 'ready-to-split')
    return draft.hasMetadata ? 'split' : 'metadata';
  if (draft.stage === 'ready-to-encode') return 'publish';
  return 'on-air';
};

export const StudioShell = ({
  children,
  activeSlug,
  onBack,
}: StudioShellProps) => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const {
    data: drafts,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useDigitizationDrafts();

  const list = drafts ?? [];
  const activeDraft = list.find((draft) => draft.slug === activeSlug);
  const activeStage = activeDraft ? stageKeyOf(activeDraft) : null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center gap-3 px-[var(--gutter)] pt-[calc(var(--gutter)*0.8+4.5rem)] pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage.key}
            className={clsx(
              'flex items-baseline gap-2 rounded-full px-3 py-1.5 ring-1',
              activeStage === stage.key
                ? 'bg-accent/15 ring-accent/60'
                : 'bg-cream/5 ring-cream/10',
            )}
          >
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-cream/45">
              {stage.label}
            </span>
            <span className="font-sans text-sm font-semibold text-cream">
              {list.filter((draft) => stageKeyOf(draft) === stage.key).length}
            </span>
          </div>
        ))}

        <div className="flex-1" />

        {onBack && (
          <LampButton tone="gray" size="sm" onClick={onBack}>
            ← До списку
          </LampButton>
        )}
        <LampButton tone="dark" size="sm" onClick={() => setIsCreating(true)}>
          Новий запис
        </LampButton>
        <LampButton
          tone="gray"
          size="sm"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          {isFetching ? 'Оновлення...' : 'Оновити'}
        </LampButton>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-[var(--gutter)] px-[var(--gutter)]">
        <div className="min-h-0 overflow-y-auto pb-28 [scrollbar-width:none]">
          {children}
        </div>
        <aside className="flex min-h-0 flex-col gap-6 overflow-y-auto pb-28 [scrollbar-width:none]">
          <RadioFolderPanel />
          {isError ? (
            <div className="flex flex-col items-start gap-3 text-accent">
              <p>Не вдалося завантажити драфти.</p>
              <LampButton
                tone="gray"
                size="sm"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                Спробувати ще раз
              </LampButton>
            </div>
          ) : (
            <DraftList
              drafts={list}
              isLoading={isLoading}
              onSelect={(slug) =>
                navigate({ to: '/studio/$slug', params: { slug } })
              }
            />
          )}
        </aside>
      </div>
      {isCreating && <CreateDraftModal onClose={() => setIsCreating(false)} />}
    </div>
  );
};
