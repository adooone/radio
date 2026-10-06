import type { FC } from 'react';
import { Button } from '../../components/button';
import { CodeBlock } from '../components/code-block';

const installCode = `npm install @radio/mojo-ui

// or

yarn add @radio/mojo-ui`;

interface WelcomePageProps {
  onNavigate: (page: 'gallery' | 'layout' | 'tokens' | 'docs') => void;
}

export const WelcomePage: FC<WelcomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero Section - Two columns */}
      <section className="flex-1 flex items-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-moss-DEFAULT/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-river-DEFAULT/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sun-DEFAULT/5 rounded-full blur-3xl" />
        </div>

        {/* Right side visual - positioned as background with gradient fade */}
        <div
          className="hidden lg:block absolute right-0 top-0 h-full w-[55%]"
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 40%)',
          }}
        >
          <img
            src="/images/visual.jpg"
            alt="Mojo UI Visual Showcase"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="text-left py-16">
              {/* Title */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-10 tracking-tight">
                <span className="font-display">Mojo UI</span>
              </h1>

              {/* Tagline */}
              <p className="text-xl sm:text-2xl text-gray-400 mb-6 max-w-xl leading-relaxed">
                A retro-styled React component library with
                <span className="text-moss-calm"> 3D depth</span>,
                <span className="text-river-calm"> elegant gradients</span>, and
                <span className="text-sun-calm"> glowing effects</span>.
              </p>

              {/* Sub-tagline */}
              <p className="text-gray-500 mb-16 max-w-lg">
                Built with TypeScript, Tailwind CSS, and Framer Motion.
                Nature-inspired design tokens for cohesive, beautiful
                interfaces.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
                <Button
                  variant="green"
                  size="large"
                  title="Explore"
                  onClick={() => onNavigate('gallery')}
                />
                <Button
                  variant="gray"
                  size="large"
                  title="Documentation"
                  onClick={() => onNavigate('docs')}
                />
              </div>

              {/* Quick Install */}
              <div className="max-w-md">
                <CodeBlock code={installCode} />
              </div>
            </div>

            {/* Empty right column on mobile/tablet */}
            <div className="hidden lg:block" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;
