import type { Locale } from './locale';
import { en } from './locales/en';
import { uk } from './locales/uk';
import {
  type Dictionary,
  type MessageKey,
  type Vars,
  resolveMessage,
} from './messages';

const dictionaries: Record<Locale, Dictionary> = { en, uk };

export const translate = (
  locale: Locale,
  key: MessageKey,
  vars?: Vars,
): string => resolveMessage(locale, dictionaries[locale][key], vars);
