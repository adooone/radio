type WordmarkProps = {
  className?: string;
  /** Turn the splat record at 33⅓ while the air plays. */
  spinning?: boolean;
};

/**
 * The Puget Sound lockup, set on one row for the corner: the splat record,
 * the stencil wordmark, the Vinyl Radio script beside it. Every image is the
 * Figma export (Laboratory → node 383:884) with its neon glow baked in, and
 * each box keeps its export's bleed insets so the glow can pass its edges.
 * (The hero arrangement stacks the script under the wordmark's right end —
 * script box at 65.44% / 50.67% inside the 814.5 × 262.5 sign block.)
 */
export const Wordmark = ({ className = '', spinning = false }: WordmarkProps) => (
  <div
    role="img"
    aria-label="Puget Sound — Vinyl Radio"
    className={`flex items-center ${className}`}
  >
    <div
      className="relative w-[15%] shrink-0"
      style={{ aspectRatio: '169.2 / 153.1' }}
    >
      <div className={`absolute inset-0 ${spinning ? 'splat-spin' : ''}`}>
        <div
          className="absolute"
          style={{ inset: '-1.01% -1.45% -1.53% -0.83%' }}
        >
          <img
            alt=""
            src="/brand/splat-outside.svg"
            className="block size-full max-w-none"
          />
        </div>
        <div
          className="absolute"
          style={{ left: '27.25%', top: '25.54%', width: '41.31%', height: '45.66%' }}
        >
          <div className="absolute" style={{ inset: '-143.07% -143.03%' }}>
            <img
              alt=""
              src="/brand/splat-inside.svg"
              className="block size-full max-w-none"
            />
          </div>
        </div>
        <div
          className="absolute"
          style={{ left: '43.4%', top: '43.37%', width: '9.1%', height: '10.06%' }}
        >
          <div
            className="absolute"
            style={{ inset: '-119.01% -118.98% -119.01% -118.97%' }}
          >
            <img
              alt=""
              src="/brand/splat-hole.svg"
              className="block size-full max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      className="relative ml-[6%] w-[51.5%] shrink-0"
      style={{ aspectRatio: '633 / 139.8' }}
    >
      <div className="absolute" style={{ inset: '-17.88% -3.95%' }}>
        <img
          alt=""
          src="/brand/puget-sound.svg"
          className="block size-full max-w-none"
        />
      </div>
    </div>
    <div
      className="relative ml-[5.5%] w-[22%] shrink-0"
      style={{ aspectRatio: '281.5 / 129.5', transform: 'translateY(9%)' }}
    >
      <div
        className="absolute"
        style={{ inset: '-19.16% -8.01% -19.05% -6.76%' }}
      >
        <img
          alt=""
          src="/brand/vinyl-radio.svg"
          className="block size-full max-w-none"
        />
      </div>
    </div>
  </div>
);
