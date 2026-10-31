---
id: IDEA-12
title: Admin puts the song on air (now-playing for the player)
type: feat
status: in-progress
created: 2026-10-30
updated: 2026-10-31
tags:
  - wave
  - admin
  - stream
  - now-playing
order: 2
---

The Puget Sound player (IDEA-11) renders the album sleeve of the song on
air and already listens on wave's WebSocket for the fixed contract —
`{ type: 'now_playing', artist, title, cover? }`, where a missing or
empty `title` clears back to the generic sleeve and `cover` goes
straight into an `<img src>`, so it must be an absolute URL. Nothing
sends that message yet; this idea is the backend half.

Decided with Denys (the IDEA-11 open question): **the admin app sets
it**. Wave never sees the audio content — it only relays OBS through the
dockerized nginx-rtmp (`rtmpService`), so no server-side process can
know which record is spinning; only the person at the turntable does.
The admin app already has authed REST to wave, the album library with
covers, and the collection UI — marking the current album or song there
is one click. The wave endpoint is shaped so the stream toolchain could
later set the same value through the same API with a token; that path is
out of scope here.

Naming: on the wave/admin side the state is called **on air**
(`onAirService`, `/api/stream/on-air`, «В ефірі») — the admin app
already has a `useNowPlaying` hook that means its local preview player,
and only the WebSocket message keeps the player's `now_playing` name.

**Architecture (settled by exploration):**

- `apps/wave/src/services/stream/onAirService.ts` holds the current
  value `{ albumId, songId?, artist, title, cover?, setAt }`, persisted
  as a small cwd-relative JSON file (the `chat.log` pattern in
  `utils/chatStore.ts`) and loaded at startup, so it survives a wave
  restart. A set resolves display fields from the DB at write time:
  album artist/title, or for a song its title with the song's artist
  falling back to the album's; the cover comes from the album service's
  public getters, which already return `coverImageUrl` as an absolute
  URL (`computeCoverImageUrl` handles media-folder, uploaded and
  fallback covers). Unknown ids are refused.
- REST on the existing `streamRoutes`: public `GET /api/stream/on-air`;
  `PUT /api/stream/on-air` with `{ albumId, songId? }` and
  `DELETE /api/stream/on-air` behind `authMiddleware` +
  `adminMiddleware`, `{ success, data }` envelope via `ResponseHelper` —
  the IDEA-2 conventions.
- WebSocket: every set/clear broadcasts the player contract via the
  existing `clientStore.broadcast`; a clear is a bare
  `{ type: 'now_playing' }` (no title → the player falls back). The
  `open` handler in `ws/server.ts` sends the current value to the
  joining client the way it already replays chat history, so a fresh
  page learns the song without waiting for a change.
- Admin: `on-air-api.ts` + TanStack Query hooks in `src/services/api`;
  «Поставити в ефір» in the album detail's `album-actions.tsx` and per
  song in `song-item.tsx`, with the on-air album/song visibly marked;
  the current state with «Зняти з ефіру» as a card on the stream page
  (`features/stream/components/cards`).

### Out of scope

The stream toolchain path (OBS / digitization publishing metadata with a
token) — the endpoint's shape leaves room for it, nothing more. The
player — its contract is fixed and shipped with IDEA-11. Track progress
or duration on air (the admin's local preview player is unrelated and
untouched).

### Phases
- [x] Phase 1 — Wave on-air service and REST
      `onAirService.ts` with the persisted current value and DB
      resolution (album vs song, artist fallback, absolute cover URL,
      unknown ids refused); `GET`/`PUT`/`DELETE /api/stream/on-air`
      routes (writes auth + admin, zod-validated body). Unit tests:
      resolution, persistence round-trip, refusals.
      run: 45m34s · 114 in · 22.9k out · sonnet-5 · sess:b8dfcf2a-2ae9-4492-b921-8aa3aaea1b3c
- [x] Phase 2 — WebSocket push and join replay
      Broadcast `{ type: 'now_playing', artist, title, cover? }` via
      `clientStore.broadcast` on every set/clear (bare type-only message
      on clear); send the current value to each client in the `open`
      handler after chat history. Tests exercise broadcast and join
      replay through the client store.
      run: 1h · 110 in · 16k out · sonnet-5 · sess:2288dbb3-575a-431a-9a86-827712c59a62
- [x] Phase 3 — Admin on-air controls
      `on-air-api.ts` + query hooks with a key factory in
      `src/services/api`; «Поставити в ефір» in `album-actions.tsx` and
      `song-item.tsx` with the on-air item marked; an
      `on-air-card.tsx` on the stream page showing cover, artist —
      title, set time, and «Зняти з ефіру». Follow CODE_STYLE_GUIDE
      (named exports, styles-object Tailwind, barrels).
      run: 6m59s · 124 in · 26.6k out · sonnet-5 · sess:2288dbb3-575a-431a-9a86-827712c59a62
- [ ] Phase 4 — Docs, checks, ship
      Update `apps/wave/API_ENDPOINTS.md`, `docs/api/README.md`,
      `docs/apps/admin.md`. check-types / lint / tests green across the
      repo; verify against a running wave that the player sleeve updates
      live and a fresh join gets the current song. Committed on its own
      branch, PR opened.

### Thread
- [x] 2026-10-30 [decision] [user] The admin app sets now-playing (answering the IDEA-11 open question): wave only relays OBS and cannot see the track; admin has the albums, covers and auth. The endpoint stays callable by the stream toolchain later with a token.
- [x] 2026-10-30 [decision] [agent] Wave/admin naming is "on air" (`onAirService`, `/api/stream/on-air`, «В ефірі») to avoid the admin app's existing `useNowPlaying`, which is its local preview player; only the WebSocket message keeps the player's `now_playing` contract name.
- [x] 2026-10-31 [question] [agent] Run-all parked on phase 4 ("Phase 4 — Docs, checks, ship") — the agent needs a decision: This repo gates `git commit`/`git push` to "ask" — how should a headless run with no approval channel proceed?**
      option: Grant commit permission for this session and re-run — completes commit + PR as the phase requires
      option: I leave the doc edits staged on branch `feat/idea-12-phase-4-docs-ship` uncommitted — you commit/push/PR manually
      option: Add a one-time allow rule for `git commit`/`git push` in `.claude/settings.local.json` for this session — 
      context: `.claude/settings.local.json` has `"ask": ["Bash(git commit)", "Bash(git commit *)", "Bash(git push)", "Bash(git push *)"]`. Documentation is written and staged on a new branch, `check-types` and biome are clean; only the commit/PR step is blocked. I reverted the phase-4 checkbox/status edit since the phase isn't actually finished.
- [x] 2026-10-31 [clarification] Grant commit permission for this session and re-run
- [x] 2026-10-31 [chat] [agent] Got it — commit permission granted for this session, re-running Phase 4 now.
