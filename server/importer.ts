import path from "node:path";
import mammoth from "mammoth";
import { marked } from "marked";
import { cleanHtml } from "./sanitize.js";

export const UNSUPPORTED = "Unsupported file type. Supported: .txt, .md, .docx";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Returns sanitized HTML, or null when the extension is not supported.
export async function fileToHtml(name: string, buf: Buffer): Promise<string | null> {
  const ext = path.extname(name).toLowerCase();
  let html: string;
  if (ext === ".docx") html = (await mammoth.convertToHtml({ buffer: buf })).value;
  else if (ext === ".md") html = await marked.parse(buf.toString("utf8"));
  else if (ext === ".txt")
    html = buf.toString("utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => `<p>${escape(l)}</p>`).join("");
  else return null;
  return cleanHtml(html);
}
