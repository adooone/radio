---
id: IDEA-17
title: Admin controls on func-ui — no custom primitives
type: refactor
status: done
created: 2026-11-02
updated: 2026-11-12
tags:
  - admin
  - design
  - func-ui
  - components
order: 6
---

IDEA-16 rebuilt the admin in the player's language, and on the way it
wrote its own set of controls under `features/admin/ui/` — `Pill`,
`TabPills`, `Chip`, `Dot`, `FeedRow`, `Stat`, `GhostNav`, and the form
set `Field` / `TextInput` / `TextArea` / `SelectInput` / `ReadValue` —
styled by hand in the mockups' idiom. They look the part from a distance
and fall apart up close: in the collection header the search field, the
sort select and the sync pill are three different heights, and the sort
chevron is the browser's own `<select>` arrow sitting on the pill's
edge. Meanwhile the admin imports three things from `@dendelion/func-ui`
(`Input`, `LampIconButton`, `LampMeter`) and counters the library from
app CSS — forcing `border-radius: 9999px` onto five of its hashed module
classes and overriding the font it asserts on `html`.

**The rule** (Denys, reviewing that header): use func-ui components
across the app, no custom components at all; if the design needs an
option func-ui lacks — a rounded shape, say — add it to func-ui rather
than creating a custom component. func-ui is the one source of controls;
variants added there serve every app and keep sizes, radii and focus
states consistent, where lookalikes drift.

**What func-ui 0.3.0 already has** for each primitive (source at
`~/dev/func-ui`, its own Paper Camp):

- `Pill` (21 files) → `Button` — `primary` / `secondary` / `ghost` /
  `danger`, `sm` / `md`, `isActive`.
- `TabPills` (3) and `GhostNav` (4) → `Tabs` (items, horizontal /
  vertical) or `SegmentedControl`.
- `Chip` with its dot (7) → `Stamp` — `neutral` / `info` / `success` /
  `warning` / `error`, `dot`; quiet → neutral, lit → warning, red →
  error.
- `Dot` live / lit / quiet (7) → `StatusDot` with `pulse`.
- `FeedRow` (3) → `ListItem` — `active`, `icon`, `action`.
- `Field` + `TextInput` / `TextArea` / `SelectInput` / `ReadValue`
  (9 / 3 / 4 / 1) → `Input`, `Textarea`, `Select` — label, helper text
  and error built in; `Select` draws its own trigger and chevron;
  `ReadValue` is an `Input` set `readOnly`.
- `Stat` (1) → nothing, and nothing needed: it is words, not a
  control, so it becomes plain typography on the page.

**What func-ui lacks**, and the admin hacks around today:

- A radius token. Every module hardcodes its radius, so the admin's
  `tailwind.css` restyles `input-module__input`, `textarea-module__…`,
  `select-module__trigger`, `chip-module__chip`, `stamp-module__stamp`
  and `modal-module__panel` by class-name substring. `LampButton` already
  has `rounded: 'full' | 'half'`; a theme token (`--fui-radius` for
  controls, a panel radius for modals and drawers) is the other route,
  and the one line in the app then carries every control.
- A font token. func-ui's stylesheet sets Montserrat Alternates on
  `html` and `body`; the admin re-asserts KyivType with a
  higher-specificity rule. The library should expose `--fui-font` and
  stop styling the document itself.
- The player's ghost-word look for tabs (label in `type-label`, the
  active one underlined in accent) — the island nav and the corner tabs
  need it from `Tabs`, not from a local `GhostNav`.
- Possibly a tone or two: the amber "lit" outline the admin uses for the
  armed action, and a warn / alert tone on `ListItem` for journal rows.

IDEA-16's shape stands — the split, the slab, the island, the pages;
this idea is the layer underneath it. Each phase keeps the four boards
looking as they do, checked by screenshot, and ends with the custom
folder smaller until it is gone.

### Out of scope

The player, which the same rule governs but which has not been audited
for hand-rolled controls (a question on the thread). The stage package's
canvas pieces (`Slab`, `VinylBox`, `SplatRecord`, `FilmOverlay`) — art,
not controls. The login page. Any change to what the pages do.

### Phases
- [x] Phase 1 — func-ui: tokens and the missing variants
      In `~/dev/func-ui`, as its own idea there: `--fui-radius` (and a
      panel radius) read by every control's module instead of a fixed
      value; `--fui-font` with the stylesheet no longer styling `html`
      and `body`; the ghost-word style on `Tabs`; the lit tone on
      `Button` and the row tones on `ListItem` if the mockups cannot
      be met without them. Linked into `apps/admin` with `pnpm link`
      while it is shaped, published as 0.4.0 and bumped once it
      settles; the admin sets the tokens in `tailwind.css` and drops
      the module-class retunes and the font override.
      run: 4s · 58 in · 12.8k out · sonnet-5-5 · sess:360fcc11-26a0-45cd-b153-59cc686a82b7
