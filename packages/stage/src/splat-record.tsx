import { ART, Art } from './art';

type SplatRecordProps = {
  className?: string;
};

/**
 * The splat record on its own — the logo's vinyl, drawn from the three
 * Figma exports (outline, inner shadows, spindle hole) with their neon glow
 * baked in. The wordmark leads with it; the admin hangs it on the island
 * and slides it out of the on-air sleeve. The caller sets the width; the
 * export's own aspect keeps the height.
 */
export const SplatRecord = ({ className = '' }: SplatRecordProps) => (
  <div
    className={`relative ${className}`}
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
);
