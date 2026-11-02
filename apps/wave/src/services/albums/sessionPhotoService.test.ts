import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { SessionPhotoService } from './sessionPhotoService';

const SLUG = 'artist_album';

const jpeg = async (width: number, height: number) =>
  new File(
    [
      await sharp({
        create: { width, height, channels: 3, background: '#884422' },
      })
        .jpeg()
        .toBuffer(),
    ],
    'session.jpg',
    { type: 'image/jpeg' },
  );

describe('sessionPhotoService', () => {
  let root: string;
  let service: SessionPhotoService;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'wave-session-'));
    service = new SessionPhotoService({
      mediaRootPath: root,
      mediaBaseUrl: 'https://media.example.com/p-sound/',
    });
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('lists nothing for an album without session photos', () => {
    expect(service.list(SLUG)).toEqual([]);
  });

  it('stores an upload as webp no wider than 2400 and serves it by URL', async () => {
    const photo = await service.add(SLUG, await jpeg(3600, 2400));

    expect(photo.name).toMatch(/^[a-z0-9-]+\.webp$/);
    expect(photo.url).toBe(
      `https://media.example.com/p-sound/${SLUG}/img/session/${photo.name}`,
    );
    const meta = await sharp(
      join(root, SLUG, 'img', 'session', photo.name),
    ).metadata();
    expect(meta.format).toBe('webp');
    expect(meta.width).toBe(2400);
    expect(service.list(SLUG)).toEqual([photo]);
  });

  it('keeps a small photo at its own size', async () => {
    const photo = await service.add(SLUG, await jpeg(800, 600));
    const meta = await sharp(
      join(root, SLUG, 'img', 'session', photo.name),
    ).metadata();
    expect(meta.width).toBe(800);
  });

  it('refuses a file that is not an image', async () => {
    const text = new File(['hello'], 'notes.jpg', { type: 'image/jpeg' });
    await expect(service.add(SLUG, text)).rejects.toThrow('Not an image');
  });

  it('removes a photo, and reports one that is not there', async () => {
    const photo = await service.add(SLUG, await jpeg(400, 300));

    expect(service.remove(SLUG, photo.name)).toBe(true);
    expect(existsSync(join(root, SLUG, 'img', 'session', photo.name))).toBe(
      false,
    );
    expect(service.remove(SLUG, photo.name)).toBe(false);
  });

  it('refuses names that could reach outside the folder', () => {
    expect(() => service.remove(SLUG, '../cover.webp')).toThrow();
    expect(() => service.remove(SLUG, 'img/cover.webp')).toThrow();
  });
});
