import { describe, expect, it } from 'vitest';
import { pluralCategory } from './plural';

describe('pluralCategory', () => {
  it('follows the old getMelomanLabel rule for Ukrainian, 11–19 exception included', () => {
    expect(pluralCategory('uk', 1)).toBe('one');
    expect(pluralCategory('uk', 21)).toBe('one');
    expect(pluralCategory('uk', 2)).toBe('few');
    expect(pluralCategory('uk', 3)).toBe('few');
    expect(pluralCategory('uk', 4)).toBe('few');
    expect(pluralCategory('uk', 22)).toBe('few');
    expect(pluralCategory('uk', 24)).toBe('few');
    expect(pluralCategory('uk', 0)).toBe('many');
    expect(pluralCategory('uk', 5)).toBe('many');
    expect(pluralCategory('uk', 11)).toBe('many');
    expect(pluralCategory('uk', 12)).toBe('many');
    expect(pluralCategory('uk', 19)).toBe('many');
    expect(pluralCategory('uk', 25)).toBe('many');
    expect(pluralCategory('uk', 100)).toBe('many');
    expect(pluralCategory('uk', 101)).toBe('one');
    expect(pluralCategory('uk', 111)).toBe('many');
  });

  it('keeps plain English plurals: one at exactly 1, other everywhere else', () => {
    expect(pluralCategory('en', 1)).toBe('one');
    expect(pluralCategory('en', -1)).toBe('one');
    expect(pluralCategory('en', 0)).toBe('other');
    expect(pluralCategory('en', 2)).toBe('other');
    expect(pluralCategory('en', 21)).toBe('other');
    expect(pluralCategory('en', 11)).toBe('other');
  });
});
