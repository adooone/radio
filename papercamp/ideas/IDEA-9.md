---
id: IDEA-9
title: Visual parity after func-ui migration
type: fix
status: in-progress
tags: [admin, func-ui, design, parity]
created: 2026-10-10
---

The mojo-ui → func-ui migration is functionally clean but visually drifted, caught on the live site (2026-10-10): the page base font fell back to system default (func-ui base sets Montserrat Alternates with /fonts/ urls the app did not ship — four woff2 files now added, fixed on main); the local Panel rebuild replaced mojo's neumorphic surface (layered inset shadows, baseLayer/innerField texture, header on the panel surface) with flat bg-black/40 bars, so the collection details header reads as a detached black strip; and func-ui's primitives (Input, Select, Modal, Stamp) are squarer than the admin's retro pill language — mojo rounded nearly everything full. A rounded option is being requested in func-ui to mirror LampButton's rounded prop. Reference for comparison: the last pre-migration deployment is still live at radioadmin-8th3yiwzo-croco-dendy-projects.vercel.app (commit f4fd660), so every screen can be diffed side by side against production.

### Phases

- [x] Phase 1 — Side-by-side visual audit
      Walk every admin screen in two browser tabs: production
      (pan.adoo.one, post-migration) vs the pre-migration deployment
      (radioadmin-8th3yiwzo-croco-dendy-projects.vercel.app, f4fd660) —
      login, main dashboard widgets, collection list + album details +
      playlists, stream, users, digitization list + draft page. Catalogue
      every visible diff (surfaces, headers, fonts now that the files
      ship, radii, spacing, colors, icons) into a checklist appended to
      this idea as a note. Verify the Montserrat fix landed (body font no
      longer system default).

- [x] Phase 2 — Restore the Panel surface and detail header
      Port mojo's panel look onto the local Panel component from git
      history (21348e4^:packages/mojo-ui/src/components/panel/
      panel.module.scss): $color-bg-base ground with the double inset
      shadows, baseLayer/innerField texture layers, radius scale, and the
      header rendered on the panel surface instead of a flat bg-black/40
      bar. Fix the collection details header alignment specifically (the
      user's report). Apply the same treatment to the other bg-black/40
      headers the Phase 1 audit flags.

- [ ] Phase 3 — Retro alignment of func-ui primitives
      Depends on func-ui gaining a rounded option (requested as a
      func-ui task: rounded 'full'|'half' on Input, Select, Textarea,
      Modal, Chip/Stamp and friends, mirroring LampButton's prop). Bump
      the dep, sweep the admin's form and overlay call sites to the pill
      look mojo had, and re-run the Phase 1 checklist to closure. Until
      the dep ships, any local className overrides that get the look
      cheaply may land first and be removed on adoption.

### Notes

- **Phase 1 audit (2026-10-11, live side-by-side).** Reference: pre-migration
  build (f4fd660) built locally with VITE_API_URL=https://wave.adoo.one and
  served at http://deimos:3001 (vite preview, left running for Phase 2);
  production compared tab-for-tab. Catalogue, by severity:
  1. **[Functional] Collection album list is invisible on initial load** —
     the five DataTable rows exist in the DOM (checkbox+button pairs) but
     render fully transparent until an interaction; the entrance/stagger
     animation never fires its visible state after the migration. Old build
     completed the same animation.
  2. **[Font identity] The app base font regressed from the KyivType slab
     family to Montserrat Alternates.** mojo's baseline left the app's own
     font-sans (KyivType) as the page font; func-ui's stylesheet asserts
     Montserrat at the html level. All headings and body now render
     Montserrat. Fix: re-assert the admin's base family after func-ui's css
     (body { @apply font-sans } or an html override), keeping Montserrat
     only where it was used before.
  3. **[Panel surface] All bg-black/40 headers read as detached black
     strips** — collection list header («Ваші альбоми»), album detail
     header (close + title), section headers — where mojo rendered them on
     the panel's neumorphic surface (see Phase 2 for the port).
  4. **[StatsCard] The rebuilt stat tiles render light-gray glass on the
     dark theme** (stream page: SERVICES STATUS / SYSTEM UPTIME / LAST
     UPDATE) — illegible against the old dark bordered tiles with mono
     digits.
  5. **[Album cover] "Change Cover" overlay is permanently visible** on the
     album detail cover; old showed it on hover only.
  6. **[Inputs] Search and form fields are square/flat-gray** vs mojo's
     inset pills — pending the func-ui rounded option (in progress in
     func-ui), adopt in Phase 3.
  7. Labels on the stream card shifted to amber uppercase (old: muted
     gray) — review with Phase 2 for intent.
  8. Already fixed before the audit: Montserrat woff2s now ship (base font
     no longer falls back to system), login-page stray box gone in
     production (present in the old build).

- **Phase 2 shipped (2026-10-11, c1e3481):** framer-motion aligned on
  12.43.0 (single copy shared with func-ui — removing mojo-ui had dropped
  its v11 peer pin and two majors were bundling together); KyivType Sans
  re-asserted as the base family over func-ui's Montserrat html rule;
  mojo's neumorphic panel surface ported onto the local Panel (ground,
  double inset relief, on-surface headers — the detail-header complaint);
  StatsCard rebuilt as the dark bordered tile. Verified in dev against
  production data and on the production bundle.
- **Audit corrections:** the "Change Cover always visible" item was a
  false alarm (the reviewer's own cursor hovered the cover in the
  screenshot); the "invisible album rows" turned out to be a
  hidden-window measurement artifact — framer v12 defers animation start
  until the first visible frame, v11 time-jumped to the end, so only
  instrumented background-window views ever saw frozen rows. No user
  impact either way.
EOF_MARKER_NOT_USED = None
