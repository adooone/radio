import type { Locale } from './locale';
import { type PluralForms, pluralCategory } from './plural';

export type Vars = Record<string, string | number>;

export type Message = string | PluralForms;

export type MessageKey =
  | 'status.loading'
  | 'status.offline'
  | 'status.live'
  | 'status.livePaused'
  | 'vinyl.pause'
  | 'vinyl.listenLive'
  | 'island.volume'
  | 'island.liveTag'
  | 'island.offAirTag'
  | 'island.openChat'
  | 'island.backToRadio'
  | 'chat.title'
  | 'chat.muteSounds'
  | 'chat.unmuteSounds'
  | 'chat.openSettings'
  | 'chat.closeSettings'
  | 'chat.listenersCount'
  | 'chat.input.placeholder'
  | 'chat.input.send'
  | 'chat.nickname.placeholder'
  | 'chat.nickname.join'
  | 'chat.nickname.go'
  | 'chat.nickname.error.tooShort'
  | 'chat.nickname.error.tooLong'
  | 'chat.nickname.error.reserved'
  | 'chat.nickname.error.taken'
  | 'chat.empty.noName'
  | 'chat.empty.noMessages'
  | 'chat.anonymous'
  | 'chat.status.online'
  | 'chat.status.offline'
  | 'listeners.title'
  | 'listeners.empty'
  | 'listeners.self'
  | 'listeners.lastSeen.now'
  | 'listeners.lastSeen.minutes'
  | 'listeners.lastSeen.hours'
  | 'listeners.lastSeen.days'
  | 'settings.language.label'
  | 'settings.nickname.label'
  | 'settings.nickname.save'
  | 'settings.color.label'
  | 'settings.color.auto'
  | 'settings.color.useColor'
  | 'settings.sounds.label'
  | 'settings.sounds.all'
  | 'settings.sounds.newMessage'
  | 'settings.sounds.sentMessage'
  | 'settings.sounds.join'
  | 'settings.data.label'
  | 'settings.data.clear'
  | 'settings.data.confirmText'
  | 'settings.data.confirmYes'
  | 'settings.data.cancel'
  | 'icon.status'
  | 'icon.soundOn'
  | 'icon.soundOff'
  | 'meta.title'
  | 'meta.description';

export type Dictionary = Record<MessageKey, Message>;

const interpolate = (template: string, vars?: Vars): string => {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
};

export const resolveMessage = (
  locale: Locale,
  message: Message,
  vars?: Vars,
): string => {
  if (typeof message === 'string') return interpolate(message, vars);
  const count = typeof vars?.count === 'number' ? vars.count : 0;
  return interpolate(message[pluralCategory(locale, count)], vars);
};
