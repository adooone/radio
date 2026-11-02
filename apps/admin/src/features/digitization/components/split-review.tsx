import { Pill, TabPills } from '@/features/admin/ui';
import { useApplySplit, useSplitPlan } from '@/services/api';
import type {
  DigitizationCutKind,
  DigitizationSplitApplySide,
  DigitizationSplitPlan,
} from '@radio/types';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useSideAudio } from '../hooks/use-side-audio';
import {
  formatSeconds,
  getErrorMessage,
  sideLetterFromFile,
} from '../lib/split-review-utils';
import { CUT_COLORS, Waveform } from './waveform';

type TuningParams = { noise: number; minSilence: number; tolerance: number };

const DEFAULT_PARAMS: TuningParams = { noise: -40, minSilence: 1, tolerance: 25 };
const MANUAL_CUTS_DEBOUNCE_MS = 500;
const EMPTY: Record<string, number[]> = {};

const LEGEND: Array<{ kind: DigitizationCutKind; label: string }> = [
  { kind: 'gap', label: 'пауза' },
  { kind: 'refined', label: 'уточнено' },
  { kind: 'expected', label: 'очікуваний час' },
  { kind: 'manual', label: 'вручну' },
];

const Tuning = ({
  params,
  onReanalyze,
  busy,
}: {
  params: TuningParams;
  onReanalyze: (params: TuningParams) => void;
  busy: boolean;
}) => {
  const [pending, setPending] = useState(params);
  useEffect(() => setPending(params), [params]);
  const Range = ({
    label,
    value,
    min,
    max,
    step,
    onChange,
  }: {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
  }) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="type-label flex justify-between text-cream/45">
        {label}
        <span className="tabular-nums text-cream/70">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#ff5647]"
      />
    </label>
  );
  return (
    <div className="flex flex-wrap items-end gap-5">
      <Range label="Чутливість, дБ" value={pending.noise} min={-60} max={-20} step={1} onChange={(noise) => setPending((p) => ({ ...p, noise }))} />
      <Range label="Мін. пауза, с" value={pending.minSilence} min={0.2} max={3} step={0.1} onChange={(minSilence) => setPending((p) => ({ ...p, minSilence }))} />
      <Range label="Допуск, с" value={pending.tolerance} min={5} max={60} step={1} onChange={(tolerance) => setPending((p) => ({ ...p, tolerance }))} />
      <Pill tone="ghost" size="sm" disabled={busy} onClick={() => onReanalyze(pending)}>
        {busy ? 'Аналіз…' : 'Переаналізувати'}
      </Pill>
    </div>
  );
};

