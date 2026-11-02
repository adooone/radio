---
id: IDEA-16
title: Admin redesign — three pages in the player's language
type: feat
status: review
created: 2026-11-02
updated: 2026-11-02
tags:
  - admin
  - design
  - navigation
order: 5
---

The admin grew page by page — main, collection, users, stream control,
digitization — around a decorative main page (welcome card, particles,
draggable record widgets) that answers no admin question, over a photo
background with three overlays that predates the Puget Sound look.
Meanwhile the player (IDEA-11) settled a layout language worth keeping:
one fixed ink stage (`#0A0605`, no page scroll), a 2 : 1 split with no
dividers — gutters do the separation — the sign in the top-left corner,
the frosted island docked at the bottom, the strict palette (cream for
reading, label red `#FF5647`, amber lamps), KyivType Serif for what is
read and Sans for what is operated, and the film vignette over
everything. The admin already half-owns the island — its
`NavigationIsland` inspired the player's `ControlIsland` — so the loop
closes: the admin becomes the station's back room, in the listening
room's language.

**Three pages, named for the work** (mockups:
https://claude.ai/artifact/HybkRMtC1aYbAvVgLsQwbR — four boards,
desktop, drawn with the real KyivType and wordmark). The admin's UI
copy stays Ukrainian — the nav lamps read «Ефір», «Колекція»,
«Студія» — the names below are theirs in English. Every page is the
player's split: the work on the left two thirds, a feed or detail on
the right third, where the player keeps the chat.

