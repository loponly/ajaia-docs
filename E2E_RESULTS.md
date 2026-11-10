# E2E results

Date: 2026-11-10 · Tool: Playwright MCP (Chromium, headless) · Target: production build
(`rm -rf data && npm run build && npm start`, fresh FileStore) on http://localhost:8080.
Fixtures: `e2e-import.md` (H1, a **bold** line, 2-item list) and `e2e-bad.pdf` (random bytes).

| Step | Result | Notes |
|---|---|---|
| E1 Login as Alice → "Owned by me" lists seeded Welcome doc | PASS | Rows: "Welcome to Ajaia Docs", "Q4 Planning Notes" |
| E2 New doc → title "E2E Test Doc" → H1, bold, italic, underline, 2 bullets, 2 numbers → saved | PASS | Status "All changes saved"; DOM had h1/strong/em/u/ul/ol |
| E3 Reload → title and formatting persist | PASS | Title kept; h1, strong, em, u, ul, ol all present; 4 list items |
| E4 Share with bob@ajaia.test as Editor; share with nobody@x.test | PASS | Bob listed as Editor in "People with access"; inline error "No user with that email" |
| E5 Bob → Shared with me → open, add a line → saved → Alice sees it | PASS | Row showed "Alice Chen · Can edit"; chip "Can edit"; Alice saw "Line added by Bob" |
| E6 Carol → "Q4 Planning Notes" read-only | PASS | Toolbar absent, contenteditable=false, chip "View only", no Share button, title read-only |
| E7 Import e2e-import.md | PASS | Opened new doc titled "e2e-import" with h1, strong and list |
| E8 Import e2e-bad.pdf | PASS | Toast "Unsupported file type. Supported: .txt, .md, .docx"; doc count unchanged (4 → 4) |

Screenshots: `docs/screenshots/01-home.png`, `02-editor.png`, `03-share.png`, `04-viewer.png`.
No failures, so no fix rounds were needed.
