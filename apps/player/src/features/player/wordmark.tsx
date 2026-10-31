import pugetSound from './art/puget-sound.svg?raw';
import splatHole from './art/splat-hole.svg?raw';
import splatInside from './art/splat-inside.svg?raw';
import splatOutside from './art/splat-outside.svg?raw';
import vinylRadio from './art/vinyl-radio.svg?raw';

type WordmarkProps = {
  className?: string;
};

/**
 * A Figma export made ready to sit inline: its ids scoped so the five
 * drawings can share one document, and hidden from the accessibility tree
 * (the lockup's wrapper is the image).
 */
const inline = (svg: string, scope: string) =>
  svg
    .replace('<svg ', '<svg aria-hidden="true" ')
    .replace(/ id="([^"]+)"/g, ` id="${scope}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${scope}-$1)`);

const ART = {
  splatOutside: inline(splatOutside, 'so'),
  splatInside: inline(splatInside, 'si'),
  splatHole: inline(splatHole, 'sh'),
  pugetSound: inline(pugetSound, 'ps'),
  vinylRadio: inline(vinylRadio, 'vr'),
};

/**
 * One drawing, inline rather than an <img>: WebKit rasterises an SVG image
 * that carries filters at 1× and scales it up, which blurred the neon glow
 * on phones; inline, the filters render at the screen's resolution.
 */
const Art = ({ html, inset }: { html: string; inset: string }) => (
  <div
    className="absolute [&>svg]:block [&>svg]:size-full [&>svg]:max-w-none"
    style={{ inset }}
    // biome-ignore lint/security/noDangerouslySetInnerHtml: our own static exports, read at build time
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

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
export const Wordmark = ({ className = '' }: WordmarkProps) => (
  <div
    role="img"
    aria-label="Puget Sound — Vinyl Radio"
    className={`flex items-center portrait:block ${className}`}
  >
    <div
      className="relative w-[15%] shrink-0 portrait:hidden"
      style={{ aspectRatio: '169.2 / 153.1' }}
    >
      <div className="absolute inset-0">
        <Art html={ART.splatOutside} inset="-1.01% -1.45% -1.53% -0.83%" />
        <div
          className="absolute"
          style={{
            left: '27.25%',
            top: '25.54%',
            width: '41.31%',
            height: '45.66%',
          }}
        >
          <Art html={ART.splatInside} inset="-143.07% -143.03%" />
        </div>
        <div
          className="absolute"
          style={{
            left: '43.4%',
            top: '43.37%',
            width: '9.1%',
            height: '10.06%',
          }}
        >
          <Art
            html={ART.splatHole}
            inset="-119.01% -118.98% -119.01% -118.97%"
          />
        </div>
      </div>
    </div>
    {/* The sign block: the wordmark with the script beside it on wide
        screens (the same geometry as the old single row: 51.5 + 5.5 + 22 of
        the lockup = 79), and under its right end on portrait. */}
    <div className="relative ml-[6%] w-[79%] portrait:ml-0 portrait:aspect-[814.5/262.5] portrait:w-full">
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