- **On Air** (`/`, the landing) — the first admin question is "what's
  on air", which the main page never answered. Left: the on-air state
  as a vinyl box (sleeve + red disc), the turntable queue and controls
  (next / stop / clear — IDEA-12's actions), and the service cards:
  RTMP with uptime, listeners, bitrate, and the airtime stat absorbed
  from the main page's widgets. Right: the live journal, with
  monitoring and configuration (RTMP) as tabs of that column — the
  whole stream-control page folds in here.
- **Collection** (`/collection`) — albums and playlists as today, but
  in the split instead of the sidebar / list / detail slide
  choreography: searchable list left, the selected album's detail
  right (cover, metadata, session photos, the put-on-air action in
  label red). The albums / tracks / catalog-health widgets become
  header chips here.
- **Studio** (`/studio`, was digitization) — the workbench: stage
  chips (upload → split → metadata → publish), waveform with split
  markers and the track table left; the drafts list and the
  radio-folder panel right. The draft detail route moves with it.

**Users stops being a page.** Account management is rarely-visited
config: it becomes the people panel behind the island's user lamp —
list, roles, create / export, logout — so the nav holds exactly three
lamps.

**The island** carries, left to right: the logo disc; the three nav
lamps; the track strip with the live dot; the user lamp. The strip in
the mockups shows the song on air — how it shares the slot with the
admin's local preview player is an open question on the thread.

**The shell.** `admin-layout.tsx` drops the `login-bg.jpg` photo and
its three overlays for the ink stage and the player's film treatment;
the coal/sun/paper palette and func-ui's variables retune to the
strict palette the way the player's `index.css` does. The main feature
folder (widgets, particles, widget store) goes away once its numbers
live on the on-air and collection pages.

### Out of scope

The login page (stays as it is for now). The player and wave — no API
or contract changes; everything here reads what IDEA-12 already
serves. Feature internals — digitization's upload / split / publish
logic, the collection's editing logic, users CRUD — move and reskin,
not rework. Phone-portrait layouts for the admin (desktop-first, as
today).

### Phases
- [x] Phase 1 — Stage, island and routes
      The shared shell: ink stage with the film vignette in
      `admin-layout.tsx` (photo background and overlays removed), the
      corner wordmark, palette and func-ui variables retuned to the
      strict palette; the island rebuilt as the player's pill — logo
      disc, the three nav lamps, track strip, user lamp; routes
      become `/`, `/collection`, `/studio` (+ `/studio/$slug`) with
      the old paths redirecting; the main feature folder and its
      widget store removed.
      run: 5s · 54 in · 17.8k out · sonnet-5-5 · sess:856f88fc-45c8-4dab-8503-9c22be46f5b3
- [x] Phase 2 — On Air
      The landing page in the split: on-air vinyl box with the
      turntable queue and controls left, over the service cards
      (RTMP, listeners, bitrate, airtime); the right column is the
      journal with monitoring and configuration as its tabs — the
      stream page's three tabs and cards fold in, the `stream`
      feature folder absorbed.
      run: 1m30s · 78 in · 25.9k out · sonnet-5-5 · sess:856f88fc-45c8-4dab-8503-9c22be46f5b3
- [x] Phase 3 — Collection
      The collection in the split: searchable list left with the
      albums / playlists tabs in the page header, the selected
      album's detail right — cover, metadata, session photos, on-air
      and edit actions — replacing the sliding master-detail; the
      absorbed stats as header chips.
      run: 6s · 32 in · 8.1k out · sonnet-5-5 · sess:757c2b2a-e014-4f02-99a5-6b533103d0be
- [x] Phase 4 — Studio
      Digitization reskinned as the workbench: stage chips, waveform
      with split markers and the track table left; drafts and the
      radio-folder panel right; `/studio/$slug` detail carried over;
      no changes to upload / split / publish logic.
      run: 1m34s · 44 in · 12.6k out · sonnet-5-5 · sess:757c2b2a-e014-4f02-99a5-6b533103d0be
- [x] Phase 5 — People and ship
      The users page becomes the people panel behind the island's
      user lamp (list, roles, create, export, logout) and the
      `/users` route goes; docs updated (`docs/apps/admin.md`);
      check-types / lint / tests green across the repo; verified
      against a running wave.
      run: 2m3s · 54 in · 18.1k out · sonnet-5-5 · sess:757c2b2a-e014-4f02-99a5-6b533103d0be
- [x] Phase 6 — Shared chrome and the interior reskin
      The review's cleanup. The chrome the first run copied from the
      player verbatim — the five art SVGs, the wordmark, the film
      overlay, the island glass and func-ui CSS — moves to a new
      source-only `@radio/stage` package both apps import, with a
      `SplatRecord` export; the admin's stand-in discs (island logo,
      on-air vinyl) become the real splat art. Everything below the
      page shells retunes to the strict palette: tabs and stat cards,
      the stream panels, collection internals (list, detail, photos,
      songs, modals, tag editor), the studio's forms and waveform
      colours, toasts and loaders. The old palette names, dead
      components (PageLayout, Panel, filters, widgets' deps) and
      unused fonts go; `tailwind.config.js` keeps only ink / cream /
      accent / glow, with the login page's vinyl button as the one
      survivor. The layout stops double-scrolling: pages own their
      columns under a shared `--page-top` / `--page-bottom` rhythm.
      Rejected in review: the shells and the package stay, the restyled
      interiors are replaced by the rewrite below.
- [x] Phase 7 — The shell, on the player's pieces
      The player's `ChatBackdrop` moves into `@radio/stage` (with
      `bleed` / `topbar` as props) and becomes the admin's seam: the
      right column is a slab behind the cream rim, the left column
      bleeds under it, exactly the player's `.split` / `.chat-view`
      geometry. The player's canvas `VinylBox` + `SleeveWear` and the
      sleeve CSS move into the package too (labels, `getLevels` and the
      alignment targets become props), so the admin's record is the
      player's: square sleeve, the splat slid out to the right,
      breathing. The island is rebuilt: the splat record standing free
      as the logo, the three nav items as ghost buttons in the player's
      `type-label` + accent-underline idiom, the track strip with its
      one play lamp and live dot, the user initial as a ghost ring.
      Shared admin primitives written once in the mockups' language —
      ghost pill, lit pill (the lamp), red pill, tab pills, chip, feed
      row, stat figure, field — in `features/admin/ui/`. Deleted:
      `control-island.tsx`, the admin `vinyl-box.tsx`, `vinyl-tabs.tsx`,
      `stats-card.tsx`, `stats-grid.tsx`, the toast / loader /
      connection-status restyles (rewritten on the primitives).
      Screenshot of the empty shell against the Main board before
      Phase 8 starts.
      Checked in Chrome on all three pages: sign, rim, island and the
      player's record hold; `vinyl-tabs`, `stats-card` / `stats-grid`
      and the toast / loader go with the phases that stop using them.
