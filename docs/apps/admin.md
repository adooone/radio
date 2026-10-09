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
├── components/           # Shared UI (form inputs, notifications)
├── features/
│   ├── admin/            # Layout, navigation, user menu
│   ├── auth/             # Login page
│   ├── collection/       # Album and playlist management
│   │   ├── components/
│   │   │   ├── content/  # Album list, playlist list
│   │   │   ├── filters/  # Search bar, filter chips
│   │   │   ├── modals/   # Create/edit/detail modals
│   │   │   ├── shared/   # Tag editor, cover/audio upload
│   │   │   └── sidebar/  # Sidebar navigation, stats, views
│   │   ├── hooks/        # Collection state hooks
│   │   └── store/        # Collection Zustand store
│   ├── digitization/     # Vinyl digitization pipeline («Оцифровка»)
│   ├── main/             # Dashboard
│   ├── stream/           # Stream control (RTMP)
│   └── users/            # User management
├── routes/               # TanStack Router routes
├── services/api/         # API clients and query hooks
└── styles/               # Global styles
```

## Features

- **Collection Management** - Albums, songs, and playlists with search and filtering
- **Vinyl Digitization** - In-app chunked upload of recorded vinyl sides into `MEDIA_INBOX_PATH` (drag-and-drop, or a remembered "тека Radio" folder in Chromium), Discogs metadata, waveform-based track splitting, encode and publish
- **Stream Control** - RTMP server management
- **User Management** - Account creation and role management
- **Real-time Monitoring** - Service status and system health
- **PWA Support** - Installable Progressive Web App, installed as a Dock app the Оцифровка workflow is designed around

## Vinyl Digitization Upload

The admin, installed as a PWA («Встановити застосунок» in the browser menu
gives it a Dock icon), is the digitization workflow's upload client — it
replaces rsyncing side WAVs into the server inbox. On the Оцифровка page:

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
