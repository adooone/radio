---
id: IDEA-11
title: Puget Sound player rebuild
type: feat
status: done
created: 2026-10-30
updated: 2026-10-31
tags:
  - player
  - design
  - stream
  - hls
  - chat
order: 1
---

The player at radio.adoo.one is the Puget Sound listening room, planned
together in conversation (the first photo-based build of 2026-10-30 is
superseded — its scaffold, HLS engine and film overlay carry over, its
composition does not). One black screen (`#0A0605` warm near-black) split
2 : 1 with **no dividers or hairlines** — the left two thirds are the
radio, the right third is the chat; on portrait phones the halves stack,
radio above chat. The palette is strict: red `#FF5647` for every shape
and control (disc, bars, buttons, sliders), warm white `#F5F2EC` for all
reading text, and red in the logo's italic script only for brand moments
(the wordmark's script line, the status line). A warm yellow `#FFB84D`
inset glow lights the red, like the logo's label.

The radio side is built around a **vinyl box**: the album sleeve of the
song on air with the red disc half slid out of it. The disc spins while
playing and audio-reactive bars breathe from its exposed edge — a Web
Audio analyser taps the real sound where the browser allows, a
time-driven animation of the same look stands in where it doesn't
(jsdom, Safari without CORS). Playback is **audio-only**: hls.js feeds a
hidden `<audio>` element (the stream's video track is ignored), native
HLS on Safari, offline = 404ing manifest with a 15 s retry. Controls are
custom-skinned Radix primitives — play, LIVE lamp, volume slider.

The chat is the old player's chat moved over **structurally and
stylistically intact**, recolored to the new palette: bubble messages
(own right in a red tint, others left on faint white), uppercase
nicknames in auto-assigned warm shades with the online status icon, mono
timestamps, «Чатік» header with the sound toggle, the auto-growing
«Шо кажеш?» input with the «Ентер» button, and the nickname gate with
its Ukrainian validation. It speaks to wave's existing WebSocket chat
(join / chat / listeners / color_update) — zero backend changes.

Nothing tells the player what's on air yet: wave has album covers in its
DB but no now-playing endpoint. The player defines the contract now — a
`now_playing` message on the same WebSocket (artist, title, cover) — and
renders a generic Puget Sound sleeve as the graceful fallback, so it is
never blocked on the backend. The wave side (endpoint + whatever sets
it) is its own future idea.

The film overlay from the first build stays on top of everything:
jittering grain, canvas scratches, vignette, gate, warm cast, light
leaks, frame weave, stilled by `prefers-reduced-motion`.

### Phases
- [x] Phase 1 — Composition
      Split 2 : 1 layout with no dividers, portrait stacking, the
      black/red/white palette as `@theme` tokens, text wordmark with the
      red glow and italic script line.
- [x] Phase 2 — Vinyl box
      Sleeve + half-hidden disc on canvas: spin on air, audio-reactive
      bars via Web Audio analyser with a time-driven fallback,
      now-playing contract (`now_playing` on the WebSocket) with the
      generic sleeve fallback.
- [x] Phase 3 — Audio engine and controls
      `use-radio` switched from video to a hidden audio element (same
      states, offline retry, live-edge join); custom controls on Radix
      primitives: play, LIVE lamp, volume.
- [x] Phase 4 — Chat
      Old chat ported into `features/chat`: socket service, bubbles,
      nicknames with auto colors and status, sounds with the toggle,
      nickname gate with validation; restyled to the new palette.
- [x] Phase 5 — Film, responsive, ship
      Film overlay over the whole page, portrait pass on a real phone
      width, tests/lint/build green, committed on the branch, PR
      updated.

### Out of scope

The wave backend — untouched; the now-playing endpoint and its admin or
toolchain wiring are a future idea. The public collection page and PWA
installability — each a candidate for its own idea. An audio-only HLS
rendition on the server (the player ignores the video track for now).

### Thread
- [x] 2026-10-30 [decision] [user] Rebuild from zero (task handed from the OBS/stream session); the radio is named **Puget Sound**; its first look followed the Figma frame (Laboratory → 383-884).
- [x] 2026-10-30 [decision] [user] The first build went ahead of the design conversation and is superseded: plan together first, then build. Scaffold, engine and film overlay are kept; photo/video composition dropped.
- [x] 2026-10-30 [decision] [user] No photo background and no video — a canvas, animatable visual and audio-only playback. Black background; red the primary color for shapes and elements, with yellow inset glow like the logo; all controls custom, not system defaults.
- [x] 2026-10-30 [decision] [user] Text is white; red (in the logo's italic font) only for special brand cases. Screen split 2 : 1, radio left, chat right, with no dividers between sections. The song on air shows its album cover as a real vinyl box with the disc half hidden inside. Chat style copied from the previous version; the film overlays kept on top.
- [x] 2026-10-30 [decision] [agent] No now-playing source exists in wave, so the player defines the WebSocket contract (`now_playing`: artist, title, cover) and falls back to a generic sleeve; the backend endpoint becomes its own idea.
- [x] 2026-10-30 [decision] [agent] Old chat's zustand color store and picker are not ported — nicknames get auto-assigned warm shades (hash of the name) fitting the strict palette; wave's `color_update` stays unused for now.
- [x] 2026-10-30 [decision] [agent] Verified headlessly against the dev server: offline state, the solid sleeve hiding the disc's half, portrait stacking at 390 px; tests, lint, types and build green. The air was off during the pass, so live playback and the analyser-driven bars still await a listen with the stream on.
- [x] 2026-10-30 [question] [agent] What should set now-playing on the air side — the admin app marking the current album, or the stream toolchain (OBS/digitization) publishing metadata?
- [x] 2026-10-30 [decision] [user] The admin app sets now-playing — wave only relays OBS and cannot see the track. Designed as IDEA-12, with the wave endpoint shaped so the stream toolchain can feed the same value later with a token.
- [x] 2026-10-31 [decision] [user] Closed as done after PR #17 merged into main.
