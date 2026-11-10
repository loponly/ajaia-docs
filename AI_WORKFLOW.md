# AI workflow

## Tools used
[FILL IN]
- Prompts: Claude Code (Opus) orchestrating from a written spec (SPEC.md, kept private);
  a Sonnet subagent built the React UI in a separate git worktree; Playwright MCP drove the E2E run.

## Where AI sped things up
[FILL IN]
- Prompts: scaffold + API + 16 tests; UI built in parallel with the server against a shared types contract;
  E2E checklist scripted and run in the browser; Dockerfile and Cloud Run deploy worked on the first attempt.

## What AI output I changed or rejected
[FILL IN]
- Prompts: a delegated server subagent was blocked by worktree policy, so the server was written in the
  main session instead; dependency versions were pinned (Vite 6 / Vitest 3, TipTap 2) after an npm peer conflict.

## How I verified correctness, UX and reliability
[FILL IN]
- Prompts: `npm test` (access matrix, sharing, import, unsupported file); curl round trip against the
  local production build; Playwright E2E E1–E8 all PASS (see E2E_RESULTS.md, docs/screenshots/);
  live checks on Cloud Run (/api/health, Bob's shared list, create → fetch).
