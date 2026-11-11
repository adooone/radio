import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { holdFor, parseNowPlaying, useNowPlaying } from './use-now-playing';

const socket = new EventTarget() as WebSocket;
vi.mock('@/lib/socket', () => ({
  subscribe: (cb: (ws: WebSocket) => void) => {
    cb(socket);
    return () => {};
  },
}));

const announce = (data: Record<string, unknown>) =>
  act(() => {
    socket.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({ type: 'now_playing', ...data }),
      }),
    );
  });

describe('holdFor', () => {
  it('shows at once when the radio is not playing', () => {
    expect(holdFor(null, 0)).toBe(0);
  });

  it('holds a song that just began for the whole lag', () => {
    expect(holdFor(4.2, 0)).toBe(4200);
  });

  it('holds only what is left when the song began a while ago', () => {
    expect(holdFor(4.2, 3000)).toBe(1200);
    expect(holdFor(4.2, 60_000)).toBe(0);
  });
});

describe('parseNowPlaying', () => {
  it('ignores other messages and broken JSON', () => {
    expect(parseNowPlaying('{"type":"chat"}')).toBeUndefined();
    expect(parseNowPlaying('nope')).toBeUndefined();
  });

  it('reads a bare message as nothing on air', () => {
    expect(parseNowPlaying('{"type":"now_playing"}')).toEqual({
      song: null,
      recent: [],
      elapsedMs: 0,
    });
  });

  it('reads the next song and the ones played before', () => {
    const message = parseNowPlaying(
      JSON.stringify({
        type: 'now_playing',
        title: 'Now',
        artist: 'Band',
        next: { title: 'Next', artist: 'Other', cover: '/c.webp' },
        recent: [
          {
            title: 'Before',
            artist: 'Band',
            startedAt: '2026-11-11T20:00:00Z',
          },
          { artist: 'no title' },
        ],
      }),
    );
    expect(message?.song?.next).toEqual({
      title: 'Next',
      artist: 'Other',
      cover: '/c.webp',
      startedAt: undefined,
    });
    expect(message?.recent.map((track) => track.title)).toEqual(['Before']);
  });

  it('keeps the history while nothing is on air', () => {
    const message = parseNowPlaying(
      JSON.stringify({ type: 'now_playing', recent: [{ title: 'Before' }] }),
    );
    expect(message?.song).toBeNull();
    expect(message?.recent).toHaveLength(1);
  });
});

describe('useNowPlaying', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('changes the title only once the music gets there', () => {
    const { result } = renderHook(() => useNowPlaying(() => 5));
    announce({ title: 'Song A', artist: 'Band', elapsedMs: 0 });
    expect(result.current.song).toBeNull();
    act(() => vi.advanceTimersByTime(4900));
    expect(result.current.song).toBeNull();
    act(() => vi.advanceTimersByTime(100));
    expect(result.current.song?.title).toBe('Song A');
  });

  it('shows the song straight away to someone not listening', () => {
    const { result } = renderHook(() => useNowPlaying(() => null));
    announce({ title: 'Song A', artist: 'Band', elapsedMs: 0 });
    expect(result.current.song?.title).toBe('Song A');
  });

  it('keeps the latest of two quick picks', () => {
    let lag = 5;
    const { result } = renderHook(() => useNowPlaying(() => lag));
    announce({ title: 'Song A', elapsedMs: 0 });
    lag = 3;
    announce({ title: 'Song B', elapsedMs: 0 });
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.song?.title).toBe('Song B');
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.song?.title).toBe('Song B');
  });
});
