# Admin UI migration: mojo-ui → func-ui

Audit for IDEA-8 phase 1. Source: every `@dendelion/mojo-ui` import under
`apps/admin/src` as of 2026-10-09, cross-checked against
`@dendelion/mojo-ui@0.1.2`'s shipped `.d.ts` files (the package installed in
this repo). `@dendelion/func-ui` is not installed anywhere in this workspace
— the migration is blocked on its 0.3.0 release (func-ui IDEA-10 then
IDEA-12) — so func-ui column entries below reflect what IDEA-8's prose and
func-ui's own changelog claim it exports, not a verified API. Re-check prop
names against the real package once 0.3.0 lands, before phase 2 starts.

48 files under `apps/admin/src` import from `@dendelion/mojo-ui` or
`@dendelion/mojo-ui/styles`.

## Lamp controls (phase 4)

mojo's `title` prop is a visible label (destructured and rendered as the
button's text, not passed to the native `title` attribute) — it becomes
`children`. `variant` becomes `tone`.

| mojo-ui | files | uses | mojo variant values seen | lamp target | notes |
|---|---|---|---|---|---|
| `Button` | 18 | ~35 | gray, dark, green, yellow, red | `LampButton` | `rounded?: 'full' \| 'half'` (default `full`) has no func-ui equivalent yet — confirm `LampButton` carries it or drop to `full` only. Three call sites (`users-page.tsx:29,35,36`) pass only `title`, no icon/children — after the rename these render as empty buttons unless `title` becomes the children text. |
| `IconButton` | 4 | — | gray, dark, green | `LampIconButton` | `children` is already the icon node (required); `variant`/`size` carry over as `tone`/`size`. |
| `Switch` | 1 | — | green | `LampSwitch` | `variant` required on mojo's `Switch` (no default) → `tone`. |
| `StatusIndicator` | 1 | — | n/a (`status: 'running' \| 'stopped' \| 'error' \| 'initializing'`) | `LampStatus` | status enum has no func-ui precedent; confirm `LampStatus` keeps the same four values. |
| `ProgressBar` | 2 | — | variant from `getCompletenessVariant()` (dynamic) | `LampMeter` | `lampCount` (seen as `20` in `albums-sidebar.tsx:94`) is mojo-only — the discrete "lamp segment count" rendering. No func-ui/`CircularProgress` equivalent; `LampMeter` must keep it or admin hardcodes 20. `showLabel`/`label`/`max` carry over. |
| `CircularProgress` | 1 | — | n/a, takes `color` (hex, seen as `color={accentColor}` in `record-widget.tsx:78`) | `CircularProgress` + `glow` flag | Stays a func-ui component (0.2.0 already has it) — this is the one lamp-family item that's a flag on an existing export, not a new `Lamp*` component. `percentage`, `size`, `strokeWidth`, `color`, `showLabel`, `labelFormatter` all need confirming against func-ui's own `CircularProgressProps`. |

## Forms and overlays with direct func-ui counterparts (phase 3)

| mojo-ui | files | func-ui target | prop gaps |
|---|---|---|---|
| `Input` | 11 | `Input` | `size?: 'small'\|'medium'\|'large'` seen only as `size="small"` (2 sites: `widget-edit-sidebar.tsx:86`, `album-search.tsx:34`) — confirm func-ui's `Input` has the same three-step size scale, not a different scale (e.g. `sm`/`md`/`lg` naming) or none at all. `rightElement` (icon slot) and `error` (inline validation string) both need a func-ui equivalent — check before phase 3. |
| `Textarea` | 5 | `Textarea` | Same `size`/`label`/`error` shape as `Input`; no `rightElement`. |
| `Select` | 3 | `Select` | `options: SelectOption[]` (`{value, label}`) and `size` — same size-scale question as `Input`. No native-select passthrough beyond `size` omitted from `SelectHTMLAttributes`. |
| `Checkbox` | 4 | `Checkbox` | `label`/`error` only; no size prop on mojo's version. |
| `Slider` | 1 | `Slider` (func-ui 0.2.0+) | mojo's: `value`, `min`, `max`, `step`, `label`, `showValue`, `valueFormatter`, `size`, `onChange`, `onChangeEnd`. Confirm func-ui's `onChangeEnd` (commit-on-release, used by `split-controls.tsx`) survived the port — it's not a standard HTML slider event. |
| `Modal` | 7 | `Modal` | `isOpen`/`onClose`/`title`/`maxWidth`/`showCloseButton` — straightforward, but confirm func-ui's close affordance and `maxWidth` (a raw CSS string in mojo, e.g. `"600px"`) use the same contract rather than a Tailwind size token. |
| `Tooltip` | 3 | `Tooltip` | `content`/`placement`/`delay`/`disabled`/`contentClassName` — placement is `'top'\|'bottom'\|'left'\|'right'`, no diagonal variants; confirm func-ui matches. |
| `Tabs` | 1 | `Tabs` (func-ui 0.2.0+) | mojo's `TabItem = {id, label, content}` renders content eagerly as part of the item; confirm func-ui's `Tabs` does the same (vs. a headless/controlled pattern needing a separate panel). `variant` (Variant, used for tab accent colour) has no obvious func-ui equivalent — check. |
| `DataTable` + `DataTableColumn` | 1 | `DataTable` (func-ui 0.2.0+) | mojo's column shape: `{key, header, cell, width?, align?, sortable?}`; table props: `striped`, `hoverable`, `compact`, `bordered`, `loading`, `emptyMessage`, `rowClassName` (string or per-row function), `onRowClick`. `rowClassName`-as-function and `sortable` (does mojo's `DataTable` actually sort, or is it a visual flag consumed by the icon-based header in `album-list-header.tsx`?) need checking — `track-table.tsx` is the only consumer. |
| `Badge` | 2 | `Chip` or `Stamp` | mojo's `BadgeVariant` is `'default'\|'success'\|'warning'\|'error'\|'info'\|'moss'\|'ember'\|'sun'\|'river'` — both files (`draft-stage-badge.tsx`, `radio-folder-card.tsx`) use the radio-palette variants (`moss`, `sun`, `info`, `default`), not just semantic ones. Whichever of `Chip`/`Stamp` is picked must take a custom-colour variant, or `draft-stage-badge.tsx` needs a local colour-class map on top of it. `dot`/`pulse`/`size` ('small'\|'medium'\|'large') also need a home. |
| `Popup` / `PopupItem` | 1 | `Menu` | mojo's `Popup` bundles its own trigger button (`trigger`, `label`, `icon`, `variant`, `size`, `rounded`, `align`) — func-ui's `Menu` likely expects a separate trigger element passed in rather than building one; confirm the composition pattern before porting the single call site. |

