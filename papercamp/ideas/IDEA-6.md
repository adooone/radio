---
id: IDEA-6
title: "Digitization page layout: drafts first"
type: feat
status: planned
tags: [admin, digitization, ux, layout]
created: 2026-10-07
---

The Оцифровка page is dominated by the Тека Radio panel: the ingest tool takes the whole first screen while the drafts — the actual workspace — sit below the fold, and a local folder that is already a draft (e.g. sgt-pepper mid-upload) appears in both lists with no visual distinction. Reorganise to list + sidebar: drafts become the main area, Тека Radio shrinks to a compact ~320px sidebar (icon buttons, slim upload progress rows), and folder rows that match an existing draft show «вже у драфтах» instead of offering a fresh upload. Also close the visibility gap found with Sgt Pepper: uploaded side files are only visible as the «N сторін» counter — the draft detail must list the actual side-*.wav files with sizes so an upload is verifiable at a glance.

### Phases

- [ ] Phase 1 — Page layout: drafts main, Тека Radio sidebar
      Restructure digitization-page.tsx into a two-column grid: main area
      (flex-1) = DraftList (cards fit 3-4 across), right sidebar (~320px) =
      RadioFolderPanel. On narrow screens the sidebar stacks BELOW the
      drafts. When File System Access is unsupported (Safari/Firefox) the
      sidebar slot shows a short drop-zone/rsync hint instead of
      disappearing. Keep «Новий запис»/«Оновити» in the page header.

- [ ] Phase 2 — Compact folder panel + draft-aware folder rows
      Slim RadioFolderPanel for the sidebar: the three wide header buttons
      become icon buttons with tooltips; folder rows show slug + file count
      with a small upload action; active uploads render as slim progress
      rows. A folder whose slug matches an existing draft shows its stage
      («вже у драфтах») instead of a fresh «Завантажити» — upload from
      there only offers missing sides (goes through the existing
      add-sides-to-draft path).

- [ ] Phase 3 — Draft detail: show the uploaded files
      In draft-detail-modal's sidebar, replace the bare «N сторін · M
      треків» counter with an explicit file list: each side-*.wav (and cut
      track files once present) with human-readable size, so a finished
      upload is verifiable at a glance (the Sgt Pepper confusion). Backend
      already exposes sides/trackFiles; add per-file sizes to the draft
      payload if absent. Hint line under the list naming the next step for
      the current stage («Наступний крок: отримати метадані»).
