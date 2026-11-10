import request from "supertest";
import { describe, expect, it } from "vitest";
import { setup } from "./helpers.js";

describe("unsupported files", () => {
  it(".pdf is rejected with a clear message and no doc is created", async () => {
    const { as } = await setup();
    const alice = await as("alice");
    const res = await alice.post("/api/import").attach("file", Buffer.from("%PDF-1.4 junk"), "report.pdf").expect(400);
    expect(res.body.error).toBe("Unsupported file type. Supported: .txt, .md, .docx");
    expect((await alice.get("/api/docs")).body.owned.length).toBe(2);
  });

  it("files over 2 MB get 413", async () => {
    const alice = await (await setup()).as("alice");
    await alice.post("/api/import").attach("file", Buffer.alloc(2 * 1024 * 1024 + 1, 97), "big.txt").expect(413);
  });

  it("requires login", async () => {
    const { app } = await setup();
    await request(app).post("/api/import").attach("file", Buffer.from("x"), "a.txt").expect(401);
    await request(app).get("/api/docs").expect(401);
    await request(app).get("/api/health").expect(200);
  });
});
