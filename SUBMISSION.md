# Ajaia Docs — submission

- **Live URL:** https://ajaia-docs-547265476805.us-central1.run.app (first load may take a few seconds: cold start)
- **Google Drive (source zip):** [FILL IN]
- **Video walkthrough:** [FILL IN]

## Demo users (mocked login: pick a user)

| User | Email | Starts with |
|---|---|---|
| Alice Chen | alice@ajaia.test | Owns "Welcome to Ajaia Docs" and "Q4 Planning Notes" |
| Bob Diaz | bob@ajaia.test | Welcome doc shared with him as **Editor** |
| Carol Park | carol@ajaia.test | Q4 Planning Notes shared with her as **Viewer** |

## 60-second review path

1. Log in as **Alice** → open **Welcome to Ajaia Docs** → type something → "All changes saved".
2. Click **Share** → `carol@ajaia.test`, Viewer → Share.
3. Avatar → **Switch user** → **Carol** → *Shared with me* → open the doc: read-only, no toolbar, "View only".

## What's included

- `README.md`: overview, setup, testing, deploy, status
- `ARCHITECTURE.md`: structure, data model, access logic, tradeoffs
- `AI_WORKFLOW.md`: how AI tools were used
- `E2E_RESULTS.md` + `docs/screenshots/`: end-to-end checklist results
- `TEARDOWN.md`: cleanup commands for the GCP resources
- `VIDEO_URL.txt`: walkthrough link
- `server/`, `shared/`, `web/`, `tests/`: source code and tests
- `Dockerfile`, `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `vitest.config.ts`, `.env.example`

## What works

- Create, rename and edit documents with headings, bold/italic/underline and lists, plus autosave.
- Import `.txt`, `.md`, `.docx` (≤ 2 MB) into a new document. Unsupported types are rejected clearly.
- Share by email as Viewer or Editor, and remove access. "Owned by me" / "Shared with me" lists.
- Server-enforced permissions and HTML sanitization. 16 API tests and an 8-step E2E run, all passing.
- Deployed on Cloud Run + Firestore within the free tier.

## What's incomplete

- No real-time co-editing (last write wins), comments, version history, real auth, attachments or PDF export.
- Documents can be deleted through the API, but there is no delete button in the UI.

## Next 2–4 hours

- Stale-write detection (409 on an outdated `updatedAt`) to protect concurrent editors.
- Delete/rename from the home list.
- Commit the E2E checklist as a Playwright test suite and run it in CI.

## More detail

[ARCHITECTURE.md](ARCHITECTURE.md) · [AI_WORKFLOW.md](AI_WORKFLOW.md) · [E2E_RESULTS.md](E2E_RESULTS.md)
