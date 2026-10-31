---
id: IDEA-14
title: Two tongues — Ukrainian and English, with a switch
type: feat
status: planned
created: 2026-10-31
updated: 2026-10-31
tags:
  - player
  - i18n
  - chat
order: 4
---

The Puget Sound player was turned all-English on 2026-10-31, but the
old frontend's Ukrainian copy is worth keeping — «Чатік», «Шо кажеш?»,
«Ентер», «Хочу в чат» / «Погнали», «Меломани на Городі», the pluralised
«меломани», «ефір тихий — платівка відпочиває». Rather than choose, the
player speaks both and the listener picks.

**A small i18n layer of its own** — no library: two dictionaries
(`uk`, `en`) under `src/i18n/`, typed so a key missing in one is a type
error; a `useT()` hook returning `t(key, vars?)`; the choice kept in
`localStorage`, the first visit defaulting from the browser language, so
Ukrainian browsers get Ukrainian. Pluralisation is per language — the
old `getMelomanLabel` rules (1 меломан / 2–4 меломани / 5+ меломанів,
with the 11–19 exception) for Ukrainian, plain plurals for English.

**Everything reads through it**: the status lines, the island, the
chat header and pages (IDEA-13), the gate and its errors, the empty
states, accessibility labels, the document `<title>`, description and
`lang` attribute. The brand marks (the wordmark, the sleeve's «vinyl
radio · 33⅓») stay as they are.

**The switch lives in Settings** (IDEA-13's page) as a two-state lamp
switch — UK / EN, no flags — and takes effect at once.

### Phases
- [ ] Phase 1 — The layer
      `src/i18n/`: the `uk` and `en` dictionaries, the typed key set,
      the locale store (localStorage + browser default), `useT()`,
      per-language pluralisation. Unit tests for the plural rules and
      the fallback.
- [ ] Phase 2 — The copy
      Every UI string routed through `t()`, the Ukrainian originals
      restored alongside the English; `<html lang>`, the title and the
      description follow the locale. The existing tests assert through
      the dictionaries instead of literals.
- [ ] Phase 3 — The switch
      The UK / EN lamp switch on the settings page, effective at once;
      a listener's choice survives reloads. Lint, types, build green.

### Out of scope

Translating the admin app or wave. Server-side locale negotiation.
Right-to-left or other languages — the layer is built for two.

### Thread
- [x] 2026-10-31 [decision] [user] A language switcher: the Ukrainian wording is liked and should stay available alongside English.
- [x] 2026-10-31 [decision] [agent] Its own idea, not a phase of IDEA-13: the layer touches every component, and the settings page simply hosts the switch once both land. Built after IDEA-13.
