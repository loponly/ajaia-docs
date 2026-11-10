import { Firestore } from "@google-cloud/firestore";
import type { Doc, Store } from "./types.js";

// Production store: Cloud Run disk is ephemeral. Single-field queries only (no composite indexes).
export class FirestoreStore implements Store {
  private col = new Firestore({ ignoreUndefinedProperties: true }).collection("docs");

  async get(id: string) {
    const snap = await this.col.doc(id).get();
    return snap.exists ? (snap.data() as Doc) : null;
  }
  async put(doc: Doc) {
    await this.col.doc(doc.id).set(doc);
  }
  async delete(id: string) {
    await this.col.doc(id).delete();
  }
  async listOwned(userId: string) {
    const q = await this.col.where("ownerId", "==", userId).get();
    return q.docs.map((d) => d.data() as Doc);
  }
  async listShared(userId: string) {
    const q = await this.col.where("sharedWith", "array-contains", userId).get();
    return q.docs.map((d) => d.data() as Doc);
  }
  async isEmpty() {
    return (await this.col.limit(1).get()).empty;
  }
}
