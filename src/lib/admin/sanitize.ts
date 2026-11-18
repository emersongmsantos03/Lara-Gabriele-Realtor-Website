import "server-only";
import sanitizeHtml from "sanitize-html";

// Post HTML is shown on three public sites, so only the formatting the editor
// can produce is kept. Anything else (scripts, event handlers, unknown styles,
// iframes from other sites) is dropped on save.

const color = [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i, /^transparent$/];
const px = [/^\d{1,4}(\.\d+)?px$/];

export function cleanPostHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li",
      "blockquote", "hr", "br", "img", "span", "mark", "div", "iframe", "code", "pre", "sub", "sup",
      "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "colgroup", "col", "label", "input",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "data-variant", "data-size", "data-shape", "style"],
      img: ["src", "alt", "title", "data-size", "data-align"],
      figure: ["data-type", "data-size", "data-align"],
      div: ["data-type", "data-youtube-video", "data-align", "data-emoji", "data-tone", "data-address", "data-full", "style"],
      span: ["style"],
      mark: ["style", "data-color"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      ul: ["data-type"],
      li: ["style", "data-type", "data-checked"],
      input: ["type", "checked", "disabled"],
      table: ["style"],
      col: ["style"],
      td: ["colspan", "rowspan", "colwidth", "style"],
      th: ["colspan", "rowspan", "colwidth", "style"],
      iframe: ["src", "width", "height", "allowfullscreen", "allow", "frameborder", "loading", "referrerpolicy", "title"],
    },
    allowedClasses: { div: ["tableWrapper"] },
    allowedStyles: {
      "*": {
        color,
        "background-color": color,
        "border-color": color,
        "font-family": [/^[\w\s'",\-().]+$/],
        "font-size": [/^\d{1,2}(px|em|rem)$/],
        "text-align": [/^(left|right|center|justify)$/],
        "line-height": [/^[\d.]+$/],
        width: px,
        "min-width": px,
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "youtube.com", "www.google.com", "maps.google.com"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const out = { ...attribs };
        if (out.target === "_blank") out.rel = "noopener noreferrer";
        else {
          delete out.target;
          delete out.rel;
        }
        return { tagName, attribs: out };
      },
      // Google iframes are only allowed for maps.
      iframe: (tagName, attribs) => {
        try {
          const u = new URL(attribs.src || "");
          if (/google\.com$/.test(u.hostname) && !u.pathname.startsWith("/maps")) return { tagName, attribs: {} };
        } catch {}
        return { tagName, attribs };
      },
      // Checklists are display-only on the public sites.
      input: (tagName, attribs) => ({
        tagName,
        attribs: attribs.type === "checkbox" ? { type: "checkbox", disabled: "disabled", ...(attribs.checked !== undefined ? { checked: "checked" } : {}) } : {},
      }),
    },
    exclusiveFilter: (frame) => (frame.tag === "iframe" && !frame.attribs.src) || (frame.tag === "input" && frame.attribs.type !== "checkbox"),
  });
}

/** Plain text for excerpts, word counts and meta descriptions. */
export function htmlToText(html: string) {
  return sanitizeHtml(html.replace(/<\/(p|h\d|li|blockquote|td|th|figcaption)>/g, " "), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
