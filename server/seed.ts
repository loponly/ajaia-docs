import type { Doc, Store } from "./store/types.js";

const WELCOME = `<h1>Welcome to Ajaia Docs</h1>
<p>A lightweight collaborative editor. Text can be <strong>bold</strong>, <em>italic</em> or <u>underlined</u>.</p>
<h2>Things to try</h2>
<ul><li>Edit this document — Bob can too, it is shared with him as an editor.</li><li>Create a new document or import a .txt, .md or .docx file.</li></ul>
<ol><li>Click Share and add carol@ajaia.test.</li><li>Switch user to Carol and open it.</li></ol>`;

const Q4 = `<h1>Q4 Planning Notes</h1>
<p>Shared with Carol as a <strong>viewer</strong> — she can read but not edit.</p>
<ul><li>Finalize roadmap</li><li>Hire two engineers</li></ul>`;

// Fixed ids keep the seed idempotent, even if two instances start at once.
export async function seed(store: Store) {
  if (!(await store.isEmpty())) return;
  const now = new Date().toISOString();
  const base = { ownerId: "alice", createdAt: now, updatedAt: now };
  const docs: Doc[] = [
    { ...base, id: "welcome", title: "Welcome to Ajaia Docs", html: WELCOME, shares: { bob: "editor" }, sharedWith: ["bob"] },
    { ...base, id: "q4-planning", title: "Q4 Planning Notes", html: Q4, shares: { carol: "viewer" }, sharedWith: ["carol"] },
  ];
  for (const d of docs) await store.put(d);
}
