"use client";

import { useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Plus,
  Smile,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
} from "lucide-react";
import { FONT_OPTIONS, HIGHLIGHT_COLORS, SIZE_OPTIONS, TEXT_COLORS } from "@/lib/admin/fonts";
import { ColorPicker, Dropdown, TbButton, useDismiss } from "./ui";
import { BlockMenu, filterBlocks, type Block } from "./blocks";

const TOOLBAR_EMOJIS = ["😀", "😊", "😍", "🎉", "👏", "👍", "🙌", "❤️", "🏡", "🏠", "🔑", "📍", "🗺️", "💰", "📈", "📉", "📅", "⏰", "✅", "⭐", "✨", "🔥", "💡", "📌", "☀️", "🌅", "🌊", "🏖️", "🌳", "🌸", "🍷", "⛳", "🏊", "🐶", "🎓", "🚗", "☕", "🛒", "📞", "✉️"];

function InsertButton({ onPick }: { onPick: (b: Block) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useDismiss(open, () => setOpen(false));
  const items = filterBlocks("");
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="tb-btn gap-1.5 font-semibold text-[#0f4f99] bg-[#eaf3fc] hover:!bg-[#dcebfa]"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        title="Insert a photo, button, colored box, table, map… (or type / in the text)"
      >
        <Plus size={17} /> Insert
      </button>
      {open && (
        <div className="pop top-10 left-0 w-[290px]">
          <BlockMenu
            items={items}
            active={active}
            onHover={setActive}
            onPick={(b) => {
              setOpen(false);
              onPick(b);
            }}
          />
        </div>
      )}
    </div>
  );
}

function EmojiButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <TbButton label="Emoji" onClick={() => setOpen((o) => !o)}>
        <Smile size={17} />
      </TbButton>
      {open && (
        <div className="pop top-10 right-0 sm:left-0 sm:right-auto w-[284px] p-2 grid grid-cols-8 gap-0.5">
          {TOOLBAR_EMOJIS.map((em) => (
            <button
              key={em}
              type="button"
              className="h-8 w-8 rounded-md hover:bg-[var(--a-hover)] text-lg"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().insertContent(em).run();
                setOpen(false);
              }}
            >
              {em}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const STYLES = [
  { label: "Normal text", value: "p" },
  { label: "Big heading", value: "h2" },
  { label: "Small heading", value: "h3" },
  { label: "Quote", value: "quote" },
];

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
export const mod = isMac ? "⌘" : "Ctrl";

export function useFormatState(editor: Editor) {
  return useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      sup: e.isActive("superscript"),
      sub: e.isActive("subscript"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      style: e.isActive("heading", { level: 2 })
        ? "h2"
        : e.isActive("heading", { level: 3 })
          ? "h3"
          : e.isActive("blockquote")
            ? "quote"
            : "p",
      align: (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      font: (e.getAttributes("textStyle").fontFamily as string) || "",
      size: (e.getAttributes("textStyle").fontSize as string) || "",
      color: (e.getAttributes("textStyle").color as string) || "",
      highlight: (e.getAttributes("highlight").color as string) || "",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
}

export function setStyle(editor: Editor, v: string) {
  const c = editor.chain().focus();
  if (v === "h2" || v === "h3") c.setHeading({ level: v === "h2" ? 2 : 3 }).run();
  else if (v === "quote") c.setParagraph().setBlockquote().run();
  else c.setParagraph().unsetBlockquote().run();
}

export default function Toolbar({
  editor,
  onLink,
  onImage,
  onInsert,
}: {
  editor: Editor;
  onLink: () => void;
  onImage: () => void;
  onVideo?: () => void;
  onInsert: (b: Block) => void;
}) {
  const s = useFormatState(editor);
  const chain = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5" role="toolbar" aria-label="Formatting">
      <InsertButton onPick={onInsert} />
      <span className="tb-sep" />
      <TbButton label="Undo" shortcut={`${mod}+Z`} disabled={!s.canUndo} onClick={() => chain().undo().run()}>
        <Undo2 size={17} />
      </TbButton>
      <TbButton label="Redo" shortcut={`${mod}+Shift+Z`} disabled={!s.canRedo} onClick={() => chain().redo().run()}>
        <Redo2 size={17} />
      </TbButton>
      <span className="tb-sep" />

      <Dropdown label="Text style" value={s.style} options={STYLES} width={190} onChange={(v) => setStyle(editor, v)}
        renderOption={(o) => (
          <span className={o.value === "h2" ? "text-lg font-semibold" : o.value === "h3" ? "font-semibold" : o.value === "quote" ? "italic" : ""}>
            {o.label}
          </span>
        )}
      />
      <Dropdown
        label="Font"
        value={s.font}
        options={FONT_OPTIONS}
        width={190}
        onChange={(v) => (v ? chain().setFontFamily(v).run() : chain().unsetFontFamily().run())}
        renderOption={(o) => <span style={{ fontFamily: o.value || undefined }} className="text-[15px]">{o.label}</span>}
      />
      <Dropdown
        label="Text size"
        value={s.size}
        options={SIZE_OPTIONS}
        width={160}
        onChange={(v) => (v ? chain().setFontSize(v).run() : chain().unsetFontSize().run())}
      />
      <span className="tb-sep" />

      <TbButton label="Bold" shortcut={`${mod}+B`} active={s.bold} onClick={() => chain().toggleBold().run()}>
        <Bold size={17} />
      </TbButton>
      <TbButton label="Italic" shortcut={`${mod}+I`} active={s.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic size={17} />
      </TbButton>
      <TbButton label="Underline" shortcut={`${mod}+U`} active={s.underline} onClick={() => chain().toggleUnderline().run()}>
        <Underline size={17} />
      </TbButton>
      <TbButton label="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()}>
        <Strikethrough size={17} />
      </TbButton>
      <TbButton label="Superscript (e.g. 2nd)" active={s.sup} onClick={() => chain().toggleSuperscript().run()}>
        <Superscript size={17} />
      </TbButton>
      <TbButton label="Subscript" active={s.sub} onClick={() => chain().toggleSubscript().run()}>
        <Subscript size={17} />
      </TbButton>
      <ColorPicker
        label="Text color"
        icon={<Baseline size={17} />}
        colors={TEXT_COLORS}
        value={s.color}
        onChange={(v) => (v ? chain().setColor(v).run() : chain().unsetColor().run())}
      />
      <ColorPicker
        label="Highlight"
        icon={<Highlighter size={17} />}
        colors={HIGHLIGHT_COLORS}
        value={s.highlight}
        onChange={(v) => (v ? chain().setHighlight({ color: v }).run() : chain().unsetHighlight().run())}
      />
      <span className="tb-sep" />

      <TbButton label="Align left" active={s.align === "left"} onClick={() => chain().setTextAlign("left").run()}>
        <AlignLeft size={17} />
      </TbButton>
      <TbButton label="Center" active={s.align === "center"} onClick={() => chain().setTextAlign("center").run()}>
        <AlignCenter size={17} />
      </TbButton>
      <TbButton label="Align right" active={s.align === "right"} onClick={() => chain().setTextAlign("right").run()}>
        <AlignRight size={17} />
      </TbButton>
      <span className="tb-sep" />

      <TbButton label="Bullet list" active={s.bullet} onClick={() => chain().toggleBulletList().run()}>
        <List size={17} />
      </TbButton>
      <TbButton label="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered size={17} />
      </TbButton>
      <span className="tb-sep" />

      <TbButton label="Link" shortcut={`${mod}+K`} active={s.link} onClick={onLink}>
        <Link2 size={17} />
      </TbButton>
      <TbButton label="Add photo" onClick={onImage}>
        <ImagePlus size={17} />
      </TbButton>
      <EmojiButton editor={editor} />
      <TbButton label="Clear formatting" onClick={() => chain().unsetAllMarks().unsetTextAlign().run()}>
        <RemoveFormatting size={17} />
      </TbButton>
    </div>
  );
}
