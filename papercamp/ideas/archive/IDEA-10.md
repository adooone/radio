---
id: IDEA-10
title: Mobile layout for the admin
type: feat
status: done
created: 2026-10-13
updated: 2026-10-14
tags:
  - admin
  - mobile
  - responsive
  - ux
order: 1
---

The admin is desktop-only in practice — audited every page in Chrome at 390x844 against production (2026-10-13, user confirmed on a real phone). Dashboard: the absolutely-positioned draggable widget canvas overflows both edges, the welcome bubble is clipped mid-word — unusable. Collection: the fixed-height master-detail layout collapses — the filter panel is truncated, the album list panel does not render at all, and the page cannot scroll. Global: the bottom NavigationIsland (min-w-fit pill) is wider than the viewport, so СТРІМ and ОЦИФРОВКА are unreachable, and PageLayout header actions clip on every page (АЛЬБОМИ/ПЛЕЙЛИСТИ tabs, НОВИЙ ЗАПИС/ОНОВИТИ). Mostly fine already: Users (stacked tiles), Digitization (stacks from IDEA-6), Stream (minor: fixed grid-cols-6 stat row and tab pills overflow). Fix order: global chrome first (nav island + page header — improves every page at once), then Collection, then Dashboard, then a polish pass.

### Phases
- [x] Phase 1 — Global chrome: navigation island + page header
      NavigationIsland (local component): below sm, compact paddings and
      font size, hide the now-playing block (or collapse it to the logo),
      and let the items row scroll horizontally inside the pill
      (overflow-x-auto, hidden scrollbar) so every tab stays reachable on
      a 320-390px viewport; drop min-w-fit at that width. PageLayout:
      header stacks title above headerRight on small screens (flex-col)
      so АЛЬБОМИ/ПЛЕЙЛИСТИ and НОВИЙ ЗАПИС/ОНОВИТИ never clip. Verify at
      390px on every route.
      run: 14m13s · 60 in · 9k out · sonnet-5 · sess:ad6a8a43-61f3-4f93-8cc0-b65c11e4a345
- [x] Phase 2 — Collection on mobile
      Replace the fixed-height two-panel layout below lg with a stacked,
      page-scrolling flow: genre chips as one horizontally scrollable row,
      the stats block collapsed into a compact summary, the album list
      full-width with natural page scroll (the current layout renders the
      list at zero size and locks scrolling). Album detail at that width
      opens as a full-screen layer over the list (reuse the existing
      detail component) with its own back affordance; list scroll position
      preserved on return. The playlists tab gets the same treatment.
      run: 7m13s · 106 in · 34k out · sonnet-5 · sess:ad6a8a43-61f3-4f93-8cc0-b65c11e4a345
- [x] Phase 3 — Dashboard on mobile
      Below md, replace the absolutely-positioned draggable widget canvas
      with a static vertical stack of the same widget cards (welcome
      bubble first, then stats/airtime/log-health/records), edit mode
      disabled; the desktop canvas stays as is. The widget components
      already render standalone — this is a layout branch, not a rewrite.
      run: 4m9s · 68 in · 12.8k out · sonnet-5 · sess:137fe6ab-3332-4334-bf9f-71d798a5bed3
- [x] Phase 4 — Polish pass and re-audit
      Stream: stat row grid-cols-6 → 2/3/6 responsive, tab pills shrink
      or scroll; digitization draft page and metadata form spot-checked at
      390px (grids from the IDEA-6/7 work mostly stack already); login
      card fits narrow screens; re-run the full 390px walk and append the
      result here. Optional nicety: safe-area padding for the PWA on iOS
      (env(safe-area-inset-bottom) under the nav island).
      Re-audit (code review, no browser — headless run): Stream monitoring
      stat grid now grid-cols-2 sm:grid-cols-3 lg:grid-cols-6; VinylTabs
      (shared by Stream and Collection headers) now shrinks padding/text
      and scrolls horizontally below sm instead of clipping. Digitization
      draft detail and metadata form already stack correctly below md from
      IDEA-6/7 — no change needed. Login card padding reduced to p-6 below
      sm so the form has breathing room at 390px. Added viewport-fit=cover
      and a safe-area-inset-bottom offset to NavigationIsland for iOS PWA
      home-indicator clearance. Not re-verified on a real device or
      browser in this run — left to a human.
      run: 5m16s · 76 in · 11.9k out · sonnet-5 · sess:137fe6ab-3332-4334-bf9f-71d798a5bed3