- [x] Phase 8 — On Air, written anew
      The Main board, line by line: the record and the song (source
      line in the glow, title in Heavy, artist, "on air since · time"),
      then the three actions — Next track as the lamp, Stop turntable
      as a ghost pill, Take off air as the red pill — then four bare
      figures with labels (RTMP with its lit dot and uptime, listeners,
      bitrate, airtime), no tiles. The right slab: the tab pills
      Journal / Monitoring / Settings and a feed of time-stamped rows —
      the journal from wave's logs (errors in red, warnings in the
      glow), monitoring as label / value rows, settings as the RTMP
      form rebuilt field by field in the player's input idiom with
      Start / Stop / Restart. All of `on-air/components/` is replaced;
      what the panels held as logic moves out first — the RTMP status
      heuristics (`isHealthyStatus`, `getServiceAlert`, the stat
      list with its bytes→MB formatting) into `on-air/lib/rtmp-status.ts`,
      the logs' source / lines / sort state and auto-scroll into a
      `useJournal` hook, the config form's dotted-path edit session
      into `useRtmpConfigForm`. Screenshot against the Main board.
- [x] Phase 9 — Collection, written anew
      The Collection board: tabs Albums / Playlists at the top right;
      the search pill with the counts line beside it; album rows
      (cover square, title, artist · year, the on-air chip, track
      count) with the open row lit; the right slab holds the sleeve,
      title and meta lines, the session-photos strip with its + tile,
      then Put on air (the red lamp) and Edit / Cover as ghost pills.
      Edit swaps the slab's detail for the form in place; album
      creation, playlist creation and add-song open the same way, no
      modals. Rebuilt on `useCollectionData`, the collection store and
      the album / playlist / photo / song API hooks; the entire
      `collection/components/` tree (`browser`, `content`, `detail`,
      `filters`, `header`, `modals`, `shared`) is replaced by new
      components, the tag editor and cover / photo upload rewritten
      around their existing upload hooks. The form logic comes out as
      hooks first (`useAlbumForm` from the edit form's album↔payload
      mapping; the photo section's blob fetching, lightbox keys and
      two-click delete), and `album-session-photos-section.test.tsx`
      is rewritten with its component. The never-reachable create /
      edit album modals are not carried over. Screenshot against the
      Collection board.
- [x] Phase 10 — Studio, written anew
      The Studio board: the stage chips (✓ Upload — Split — Metadata —
      Publish) with the active one lit, the record's title and file
      meta, then the stage's own content in the left column — upload
      (drop zone and the radio folder), split (the waveform on canvas:
      cream trace, red cut lines, time ruler, the four actions with
      Save split as the lamp, and the track rows), metadata (the form
      and Discogs search inline), publish and cleanup; the right slab
      holds the Drafts label and rows (open one lit) with the radio
      folder block at the foot. The logic that lives inside
      `digitization/components/` today moves out before anything is
      deleted: `use-upload-manager.ts`, `use-before-unload-while-uploading.ts`,
      `collect-dropped-files.ts`, `slugify.ts`, `split-review/split-review-utils.ts`,
      `split-review/use-side-audio.ts`, the `radio-folder/` hook, scanner
      and IndexedDB handle store, plus the metadata form's field↔
      `AlbumDataJson` mapping as `useDraftMetadataForm` — into
      `digitization/hooks/` and `digitization/lib/`. The waveform's
      behaviour (peak buckets, drag with the 4px threshold, click adds,
      double-click removes) is ported into the new canvas. Then every
      file under `digitization/components/` is replaced. Screenshot
      against the Studio board.
- [x] Phase 11 — People, and ship for real
      The Users board: the page dims under a centred sheet in the
      island's glass — the count line, people rows (initial ring, name,
      last seen, role chip, lit dot for active), + Create account as
      the lamp, Export and Sign out as pills; the create form inline
      in the sheet. Then the sweep: every old component deleted,
      `shared-styles.ts` reduced to the login page or gone, the dead
      code found in the inventory pruned (`use-notification-mutations.ts`,
      `services/streaming/types.ts`, `admin/hooks/useNowPlaying.ts`,
      the unused icons and `formatDurationHMS`, the API hooks no
      screen calls); `docs/apps/admin.md` and `docs/README.md` match;
      check-types / lint / tests green; all four surfaces screenshotted
      beside their boards and against a running wave before review.

