import clsx from 'clsx';

export const Fallback = () => (
  <div className={clsx(styles.fallback)}>
    <div className={clsx(styles.fallbackText)}>Відпочиваємо...</div>
  </div>
);

const styles = {
  fallback: [
    'relative w-full h-full flex flex-col items-center justify-center',
    'rounded-2xl shadow-2xl border border-moss/20 bg-coal-relic/40 overflow-hidden',
    'backdrop-blur-md',
  ],
  fallbackText: ['text-2xl font-display text-white/20'],
} as const;
