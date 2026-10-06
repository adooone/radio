---
id: IDEA-2
title: Vinyl digitization pipeline in admin
type: feat
status: review
created: 2026-08-26
updated: 2026-10-05
tags:
  - admin
  - wave
  - audio
  - digitization
  - vinyl
order: 1
---

Bring the capabilities of the external `vinyl-radio-tools` repo
(`/home/croco/dev/vinyl-radio-tools` — fish + Python toolchain) into the radio
monorepo, so the only manual work left on the Mac is recording and exporting
one WAV per vinyl side. Everything else — Discogs metadata + cover, cutting
sides into tracks, encoding, publishing into the library — happens server-side
in `apps/wave` and is driven from the admin UI.

**Target workflow:**

1. On the Mac: record `side-a.wav`, `side-b.wav`, … in Logic Pro, put them in a
   folder named `band-slug_album-slug`, and rsync/scp that folder to the
   server's inbox directory.
2. The admin UI shows the folder as a **draft record** with a derived stage
   badge (awaiting sides → ready to split → ready to encode → on air).
3. In the draft view: fetch Discogs metadata (URL or search) → review/edit →
   plan cuts on a waveform → confirm → encode to m4a + webp → publish into
   `MEDIA_ROOT_PATH`, where the existing `sync-media` importer picks it up.

**Architecture (settled by exploration):**

- Drafts are **filesystem-derived, no DB rows until publish**. A draft = a
  `band-slug_album-slug` folder under a new `MEDIA_INBOX_PATH` env
  (sibling of `MEDIA_ROOT_PATH`, e.g. `/var/www/p-sound-inbox`). Stage is
  derived from folder contents exactly like `vinyl_ui.album_status()`:
  has `data.json`? has non-empty `side-*.wav`? has non-empty track wavs? is
  the slug present + encoded under `MEDIA_ROOT_PATH`? Publishing reuses
  `syncMediaToDatabase` as the single DB import path — no schema migration
  needed for drafts.
- New wave module: `apps/wave/src/services/digitization/` (camelCase files,
  per wave convention): `inboxService.ts`, `discogsService.ts`,
  `splitService.ts`, `encodeService.ts`, `jobService.ts`; routes in
  `src/api/routes/digitization.ts` + `src/api/handlers/digitizationHandlers.ts`,
  all behind `authMiddleware` + `adminMiddleware`, `{ success, data }`
  envelope via `ResponseHelper`.
- New admin feature: `apps/admin/src/features/digitization/` (kebab-case),
  own route `/digitization` + nav item («Оцифровка») following the
  code-based TanStack Router pattern in `src/router.tsx`.
- Long-running work (encode, cut) runs through a small in-memory job registry
  in wave (PM2 keeps the process alive; job loss on restart is acceptable),
  polled via `GET /api/digitization/jobs/:id`; WS push can come later.
- Port the vinyl-tools algorithms faithfully (they are proven on the real
  collection): silencedetect `noise=-40dB:d=1.0`; cuts at the **midpoint** of
  the chosen gap; edge silences (≤0.5 s from file edges) are lead-in/out trim;
  duration-guided matching with a global `scale` factor and 25 s tolerance,
  longest-gap-in-window wins; RMS refine fallback (8 kHz mono, 0.5 s windows,
  magic numbers: dip ≤ −30 dB absolute AND ≥10 dB below the loudest window);
  monotonicity check on cuts; ±0.5 s outer padding; stream-copy cutting
  (`-c copy`, output seeking). Single-track sides ⇒ trim-only (continuous /
  concept sides). Encode: `aac -b:a 256k -ar 48000` → `.m4a`; cover →
  WebP q80 into `img/cover.webp`. Slugs: `[^a-z0-9]+ → -`, `& → and`,
  NFKD accent folding; track files `a1-kebab-title.wav`; folder regex
  `^[a-z0-9-]+_[a-z0-9-]+$` remains the path-traversal guard.
- Preserve the toolchain's **never-destructive** guarantees: refuse metadata
  overwrite without explicit force, abort cutting onto existing non-empty
  track files, skip existing encode outputs, publish never deletes.

**Improvement over the old tools:** decode each side once to downsampled mono
PCM server-side and compute silence + RMS + waveform peaks in-process — this
both speeds up planning (old `refine_cut` re-invoked ffmpeg per boundary) and
gives the admin UI a real waveform with visible/adjustable cut markers, which
`vinyl_ui.html` never had. It also replaces the manual Logic-Pro-bounce flow
(`vinyl-titles`) with manual cut placement in the browser.

**Known repo gotchas to respect** (from exploration): `.m4a` is hardcoded in
`scanMediaDirectory.ts` and in the nginx `location /media/p-sound/` allowlist;
`AlbumDataJson` in `packages/types` lags the real `data.json` files (missing
`discogs` block, `catalog_number`, `country`, `released`, `format`, per-track
`duration`) and `syncMediaService` drops those keys; album zod schemas in
`apps/wave/src/utils/validation.ts` lag the DB columns. Admin deploys to
Vercel but talks to wave over REST at `VITE_API_URL`, so all new endpoints go
through wave (CORS already allows admin origins).

