import { useState } from 'react';
import type { FC } from 'react';

export type Page = 'welcome' | 'gallery' | 'layout' | 'tokens' | 'docs';

interface NavProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

const navItems: { id: Page; label: string }[] = [
  { id: 'welcome', label: 'Home' },
  { id: 'gallery', label: 'Components' },
  { id: 'layout', label: 'Layouts' },
  { id: 'tokens', label: 'Design Tokens' },
  { id: 'docs', label: 'Documentation' },
];

// Sun icon for light mode
const SunIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Light mode"
  >
    <title>Light mode</title>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// Moon icon for dark mode
const MoonIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label="Dark mode"
  >
    <title>Dark mode</title>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export const ShowcaseNav: FC<NavProps> = ({ currentPage, onPageChange }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Theme toggle is currently visual only
    // Full theme implementation would toggle class on document
    console.log('Theme toggle clicked - visual only for now');
  };

  return (
    <nav className="sticky top-0 z-50 bg-coal-relic/95 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onPageChange('welcome')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-moss-DEFAULT flex items-center justify-center">
              <span className="text-coal-relic font-bold text-sm font-display">
                M
              </span>
            </div>
            <span className="text-white font-display text-lg tracking-wide">
              Mojo UI
            </span>
          </button>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPageChange(item.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-moss-DEFAULT text-white shadow-lg shadow-moss-DEFAULT/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="ml-2 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={
                isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ShowcaseNav;
