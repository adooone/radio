# API Documentation

REST API reference for the Radio Streaming Platform.

## Base URLs

- **Development**: `http://localhost:6870`
- **WebSocket**: `ws://localhost:6871`

## Authentication

JWT-based authentication via session tokens. Login returns a token used in subsequent requests.

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |

## Collection API

### Albums

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/albums` | List albums (paginated, filterable) |
| `POST` | `/api/albums` | Create album |
| `PUT` | `/api/albums/:id` | Update album |
| `DELETE` | `/api/albums/:id` | Delete album |

### Audio Files

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/audio-files/upload` | Upload audio file |
| `GET` | `/api/audio-files/:id` | Get audio file info |
| `GET` | `/api/audio-files/:id/stream` | Stream audio file |
| `DELETE` | `/api/audio-files/:id` | Delete audio file |

### Collections (Playlists)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/collections` | List collections |
| `POST` | `/api/collections` | Create collection |
| `PUT` | `/api/collections/:id` | Update collection |
| `DELETE` | `/api/collections/:id` | Delete collection |

## Digitization API (`/api/digitization`, admin only)

Vinyl digitization pipeline — fetch Discogs metadata, plan/apply track
splits, encode, and publish a `MEDIA_INBOX_PATH` draft folder into
`MEDIA_ROOT_PATH`. See [`apps/wave/API_ENDPOINTS.md`](../../apps/wave/API_ENDPOINTS.md#digitization-api-admin-only)
for the full reference.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/drafts` | List inbox drafts with derived stage |
| `GET` | `/drafts/:slug` | Get one draft |
| `GET` | `/drafts/:slug/cover` | Draft cover image |
| `POST` | `/drafts/:slug/metadata` | Fetch metadata from Discogs (refuses to overwrite without `force`) |
| `PUT` | `/drafts/:slug/metadata` | Save a manual metadata edit |
| `GET` | `/discogs/search` | Search Discogs releases |
| `POST` | `/drafts/:slug/split/plan` | Compute a cut plan from the side recordings |
| `POST` | `/drafts/:slug/split/apply` | Cut sides into track wavs (refuses to overwrite existing non-empty tracks) |
| `GET` | `/drafts/:slug/audio/:file` | Range-enabled audio playback for auditioning |
| `POST` | `/drafts/:slug/publish` | Encode + publish into `MEDIA_ROOT_PATH` (background job) |
| `POST` | `/drafts/:slug/cleanup` | Delete raw sides or the whole draft folder — explicit, confirmed, only after publish |
| `GET` | `/jobs/:id` | Poll a background job (encode/publish) |

## User Management (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/accounts` | List users |
| `POST` | `/api/accounts` | Create user |
| `PUT` | `/api/accounts/:id` | Update user |
| `DELETE` | `/api/accounts/:id` | Delete user |

## Stream Control API (`/api/stream`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/rtmp/start` | Start RTMP server |
| `POST` | `/rtmp/stop` | Stop RTMP server |
| `POST` | `/rtmp/restart` | Restart RTMP server |
| `GET` | `/rtmp/config` | Get RTMP configuration |
| `PUT` | `/rtmp/config` | Update RTMP configuration |

## Monitoring API (`/api/monitoring`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get complete monitoring data |
| `GET` | `/health` | System health overview |
| `GET` | `/rtmp` | RTMP service statistics |
| `GET` | `/metrics/:service` | Metrics for specific service |
| `GET` | `/logs` | System logs |
| `GET` | `/logs/:service` | Logs for specific service |

## WebSocket

Connect to `ws://localhost:6871` for real-time updates.

### Event Types

- `status_update` - Stream status changes
- `track_change` - Now playing updates
- `chat_message` - Chat messages
- `error` - Error notifications

### Example

```javascript
const ws = new WebSocket('ws://localhost:6871');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'status_update':
      break;
    case 'track_change':
      break;
    case 'chat_message':
      break;
  }
};
```

## Response Format

### Success

```json
{
  "success": true,
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "hasNext": true,
  "hasPrev": false
}
```

## Quick Test

```bash
curl http://localhost:6870/health
curl http://localhost:6870/api/monitoring/
curl http://localhost:6870/api/monitoring/health
```