- [x] Phase 2 — Forms
      `Input`, `Textarea`, `Select` replace `Field` / `TextInput` /
      `TextArea` / `SelectInput` / `ReadValue` everywhere they are
      used: the collection header, the album form and tag editor, the
      RTMP settings form, the new-person form, the studio's metadata
      and Discogs forms. Labels, hints and errors move onto the
      components' own props.
      run: 6s · 34 in · 6.6k out · sonnet-5-5 · sess:a77846ad-5d5d-4ae7-8b35-be04da85612b
- [x] Phase 3 — Buttons, tabs and the island nav
      `Pill` → `Button` across its 21 files, tone by tone (ghost →
      ghost, lit → the armed tone, red / danger → danger, quiet →
      secondary); `TabPills` → `Tabs` or `SegmentedControl` on the
      slab (journal / monitoring / settings, albums / playlists);
      `GhostNav` → `Tabs` in the ghost-word style inside the island.
      run: 2m · 56 in · 13.2k out · sonnet-5-5 · sess:a77846ad-5d5d-4ae7-8b35-be04da85612b
- [x] Phase 4 — Marks and rows
      `Chip` → `Stamp`, `Dot` → `StatusDot`, `FeedRow` → `ListItem`
      in the journal and monitoring feeds; `Stat` becomes plain
      typography in the on-air figures (label, figure, note — no
      control behaviour, nothing added to func-ui).
      run: 2m19s · 76 in · 21.8k out · sonnet-5-5 · sess:a77846ad-5d5d-4ae7-8b35-be04da85612b
- [x] Phase 5 — Remove and verify
      `features/admin/ui/` deleted, the admin importing controls from
      func-ui only; `tailwind.css` keeps layout, type voices and the
      func-ui tokens; `docs/apps/admin.md` updated; check-types, lint
      and tests green; the four boards screenshotted in Chrome against
      the IDEA-16 mockups.
      run: 7s · 94 in · 23.6k out · sonnet-5-5 · sess:a77846ad-5d5d-4ae7-8b35-be04da85612b
- [x] Phase 6 — Publish func-ui and bump
      Phase 1's last step, which never happened. The tokens, ghost
      `Tabs`, lit `Button` and `ListItem` tones sit uncommitted in
      `~/dev/func-ui` (its IDEA-13 locally, landed as IDEA-14), and the admin reaches
      them only through the `pnpm link` symlink while `package.json`
      and the lockfile still say `^0.3.0`. A fresh install or a deploy
      builds the admin without them. func-ui commits its IDEA-13 work
      and publishes 0.5.0 (0.4.0 is already on npm, from 2026-10-09,
      without these changes); the admin depends on `^0.5.0`, the link
      is removed and `pnpm install` brings the published package;
      check-types, lint, build and the four boards checked again. The
      player stays on 0.3.0 until IDEA-20.

### Thread
- [x] 2026-11-02 [decision] [user] Use func-ui components across the app, no custom components at all; if a rounded (or other) option is needed, add it to func-ui rather than creating a custom component.
- [x] 2026-11-02 [question] [agent] Radius and font as theme tokens (`--fui-radius`, `--fui-font`) or as per-component props like `LampButton`'s `rounded`? The agent's pick is tokens — one line in the app and every control follows — with `rounded` kept where it already exists.
- [x] 2026-11-02 [decision] [user] Theme tokens: `--fui-radius` (plus a panel radius) and `--fui-font`, set once in the app; `rounded` stays on `LampButton` where it already exists.
- [x] 2026-11-02 [question] [agent] How to iterate on func-ui from this checkout: publish 0.4.0 once Phase 1 settles, or `pnpm link ~/dev/func-ui` into `apps/admin` while the variants are shaped and publish at the end?
- [x] 2026-11-02 [decision] [user] Link while shaping: `pnpm link ~/dev/func-ui` into `apps/admin` during Phase 1, publish 0.4.0 once the tokens and variants settle, then bump the dependency.
- [x] 2026-11-02 [question] [agent] `Stat` has no func-ui counterpart. Plain typography on the on-air page (label, figure, note — no control behaviour), or a small figure component added to func-ui for every app's use?
- [x] 2026-11-02 [decision] [user] Typography on the page: the on-air figures are type-label / type-title / type-meta markup, not a component — nothing to add to func-ui.
- [x] 2026-11-02 [question] [agent] The player has not been audited against this rule; its island and chat controls may carry the same kind of hand-rolled pieces. Its own idea once the admin is done?
- [x] 2026-11-02 [decision] [user] The player gets its own idea after this one lands, drafted from a fresh audit of its island, chat and controls.
- [x] 2026-11-07 [decision] [agent] Back to in-progress from review: the admin builds only against the locally linked func-ui, which is uncommitted and unpublished. Phase 6 publishes it and bumps the dependency.
- [x] 2026-11-11 [decision] [agent] Phase 6 done: the token work landed in func-ui as its IDEA-14 (adooone/func-ui#13, which also turned the unlit dark lamp tone into smoked glass, asked for from the player's settings page) and shipped as 0.5.0 through release-please. The admin depends on `^0.5.0` from npm with the local link gone; its check-types, lint, build and tests pass. func-ui's open `rounded` prop PR (#12) was closed as superseded.
