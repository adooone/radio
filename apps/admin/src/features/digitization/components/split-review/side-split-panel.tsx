import type { DigitizationCutKind, DigitizationSplitPlan } from '@radio/types';
import clsx from 'clsx';
import { TrackTable } from './track-table';
import { useSideAudio } from './use-side-audio';
import { WaveformCanvas } from './waveform-canvas';

type SideSplitPanelProps = {
  slug: string;
  plan: DigitizationSplitPlan;
  manualCuts?: number[];
  onManualCutsChange: (side: string, times: number[]) => void;
};

const LEGEND: Array<{
  kind: DigitizationCutKind;
  label: string;
  color: string;
}> = [
  { kind: 'gap', label: 'Пауза', color: '#60a5fa' },
  { kind: 'refined', label: 'Уточнено', color: '#fbbf24' },
  { kind: 'expected', label: 'Очікуваний час', color: '#f87171' },
  { kind: 'manual', label: 'Вручну', color: '#c084fc' },
];

export const SideSplitPanel = ({
  slug,
  plan,
  manualCuts,
  onManualCutsChange,
}: SideSplitPanelProps) => {
  const {
    audition,
    isLoading: isAuditionLoading,
    error: auditionError,
  } = useSideAudio(slug, plan.side);

  const hasManualOverride = manualCuts !== undefined;
  const displayCuts = manualCuts
    ? manualCuts.map((time) => ({ time, kind: 'manual' as const }))
    : plan.cuts;
  const expectedCuts = plan.tracks.length - 1;

  return (
    <div className={clsx(styles.panel)}>
      <WaveformCanvas
        peaks={plan.peaks}
        duration={plan.duration}
        cuts={displayCuts}
        onCutsChange={(times) => onManualCutsChange(plan.side, times)}
        onAudition={audition}
      />

      <div className={clsx(styles.legend)}>
        {LEGEND.map((item) => (
          <span key={item.kind} className={clsx(styles.legendItem)}>
            <span
              className={clsx(styles.legendSwatch)}
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
        {isAuditionLoading && (
          <span className={clsx(styles.legendLoading)}>
            Завантаження фрагмента...
          </span>
        )}
        {hasManualOverride && (
          <span className={clsx(styles.legendHint)}>
            Ручні позначки — переаналіз скине їх
          </span>
        )}
      </div>

      {auditionError && (
        <p className={clsx(styles.auditionError)}>{auditionError}</p>
      )}

      {manualCuts !== undefined && manualCuts.length !== expectedCuts && (
        <p className={clsx(styles.cutCountWarning)}>
          Для {plan.tracks.length} треків потрібно {expectedCuts} позначок,
          зараз {manualCuts.length}.
        </p>
      )}

      {plan.warnings.length > 0 && (
        <ul className={clsx(styles.warnings)}>
          {plan.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      <TrackTable tracks={plan.tracks} />
    </div>
  );
};

const styles = {
  panel: ['flex flex-col gap-3'],
  legend: ['flex flex-wrap items-center gap-4 text-xs text-gray-400'],
  legendItem: ['flex items-center gap-1.5'],
  legendSwatch: ['w-2.5 h-2.5 rounded-full inline-block'],
  legendHint: ['text-amber-400'],
  legendLoading: ['text-gray-500'],
  auditionError: ['text-sm text-red-400'],
  cutCountWarning: ['text-sm text-amber-400'],
  warnings: ['flex flex-col gap-1 text-sm text-amber-400'],
} as const;
