# @radio/wave

Backend server for the Radio streaming platform. Built with Bun, Hono, and SQLite via Drizzle ORM.

## Quick Start

```bash
# Install dependencies (from monorepo root)
pnpm install

# Setup database
bun run db:migrate

# Create admin user
bun run admin

# Start development server
bun run dev
```

## Scripts

### Development

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun test` | Run tests |
| `bun test --watch` | Run tests in watch mode |

### Database

| Script | Description |
|--------|-------------|
| `bun run db:migrate` | Run database migrations (creates pre-migration backup in `data/backups/`) |
| `bun run db:generate` | Generate new migration |
| `bun run db:push` | Push schema changes |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run db:test` | Test database connection |

### User Management

| Script | Description |
|--------|-------------|
| `bun run admin` | Interactive admin creation |
| `bun run check-users` | List all users |
| `bun run promote-admin` | Promote user to admin |
| `bun run create-admin` | Create new admin user |
| `bun run reset-password` | Reset user password |
| `bun run cleanup-users` | Clean up users |
| `bun run backup-db` | Backup database (JSON export) |
| `bun run restore-db` | Restore from latest pre-migration backup |

### Services

| Script | Description |
|--------|-------------|
| `bun run rtmp` | Start RTMP Docker container |

### PM2 (Production)

| Script | Description |
|--------|-------------|
| `bun run pm2:start` | Start all services (production) |
| `bun run pm2:stop` | Stop all services |
| `bun run pm2:restart` | Restart all services |
| `bun run pm2:logs` | View PM2 logs |

PM2 process names: `radio.wave`

## Architecture

### Core

- **Hono** - HTTP framework
- **Drizzle ORM** - Database layer (SQLite via better-sqlite3)
- **WebSocket (ws)** - Real-time chat and status updates
- **Zod** - Request validation

### Project Structure

```
src/
├── api/
│   ├── handlers/     # Request handlers
│   ├── routes/       # Route definitions
│   ├── schemas/      # Zod schemas
│   └── validators/   # Request validators
├── db/               # Database schema, queries, migrations
├── services/         # Business logic
├── utils/            # Utility functions
├── ws/               # WebSocket server
└── scripts/          # Admin and DB scripts
```

## Database

### Tables

| Table | Description |
|-------|-------------|
| `accounts` | User accounts with roles (user/admin) |
| `albums` | Music albums with metadata |
| `audio_files` | Uploaded audio files |
| `collections` | Playlists / audio collections |
| `collection_items` | Collection-to-audio relationships |
| `sessions` | Authentication sessions |

## API Endpoints

See [API Documentation](../../docs/api/README.md) for the full reference.

### Key Routes

- `POST /api/auth/login` - Authentication
- `GET/POST /api/albums` - Album management
- `POST /api/audio-files/upload` - File uploads
- `GET/POST /api/collections` - Playlist management
- `GET /api/monitoring/` - System monitoring
- `/api/stream/*` - RTMP control

## Environment Variables

```env
PORT=6870
SOCKET_PORT=6871
MEDIA_ROOT_PATH=/var/www/p-sound
MEDIA_BASE_URL=/media/p-sound
MEDIA_INBOX_PATH=/var/www/p-sound-inbox
DISCOGS_TOKEN=
```

`MEDIA_INBOX_PATH` is where recorded vinyl side WAVs land for the
digitization pipeline (see `src/services/digitization/`), separate from
`MEDIA_ROOT_PATH` where published albums are served from. `DISCOGS_TOKEN`
is optional — release lookups by URL/id work without it, but it's required
for Discogs search and cover-image download.

## File Storage

- **Audio files**: `data/uploads/`
- **Database**: `data/wave.sqlite`
- **Logs**: `logs/`
