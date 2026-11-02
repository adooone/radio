import clsx from 'clsx';
import { STAGES, type StageKey, stageIndex } from '../lib/stages';

/**
 * The record's way through the studio as a row of chips: the steps done
 * with a tick, the step it is at lit, the steps ahead quiet. Without an
 * open draft the chips carry how many drafts wait at each step.
 */
export const StageChips = ({
  active,
  counts,
}: {
  active: StageKey | null;
  counts?: Record<StageKey, number>;
}) => {
  const current = active ? stageIndex(active) : -1;
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {STAGES.map((stage, index) => {
        const done = current > index;
        const lit = current === index;
        return (
          <span key={stage.key} className="flex items-center gap-2.5">
            {index > 0 && (
              <span aria-hidden="true" className="h-px w-3.5 bg-cream/25" />
            )}
            <span
              className={clsx(
                'inline-flex items-center gap-[7px] rounded-full border px-3 py-[5px] font-sans text-[10px] font-semibold uppercase leading-none tracking-[0.12em]',
                lit
                  ? 'border-lamp/50 bg-lamp/[0.14] text-glow shadow-[0_0_14px_rgba(224,139,38,0.25)]'
                  : done
                    ? 'border-cream/20 text-cream/70'
                    : 'border-cream/[0.12] text-cream/55',
              )}
            >
              {done && <span aria-hidden="true">✓</span>}
              {stage.label}
              {counts && counts[stage.key] > 0 && (
                <span className="text-cream">{counts[stage.key]}</span>
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};
