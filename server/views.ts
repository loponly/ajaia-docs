import type { DocListItem, DocView } from "../shared/types.js";
import { findUser } from "../shared/users.js";
import { roleOf } from "./access.js";
import type { Doc } from "./store/types.js";

export function toListItem(doc: Doc, userId: string): DocListItem {
  const { id, title, ownerId, updatedAt } = doc;
  return { id, title, ownerId, ownerName: findUser(ownerId)?.name ?? ownerId, role: roleOf(doc, userId)!, updatedAt };
}

export function toView(doc: Doc, userId: string): DocView {
  const shares = Object.entries(doc.shares).map(([uid, role]) => {
    const u = findUser(uid)!;
    return { userId: uid, email: u.email, name: u.name, role };
  });
  return { ...toListItem(doc, userId), html: doc.html, shares };
}
