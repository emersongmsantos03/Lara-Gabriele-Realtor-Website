"use client";

import { useState } from "react";
import { findParentNode, useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { NodeSelection } from "@tiptap/pm/state";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUpToLine,
  Bold,
  Captions,
  ExternalLink,
  Heading2,
  Italic,
  Link2,
  PaintBucket,
  PanelLeft,
  PanelRight,
  Pencil,
  Quote,
  Replace,
  Rows3,
  Columns3,
  Smile,
  Trash2,
  Type,
  Underline,
  Unlink,
} from "lucide-react";
import { setStyle, useFormatState } from "./Toolbar";
import { TbButton, useDismiss } from "./ui";

const SIZES = [
  { value: "small", label: "S", title: "Small" },
  { value: "medium", label: "M", title: "Medium" },
  { value: "large", label: "L", title: "Large" },
  { value: "full", label: "Full", title: "Full width" },
];

export const BOX_COLORS = [
  { label: "Sand", value: "#f4ecdf" },
  { label: "Sky", value: "#e6f1fb" },
  { label: "Mint", value: "#e3f4ea" },
  { label: "Peach", value: "#fde8da" },
  { label: "Lavender", value: "#eeeafa" },
  { label: "Gray", value: "#eef1f4" },
  { label: "Navy", value: "#0e2b40" },
  { label: "Teal", value: "#1b8a99" },
  { label: "Orange", value: "#c9671f" },
];

export const CELL_COLORS = [
  { label: "None", value: "" },
  { label: "Sand", value: "#f4ecdf" },
  { label: "Sky", value: "#e6f1fb" },
  { label: "Mint", value: "#e3f4ea" },
  { label: "Peach", value: "#fde8da" },
  { label: "Yellow", value: "#fff3a3" },
  { label: "Gray", value: "#eef1f4" },
];

export const EMOJIS = ["", "💡", "⭐", "✅", "⚠️", "📌", "🏡", "🔑", "📍", "💰", "📈", "📅", "🎉", "❤️", "☀️", "🌳"];

function selectedNode(editor: Editor) {
  const sel = editor.state.selection;
  return sel instanceof NodeSelection ? sel.node : null;
}

/** Menu over selected text. */
export function TextBubble({ editor, onLink }: { editor: Editor; onLink: () => void }) {
  const s = useFormatState(editor);
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e, from, to }) => from !== to && !selectedNode(e) && e.isEditable && !e.isActive("table")}
      options={{ placement: "top" }}
    >
      <div className="bubble">
        <TbButton label="Bold" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </TbButton>
        <TbButton label="Italic" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </TbButton>
        <TbButton label="Underline" active={s.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline size={16} />
        </TbButton>
        <TbButton label="Link" active={s.link} onClick={onLink}>
          <Link2 size={16} />
        </TbButton>
        <span className="tb-sep" />
        <TbButton label="Heading" active={s.style === "h2"} onClick={() => setStyle(editor, s.style === "h2" ? "p" : "h2")}>
          <Heading2 size={16} />
        </TbButton>
        <TbButton label="Quote" active={s.style === "quote"} onClick={() => setStyle(editor, s.style === "quote" ? "p" : "quote")}>
          <Quote size={16} />
        </TbButton>
      </div>
    </BubbleMenu>
  );
}

/** Shows where a link goes when the cursor is on it. */
export function LinkBubble({ editor, onEdit }: { editor: Editor; onEdit: () => void }) {
  const href = useEditorState({ editor, selector: ({ editor: e }) => (e.isActive("link") ? (e.getAttributes("link").href as string) : "") });
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="linkBubble"
      shouldShow={({ editor: e, from, to }) => from === to && e.isActive("link")}
      options={{ placement: "bottom" }}
    >
      <div className="bubble">
        <a href={href} target="_blank" rel="noreferrer" className="px-2 text-sm text-[#9fd0ff] underline max-w-[240px] truncate" title={href}>
          {href.replace(/^https?:\/\/(www\.)?/, "").replace(/^mailto:|^tel:/, "")}
        </a>
        <span className="tb-sep" />
        <TbButton label="Open link" onClick={() => window.open(href, "_blank", "noopener")}>
          <ExternalLink size={15} />
        </TbButton>
        <TbButton label="Edit link" onClick={onEdit}>
          <Pencil size={15} />
        </TbButton>
        <TbButton label="Remove link" onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}>
          <Unlink size={15} />
        </TbButton>
      </div>
    </BubbleMenu>
  );
}

