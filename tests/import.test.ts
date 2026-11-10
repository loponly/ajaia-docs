import { describe, expect, it } from "vitest";
import { setup } from "./helpers.js";

describe("import", () => {
  it(".md keeps headings and bold; title from filename", async () => {
    const alice = await (await setup()).as("alice");
    const md = "# Big Title\n\nSome **bold** text\n\n- one\n- two\n";
    const res = await alice.post("/api/import").attach("file", Buffer.from(md), "My Notes.md").expect(201);
    expect(res.body.title).toBe("My Notes");
    expect(res.body.html).toContain("<h1>Big Title</h1>");
    expect(res.body.html).toContain("<strong>bold</strong>");
    expect(res.body.html).toContain("<ul>");
    expect(res.body.role).toBe("owner");
  });

  it(".txt becomes escaped paragraphs", async () => {
    const alice = await (await setup()).as("alice");
    const res = await alice.post("/api/import").attach("file", Buffer.from("hello\n<script>x</script>\n"), "a.txt").expect(201);
    expect(res.body.html).toBe("<p>hello</p><p>&lt;script&gt;x&lt;/script&gt;</p>");
  });

  it("sanitizes markup from .md and PATCH", async () => {
    const alice = await (await setup()).as("alice");
    const res = await alice.post("/api/import").attach("file", Buffer.from('<img src=x onerror=alert(1)><p onclick="x">hi</p>'), "x.md").expect(201);
    expect(res.body.html).not.toMatch(/img|onerror|onclick/);
    const p = await alice.patch(`/api/docs/${res.body.id}`).send({ html: "<h1>ok</h1><script>bad()</script>" }).expect(200);
    expect(p.body.html).toBe("<h1>ok</h1>");
  });
});
