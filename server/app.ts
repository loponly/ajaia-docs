import fs from "node:fs";
import path from "node:path";
import cookieParser from "cookie-parser";
import express from "express";
import { docRoutes } from "./routes/docs.js";
import { sessionRoutes } from "./routes/session.js";
import type { Store } from "./store/types.js";

const WEB_DIST = path.resolve("web/dist");

export function createApp(store: Store) {
  const sessionKey = process.env.SESSION_SECRET;
  if (!sessionKey && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required");

  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser(sessionKey ?? "dev-only"));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api", sessionRoutes, docRoutes(store));
  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

  if (fs.existsSync(WEB_DIST)) {
    app.use(express.static(WEB_DIST));
    app.get("*", (_req, res) => res.sendFile(path.join(WEB_DIST, "index.html")));
  }

  // JSON errors, including oversized JSON bodies.
  app.use((err: { status?: number; message?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status ?? 500;
    res.status(status).json({ error: status === 413 ? "Request is too large" : status < 500 ? err.message : "Server error" });
  });
  return app;
}
