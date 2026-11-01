/**
 * The strict palette's warm family for nicknames: the old player let people
 * pick any color, here every name gets a steady shade of ember and amber so
 * the black/red world holds (decision on IDEA-11).
 */
export const NICKNAME_COLORS = [
  '#ffb84d',
  '#ff8a5c',
  '#e8695c',
  '#f2c94c',
  '#ff9d8a',
  '#d9a05b',
  '#ffc9a3',
  '#ff7a6e',
] as const;

const COLOR_CHOICE_KEY = 'nicknameColorChoice';

export const readColorChoice = (): string | null => {
  try {
    return localStorage.getItem(COLOR_CHOICE_KEY);
  } catch {
    return null;
  }
};

export const writeColorChoice = (color: string | null) => {
  try {
    if (color) localStorage.setItem(COLOR_CHOICE_KEY, color);
    else localStorage.removeItem(COLOR_CHOICE_KEY);
  } catch {
    // Private windows forget the choice; it still applies for the visit.
  }
};

/** A steady warm shade for a nickname; the listener's own name burns label-red. */
export const nicknameColor = (nickname: string, isSelf: boolean): string => {
  if (isSelf) return '#ff5647';
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = (hash << 5) - hash + nickname.charCodeAt(i);
    hash |= 0;
  }
  return NICKNAME_COLORS[Math.abs(hash) % NICKNAME_COLORS.length];
};
