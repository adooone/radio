/**
 * Admin App-Specific Styles
 *
 * Vinyl-style buttons, glassmorphism patterns, and shared layout/grid
 * utilities used across the admin app.
 */

// =============================================================================
// Vinyl buttons
// =============================================================================

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

// =============================================================================
// Layout
// =============================================================================

/** Full container with padding and scroll */
export const container = ['w-full h-full p-4 overflow-auto pb-24'] as const;

/** Centered content wrapper with max width */
export const content = ['mx-auto max-w-7xl'] as const;

/** Page title styling */
export const title = [
  'mb-6 font-display text-3xl font-bold text-sun tracking-wide',
] as const;

// =============================================================================
// Glassmorphism cards & sections
// =============================================================================

/** Stats card with glassmorphism effect */
export const statsCard = [
  'rounded-2xl bg-stone-900/40 backdrop-blur-xl border border-white/5 p-6 text-white',
  'shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
  'relative overflow-hidden transition-all duration-300 hover:bg-stone-900/50',
  'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none',
] as const;

/** Stats title styling */
export const statsTitle = [
  'mb-3 text-sm font-display font-semibold text-gray-300 uppercase tracking-wide',
] as const;

/** Stats value styling */
export const statsValue = [
  'text-base font-semibold font-mono text-white',
] as const;

/** Stats value for online/active state */
export const statsValueOnline = [
  'text-base font-semibold font-mono text-green-400',
] as const;

/** Service control section with glassmorphism */
export const serviceSection = [
  'mt-6 rounded-2xl bg-stone-900/30 backdrop-blur-2xl border border-white/5 p-8',
  'shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
  'relative overflow-hidden transition-all duration-300 hover:bg-stone-900/40',
  'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/3 before:to-transparent before:pointer-events-none',
] as const;

/** Service section title */
export const serviceSectionTitle = [
  'mb-4 text-lg font-display font-semibold text-gray-200 uppercase tracking-wide',
] as const;

/** Actions section with glassmorphism */
export const actionsSection = [
  'mt-6 rounded-2xl bg-stone-900/30 backdrop-blur-2xl border border-white/5 p-8',
  'shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
  'relative overflow-hidden transition-all duration-300 hover:bg-stone-900/40',
  'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/3 before:to-transparent before:pointer-events-none',
] as const;

/** Actions section title */
export const actionsTitle = [
  'mb-4 text-lg font-display font-semibold text-gray-200 uppercase tracking-wide',
] as const;

/** Recent items section with glassmorphism */
export const recentSection = [
  'mt-6 rounded-2xl bg-stone-900/30 backdrop-blur-2xl border border-white/5 p-8',
  'shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]',
  'relative overflow-hidden transition-all duration-300 hover:bg-stone-900/40',
  'before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/3 before:to-transparent before:pointer-events-none',
] as const;

/** Recent item card */
export const recentItem = [
  'flex justify-between items-center p-5 rounded-xl bg-stone-800/30 border border-white/5',
  'backdrop-blur-xl transition-all duration-300 hover:bg-stone-800/40 hover:border-white/10',
  'shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)]',
] as const;

/** Recent item title */
export const recentTitle = ['font-medium text-gray-100'] as const;

/** Recent item metadata */
export const recentMeta = ['text-sm text-gray-400'] as const;

// =============================================================================
// Grid layouts
// =============================================================================

/** Stats grid - responsive 1-2-3 columns */
export const statsGrid = [
  'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
] as const;

/** Service grid - 1-2 columns */
export const serviceGrid = ['grid grid-cols-1 gap-6 lg:grid-cols-2'] as const;

/** Actions grid - responsive 1-2-3 columns */
export const actionsGrid = [
  'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 place-items-center',
] as const;

/** Recent items list */
export const recentList = ['space-y-3'] as const;

// =============================================================================
// Convenience exports
// =============================================================================

/** All glassmorphism patterns */
export const glassmorphism = {
  statsCard,
  statsTitle,
  statsValue,
  statsValueOnline,
  serviceSection,
  serviceSectionTitle,
  actionsSection,
  actionsTitle,
  recentSection,
  recentItem,
  recentTitle,
  recentMeta,
} as const;

/** All layout utilities */
export const layout = {
  container,
  content,
  title,
} as const;

/** All grid layouts */
export const grids = {
  statsGrid,
  serviceGrid,
  actionsGrid,
  recentList,
} as const;

export const sharedStyles = {
  buttonPrimary,
  buttonSecondary,
  buttonAccent,
  ...glassmorphism,
  ...layout,
  ...grids,
} as const;

export default sharedStyles;
