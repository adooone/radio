import type { Locale } from './locale';

export type PluralCategory = 'one' | 'few' | 'many' | 'other';

export type PluralForms = {
  one: string;
  few: string;
  many: string;
  other: string;
};

/** The old `getMelomanLabel` rule: 1 / 2–4 / 5+, with the 11–19 exception. */
const ukPluralCategory = (count: number): PluralCategory => {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;

  if (n > 10 && n < 20) return 'many';
  if (n1 > 1 && n1 < 5) return 'few';
  if (n1 === 1) return 'one';
  return 'many';
};

const enPluralCategory = (count: number): PluralCategory =>
  Math.abs(count) === 1 ? 'one' : 'other';

export const pluralCategory = (
  locale: Locale,
  count: number,
): PluralCategory =>
  locale === 'uk' ? ukPluralCategory(count) : enPluralCategory(count);
