/** The chat's little noises, carried over from the old player. */
const SOUNDS = {
  message: { src: '/sounds/message.mp3', volume: 0.2 },
  send: { src: '/sounds/send.wav', volume: 0.2 },
  join: { src: '/sounds/join.wav', volume: 0.3 },
} as const;

export type SoundName = keyof typeof SOUNDS;

const STORAGE_KEY = 'soundSettings';
const DEBOUNCE_MS = 1_000;
const listeners = new Set<() => void>();
let lastPlay = 0;

let enabled = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).interfaceSounds !== false : true;
  } catch {
    return true;
  }
})();

export const soundsEnabled = () => enabled;

export const toggleSounds = () => {
  enabled = !enabled;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ interfaceSounds: enabled }),
    );
  } catch {
    // Private windows forget the choice; the toggle still works for the visit.
  }
  for (const cb of listeners) cb();
};

export const onSoundsChange = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Play a chat sound — muted, or within a second of the last one, it stays quiet. */
export const playSound = (name: SoundName) => {
  if (!enabled) return;
  const now = Date.now();
  if (now - lastPlay < DEBOUNCE_MS) return;
  lastPlay = now;
  const { src, volume } = SOUNDS[name];
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
};
