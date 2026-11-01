export type Locale = 'uk' | 'en';

export const LOCALES: readonly Locale[] = ['uk', 'en'];

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
