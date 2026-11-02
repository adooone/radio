import pugetSound from './art/puget-sound.svg?raw';
import splatHole from './art/splat-hole.svg?raw';
import splatInside from './art/splat-inside.svg?raw';
import splatOutside from './art/splat-outside.svg?raw';
import vinylRadio from './art/vinyl-radio.svg?raw';

/**
 * A Figma export made ready to sit inline: its ids scoped so the five
 * drawings can share one document, and hidden from the accessibility tree
 * (whatever composes them is the image).
 */
const inline = (svg: string, scope: string) =>
  svg
    .replace('<svg ', '<svg aria-hidden="true" ')
    .replace(/ id="([^"]+)"/g, ` id="${scope}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${scope}-$1)`);

export const ART = {
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
export const Art = ({ html, inset }: { html: string; inset: string }) => (
  <div
    className="absolute [&>svg]:block [&>svg]:size-full [&>svg]:max-w-none"
    style={{ inset }}
    // biome-ignore lint/security/noDangerouslySetInnerHtml: our own static exports, read at build time
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
