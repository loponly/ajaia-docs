import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { createApp } from "../server/app.js";
import { seed } from "../server/seed.js";
import { FileStore } from "../server/store/fileStore.js";

export async function setup() {
  const store = new FileStore(fs.mkdtempSync(path.join(os.tmpdir(), "ajaia-test-")));
  await seed(store);
  const app = createApp(store);
  const as = async (userId: string) => {
    const agent = request.agent(app);
    await agent.post("/api/login").send({ userId }).expect(200);
    return agent;
  };
  return { store, app, as };
}
