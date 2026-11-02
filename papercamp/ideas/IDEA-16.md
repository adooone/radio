---
id: IDEA-16
title: Admin redesign — three pages in the player's language
type: feat
status: planned
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
- [ ] Phase 1 — Stage, island and routes
      The shared shell: ink stage with the film vignette in
      `admin-layout.tsx` (photo background and overlays removed), the
      corner wordmark, palette and func-ui variables retuned to the
      strict palette; the island rebuilt as the player's pill — logo
      disc, the three nav lamps, track strip, user lamp; routes
      become `/`, `/collection`, `/studio` (+ `/studio/$slug`) with
      the old paths redirecting; the main feature folder and its
      widget store removed.
- [ ] Phase 2 — On Air
      The landing page in the split: on-air vinyl box with the
      turntable queue and controls left, over the service cards
      (RTMP, listeners, bitrate, airtime); the right column is the
      journal with monitoring and configuration as its tabs — the
      stream page's three tabs and cards fold in, the `stream`
      feature folder absorbed.
- [ ] Phase 3 — Collection
      The collection in the split: searchable list left with the
      albums / playlists tabs in the page header, the selected
      album's detail right — cover, metadata, session photos, on-air
      and edit actions — replacing the sliding master-detail; the
      absorbed stats as header chips.
- [ ] Phase 4 — Studio
      Digitization reskinned as the workbench: stage chips, waveform
      with split markers and the track table left; drafts and the
      radio-folder panel right; `/studio/$slug` detail carried over;
      no changes to upload / split / publish logic.
- [ ] Phase 5 — People and ship
      The users page becomes the people panel behind the island's
      user lamp (list, roles, create, export, logout) and the
      `/users` route goes; docs updated (`docs/apps/admin.md`);
      check-types / lint / tests green across the repo; verified
      against a running wave.

### Thread
- [x] 2026-11-02 [decision] [user] Rebuild the admin in the player's layout; remove the main page; at most three pages, named more usefully.
- [x] 2026-11-02 [decision] [agent] The pages are On Air («Ефір», landing; absorbs stream control and the main page's glance), Collection («Колекція», absorbs the stat widgets) and Studio («Студія», was digitization); users management moves behind the island's user lamp as the people panel. Mockups: https://claude.ai/artifact/HybkRMtC1aYbAvVgLsQwbR
- [x] 2026-11-02 [decision] [user] Idea files are written in English throughout; Ukrainian appears only as quoted UI copy.
- [ ] 2026-11-02 [question] [agent] The island's track strip: the mockups show the song on air, but the current nav island carries the local preview player (`useNowPlayingStore`). One slot — on-air by default, preview while a preview plays? Or both side by side?
- [ ] 2026-11-02 [question] [agent] The people panel as an overlay sits against IDEA-13's "no modals" instinct — fine for the admin, or should it swap in place over whatever page is open, the way the chat's pages do?
