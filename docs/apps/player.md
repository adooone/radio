# Player App

Public-facing radio player for listeners. Built with React 18, Vite, and HLS.js.

## Overview

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query + Zustand
- **Routing**: TanStack Router
- **Streaming**: HLS.js for audio playback
- **Real-time**: WebSocket for chat

## Architecture

```
src/
├── features/
│   ├── radio/             # Main radio functionality
│   │   ├── components/
│   │   │   ├── chat/      # Chat system
│   │   │   ├── settings/  # User settings
│   │   │   └── ui/        # Core UI elements
│   │   ├── hooks/
│   │   ├── queries/
│   │   └── radio-layout.tsx
│   └── collection/        # Album browsing
│       └── components/    # Album grid, cards, detail modal
├── components/
│   ├── layout/            # Layout, container, footer
│   └── ui/                # Buttons, toggles
├── services/
│   ├── api/               # API client
│   └── storage/           # Local storage utils
├── stores/                # Zustand stores
├── routes/                # Route definitions
└── styles/                # Global styles
```

## Features

- **HLS Streaming**: Adaptive audio playback via HLS.js
- **Real-time Chat**: WebSocket-based messaging with user colors
- **Controls**: Every control comes from `@dendelion/func-ui` — the island's volume is a `LampSlider`, the chat's listeners toggle a `GhostToggle`, its fields `Input`/`Textarea`, the colour choice `ColorSwatches`
- **Collection Browse**: Album grid with filtering and detail views
- **PWA Support**: Progressive Web App with service worker
- **Responsive Design**: Mobile and desktop support

## Development

```bash
# Start development server (port 3030)
pnpm player:dev

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
VITE_API_URL=http://localhost:6870
VITE_SOCKET_URL=ws://localhost:6871
VITE_STREAM_URL=https://stream.adoo.one/hls/test.m3u8
VITE_APP_ENV=dev
```

## Deployment

Deployed to Vercel. See `vercel.json` for SPA rewrite configuration.

---

**Next**: [API Reference](../api/streaming.md) | [Setup Guide](../setup/README.md)
