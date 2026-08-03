import { renderRicos } from "../utils/ricos";

/**
 * Render a CMS rich-text field that may be Ricos JSON, an HTML string, or plain text.
 * Seed inserts sometimes land as HTML; dashboard edits are usually Ricos.
 */
export function renderCmsRichText(content: unknown): string {
  if (content == null) return "";

  if (typeof content === "object") {
    return renderRicos(content as Parameters<typeof renderRicos>[0]);
  }

  if (typeof content !== "string") return "";

  const trimmed = content.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const fromRicos = renderRicos(trimmed);
    if (fromRicos) return fromRicos;
  }

  if (/<[a-z][\s\S]*>/i.test(trimmed)) return trimmed;

  return `<p>${escapeHtml(trimmed)}</p>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
