import type { DigitizationDraft, DigitizationStage } from '@radio/types';

export type StageKey = 'upload' | 'metadata' | 'split' | 'publish' | 'on-air';

/** The record's way through the studio, in the order the work happens. */
export const STAGES: Array<{ key: StageKey; label: string }> = [
  { key: 'upload', label: 'Завантаження' },
  { key: 'metadata', label: 'Метадані' },
  { key: 'split', label: 'Розкрій' },
  { key: 'publish', label: 'Публікація' },
  { key: 'on-air', label: 'В ефірі' },
];

/* Wave's four stages, read as the five steps the chips show: a draft ready
   to split still wants its metadata first. */
export const stageKeyOf = (draft: DigitizationDraft): StageKey => {
  if (draft.stage === 'awaiting-sides') return 'upload';
  if (draft.stage === 'ready-to-split') {
    return draft.hasMetadata ? 'split' : 'metadata';
  }
  if (draft.stage === 'ready-to-encode') return 'publish';
  return 'on-air';
};

export const stageIndex = (key: StageKey) =>
  STAGES.findIndex((stage) => stage.key === key);

export const STAGE_LABELS: Record<DigitizationStage, string> = {
  'awaiting-sides': 'очікує сторони',
  'ready-to-split': 'готово до розкрою',
  'ready-to-encode': 'готово до публікації',
  'on-air': 'в ефірі',
};

export const nextStepHint = (draft: DigitizationDraft): string => {
  if (draft.stage === 'awaiting-sides') return 'далі: завантажте side-*.wav';
  if (draft.stage === 'ready-to-split' && !draft.hasMetadata) {
    return 'далі: отримайте метадані з Discogs';
  }
  if (draft.stage === 'ready-to-split')
    return 'далі: розкроїть сторони на треки';
  if (draft.stage === 'ready-to-encode') return 'далі: опублікуйте запис';
  return 'запис в ефірі';
};

export const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '';
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} ГБ`;
  if (bytes >= 1024 ** 2) return `${Math.round(bytes / 1024 ** 2)} МБ`;
  return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
};

export const filesCount = (count: number): string => {
  if (count === 1) return '1 файл';
  if (count >= 2 && count <= 4) return `${count} файли`;
  return `${count} файлів`;
};
