/**
 * Normalisasi embed HTML dari Canva yang datanya kadang korup
 * (quote dobel "" akibat double-escaping di backend/import).
 * Dipakai sebelum extractCanvaEmbedSrc ATAU sebelum dangerouslySetInnerHTML.
 */
export function normalizeEmbedHtml(embedHtml: string): string {
  if (!embedHtml) return embedHtml;
  return embedHtml.replace(/""/g, '"');
}

/**
 * Ekstrak URL `src` dari iframe di dalam embed code Canva.
 */
export function extractCanvaEmbedSrc(embedHtml: string): string | null {
  if (!embedHtml) return null;

  const normalized = normalizeEmbedHtml(embedHtml);
  const doc = new DOMParser().parseFromString(normalized, "text/html");
  const iframe = doc.querySelector("iframe");
  const src = iframe?.getAttribute("src");

  return src && src.trim() !== "" ? src : null;
}