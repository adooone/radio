import type {
  AlbumDataJson,
  DiscogsSearchResult,
  PersonnelItem,
  TracklistItem,
} from '@radio/types';
import {
  hasDraftMetadata,
  writeDraftCoverIfAbsent,
  writeDraftMetadata,
} from './inboxService';

const DISCOGS_API = 'https://api.discogs.com';
const USER_AGENT = 'radio-wave/1.0';

interface DiscogsArtist {
  name?: string;
}

interface DiscogsLabel {
  name?: string;
  catno?: string;
}

interface DiscogsFormat {
  name?: string;
  descriptions?: string[];
  text?: string;
}

interface DiscogsTrack {
  type_?: string;
  position?: string;
  title?: string;
  duration?: string;
}

interface DiscogsExtraArtist {
  name?: string;
  role?: string;
}

interface DiscogsImage {
  type?: string;
  resource_url?: string;
}

interface DiscogsRelease {
  id: number;
  title?: string;
  uri?: string;
  country?: string;
  year?: number;
  released?: string;
  notes?: string;
  master_id?: number | null;
  artists?: DiscogsArtist[];
  labels?: DiscogsLabel[];
  formats?: DiscogsFormat[];
  tracklist?: DiscogsTrack[];
  extraartists?: DiscogsExtraArtist[];
  images?: DiscogsImage[];
}

interface DiscogsSearchResponse {
  results?: Array<{
    id: number;
    title?: string;
    year?: string;
    country?: string;
    format?: string[];
    label?: string[];
    catno?: string;
    thumb?: string;
  }>;
}

