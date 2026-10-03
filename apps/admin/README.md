# @radio/admin

Admin panel for the Radio streaming platform. Built with React 18, Vite, and Tailwind CSS.

## Quick Start

```bash
# From monorepo root
pnpm admin:dev
# Open http://localhost:3001
```

## Features

- **Collection Management** - Albums, songs, playlists with filtering and search
- **Vinyl Digitization** - Discogs metadata, waveform track splitting, encode and publish of recorded vinyl sides («Оцифровка»)
- **Stream Control** - RTMP server and Telegram stream management
- **User Management** - Create and manage user accounts
- **Real-time Monitoring** - System health and service status via WebSocket
- **PWA Support** - Installable as a Progressive Web App

## Tech Stack

- React 18 + TypeScript
- Vite (dev server and build)
- TanStack Router (file-based routing)
- TanStack Query (server state)
- Zustand (client state)
- Tailwind CSS + @radio/mojo-ui components
- Framer Motion (animations)

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server (port 3001) |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests (Vitest) |
| `pnpm lint` | Lint with Biome |
| `pnpm check-types` | TypeScript type check |

## Project Structure

```
src/
├── components/       # Shared UI components (form inputs, notifications)
├── features/
│   ├── admin/        # Admin layout, navigation, user menu
│   ├── auth/         # Login page
│   ├── collection/   # Album and playlist management
│   ├── digitization/ # Vinyl digitization pipeline
│   ├── main/         # Main dashboard
│   ├── stream/       # Stream control interface
│   └── users/        # User management
├── routes/           # TanStack Router route definitions
├── services/api/     # API clients and hooks
└── styles/           # Global styles
```

## Environment Variables

Same `VITE_*` convention as `@radio/player`. Only variables prefixed with `VITE_` are embedded in the client bundle. `VERCEL_*` system variables (for example `VERCEL_GIT_BRANCH`) are also exposed in this app via `envPrefix` in `vite.config.ts`.

**Local** — copy `.env.example` to `.env` and adjust:

```env
VITE_API_URL=http://localhost:6870
VITE_SOCKET_URL=ws://localhost:6871
VITE_APP_ENV=development
```

**Production (Vercel)** — set these in the project’s Environment Variables (Production / Preview as needed). Do not rely on dev defaults: without `VITE_API_URL` / `VITE_SOCKET_URL`, the app falls back to `window.location` with ports `6870` / `6871`, which is wrong for a deployed host.

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | REST API base URL (e.g. `https://api.example.com`) |
| `VITE_SOCKET_URL` | WebSocket URL (e.g. `wss://ws.example.com`) |
| `VITE_APP_ENV` | `production` for production, `preview` for preview builds, `development` for local |

## Deployment

Deployed on Vercel like the player. Use `vercel.json` in this app for SPA routing (fallback to `index.html`). Point the Vercel project at `apps/admin` (or your monorepo root with the correct **Root Directory**), run `pnpm build` from that app, and output `dist`.
