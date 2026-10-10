<!-- paper-camp draft-pr template v1 -->
**Idea:** `IDEA-N` — `papercamp/ideas/IDEA-N.md`

_One or two lines on what this idea changes, for whoever reviews it._

### Phases

- [ ] _Phases go here, copied from the idea file — one commit each._

### Before merge

- [ ] Every phase above is checked and the idea's `status:` is `review`
- [ ] CI is green
- [ ] Owner has walked the affected screens in the running app

The flow: one branch per idea, one commit per phase, draft PR opened by
`.github/workflows/draft-pr.yml` on the first push, promoted to ready when the
idea reaches `review`.
