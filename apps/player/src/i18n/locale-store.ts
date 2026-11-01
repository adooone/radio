import { useEffect, useState } from 'react';
import { type Locale, isLocale } from './locale';

const STORAGE_KEY = 'radio.locale';

const detectBrowserLocale = (): Locale =>
  typeof navigator !== 'undefined' &&
  navigator.language.toLowerCase().startsWith('uk')
    ? 'uk'
    : 'en';

/** The saved tongue; read at import, so blocked storage must not throw. */
export const readStoredLocale = (): Locale | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
};

export const detectInitialLocale = (): Locale =>
  readStoredLocale() ?? detectBrowserLocale();

const listeners = new Set<(locale: Locale) => void>();
let currentLocale = detectInitialLocale();

export const getLocale = (): Locale => currentLocale;

export const setLocale = (locale: Locale): void => {
  currentLocale = locale;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Private windows forget the choice; it still applies for the visit.
  }
  for (const listener of listeners) listener(locale);
};

/** The listener's chosen tongue, live across every component at once. */
export const useLocale = (): [Locale, (locale: Locale) => void] => {
  const [locale, setLocaleState] = useState(currentLocale);

  useEffect(() => {
    listeners.add(setLocaleState);
    return () => {
      listeners.delete(setLocaleState);
    };
  }, []);

  return [locale, setLocale];
};