### Phases
- [x] Phase 1 — Wave foundation: inbox drafts API
      Add `MEDIA_INBOX_PATH` + `DISCOGS_TOKEN` to `apps/wave/src/utils/env.ts`
      (+ `.env*`, docs). Extend `packages/types/src/index.ts`: complete
      `AlbumDataJson` (discogs block, catalog_number, country, released,
      format, `tracklist[].duration`) and add digitization types
      (`DigitizationDraft`, stage union, split plan, job). Implement
      `inboxService.ts` (scan inbox folders matching the slug regex, derive
      stage from contents, read `data.json` summary) and expose
      `GET /api/digitization/drafts` + `GET /api/digitization/drafts/:slug`
      (auth + admin). Serve draft cover preview. Unit-test stage derivation
      with fixture folders.
      run: 18m41s · 62 in · 8.2k out · sonnet-5 · sess:b7416d62-3b2f-433a-869b-b2136a3be849
- [x] Phase 2 — Admin digitization page: draft list
      New feature `apps/admin/src/features/digitization/` with
      `digitization-page.tsx`: grid/list of drafts with cover, artist/title,
      stage badge, side/track counts. New `digitization-api.ts` module +
      TanStack Query hooks with key factory (`digitizationKeys`), route
      `src/routes/digitization.tsx` registered in `router.tsx`, nav item in
      `bottom-navigation.tsx` («Оцифровка»). Refresh action re-scans the
      inbox. Follow CODE_STYLE_GUIDE (named exports, styles-object Tailwind,
      barrels).
      run: 12m39s · 42 in · 6.1k out · sonnet-5 · sess:3eb1e31c-efe8-415e-be04-e2b8616b6de5
- [x] Phase 3 — Discogs metadata: fetch, search, edit
      Port `vinyl_meta.py` to `discogsService.ts`: release-URL/id parsing
      (incl. locale segments), `GET /releases/:id` + `GET /masters/:id`
      (master year → `recording_year`, failure swallowed), token-gated
      `/database/search` (type=release, format=Vinyl), `clean_name`
      disambiguation stripping, `extraartists` → personnel grouping,
      heading-row filtering (`type_ != "track"`), format/label/catno
      extraction, cover download (primary image, raw bytes). Endpoints:
      `POST /api/digitization/drafts/:slug/metadata` (by URL/id, refuses
      overwrite of existing `data.json` unless `force`),
      `GET /api/digitization/discogs/search?q=`. Admin: metadata modal
      (URL input + search picker) and a `data.json` editor form (edit-in-place
      of the user-owned fields; nothing ever re-fetches silently).
      run: 15m6s · 160 in · 57.1k out · sonnet-5 · sess:3eb1e31c-efe8-415e-be04-e2b8616b6de5
- [x] Phase 4 — Split engine: analysis, peaks, plan, apply
      `splitService.ts`: decode each `side-*.wav` once via ffmpeg to 8 kHz
      mono PCM; compute silence intervals (−40 dB / 1.0 s defaults,
      tunable), waveform peaks (min/max per ~50 ms bucket, cached JSON next
      to the wav in a `.cache/` subfolder), and the cut plan (duration-guided
      matching w/ scale + tolerance, RMS-refine fallback, longest-gaps
      fallback when durations are missing, monotonicity guard, short-track
      `<30 s` and `expected`-kind warnings — same plan JSON shape as
      `vinyl_split.py --plan-json` plus peaks + explicit cut times).
      Endpoints: `POST .../:slug/split/plan` (params noise, minSilence,
      tolerance, manual cut overrides), `POST .../:slug/split/apply`
      (stream-copy cuts to `a1-….wav` etc., abort if any target non-empty),
      plus `GET .../:slug/audio/:file` with Range support for auditioning.
      Test the planner against a real digitized record's side wavs.
      run: 9m45s · 170 in · 52.1k out · sonnet-5 · sess:a724e48c-4e5d-479e-bc2c-a55c81e03d3a
- [x] Phase 5 — Split review UI: waveform with cut markers
      Admin draft detail: per-side waveform rendered from peaks, cut markers
      (kind-coded: gap / refined / expected / manual) that can be dragged,
      added, and deleted; per-track table (filename, length vs expected,
      warnings) mirroring the old review table; tuning controls (sensitivity
      dB, min gap s, tolerance s) with re-analyze; click-to-audition playback
      around a marker via the Range endpoint; confirm button («Cut tracks» /
      «Cut anyway» when warned). Manual markers are sent as overrides to the
      plan/apply endpoints — this replaces the old vinyl-titles manual flow.
      run: 9m26s · 130 in · 66.7k out · sonnet-5 · sess:86365575-5cbd-46fa-a407-5712d8bcdf3d