async function discogsGet<T>(
  path: string,
  token: string | undefined,
  params?: Record<string, string>,
): Promise<T> {
  const url = new URL(`${DISCOGS_API}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  const headers: Record<string, string> = { 'User-Agent': USER_AGENT };
  if (token) {
    headers.Authorization = `Discogs token=${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Discogs API error ${response.status} for ${path}`);
  }
  return (await response.json()) as T;
}

/** Discogs disambiguates artists/labels as "Name (2)" — strip the suffix. */
function cleanName(name: string): string {
  return name.replace(/\s+\(\d+\)$/, '').trim();
}

/** Accepts a bare release id, a discogs.com release URL (incl. locale segments like /ja-jp/). */
export function parseReleaseRef(ref: string): number | null {
  const trimmed = ref.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  const match = trimmed.match(
    /discogs\.com\/(?:[a-z]{2}[-_][A-Za-z]{2}\/)?release\/(\d+)/,
  );
  return match ? Number(match[1]) : null;
}

export async function searchReleases(
  query: string,
  token: string | undefined,
): Promise<DiscogsSearchResult[]> {
  if (!token) {
    throw new Error('Discogs search requires DISCOGS_TOKEN');
  }
  const data = await discogsGet<DiscogsSearchResponse>(
    '/database/search',
    token,
    { q: query, type: 'release', format: 'Vinyl', per_page: '10' },
  );
  return (data.results ?? []).map((result) => ({
    id: result.id,
    title: result.title ?? '',
    year: result.year ?? '',
    country: result.country ?? '',
    format: result.format ?? [],
    label: result.label ?? [],
    catno: result.catno ?? '',
    thumb: result.thumb ?? '',
  }));
}

async function fetchMasterYear(
  masterId: number | null | undefined,
  token: string | undefined,
): Promise<number | undefined> {
  if (!masterId) {
    return undefined;
  }
  try {
    const master = await discogsGet<{ year?: number }>(
      `/masters/${masterId}`,
      token,
    );
    return master.year;
  } catch {
    return undefined;
  }
}

function buildTracklist(release: DiscogsRelease): TracklistItem[] {
  return (release.tracklist ?? [])
    .filter((track) => (track.type_ ?? 'track') === 'track')
    .map((track) => {
      const entry: TracklistItem = {
        position: track.position ?? '',
        title: track.title ?? '',
      };
      if (track.duration) {
        entry.duration = track.duration;
      }
      return entry;
    });
}

function buildPersonnel(release: DiscogsRelease): PersonnelItem[] {
  const rolesByName = new Map<string, string[]>();
  for (const extraArtist of release.extraartists ?? []) {
    const name = cleanName(extraArtist.name ?? '');
    const role = extraArtist.role ?? '';
    if (!name || !role) {
      continue;
    }
    const roles = rolesByName.get(name) ?? [];
    roles.push(role);
    rolesByName.set(name, roles);
  }
  return Array.from(rolesByName.entries()).map(([name, roles]) => ({
    name,
    roles,
  }));
}

function buildFormatDescription(release: DiscogsRelease): string {
  const format = (release.formats ?? [])[0];
  if (!format) {
    return '';
  }
  const parts = [format.name, ...(format.descriptions ?? [])];
  if (format.text) {
    parts.push(format.text);
  }
  return parts.filter(Boolean).join(', ');
}

async function fetchReleaseMetadata(
  releaseId: number,
  token: string | undefined,
): Promise<{ data: AlbumDataJson; release: DiscogsRelease }> {
  const release = await discogsGet<DiscogsRelease>(
    `/releases/${releaseId}`,
    token,
  );

  const labels = release.labels ?? [];
  const recordingYear = await fetchMasterYear(release.master_id, token);

  const data: AlbumDataJson = {
    album_title: release.title ?? '',
    artist: (release.artists ?? [])
      .map((artist) => cleanName(artist.name ?? ''))
      .join(' / '),
    recording_year: recordingYear,
    recording_details: { period: '', location: '', exceptions: '' },
    release_info: {
      label: labels[0] ? cleanName(labels[0].name ?? '') : '',
      catalog_number: labels[0]?.catno ?? '',
      country: release.country ?? '',
      issue_year: release.year,
      released: release.released ?? '',
      format: buildFormatDescription(release),
      phonographic_copyright: '',
    },
    discogs: {
      release_id: release.id,
      master_id: release.master_id ?? null,
      url: release.uri ?? '',
    },
    tracklist: buildTracklist(release),
    personnel: buildPersonnel(release),
    production: { engineer: '', producers: [], mastering: '' },
    visuals: { photography: [], design: '' },
    additional_info: release.notes ?? '',
  };

  return { data, release };
}

async function downloadCover(
  release: DiscogsRelease,
  token: string | undefined,
): Promise<{ buffer: Buffer; extension: string } | undefined> {
  if (!token) {
    return undefined;
  }
  const images = release.images ?? [];
  const primary = images.find((image) => image.type === 'primary') ?? images[0];
  if (!primary?.resource_url) {
    return undefined;
  }
  // The token goes in the header — only ever send it back to Discogs hosts.
  const host = new URL(primary.resource_url).hostname;
  if (host !== 'api.discogs.com' && !host.endsWith('.discogs.com')) {
    return undefined;
  }
  const response = await fetch(primary.resource_url, {
    headers: {
      'User-Agent': USER_AGENT,
      Authorization: `Discogs token=${token}`,
    },
  });
  if (!response.ok) {
    return undefined;
  }
  const contentType = response.headers.get('content-type') ?? '';
  const extension = contentType.includes('png') ? 'png' : 'jpg';
  return { buffer: Buffer.from(await response.arrayBuffer()), extension };
}

/**
 * Seeds `data.json` (and, when a token is set, the raw cover) from a Discogs
 * release. Refuses to clobber an existing `data.json` unless `force` — it
 * may already contain manual edits.
 */
export async function fetchAndSaveDraftMetadata(
  inboxPath: string,
  slug: string,
  releaseRef: string,
  options: { force?: boolean; token: string | undefined },
): Promise<AlbumDataJson> {
  if (hasDraftMetadata(inboxPath, slug) && !options.force) {
    throw new Error('data.json already exists');
  }

  const releaseId = parseReleaseRef(releaseRef);
  if (releaseId === null) {
    throw new Error(`Could not parse a Discogs release id from: ${releaseRef}`);
  }

  const { data, release } = await fetchReleaseMetadata(
    releaseId,
    options.token,
  );
  writeDraftMetadata(inboxPath, slug, data);

  // data.json is already written — a failed cover download must not fail the
  // request; the cover can be re-fetched or uploaded by hand.
  try {
    const cover = await downloadCover(release, options.token);
    if (cover) {
      writeDraftCoverIfAbsent(inboxPath, slug, cover.buffer, cover.extension);
    }
  } catch {
    // ignore — metadata fetch succeeded
  }

  return data;
}
