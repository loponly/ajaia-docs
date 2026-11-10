import type { Access } from "../shared/types.js";
import type { Doc } from "./store/types.js";

export function roleOf(doc: Doc, userId: string): Access | null {
  return doc.ownerId === userId ? "owner" : doc.shares[userId] ?? null;
}

// The single access check used by every route.
export function canAccess(doc: Doc, userId: string, need: "read" | "write"): boolean {
  const role = roleOf(doc, userId);
  return need === "read" ? role !== null : role === "owner" || role === "editor";
}
