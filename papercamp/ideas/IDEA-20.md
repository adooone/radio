---
id: IDEA-20
title: Player controls on func-ui — the audit
type: refactor
status: in-progress
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
- [x] Move the chat's raw controls onto func-ui
      First link the player's `@dendelion/func-ui` to the local worktree at ~/dev/func-ui (Denys's decision, 2026-11-13), since the published 0.5.0 lacks GhostToggle, ColorSwatches and bare Input/Textarea. Then replace the chat's raw `<button>` (listeners toggle) and raw `<input>`/`<textarea>` (message, nickname, settings fields, colour picker) with those func-ui components. Pin back to a released func-ui version once one ships with these exports.
      run: 1m8s · 20 in · 4.5k out · sonnet-5-5 · sess:88df04e2-e2a2-4130-ab22-20e189f6c64e
- [ ] Move the island's volume onto the lamp slider
      `control-island`'s `LampMeter` plus invisible range becomes the func-ui slider; `docs/apps/player.md` updated, check-types, lint and tests green.
- [ ] [manual] Check the island, chat and settings in Chrome against today's look

### Thread
- [x] 2026-11-02 [decision] [user] The player gets its own idea after IDEA-17 lands, drafted from a fresh audit of its island, chat and controls. (Recorded on IDEA-17's thread.)
- [x] 2026-11-11 [decision] [user] Phase 2 pulled forward, ahead of Phase 1: the player moves to func-ui 0.5.0 now for its darker unlit lamps (asked for on the settings page's Clear all data button). The player already set its own body background and colour; the unlayered font pin-back is gone, its weight folded into the base body rule. Island, chat and settings screenshotted unchanged apart from the dark lamps.
- [ ] 2026-11-13 [question] [agent] Run-all parked on phase 3 ("Move the chat's raw controls onto func-ui") — the agent needs a decision: func-ui 0.5.0 on npm lacks GhostToggle, ColorSwatches and bare Input/Textarea, so how should the player consume them?
      option: Publish func-ui's next release first, then bump the player — the clean path; needs func-ui commit, PR and merge
      option: Link the player to the local func-ui worktree for now — unblocks work, but the repo can't install elsewhere
      option: Skip the swatches and listeners toggle, move only what 0.5.0 has — partial phase, still raw controls
      context: Phase 1's additions exist only as uncommitted changes in the func-ui worktree. npm latest is 0.5.0, which is what the player has installed, and none of the new components are in its typings. No release has been cut because nothing was committed or pushed.
- [x] 2026-11-13 [question] [agent] Run-all parked on phase 3 ("Move the chat's raw controls onto func-ui") — the agent needs a decision: func-ui 0.5.0 lacks GhostToggle, ColorSwatches and bare Input/Textarea — how should the player consume them?
      option: Publish func-ui's next release first, then bump the player — clean path; needs a func-ui commit and release
      option: Link the player to the local func-ui worktree — unblocks now, but the repo can't install elsewhere
      option: Move only what 0.5.0 has, skipping swatches and listeners toggle — partial phase, raw controls remain
      context: Phase 1's additions are uncommitted in ~/dev/func-ui, and npm latest is 0.5.0, which is what the player has installed. None of the new components are in its typings, and no release has been cut.
- [x] 2026-11-13 [clarification] Link the player to the local func-ui worktree
- [x] 2026-11-13 [chat] [agent] Got it — the player links `@dendelion/func-ui` to the local worktree at ~/dev/func-ui (workspace/file link, not the npm 0.5.0 tarball), so GhostToggle, ColorSwatches and the bare Input/Textarea are available as soon as they land there. I've folded that into phase 3 so run-all does the link first, then moves the chat controls. One thing to keep in mind: the link is a dev-time arrangement — once a func-ui release with those exports is published, the player goes back to a pinned version.
