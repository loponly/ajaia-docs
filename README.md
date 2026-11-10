# Ajaia Docs

A lightweight, Google-Docs-style collaborative editor: create and format documents, import
`.txt` / `.md` / `.docx` files, and share them with other users as viewers or editors. It is
one TypeScript service (React + TipTap front end, Express API) on Cloud Run, backed by Firestore.

**Live:** https://ajaia-docs-547265476805.us-central1.run.app
*The first load may take a few seconds (cold start — the service scales to zero).*

## Demo accounts

Login is mocked: pick a user, no password.

| User | Email | Sees on first login |
|---|---|---|
| Alice Chen | alice@ajaia.test | Owns "Welcome to Ajaia Docs" and "Q4 Planning Notes" |
| Bob Diaz | bob@ajaia.test | "Welcome to Ajaia Docs" under *Shared with me* (Can edit) |
| Carol Park | carol@ajaia.test | "Q4 Planning Notes" under *Shared with me* (View only) |

**60-second review path:** log in as Alice → open *Welcome to Ajaia Docs* → edit some text
(watch "All changes saved") → **Share** → add `carol@ajaia.test` as Viewer → avatar menu →
*Switch user* → Carol → *Shared with me* → open it: read-only, no toolbar, "View only" chip.

## Features

- Documents: create, rename (inline title), rich-text edit, autosave (800 ms debounce), delete via API.
- Formatting: Normal text / Heading 1 / Heading 2, bold, italic, underline, bulleted and numbered lists, undo/redo.
- Import: **`.txt`, `.md`, `.docx` only, up to 2 MB** → a new document titled after the file.
  Other types are rejected with a clear message.
- Sharing: owner shares by email as **Viewer** or **Editor**, and can remove access. Viewers get a read-only editor.
- Home: *Owned by me* / *Shared with me* tabs, title search, owner and role shown for shared docs.
- Security: server-side access checks on every route, HTML sanitized to an allow-list on save and import.

## Run locally

Prerequisites: Node 20+.

```bash
npm install
npm run dev                  # API on :8080 + Vite dev server (proxying /api)
npm test                     # unit/API tests
npm run build && npm start   # production build served on :8080
```

Environment variables (see `.env.example`): `PORT` (default 8080), `STORE` (`file` default, or
`firestore`), `SESSION_SECRET` (required when `NODE_ENV=production`), `NODE_ENV`.
Locally, documents are stored in `./data/db.json` (delete the folder to reset; demo docs are re-seeded).

## Testing

- **Unit/API tests** (`npm test`, vitest + supertest, 16 tests): access matrix
  (owner/editor/viewer/stranger), sharing and unsharing, seed idempotence, `.md`/`.txt`
  import and sanitization, unsupported file → 400, oversize → 413, auth → 401.
- **End-to-end:** an 8-step checklist run with Playwright against the production build.
  All steps passed; see [E2E_RESULTS.md](E2E_RESULTS.md) and the screenshots in `docs/screenshots/`.

## Deploy to Cloud Run

```bash
gcloud config set project em4it-461907
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com
gcloud firestore databases list        # reuse (default) if it is FIRESTORE_NATIVE; else:
gcloud firestore databases create --location=us-central1
gcloud run deploy ajaia-docs --source . --region us-central1 --allow-unauthenticated \
  --min-instances 0 --max-instances 1 --cpu 1 --memory 512Mi --concurrency 80 \
  --set-env-vars STORE=firestore,NODE_ENV=production,SESSION_SECRET=$(openssl rand -hex 16)
```

Cost: min-instances 0 with request-based billing, one small image in Artifact Registry and a few
Firestore documents keep usage inside the GCP free tier. Cleanup: [TEARDOWN.md](TEARDOWN.md).

## Project structure

```
server/          Express API: routes, auth, access check, import, sanitize, seed
server/store/    Store interface + FileStore (local JSON) + FirestoreStore (prod)
shared/          Seeded users and API types used by both server and web
web/             Vite + React + TipTap single-page app (plain CSS, theme in theme.css)
tests/           vitest + supertest API tests
docs/screenshots E2E screenshots
```

## Status

- **Working:** everything listed under Features, deployed and verified end to end (local E2E + live API checks).
- **Incomplete / cut on purpose:** real-time co-editing, comments, version history, real auth, attachments, PDF export.
  Concurrent edits are last-write-wins.
- **Next 2–4 hours:** conflict detection on save (reject a stale `updatedAt`), delete/rename from the home list,
  a Playwright test suite in CI, and a document-size indicator near the 800 KB limit.

## More

[ARCHITECTURE.md](ARCHITECTURE.md) · [AI_WORKFLOW.md](AI_WORKFLOW.md) · [SUBMISSION.md](SUBMISSION.md)
