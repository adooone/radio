import type { DigitizationDraft } from '@radio/types';
import clsx from 'clsx';
import { STAGE_LABELS, stageKeyOf } from '../lib/stages';

const sidesCount = (n: number) => (n === 1 ? '1 сторона' : `${n} сторони`);
const tracksCount = (n: number) => (n === 1 ? '1 трек' : `${n} треків`);

/** The drafts on the slab, the open one lit; each says where it stands. */
export const DraftRows = ({
  drafts,
  isLoading,
  activeSlug,
  onSelect,
}: {
  drafts: DigitizationDraft[];
  isLoading: boolean;
  activeSlug?: string;
  onSelect: (slug: string) => void;
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5">
        {['s1', 's2', 's3'].map((key) => (
          <div
            key={key}
            className="h-[66px] animate-pulse rounded-[18px] bg-cream/5"
          />
        ))}
      </div>
    );
  }
  if (drafts.length === 0) {
    return (
      <p className="type-body text-cream/45">
        У вхідній теці немає жодного драфту.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      {drafts.map((draft) => {
        const open = draft.slug === activeSlug;
        const stage = stageKeyOf(draft);
        return (
          <button
            key={draft.slug}
            type="button"
            onClick={() => onSelect(draft.slug)}
            aria-pressed={open}
            className={clsx(
              'flex w-full cursor-pointer flex-col gap-1.5 rounded-[18px] border px-[18px] py-3.5 text-left transition-colors',
              open
                ? 'border-lamp/35 bg-lamp/[0.07]'
                : 'border-cream/[0.08] hover:border-cream/20',
            )}
          >
            <span className="truncate font-serif text-base font-semibold text-cream">
              {draft.artist} — {draft.title}
            </span>
            <span className="flex items-center gap-2.5 font-sans text-[11px] text-cream/60">
              <span
                className={clsx(
                  'font-semibold uppercase tracking-[0.1em]',
                  open || stage === 'on-air' ? 'text-glow' : 'text-cream/70',
                )}
              >
                {STAGE_LABELS[draft.stage]}
              </span>
              · {sidesCount(draft.sides.length)} ·{' '}
              {tracksCount(draft.trackFiles.length)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
