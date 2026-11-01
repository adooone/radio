import { translate } from '@/i18n';
import { describe, expect, it } from 'vitest';
import { nextStatus, statusLine } from './radio-state';

const t = (key: Parameters<typeof translate>[1]) => translate('en', key);

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
    expect(statusLine('loading', false, t)).toBe(t('status.loading'));
    expect(statusLine('live', false, t)).toBe(t('status.livePaused'));
    expect(statusLine('live', true, t)).toBe(t('status.live'));
    expect(statusLine('offline', false, t)).toBe(t('status.offline'));
  });
});
