import type { FC } from 'react';

export const Footer: FC = () => {
  return (
    <footer className="py-8 border-t border-white/5 bg-coal-relic mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
        <p className="text-gray-500 text-sm">
          Mojo UI — Retro-styled component library for React
        </p>
      </div>
    </footer>
  );
};

export default Footer;