### Thread
- [x] 2026-11-02 [decision] [user] Rebuild the admin in the player's layout; remove the main page; at most three pages, named more usefully.
- [x] 2026-11-02 [decision] [agent] The pages are On Air («Ефір», landing; absorbs stream control and the main page's glance), Collection («Колекція», absorbs the stat widgets) and Studio («Студія», was digitization); users management moves behind the island's user lamp as the people panel. Mockups: https://claude.ai/artifact/HybkRMtC1aYbAvVgLsQwbR
- [x] 2026-11-02 [decision] [user] Idea files are written in English throughout; Ukrainian appears only as quoted UI copy.
- [x] 2026-11-02 [decision] [user] The review found the first run skin-deep — player chrome copied verbatim, mockup placeholders transliterated, old-theme interiors — and the cleanup happens directly on this branch (Phase 6), not as a new idea.
- [x] 2026-11-02 [decision] [agent] The shared chrome lives in `@radio/stage` (wordmark, splat record, film overlay, art, `stage.css`), consumed by player and admin alike; the admin's type voices stay a local copy in `tailwind.css` until the admin moves to Tailwind v4, which is when the two type scales can merge.
- [x] 2026-11-02 [decision] [user] Phase 6 is rejected as skin-deep — "almost the same as we had before". The mockups are the spec; every section is written anew in the player's idiom and the old components are deleted, not restyled. Rules: no panels or cards, content sits on the ink like the player's; the right column is divided from the left by the player's wavy seam; the island's nav is ghost buttons, lamps are for special actions only; the logo stands free, no circle; the record is the player's record (square sleeve, the splat slid out to the right); journal, monitoring and settings follow the mockups' feed. Every phase ends with a screenshot checked against its board.
- [x] 2026-11-02 [decision] [agent] Rewrite scope and idiom (Phases 7–11): the shared package grows the player's `ChatBackdrop` (as the seam), `VinylBox` + `SleeveWear` and their CSS, so the admin draws the same seam and the same record rather than imitations. The three per-screen "lit" actions in the mockups (next track, save split, new record, create account, put on air) are the lamps; everything else is a ghost pill. Forms open in place — the right slab swaps detail for form, as IDEA-13's chat pages do — no modals or drawers; the people sheet over the dimmed page is the one overlay, as mocked.
- [x] 2026-11-02 [question] [agent] The island's track strip: the mockups show the song on air, but the current nav island carries the local preview player (`useNowPlayingStore`). One slot — on-air by default, preview while a preview plays? Or both side by side?
- [x] 2026-11-02 [decision] [agent] One slot: the strip carries the song on air with the live dot, and the local preview takes it over — with the play lamp and a stop — only while a preview is sounding, since that is what is heard in the room. Built in Phase 7.
- [x] 2026-11-02 [question] [agent] The people panel as an overlay sits against IDEA-13's "no modals" instinct — fine for the admin, or should it swap in place over whatever page is open, the way the chat's pages do?
- [x] 2026-11-02 [decision] [agent] The people sheet stays the one overlay, as the Users board draws it — the page dims under a centred sheet in the island's glass; everything else (edit, cover, new playlist, new record, Discogs) swaps in place on the slab.
- [ ] 2026-11-02 [question] [agent] Wave has no `GET /api/accounts` list route (its accounts routes are register, login, me and `:id`), so the admin's `useUsers()` has always 404'd and the people sheet says so instead of showing people. Out of this idea's scope (no API changes) — a small wave route, or should the sheet list accounts another way?
- [x] 2026-11-02 [decision] [agent] The dev admin reaches wave through its own origin: `vite.config.ts` proxies `/api` to `ADMIN_API_PROXY` (the local dev wave by default, `http://localhost:6970` for the pm2 station), with `VITE_API_URL` set to the page's origin — so a browser on the tailnet needs only port 3001 open. The earlier `deimos:6870` setting timed out from outside the box. Documented in `.env.example`.
