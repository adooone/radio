import type { FC } from 'react';

export const ArrowDownIcon: FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-label="Arrow Down"
  >
    <title>Arrow Down</title>
    <path d="M19 9l-7 7-7-7" />
  </svg>
);
