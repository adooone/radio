# Wave Backend Server

Core backend server for the Radio streaming platform. Built with Bun, Hono, and SQLite via Drizzle ORM.

## Overview

- **Runtime**: Bun
- **Framework**: Hono
- **Database**: SQLite via better-sqlite3 + Drizzle ORM
- **Real-time**: WebSocket (ws)
- **Validation**: Zod
- **Process Management**: PM2

## Architecture

```
src/
├── api/
│   ├── handlers/         # Request handlers
│   ├── routes/           # Route definitions
│   ├── schemas/          # Zod validation schemas
│   └── validators/       # Request validators
├── db/                   # Database schema, queries, migrations
│   ├── accounts/
│   ├── albums/
│   ├── collections/
│   └── streams/
├── services/
│   ├── accounts/         # User management
│   ├── albums/           # Album CRUD
│   ├── audioFiles/       # Audio file handling
│   ├── auth/             # Authentication
│   ├── collections/      # Playlist management
│   ├── monitoring/       # System monitoring
│   └── stream/           # RTMP streaming
├── utils/                # Utility functions
├── ws/                   # WebSocket server
├── scripts/              # Admin and DB management scripts
└── index.ts              # Server entry point
```

## Features

- **REST API** - Full CRUD for albums, audio files, collections, accounts
- **WebSocket** - Real-time chat and status updates
- **Authentication** - JWT-based sessions with role-based access
- **File Upload** - Audio file handling with metadata extraction
- **RTMP Control** - Docker container management for RTMP server
- **Monitoring** - System health and service status

## Database Tables

| Table | Description |
|-------|-------------|
| `accounts` | User accounts with roles (user/admin) |
| `albums` | Music albums with metadata and cover art |
| `audio_files` | Uploaded audio files |
| `collections` | Playlists / audio collections |
| `collection_items` | Collection-to-audio relationships |
| `sessions` | Authentication sessions |

## Scripts

See [apps/wave/README.md](../../apps/wave/README.md) for the full list.

Key scripts:
- `bun run dev` - Dev server with hot reload
- `bun run db:migrate` - Run migrations
- `bun run admin` - Interactive admin creation
- `bun run rtmp` - Start RTMP server

## PM2 Processes

| Name | Script | Description |
|------|--------|-------------|
| `radio.wave` | `src/index.ts` | Main API server |

## Environment Variables

```env
PORT=6870
SOCKET_PORT=6871
```

## File Storage

- **Audio files**: `data/uploads/`
- **Database**: `data/wave.sqlite`
- **Logs**: `logs/`

---

**Next**: [Admin Panel Documentation](admin.md) | [API Reference](../api/streaming.md)
