# Admin Panel

Web-based admin interface for managing the radio streaming platform. Built with React 18, Vite, and Tailwind CSS.

## Overview

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Server State**: TanStack Query
- **Client State**: Zustand
- **Styling**: Tailwind CSS + @dendelion/func-ui components
- **Animations**: Framer Motion

## Architecture

```
src/
├── components/
│   ├── auth/             # Auth guard
│   └── ui/               # Toasts, the wave connection line
├── features/
│   ├── admin/            # The stage: layout, the split (work column + slab),
│   │   │                 #   control island, track strip, user ring
│   │   └── ui/           # The admin's primitives in the player's language:
│   │                     #   Pill, TabPills, Chip, Dot, FeedRow, Stat, Field, GhostNav
│   ├── auth/             # Login page (kept as it was)
│   ├── collection/       # «Колекція»
│   │   ├── components/   # Album browser and rows, the detail on the slab
│   │   │                 #   (sleeve, notes, session / folder photos, songs,
│   │   │                 #   in-place edit form and cover drop), playlists
│   │   ├── hooks/        # Collection data, album form, photo blobs
│   │   ├── lib/          # Meta lines, plurals, durations
│   │   ├── store/        # Tab, search, sort, what is open
│   │   └── utils/        # Filtering, sorting, completeness
│   ├── digitization/     # «Студія»
│   │   ├── components/   # Stage chips, draft rows, the draft's steps: upload
│   │   │                 #   zone, Discogs lookup, metadata form, split review
│   │   │                 #   with the waveform, publish / cleanup, radio folder
│   │   ├── hooks/        # Chunked upload, radio folder (File System Access),
│   │   │                 #   side audition, metadata form
│   │   └── lib/          # Stages, slugify, dropped files, folder scan, IDB handle
│   ├── on-air/           # «Ефір»
│   │   ├── components/   # Turntable (the record), figures, corner status,
│   │   │                 #   the slab's journal / monitoring / settings
│   │   ├── hooks/        # Journal state, RTMP config edit session
│   │   └── lib/          # RTMP status heuristics and figures
│   └── users/            # The people sheet behind the island's user ring
├── routes/               # TanStack Router routes
├── services/api/         # API clients and query hooks
└── styles/               # Tailwind entry: fonts, type voices, stage CSS
```

The wordmark, the splat record, the sleeve-and-record (`VinylBox`), the
wavy seam slab and the film overlay — and the func-ui retune, island glass
and film CSS — come from `@radio/stage`, shared with the player. Pages
render into the stage's split through `features/admin/split.tsx`: the work
on the left, a feed or detail on the slab to the right, and optional
controls in the top-right corner. Forms open in place (the slab swaps its
detail for the form); the people sheet is the one overlay.

## Features

- **Collection Management** - Albums, songs, and playlists with search and filtering
- **Vinyl Digitization** - In-app chunked upload of recorded vinyl sides into `MEDIA_INBOX_PATH` (drag-and-drop, or a remembered "тека Radio" folder in Chromium), Discogs metadata, waveform-based track splitting, encode and publish
- **Three pages** - «Ефір» (`/`), «Колекція» (`/collection`) and «Студія» (`/studio`, `/studio/$slug`), each the player's 2 : 1 split on an ink stage with the control island docked at the bottom. `/digitization`, `/stream-control` and `/users` redirect
- **On Air** - The record on air drawn as the player draws it, the turntable's place in it, and the three actions: «Наступний трек», «Зупинити вертушку», «Зняти з ефіру»; four figures (RTMP, listeners, bitrate, air time); on the slab, the station's journal from wave's logs, the RTMP service's rows with start / stop / restart, and its configuration edited in place
- **People sheet** - Behind the island's user ring, over the dimmed page: accounts with their role and light, role / active toggles, delete, create (in place), JSON export and sign out
- **Real-time Monitoring** - Service status and system health
- **PWA Support** - Installable Progressive Web App, installed as a Dock app the Студія workflow is designed around

## Vinyl Digitization Upload

The admin, installed as a PWA («Встановити застосунок» in the browser menu
gives it a Dock icon), is the digitization workflow's upload client — it
replaces rsyncing side WAVs into the server inbox. On the Студія page:

- **Drag-and-drop / file picker** - works everywhere; drag the whole record
  folder in Chromium (recurses into it) or select files directly on
  Safari/Firefox.
- **"Тека Radio"** - Chromium only (File System Access API). Pick a folder
  once and the admin remembers it (the directory handle persists in
  IndexedDB); the panel lists record folders found inside it
  (`band-slug_album-slug`, matching the inbox naming convention) with a
  one-click upload per folder. Absent on Safari/Firefox, where the drop
  zone remains the only path.
- Uploads are **chunked and resumable** with progress, pause/resume and
  retry, so a 200-700 MB side WAV survives a dropped connection.

rsync into `MEDIA_INBOX_PATH` (see
[Vinyl Digitization Inbox](../setup/README.md#vinyl-digitization-inbox))
still works as a fallback for machines that can't run the admin PWA, but
it's no longer the primary flow.

## Development

```bash
# Start development server (port 3001)
pnpm admin:dev

# Build
pnpm build

# Test
pnpm test

# Type check
pnpm check-types

# Lint
pnpm lint
```

## Environment Variables

```env
VITE_APP_ENV=development
VITE_API_URL=http://localhost:6870
VITE_SOCKET_URL=ws://localhost:6871
```

## Design System

Uses @dendelion/func-ui, including its lamp family for retro-styled controls (buttons, switches, meters, etc.), combined with Tailwind CSS utilities and custom fonts:

- **Tiny5** - Display font
- **Montserrat** - Primary sans-serif
- **Montserrat Alternates** - Alternative headings
- **Ponomar** - Decorative
- **JetBrains Mono** - Monospace

---

**Next**: [Player Documentation](player.md) | [API Reference](../api/streaming.md)
