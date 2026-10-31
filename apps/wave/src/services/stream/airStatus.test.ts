import { describe, expect, it } from 'bun:test';
import { AirStatus, isPlaylistLive } from './airStatus';

const NOW = new Date('2026-10-31T22:42:11Z');
const secondsAgo = (seconds: number) =>
  new Date(NOW.getTime() - seconds * 1000).toUTCString();

describe('airStatus', () => {
  it('counts a playlist written moments ago as a live publisher', () => {
    expect(isPlaylistLive({ ok: true, lastModified: secondsAgo(2) }, NOW)).toBe(
      true,
    );
  });

  it('counts a playlist left alone as silence', () => {
    expect(
      isPlaylistLive({ ok: true, lastModified: secondsAgo(30) }, NOW),
    ).toBe(false);
  });

  it('is silence when the playlist is missing or undated', () => {
    expect(isPlaylistLive({ ok: false, lastModified: null }, NOW)).toBe(false);
    expect(isPlaylistLive({ ok: true, lastModified: null }, NOW)).toBe(false);
    expect(isPlaylistLive({ ok: true, lastModified: 'yesterday' }, NOW)).toBe(
      false,
    );
  });

  it('treats an unreachable relay as silence', async () => {
    const status = new AirStatus(async () => {
      throw new Error('connection refused');
    });
    expect(await status.isLive()).toBe(false);
  });

  it('asks the relay for the configured playlist', async () => {
    const asked: string[] = [];
    const status = new AirStatus(async (url) => {
      asked.push(url);
      return { ok: true, lastModified: new Date().toUTCString() };
    }, 'http://relay/hls/test.m3u8');
    expect(await status.isLive()).toBe(true);
    expect(asked).toEqual(['http://relay/hls/test.m3u8']);
  });
});
