---
id: IDEA-5
title: In-app upload of side recordings
type: feat
status: planned
created: 2026-10-06
tags:
  - admin
  - wave
  - digitization
  - upload
  - pwa
---

Remove the last terminal step from the digitization flow: instead of rsyncing side WAVs into /var/www/p-sound-inbox, the admin (opened as an installed PWA on the Mac) uploads them itself. The user records and exports sides in Logic Pro, then drags the record folder onto the Оцифровка page — or picks it via a remembered folder handle — and the files stream to the server inbox with progress, pause/resume and retry. Builds directly on IDEA-2: once the WAVs land in the inbox, the existing draft pipeline (metadata, split, encode, publish) takes over unchanged.

**Design constraints (settled):**

- A browser (even an installed PWA) cannot read an arbitrary filesystem
  path; the UI gets files via drag-and-drop / `<input type=file>`
  everywhere, plus the File System Access API where available (Chromium)
  for a persisted "my Radio folder" directory handle. No Electron/Tauri
  wrapper for now — revisit only if background folder-watching is wanted.
- Side WAVs are 200–700 MB, and admin (Vercel) talks to wave directly
  over REST, so uploads must be **chunked and resumable** (8–16 MB
  chunks, re-askable chunk status), not a single multipart POST bound by
  the 10 s axios timeout and one failed TCP stream.
- All inbox guards from IDEA-2 apply unchanged: slug regex
  `^[a-z0-9-]+_[a-z0-9-]+$` on draft creation, filename allowlist
  `^side-[a-z]\.wav$` for uploads, auth + admin middleware, assemble via
  temp file + atomic rename, refuse overwriting a non-empty existing
  side, size cap (~2 GB/file).

### Phases
- [x] Phase 1 — Wave: draft creation + chunked resumable upload API
      `POST /api/digitization/drafts` (artist + album or raw slug →
      validated folder under MEDIA_INBOX_PATH). Upload session endpoints
      under `/api/digitization/drafts/:slug/uploads`: init (filename,
      size, chunkSize → uploadId), `PUT .../:uploadId/chunks/:n` (raw
      bytes to a temp part file), status (received chunk list, for
      resume), complete (verify size, atomic rename to `side-x.wav`,
      refuse non-empty target). Session TTL cleanup of stale part files.
      Tests: happy path, resume after missing chunk, overwrite refusal,
      traversal/filename rejection, size cap.
      run: 19m29s · 134 in · 31.3k out · sonnet-5 · sess:f1f13863-db61-4acc-8c11-992aa8c320d6
- [x] Phase 2 — Admin: new-record form + upload manager
      «Новий запис» on the digitization page: artist/album inputs with a
      live slug preview → creates the draft. Drop zone + file picker
      accepting multiple `side-*.wav` (drag a whole folder in Chromium;
      files elsewhere), per-file progress bars with pause/resume/retry
      backed by the chunk API, upload also available on an existing
      draft's detail view (e.g. to add side B later). Draft list
      refreshes as uploads complete. Follow the existing
      digitization-api/hooks layering; per-request timeouts for chunk
      PUTs; no global-state uploads lost on tab close without a warning
      (beforeunload guard while uploading).
      run: 9m49s · 150 in · 43.8k out · sonnet-5 · sess:644403f8-68d3-4bf5-94fd-9b492e2eb4c2
- [ ] Phase 3 — Desktop feel: PWA polish + remembered Radio folder
      Verify/polish the PWA manifest (name, icons, standalone display)
      so «Встановити застосунок» gives a Dock app. Where the File System
      Access API exists: "тека Radio" setting storing a persisted
      directory handle (IndexedDB), a panel listing record folders found
      there with per-folder one-click upload of their side WAVs;
      graceful absence on Safari/Firefox (drop zone remains). Docs:
      update docs/apps/admin.md + setup docs — rsync becomes the
      fallback, not the flow.
