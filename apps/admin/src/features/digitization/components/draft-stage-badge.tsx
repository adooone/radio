import { Stamp, type StampVariant } from '@dendelion/func-ui';
import type { DigitizationStage } from '@radio/types';

type DraftStageBadgeProps = {
  stage: DigitizationStage;
};

export const DraftStageBadge = ({ stage }: DraftStageBadgeProps) => {
  const { label, variant, fillColor, textColor } = stageInfo[stage];

  return (
    <Stamp variant={variant} fillColor={fillColor} textColor={textColor}>
      {label}
    </Stamp>
  );
};

const stageInfo: Record<
  DigitizationStage,
  {
    label: string;
    variant?: StampVariant;
    fillColor?: string;
    textColor?: string;
  }
> = {
  'awaiting-sides': { label: 'Очікує сторони', variant: 'neutral' },
  'ready-to-split': { label: 'Готово до розкрою', variant: 'info' },
  'ready-to-encode': {
    label: 'Готово до кодування',
    fillColor: '#ff9f1c',
    textColor: '#1f1f1f',
  },
  'on-air': {
    label: 'В ефірі',
    fillColor: '#8aa982',
    textColor: '#1f1f1f',
  },
};
