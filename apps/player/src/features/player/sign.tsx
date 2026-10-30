/**
 * The Puget Sound sign, as drawn in Figma (Laboratory → node 383:884): the
 * splat record, the stencil wordmark and the Vinyl Radio script, each an
 * exported SVG with its neon glow baked in. The percentage insets copy the
 * design's geometry — every image canvas is a little larger than its layout
 * box so the glow can bleed past it.
 */

type SplatMarkProps = {
  className?: string;
  /** Turn the record at 33⅓ while the air plays. */
  spinning?: boolean;
};

/** The splat record: ink splat, glowing label, spindle. */
export const SplatMark = ({
  className = '',
  spinning = false,
}: SplatMarkProps) => (
  <div
    className={`relative ${className}`}
    style={{ aspectRatio: '169.2 / 153.1' }}
    aria-hidden="true"
  >
    <div className={`absolute inset-0 ${spinning ? 'splat-spin' : ''}`}>
      <div className="absolute" style={{ inset: '-1.01% -1.45% -1.53% -0.83%' }}>
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
);

/** The wordmark with the script tucked under its right end, one fixed-aspect block. */
export const SignText = ({ className = '' }: { className?: string }) => (
  <div
    role="img"
    aria-label="Puget Sound — Vinyl Radio"
    className={`relative ${className}`}
    style={{ aspectRatio: '814.5 / 262.5' }}
  >
    <div
      className="absolute"
      style={{ left: 0, top: 0, width: '77.72%', height: '53.26%' }}
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
      className="absolute"
      style={{ left: '65.44%', top: '50.67%', width: '34.56%', height: '49.33%' }}
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
