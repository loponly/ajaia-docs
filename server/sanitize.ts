import sanitizeHtml from "sanitize-html";

const allowedTags = ["p", "h1", "h2", "h3", "strong", "em", "u", "ul", "ol", "li", "br", "blockquote", "code", "pre"];

export const cleanHtml = (html: string) => sanitizeHtml(html, { allowedTags, allowedAttributes: {} });
