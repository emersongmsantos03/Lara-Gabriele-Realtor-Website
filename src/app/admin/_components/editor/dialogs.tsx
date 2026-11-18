"use client";

import { useMemo, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, ExternalLink, FileText, Link2 } from "lucide-react";
import { BUTTON_DEFAULTS, buttonStyle, type ButtonAttrs } from "./extensions";
import { BUTTON_PRESETS, QUICK_LINKS } from "./blocks";
import { Modal } from "./ui";

export type LinkTarget = { title: string; url: string };

export const BRAND_COLORS = [
  { label: "Sunset orange", value: "#c9671f" },
  { label: "Navy", value: "#0e2b40" },
  { label: "Sea teal", value: "#1b8a99" },
  { label: "Green", value: "#2f7d4f" },
  { label: "Red", value: "#b8452f" },
  { label: "Purple", value: "#6b4fa0" },
  { label: "Gold", value: "#b8892b" },
  { label: "Black", value: "#15212c" },
];

export function normalizeUrl(u: string) {
  const v = u.trim();
  if (!v) return v;
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(v)) return v;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  if (/^\+?[\d\s().-]{7,}$/.test(v)) return `tel:${v.replace(/[^\d+]/g, "")}`;
  return `https://${v}`;
}

const isExternal = (href: string) => /^https?:/i.test(href) && !/pacificfriendlyrealty\.com|santafehillssd\.com|lomasverdesestates\.com/i.test(href);

/** Search box that suggests Lara's pages and other posts while you type. */
function LinkField({ value, onChange, posts }: { value: string; onChange: (v: string) => void; posts: LinkTarget[] }) {
  const [focused, setFocused] = useState(false);
  const q = value.toLowerCase();
  const sugg = useMemo(() => {
    const quick = QUICK_LINKS.map((l) => ({ title: l.label, url: l.href, kind: "page" as const }));
    const ps = posts.map((p) => ({ title: p.title, url: p.url, kind: "post" as const }));
    const all = [...quick, ...ps];
    return (q && !/^(https?:|mailto:|tel:)/.test(q) ? all.filter((s) => s.title.toLowerCase().includes(q)) : all).slice(0, 8);
  }, [q, posts]);
  return (
    <div className="relative">
      <input
        className="a-input"
        placeholder="Paste a link, or type to search pages & posts"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoFocus
      />
      {focused && sugg.length > 0 && (
        <div className="pop left-0 right-0 top-[46px] max-h-[260px] overflow-y-auto">
          {sugg.map((s) => (
            <button key={s.url} type="button" className="pop-item" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange(s.url); setFocused(false); }}>
              {s.kind === "post" ? <FileText size={15} className="shrink-0 text-[var(--a-muted)]" /> : <Link2 size={15} className="shrink-0 text-[var(--a-muted)]" />}
              <span className="min-w-0">
                <span className="block truncate">{s.title}</span>
                <span className="block truncate text-xs text-[var(--a-faint)]">{s.url.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LinkDialog({
  initial,
  needsText,
  posts,
  onSave,
  onRemove,
  onClose,
}: {
  initial: { href: string; newTab: boolean };
  needsText: boolean;
  posts: LinkTarget[];
  onSave: (v: { href: string; newTab: boolean; text: string }) => void;
  onRemove?: () => void;
  onClose: () => void;
}) {
  const [href, setHref] = useState(initial.href);
  const [text, setText] = useState("");
  const [newTab, setNewTab] = useState(initial.newTab);
  const [touchedTab, setTouchedTab] = useState(Boolean(initial.href));
  const url = normalizeUrl(href);
  const tab = touchedTab ? newTab : isExternal(url);

  return (
    <Modal title={initial.href ? "Edit link" : "Add a link"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!url) return;
          onSave({ href: url, newTab: tab, text: text.trim() });
          onClose();
        }}
      >
        <label className="block text-sm font-medium mb-1.5">Where should it go?</label>
        <LinkField value={href} onChange={setHref} posts={posts} />
        {needsText && (
          <label className="block mt-4">
            <span className="text-sm font-medium">Text to show</span>
            <input className="a-input mt-1.5" placeholder="e.g. See the listing" value={text} onChange={(e) => setText(e.target.value)} />
          </label>
        )}
        <label className="mt-4 flex items-center gap-2.5 text-sm cursor-pointer">
          <input type="checkbox" className="h-4 w-4 accent-[#2a78d6]" checked={tab} onChange={(e) => { setTouchedTab(true); setNewTab(e.target.checked); }} />
          Open in a new tab
          <span className="text-[var(--a-faint)]">(good for other websites)</span>
        </label>
        <div className="mt-6 flex gap-2 justify-end">
          {onRemove && (
            <button type="button" className="a-btn a-btn-danger mr-auto" onClick={() => { onRemove(); onClose(); }}>
              Remove link
            </button>
          )}
          <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="a-btn a-btn-primary" disabled={!url}>{initial.href ? "Save" : "Add link"}</button>
        </div>
      </form>
    </Modal>
  );
}

function Choice<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: React.ReactNode; title?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-[var(--a-line)] p-0.5 bg-white">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`px-3 h-8 rounded-md text-sm font-medium flex items-center gap-1.5 ${value === o.value ? "bg-[var(--a-navy)] text-white" : "text-[var(--a-muted)] hover:bg-[var(--a-hover)]"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ColorSwatches({ value, onChange, colors = BRAND_COLORS }: { value: string; onChange: (v: string) => void; colors?: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {colors.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          aria-label={c.label}
          onClick={() => onChange(c.value)}
          className={`h-8 w-8 rounded-full border border-black/10 ${value.toLowerCase() === c.value ? "ring-2 ring-offset-2 ring-[#2a78d6]" : ""}`}
          style={{ background: c.value }}
        />
      ))}
      <label className="relative h-8 w-8 rounded-full border border-dashed border-[#b9c3cc] flex items-center justify-center cursor-pointer text-[var(--a-muted)] text-lg" title="Any color">
        +
        <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Pick any color" />
      </label>
    </div>
  );
}

