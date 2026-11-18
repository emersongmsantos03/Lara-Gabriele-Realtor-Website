import "server-only";

/** Adds ids to <h2> headings and returns a table of contents for the post page. */
export function withHeadingIds(html: string) {
  const toc: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/g, (_m, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").trim();
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "section";
    while (used.has(id)) id += "-2";
    used.add(id);
    if (text) toc.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: out, toc };
}
