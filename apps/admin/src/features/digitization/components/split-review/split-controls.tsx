import { LampButton, Slider } from '@dendelion/func-ui';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

export type SplitTuningParams = {
  noise: number;
  minSilence: number;
  tolerance: number;
};

type SplitControlsProps = {
  params: SplitTuningParams;
  onReanalyze: (params: SplitTuningParams) => void;
  isLoading: boolean;
};

export const SplitControls = ({
  params,
  onReanalyze,
  isLoading,
}: SplitControlsProps) => {
  const [pending, setPending] = useState(params);

  useEffect(() => {
    setPending(params);
  }, [params]);

  return (
    <div className={clsx(styles.row)}>
      <Slider
        label="Чутливість (дБ)"
        min={-60}
        max={-20}
        step={1}
        value={pending.noise}
        showValue
        onChange={(value) => setPending((prev) => ({ ...prev, noise: value }))}
      />
      <Slider
        label="Мін. пауза (с)"
        min={0.2}
        max={3}
        step={0.1}
        value={pending.minSilence}
        showValue
        onChange={(value) =>
          setPending((prev) => ({ ...prev, minSilence: value }))
        }
      />
      <Slider
        label="Допуск (с)"
        min={5}
        max={60}
        step={1}
        value={pending.tolerance}
        showValue
        onChange={(value) =>
          setPending((prev) => ({ ...prev, tolerance: value }))
        }
      />
      <LampButton
        type="button"
        tone="gray"
        size="md"
        disabled={isLoading}
        onClick={() => onReanalyze(pending)}
      >
        {isLoading ? 'Аналіз...' : 'Переаналізувати'}
      </LampButton>
    </div>
  );
};

const styles = {
  row: ['flex flex-wrap items-end gap-4'],
} as const;