/** One side: its trace with the cuts, the four actions, and the tracks it makes. */
const Side = ({
  slug,
  plan,
  manualCuts,
  onManualCutsChange,
  hasTrackFiles,
  confirm,
}: {
  slug: string;
  plan: DigitizationSplitPlan;
  manualCuts?: number[];
  onManualCutsChange: (side: string, times: number[]) => void;
  hasTrackFiles: boolean;
  confirm: {
    disabled: boolean;
    pending: boolean;
    hasWarnings: boolean;
    onConfirm: () => void;
  };
}) => {
  const { audition, isLoading: auditioning, error: auditionError } =
    useSideAudio(slug, plan.side);
  const [selected, setSelected] = useState<number | null>(null);

  const cuts = manualCuts
    ? manualCuts.map((time) => ({ time, kind: 'manual' as const }))
    : plan.cuts;
  const expectedCuts = plan.tracks.length - 1;
  const change = (times: number[]) => onManualCutsChange(plan.side, times);

  const addCut = () => {
    // In the middle of the longest track, where a missed boundary most likely hides.
    const longest = [...plan.tracks].sort(
      (a, b) => b.end - b.start - (a.end - a.start),
    )[0];
    const time = longest ? (longest.start + longest.end) / 2 : plan.duration / 2;
    const times = [...cuts.map((c) => c.time), time].sort((a, b) => a - b);
    setSelected(times.indexOf(time));
    change(times);
  };
  const removeCut = () => {
    if (selected === null) return;
    change(cuts.filter((_, i) => i !== selected).map((c) => c.time));
    setSelected(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Waveform
        peaks={plan.peaks}
        duration={plan.duration}
        cuts={cuts}
        selected={selected}
        onSelect={setSelected}
        onCutsChange={change}
        onAudition={audition}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 type-meta text-cream/45">
        {LEGEND.map((item) => (
          <span key={item.kind} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="inline-block h-3 w-[2px]"
              style={{ backgroundColor: CUT_COLORS[item.kind] }}
            />
            {item.label}
          </span>
        ))}
        {auditioning && <span>завантаження фрагмента…</span>}
        {manualCuts && <span className="text-glow">ручні позначки — переаналіз скине їх</span>}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Pill
          tone="ghost"
          size="sm"
          disabled={selected === null || !cuts[selected]}
          onClick={() => selected !== null && cuts[selected] && audition(cuts[selected].time)}
        >
          Прослухати з межі
        </Pill>
        <Pill tone="ghost" size="sm" onClick={addCut}>
          Додати межу
        </Pill>
        <Pill tone="ghost" size="sm" disabled={selected === null} onClick={removeCut}>
          Прибрати межу
        </Pill>
        <Pill
          tone={confirm.hasWarnings ? 'danger' : 'lit'}
          size="sm"
          disabled={confirm.disabled}
          onClick={confirm.onConfirm}
        >
          {confirm.pending
            ? 'Розкрій…'
            : confirm.hasWarnings
              ? 'Розкроїти попри попередження'
              : 'Зберегти розкрій'}
        </Pill>
      </div>

      {auditionError && <p className="font-sans text-xs text-accent">{auditionError}</p>}
      {manualCuts && manualCuts.length !== expectedCuts && (
        <p className="font-sans text-xs text-glow">
          Для {plan.tracks.length} треків потрібно {expectedCuts} позначок, зараз{' '}
          {manualCuts.length}.
        </p>
      )}
      {hasTrackFiles && (
        <p className="font-sans text-xs text-cream/45">
          Файли треків вже існують — видаліть їх перед повторним розкроєм.
        </p>
      )}
      {plan.warnings.length > 0 && (
        <ul className="flex flex-col gap-1 font-sans text-xs text-glow">
          {plan.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        {plan.tracks.map((track) => {
          const warned = track.warnings.length > 0;
          return (
            <div
              key={track.fileSlug}
              className={clsx(
                'flex items-baseline gap-4 rounded-[14px] border px-4 py-2.5',
                warned ? 'border-lamp/35 bg-lamp/[0.06]' : 'border-cream/[0.08]',
              )}
            >
              <span className="type-meta w-5 shrink-0 text-cream/55">{track.index + 1}</span>
              <span className="min-w-0 flex-1 truncate font-serif text-base font-semibold text-cream">
                {track.title ?? track.fileSlug}
                {warned && (
                  <span className="ml-3 font-sans text-xs font-normal text-glow">
                    {track.warnings.join('; ')}
                  </span>
                )}
              </span>
              <span className="type-meta shrink-0 text-cream/60">
                {formatSeconds(track.start)} – {formatSeconds(track.end)} ·{' '}
                {formatSeconds(track.end - track.start)}
                {track.expectedDuration
                  ? ` (очік. ${formatSeconds(track.expectedDuration)})`
                  : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * The split: the detector's tuning, then each side with its trace, the
 * hand's cuts debounced into the plan, and the one lit action that writes
 * the tracks.
 */
export const SplitReview = ({
  slug,
  hasTrackFiles,
}: {
  slug: string;
  hasTrackFiles: boolean;
}) => {
  const [params, setParams] = useState<TuningParams>(DEFAULT_PARAMS);
  const [manualCuts, setManualCuts] = useState<Record<string, number[]>>(EMPTY);
  const [debouncedCuts, setDebouncedCuts] = useState<Record<string, number[]>>(EMPTY);
  const [side, setSide] = useState<string | null>(null);

  const hasOverrides = Object.keys(debouncedCuts).length > 0;
  const { data: plan, isFetching, isError, error } = useSplitPlan(
    slug,
    { ...params, manualCuts: hasOverrides ? debouncedCuts : undefined },
    true,
  );
  const applySplit = useApplySplit();

  const countMismatch = (plan?.sides ?? []).some((item) => {
    const cuts = manualCuts[sideLetterFromFile(item.side)];
    return cuts !== undefined && cuts.length !== item.tracks.length - 1;
  });

  useEffect(() => {
    if (countMismatch) return;
    const handle = setTimeout(() => setDebouncedCuts(manualCuts), MANUAL_CUTS_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [manualCuts, countMismatch]);

  const reanalyze = (next: TuningParams) => {
    setParams(next);
    setManualCuts(EMPTY);
    setDebouncedCuts(EMPTY);
  };

  const confirm = async () => {
    if (!plan) return;
    const sides: DigitizationSplitApplySide[] = plan.sides.map((item) => ({
      side: sideLetterFromFile(item.side),
      tracks: item.tracks.map((track) => ({
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
    return <p className="type-body text-accent">{getErrorMessage(error)}</p>;
  }
  if (!plan) {
    return <p className="type-body text-cream/45">Аналіз доріжок…</p>;
  }

  const hasWarnings = plan.sides.some((item) => item.warnings.length > 0);
  const stale = manualCuts !== debouncedCuts;
  const activeSide = plan.sides.find((item) => item.side === side) ?? plan.sides[0];
  const tabs = plan.sides.map((item) => ({
    id: item.side,
    label: `Сторона ${sideLetterFromFile(item.side).toUpperCase()}`,
  }));

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="type-label text-cream/60">Розкрій</span>
        <span className="flex-1" />
        {tabs.length > 1 && activeSide && (
          <TabPills tabs={tabs} active={activeSide.side} onChange={setSide} />
        )}
      </div>

      <Tuning params={params} onReanalyze={reanalyze} busy={isFetching} />
      {isFetching && <p className="type-meta text-cream/45">оновлення аналізу…</p>}
      {plan.missingSides.length > 0 && (
        <p className="font-sans text-xs text-glow">
          Відсутні сторони: {plan.missingSides.join(', ')}
        </p>
      )}

      {activeSide && (
        <Side
          key={activeSide.side}
          slug={slug}
          plan={activeSide}
          manualCuts={manualCuts[sideLetterFromFile(activeSide.side)]}
          onManualCutsChange={(file, times) =>
            setManualCuts((prev) => ({ ...prev, [sideLetterFromFile(file)]: times }))
          }
          hasTrackFiles={hasTrackFiles}
          confirm={{
            disabled:
              applySplit.isPending || isFetching || stale || countMismatch || hasTrackFiles,
            pending: applySplit.isPending,
            hasWarnings,
            onConfirm: confirm,
          }}
        />
      )}

      {applySplit.isError && (
        <p className="font-sans text-xs text-accent">{getErrorMessage(applySplit.error)}</p>
      )}
      {applySplit.isSuccess && <p className="font-sans text-xs text-glow">Треки розкроєні.</p>}
    </section>
  );
};
