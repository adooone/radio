# Setup Guide

## Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 22.15.0+ | Runtime (managed via Volta) |
| Bun | 1.2.9+ | Wave backend runtime |
| pnpm | 10.8.0+ | Package manager |
| Docker | Latest | RTMP server container |
| PM2 | Latest | Production process management |
| FFmpeg | Latest | Telegram streaming |

## Installation

```bash
# Clone and install
git clone <repository-url>
cd radio
pnpm install
```

## Environment Configuration

### Wave Backend (`apps/wave/.env`)

```bash
cp apps/wave/.env.example apps/wave/.env
```

```env
PORT=6870
SOCKET_PORT=6871
MEDIA_ROOT_PATH=/var/www/p-sound
MEDIA_BASE_URL=/media/p-sound
MEDIA_INBOX_PATH=/var/www/p-sound-inbox
DISCOGS_TOKEN=
```

`MEDIA_INBOX_PATH` is the vinyl digitization inbox — see
[Vinyl Digitization Inbox](#vinyl-digitization-inbox) below.
`DISCOGS_TOKEN` is optional (only needed for Discogs search and cover
download; release lookup by URL/id works without it).

### Admin Panel (`apps/admin/.env`)

```bash
cp apps/admin/.env.example apps/admin/.env
```

```env
VITE_APP_ENV=development
VITE_API_URL=http://localhost:6870
VITE_SOCKET_URL=ws://localhost:6871
```

### Player (`apps/player/.env`)

```bash
cp apps/player/.env.example apps/player/.env
```

```env
VITE_API_URL=http://localhost:6870
VITE_SOCKET_URL=ws://localhost:6871
VITE_STREAM_URL=https://stream.adoo.one/hls/test.m3u8
VITE_APP_ENV=dev
```

## Development

```bash
# Start everything
pnpm dev

# Or individually
pnpm wave:dev     # Backend API (port 6870)
pnpm admin:dev    # Admin panel (port 3001)
pnpm player:dev   # Public player (port 3030)
pnpm mojo:dev     # Component showcase (port 3010)
```

### Database Setup

```bash
cd apps/wave
bun run db:migrate
bun run admin       # Interactive admin user creation
```

### Vinyl Digitization Inbox

The admin "Оцифровка" page turns recorded vinyl side WAVs into published
albums. The only manual step is on the recording machine (e.g. a Mac
running Logic Pro):

```bash
# On the server: create the inbox directory (sibling of MEDIA_ROOT_PATH)
# and give it write access for the account that rsyncs into it.
sudo mkdir -p /var/www/p-sound-inbox
sudo chown "$USER" /var/www/p-sound-inbox
```

```bash
# On the Mac, after bouncing side-a.wav, side-b.wav, ... in Logic Pro:
# the folder must be named band-slug_album-slug (lowercase, hyphens).
mkdir -p ~/Desktop/pink-floyd_the-dark-side-of-the-moon
# move/export the side WAVs into it, then:
rsync -avP --progress \
  ~/Desktop/pink-floyd_the-dark-side-of-the-moon \
  user@server:/var/www/p-sound-inbox/
```

The folder shows up in the admin "Оцифровка" page as a draft once it
lands — fetch Discogs metadata, review/plan the track split, and publish
from there. See [`apps/wave/API_ENDPOINTS.md`](../../apps/wave/API_ENDPOINTS.md#digitization-api-admin-only)
for the underlying API.

### RTMP Server

```bash
pnpm --filter @radio/wave rtmp
```

This starts a Docker container with:
- RTMP Input: `rtmp://localhost:1935/live`
- HLS Output: `http://localhost:8069/hls/`

## Production

### Build

```bash
pnpm build
```

### Start with PM2

```bash
# Start Wave backend
pnpm wave:start

# Start Telegram stream daemon
pnpm --filter @radio/wave telegram:start

# Check status
pm2 status

# View logs
pm2 logs
```

### PM2 Process Names

| Process | Name | Description |
|---------|------|-------------|
| Wave Backend | `radio.wave` | Main API server |
| Telegram Daemon | `radio.telegram` | Telegram stream relay |

## Troubleshooting

### Port Conflicts

```bash
sudo lsof -i :6870  # Wave API
sudo lsof -i :6871  # WebSocket
sudo lsof -i :3001  # Admin Panel
sudo lsof -i :3030  # Player
sudo lsof -i :1935  # RTMP Server
sudo lsof -i :8069  # HLS Output
```

### FFmpeg Not Found

Required for Telegram streaming:

```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Verify
ffmpeg -version
```

### Service Start Order

1. Docker (RTMP server)
2. Wave Backend (API server)
3. Telegram Daemon (requires Wave + RTMP)
4. Admin Panel (requires Wave)
5. Player (requires Wave)
