---
id: IDEA-20
title: Player controls on func-ui — the audit
type: refactor
status: idea
created: 2026-11-07
updated: 2026-11-07
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

### Thread
- [x] 2026-11-02 [decision] [user] The player gets its own idea after IDEA-17 lands, drafted from a fresh audit of its island, chat and controls. (Recorded on IDEA-17's thread.)
