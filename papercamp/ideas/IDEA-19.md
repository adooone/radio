---
id: IDEA-19
title: Wave serves the admin's account routes
type: feat
status: idea
created: 2026-11-07
updated: 2026-11-07
tags:
  - wave
  - admin
  - accounts
---

The admin's people sheet (IDEA-16) cannot list anyone. Its `useUsers()`
calls `GET /api/accounts?limit&offset`, which wave never had: wave's
accounts routes are `register`, `login`, `me` (get, put, delete) and
`GET /:id`. So the sheet shows a notice instead of people. The admin's
`user-management-api.ts` also calls three more routes wave doesn't
serve, `PUT /api/accounts/:id`, `DELETE /api/accounts/:id` and
`POST /api/accounts/:id/reset-password`, so role changes, removals and
password resets would 404 the same way.

**Wave grows the routes the admin already calls**, admin-only behind
`authMiddleware` plus a role check:

- `GET /api/accounts`: a paged list (`limit`, `offset`) in the `User`
  shape the admin reads (id, name, role, active, last seen), never the
  password hash.
- `PUT /api/accounts/:id`: role and active flag.
- `DELETE /api/accounts/:id`: removes an account, never the caller's
  own.
- `POST /api/accounts/:id/reset-password`: what
  `scripts/reset-password.ts` does today, over HTTP.

The people sheet drops its "no route" notice and lists people as the
Users board draws them.

### Out of scope

Self-service sign-up and invitations. The login page. The player's chat
nicknames, which are not accounts.

### Thread
- [x] 2026-11-07 [decision] [agent] Moved here from IDEA-16's open question (2026-11-02) when IDEA-16 closed: the fix is a wave API change, which IDEA-16 kept out of scope.
