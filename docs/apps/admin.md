# Admin Panel

Web-based admin interface for managing the radio streaming platform. Built with React 18, Vite, and Tailwind CSS.

## Overview

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Server State**: TanStack Query
- **Client State**: Zustand
- **Styling**: Tailwind CSS + @radio/mojo-ui components
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
│   ├── stream/           # Stream control (RTMP, Telegram)
│   └── users/            # User management
├── routes/               # TanStack Router routes
├── services/api/         # API clients and query hooks
└── styles/               # Global styles
```

## Features

- **Collection Management** - Albums, songs, and playlists with search and filtering
- **Vinyl Digitization** - Discogs metadata, waveform-based track splitting, encode and publish of recorded vinyl sides from `MEDIA_INBOX_PATH`
- **Stream Control** - RTMP server and Telegram streaming management
- **User Management** - Account creation and role management
- **Real-time Monitoring** - Service status and system health
- **PWA Support** - Installable Progressive Web App

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

Uses @radio/mojo-ui for retro-styled components (buttons, panels, modals, etc.) combined with Tailwind CSS utilities and custom fonts:

- **Tiny5** - Display font
- **Montserrat** - Primary sans-serif
- **Montserrat Alternates** - Alternative headings
- **Ponomar** - Decorative
- **JetBrains Mono** - Monospace

---

**Next**: [Player Documentation](player.md) | [API Reference](../api/streaming.md)
