import '@testing-library/jest-dom/vitest';

// jsdom has no canvas; the disc, the grain tile and the scratches bail out
// when getContext returns null.
HTMLCanvasElement.prototype.getContext = (() => null) as never;

// jsdom implements no media pipeline either; the engine only needs the calls to exist.
HTMLMediaElement.prototype.play = (() => Promise.resolve()) as never;
HTMLMediaElement.prototype.pause = (() => {}) as never;

// No WebSocket in jsdom: the chat connects to nothing and shows its gate.
class SilentSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  readyState = 3;
  addEventListener() {}
  removeEventListener() {}
  send() {}
  close() {}
}
(globalThis as { WebSocket?: unknown }).WebSocket = SilentSocket;

// No ResizeObserver either; the vinyl box only needs the shape.
class SilentResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver =
  SilentResizeObserver;

// jsdom knows no media queries; reduced motion reads as off.
window.matchMedia =
  window.matchMedia ||
  ((query: string) =>
    ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as never);
