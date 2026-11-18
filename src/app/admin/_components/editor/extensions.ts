"use client";

import { Extension, Node, type Editor, type Range } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TableCell, TableHeader } from "@tiptap/extension-table";
import Suggestion from "@tiptap/suggestion";

// Custom blocks for the post editor. Each one renders plain, sanitizer-friendly
// HTML (see lib/admin/sanitize.ts) that all three sites style the same way
// (post-body.css on the main site, the .rich rules in _source/blog.py).

/** rgb()/rgba()/hex → #rrggbb, so colors read back from HTML fit the pickers. */
export function toHex(c: string | null | undefined): string | null {
  if (!c) return null;
  if (c.startsWith("#")) return c;
  const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

/** Black or white text, whichever reads better on this background. */
export function readableOn(bg: string) {
  const hex = (toHex(bg) || "#ffffff").slice(1);
  const full = hex.length === 3 ? hex.split("").map((x) => x + x).join("") : hex.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.45 ? "#15212c" : "#ffffff";
}

// ---------- Photo (with caption) ----------
export const BlogImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: { default: "full", parseHTML: (el) => el.getAttribute("data-size"), rendered: false },
      align: { default: "center", parseHTML: (el) => el.getAttribute("data-align"), rendered: false },
      caption: { default: "", parseHTML: (el) => el.querySelector?.("figcaption")?.textContent ?? null, rendered: false },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'figure[data-type="image"]',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector("img");
          return img ? { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "", title: img.getAttribute("title") } : false;
        },
      },
      { tag: 'img[src]:not([src^="data:"])' },
    ];
  },
  renderHTML({ node }) {
    const { src, alt, title, size, align, caption } = node.attrs;
    const img: [string, Record<string, string>] = ["img", { src, alt: alt || "", ...(title ? { title } : {}) }];
    return caption
      ? ["figure", { "data-type": "image", "data-size": size, "data-align": align }, img, ["figcaption", {}, caption]]
      : ["figure", { "data-type": "image", "data-size": size, "data-align": align }, img];
  },
}).configure({ inline: false, allowBase64: false });

// ---------- Button ----------
export type ButtonAttrs = {
  text: string;
  href: string;
  color: string;
  variant: "filled" | "outline";
  shape: "pill" | "rounded" | "square";
  size: "sm" | "md" | "lg";
  align: "left" | "center" | "right";
  newTab: boolean;
  full: boolean;
};

export const BUTTON_DEFAULTS: ButtonAttrs = {
  text: "Get in touch",
  href: "",
  color: "#c9671f",
  variant: "filled",
  shape: "pill",
  size: "md",
  align: "center",
  newTab: false,
  full: false,
};

export function buttonStyle(a: Pick<ButtonAttrs, "color" | "variant">) {
  return a.variant === "filled"
    ? `background-color:${a.color};color:${readableOn(a.color)};border-color:${a.color}`
    : `background-color:transparent;color:${a.color};border-color:${a.color}`;
}

export const CtaButton = Node.create({
  name: "ctaButton",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return Object.fromEntries(
      Object.entries(BUTTON_DEFAULTS).map(([k, v]) => [k, { default: v, rendered: false, parseHTML: () => null }]),
    );
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="button"]',
        getAttrs: (el) => {
          const d = el as HTMLElement;
          const a = d.querySelector("a");
          if (!a) return false;
          const variant = a.getAttribute("data-variant") === "outline" ? "outline" : "filled";
          return {
            text: a.textContent || BUTTON_DEFAULTS.text,
            href: a.getAttribute("href") || "",
            color: toHex(variant === "filled" ? a.style.backgroundColor : a.style.borderColor) || BUTTON_DEFAULTS.color,
            variant,
            shape: a.getAttribute("data-shape") || "pill",
            size: a.getAttribute("data-size") || "md",
            align: d.getAttribute("data-align") || "center",
            newTab: a.getAttribute("target") === "_blank",
            full: d.getAttribute("data-full") === "true",
          };
        },
      },
    ];
  },
  renderHTML({ node }) {
    const a = node.attrs as ButtonAttrs;
    return [
      "div",
      { "data-type": "button", "data-align": a.align, ...(a.full ? { "data-full": "true" } : {}) },
      [
        "a",
        {
          href: a.href || "#",
          "data-variant": a.variant,
          "data-size": a.size,
          "data-shape": a.shape,
          style: buttonStyle(a),
          ...(a.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        },
        a.text,
      ],
    ];
  },
});

// ---------- Colored box ----------
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  draggable: true,
  addAttributes() {
    return {
      bg: { default: "#f4ecdf", rendered: false, parseHTML: (el) => toHex(el.style.backgroundColor) },
      emoji: { default: "", rendered: false, parseHTML: (el) => el.getAttribute("data-emoji") },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },
  renderHTML({ node }) {
    const { bg, emoji } = node.attrs;
    return [
      "div",
      {
        "data-type": "callout",
        "data-tone": readableOn(bg) === "#ffffff" ? "dark" : "light",
        ...(emoji ? { "data-emoji": emoji } : {}),
        style: `background-color:${bg}`,
      },
      0,
    ];
  },
});

// ---------- Google map ----------
export const mapSrc = (address: string) => `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

export const MapEmbed = Node.create({
  name: "mapEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return { address: { default: "", rendered: false, parseHTML: (el) => el.getAttribute("data-address") } };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="map"]' }];
  },
  renderHTML({ node }) {
    const address = node.attrs.address as string;
    return [
      "div",
      { "data-type": "map", "data-address": address },
      ["iframe", { src: mapSrc(address), loading: "lazy", referrerpolicy: "no-referrer-when-downgrade", title: `Map: ${address}`, frameborder: "0" }],
    ];
  },
});

// ---------- Table cells with background color ----------
const cellColor = {
  backgroundColor: {
    default: null,
    parseHTML: (el: HTMLElement) => toHex(el.style.backgroundColor),
    renderHTML: (a: Record<string, unknown>) => (a.backgroundColor ? { style: `background-color:${a.backgroundColor}` } : {}),
  },
};
export const BlogTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellColor };
  },
});
export const BlogTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...cellColor };
  },
});

// ---------- "/" command menu ----------
export type SlashItem = { id: string; run: (editor: Editor, range: Range) => void };
export type SlashState = {
  query: string;
  rect: DOMRect | null;
  command: (item: SlashItem) => void;
} | null;

export const SlashCommand = Extension.create<{
  onState: (s: SlashState) => void;
  onKey: (e: KeyboardEvent) => boolean;
}>({
  name: "slashCommand",
  addOptions() {
    return { onState: () => {}, onKey: () => false };
  },
  addProseMirrorPlugins() {
    const opts = this.options;
    return [
      Suggestion<SlashItem, SlashItem>({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        allowSpaces: false,
        items: () => [],
        command: ({ editor, range, props }) => props.run(editor, range),
        render: () => {
          const push = (p: { query: string; clientRect?: (() => DOMRect | null) | null; command: (i: SlashItem) => void }) =>
            opts.onState({ query: p.query, rect: p.clientRect?.() ?? null, command: p.command });
          return {
            onStart: push,
            onUpdate: push,
            onKeyDown: ({ event }) => {
              if (event.key === "Escape") {
                opts.onState(null);
                return true;
              }
              return opts.onKey(event);
            },
            onExit: () => opts.onState(null),
          };
        },
      }),
    ];
  },
});
