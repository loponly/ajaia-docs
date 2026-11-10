# Architecture

**Structure.** One TypeScript repo, one Cloud Run service. `web/` is a Vite + React + TipTap SPA;
`server/` is Express, serving `/api/*` and the built SPA (with an index.html fallback). `shared/`
holds the seeded users and the API response types, so client and server can't drift apart.

**Data model.** One collection, `docs`:
`{ id, title, html, ownerId, shares: {userId: "viewer"|"editor"}, sharedWith: string[], createdAt, updatedAt }`.
`sharedWith` duplicates the keys of `shares` so Firestore can answer "shared with me" with a single
`array-contains` query. "Owned by me" is `ownerId ==`. Sorting by `updatedAt` happens in memory,
so no composite indexes are needed. A `Store` interface has two implementations:
`FileStore` (JSON file, local dev and tests) and `FirestoreStore` (production).

**Access logic.** `canAccess(doc, userId, "read"|"write")` in `server/access.ts` is the single
check. Owner → read/write/share/delete; editor → read/write; viewer → read; anyone else → 403.
Share, unshare and delete are owner-only. The UI hides controls by role, but the server is the
authority (covered by the access-matrix tests).

**Priorities.** 1) A correct sharing and permission model; 2) an editor that reliably saves
and reloads formatting; 3) import; 4) a familiar UI; 5) zero-cost deploy.

**Deliberate cuts (out of scope).** Real-time co-editing, comments, version history, real auth,
attachments, PDF export. Viewer/editor roles are the one stretch item included.

**Tradeoffs**
- *Last-write-wins, no realtime.* Autosave PATCHes the whole document after 800 ms of idle time.
  Simple and robust for single editors. Two simultaneous editors can overwrite each other;
  the next step would be an `updatedAt` precondition (409 on a stale write), then CRDTs (Yjs) if needed.
- *HTML storage + sanitization.* TipTap produces HTML, so documents are stored as HTML and
  sanitized server-side to a small tag allow-list (no attributes) on every save and import.
  That blocks stored XSS from imports or crafted API calls. Max 800 KB, inside Firestore's 1 MiB document limit.
- *Mocked auth.* Pick one of three seeded users. A signed, httpOnly, sameSite=lax cookie
  (secure in production) carries the user id. Swapping in real OIDC would only change `auth.ts`
  and the login screen.
- *Firestore vs SQLite.* Cloud Run's disk is ephemeral and min-instances 0 kills instances often,
  so SQLite would lose data. Firestore is serverless, needs no connection management, and stays in the free tier.
- *Zero-cost infra.* Request-based billing, min 0 / max 1 instance, 512 Mi. A source deploy builds
  through Cloud Build, and only the live image is kept in Artifact Registry. No load balancer,
  Cloud SQL, VPC or Secret Manager (`SESSION_SECRET` is generated at deploy time). The demo seed
  uses fixed ids, so it stays idempotent across cold starts.
