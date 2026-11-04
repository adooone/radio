import { seedOf } from '@radio/stage';
import { describe, expect, it } from 'vitest';

describe('seedOf', () => {
  it('gives one album the same seed every time', () => {
    const cover = 'https://stream.adoo.one/media/p-sound/a/img/cover.webp';
    expect(seedOf(cover)).toBe(seedOf(cover));
  });

  it('gives different albums different seeds', () => {
    expect(seedOf('a/cover.webp')).not.toBe(seedOf('b/cover.webp'));
  });

  it('stays a whole unsigned 32-bit number', () => {
    const seed = seedOf('Breathe');
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });
});
