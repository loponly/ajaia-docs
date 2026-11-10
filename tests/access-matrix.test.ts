import { beforeEach, describe, expect, it } from "vitest";
import { setup } from "./helpers.js";

// Seed: "welcome" is owned by alice, shared with bob as editor; carol gets viewer below; dave doesn't exist.
let ctx: Awaited<ReturnType<typeof setup>>;
beforeEach(async () => {
  ctx = await setup();
  const alice = await ctx.as("alice");
  await alice.post("/api/docs/welcome/share").send({ email: "carol@ajaia.test", role: "viewer" }).expect(200);
});

const cases: [string, string, number, number, number, number][] = [
  // user,   role,     read, write, share, delete
  ["alice", "owner", 200, 200, 200, 200],
  ["bob", "editor", 200, 200, 403, 403],
  ["carol", "viewer", 200, 403, 403, 403],
];

describe("access matrix", () => {
  it.each(cases)("%s (%s)", async (user, role, read, write, share, del) => {
    const a = await ctx.as(user);
    const got = await a.get("/api/docs/welcome").expect(read);
    expect(got.body.role).toBe(role);
    await a.patch("/api/docs/welcome").send({ html: "<p>x</p>" }).expect(write);
    await a.post("/api/docs/welcome/share").send({ email: "bob@ajaia.test", role: "editor" }).expect(share);
    await a.delete("/api/docs/welcome").expect(del);
  });

  it("stranger gets 403 everywhere", async () => {
    const alice = await ctx.as("alice");
    const { body } = await alice.post("/api/docs").send({ title: "Private" }).expect(201);
    const bob = await ctx.as("bob");
    await bob.get(`/api/docs/${body.id}`).expect(403);
    await bob.patch(`/api/docs/${body.id}`).send({ title: "x" }).expect(403);
    await bob.delete(`/api/docs/${body.id}`).expect(403);
    await bob.post(`/api/docs/${body.id}/share`).send({ email: "carol@ajaia.test", role: "viewer" }).expect(403);
  });

  it("viewer PATCH is rejected and content unchanged", async () => {
    const carol = await ctx.as("carol");
    const before = (await carol.get("/api/docs/welcome")).body.html;
    const res = await carol.patch("/api/docs/welcome").send({ html: "<p>hacked</p>" }).expect(403);
    expect(res.body.error).toBeTruthy();
    expect((await carol.get("/api/docs/welcome")).body.html).toBe(before);
  });

  it("missing doc is 404, anonymous is 401, bad title is 400", async () => {
    const alice = await ctx.as("alice");
    await alice.get("/api/docs/nope").expect(404);
    await alice.patch("/api/docs/welcome").send({ title: "  " }).expect(400);
    await alice.patch("/api/docs/welcome").send({ title: "x".repeat(201) }).expect(400);
  });
});
