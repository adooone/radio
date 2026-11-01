import { useCallback } from 'react';
import { useLocale } from './locale-store';
import type { MessageKey, Vars } from './messages';
import { translate } from './translate';

export type T = (key: MessageKey, vars?: Vars) => string;

/** The listener's tongue, read live — the island and the switch both ride `useLocale`. */
export const useT = (): T => {
  const [locale] = useLocale();
  return useCallback(
    (key: MessageKey, vars?: Vars) => translate(locale, key, vars),
    [locale],
  );
};