const SIZE_CLS = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-[15px]", lg: "px-8 py-4 text-lg" };
const SHAPE_CLS = { pill: "rounded-full", rounded: "rounded-lg", square: "rounded-none" };

export function ButtonDialog({
  initial,
  posts,
  onSave,
  onClose,
}: {
  initial: Partial<ButtonAttrs>;
  posts: LinkTarget[];
  onSave: (a: ButtonAttrs) => void;
  onClose: () => void;
}) {
  const [a, setA] = useState<ButtonAttrs>({ ...BUTTON_DEFAULTS, ...initial });
  const set = (p: Partial<ButtonAttrs>) => setA((x) => ({ ...x, ...p }));
  const editing = Boolean(initial.href);

  return (
    <Modal title={editing ? "Edit button" : "Add a button"} onClose={onClose} wide>
      {!editing && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="text-xs text-[var(--a-muted)] self-center mr-1">Quick start:</span>
          {BUTTON_PRESETS.map((p) => (
            <button key={p.label} type="button" className="rounded-full border border-[var(--a-line)] px-3 h-7 text-xs font-medium hover:bg-[var(--a-hover)]" onClick={() => set(p.attrs)}>
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Live preview */}
      <div className="rounded-xl bg-[var(--a-bg)] border border-[var(--a-line)] px-5 py-7" style={{ textAlign: a.align }}>
        <span
          className={`inline-block font-semibold border-2 ${SIZE_CLS[a.size]} ${SHAPE_CLS[a.shape]} ${a.full ? "w-full text-center" : ""}`}
          style={Object.fromEntries(buttonStyle(a).split(";").map((d) => d.split(":")).map(([k, v]) => [k.replace(/-([a-z])/g, (_, c) => c.toUpperCase()), v]))}
        >
          {a.text || "Button"}
        </span>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-medium">Button text</span>
          <input className="a-input mt-1.5" value={a.text} maxLength={60} onChange={(e) => set({ text: e.target.value })} />
        </label>
        <div>
          <span className="block text-sm font-medium mb-1.5">Link</span>
          <LinkField value={a.href} onChange={(href) => set({ href })} posts={posts} />
        </div>
        <div>
          <span className="block text-sm font-medium mb-2">Color</span>
          <ColorSwatches value={a.color} onChange={(color) => set({ color })} />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-4">
          <div>
            <span className="block text-sm font-medium mb-1.5">Style</span>
            <Choice value={a.variant} onChange={(variant) => set({ variant })} options={[{ value: "filled", label: "Filled" }, { value: "outline", label: "Outline" }]} />
          </div>
          <div>
            <span className="block text-sm font-medium mb-1.5">Shape</span>
            <Choice value={a.shape} onChange={(shape) => set({ shape })} options={[{ value: "pill", label: "Round" }, { value: "rounded", label: "Soft" }, { value: "square", label: "Square" }]} />
          </div>
          <div>
            <span className="block text-sm font-medium mb-1.5">Size</span>
            <Choice value={a.size} onChange={(size) => set({ size })} options={[{ value: "sm", label: "S" }, { value: "md", label: "M" }, { value: "lg", label: "L" }]} />
          </div>
          <div>
            <span className="block text-sm font-medium mb-1.5">Position</span>
            <Choice
              value={a.align}
              onChange={(align) => set({ align })}
              options={[
                { value: "left", label: <AlignLeft size={15} />, title: "Left" },
                { value: "center", label: <AlignCenter size={15} />, title: "Center" },
                { value: "right", label: <AlignRight size={15} />, title: "Right" },
              ]}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-[#2a78d6]" checked={a.full} onChange={(e) => set({ full: e.target.checked })} />
            Full width
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 accent-[#2a78d6]" checked={a.newTab} onChange={(e) => set({ newTab: e.target.checked })} />
            Open in a new tab <ExternalLink size={13} className="text-[var(--a-faint)]" />
          </label>
        </div>
      </div>

      <div className="mt-6 flex gap-2 justify-end">
        <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>Cancel</button>
        <button
          type="button"
          className="a-btn a-btn-primary"
          disabled={!a.text.trim() || !a.href.trim()}
          onClick={() => {
            onSave({ ...a, text: a.text.trim(), href: normalizeUrl(a.href) });
            onClose();
          }}
        >
          {editing ? "Save button" : "Add button"}
        </button>
      </div>
    </Modal>
  );
}
