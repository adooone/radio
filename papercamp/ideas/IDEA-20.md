---
id: IDEA-20
title: Player controls on func-ui — the audit
type: refactor
status: idea
created: 2026-11-07
updated: 2026-11-13
tags:
  - player
  - design
  - func-ui
  - components
needs:
  - IDEA-17
---

IDEA-17 puts the admin on func-ui only. On 2026-11-02 Denys decided the
player gets the same rule in its own idea once the admin lands, drafted
from a fresh audit of its island, chat and controls. This is that idea.
The rule is the same: every control comes from `@dendelion/func-ui`,
and a missing option is added there rather than built as a lookalike
in the app.

**Hand-rolled controls known so far** (from the November island and
chat work):

- The island's volume: a `LampMeter` with an invisible
  `<input type="range">` stretched over it for the hand and the
  keyboard. func-ui has no lamp slider, so this is a candidate for a
  `LampMeter` that takes input, or a `LampSlider`.
- The chat header's listeners count: a bare `<button>` styled as the
  player's ghost word, underlined in accent while open. That is the
  look IDEA-17 adds to func-ui `Tabs` (`variant="ghost"`), here as a
  single toggle.
- The chat and nickname inputs, the settings page's fields and the
  colour picker still need checking for raw `<input>` and `<button>`
  elements.

**The audit comes first**: every raw interactive element in
`apps/player/src`, listed with what func-ui offers for it or what
func-ui would need. The phases are drafted from that list.

**Then the bump.** The player is on func-ui 0.3.0. The release IDEA-17
publishes stops func-ui from styling `html` and `body`, so the player
sets its own body font, colour and background when it moves up.

### Out of scope

The stage package's canvas art (`VinylBox`, `Slab`, `SplatRecord`,
`FilmOverlay`). What the controls do: layout and behaviour stay as they
are.

### Phases
- [x] Add the player's missing options to func-ui
      In `~/dev/func-ui`: a lamp slider for the volume, a single ghost-word toggle, a colour-swatch choice and a bare `Input` / auto-growing `Textarea` for the island's fields, published as the next release.
      run: 58s · 16 in · 2.3k out · sonnet-5-5 · sess:c7d0ff88-3631-4508-8b7b-093c7e68eb3b
- [x] Bump func-ui and set the player's own body styles
      `apps/player` on the new release; `styles/index.css` sets the body font, colour and background and drops the unlayered font pin-back.
- [ ] Move the chat's raw controls onto func-ui
      `chat-input` textarea, `nickname-input` and settings nickname inputs, the settings colour picker buttons, the `chat-header` listeners toggle.
- [ ] Move the island's volume onto the lamp slider
      `control-island`'s `LampMeter` plus invisible range becomes the func-ui slider; `docs/apps/player.md` updated, check-types, lint and tests green.
- [ ] [manual] Check the island, chat and settings in Chrome against today's look

### Thread
- [x] 2026-11-02 [decision] [user] The player gets its own idea after IDEA-17 lands, drafted from a fresh audit of its island, chat and controls. (Recorded on IDEA-17's thread.)
- [x] 2026-11-11 [decision] [user] Phase 2 pulled forward, ahead of Phase 1: the player moves to func-ui 0.5.0 now for its darker unlit lamps (asked for on the settings page's Clear all data button). The player already set its own body background and colour; the unlayered font pin-back is gone, its weight folded into the base body rule. Island, chat and settings screenshotted unchanged apart from the dark lamps.
