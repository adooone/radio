---
id: IDEA-13
title: Chat's people and settings view
type: feat
status: planned
created: 2026-10-31
updated: 2026-11-01
tags:
  - player
  - chat
  - design
  - wave
order: 3
---

The old radio frontend had a small bar over the chat that the Puget
Sound player (IDEA-11) left behind: a listeners pill («1 меломан
онлайн») that opened the list of who is here, the listener's own nick
(«+ НН» in their colour) and a gear that opened account settings —
nickname, name colour, chat sounds, clear data. This brings it back,
built the new way: on func-ui lamps, in the strict palette, and **in the
chat's own view** — no modals, no drawers. The chat panel has three
pages swapped in place: the **room** (messages and input, as today),
**listeners** and **settings**; the header is the navigation and stays
put: `[sound lamp] [listeners pill] … [+ NICK · gear lamp]`. The pill
opens the listeners page, the gear the settings page; whichever is open,
its lamp sits lit as a pressed state and pressing it again (or the
other) brings the room back; Escape works on desktop. Pages crossfade,
like the chat view does on phones (IDEA-11). The input keeps its place
beneath — on phones the island keeps the message field — so a message
can be answered while looking at who is here.

**Listeners page.** Every nick in its colour, «that's you» on the
listener's own, relative last-seen, the online status dot; the header
pill counts the *others* with a pluralised label. The join sound plays
when the count rises (the old bar's 1.5 s debounce).

**Settings page.** Nickname change with the gate's validation (the
current name excluded from the taken check); name colour — **auto or
one of the warm eight** from `features/chat/colors.ts`, so the black/red
room holds (the old free picker is not brought back); chat sounds —
master switch and the three types (message, send, join) as lamp
switches; clear all data, with an inline confirm instead of the
browser's `confirm()`. The language switch lands here when IDEA-14 does.

**Name colours over the wire.** The choice is sent as wave's existing
`color_update` and applied from `user_color_updated` and the `color`
carried in the `listeners` payload — wave's handler is still there
(`ws/handlers/chatHandler.ts`), so the backend needs no change. The
per-user colours live in `useChatRoom`, which the chat and the island
already share.

### Out of scope

Any change to wave — its `color_update` relay already exists. The
language switch and the Ukrainian copy (IDEA-14). Profile pictures,
moderation, private messages.

### Phases
- [x] Phase 1 — Header bar and listeners page
      The chat header as the bar: sound lamp, the listeners pill with the
      pluralised count of the others, the listener's nick in label-red,
      the gear lamp; the page state in `useChatRoom` with crossfade
      between pages; the listeners page (colour, «that's you», last seen,
      status dot) and the join-sound debounce. Portrait keeps the back
      lamp first.
      run: 32m58s · 184 in · 50.8k out · sonnet-5 · sess:77b31ca4-3a67-4751-944e-154afd85bace
- [ ] Phase 2 — Settings page
      Nickname change reusing the gate's validation; the colour section
      with auto plus the warm eight; chat sounds as a master lamp switch
      and the three per-type switches (the sound hook extended with the
      types the old `soundService` kept); clear all data with an inline
      confirm. Keyboard: Escape returns to the room.
- [ ] Phase 3 — Colours synced through wave
      Per-user colours in `useChatRoom`: send `color_update` on a choice,
      apply `user_color_updated` and the `listeners` payload's `color`;
      bubbles, the listeners page and the header nick read the effective
      colour. Tests for the message handling; lint, types, build green.

### Thread
- [x] 2026-10-31 [decision] [user] Bring the old frontend's listeners / nick / settings section into the new player.
- [x] 2026-10-31 [decision] [user] No modals or drawers: the listeners list and the settings show **in the same view as the chat**, swapped into the chat panel.
- [x] 2026-10-31 [decision] [agent] Name colours stay within the warm palette (auto + the eight shades) rather than the old free picker; wording follows the active language once IDEA-14 lands, English until then.
