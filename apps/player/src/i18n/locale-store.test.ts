import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  detectInitialLocale,
  getLocale,
  readStoredLocale,
  setLocale,
} from './locale-store';

const setBrowserLanguage = (language: string) => {
  Object.defineProperty(navigator, 'language', {
    value: language,
    configurable: true,
  });
};

describe('readStoredLocale / detectInitialLocale', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('reads nothing when localStorage holds no locale', () => {
    expect(readStoredLocale()).toBeNull();
  });

  it('ignores a value that is not a known locale', () => {
    localStorage.setItem('radio.locale', 'fr');
    expect(readStoredLocale()).toBeNull();
  });

  it('reads back a stored locale', () => {
    localStorage.setItem('radio.locale', 'uk');
    expect(readStoredLocale()).toBe('uk');
  });

  it('falls back to the browser language when nothing is stored', () => {
    setBrowserLanguage('uk-UA');
    expect(detectInitialLocale()).toBe('uk');

    setBrowserLanguage('en-US');
    expect(detectInitialLocale()).toBe('en');
  });

  it('defaults an unsupported browser language to English', () => {
    setBrowserLanguage('fr-FR');
    expect(detectInitialLocale()).toBe('en');
  });

  it('prefers the stored choice over the browser language', () => {
    setBrowserLanguage('en-US');
    localStorage.setItem('radio.locale', 'uk');
    expect(detectInitialLocale()).toBe('uk');
  });
});

describe('blocked storage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads no locale instead of throwing', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    expect(readStoredLocale()).toBeNull();
  });

  it('still switches the tongue for the visit when it cannot save', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('denied', 'QuotaExceededError');
    });
    const before = getLocale();
    const other = before === 'uk' ? 'en' : 'uk';
    expect(() => setLocale(other)).not.toThrow();
    expect(getLocale()).toBe(other);
    setLocale(before);
  });
});
