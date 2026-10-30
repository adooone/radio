import { describe, expect, it } from 'vitest';
import { nextStatus, statusLine } from './radio-state';

describe('nextStatus', () => {
  it('turns live when a manifest parses, whatever came before', () => {
    expect(nextStatus('loading', 'manifest')).toBe('live');
    expect(nextStatus('offline', 'manifest')).toBe('live');
  });

  it('turns offline on a fatal error', () => {
    expect(nextStatus('live', 'fatal')).toBe('offline');
    expect(nextStatus('loading', 'fatal')).toBe('offline');
  });

  it('retries only out of the quiet state', () => {
    expect(nextStatus('offline', 'retry')).toBe('loading');
    expect(nextStatus('live', 'retry')).toBe('live');
    expect(nextStatus('loading', 'retry')).toBe('loading');
  });
});

describe('statusLine', () => {
  it('speaks the air state', () => {
    expect(statusLine('loading', false)).toBe('ловимо хвилю…');
    expect(statusLine('live', false)).toBe('в ефірі — натисни платівку');
    expect(statusLine('live', true)).toBe('в ефірі');
    expect(statusLine('offline', false)).toBe(
      'ефір тихий — платівка відпочиває',
    );
  });
});
