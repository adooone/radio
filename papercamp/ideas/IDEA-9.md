---
id: IDEA-9
title: Visual parity after func-ui migration
type: fix
status: in-progress
created: 2026-10-10
updated: 2026-10-12
tags:
  - admin
  - func-ui
  - design
  - parity
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
- [x] [manual] Visual parity after func-ui migration
