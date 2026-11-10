import { Router } from "express";
import { findUser } from "../../shared/users.js";
import { COOKIE, cookieOptions, requireUser, type AuthedRequest } from "../auth.js";

export const sessionRoutes = Router();

sessionRoutes.get("/me", requireUser, (req, res) => res.json({ user: (req as AuthedRequest).user }));

sessionRoutes.post("/login", (req, res) => {
  const user = findUser(String(req.body?.userId ?? ""));
  if (!user) return res.status(400).json({ error: "Unknown user" });
  res.cookie(COOKIE, user.id, cookieOptions).json({ user });
});

sessionRoutes.post("/logout", (_req, res) => res.clearCookie(COOKIE, cookieOptions).json({ ok: true }));
