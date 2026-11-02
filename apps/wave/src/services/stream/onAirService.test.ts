import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  OnAirService,
  formatNowPlayingMessage,
  pickBackdrop,
} from './onAirService';

const ALBUM = {
  id: 1,
  artist: 'Album Artist',
  title: 'Album Title',
  coverImageUrl: 'https://media.example.com/album/img/cover.webp',
};

const SONG = {
  id: 10,
  albumId: 1,
  title: 'Song Title',
  artist: 'Song Artist',
};

const SONG_NO_ARTIST = {
  id: 11,
  albumId: 1,
  title: 'Instrumental',
  artist: null,
};

const OTHER_ALBUM = {
  id: 2,
  artist: 'Other Artist',
  title: 'Other Album',
  coverImageUrl: null,
};

const SESSION_ALBUM = {
  id: 3,
  artist: 'Session Artist',
  title: 'Session Album',
  coverImageUrl: 'https://media.example.com/session/img/cover.webp',
  backdrops: [
    'https://media.example.com/session/img/session/a.webp',
    'https://media.example.com/session/img/session/b.webp',
  ],
};

function makeService(
  filePath: string,
  broadcast: (message: string) => void = () => {},
  random: () => number = () => 0,
) {
  return new OnAirService({
    filePath,
    broadcast,
    random,
    getAlbum: async (id) => {
      if (id === ALBUM.id) return ALBUM;
      if (id === OTHER_ALBUM.id) return OTHER_ALBUM;
      if (id === SESSION_ALBUM.id) return SESSION_ALBUM;
      return null;
    },
    getSong: async (id) => {
      if (id === SONG.id) return SONG;
      if (id === SONG_NO_ARTIST.id) return SONG_NO_ARTIST;
      return null;
    },
  });
}

