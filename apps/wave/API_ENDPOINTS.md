# Albums API Endpoints

Base URL: `http://localhost:6870/api`

## Public Endpoints (No Authentication Required)

### Get Public Albums
```
GET /albums/public
Query Parameters:
  - limit (optional): Number of results (default: 50, max: 100)
  - offset (optional): Pagination offset (default: 0)
  - artist (optional): Filter by artist name
  - year (optional): Filter by year
  - tags (optional): Comma-separated tags
  - search (optional): Search in title and artist

Response: { success: true, data: Album[] }
```

### Get Album by ID
```
GET /albums/:id
Response: { success: true, data: AlbumWithSongs }
Note: Private albums require authentication
```

### Get Album Cover
```
GET /albums/:id/cover
Response: Image file (JPEG/PNG/WebP)
```

## Protected Endpoints (Authentication Required)

### Get User's Albums
```
GET /albums/my
Headers: Authorization: Bearer <token>
Query Parameters:
  - limit (optional): Number of results (default: 50)
  - offset (optional): Pagination offset (default: 0)

Response: { success: true, data: Album[] }
```

### Create Album
```
POST /albums
Headers: Authorization: Bearer <token>
Body: {
  title: string (required),
  artist: string (required),
  year?: number (1900-2100),
  description?: string (max 1000 chars),
  tags?: string (JSON array as string),
  isPublic?: boolean (default: false)
}

Response: { success: true, data: { id: number }, status: 201 }
```

### Update Album
```
PUT /albums/:id
Headers: Authorization: Bearer <token>
Body: {
  title?: string,
  artist?: string,
  year?: number,
  description?: string,
  tags?: string,
  isPublic?: boolean
}

Response: { success: true, message: "Album updated successfully" }
```

### Delete Album
```
DELETE /albums/:id
Headers: Authorization: Bearer <token>
Response: { success: true, message: "Album deleted successfully" }
```

### Upload Cover Art
```
POST /albums/:id/cover
Headers: Authorization: Bearer <token>
Body: multipart/form-data
  - cover: File (JPEG/PNG/WebP, max 5MB)

Response: { success: true, data: { coverArtPath: string, fileName: string } }
```

## Song Endpoints

### Add Song to Album
```
POST /albums/:albumId/songs
Headers: Authorization: Bearer <token>
Body: {
  audioFileId: number (required),
  trackNumber: number (required, min: 1),
  title: string (required),
  artist?: string (for featuring artists)
}

Response: { success: true, data: { id: number }, status: 201 }
```

### Update Song
```
PUT /albums/songs/:id
Headers: Authorization: Bearer <token>
Body: {
  trackNumber?: number,
  title?: string,
  artist?: string
}

Response: { success: true, message: "Song updated successfully" }
```

### Delete Song
```
DELETE /albums/songs/:id
Headers: Authorization: Bearer <token>
Response: { success: true, message: "Song deleted successfully" }
```

### Reorder Songs
```
PUT /albums/:albumId/songs/reorder
Headers: Authorization: Bearer <token>
Body: {
  songs: [
    { id: number, trackNumber: number },
    { id: number, trackNumber: number },
    ...
  ]
}

Response: { success: true, message: "Songs reordered successfully" }
```

## Digitization API (Admin only)

Base path: `/api/digitization`. Every endpoint requires `Authorization: Bearer
<token>` for an admin account. Drafts are derived from `band-slug_album-slug`
folders under `MEDIA_INBOX_PATH` — there is no database row until publish.
See `apps/wave/src/services/digitization/` and
`papercamp/ideas/IDEA-2.md` for the full design.

### List Drafts
```
GET /digitization/drafts
Response: { success: true, data: DigitizationDraft[] }
```

### Get Draft
```
GET /digitization/drafts/:slug
Response: { success: true, data: DigitizationDraft }
Errors: 400 for a malformed slug, 404 if no matching inbox folder exists
```

### Get Draft Cover
```
GET /digitization/drafts/:slug/cover
Response: Image file (raw cover before encode, or img/cover.webp after)
```

