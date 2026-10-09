---
id: IDEA-8
title: Migrate admin from mojo-ui to func-ui and remove mojo-ui
type: feat
status: planned
created: 2026-10-08
tags:
  - admin
  - migration
  - func-ui
  - mojo-ui
  - cleanup
order: 1
---

The admin app is the only consumer of `@dendelion/mojo-ui` left anywhere
(48 files import it; player and wave import nothing), and mojo-ui itself is
being retired: its npm publishing broke twice, its stylesheet had to be
exposed by hand in September (0.1.2), and the same author's `@dendelion/func-ui`
has since grown the radio-parity set (Slider, CircularProgress, DataTable,
Menu, Radio, Tabs) in its 0.2.0. The retro lit controls — the one thing
mojo-ui does that func-ui does not — are being ported into func-ui as a
separate "lamp" family (func-ui IDEA-12: LampButton, LampIconButton,
LampSwitch, LampStatus, LampMeter, and a `glow` flag on CircularProgress),
so the admin keeps its look while the dependency goes.

The migration surface, from the October audit of `apps/admin/src`:

- **Lamp controls**: Button (18 files, ~35 uses, colour variants gray 20 /
  dark 13 / green 5 / yellow 5 / red 4), IconButton (6 files), Switch,
  StatusIndicator, ProgressBar, CircularProgress (1–2 files each). These
  rename onto the lamp family; mojo's `title` label prop becomes children
  and `variant` becomes `tone`.
- **Forms and overlays** with direct func-ui counterparts: Input (11 files,
  ~50 uses), Textarea, Select, Checkbox, Slider, Modal (7 files), Tooltip,
  Tabs, DataTable (plus the `DataTableColumn` type), Badge → Chip or Stamp,
  Popup/PopupItem → Menu.
- **No counterpart in func-ui**: PageLayout (5 files), Panel (4), StatsGrid,
  StatsCard, VinylTabs, NavigationIsland, the icon exports (SortIcon,
  ArrowUpIcon, ArrowDownIcon, FilterIcon), and `sharedStyles` from
  `@dendelion/mojo-ui/styles` (8 files). These become admin-local
  components under `src/components`, composed from func-ui's Backdrop,
  Glass and Card where that fits.
- **Tailwind and fonts**: `apps/admin/tailwind.config.js` extends
  `mojoPreset`, and 32 files use its moss / bark / coal / clay / river /
  paper / sun / ember scales (`bg-sun`, `text-sun`, `bg-coal-deep`, …).
  `main.tsx` loads Tiny5 and JetBrains Mono from fontsource; KyivType is
  served from `public/fonts` and declared by mojo's stylesheet. Both must
  survive the swap, so the colour scales move into the admin's own
  `theme.extend` (or into `funcPreset` if func-ui takes them — question
  logged on func-ui IDEA-12) and the KyivType `@font-face` rules move into
  `src/styles/tailwind.css`.

Also removed at the end: the `@radio/mojo-ui: workspace:*` dependency and
`packages/mojo-ui`, which the April migration kept "as backup" and nothing
imports; the root `ui:dev` and `mojo:dev` scripts that filter on it; and
the mojo-ui mentions in `apps/admin/README.md`, `docs/README.md`,
`docs/apps/admin.md` and `github/README.md`.

Blocked on func-ui publishing 0.3.0 with the lamp family (func-ui IDEA-10
then IDEA-12). Ideas run whole here, so the entire migration waits for that
release rather than starting against 0.2.0 and pausing before phase 4.

### Out of scope

Restyling screens beyond what the component swap forces; this is a
one-for-one replacement, and visual tuning gets its own idea afterwards.
The player and wave apps, which have no mojo-ui code. Removing the
`@fontsource` imports, which are unrelated to mojo-ui.

### Phases
- [ ] Phase 1 — Audit and mapping
      Produce `docs/apps/admin-ui-migration.md`: every mojo-ui import in
      `apps/admin/src` mapped to its func-ui export or to an admin-local
      replacement, every prop with no equivalent (Button `title` /
      `rounded`, Select and Input size classes, ProgressBar `lampCount`,
      Badge variants), and the exact Tailwind colour and font utilities in
      use so nothing is dropped in phase 2.
- [ ] Phase 2 — Wire func-ui beside mojo-ui
      Add `@dendelion/func-ui@^0.3.0`, import its `dist/index.css` next to
      mojo's in `src/styles/index.ts`, switch `tailwind.config.js` to
      `funcPreset` with the mojo colour scales and font families carried
      in `theme.extend`, move the KyivType `@font-face` rules into
      `src/styles/tailwind.css`, and confirm build, typecheck and the dev
      server with both libraries rendering at once.
- [ ] Phase 3 — Swap the forms and overlays
      Input, Textarea, Select, Checkbox, Slider, Modal, Tooltip, Tabs,
      DataTable, Badge, Popup/PopupItem onto their func-ui counterparts,
      feature by feature (auth, users, stream, collection, digitization,
      main) so each commit is reviewable in the running app.
- [ ] Phase 4 — Swap the lamp controls
      Button, IconButton, Switch, StatusIndicator, ProgressBar and
      CircularProgress onto the func-ui lamp family: `variant` → `tone`,
      `title` → children, `w-full` → `fullWidth`.
- [ ] Phase 5 — Replace the layout pieces and shared styles
      Admin-local PageLayout, Panel, StatsGrid, StatsCard, VinylTabs and
      NavigationIsland under `src/components`, the four icons under
      `src/components/icons`, and `sharedStyles` folded into
      `src/styles/shared-styles.ts`, which already holds the admin-only
      vinyl button styles.
- [ ] Phase 6 — Remove mojo-ui everywhere
      Drop `@dendelion/mojo-ui` and `@radio/mojo-ui` from
      `apps/admin/package.json`, delete `packages/mojo-ui`, remove the
      `ui:dev` / `mojo:dev` root scripts and the `mojoPreset` import,
      update the four docs pages, run build, lint, tests and a Chrome pass
      over every admin route, then grep the repo for `mojo` to prove
      nothing remains.

### Thread
- [x] 2026-10-08 [decision] [user] mojo-ui is removed, not kept alongside func-ui; the retro lit controls survive only as func-ui's lamp family.
- [x] 2026-10-08 [decision] [agent] Layout components with no func-ui counterpart (PageLayout, Panel, StatsGrid, StatsCard, VinylTabs, NavigationIsland) become admin-local rather than func-ui exports: they are radio-specific compositions, and func-ui's own IDEA-6 left exactly this question open.
- [ ] 2026-10-08 [question] [agent] Do the mojo colour scales stay admin-local in `theme.extend`, or should func-ui's preset adopt them so other dendelion apps share them? Mirrors the question on func-ui IDEA-12; whichever answers first settles both.
