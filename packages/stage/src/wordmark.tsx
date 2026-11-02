import { ART, Art } from './art';
import { SplatRecord } from './splat-record';

type WordmarkProps = {
  className?: string;
  /** The splat record before the sign; off, the sign fills the lockup. */
  mark?: boolean;
};

/**
 * The Puget Sound lockup, set on one row for the corner: the splat record,
 * the stencil wordmark, the Vinyl Radio script beside it. Every drawing is
 * the Figma export (Laboratory → node 383:884) with its neon glow baked in,
 * and each box keeps its export's bleed insets so the glow can pass its
 * edges. Portrait keeps only the sign — the record on screen is the splat
 * there — set in the Figma hero's sign block (814.5 × 262.5) at the
 * design's box sizes, but with the wordmark and the script each centred,
 * the script under the wordmark.
 */
export const Wordmark = ({ className = '', mark = true }: WordmarkProps) => (
  <div
    role="img"
    aria-label="Puget Sound — Vinyl Radio"
    className={`flex items-center portrait:block ${className}`}
  >
    {mark && <SplatRecord className="w-[15%] shrink-0 portrait:hidden" />}
    {/* The sign block: the wordmark with the script beside it on wide
        screens (the same geometry as the old single row: 51.5 + 5.5 + 22 of
        the lockup = 79), and under its right end on portrait. */}
    <div
      className={`relative portrait:ml-0 portrait:aspect-[814.5/262.5] portrait:w-full ${
        mark ? 'ml-[6%] w-[79%]' : 'w-full'
      }`}
    >
      <div
        className="relative w-[65.19%] portrait:absolute portrait:top-0 portrait:left-[11.14%] portrait:h-[53.26%] portrait:w-[77.72%]"
        style={{ aspectRatio: '633 / 139.8' }}
      >
        <Art html={ART.pugetSound} inset="-17.88% -3.95%" />
      </div>
      <div
        className="absolute top-1/2 left-[72.15%] w-[27.85%] -translate-y-[41%] portrait:top-[50.67%] portrait:left-[32.72%] portrait:h-[49.33%] portrait:w-[34.56%] portrait:translate-y-0"
        style={{ aspectRatio: '281.5 / 129.5' }}
      >
        <Art html={ART.vinylRadio} inset="-19.16% -8.01% -19.05% -6.76%" />
      </div>
    </div>
  </div>
);