- [x] Phase 6 — Encode, publish, jobs
      `jobService.ts`: minimal in-memory job registry (id, kind, status,
      progress lines, result), `GET /api/digitization/jobs/:id`.
      `encodeService.ts`: per non-empty non-`side-*` wav run
      `ffmpeg -c:a aac -b:a 256k -ar 48000` → `<MEDIA_ROOT>/<slug>/x.m4a`
      (skip existing); cover → `img/cover.webp` q80 (ffmpeg libwebp, fall
      back to sharp if the build lacks it); copy `data.json` verbatim.
      `POST .../:slug/publish` = encode job → on success call
      `syncMediaToDatabase` → draft shows «on air». Admin: publish button
      with job progress (poll), errors surfaced in a log panel. Verify
      nginx serves the new album and the collection page picks it up.
      run: 5m15s · 116 in · 28.6k out · sonnet-5 · sess:11111438-61b2-497c-a08b-4a09a2a8b486
- [x] Phase 7 — Lifecycle polish, cleanup, docs
      Draft cleanup action (delete raw side wavs and/or whole inbox folder
      after publish — explicit, confirmed, never automatic). Guard rails
      pass: overwrite refusals everywhere, friendly errors for missing
      sides / bad folder names, empty-file (placeholder) semantics kept
      distinct from missing. Update `apps/wave/API_ENDPOINTS.md`,
      `docs/api/README.md`, `docs/apps/admin.md`, `apps/admin/README.md`,
      setup docs (new env vars, inbox dir provisioning + rsync example for
      the Mac). Fix the known zod-schema lag for album vinyl fields while
      touching validation.
      run: 11m7s · 232 in · 46.1k out · sonnet-5 · sess:aedb920b-d129-4c33-976d-77e4959e413b
- [x] [manual] Add permissions allowlist for agent tool access

### Thread
- [x] 2026-10-03 [question] [agent] Run-all parked on phase 1 ("Phase 1 — Wave foundation: inbox drafts API") — the agent needs a decision: Failed to authenticate: OAuth session expired and could not be refreshed
- [x] 2026-10-03 [decision] [agent] Resumed and finished phase 1: the OAuth failure was a transient session issue, not a product decision — the prior run had already implemented env vars, types, `inboxService.ts`, routes/handlers, and tests correctly; this run verified them (check-types, biome, unit tests all pass) and checked off the phase.
- [x] 2026-10-03 [decision] [agent] Phase 5: kept the existing modal-based draft detail (widened to `max-w-6xl`) instead of introducing a new `/digitization/:slug` route, since the rest of the feature is modal-only and a route would be the first dynamic-param route in the admin app — out of scope for this phase. Click-to-audition genuinely exercises the Range endpoint from phase 4 (parses the WAV header once per side via a small ranged fetch, then fetches only the ±window PCM slice around the clicked marker and wraps it in a fresh WAV header client-side) rather than blob-loading whole sides, since vinyl side WAVs can be very large. Headless run: UI unverified in a browser, left to a human.
- [x] 2026-10-03 [decision] [agent] Phase 6: added `sharp` as a new `apps/wave` dependency to back the cover-encode fallback the plan calls for ("fall back to sharp if the build lacks it") — this server's ffmpeg build does have `libwebp`, verified by `encodeService.test.ts` exercising the real ffmpeg path end-to-end, but the sharp branch is untested against a libwebp-less ffmpeg build since none was available here. `jobService.ts` is a plain in-memory `Map`, matching the plan's "job loss on restart is acceptable". Publish's job `kind` is `'publish'` (encode + `syncMediaToDatabase` under one job), not `'encode'`, since that's the operation the button and job actually represent end-to-end. Headless run: nginx serving the new album and the collection page picking it up are left for a human to verify in a browser, as instructed.
- [x] 2026-10-03 [decision] [agent] Phase 7: cleanup (`POST .../:slug/cleanup`, body `{ target: "sides" | "folder", confirm: true }`) is gated on `draft.stage === 'on-air'` — refuses with 409 on anything not yet published, since the plan requires it to run only after publish, explicit and confirmed, never automatic. Admin UI gates the same way (only rendered once a draft is on-air) and uses `window.confirm`, matching the existing delete-album pattern — no reusable confirm-dialog component exists yet. `resolveDraftFolder` now splits its error into "Invalid draft slug" (400, malformed/path-traversal slug) vs "Not found" (404, well-formed slug with no folder) instead of collapsing both into "Not found" — updated the two inboxService tests that asserted the old collapsed message. Fixed the real (if currently inert, since `createAlbumHandler`/`updateAlbumHandler` re-read the raw body instead of the validated one) zod lag on `albumSchemas.create/update`: added `isPublished`, `releaseYear`, `rpmSpeed`, `vinylCondition`, `digitizationDate`, `equipmentUsed` so malformed values in these fields now get a clean 400 instead of silently reaching the DB layer. Docs updated: `apps/wave/API_ENDPOINTS.md` and `docs/api/README.md` gained a full Digitization API section; `docs/apps/admin.md` and `apps/admin/README.md` gained the digitization feature/directory; `docs/setup/README.md` and `docs/setup/environment.md` gained the env vars plus inbox provisioning + an rsync-from-Mac example. Headless run: UI unverified in a browser, left to a human.
