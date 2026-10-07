---
id: IDEA-7
title: Draft detail page instead of modal
type: feat
status: planned
tags: [admin, digitization, ux, routing]
created: 2026-10-07
---

Open a draft on its own route (/digitization/<slug>) with a smooth transition instead of the current Modal — the user explicitly prefers a page, and the live Chrome review (2026-10-08, Sgt Pepper draft) showed the modal is structurally cramped: the bottom navigation island overlaps the modal body, half-hiding the Лейбл field mid-form and burying the apply button of the split flow («Порізати попри попередження») at the bottom. A page gets deep links, browser back, natural scrolling with proper bottom padding like every other page, and room for the waveform. Fold in the remaining visual findings from the same review: a stray empty box floats over the password field on the login page; «Отримати метадані з Discogs повторно» renders as a huge full-width button; and the admin-wide «Offline» pill is real — on pan.adoo.one the socket URL defaults to wss://pan.adoo.one:6871 (the Vercel host, no WS there), so VITE_SOCKET_URL must point at the wave host with a TLS-terminated WS endpoint, or the indicator stays red forever.

### Phases

- [ ] Phase 1 — Route and page shell
      New route /digitization/$slug (code-based TanStack route registered
      in router.tsx). Extract the modal's body into a DraftDetail
      component rendered by both; the page lays it out with the cover/
      files/stage sidebar left and content right, page-level scrolling,
      and bottom padding clearing the navigation island (match other
      pages). Draft cards navigate to the route; back returns to the
      list. Delete-draft and publish flows navigate back to /digitization.
      Then remove the Modal path entirely (keep MetadataModal and other
      inner dialogs).

- [ ] Phase 2 — Smooth transition
      Animate card → page with the motion/framer-motion dep already in
      the app: shared layoutId on the card cover and the page cover,
      fade/slide for the rest; respect prefers-reduced-motion. Scroll
      position of the drafts list restored on back.

- [ ] Phase 3 — Review findings batch (2026-10-08 Chrome pass)
      Fix the stray empty box overlapping the password input on the
      login page; constrain «Отримати метадані з Discogs повторно» to
      content width like the other secondary actions; investigate the
      «Offline» indicator: set VITE_SOCKET_URL in the admin's Vercel
      project to the wave host's TLS WS endpoint (needs nginx/caddy wss
      termination for port 6971 — infra step on the server) or hide the
      indicator when no socket URL is configured.
