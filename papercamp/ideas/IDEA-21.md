---
id: IDEA-21
title: Wave runs as a radio — shuffled tracks, crossfades, even loudness
type: feat
status: review
created: 2026-11-11
updated: 2026-11-11
tags:
  - wave
  - stream
  - admin
  - now-playing
---

Wave can play one album into the stream (IDEA-15's turntable), and the
player follows it track by track. Then the air goes quiet until someone
presses «Поставити в ефір» again, and after a reboot nothing plays at
all. A radio plays on its own: this idea makes the turntable a station.
The library is 22 albums, 245 tracks, about 17.6 hours, all with files
under `MEDIA_ROOT_PATH`.

**Shuffled tracks, no repeats.** The rotation shuffles every track in
the library into one pass (a shuffle bag): each track plays once before
any plays again, so the whole 17.6 hours turns over before a repeat. No
two tracks from the same album or by the same artist play back to back.
The bag (on/off and what has played in this pass) is saved to
`data/rotation.json`, so a restart picks up where the pass was, without
repeats.

**Batches with crossfades.** The rotation plays the bag in batches of
about two hours (roughly 30 tracks) per ffmpeg process. Inside a batch
the tracks are chained with `acrossfade` (about 4 s per join), so the
stream never breaks between songs; between batches, on a skip or a
manual change, ffmpeg restarts with a short gap, as IDEA-15 accepted.
Track starts are computed with the overlaps taken off, so the on-air
state (and the player's sleeve and title) still turn with the music.

**Even loudness.** Vinyl rips come at different levels, which shuffling
makes obvious. Each track is measured once (EBU R128 integrated
loudness, ffmpeg's `ebur128`) and its gain to a common target
(-16 LUFS) stored on the song; the batch applies it as a fixed `volume`
per input. A script measures the existing library; the studio's publish
step measures new records.

**Admin controls.** On the On Air page: the rotation on / off, Skip, the
next few tracks, and "play next" on any song. Putting an album on air by
hand (as today) interrupts the rotation; when the album ends, the
rotation resumes if it is on.

**Going live stays by hand.** nginx-rtmp takes one publisher per key:
before going live from OBS, the rotation is switched off in the admin,
and switched back on afterwards.

**Starts with the machine.** wave runs under pm2, which is not set to
start at boot — that is why wave was down after the last reboot. The
rotation resumes when wave starts; pm2's boot hook needs `sudo` once, a
manual step for the owner.

### Out of scope

Live takeover from OBS without the admin (a separate ingest key the
station switches to). Station jingles, time-of-day programmes, album or
side rotation. Liquidsoap or any other playout engine. The player — it
keeps playing the same HLS and reading the same now-playing messages.

### Phases
- [x] Phase 1 — The turntable stops touching the air on import
      Land the `stop-wave-tests-clearing` fix: the boot steps (clearing a
      stale turntable mark, the SIGINT/SIGTERM needle lift) move from
      module scope into `startTurntable()`, called from `index.ts`, so
      tests that import the turntable no longer clear the real on-air
      mark or hook process signals.
- [x] Phase 2 — Loudness per track
      A `gain_db` column on songs (migration), a `measureLoudness` helper
      on ffmpeg's `ebur128`, a script that measures the library, and the
      studio's publish step measuring new tracks.
- [x] Phase 3 — The rotation
      `rotationService`: the shuffle bag with the no-repeat and
      no-neighbour rules, saved to `data/rotation.json`; the turntable
      playing a batch through an `acrossfade` chain with per-track gain
      and overlap-aware track starts; the next batch on finish; an album
      put on air by hand interrupts and the rotation resumes after;
      resume at boot when on.
- [x] Phase 4 — Admin controls
      REST for the rotation (state with the next tracks, on / off, skip,
      play next) and the On Air page's controls on func-ui.
- [x] Phase 5 — Docs and checks
      `docs/apps/wave.md` and `docs/apps/admin.md`; check-types, lint and
      tests green across the repo.
- [ ] [manual] pm2 starts at boot, wave runs, and an hour of the station sounds right

### Thread
- [x] 2026-11-11 [decision] [user] Shuffled tracks across the library (not albums or sides), on wave's own turntable (not Liquidsoap), going live stays by hand, and the first version has even loudness, admin controls and crossfades.
- [x] 2026-11-11 [decision] [agent] Crossfades only inside a batch (an `acrossfade` chain per ffmpeg process); a skip, a manual album or a new batch restarts ffmpeg with a short gap. An album put on air by hand interrupts the rotation, which resumes after it if on.
