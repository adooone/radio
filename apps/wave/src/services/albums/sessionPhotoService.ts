import { existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { env } from '@/utils/env';
import type { SessionPhoto } from '@radio/types';

/** Where an album's session photos live, inside its media folder. */
const SESSION_DIR = join('img', 'session');
/** Wide enough to fill a big screen, small enough to fade in quickly. */
const MAX_WIDTH = 2400;
const WEBP_QUALITY = 80;
/** A phone's full-size photo fits; anything larger is not a photo upload. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
/** Names wave itself gives: no paths, nothing to climb out with. */
const NAME = /^[a-z0-9-]+\.webp$/;

interface SessionPhotoOptions {
  mediaRootPath: string;
  mediaBaseUrl: string;
}

/**
 * Photos from an album's recording sessions, shown behind the record while
 * a song of that album is on air. Kept as webp in `<album>/img/session/`,
 * where the media server already serves the album's cover from.
 */
export class SessionPhotoService {
  private options: SessionPhotoOptions;

  constructor(options: Partial<SessionPhotoOptions> = {}) {
    this.options = {
      mediaRootPath: env.mediaRootPath,
      mediaBaseUrl: env.mediaBaseUrl,
      ...options,
    };
  }

  private dirOf(folderSlug: string) {
    return join(this.options.mediaRootPath, folderSlug, SESSION_DIR);
  }

  private urlOf(folderSlug: string, name: string) {
    const base = this.options.mediaBaseUrl.replace(/\/+$/, '');
    return `${base}/${folderSlug}/img/session/${name}`;
  }

  /** The album's session photos, oldest upload first. */
  list(folderSlug: string): SessionPhoto[] {
    const dir = this.dirOf(folderSlug);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((name) => NAME.test(name))
      .sort()
      .map((name) => ({ name, url: this.urlOf(folderSlug, name) }));
  }

  /**
   * Turns an uploaded image into a session photo: upright by its camera's
   * orientation, at most MAX_WIDTH wide, webp. Throws on anything that is
   * not an image.
   */
  async add(folderSlug: string, file: File): Promise<SessionPhoto> {
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error('Photo is larger than 25 MB');
    }
    const dir = this.dirOf(folderSlug);
    mkdirSync(dir, { recursive: true });
    // Base-36 time first, so names sort in upload order.
    const name = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}.webp`;
    const sharp = (await import('sharp')).default;
    try {
      await sharp(Buffer.from(await file.arrayBuffer()))
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(join(dir, name));
    } catch {
      throw new Error('Not an image');
    }
    return { name, url: this.urlOf(folderSlug, name) };
  }

  /** Removes one session photo; false when there was no such photo. */
  remove(folderSlug: string, name: string): boolean {
    if (!NAME.test(name)) throw new Error('Invalid photo name');
    const path = join(this.dirOf(folderSlug), name);
    if (!existsSync(path)) return false;
    unlinkSync(path);
    return true;
  }
}

export const sessionPhotoService = new SessionPhotoService();
