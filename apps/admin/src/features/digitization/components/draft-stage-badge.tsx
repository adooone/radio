import { Badge, type BadgeVariant } from '@dendelion/mojo-ui';
import type { DigitizationStage } from '@radio/types';

type DraftStageBadgeProps = {
  stage: DigitizationStage;
};

export const DraftStageBadge = ({ stage }: DraftStageBadgeProps) => {
  const { label, variant } = stageInfo[stage];

  return <Badge variant={variant}>{label}</Badge>;
};

const stageInfo: Record<
  DigitizationStage,
  { label: string; variant: BadgeVariant }
> = {
  'awaiting-sides': { label: 'Очікує сторони', variant: 'default' },
  'ready-to-split': { label: 'Готово до розкрою', variant: 'info' },
  'ready-to-encode': { label: 'Готово до кодування', variant: 'sun' },
  'on-air': { label: 'В ефірі', variant: 'moss' },
};
