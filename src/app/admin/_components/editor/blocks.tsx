"use client";

import { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/react";
import {
  CheckSquare,
  Heading2,
  Heading3,
  House,
  ImagePlus,
  Lightbulb,
  List,
  ListOrdered,
  MapPin,
  MessageSquare,
  Minus,
  MousePointerClick,
  PaintBucket,
  Phone,
  Pilcrow,
  Quote,
  SquarePlay,
  Table,
  type LucideIcon,
} from "lucide-react";
import { SITES } from "@/lib/admin/sites";
import type { ButtonAttrs } from "./extensions";

const MAIN = SITES.pacific.url;

/** Links offered in the link and button dialogs (absolute, so they work on every site). */
export const QUICK_LINKS = [
  { label: "Contact form (talk to Lara)", href: `${MAIN}/#contact` },
  { label: "Free home value", href: `${MAIN}/#valuation` },
  { label: "Call Lara", href: "tel:+16195679584" },
  { label: "Email Lara", href: "mailto:lara.gabriele@exprealty.com" },
  { label: "Pacific Friendly home page", href: `${MAIN}/` },
  { label: "Neighborhoods", href: `${MAIN}/areas` },
  { label: "Buyer & seller guides", href: `${MAIN}/guides` },
  { label: "Blog", href: `${MAIN}/blog` },
  { label: "Santa Fe Hills: home value", href: `${SITES.santafe.url}/#home-value` },
  { label: "Lomas Verdes: home value", href: `${SITES.lomasverdes.url}/#home-value` },
  { label: "Instagram", href: "https://www.instagram.com/lara_gabriele_realtor/" },
];

export const BUTTON_PRESETS: { label: string; attrs: Partial<ButtonAttrs> }[] = [
  { label: "Talk to Lara", attrs: { text: "Talk to Lara", href: `${MAIN}/#contact` } },
  { label: "Home value", attrs: { text: "Get my free home value", href: `${MAIN}/#valuation` } },
  { label: "Call", attrs: { text: "Call Lara · (619) 567-9584", href: "tel:+16195679584", color: "#0e2b40" } },
  { label: "Schedule a tour", attrs: { text: "Schedule a private tour", href: `${MAIN}/#contact`, color: "#1b8a99" } },
];

export type BlockCtx = {
  pickPhoto: () => void;
  openVideo: () => void;
  openMap: () => void;
  openButton: (preset?: Partial<ButtonAttrs>) => void;
};

export type Block = {
  id: string;
  group: "Basics" | "Media" | "Layout" | "Quick buttons";
  label: string;
  desc: string;
  icon: LucideIcon;
  keywords: string;
  run: (editor: Editor, ctx: BlockCtx) => void;
};

function box(editor: Editor, attrs: { bg: string; emoji: string }) {
  if (!editor.chain().focus().wrapIn("callout", attrs).run()) {
    editor.chain().focus().insertContent({ type: "callout", attrs, content: [{ type: "paragraph" }] }).run();
  }
}

export const BLOCKS: Block[] = [
  { id: "p", group: "Basics", label: "Text", desc: "Plain paragraph", icon: Pilcrow, keywords: "paragraph normal", run: (e) => e.chain().focus().setParagraph().run() },
  { id: "h2", group: "Basics", label: "Big heading", desc: "Section title", icon: Heading2, keywords: "title h2 heading", run: (e) => e.chain().focus().setHeading({ level: 2 }).run() },
  { id: "h3", group: "Basics", label: "Small heading", desc: "Sub-section title", icon: Heading3, keywords: "subtitle h3 heading", run: (e) => e.chain().focus().setHeading({ level: 3 }).run() },
  { id: "ul", group: "Basics", label: "Bullet list", desc: "Simple list with dots", icon: List, keywords: "list bullets", run: (e) => e.chain().focus().toggleBulletList().run() },
  { id: "ol", group: "Basics", label: "Numbered list", desc: "Steps 1, 2, 3", icon: ListOrdered, keywords: "list numbers steps", run: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: "todo", group: "Basics", label: "Checklist", desc: "List with check boxes", icon: CheckSquare, keywords: "todo tasks check moving", run: (e) => e.chain().focus().toggleTaskList().run() },
  { id: "quote", group: "Basics", label: "Quote", desc: "Highlight a quote or testimonial", icon: Quote, keywords: "testimonial blockquote", run: (e) => e.chain().focus().setParagraph().setBlockquote().run() },
  { id: "hr", group: "Basics", label: "Divider", desc: "Line between sections", icon: Minus, keywords: "line separator hr", run: (e) => e.chain().focus().setHorizontalRule().run() },

  { id: "photo", group: "Media", label: "Photo", desc: "Upload a picture", icon: ImagePlus, keywords: "image picture photo upload", run: (_e, c) => c.pickPhoto() },
  { id: "video", group: "Media", label: "YouTube video", desc: "Paste a YouTube link", icon: SquarePlay, keywords: "video youtube tour", run: (_e, c) => c.openVideo() },
  { id: "map", group: "Media", label: "Map", desc: "Google map of an address", icon: MapPin, keywords: "map location address google", run: (_e, c) => c.openMap() },

  { id: "button", group: "Layout", label: "Button", desc: "Colorful clickable button", icon: MousePointerClick, keywords: "button cta link call action", run: (_e, c) => c.openButton() },
  { id: "box", group: "Layout", label: "Colored box", desc: "Text on a background color", icon: PaintBucket, keywords: "background color box section highlight", run: (e) => box(e, { bg: "#f4ecdf", emoji: "" }) },
  { id: "callout", group: "Layout", label: "Tip box", desc: "Colored box with an icon", icon: Lightbulb, keywords: "callout tip note info warning", run: (e) => box(e, { bg: "#e6f1fb", emoji: "💡" }) },
  { id: "table", group: "Layout", label: "Table", desc: "Rows and columns", icon: Table, keywords: "table grid compare prices", run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },

  { id: "btn-contact", group: "Quick buttons", label: "“Talk to Lara” button", desc: "Opens the contact form", icon: MessageSquare, keywords: "contact button lara", run: (_e, c) => c.openButton(BUTTON_PRESETS[0].attrs) },
  { id: "btn-value", group: "Quick buttons", label: "“Home value” button", desc: "Free home value report", icon: House, keywords: "valuation home value button", run: (_e, c) => c.openButton(BUTTON_PRESETS[1].attrs) },
  { id: "btn-call", group: "Quick buttons", label: "“Call Lara” button", desc: "Calls (619) 567-9584", icon: Phone, keywords: "call phone button", run: (_e, c) => c.openButton(BUTTON_PRESETS[2].attrs) },
];

export function filterBlocks(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return BLOCKS;
  return BLOCKS.filter((b) => `${b.label} ${b.keywords} ${b.desc}`.toLowerCase().includes(q));
}

/** The list of blocks, grouped. Used by "/", "+ Insert" and the drag handle "+". */
export function BlockMenu({
  items,
  active,
  onPick,
  onHover,
  compact,
}: {
  items: Block[];
  active: number;
  onPick: (b: Block) => void;
  onHover?: (i: number) => void;
  compact?: boolean;
}) {
  const list = useRef<HTMLDivElement>(null);
  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!items.length) return <p className="px-3 py-3 text-sm text-[var(--a-muted)]">No blocks match. Keep typing or press Esc.</p>;
  return (
    <div ref={list} className={`overflow-y-auto ${compact ? "max-h-[300px]" : "max-h-[380px]"}`} role="listbox" aria-label="Insert a block">
      {items.map((b, i) => {
        const header = i === 0 || items[i - 1].group !== b.group ? b.group : null;
        const Icon = b.icon;
        return (
          <div key={b.id}>
            {header && <p className="px-2.5 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--a-faint)]">{header}</p>}
            <button
              type="button"
              role="option"
              aria-selected={i === active}
              data-index={i}
              className="pop-item"
              data-active={i === active ? "true" : undefined}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onHover?.(i)}
              onClick={() => onPick(b)}
            >
              <span className="h-9 w-9 shrink-0 rounded-lg border border-[var(--a-line)] bg-white flex items-center justify-center text-[#33414e]">
                <Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block font-medium leading-tight">{b.label}</span>
                <span className="block text-xs text-[var(--a-muted)] font-normal truncate">{b.desc}</span>
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