### Fetch Metadata from Discogs
```
POST /digitization/drafts/:slug/metadata
Body: { release: string (URL or release id), force?: boolean }
Response: { success: true, data: AlbumDataJson }
Errors: 409 if data.json already exists and force is not set
```

### Update Metadata (manual edit)
```
PUT /digitization/drafts/:slug/metadata
Body: AlbumDataJson
Response: { success: true, data: AlbumDataJson }
```

### Search Discogs
```
GET /digitization/discogs/search?q=
Response: { success: true, data: DiscogsSearchResult[] }
Errors: 400 if DISCOGS_TOKEN is not configured
```

### Plan Split
```
POST /digitization/drafts/:slug/split/plan
Body: {
  noise?: number, minSilence?: number, tolerance?: number,
  manualCuts?: Record<sideLetter, number[]>
}
Response: { success: true, data: DigitizationSplitPlanResult }
```

### Apply Split
```
POST /digitization/drafts/:slug/split/apply
Body: { sides: DigitizationSplitApplySide[] }
Response: { success: true, data: { written: string[] } }
Errors: 409 if a target track file already exists and is non-empty,
404 if a side recording is missing
```

### Get Draft Audio (Range)
```
GET /digitization/drafts/:slug/audio/:file
Headers: Range: bytes=<start>-<end> (optional)
Response: audio/wav, 206 Partial Content when Range is sent
```

### Publish Draft
```
POST /digitization/drafts/:slug/publish
Response: { success: true, data: DigitizationJob }
Starts a background job: encodes cut tracks to m4a + cover to webp under
MEDIA_ROOT_PATH, then runs the sync-media importer. Poll GET /jobs/:id.
```

### Clean Up Draft (explicit, never automatic)
```
POST /digitization/drafts/:slug/cleanup
Body: { target: "sides" | "folder", confirm: true }
Response: { success: true, data: { deletedFiles: string[] } }
       or { success: true, data: { deletedFolder: true } }
Errors: 409 if the draft has not been published yet (encodedCount === 0)
```
Deletes the raw `side-*.wav` recordings (`target: "sides"`) or the entire
inbox folder (`target: "folder"`) of an already-published draft. `confirm`
must be the literal `true` — this never runs automatically, and only ever
on a draft that is already on air.

### Get Job
```
GET /digitization/jobs/:id
Response: { success: true, data: DigitizationJob }
Errors: 404 if the job id is unknown (job history is in-memory, lost on restart)
```

## Data Models

### Album
```typescript
{
  id: number
  title: string
  artist: string
  year: number | null
  coverArtPath: string | null
  description: string | null
  tags: string | null  // JSON array as string
  isPublic: number  // 0 or 1
  ownerId: number
  createdAt: string
  updatedAt: string
}
```

### AlbumWithSongs
```typescript
{
  ...Album,
  songs: Song[]
}
```

### Song
```typescript
{
  id: number
  albumId: number
  audioFileId: number
  trackNumber: number
  title: string
  artist: string | null
  duration: string
  format: string
  createdAt: string
  audioFilePath?: string  // when joined with audio_files
  audioFileName?: string  // when joined with audio_files
}
```

## Example Usage

### Create an album
```bash
curl -X POST http://localhost:6870/api/albums \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Dark Side of the Moon",
    "artist": "Pink Floyd",
    "year": 1973,
    "description": "Classic progressive rock album",
    "tags": "[\"Rock\",\"Progressive\"]",
    "isPublic": true
  }'
```

### Upload cover art
```bash
curl -X POST http://localhost:6870/api/albums/1/cover \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "cover=@album-cover.jpg"
```

### Add a song to album
```bash
curl -X POST http://localhost:6870/api/albums/1/songs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "audioFileId": 1,
    "trackNumber": 1,
    "title": "Speak to Me",
    "artist": "Pink Floyd"
  }'
```

### Get public albums with filters
```bash
curl "http://localhost:6870/api/albums/public?artist=Pink%20Floyd&year=1973"
```

