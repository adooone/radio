/**
 * The sign, set in type rather than the Figma export: the stencil wordmark
 * and the script line both burn label-red with the warm glow — the one place
 * red text is allowed (decision on IDEA-11).
 */
export const Wordmark = () => (
  <header className="pointer-events-none select-none text-center">
    <h1 className="neon font-serif text-[clamp(24px,3.4vw,42px)] font-semibold tracking-[0.3em]">
      PUGET SOUND
    </h1>
    <p className="neon-soft -mt-0.5 font-serif text-[clamp(13px,1.5vw,19px)] italic">
      вінілове радіо
    </p>
  </header>
);
