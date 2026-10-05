import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  deleteDraftFolder,
  deleteDraftSideWavs,
  getDraft,
  getDraftCover,
  listDrafts,
} from './inboxService';

function makeDraftFolder(
  inboxPath: string,
  slug: string,
  files: Record<string, string | Buffer> = {},
): string {
  const folderPath = join(inboxPath, slug);
  mkdirSync(folderPath, { recursive: true });
  for (const [relPath, content] of Object.entries(files)) {
    const fullPath = join(folderPath, relPath);
    mkdirSync(join(fullPath, '..'), { recursive: true });
    writeFileSync(fullPath, content);
  }
  return folderPath;
}

describe('inboxService', () => {
  let inboxPath: string;
  let mediaRootPath: string;

  beforeEach(() => {
    inboxPath = mkdtempSync(join(tmpdir(), 'wave-inbox-'));
    mediaRootPath = mkdtempSync(join(tmpdir(), 'wave-media-'));
  });

  afterEach(() => {
    rmSync(inboxPath, { recursive: true, force: true });
    rmSync(mediaRootPath, { recursive: true, force: true });
  });

  it('derives "awaiting-sides" for a freshly dropped folder with no wavs', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album');

    const [draft] = listDrafts(inboxPath, mediaRootPath);
    expect(draft.stage).toBe('awaiting-sides');
    expect(draft.sides).toEqual([]);
    expect(draft.trackFiles).toEqual([]);
  });

  it('derives "ready-to-split" once non-empty side wavs are present', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'side-a.wav': 'not-really-audio-but-non-empty',
      'side-b.wav': 'not-really-audio-but-non-empty',
    });

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.stage).toBe('ready-to-split');
    expect(draft.sides).toEqual(['side-a.wav', 'side-b.wav']);
  });

  it('ignores empty placeholder wavs when deriving sides', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'side-a.wav': '',
      'side-b.wav': 'content',
    });

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.stage).toBe('ready-to-split');
    expect(draft.sides).toEqual(['side-b.wav']);
  });

  it('derives "ready-to-encode" once split track wavs exist', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'side-a.wav': 'content',
      'a1-opening-track.wav': 'content',
      'a2-second-song.wav': 'content',
    });

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.stage).toBe('ready-to-encode');
    expect(draft.trackFiles).toEqual([
      'a1-opening-track.wav',
      'a2-second-song.wav',
    ]);
  });

  it('derives "on-air" once encoded m4a files exist under the media root', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'a1-opening-track.wav': 'content',
    });
    mkdirSync(join(mediaRootPath, 'some-band_some-album'), {
      recursive: true,
    });
    writeFileSync(
      join(mediaRootPath, 'some-band_some-album', 'a1-opening-track.m4a'),
      'encoded',
    );

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.stage).toBe('on-air');
    expect(draft.encodedCount).toBe(1);
  });

  it('stays "ready-to-encode" while the encode is only partial', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'a1-opening-track.wav': 'content',
      'a2-second-song.wav': 'content',
    });
    mkdirSync(join(mediaRootPath, 'some-band_some-album'), {
      recursive: true,
    });
    writeFileSync(
      join(mediaRootPath, 'some-band_some-album', 'a1-opening-track.m4a'),
      'encoded',
    );

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.stage).toBe('ready-to-encode');
    expect(draft.encodedCount).toBe(1);
  });

  it('does not count zero-byte m4a leftovers as encoded', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'a1-opening-track.wav': 'content',
    });
    mkdirSync(join(mediaRootPath, 'some-band_some-album'), {
      recursive: true,
    });
    writeFileSync(
      join(mediaRootPath, 'some-band_some-album', 'a1-opening-track.m4a'),
      '',
    );

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.encodedCount).toBe(0);
    expect(draft.stage).toBe('ready-to-encode');
  });

  it('is not "on-air" until the whole tracklist is encoded', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'data.json': JSON.stringify({
        tracklist: [
          { position: 'A1', title: 'One' },
          { position: 'A2', title: 'Two' },
          { position: 'B1', title: 'Three' },
        ],
      }),
      'a1-one.wav': 'content',
    });
    mkdirSync(join(mediaRootPath, 'some-band_some-album'), {
      recursive: true,
    });
    writeFileSync(
      join(mediaRootPath, 'some-band_some-album', 'a1-one.m4a'),
      'encoded',
    );

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.stage).toBe('ready-to-encode');
  });

  it('reads artist/title/year/label from data.json when present', () => {
    makeDraftFolder(inboxPath, 'jethro-tull_aqualung', {
      'data.json': JSON.stringify({
        album_title: 'Aqualung',
        artist: 'Jethro Tull',
        recording_year: 1970,
        release_info: { label: 'Chrysalis', country: 'UK', issue_year: 1971 },
        tracklist: [{ position: 'A1', title: 'Aqualung' }],
      }),
    });

    const draft = getDraft(inboxPath, mediaRootPath, 'jethro-tull_aqualung');
    expect(draft.hasMetadata).toBe(true);
    expect(draft.artist).toBe('Jethro Tull');
    expect(draft.title).toBe('Aqualung');
    expect(draft.recordingYear).toBe(1970);
    expect(draft.issueYear).toBe(1971);
    expect(draft.label).toBe('Chrysalis');
    expect(draft.country).toBe('UK');
    expect(draft.trackCount).toBe(1);
  });

  it('falls back to a title-cased slug when there is no data.json', () => {
    makeDraftFolder(inboxPath, 'jethro-tull_aqualung');

    const draft = getDraft(inboxPath, mediaRootPath, 'jethro-tull_aqualung');
    expect(draft.hasMetadata).toBe(false);
    expect(draft.artist).toBe('Jethro Tull');
    expect(draft.title).toBe('Aqualung');
    expect(draft.artistSlug).toBe('jethro-tull');
    expect(draft.albumSlug).toBe('aqualung');
  });

  it('ignores folders that do not match the band-slug_album-slug pattern', () => {
    makeDraftFolder(inboxPath, 'not-a-valid-folder-name');

    expect(listDrafts(inboxPath, mediaRootPath)).toEqual([]);
  });

  it('throws Not found for a well-formed slug with no matching folder', () => {
    expect(() => getDraft(inboxPath, mediaRootPath, 'does-not_exist')).toThrow(
      'Not found',
    );
  });

  it('throws a friendly error for a malformed slug, not a generic Not found', () => {
    expect(() =>
      getDraft(inboxPath, mediaRootPath, '../../etc_passwd'),
    ).toThrow('Invalid draft slug');
  });

  it('serves a raw cover.jpg dropped before encoding', () => {
    makeDraftFolder(inboxPath, 'some-band_some-album', {
      'cover.jpg': Buffer.from([0xff, 0xd8, 0xff]),
    });

    const draft = getDraft(inboxPath, mediaRootPath, 'some-band_some-album');
    expect(draft.hasCover).toBe(true);

    const cover = getDraftCover(inboxPath, 'some-band_some-album');
    expect(cover.mimeType).toBe('image/jpeg');
    expect(cover.size).toBe(3);
  });

  it('rejects path traversal attempts in the cover endpoint', () => {
    expect(() => getDraftCover(inboxPath, '../../etc_passwd')).toThrow(
      'Invalid draft slug',
    );
  });

  describe('cleanup', () => {
    function makePublishedDraft(): string {
      const folderPath = makeDraftFolder(inboxPath, 'some-band_some-album', {
        'side-a.wav': 'content',
        'a1-opening-track.wav': 'content',
      });
      mkdirSync(join(mediaRootPath, 'some-band_some-album'), {
        recursive: true,
      });
      writeFileSync(
        join(mediaRootPath, 'some-band_some-album', 'a1-opening-track.m4a'),
        'encoded',
      );
      return folderPath;
    }

    it('refuses to delete side wavs before the draft is published', () => {
      makeDraftFolder(inboxPath, 'some-band_some-album', {
        'side-a.wav': 'content',
      });

      expect(() =>
        deleteDraftSideWavs(inboxPath, mediaRootPath, 'some-band_some-album'),
      ).toThrow('has not been published yet');
    });

    it('refuses to delete the whole folder before the draft is published', () => {
      makeDraftFolder(inboxPath, 'some-band_some-album', {
        'side-a.wav': 'content',
      });

      expect(() =>
        deleteDraftFolder(inboxPath, mediaRootPath, 'some-band_some-album'),
      ).toThrow('has not been published yet');
    });

    it('deletes only the side-*.wav recordings of a published draft', () => {
      const folderPath = makePublishedDraft();

      const deleted = deleteDraftSideWavs(
        inboxPath,
        mediaRootPath,
        'some-band_some-album',
      );

      expect(deleted).toEqual(['side-a.wav']);
      expect(existsSync(join(folderPath, 'side-a.wav'))).toBe(false);
      expect(existsSync(join(folderPath, 'a1-opening-track.wav'))).toBe(true);
    });

    it('deletes the whole inbox folder of a published draft', () => {
      const folderPath = makePublishedDraft();

      deleteDraftFolder(inboxPath, mediaRootPath, 'some-band_some-album');

      expect(existsSync(folderPath)).toBe(false);
      expect(readdirSync(inboxPath)).toEqual([]);
    });
  });
});
