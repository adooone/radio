import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OnAirService } from './onAirService';

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

function makeService(filePath: string) {
  return new OnAirService({
    filePath,
    getAlbum: async (id) => {
      if (id === ALBUM.id) return ALBUM;
      if (id === OTHER_ALBUM.id) return OTHER_ALBUM;
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
});
