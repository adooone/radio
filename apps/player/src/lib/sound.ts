const SOUNDS = {
  message: { src: '/sounds/message.mp3', volume: 0.2 },
  send: { src: '/sounds/send.wav', volume: 0.2 },
  join: { src: '/sounds/join.wav', volume: 0.3 },
} as const;

export type SoundName = keyof typeof SOUNDS;

export const SOUND_NAMES = Object.keys(SOUNDS) as SoundName[];

const STORAGE_KEY = 'soundSettings';
const DEBOUNCE_MS = 1_000;
const listeners = new Set<() => void>();
let lastPlay = 0;

type SoundSettings = { interfaceSounds: boolean } & Record<SoundName, boolean>;

const defaultSettings: SoundSettings = {
  interfaceSounds: true,
  message: true,
  send: true,
  join: true,
};

const readSettings = (): SoundSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

let settings = readSettings();

const persist = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Private windows forget the choice; the toggle still works for the visit.
  }
  for (const cb of listeners) cb();
};

export const soundsEnabled = () => settings.interfaceSounds;

export const soundTypeEnabled = (name: SoundName) => settings[name];

export const toggleSounds = () => {
  settings = { ...settings, interfaceSounds: !settings.interfaceSounds };
  persist();
};

export const toggleSoundType = (name: SoundName) => {
  settings = { ...settings, [name]: !settings[name] };
  persist();
};

export const clearSoundSettings = () => {
  settings = defaultSettings;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private windows forget the choice; the reset still applies for the visit.
  }
  for (const cb of listeners) cb();
};

export const onSoundsChange = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const playSound = (name: SoundName) => {
  if (!settings.interfaceSounds || !settings[name]) return;
  const now = Date.now();
  if (now - lastPlay < DEBOUNCE_MS) return;
  lastPlay = now;
  const { src, volume } = SOUNDS[name];
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
};
