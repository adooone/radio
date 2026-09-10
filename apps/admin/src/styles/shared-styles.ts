/**
 * Admin App-Specific Styles
 * 
 * Vinyl-style buttons and other app-specific styling.
 * Glassmorphism patterns have been moved to @dendelion/mojo-ui.
 */

// Vinyl record style button - fully rounded with double border effect
export const buttonPrimary = [
  'inline-flex items-center justify-center rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 px-5 py-2.5 text-coal font-bold font-display',
  'relative overflow-hidden transform transition-all duration-300',
  'shadow-[0_0_0_2px_rgba(245,158,11,0.8),0_0_0_4px_rgba(245,158,11,0.3),0_8px_32px_rgba(0,0,0,0.4)]',
  'hover:shadow-[0_0_0_2px_rgba(245,158,11,1),0_0_0_6px_rgba(245,158,11,0.5),0_12px_40px_rgba(245,158,11,0.3)]',
  'hover:scale-105 active:scale-95',
  // Vinyl record grooves effect - concentric circles
  'before:absolute before:inset-2 before:rounded-full before:border before:border-amber-600/30',
  'after:absolute after:inset-4 after:rounded-full after:border after:border-amber-700/20',
  // Center hole effect
  '[&>*]:relative [&>*]:z-10',
  // Disabled states
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
  'disabled:shadow-[0_0_0_2px_rgba(245,158,11,0.4),0_0_0_4px_rgba(245,158,11,0.2),0_4px_16px_rgba(0,0,0,0.2)]',
] as const;

export const buttonSecondary = [
  'inline-flex items-center justify-center rounded-full bg-gradient-to-b from-stone-700 via-stone-800 to-stone-900 px-4 py-2 text-stone-100 font-semibold font-display',
  'relative overflow-hidden transform transition-all duration-300',
  'shadow-[0_0_0_2px_rgba(120,113,108,0.6),0_0_0_4px_rgba(120,113,108,0.2),0_6px_24px_rgba(0,0,0,0.3)]',
  'hover:shadow-[0_0_0_2px_rgba(120,113,108,0.8),0_0_0_5px_rgba(120,113,108,0.3),0_8px_32px_rgba(0,0,0,0.4)]',
  'hover:scale-105 active:scale-95',
  // Vinyl record grooves effect - concentric circles
  'before:absolute before:inset-2 before:rounded-full before:border before:border-stone-600/30',
  'after:absolute after:inset-4 after:rounded-full after:border after:border-stone-500/20',
  // Center hole effect
  '[&>*]:relative [&>*]:z-10',
  // Disabled states
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
  'disabled:shadow-[0_0_0_2px_rgba(120,113,108,0.3),0_0_0_4px_rgba(120,113,108,0.1),0_4px_16px_rgba(0,0,0,0.2)]',
] as const;

export const buttonAccent = [
  'inline-flex items-center justify-center rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 px-4 py-2 text-coal font-semibold font-display',
  'relative overflow-hidden transform transition-all duration-300',
  'shadow-[0_0_0_2px_rgba(251,191,36,0.7),0_0_0_4px_rgba(251,191,36,0.3),0_6px_24px_rgba(251,191,36,0.2)]',
  'hover:shadow-[0_0_0_2px_rgba(251,191,36,0.9),0_0_0_5px_rgba(251,191,36,0.4),0_8px_32px_rgba(251,191,36,0.3)]',
  'hover:scale-105 active:scale-95',
  // Vinyl record grooves effect - concentric circles with golden accent
  'before:absolute before:inset-2 before:rounded-full before:border before:border-amber-500/40',
  'after:absolute after:inset-4 after:rounded-full after:border after:border-amber-600/30',
  // Center hole effect with golden shine
  '[&>*]:relative [&>*]:z-10',
  // Disabled states
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100',
  'disabled:shadow-[0_0_0_2px_rgba(251,191,36,0.3),0_0_0_4px_rgba(251,191,36,0.1),0_4px_16px_rgba(0,0,0,0.2)]',
] as const;

export const sharedStyles = {
  buttonPrimary,
  buttonSecondary,
  buttonAccent,
} as const;

export default sharedStyles;
