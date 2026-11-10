import type { Role } from "../../shared/types.js";

export type Doc = {
  id: string;
  title: string;
  html: string;
  ownerId: string;
  shares: Record<string, Role>;
  sharedWith: string[]; // = Object.keys(shares); lets Firestore use array-contains
  createdAt: string;
  updatedAt: string;
};

export interface Store {
  get(id: string): Promise<Doc | null>;
  put(doc: Doc): Promise<void>; // create or replace
  delete(id: string): Promise<void>;
  listOwned(userId: string): Promise<Doc[]>;
  listShared(userId: string): Promise<Doc[]>;
  isEmpty(): Promise<boolean>;
}
