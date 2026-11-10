# AI workflow

## Tools used

- **Claude Code (Opus)** as the main agent: it planned, wrote the server and tests, ran the checks,
  deployed, and wrote the docs.
- **A Sonnet subagent** that built the React/TipTap UI in its own git worktree, in parallel with the server.
- **Playwright MCP** to drive a real Chromium browser for the end-to-end checklist.
- **gcloud** for the Cloud Run deploy, driven by the agent and checked with curl against the live URL.

## Where AI sped things up

I wrote a detailed spec up front (stack, data model, API, UI, test checklist, deploy commands and
zero-cost rules), then ran it as one goal with explicit "done when" conditions. The agent worked
through the phases in order and had to show command output for each condition.

Under a ~2-hour deadline, I told it to switch to subagent-driven development. A shared
`shared/types.ts` contract let the UI and the API be built at the same time without drifting apart.
The scaffold, API, 16 tests, UI, E2E run, Dockerfile and first-try Cloud Run deploy were done in
about 20 minutes of wall-clock time. That left my time for reviewing rather than typing.

## What AI output I changed or rejected

- **Decisions stayed mine.** I fixed the architecture in the spec (Firestore over SQLite because
  Cloud Run's disk is ephemeral, mocked auth, last-write-wins) and told the agent not to
  re-deliberate them.
- **Infrastructure rules.** I keep large files off my internal disk. When npm kept replacing a
  symlinked `node_modules` with a real folder there, the agent had to move it to my external drive
  instead of accepting the default.
- **Delegation that didn't work.** The server subagent was blocked by worktree policy twice, so
  that part was pulled back into the main session instead of retried blindly.
- **Placeholders over invented text.** I had the agent leave this file as placeholders rather than
  make up my experience. I then had these answers written only from what actually happened.

## How I verified correctness, UX and reliability

- **Tests:** `npm test` runs 16 API tests. They cover the full access matrix (owner/editor/viewer/stranger),
  sharing and unsharing, a viewer's PATCH getting 403, `.md`/`.txt` import and HTML sanitization, and
  unsupported (400) or oversize (413) uploads.
- **End to end:** an 8-step checklist in a real browser against the production build: create and
  format, reload and check that formatting persists, share, switch users, the viewer is read-only, and
  import both good and bad files. All 8 passed; see [E2E_RESULTS.md](E2E_RESULTS.md) and `docs/screenshots/`.
- **Live deploy:** curl against Cloud Run for `/api/health`, Bob's shared list, and create → fetch.
- **Security and cost review:** before relying on the public repo, I had every commit scanned for
  leaked keys and private files (none found). I also checked that the live service has minimum
  instances at zero and CPU only during requests, so it stays at zero cost when idle.
