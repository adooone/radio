---
id: IDEA-3
title: Bound the telegram stream logs
type: fix
status: dropped
tags: [wave, telegram, pm2, logs]
created: 2026-09-08
---

On 2026-09-07 the machine's disk was at 97% and 34 GB of it was three
files under `apps/wave/logs/`: `telegram-stream.log` (17 GB),
`telegram-stream-out.log` (14.6 GB), and `telegram-stream-error.log`
(2.4 GB). Nothing else on the disk came close. They were deleted by hand;
the next run of the daemon starts filling them again.

Two things multiply into that number.

**The daemon logs every ffmpeg progress line.** `telegramStreamDaemon.ts`
spawns ffmpeg with stdout and stderr piped and, in the stderr handler,
passes every chunk to `info()` unless it contains the word "error". ffmpeg
writes its progress counter to stderr several times a second for as long
as the stream runs, so a 24/7 stream produces hundreds of megabytes a day
of `frame= … fps= … bitrate= …` lines that carry no information after the
second one.

**pm2 writes each line three times, forever.** `ecosystem.config.js` gives
`radio.telegram` a `log_file`, an `out_file`, and an `error_file` with
`merge_logs: true`, so every stdout line lands in the merged file and the
out file, and every stderr line in the merged file and the error file. The
`log_file_max_size` key on the sibling app is not a pm2 option and does
nothing; rotation in pm2 comes only from the `pm2-logrotate` module, which
is not installed. `~/.pm2/logs` holds another 1.2 GB of unrotated airbot
and radio logs for the same reason.

**Quiet ffmpeg.** The spawn adds `-nostats -loglevel warning`, so ffmpeg
reports only warnings and errors on stderr. Stream health, which
`parseFFmpegOutput` derives from the progress line today, comes from
`-progress pipe:1` instead: ffmpeg writes key/value progress blocks to
stdout, the daemon parses `out_time_ms`, `bitrate`, and `speed` from them,
updates `telegram-stream-status.json` as now, and logs one heartbeat line
per minute — time, bitrate, speed — rather than every block. stderr lines
are logged as they arrive, since after the flag change every one is a
warning or an error.

**One log per app, rotated.** `radio.telegram` keeps `out_file` and
`error_file` and drops `log_file`, so a line is written once. The
`log_file_max_size` and `log_file_backups` keys are removed from the
sibling app. `pm2-logrotate` is installed on the machine and configured
once — `max_size 10M`, `retain 7`, `compress true`, `rotateInterval 0 0 * *
*` — which bounds every pm2 app's logs, including airbot's, at roughly 80
MB each. The install and its settings are recorded in the wave README next
to the existing pm2 instructions, since `pm2 install` is machine state, not
repository state.

### Out of scope

The daemon's restart and status logic, unchanged. Any change to what
ffmpeg streams or how. Log shipping anywhere; the files stay local and
bounded.

### Thread
- [x] 2026-09-09 [decision] [user] Dropped in favour of [[IDEA-4]]: Telegram streaming is removed entirely, so there is no daemon whose logs need bounding; the pm2-logrotate part moves to IDEA-4.