function Swatches({ colors, value, onPick, round = true }: { colors: { label: string; value: string }[]; value: string; onPick: (v: string) => void; round?: boolean }) {
  return (
    <div className="flex items-center gap-1 px-1">
      {colors.map((c) => (
        <button
          key={c.label}
          type="button"
          title={c.label}
          aria-label={c.label}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(c.value)}
          className={`h-6 w-6 ${round ? "rounded-full" : "rounded-md"} border border-white/25 ${(value || "") === c.value ? "ring-2 ring-white ring-offset-1 ring-offset-[#15212c]" : ""}`}
          style={{ background: c.value || "transparent" }}
        />
      ))}
    </div>
  );
}

function EmojiChoice({ value, onPick }: { value: string; onPick: (e: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <TbButton label="Icon" active={!!value} onClick={() => setOpen((o) => !o)}>
        {value ? <span className="text-base leading-none">{value}</span> : <Smile size={16} />}
      </TbButton>
      {open && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-50 grid grid-cols-8 gap-1 rounded-xl bg-white p-2 shadow-xl border border-[var(--a-line)] w-[296px]">
          {EMOJIS.map((em) => (
            <button
              key={em || "none"}
              type="button"
              className="h-8 w-8 rounded-md hover:bg-[var(--a-hover)] text-lg flex items-center justify-center text-[var(--a-muted)]"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onPick(em);
                setOpen(false);
              }}
              title={em ? em : "No icon"}
            >
              {em || "∅"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Colors and icon for the colored box the cursor is in. */
export function CalloutBubble({ editor }: { editor: Editor }) {
  const box = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const p = findParentNode((n) => n.type.name === "callout")(e.state.selection);
      return p ? { bg: p.node.attrs.bg as string, emoji: p.node.attrs.emoji as string } : null;
    },
  });
  const update = (attrs: Record<string, string>) => editor.chain().focus().updateAttributes("callout", attrs).run();
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="calloutBubble"
      shouldShow={({ editor: e, from, to }) => from === to && e.isActive("callout") && !e.isActive("link") && !e.isActive("table")}
      getReferencedVirtualElement={() => {
        const p = findParentNode((n) => n.type.name === "callout")(editor.state.selection);
        const dom = p ? (editor.view.nodeDOM(p.pos) as HTMLElement | null) : null;
        return dom ? { getBoundingClientRect: () => dom.getBoundingClientRect() } : null;
      }}
      options={{ placement: "top-start" }}
    >
      <div className="bubble">
        <PaintBucket size={15} className="mx-1.5 text-white/60" />
        <Swatches colors={BOX_COLORS} value={box?.bg ?? ""} onPick={(bg) => update({ bg })} />
        <label className="relative h-6 w-6 rounded-full border border-dashed border-white/40 flex items-center justify-center text-white/70 text-sm cursor-pointer" title="Any color">
          +
          <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={box?.bg ?? "#f4ecdf"} onChange={(e) => update({ bg: e.target.value })} />
        </label>
        <span className="tb-sep" />
        <EmojiChoice value={box?.emoji ?? ""} onPick={(emoji) => update({ emoji })} />
        <TbButton label="Remove box (keep the text)" onClick={() => editor.chain().focus().lift("callout").run()}>
          <Trash2 size={15} />
        </TbButton>
      </div>
    </BubbleMenu>
  );
}

/** Row/column tools when the cursor is inside a table. */
export function TableBubble({ editor }: { editor: Editor }) {
  const cell = useEditorState({
    editor,
    selector: ({ editor: e }) => ((e.getAttributes("tableCell").backgroundColor || e.getAttributes("tableHeader").backgroundColor || "") as string),
  });
  const c = () => editor.chain().focus();
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableBubble"
      shouldShow={({ editor: e }) => e.isActive("table")}
      getReferencedVirtualElement={() => {
        const p = findParentNode((n) => n.type.name === "table")(editor.state.selection);
        const dom = p ? (editor.view.nodeDOM(p.pos) as HTMLElement | null) : null;
        return dom ? { getBoundingClientRect: () => dom.getBoundingClientRect() } : null;
      }}
      options={{ placement: "top-start" }}
    >
      <div className="bubble flex-wrap max-w-[92vw]">
        <TbButton label="Add row above" onClick={() => c().addRowBefore().run()}>
          <ArrowUpToLine size={15} />
        </TbButton>
        <TbButton label="Add row below" onClick={() => c().addRowAfter().run()}>
          <ArrowDownToLine size={15} />
        </TbButton>
        <TbButton label="Delete row" onClick={() => c().deleteRow().run()}>
          <Rows3 size={15} className="text-[#ffb4a8]" />
        </TbButton>
        <span className="tb-sep" />
        <TbButton label="Add column left" onClick={() => c().addColumnBefore().run()}>
          <ArrowLeftToLine size={15} />
        </TbButton>
        <TbButton label="Add column right" onClick={() => c().addColumnAfter().run()}>
          <ArrowRightToLine size={15} />
        </TbButton>
        <TbButton label="Delete column" onClick={() => c().deleteColumn().run()}>
          <Columns3 size={15} className="text-[#ffb4a8]" />
        </TbButton>
        <span className="tb-sep" />
        <TbButton label="Header row on/off" onClick={() => c().toggleHeaderRow().run()}>
          <span className="text-xs font-bold">H</span>
        </TbButton>
        <Swatches colors={CELL_COLORS} value={cell} round={false} onPick={(v) => c().setCellAttribute("backgroundColor", v || null).run()} />
        <span className="tb-sep" />
        <TbButton label="Delete table" onClick={() => c().deleteTable().run()}>
          <Trash2 size={15} />
        </TbButton>
      </div>
    </BubbleMenu>
  );
}

/** Menu when a photo, video, button or map is clicked. */
export function MediaBubble({
  editor,
  onReplace,
  onAlt,
  onCaption,
  onEditButton,
  onEditMap,
}: {
  editor: Editor;
  onReplace: () => void;
  onAlt: () => void;
  onCaption: () => void;
  onEditButton: () => void;
  onEditMap: () => void;
}) {
  const n = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const node = selectedNode(e);
      return node ? { type: node.type.name, attrs: node.attrs as Record<string, string> } : null;
    },
  });
  const set = (type: string, attrs: Record<string, string>) => editor.chain().focus().updateAttributes(type, attrs).run();

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="mediaBubble"
      shouldShow={({ editor: e }) => {
        const node = selectedNode(e);
        return !!node && ["image", "youtube", "ctaButton", "mapEmbed"].includes(node.type.name);
      }}
      options={{ placement: "top" }}
    >
      <div className="bubble">
        {n?.type === "image" && (
          <>
            {SIZES.map((sz) => (
              <TbButton key={sz.value} label={`${sz.title} size`} active={n.attrs.size === sz.value} onClick={() => set("image", { size: sz.value, ...(sz.value === "full" ? { align: "center" } : {}) })}>
                <span className="text-xs font-semibold">{sz.label}</span>
              </TbButton>
            ))}
            <span className="tb-sep" />
            <TbButton label="Left, text wraps around" active={n.attrs.align === "left"} disabled={n.attrs.size === "full"} onClick={() => set("image", { align: "left" })}>
              <PanelLeft size={16} />
            </TbButton>
            <TbButton label="Center" active={n.attrs.align === "center"} onClick={() => set("image", { align: "center" })}>
              <AlignCenter size={16} />
            </TbButton>
            <TbButton label="Right, text wraps around" active={n.attrs.align === "right"} disabled={n.attrs.size === "full"} onClick={() => set("image", { align: "right" })}>
              <PanelRight size={16} />
            </TbButton>
            <span className="tb-sep" />
            <TbButton label={n.attrs.caption ? "Edit caption" : "Add a caption under the photo"} active={!!n.attrs.caption} onClick={onCaption}>
              <Captions size={16} />
            </TbButton>
            <TbButton label={n.attrs.alt ? "Edit photo description" : "Describe this photo (helps Google & blind readers)"} active={!!n.attrs.alt} onClick={onAlt}>
              <Type size={16} />
            </TbButton>
            <TbButton label="Replace photo" onClick={onReplace}>
              <Replace size={16} />
            </TbButton>
          </>
        )}
        {n?.type === "ctaButton" && (
          <>
            <button type="button" className="tb-btn gap-1.5 text-sm font-medium" onMouseDown={(e) => e.preventDefault()} onClick={onEditButton}>
              <Pencil size={15} /> Edit button
            </button>
            <span className="tb-sep" />
            {(["left", "center", "right"] as const).map((al) => (
              <TbButton key={al} label={`Align ${al}`} active={n.attrs.align === al} onClick={() => set("ctaButton", { align: al })}>
                {al === "left" ? <AlignLeft size={16} /> : al === "center" ? <AlignCenter size={16} /> : <AlignRight size={16} />}
              </TbButton>
            ))}
          </>
        )}
        {n?.type === "mapEmbed" && (
          <button type="button" className="tb-btn gap-1.5 text-sm font-medium" onMouseDown={(e) => e.preventDefault()} onClick={onEditMap}>
            <Pencil size={15} /> Change address
          </button>
        )}
        <span className="tb-sep" />
        <TbButton label="Delete" onClick={() => editor.chain().focus().deleteSelection().run()}>
          <Trash2 size={16} />
        </TbButton>
      </div>
    </BubbleMenu>
  );
}
