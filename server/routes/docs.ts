import crypto from "node:crypto";
import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import type { Role } from "../../shared/types.js";
import { findUserByEmail } from "../../shared/users.js";
import { canAccess } from "../access.js";
import { requireUser, type AuthedRequest } from "../auth.js";
import { fileToHtml, UNSUPPORTED } from "../importer.js";
import { cleanHtml } from "../sanitize.js";
import type { Doc, Store } from "../store/types.js";
import { toListItem, toView } from "../views.js";

const MAX_HTML = 800 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const byUpdated = (a: Doc, b: Doc) => b.updatedAt.localeCompare(a.updatedAt);

export function newDoc(ownerId: string, title: string, html = ""): Doc {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title, html, ownerId, shares: {}, sharedWith: [], createdAt: now, updatedAt: now };
}

export function docRoutes(store: Store) {
  const r = Router();
  r.use(requireUser);
  const uid = (req: Request) => (req as AuthedRequest).user.id;
  type DocReq = Request & { doc: Doc };

  // Loads :id and enforces access: 404 missing, 403 not allowed. "owner" = owner only.
  const load = (need: "read" | "write" | "owner") => async (req: Request, res: Response, next: NextFunction) => {
    const doc = await store.get(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    const ok = need === "owner" ? doc.ownerId === uid(req) : canAccess(doc, uid(req), need);
    if (!ok) return res.status(403).json({ error: "You don't have access to this document" });
    (req as DocReq).doc = doc;
    next();
  };
  const save = async (req: Request, res: Response, doc: Doc, status = 200) => {
    await store.put(doc);
    res.status(status).json(toView(doc, uid(req)));
  };

  r.get("/docs", async (req, res) => {
    const [owned, shared] = await Promise.all([store.listOwned(uid(req)), store.listShared(uid(req))]);
    res.json({
      owned: owned.sort(byUpdated).map((d) => toListItem(d, uid(req))),
      shared: shared.sort(byUpdated).map((d) => toListItem(d, uid(req))),
    });
  });

  r.post("/docs", (req, res) => save(req, res, newDoc(uid(req), String(req.body?.title ?? "").trim() || "Untitled document"), 201));

  r.get("/docs/:id", load("read"), (req, res) => res.json(toView((req as DocReq).doc, uid(req))));

  r.patch("/docs/:id", load("write"), async (req, res) => {
    const doc = { ...(req as DocReq).doc };
    const { title, html } = req.body ?? {};
    if (title !== undefined) {
      const t = String(title).trim();
      if (t.length < 1 || t.length > 200) return res.status(400).json({ error: "Title must be 1–200 characters" });
      doc.title = t;
    }
    if (html !== undefined) {
      doc.html = cleanHtml(String(html));
      if (doc.html.length > MAX_HTML) return res.status(413).json({ error: "Document is too large" });
    }
    doc.updatedAt = new Date().toISOString();
    await save(req, res, doc);
  });

  r.delete("/docs/:id", load("owner"), async (req, res) => {
    await store.delete(req.params.id);
    res.json({ ok: true });
  });

  r.post("/docs/:id/share", load("owner"), async (req, res) => {
    const user = findUserByEmail(String(req.body?.email ?? ""));
    const role: Role = req.body?.role === "editor" ? "editor" : "viewer";
    if (!user) return res.status(400).json({ error: "No user with that email" });
    if (user.id === uid(req)) return res.status(400).json({ error: "You already own this document" });
    const doc = (req as DocReq).doc;
    const shares = { ...doc.shares, [user.id]: role };
    await save(req, res, { ...doc, shares, sharedWith: Object.keys(shares) });
  });

  r.delete("/docs/:id/share/:userId", load("owner"), async (req, res) => {
    const doc = (req as DocReq).doc;
    const { [req.params.userId]: _removed, ...shares } = doc.shares;
    await save(req, res, { ...doc, shares, sharedWith: Object.keys(shares) });
  });

  r.post("/import", (req, res, next) =>
    upload.single("file")(req, res, (err) => {
      if (err?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File is larger than 2 MB" });
      next(err);
    }),
    async (req, res) => {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const name = Buffer.from(req.file.originalname, "latin1").toString("utf8");
      const html = await fileToHtml(name, req.file.buffer);
      if (html === null) return res.status(400).json({ error: UNSUPPORTED });
      if (html.length > MAX_HTML) return res.status(413).json({ error: "Document is too large" });
      const title = name.replace(/\.[^.]+$/, "").slice(0, 200) || "Untitled document";
      await save(req, res, newDoc(uid(req), title, html), 201);
    });

  return r;
}