## No counterpart in func-ui — become admin-local (phase 5)

All of these move to `src/components` (or `src/components/icons`), composed
from func-ui's `Backdrop`/`Glass`/`Card` where that fits per the plan's
decision note on IDEA-8.

| mojo-ui export | files | shape to preserve |
|---|---|---|
| `PageLayout` | 5 | type not exported by mojo's own `.d.ts` (empty) — read its runtime usage per call site before extracting; likely just a page wrapper (header/content slots). |
| `Panel` | 4 | `PanelSection = {title?, header?, content}`; `Panel` itself: `sections?`, `content?`, `header?`, `sectionTitle?`, `minHeight?`, `responsive?`, `maxColumns?`, `title?`, `subtitle?`, `decorated?`, `onClose?`. |
| `StatsGrid` | 1 | type not exported in mojo's `.d.ts` (empty, like `PageLayout`) — `StatItem` type exists (`export type { StatItem, StatsGridProps }`); inspect `monitoring-tab.tsx` call site for the actual shape. |
| `StatsCard` | 2 | `{title, value: string \| number, isHighlight?, className?}`. |
| `VinylTabs` | 2 | `VinylTabItem = {id, label}`; `VinylTabsProps = {tabs, activeTab?, onTabChange?, className?}` — simpler than mojo's `Tabs`, no inline content. |
| `NavigationIsland` | 1 | `NavigationItem = {path, label, icon?}`; takes `items`, `currentPath`, `logo?`, `actions?`, `linkComponent?` (e.g. TanStack Router's `Link`) for routing-aware links. |
| `SortIcon`, `ArrowUpIcon`, `ArrowDownIcon` | 2 (`album-list-header.tsx`, `compact-album-list-header.tsx`) | sized via `size` prop (`14`/`16` seen), used inline inside `Button`'s `icon` prop and as bare `<Icon />` elements. |
| `FilterIcon` | 1 (`album-list-header.tsx`) | same icon-component shape as above. |
| `sharedStyles` from `@dendelion/mojo-ui/styles` | 8 (`stream-page.tsx`, `rtmp-config-card.tsx`, `logs-card.tsx`, `logs-tab.tsx`, `monitoring-tab.tsx`, `configuration-tab.tsx`, `users-page.tsx`, `user-list.tsx`) | class-name maps: `container`, `content`, `title`, `statsCard`, `statsTitle`, `statsValue`, `statsValueOnline`, `serviceSection`, `serviceSectionTitle`, `actionsSection`, `actionsTitle`, `recentSection`, `recentItem`, `recentTitle`, `recentMeta`, `statsGrid`, `serviceGrid`, `actionsGrid`, `recentList`, `glassmorphism`, `layout`, `grids`. Fold into `src/styles/shared-styles.ts`, which already holds the *admin-only* `sharedStyles` (vinyl `buttonPrimary`/`buttonSecondary`/`buttonAccent`) imported from `@/styles/shared-styles` in 3 files (`create-collection-modal.tsx`, `login-page.tsx`, `create-user-modal.tsx`) — these two `sharedStyles` objects are different today and must merge into one export without a name collision. |

`Card` (1 file) and `CircularProgress` (listed above under lamp controls)
are the only other direct exports imported; `Skeleton`/`SkeletonText`,
`Radio`, `Alert`, `Toast`/`ToastContainer`/`generateToastId` are exported by
mojo-ui but have zero import sites in `apps/admin/src` — out of scope,
nothing to migrate.

## Tailwind and fonts (phase 2)

- `apps/admin/tailwind.config.js` has a single line of config: `presets: [mojoPreset]` plus `content` globs (including `./node_modules/@dendelion/mojo-ui/src/**/*.{ts,tsx}`, which must become the func-ui equivalent path). `mojoPreset` (from `@dendelion/mojo-ui/tailwind`) supplies everything below; phase 2 swaps it for `funcPreset` and carries anything func-ui doesn't adopt into `theme.extend` directly in `apps/admin/tailwind.config.js`.
- Colour scales (all with `fog`/`calm`/`DEFAULT`/`deep`/`relic` steps, two with an extra `accent`): `moss` (+ `accent`), `bark`, `coal`, `clay`, `river`, `paper` (+ `accent`), `sun`, `ember`. Plus two legacy flat colours kept for backward compatibility in the preset: `terracotta` (`DEFAULT`, `dark`) and `wood` (`DEFAULT`, `pine`, `cedar`) — confirm nothing in `apps/admin/src` still uses these before dropping them; a repo-wide grep found none, but double-check in phase 2.
- 33 files under `apps/admin/src` use a mojo colour-scale utility (`bg-`/`text-`/`border-`/`from-`/`via-`/`to-`/`ring-`/`fill-` + the scale name, with or without a `-fog`/`-calm`/`-deep`/`-relic`/`-accent` suffix). Utilities actually seen in the audit: `bg-coal`, `bg-coal-deep`, `bg-coal-relic`, `bg-ember`, `bg-moss-deep`, `bg-river-deep`, `bg-sun`, `bg-sun-deep`, `border-ember`, `border-moss-accent`, `border-river`, `border-sun`, `fill-paper-calm`, `from-coal`, `from-sun`, `ring-sun`, `text-coal`, `text-ember`, `text-moss`, `text-moss-accent`, `text-moss-fog`, `text-paper`, `text-paper-calm`, `text-paper-fog`, `text-river`, `text-river-fog`, `text-sun`, `text-sun-fog`, `to-coal`. (The plan text says 32 files; the current count is 33 — not a discrepancy to chase, just drift since the plan was written.)
- Font families, declared in `mojoPreset.theme.extend.fontFamily`: `display: ['Tiny5', 'sans-serif']`, `sans: ['KyivType Sans', 'sans']`, `serif: ['KyivType Serif', 'serif']`, `mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', 'monospace']`. Usage in `apps/admin/src`: `font-display` (8 files), `font-mono` (8 files), `font-serif` (2 files); no bare `font-sans` utility found (it's the Tailwind default stack so untracked usage is possible but not grep-able as a distinct class).
- Also in the preset: `fontWeight.medium = 500`, `fontWeight.bold = 700` (both override Tailwind's defaults); `backgroundImage['gradient-radial']` (used once, `main/components/record-widget.tsx` per the earlier grep); the `textShadow` plugin values (`DEFAULT`/`strong`/`light`) are declared in the preset but have zero `text-shadow`/`textShadow` usage in `apps/admin/src` today — low-risk to carry over unused, but confirm before dropping.
- `apps/admin/src/main.tsx` imports three fontsource packages directly (unrelated to mojo-ui, per the plan's out-of-scope note, so these stay untouched): `@fontsource/tiny5`, `@fontsource/ponomar`, `@fontsource/jetbrains-mono/800.css`. Note `ponomar`, not a KyivType variant — KyivType is not on fontsource at all.
- KyivType (`Sans`/`Serif`/`Titling` families, each with `Thin`/`Light`/`Regular`/`Medium`/`Bold`/`Heavy`/`Black` weights, `.woff2`) is declared via `@font-face` rules baked into mojo-ui's shipped `dist/index.css` (6+ rules per family-weight, `font-display` not set) and the actual font files are copied into `apps/admin/public/fonts/` (7 files present: `tiny5-latin-400-normal.woff2` plus 6 `KyivTypeSans-*`/`KyivTypeSerif-*` weights — Titling weights are in mojo-ui's own `dist/fonts/` but not copied into admin's `public/fonts/`, so only Sans/Serif are actually usable today; `font-serif`'s 2 usages are the only consumer confirmed). These `@font-face` rules must move verbatim into `src/styles/tailwind.css` in phase 2, pointing at the same `/fonts/*.woff2` paths already served from `public/fonts/`.
- `apps/admin/src/styles/index.ts` is a two-line file: `import '@dendelion/mojo-ui/index.css'` then `import './tailwind.css'`. Phase 2 adds func-ui's `dist/index.css` as a third import alongside, per the plan.

## Removed in phase 6

- `apps/admin/package.json`: `@dendelion/mojo-ui` dependency (currently `^0.1.2`) and `@radio/mojo-ui: workspace:*`.
- `packages/mojo-ui` directory.
- Root `ui:dev` / `mojo:dev` scripts that filter on the package.
- mojo-ui mentions in `apps/admin/README.md`, `docs/README.md`, `docs/apps/admin.md` (currently says "Tailwind CSS + @radio/mojo-ui components" in its Overview section), and `github/README.md`.
