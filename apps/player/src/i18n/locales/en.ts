import type { Dictionary } from '../messages';

export const en: Dictionary = {
  'status.loading': 'catching the wave…',
  'status.offline': 'the air is quiet — the record is resting',
  'status.live': 'on air',
  'status.livePaused': 'on air — tap the record',

  'vinyl.pause': 'Pause',
  'vinyl.listenLive': 'Listen live',

  'island.volume': 'Volume',
  'island.liveTag': 'LIVE',
  'island.offAirTag': 'OFF AIR',
  'island.openChat': 'Open the chat',
  'island.backToRadio': 'Back to the radio',

  'chat.title': 'Chatroom',
  'chat.muteSounds': 'Mute chat sounds',
  'chat.unmuteSounds': 'Unmute chat sounds',
  'chat.openSettings': 'Open settings',
  'chat.closeSettings': 'Close settings',
  'chat.listenersCount': {
    one: '{{count}} listener online',
    few: '{{count}} listeners online',
    many: '{{count}} listeners online',
    other: '{{count}} listeners online',
  },

  'chat.input.placeholder': 'Say something…',
  'chat.input.send': 'Send',

  'chat.nickname.placeholder': 'Your name…',
  'chat.nickname.join': 'Join the chat',
  'chat.nickname.go': "Let's go",
  'chat.nickname.error.tooShort': 'The name has to be at least 2 characters',
  'chat.nickname.error.tooLong': 'The name has to be at most 20 characters',
  'chat.nickname.error.reserved': 'That name is reserved, try another',
  'chat.nickname.error.taken': 'That name is already taken, try another',

  'chat.empty.noName': 'Enter a name to see the chat',
  'chat.empty.noMessages': 'Nothing here yet — be the first!',
  'chat.anonymous': 'Anonymous',
  'chat.status.online': 'Online',
  'chat.status.offline': 'Offline',

  'listeners.title': 'Listeners',
  'listeners.empty': 'No one is here yet',
  'listeners.self': "that's you",
  'listeners.lastSeen.now': 'just now',
  'listeners.lastSeen.minutes': {
    one: '{{count}}m ago',
    few: '{{count}}m ago',
    many: '{{count}}m ago',
    other: '{{count}}m ago',
  },
  'listeners.lastSeen.hours': {
    one: '{{count}}h ago',
    few: '{{count}}h ago',
    many: '{{count}}h ago',
    other: '{{count}}h ago',
  },
  'listeners.lastSeen.days': {
    one: '{{count}}d ago',
    few: '{{count}}d ago',
    many: '{{count}}d ago',
    other: '{{count}}d ago',
  },

  'settings.nickname.label': 'Nickname',
  'settings.nickname.save': 'Save',
  'settings.color.label': 'Name colour',
  'settings.color.auto': 'Auto',
  'settings.color.useColor': 'Use {{color}} as the name colour',
  'settings.sounds.label': 'Chat sounds',
  'settings.sounds.all': 'All sounds',
  'settings.sounds.newMessage': 'New message',
  'settings.sounds.sentMessage': 'Sent message',
  'settings.sounds.join': 'Someone joins',
  'settings.data.label': 'Data',
  'settings.data.clear': 'Clear all data',
  'settings.data.confirmText':
    'This clears your nickname, colour and sound settings.',
  'settings.data.confirmYes': 'Yes, clear everything',
  'settings.data.cancel': 'Cancel',

  'icon.status': 'Status',
  'icon.soundOn': 'Sound on',
  'icon.soundOff': 'Sound off',

  'meta.title': 'Puget Sound · Vinyl Radio',
  'meta.description':
    'Puget Sound — vinyl radio. Live air from spinning records.',
};
