import { describe, expect, it } from "vitest";
import { seed } from "../server/seed.js";
import { setup } from "./helpers.js";

describe("sharing", () => {
  it("shared doc appears in the recipient's shared list with owner and role", async () => {
    const { as } = await setup();
    const alice = await as("alice");
    const { body: doc } = await alice.post("/api/docs").send({ title: "Plan" }).expect(201);
    const shared = await alice.post(`/api/docs/${doc.id}/share`).send({ email: "Carol@ajaia.test", role: "editor" }).expect(200);
    expect(shared.body.shares).toEqual([{ userId: "carol", email: "carol@ajaia.test", name: "Carol Park", role: "editor" }]);

    const carol = await as("carol");
    const list = (await carol.get("/api/docs").expect(200)).body;
    const item = list.shared.find((d: { id: string }) => d.id === doc.id);
    expect(item).toMatchObject({ title: "Plan", ownerName: "Alice Chen", role: "editor" });
    expect(item.html).toBeUndefined();
  });

  it("rejects unknown email and self-share", async () => {
    const alice = await (await setup()).as("alice");
    const a = await alice.post("/api/docs/welcome/share").send({ email: "nobody@x.test", role: "viewer" }).expect(400);
    expect(a.body.error).toMatch(/no user/i);
    await alice.post("/api/docs/welcome/share").send({ email: "alice@ajaia.test", role: "viewer" }).expect(400);
  });

  it("unshare removes access", async () => {
    const { as } = await setup();
    const alice = await as("alice");
    const res = await alice.delete("/api/docs/welcome/share/bob").expect(200);
    expect(res.body.shares).toEqual([]);
    const bob = await as("bob");
    await bob.get("/api/docs/welcome").expect(403);
    expect((await bob.get("/api/docs")).body.shared).toEqual([]);
  });

  it("seed is idempotent and shares the demo docs", async () => {
    const { store, as } = await setup();
    await seed(store);
    expect((await store.listOwned("alice")).length).toBe(2);
    const bob = (await (await as("bob")).get("/api/docs")).body;
    expect(bob.shared.map((d: { title: string }) => d.title)).toEqual(["Welcome to Ajaia Docs"]);
  });
});
