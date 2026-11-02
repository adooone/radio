import pugetSound from '../art/puget-sound.svg?raw';
import splatHole from '../art/splat-hole.svg?raw';
import splatInside from '../art/splat-inside.svg?raw';
import splatOutside from '../art/splat-outside.svg?raw';
import vinylRadio from '../art/vinyl-radio.svg?raw';

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

const Art = ({ html, inset }: { html: string; inset: string }) => (
  <div
    className="absolute [&>svg]:block [&>svg]:size-full [&>svg]:max-w-none"
    style={{ inset }}
    // biome-ignore lint/security/noDangerouslySetInnerHtml: our own static exports, read at build time
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export const Wordmark = ({ className = '' }: { className?: string }) => (
  <div
    role="img"
    aria-label="Puget Sound — Vinyl Radio"
    className={`flex items-center ${className}`}
  >
    <div
      className="relative w-[15%] shrink-0"
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
    <div className="relative ml-[6%] w-[79%]">
      <div
        className="relative w-[65.19%]"
        style={{ aspectRatio: '633 / 139.8' }}
      >
        <Art html={ART.pugetSound} inset="-17.88% -3.95%" />
      </div>
      <div
        className="absolute top-1/2 left-[72.15%] w-[27.85%] -translate-y-[41%]"
        style={{ aspectRatio: '281.5 / 129.5' }}
      >
        <Art html={ART.vinylRadio} inset="-19.16% -8.01% -19.05% -6.76%" />
      </div>
    </div>
  </div>
);
