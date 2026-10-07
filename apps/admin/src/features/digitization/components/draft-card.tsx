import type { DigitizationDraft } from '@radio/types';
import clsx from 'clsx';
import { DraftCover } from './draft-cover';
import { DraftStageBadge } from './draft-stage-badge';

type DraftCardProps = {
  draft: DigitizationDraft;
  onClick?: () => void;
};

export const DraftCard = ({ draft, onClick }: DraftCardProps) => {
  return (
    <button type="button" onClick={onClick} className={clsx(styles.card)}>
      <DraftCover
        slug={draft.slug}
        hasCover={draft.hasCover}
        title={draft.title}
        layoutId={`draft-cover-${draft.slug}`}
      />

      <div className={clsx(styles.body)}>
        <div className={clsx(styles.heading)}>
          <h3 className={clsx(styles.title)}>{draft.title}</h3>
          <p className={clsx(styles.artist)}>{draft.artist}</p>
        </div>

        <DraftStageBadge stage={draft.stage} />

        <p className={clsx(styles.counts)}>
          {draft.sides.length} {pluralizeSides(draft.sides.length)} ·{' '}
          {draft.trackFiles.length} {pluralizeTracks(draft.trackFiles.length)}
        </p>
      </div>
    </button>
  );
};

function pluralizeSides(count: number): string {
  return count === 1 ? 'сторона' : 'сторони';
}

function pluralizeTracks(count: number): string {
  return count === 1 ? 'трек' : 'треків';
}

const styles = {
  card: [
    'flex flex-col gap-3 p-3 rounded-lg w-full text-left',
    'bg-gray-800/30 hover:bg-gray-800/50',
    'border border-transparent transition-all',
  ],
  body: ['flex flex-col gap-2'],
  heading: ['flex flex-col'],
  title: ['font-medium text-gray-200 truncate'],
  artist: ['text-sm text-gray-400 truncate'],
  counts: ['text-xs text-gray-500'],
} as const;
