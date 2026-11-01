export { isLocale, LOCALES, type Locale } from './locale';
export { getLocale, setLocale, useLocale } from './locale-store';
export type { Dictionary, MessageKey, Vars } from './messages';
export {
  pluralCategory,
  type PluralCategory,
  type PluralForms,
} from './plural';
export { translate } from './translate';
export { type T, useT } from './use-t';
