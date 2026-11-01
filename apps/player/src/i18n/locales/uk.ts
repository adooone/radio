import type { Dictionary } from '../messages';

export const uk: Dictionary = {
  'status.loading': 'ловимо хвилю…',
  'status.offline': 'ефір тихий — платівка відпочиває',
  'status.live': 'в ефірі',
  'status.livePaused': 'в ефірі — натисни платівку',

  'vinyl.pause': 'Пауза',
  'vinyl.listenLive': 'Слухати ефір',

  'island.volume': 'Голосність',
  'island.liveTag': 'В ЕФІРІ',
  'island.offAirTag': 'ТИША',
  'island.openChat': 'Відкрити чат',
  'island.backToRadio': 'Назад до радіо',

  'chat.title': 'Чатік',
  'chat.muteSounds': 'Вимкнути звуки чату',
  'chat.unmuteSounds': 'Увімкнути звуки чату',
  'chat.openSettings': 'Відкрити налаштування',
  'chat.closeSettings': 'Закрити налаштування',
  'chat.listenersCount': {
    one: '{{count}} меломан на Городі',
    few: '{{count}} меломани на Городі',
    many: '{{count}} меломанів на Городі',
    other: '{{count}} меломанів на Городі',
  },

  'chat.input.placeholder': 'Шо кажеш?',
  'chat.input.send': 'Ентер',

  'chat.nickname.placeholder': "Твоє ім'я...",
  'chat.nickname.join': 'Хочу в чат',
  'chat.nickname.go': 'Погнали',
  'chat.nickname.error.tooShort': "Ім'я має бути не менше 2 символів",
  'chat.nickname.error.tooLong': "Ім'я має бути не більше 20 символів",
  'chat.nickname.error.reserved': "Це ім'я зарезервоване, спробуй інше",
  'chat.nickname.error.taken': "Це ім'я вже зайняте, спробуй інше",

  'chat.empty.noName': "Введи ім'я, щоб побачити чатік",
  'chat.empty.noMessages': 'Поки пусто, будь першим!',
  'chat.anonymous': 'Анонім',
  'chat.status.online': 'Онлайн',
  'chat.status.offline': 'Офлайн',

  'listeners.title': 'Меломани на Городі',
  'listeners.empty': 'Поки тут нікого немає',
  'listeners.self': 'це ти',
  'listeners.lastSeen.now': 'щойно',
  'listeners.lastSeen.minutes': {
    one: '{{count}} хвилину тому',
    few: '{{count}} хвилини тому',
    many: '{{count}} хвилин тому',
    other: '{{count}} хвилин тому',
  },
  'listeners.lastSeen.hours': {
    one: '{{count}} годину тому',
    few: '{{count}} години тому',
    many: '{{count}} годин тому',
    other: '{{count}} годин тому',
  },
  'listeners.lastSeen.days': {
    one: '{{count}} день тому',
    few: '{{count}} дні тому',
    many: '{{count}} днів тому',
    other: '{{count}} днів тому',
  },

  'settings.language.label': 'Мова',
  'settings.nickname.label': 'Нікнейм',
  'settings.nickname.save': 'Зберегти',
  'settings.color.label': 'Колір імені',
  'settings.color.auto': 'Авто',
  'settings.color.useColor': 'Обрати колір {{color}} для імені',
  'settings.sounds.label': 'Звуки чату',
  'settings.sounds.all': 'Усі звуки',
  'settings.sounds.newMessage': 'Нове повідомлення',
  'settings.sounds.sentMessage': 'Надіслане повідомлення',
  'settings.sounds.join': 'Хтось заходить',
  'settings.data.label': 'Дані',
  'settings.data.clear': 'Очистити всі дані',
  'settings.data.confirmText':
    'Це видалить твій нік, колір і налаштування звуку.',
  'settings.data.confirmYes': 'Так, очистити все',
  'settings.data.cancel': 'Скасувати',

  'icon.status': 'Статус',
  'icon.soundOn': 'Звук увімкнено',
  'icon.soundOff': 'Звук вимкнено',

  'meta.title': 'Puget Sound · Вінілове Радіо',
  'meta.description':
    'Puget Sound — вінілове радіо. Живий ефір зі справжніх платівок.',
};
