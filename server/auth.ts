import type { NextFunction, Request, Response } from "express";
import { findUser, type User } from "../shared/users.js";

export const COOKIE = "uid";
export const cookieOptions = {
  httpOnly: true,
  signed: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export type AuthedRequest = Request & { user: User };

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const user = findUser(req.signedCookies?.[COOKIE] ?? "");
  if (!user) return res.status(401).json({ error: "Not logged in" });
  (req as AuthedRequest).user = user;
  next();
}
