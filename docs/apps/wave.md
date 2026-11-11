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
- **The station (rotation)** - While on, wave plays the whole library as a radio: every track once per pass in a shuffled order, no two neighbours from one album or by one artist, in batches of about two hours per ffmpeg run, crossfaded (4 s) and each track at its measured gain. A record put on air by hand interrupts it and the rotation carries on after it; «Зняти з ефіру» or «Зупинити вертушку» switch it off. Its state (on / off, this pass's played tracks, "play next" asks) is kept in `data/rotation.json`, and a watchdog restarts it within 30 s if it stops while on. Going live from OBS means switching it off first (nginx takes one publisher per stream key)
- **Even loudness** - Every track's EBU R128 loudness is measured once and stored as `songs.gain_db` (target -16 LUFS, true peak kept under -1 dBTP, ±12 dB); the Studio's publish measures new records, `bun run measure-loudness` the rest

### Station API

| Method | Path | Body | |
|--------|------|------|-|
| `GET` | `/api/stream/rotation` | | On / off, mode, the next tracks, "play next" asks, pass progress |
| `PUT` | `/api/stream/rotation` | `{ enabled }` | Station on or off (admin) |
| `POST` | `/api/stream/rotation/skip` | | A fresh batch now (admin) |
| `POST` | `/api/stream/rotation/next` | `{ songId }` | Play after the current track (admin) |

## Database Tables

| Table | Description |
|-------|-------------|
| `accounts` | User accounts with roles (user/admin) |
| `albums` | Music albums with metadata and cover art |
| `audio_files` | Uploaded audio files |
| `collections` | Playlists / audio collections |
| `collection_items` | Collection-to-audio relationships |
| `sessions` | Authentication sessions |
| `songs` | An album's tracks, with `gain_db` for the station's loudness |

## Scripts

See [apps/wave/README.md](../../apps/wave/README.md) for the full list.

Key scripts:
- `bun run dev` - Dev server with hot reload
- `bun run db:migrate` - Run migrations
- `bun run measure-loudness` - Measure tracks without a gain (`--all` remeasures)
- `bun run admin` - Interactive admin creation
- `bun run rtmp` - Start RTMP server

## PM2 Processes

| Name | Script | Description |
|------|--------|-------------|
| `radio.wave` | `src/index.ts` | Main API server |

pm2 does not start on boot by itself: run `pm2 startup` once (it prints a
`sudo` command to run) and `pm2 save` after starting wave, or the station
stays silent after a reboot.

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
