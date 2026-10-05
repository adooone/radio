import { useApplySplit, useSplitPlan } from '@/services/api';
import { Button, Tabs } from '@dendelion/mojo-ui';
import type { DigitizationSplitApplySide } from '@radio/types';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { SideSplitPanel } from './side-split-panel';
import { SplitControls, type SplitTuningParams } from './split-controls';
import { getErrorMessage, sideLetterFromFile } from './split-review-utils';

type SplitReviewSectionProps = {
  slug: string;
  hasTrackFiles: boolean;
};

const DEFAULT_PARAMS: SplitTuningParams = {
  noise: -40,
  minSilence: 1,
  tolerance: 25,
};

const MANUAL_CUTS_DEBOUNCE_MS = 500;
const EMPTY_MANUAL_CUTS: Record<string, number[]> = {};

export const SplitReviewSection = ({
  slug,
  hasTrackFiles,
}: SplitReviewSectionProps) => {
  const [params, setParams] = useState<SplitTuningParams>(DEFAULT_PARAMS);
  const [manualCutsBySide, setManualCutsBySide] =
    useState<Record<string, number[]>>(EMPTY_MANUAL_CUTS);
  const [debouncedCutsBySide, setDebouncedCutsBySide] =
    useState<Record<string, number[]>>(EMPTY_MANUAL_CUTS);

  const hasManualOverrides = Object.keys(debouncedCutsBySide).length > 0;
  const {
    data: plan,
    isFetching,
    isError,
    error,
  } = useSplitPlan(
    slug,
    {
      ...params,
      manualCuts: hasManualOverrides ? debouncedCutsBySide : undefined,
    },
    true,
  );
  const applySplit = useApplySplit();

  const hasCutCountMismatch = (plan?.sides ?? []).some((side) => {
    const manualCuts = manualCutsBySide[sideLetterFromFile(side.side)];
    return (
      manualCuts !== undefined && manualCuts.length !== side.tracks.length - 1
    );
  });

  useEffect(() => {
    if (hasCutCountMismatch) return;
    const handle = setTimeout(() => {
      setDebouncedCutsBySide(manualCutsBySide);
    }, MANUAL_CUTS_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [manualCutsBySide, hasCutCountMismatch]);

  const handleReanalyze = (next: SplitTuningParams) => {
    setParams(next);
    setManualCutsBySide(EMPTY_MANUAL_CUTS);
    setDebouncedCutsBySide(EMPTY_MANUAL_CUTS);
  };

  const handleManualCutsChange = (sideFile: string, times: number[]) => {
    setManualCutsBySide((prev) => ({
      ...prev,
      [sideLetterFromFile(sideFile)]: times,
    }));
  };

  const handleConfirm = async () => {
    if (!plan) return;
    const sides: DigitizationSplitApplySide[] = plan.sides.map((side) => ({
      side: sideLetterFromFile(side.side),
      tracks: side.tracks.map((track) => ({
        fileSlug: track.fileSlug,
        start: track.start,
        end: track.end,
      })),
    }));
    try {
      await applySplit.mutateAsync({ slug, sides });
    } catch (err) {
      console.error('Failed to apply split plan:', err);
    }
  };

  if (isError) {
    return <p className={clsx(styles.error)}>{getErrorMessage(error)}</p>;
  }

  if (!plan) {
    return <p className={clsx(styles.hint)}>Аналіз доріжок...</p>;
  }

  const hasWarnings = plan.sides.some((side) => side.warnings.length > 0);
  const isPlanStale = manualCutsBySide !== debouncedCutsBySide;
  const confirmDisabled =
    applySplit.isPending ||
    isFetching ||
    isPlanStale ||
    hasCutCountMismatch ||
    hasTrackFiles;

  const tabs = plan.sides.map((side) => ({
    id: side.side,
    label: sideLetterFromFile(side.side).toUpperCase(),
    content: (
      <SideSplitPanel
        slug={slug}
        plan={side}
        manualCuts={manualCutsBySide[sideLetterFromFile(side.side)]}
        onManualCutsChange={handleManualCutsChange}
      />
    ),
  }));

  return (
    <div className={clsx(styles.section)}>
      <SplitControls
        params={params}
        onReanalyze={handleReanalyze}
        isLoading={isFetching}
      />

      {isFetching && <p className={clsx(styles.hint)}>Оновлення аналізу...</p>}

      {plan.missingSides.length > 0 && (
        <p className={clsx(styles.hint)}>
          Відсутні сторони: {plan.missingSides.join(', ')}
        </p>
      )}

      <Tabs tabs={tabs} />

      <div className={clsx(styles.confirmRow)}>
        {applySplit.isError && (
          <p className={clsx(styles.error)}>
            {getErrorMessage(applySplit.error)}
          </p>
        )}
        {applySplit.isSuccess && (
          <p className={clsx(styles.success)}>Треки розкроєні.</p>
        )}
        {hasTrackFiles && (
          <p className={clsx(styles.hint)}>
            Файли треків вже існують — видаліть їх перед повторним розкроєм.
          </p>
        )}
        <Button
          type="button"
          variant={hasWarnings ? 'red' : 'dark'}
          size="medium"
          title={
            applySplit.isPending
              ? 'Розкрій...'
              : hasWarnings
                ? 'Розкроїти попри попередження'
                : 'Розкроїти доріжки'
          }
          disabled={confirmDisabled}
          onClick={handleConfirm}
        />
      </div>
    </div>
  );
};

const styles = {
  section: ['flex flex-col gap-4'],
  hint: ['text-sm text-gray-400'],
  error: ['text-sm text-red-400'],
  success: ['text-sm text-moss-400'],
  confirmRow: ['flex flex-col items-end gap-2 pt-2'],
} as const;
