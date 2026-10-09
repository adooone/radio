import type { FC } from 'react';

export const ArrowUpIcon: FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Arrow Up"
  >
    <title>Arrow Up</title>
    <path d="M5 15l7-7 7 7" />
  </svg>
);
