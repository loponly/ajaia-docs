import fs from "node:fs";
import path from "node:path";
import type { Doc, Store } from "./types.js";

// Local/dev store: one JSON file. Not for Cloud Run (ephemeral disk).
export class FileStore implements Store {
  private file: string;

  constructor(dir = "./data") {
    fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, "db.json");
  }

  private read(): Record<string, Doc> {
    return fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file, "utf8")) : {};
  }
  private write(db: Record<string, Doc>) {
    fs.writeFileSync(this.file, JSON.stringify(db, null, 2));
  }

  async get(id: string) {
    return this.read()[id] ?? null;
  }
  async put(doc: Doc) {
    const db = this.read();
    db[doc.id] = doc;
    this.write(db);
  }
  async delete(id: string) {
    const db = this.read();
    delete db[id];
    this.write(db);
  }
  async listOwned(userId: string) {
    return Object.values(this.read()).filter((d) => d.ownerId === userId);
  }
  async listShared(userId: string) {
    return Object.values(this.read()).filter((d) => d.sharedWith.includes(userId));
  }
  async isEmpty() {
    return Object.keys(this.read()).length === 0;
  }
}