describe('onAirService', () => {
  let dir: string;
  let filePath: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'wave-on-air-'));
    filePath = join(dir, 'on-air.json');
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('resolves display fields from the album when no song is set', async () => {
    const service = makeService(filePath);
    const state = await service.setOnAir(ALBUM.id);

    expect(state.albumId).toBe(ALBUM.id);
    expect(state.songId).toBeUndefined();
    expect(state.artist).toBe(ALBUM.artist);
    expect(state.title).toBe(ALBUM.title);
    expect(state.cover).toBe(ALBUM.coverImageUrl);
  });

  it('resolves the song title with its own artist', async () => {
    const service = makeService(filePath);
    const state = await service.setOnAir(ALBUM.id, SONG.id);

    expect(state.songId).toBe(SONG.id);
    expect(state.title).toBe(SONG.title);
    expect(state.artist).toBe(SONG.artist);
  });

  it('falls back to the album artist when the song has none', async () => {
    const service = makeService(filePath);
    const state = await service.setOnAir(ALBUM.id, SONG_NO_ARTIST.id);

    expect(state.title).toBe(SONG_NO_ARTIST.title);
    expect(state.artist).toBe(ALBUM.artist);
  });

  it('refuses an unknown album id', async () => {
    const service = makeService(filePath);
    await expect(service.setOnAir(999)).rejects.toThrow(
      'Album with ID 999 not found',
    );
  });

  it('refuses an unknown song id', async () => {
    const service = makeService(filePath);
    await expect(service.setOnAir(ALBUM.id, 999)).rejects.toThrow(
      'Song with ID 999 not found on album 1',
    );
  });

  it('refuses a song that does not belong to the given album', async () => {
    const service = makeService(filePath);
    await expect(service.setOnAir(OTHER_ALBUM.id, SONG.id)).rejects.toThrow(
      `Song with ID ${SONG.id} not found on album ${OTHER_ALBUM.id}`,
    );
  });

  it('round-trips the current state through the persisted file', async () => {
    const service = makeService(filePath);
    await service.setOnAir(ALBUM.id, SONG.id);

    const reloaded = makeService(filePath);
    expect(reloaded.getOnAir()).toEqual(service.getOnAir());

    const onDisk = JSON.parse(readFileSync(filePath, 'utf8'));
    expect(onDisk.title).toBe(SONG.title);
  });

  it('clears the on-air state and persists the clear', async () => {
    const service = makeService(filePath);
    await service.setOnAir(ALBUM.id);
    service.clearOnAir();

    expect(service.getOnAir()).toBeNull();

    const reloaded = makeService(filePath);
    expect(reloaded.getOnAir()).toBeNull();
  });

  it('broadcasts the player contract when setting the on-air state', async () => {
    const messages: string[] = [];
    const service = makeService(filePath, (message) => messages.push(message));
    await service.setOnAir(ALBUM.id);

    expect(messages).toEqual([
      JSON.stringify({
        type: 'now_playing',
        artist: ALBUM.artist,
        title: ALBUM.title,
        cover: ALBUM.coverImageUrl,
        elapsedMs: 0,
      }),
    ]);
  });

  it('broadcasts a bare now_playing message when clearing the on-air state', async () => {
    const messages: string[] = [];
    const service = makeService(filePath, (message) => messages.push(message));
    await service.setOnAir(ALBUM.id);
    messages.length = 0;
    service.clearOnAir();

    expect(messages).toEqual([JSON.stringify({ type: 'now_playing' })]);
  });

  it('omits the cover field when the album has none', async () => {
    const messages: string[] = [];
    const service = makeService(filePath, (message) => messages.push(message));
    await service.setOnAir(OTHER_ALBUM.id);

    expect(messages).toEqual([
      JSON.stringify({
        type: 'now_playing',
        artist: OTHER_ALBUM.artist,
        title: OTHER_ALBUM.title,
        elapsedMs: 0,
      }),
    ]);
  });

  it('sends one of the album session photos as the backdrop', async () => {
    const messages: string[] = [];
    const service = makeService(filePath, (message) => messages.push(message));
    const state = await service.setOnAir(SESSION_ALBUM.id);

    expect(state.backdrop).toBe(SESSION_ALBUM.backdrops[0]);
    expect(JSON.parse(messages[0]).backdrop).toBe(SESSION_ALBUM.backdrops[0]);
  });

  it('moves to another session photo on the next song', async () => {
    const service = makeService(filePath);
    await service.setOnAir(SESSION_ALBUM.id);
    const next = await service.setOnAir(SESSION_ALBUM.id);

    expect(next.backdrop).toBe(SESSION_ALBUM.backdrops[1]);
  });

  it('leaves the backdrop out when the album has no session photos', async () => {
    const service = makeService(filePath);
    await service.setOnAir(SESSION_ALBUM.id);
    const state = await service.setOnAir(ALBUM.id);

    expect(state.backdrop).toBeUndefined();
  });
});

describe('pickBackdrop', () => {
  const photos = ['a', 'b', 'c'];

  it('has nothing to pick from an album without photos', () => {
    expect(pickBackdrop(undefined, undefined, () => 0)).toBeUndefined();
    expect(pickBackdrop([], 'a', () => 0)).toBeUndefined();
  });

  it('keeps a lone photo even when it showed last', () => {
    expect(pickBackdrop(['a'], 'a', () => 0.9)).toBe('a');
  });

  it('never repeats the last photo while there are others', () => {
    for (const r of [0, 0.4, 0.99]) {
      expect(pickBackdrop(photos, 'b', () => r)).not.toBe('b');
    }
  });

  it('stays in range when the random source returns its top end', () => {
    expect(photos).toContain(pickBackdrop(photos, undefined, () => 0.999999));
  });
});

describe('formatNowPlayingMessage', () => {
  const state = {
    albumId: 1,
    artist: 'A',
    title: 'T',
    setAt: '2026-11-02T08:00:00.000Z',
  };

  it('tells a listener joining mid-song how long it has been on air', () => {
    const now = Date.parse(state.setAt) + 42_500;
    expect(JSON.parse(formatNowPlayingMessage(state, now)).elapsedMs).toBe(
      42_500,
    );
  });

  it('never reports a song as starting in the future', () => {
    const now = Date.parse(state.setAt) - 1_000;
    expect(JSON.parse(formatNowPlayingMessage(state, now)).elapsedMs).toBe(0);
  });

  it('treats an unreadable start as just begun', () => {
    const broken = { ...state, setAt: 'not a date' };
    expect(JSON.parse(formatNowPlayingMessage(broken)).elapsedMs).toBe(0);
  });
});
