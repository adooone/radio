import { describe, expect, it } from 'bun:test';
import { gainFor, parseEbur128Summary } from './loudness';

const SUMMARY = `[Parsed_ebur128_0 @ 0x1] t: 511.9  TARGET:-23 LUFS    M: -12.0 S: -11.9     I: -11.5 LUFS       LRA:  11.2 LU  FTPK: -1.2 dBFS  TPK:  -0.0 dBFS
[Parsed_ebur128_0 @ 0x1] Summary:

  Integrated loudness:
    I:         -11.4 LUFS
    Threshold: -22.0 LUFS

  Loudness range:
    LRA:        11.2 LU

  True peak:
    Peak:       -0.3 dBFS
`;

describe('parseEbur128Summary', () => {
  it('reads the summary, not the running per-frame values', () => {
    expect(parseEbur128Summary(SUMMARY)).toEqual({
      integrated: -11.4,
      truePeak: -0.3,
    });
  });

  it('gives up on silence or a missing summary', () => {
    expect(
      parseEbur128Summary('Summary:\n    I:         -inf LUFS'),
    ).toBeNull();
    expect(parseEbur128Summary('no summary here')).toBeNull();
  });
});

describe('gainFor', () => {
  it('turns a loud track down to the target', () => {
    expect(gainFor({ integrated: -11.4, truePeak: -0.3 })).toBe(-4.6);
  });

  it('turns a quiet track up only as far as its peak allows', () => {
    // Target asks +6 dB, but the peak at -4 dBTP leaves room for +3.
    expect(gainFor({ integrated: -22, truePeak: -4 })).toBe(3);
    expect(gainFor({ integrated: -22, truePeak: null })).toBe(6);
  });

  it('keeps within ±12 dB', () => {
    expect(gainFor({ integrated: -40, truePeak: -30 })).toBe(12);
    expect(gainFor({ integrated: 0, truePeak: 0 })).toBe(-12);
  });
});
