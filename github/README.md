# Radio Streaming Platform

A complete streaming solution for radio stations with live and playlist-based streaming, an admin panel, and a public player interface.

## Overview

Monorepo containing a full-featured radio streaming platform:

- **Live Streaming** - Real-time audio streaming from external sources
- **Radio Mode** - Playlist-based streaming with track management
- **Admin Panel** - Web-based control interface for stream and collection management
- **Player** - Public-facing radio player with chat
- **Backend API** - RESTful API with WebSocket support
- **RTMP Server** - Docker-based streaming infrastructure

## Project Structure

```
radio/
├── apps/
│   ├── wave/            # Backend server (Bun + Hono + SQLite)
│   ├── admin/           # Admin panel (React + Vite)
│   └── player/          # Public player (React + Vite + HLS.js)
├── packages/
│   └── types/           # Shared TypeScript types
├── docs/                # Documentation
│   ├── setup/           # Setup and deployment guides
│   ├── api/             # API documentation
│   ├── apps/            # App-specific docs
│   └── docs/            # Architecture and technical docs
└── .github/             # CI/CD workflows
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun 1.2.9+, Node.js 22.15+ |
| Backend | Hono, Drizzle ORM, SQLite, WebSocket |
| Frontend | React 18, Vite, TanStack Router & Query |
| Styling | Tailwind CSS |
| UI Library | @dendelion/func-ui (retro-styled components) |
| State | Zustand (client), React Query (server) |
| Monorepo | Turborepo + pnpm workspaces |
| Linting | Biome |
| CI/CD | GitHub Actions |
| Process Mgmt | PM2 |
| Streaming | Docker RTMP, FFmpeg |

## Quick Start

### Prerequisites
- Node.js 22.15.0+ (managed via Volta)
- Bun 1.2.9+
- pnpm 10.8.0+
- Docker (for RTMP server)
- FFmpeg (for audio streaming to the RTMP server)

### Installation

```bash
git clone <repository-url>
cd radio
pnpm install
```

### Development

```bash
# Start all services
pnpm dev

# Or start individually
pnpm wave:dev     # Backend API (port 6870)
pnpm admin:dev    # Admin panel (port 3001)
pnpm player:dev   # Public player (port 3030)
```

### Environment Setup

Copy `.env.example` in each app directory:

```bash
cp apps/wave/.env.example apps/wave/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/player/.env.example apps/player/.env
```

## Production

```bash
# Build all
pnpm build

# Start backend with PM2
pnpm wave:start
```

## Documentation

- [Setup Guide](../docs/setup/README.md)
- [API Reference](../docs/api/README.md)
- [Wave Backend](../apps/wave/README.md)
- [Admin Panel](../apps/admin/README.md)
- [Player](../apps/player/README.md)

## License

MIT
