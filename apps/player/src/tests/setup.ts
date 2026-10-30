import '@testing-library/jest-dom/vitest';

// jsdom has no canvas; the grain tile and the scratches bail out when
// getContext returns null.
HTMLCanvasElement.prototype.getContext = (() => null) as never;

// jsdom implements no media pipeline either; the engine only needs the calls to exist.
HTMLMediaElement.prototype.play = (() => Promise.resolve()) as never;
HTMLMediaElement.prototype.pause = (() => {}) as never;
