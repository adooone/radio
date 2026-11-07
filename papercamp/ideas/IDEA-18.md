---
id: IDEA-18
title: Wave tests always exit
type: fix
status: review
created: 2026-11-03
updated: 2026-11-07
tags:
  - wave
  - testing
---

`bun test` in `apps/wave` can run forever. On 2026-11-02 the Paper Camp
run-all for IDEA-16 ended its last phase at 10:17 UTC and started its final
checks; the `pnpm test` → turbo → `bun test` process tree was still running
at a full core when it was killed by hand the next evening. Another session's
`bun test` in a worktree hung the same day with `ffmpeg` child processes still
attached. On a two-core host capped at 30% CPU on average, that one process
got the whole machine throttled and every service on it slowed down.

Three test files exercise services that spawn `ffmpeg`:
`services/digitization/encodeService.test.ts`,
`services/digitization/splitService.test.ts` and
`services/stream/turntableService.test.ts`. A service whose ffmpeg is never
stopped keeps the test runner alive after its last test.

**Find the test that hangs.** Run each wave test file alone under
`timeout 120 bun test <file>`, record which ones do not exit, and fix the
cause in each: stop every ffmpeg the service started (the service exposes a
`stop`/`dispose` the test calls in `afterEach`), and close any server,
socket or interval the test opened.

**No test can run forever again.** The wave `test` script becomes
`bun test --timeout 30000`, so a single test that never settles fails after
30 seconds. A `test/setup.ts` preloaded through `bunfig.toml` keeps a
registry of child processes spawned during the run and kills any still alive
in a global `afterAll`.

**The desk check keeps its limit.** The Paper Camp `Tests` desk check in
`papercamp/config.json` already runs as `timeout -k 30 600 pnpm test`; it
stays that way.

Done when `bun test` in `apps/wave` exits on its own in under five minutes,
three runs in a row, and `pgrep ffmpeg` finds nothing after each run.

### Phases
- [x] Find and fix the hanging tests
      Each file alone under `timeout 120`; every ffmpeg, server, socket and
      interval stopped in `afterEach` where it was started.
      run: 1m15s · 20 in · 3.2k out · sonnet-5-5 · sess:c739eaa6-df54-46e5-beb5-70e72b61d55b
- [x] Per-test timeout and spawn cleanup
      `bun test --timeout 30000`, the preloaded setup that kills leftover
      children, three clean runs in a row.
      run: 22s · 28 in · 4k out · sonnet-5-5 · sess:c739eaa6-df54-46e5-beb5-70e72b61d55b

### Thread
- [ ] 2026-11-07 [question] [agent] A fix is written but uncommitted in the `.claude/worktrees/laughing-shirley-b003eb` worktree (`turntableService.ts`, its test, `index.ts`), on a branch that is behind main. Land it from there, or redo Phase 1 on main?
- [ ] 2026-11-07 [question] [agent] Run-all parked on phase 1 ("Find and fix the hanging tests") — the agent needs a decision: Failed to authenticate: OAuth session expired and could not be refreshed
