import type { DigitizationDraft } from '@radio/types';
import clsx from 'clsx';
import { DraftCard } from './draft-card';
import { DraftListSkeleton } from './draft-list-skeleton';

type DraftListProps = {
  drafts: DigitizationDraft[];
  isLoading: boolean;
  onSelect?: (slug: string) => void;
};

export const DraftList = ({ drafts, isLoading, onSelect }: DraftListProps) => {
  if (isLoading) {
    return <DraftListSkeleton />;
  }

  if (drafts.length === 0) {
    return (
      <div className={clsx(styles.empty)}>
        У вхідній теці немає жодного драфту.
      </div>
    );
  }

  return (
    <div className={clsx(styles.grid)}>
      {drafts.map((draft) => (
        <DraftCard
          key={draft.slug}
          draft={draft}
          onClick={() => onSelect?.(draft.slug)}
        />
      ))}
    </div>
  );
};

const styles = {
  grid: [
    'grid gap-4',
    'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  ],
  empty: ['text-center py-12 text-gray-400'],
} as const;
