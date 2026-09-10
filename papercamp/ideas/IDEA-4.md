---
id: IDEA-4
title: Remove Telegram streaming entirely
type: chore
status: idea
tags: [wave, admin, telegram, cleanup]
created: 2026-09-09
---

The Telegram stream daemon has cost this server more than it ever
delivered. On 2026-09-07 its unrotated logs held 34 GB of a 99 GB disk. On
2026-09-09 it was spawning ffmpeg 2.4 times a second against an HLS source
that answered 404, pinning one of the machine's two cores for days, because
a successful spawn reset its restart counter before the failure could count.
`pm2 stop radio.telegram` ended that; nothing was streaming to Telegram
before it, and nothing missed it after.

Telegram goes, from every layer, rather than being fixed. [[IDEA-3]] is
dropped: bounding the logs of a daemon that no longer exists is moot, and
the one part of it worth keeping — `pm2-logrotate` for the remaining pm2
apps — moves here.

**Backend.** `apps/wave` loses `scripts/telegramStreamDaemon.ts`,
`src/services/stream/telegramStreamService.ts`, the `/telegram/*` routes in
`src/api/routes/stream.ts`, the `/telegram` route and handler in
`src/api/routes/monitoring.ts` and `monitoringHandlers.ts`, and every
Telegram branch in `streamService.ts`, `monitoringService.ts`,
`errorHandler.ts`, `errorMessages.ts`, `serviceResponse.ts`, and the
streaming and monitoring types. `TelegramServiceStats` and
`TelegramStreamConfig` leave `packages/types`, and the `telegram` field
leaves the monitoring snapshot they sat in. The `telegram`, `telegram:start`,
`telegram:stop`, `telegram:restart`, and `telegram:status` scripts leave
`package.json`; the `radio.telegram` app leaves `ecosystem.config.js`; the
`data/telegram-stream-status.json` file and the `logs/telegram-stream*.log`
paths are deleted. `stream-manager.sh` keeps only its non-Telegram
branches. Tests and mocks that exist for the daemon go with it.

**Admin.** The stream feature loses `telegram-config-card.tsx` and
`telegram-service-card.tsx`, their entries in the cards index, and their
places in `configuration-tab.tsx` and `monitoring-tab.tsx`; `logs-card.tsx`
stops offering the Telegram log. `stream-control-api.ts`,
`use-stream-control.ts`, `streaming/types.ts`, and `websocket-service.ts`
drop their Telegram calls, hooks, types, and events. The RTMP cards and
their service stay: RTMP is the ingest the radio itself uses, and it is not
what failed.

**Docs.** `docs/api/streaming.md`, `docs/apps/admin.md`, `docs/apps/wave.md`,
`docs/docs/architecture.md`, `docs/docs/data-flow.md`,
`docs/docs/streaming-setup.md`, `docs/setup/README.md`, `apps/admin/README.md`,
`apps/wave/README.md`, and `github/README.md` lose their Telegram sections,
so no page describes a feature that is gone.

**The machine.** `pm2 delete radio.telegram` removes the stopped app from
pm2's list, and `pm2-logrotate` is installed and configured once — `max_size
10M`, `retain 7`, `compress true` — so the apps that remain never fill the
disk the way this one did. Both are recorded in the wave README beside the
existing pm2 instructions, since they are machine state, not repository
state.

### Out of scope

The RTMP server, its container, its admin cards, and `start-rtmp.sh`,
which stay as they are. Any replacement for Telegram distribution; there is
none planned.

### Phases

- [ ] Phase 1 — Delete the wave daemon, service, and routes
      Remove `telegramStreamDaemon.ts`, `telegramStreamService.ts`, the
      `/telegram/*` stream routes, the monitoring `/telegram` route and
      handler, and their tests and mocks.

- [ ] Phase 2 — Strip Telegram branches from wave and shared types
      Clean `streamService.ts`, `monitoringService.ts`, `errorHandler.ts`,
      `errorMessages.ts`, `serviceResponse.ts` and the streaming/monitoring
      types, and drop `TelegramServiceStats`, `TelegramStreamConfig` and the
      monitoring snapshot's `telegram` field from `packages/types`.

- [ ] Phase 3 — Remove Telegram from wave process config and files
      Drop the five `telegram*` package scripts, the `radio.telegram` app in
      `ecosystem.config.js`, the Telegram branches of `stream-manager.sh`,
      and `data/telegram-stream-status.json` plus the
      `logs/telegram-stream*.log` paths.

- [ ] Phase 4 — Remove Telegram from the admin stream feature
      Delete the two Telegram cards and their index entries, unhook them
      from `configuration-tab.tsx` and `monitoring-tab.tsx`, drop the
      Telegram log from `logs-card.tsx`, and clear the Telegram calls,
      hooks, types and events from `stream-control-api.ts`,
      `use-stream-control.ts`, `streaming/types.ts` and
      `websocket-service.ts`.

- [ ] Phase 5 — Remove the Telegram sections from the docs
      Cover the listed pages plus anything a repo-wide search turns up, such
      as `docs/api/README.md`.

- [ ] Phase 6 — Clean up the machine and record it
      Run `pm2 delete radio.telegram`, install and configure `pm2-logrotate`
      (`max_size 10M`, `retain 7`, `compress true`), and document both in the
      wave README beside the existing pm2 instructions.

- [ ] Phase 7 — Verify nothing Telegram remains and close IDEA-3
      Grep the repo for `telegram`, run typecheck, lint and tests, confirm
      wave and admin still build, and mark [[IDEA-3]] dropped.
