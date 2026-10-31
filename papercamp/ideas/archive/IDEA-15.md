---
id: IDEA-15
title: Wave plays the record itself
type: feat
status: review
created: 2026-10-31
updated: 2026-10-31
tags:
  - wave
  - stream
  - admin
  - now-playing
order: 5
---

IDEA-12 made «Поставити в ефір» a *label*: wave remembers the record,
the player shows its sleeve — and the air stays quiet, because the only
sound the radio has is the live RTMP stream from OBS. Pressing the button
and hearing nothing is the gap this idea closes: when nobody is streaming
live, wave itself puts the record on. The player does not change — it
keeps playing the same HLS it plays today, which simply comes on air.

**How it plays.** The relay already is the audio path: OBS publishes to
`application live` in the dockerized nginx-rtmp (`src/conf/nginx.conf`),
nginx writes HLS to `/data/hls`, the player fetches
`/hls/<key>.m3u8`. Wave becomes a second kind of publisher: a
**turntable** that spawns `ffmpeg` (already a wave dependency —
`encodeService` encodes with it) reading the library's own files
(`MEDIA_ROOT_PATH/<folderSlug>/<fileSlug>.m4a`) in real time (`-re`) and
pushing them as FLV to `rtmp://<rtmp host>:1935/live/<key>`, AAC copied
without re-encoding. One ffmpeg process plays the whole queue through
the concat demuxer, so the RTMP session — and with it the HLS playlist —
stays continuous between tracks; a track change requested by the admin
restarts the process with a new list (a short gap, accepted).

**What is queued.** The album on air plays from track 1; a song on air
is the needle dropped on that track — it plays, then the album's
following tracks, in `trackNumber` order; when the last track ends the
turntable stops and the on-air state clears, so the player returns to
the quiet sleeve by itself. While it plays, wave advances the on-air
state track by track (IDEA-12's `onAirService.setOnAir(albumId,
songId)` — the "same API, set by the toolchain" path IDEA-12 left room
for), driven by ffmpeg's `-progress` output (`out_time`) against the
queue's known positions, so the sleeve and title follow the sound.

**The air is shared.** OBS and the turntable publish to the same stream
key, and nginx-rtmp refuses a second publisher. Wave asks nginx who is
publishing (`/rtmp_stats`, `rtmp_stat all`) before it starts: with a
live publisher present, «Поставити в ефір» keeps IDEA-12's meaning —
mark only — and the admin sees *live from OBS* on the card. With the air
free, the same press plays. Starting OBS while the turntable plays is
refused by nginx; the admin stops the turntable first («Зняти з ефіру»
does both: stops the sound and clears the mark).

**REST and admin.** The turntable state lives beside the on-air state:
`GET /api/stream/turntable` → `{ status: 'idle' | 'playing', albumId,
songId, queue, startedAt }` or idle; `PUT /api/stream/on-air` gains the
start (when the air is free), `DELETE` the stop; an explicit
`DELETE /api/stream/turntable` stops the sound but keeps the mark.
Admin's on-air card (`on-air-card.tsx`) shows the source — *playing
from the library* with the track position, or *live from OBS* — and
the stop lamp. Playback state is process-bound and not persisted: after
a wave restart nothing plays, and an on-air mark that was set by the
turntable is cleared at boot so the player is not told a lie.

### Phases
- [x] Phase 1 — Turntable service
      `services/stream/turntableService.ts`: build the queue from the DB
      (album from track 1, or from the chosen song onward, by
      `trackNumber`, only tracks with a file); write the concat list;
      spawn `ffmpeg -re -f concat … -c:a copy -f flv rtmp://…`; follow
      `-progress` to advance the on-air state per track; stop and clear
      at the end or on error. The ffmpeg command, the RTMP URL and the
      stream key are injected, so tests run against a fake process:
      queue building, track advancement by elapsed time, end-of-album
      clear, error handling.
- [x] Phase 2 — The shared air and REST
      `rtmpService` learns to ask `/rtmp_stats` for the active publisher
      on `live/<key>`; `PUT /api/stream/on-air` starts the turntable
      when the air is free and only marks when OBS is live, saying which
      in the response; `DELETE /api/stream/on-air` stops and clears;
      `GET`/`DELETE /api/stream/turntable`. Clear a turntable-set mark at
      boot. Publishing from the wave host must pass
      `allow publish` in `nginx.conf` — settle the docker network path
      (host loopback vs. bridge address) and document it.
- [x] Phase 3 — Admin: hear it from the card
      The on-air card shows the source (library with track position /
      live from OBS / idle), the stop lamp wired to the right call, and
      the album and song buttons' pending state covers the start.
      Ukrainian copy in the admin as today.
- [x] Phase 4 — Docs, checks, ship
      `apps/wave/API_ENDPOINTS.md`, `docs/api/README.md`,
      `docs/apps/admin.md`; check-types / lint / tests green; verified on
      deimos: press the button with OBS off, hear the record in the
      player, watch the sleeve advance at the track change, and see the
      mark-only behaviour with OBS live.

### Out of scope

Crossfades or gapless playback across a restart of the ffmpeg process.
Scheduling, auto-DJ, playlists across albums, shuffle. Mixing OBS voice
over the library audio. Any change to the player — it plays the same
HLS. Recording or archiving the air.

### Thread
- [x] 2026-10-31 [decision] [user] Pressing «Поставити в ефір» should be *heard*: when nobody is streaming live, wave plays the record from the library through the existing RTMP → HLS path.
- [x] 2026-10-31 [decision] [agent] Publishing from the wave host to `rtmp://127.0.0.1:1935/live/<key>` passes nginx's `allow publish` as the container is run today (bridge network, port published): a probe publish wrote HLS. No nginx change; `RTMP_PUBLISH_URL` is an env override for other setups.
- [x] 2026-10-31 [decision] [agent] The stream key stays `test`, as `STREAM_KEY` with that default (`RTMP_HTTP_URL` likewise defaults to the container's 8069). Renaming it is a separate, player-and-nginx-wide change.
- [x] 2026-10-31 [decision] [agent] "Is OBS live" is read from the HLS playlist's `Last-Modified` (fresh within 10 s), not `/rtmp_stats`: with `worker_processes auto` the stats page is per worker and showed no clients during a publish.
- [x] 2026-10-31 [decision] [agent] The turntable re-encodes to AAC 192k rather than stream-copying: the concat demuxer is then indifferent to per-file parameters, at trivial CPU for audio.
- [x] 2026-10-31 [chat] [agent] Verified on deimos against the dev wave and the shared relay: «Поставити в ефір» on Cowboy Bebop OST from "Cat Blues" put 18 tracks on the real `test` key; the public HLS followed, the player lit LIVE with the sleeve and title, and the mark advanced to "Cosmos" 156.9 s later with `source: turntable`. Mark-only behaviour with OBS live is covered by tests, not exercised live (OBS was off).
