---
id: IDEA-11
title: Player rebuilt as the Puget Sound listening page
type: feat
status: review
created: 2026-10-30
updated: 2026-10-30
tags:
  - player
  - design
  - stream
  - hls
order: 1
---

The player at radio.adoo.one is remade from zero as a single listening
page for the live stream, in the retro-film language of the two sister
sites (sbjectv.shop and fo.band, sources in ~/dev): a two-ink world —
`#1C1C1C` ink and `#F0E6D2` cream, with the logo label's `#FF5647` red as
the only accent — KyivType faces (the woff2 files already sit in
`apps/player/public/fonts`), one full-viewport composition, and fo.band's
film overlay adapted over everything: jittering grain tile, canvas-drawn
scratches and dust, lens vignette, viewfinder gate with corner brackets
and meter circle, warm cast, passing light leaks, a slow weave of the
whole frame. The existing lockup (`apps/wave/public/radio-logo.svg` —
ink-splat record with red label, cream hand-serif ВІНІЛОВЕ РАДІО) is the
identity; the splat record becomes the central play control and spins
while on air. hls.js plays the HLS stream from `VITE_STREAM_URL`
(`https://stream.adoo.one/hls/test.m3u8`), native HLS on Safari; when
nothing publishes the endpoint 404s, the page says the air is quiet and
retries on a timer. The old app — chat, sockets, collection page, router,
PWA plugin, and their dependency tree — is removed with the rewrite;
whatever returns later returns as its own idea.

Mid-build the user named the radio **Puget Sound** and gave its design:
Figma → Laboratory → node 383-884 — the turntable photograph in a dark warm
room, the splat record with a glowing label, the stencil PUGET SOUND
wordmark in warm cream and the Vinyl Radio script in red neon, film dust
over everything. The page is built from that frame's own exports
(`public/brand/`: photo, dust, five sign SVGs with the glow baked in) and
its colours: `#191919` room, `#120D05` warm black, `#DFDFD4` cream,
`#FF5647` label red. fo.band already carries the same brand
(`assets/puget-sound/` and `puget-sound.tsx` there), so the sites rhyme.

### Phases
- [x] Phase 1 — Fresh scaffold
      Empty `apps/player/src` and rebuild on the monorepo's Vite/React/TS
      with Tailwind v4 (`@tailwindcss/vite`, `@theme` tokens as on the
      sister sites); hls.js the only runtime extra; `pnpm player:dev`,
      build, lint, test wired exactly as before; dead deps dropped from
      package.json.
- [x] Phase 2 — Stream engine
      A `use-radio` hook around hls.js (native HLS where supported):
      idle/loading/live/offline states, offline retry every ~15 s,
      play/pause, volume and mute, the video element surfaced so the live
      picture can show. Offline is the HLS manifest 404ing, not an error
      wall.
- [x] Phase 3 — Composition and logo
      Ink page, cream wordmark extracted from the SVG lockup, the splat
      record as the big central play control — spinning on air, still
      when quiet — a controls row (volume slider, mute, status line
      ON AIR / ТИХО), the live video as the full-bleed backdrop while
      playing; Ukrainian copy throughout.
- [x] Phase 4 — The film overlay
      fo.band's camera eye adapted into the player: grain, scratches,
      vignette, gate, corner brackets, meter circle, warm cast, light
      leaks, frame weave; strengths on `--film-*` variables;
      `prefers-reduced-motion` stills it.
- [x] Phase 5 — Responsive pass and ship
      390 px layout and safe-area insets, live and offline states checked
      against the real stream, build, lint and tests green, committed on
      its own branch with a PR.

### Out of scope

The wave backend and its `/api` surface — untouched. Chat, the public
collection page, and PWA installability: removed with the rewrite, each a
candidate for its own future idea. Vercel project settings (the app keeps
building to `dist` with the same env names).

### Thread
- [x] 2026-10-30 [decision] [user] Rebuild from zero (task handed from the OBS/stream session): don't carry the old UI over; the stream was verified live and carrying audio, so the player can be tested against the real endpoint.
- [x] 2026-10-30 [decision] [agent] The earlier uncommitted draft of IDEA-11 (collection reachable/playable) is superseded by this rebuild; its one finding that outlives the old UI — wave's audio stream endpoint advertises ranges but ignores the Range header — can come back as its own idea.
- [x] 2026-10-30 [decision] [user] The radio is named **Puget Sound** from now on, and its look follows the Figma design (Laboratory → node 383-884): colours from the design and the logo, the vintage feel kept. Status copy stays Ukrainian under the English brand.
- [x] 2026-10-30 [decision] [agent] Verified headlessly against the live stream (manifest parsed, video decoded and playing, 1466×1000 and 390×844 screenshots match the design); listening on a real device left to the user.
