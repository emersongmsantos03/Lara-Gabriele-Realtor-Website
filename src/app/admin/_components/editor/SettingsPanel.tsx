"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Eye, MousePointerClick, Pin, Share2, X, BookOpenCheck } from "lucide-react";
import type { Post } from "@/lib/admin/post-types";
import { SITES, type SiteId } from "@/lib/admin/sites";
import { SitePicker } from "./PublishDialog";

export type Form = {
  title: string;
  excerpt: string;
  slug: string;
  coverImage: string;
  coverAlt: string;
  contentHtml: string;
  sites: SiteId[];
  tags: string[];
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
};

function Section({ title, hint, children, collapsible }: { title: string; hint?: string; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <section className="mt-6 first:mt-0 border-t border-[var(--a-line)] pt-5 first:border-0 first:pt-0">
      {collapsible ? (
        <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-sm font-semibold">
          {title}
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <h3 className="text-sm font-semibold">{title}</h3>
      )}
      {open && (
        <>
          {hint && <p className="mt-0.5 text-xs text-[var(--a-muted)]">{hint}</p>}
          <div className="mt-2.5">{children}</div>
        </>
      )}
    </section>
  );
}

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`text-xs tabular-nums ${n > max ? "text-[var(--a-bad)]" : "text-[var(--a-faint)]"}`}>{n}/{max}</span>;
}

function TagInput({ value, onChange, suggestions }: { value: string[]; onChange: (v: string[]) => void; suggestions: string[] }) {
  const [text, setText] = useState("");
  const add = (t: string) => {
    const tag = t.trim().replace(/\s+/g, " ").slice(0, 30);
    if (tag && !value.some((v) => v.toLowerCase() === tag.toLowerCase()) && value.length < 8) onChange([...value, tag]);
    setText("");
  };
  const options = suggestions.filter((s) => !value.includes(s) && (!text || s.toLowerCase().includes(text.toLowerCase()))).slice(0, 6);
  const defaults = ["Market update", "New listing", "Open house", "Buying", "Selling", "Neighborhood guide", "Local events"];
  const extra = defaults.filter((d) => !value.includes(d) && !options.includes(d) && (!text || d.toLowerCase().includes(text.toLowerCase())));
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-[10px] border border-[var(--a-line)] p-1.5 focus-within:border-[#6aa3d8]">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#eaf3fc] text-[#1f5aa6] text-sm pl-2.5 pr-1 h-7">
            {t}
            <button type="button" aria-label={`Remove ${t}`} className="h-5 w-5 rounded-full hover:bg-white/70 flex items-center justify-center" onClick={() => onChange(value.filter((v) => v !== t))}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          className="flex-1 min-w-[90px] h-7 px-1.5 outline-none text-sm bg-transparent"
          placeholder={value.length ? "Add another" : "e.g. Market update"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(text);
            } else if (e.key === "Backspace" && !text && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => text && add(text)}
        />
      </div>
      {[...options, ...extra].length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[...options, ...extra].slice(0, 7).map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed border-[#c3cbd3] px-2.5 h-6 text-xs text-[var(--a-muted)] hover:border-[#2a78d6] hover:text-[#1f5aa6]">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type PostStats = { views: number; reads: number; clicks: number; shares: number; bySite: Partial<Record<SiteId, number>> };

function Performance({ slug }: { slug: string }) {
  const [s, setS] = useState<PostStats | null>(null);
  useEffect(() => {
    fetch(`/api/admin/blog-stats?slug=${encodeURIComponent(slug)}&days=90`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setS(d?.post ?? null))
      .catch(() => {});
  }, [slug]);
  if (!s) return <p className="text-xs text-[var(--a-faint)]">Loading…</p>;
  const tiles = [
    { icon: Eye, label: "Views", n: s.views },
    { icon: BookOpenCheck, label: "Read to the end", n: s.reads },
    { icon: MousePointerClick, label: "Button & link clicks", n: s.clicks },
    { icon: Share2, label: "Shares", n: s.shares },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {tiles.map(({ icon: Icon, label, n }) => (
          <div key={label} className="rounded-xl bg-[var(--a-bg)] p-3">
            <Icon size={15} className="text-[var(--a-muted)]" />
            <p className="mt-1 text-xl font-semibold tabular-nums">{n.toLocaleString("en-US")}</p>
            <p className="text-[11px] text-[var(--a-muted)] leading-tight">{label}</p>
          </div>
        ))}
      </div>
      {Object.keys(s.bySite).length > 1 && (
        <ul className="mt-2 space-y-0.5 text-xs text-[var(--a-muted)]">
          {(Object.entries(s.bySite) as [SiteId, number][]).map(([id, n]) => (
            <li key={id} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: SITES[id].color }} /> {SITES[id].short}: {n} views
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-[var(--a-faint)]">Last 90 days</p>
    </div>
  );
}

export default function SettingsPanel({
  form,
  setForm,
  post,
  isLive,
  slugValue,
  onSlugChange,
  onSlugBlur,
  effectiveSlug,
  allTags,
  words,
  plainText,
  onClose,
}: {
  form: Form;
  setForm: (fn: (f: Form) => Form) => void;
  post: Post | null;
  isLive: boolean;
  slugValue: string;
  onSlugChange: (v: string) => void;
  onSlugBlur: () => void;
  effectiveSlug: string;
  allTags: string[];
  words: number;
  plainText: string;
  onClose: () => void;
}) {
  const seoTitle = form.seoTitle || form.title;
  const seoDesc = form.seoDescription || form.excerpt || plainText.slice(0, 160);
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between xl:hidden mb-4">
        <h2 className="text-lg font-semibold">Post settings</h2>
        <button className="tb-btn" onClick={onClose} aria-label="Close settings">
          <X size={18} />
        </button>
      </div>

      {isLive && post && (
        <Section title="How it's doing">
          <Performance slug={post.slug} />
        </Section>
      )}

      <Section title="Show this post on">
        <SitePicker value={form.sites} onChange={(sites) => setForm((f) => ({ ...f, sites }))} />
        {isLive && post && (
          <div className="mt-3 space-y-1">
            {post.sites.map((id) => (
              <a key={id} href={SITES[id].postUrl(post.slug)} target="_blank" rel="noreferrer" className="block text-sm text-[#1f5aa6] hover:underline truncate">
                View on {SITES[id].domain} ↗
              </a>
            ))}
          </div>
        )}
      </Section>

      <Section title="Topics" hint="Group posts so readers can find more like this.">
        <TagInput value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} suggestions={allTags} />
      </Section>

      <Section title="Pin to the top">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
          <span className="flex items-center gap-2 text-sm">
            <Pin size={15} className="text-[var(--a-muted)]" /> Feature this post first on the blog
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={form.featured}
            onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
            className={`relative h-6 w-11 rounded-full transition-colors ${form.featured ? "bg-[#2a78d6]" : "bg-[#cfd6dd]"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${form.featured ? "left-[22px]" : "left-0.5"}`} />
          </button>
        </label>
      </Section>

      <Section title="Summary" hint="A sentence or two for blog cards. Leave it empty and we'll use your first lines.">
        <textarea className="a-input" rows={3} maxLength={300} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} placeholder="What is this post about?" />
      </Section>

      <Section title="Web address" hint={isLive ? "Changing this breaks links people already shared." : "Made from the title automatically. You can change it."}>
        <div className="flex items-center rounded-[10px] border border-[var(--a-line)] focus-within:border-[#6aa3d8] focus-within:shadow-[0_0_0_3px_rgba(42,120,214,0.15)]">
          <span className="pl-3 text-sm text-[var(--a-faint)] whitespace-nowrap">/blog/</span>
          <input className="flex-1 min-w-0 h-[42px] pr-3 bg-transparent outline-none text-[15px]" value={slugValue} onChange={(e) => onSlugChange(e.target.value)} onBlur={onSlugBlur} aria-label="Web address" />
        </div>
      </Section>

      {form.coverImage && (
        <Section title="Cover photo description" hint="Helps Google and screen readers.">
          <input className="a-input" value={form.coverAlt} onChange={(e) => setForm((f) => ({ ...f, coverAlt: e.target.value }))} placeholder="e.g. Aerial view of Santa Fe Hills" />
        </Section>
      )}

      <Section title="Google & social sharing (SEO)" collapsible hint="Optional. How the post looks in Google results and when shared on Facebook.">
        <label className="block">
          <span className="flex justify-between text-xs font-medium text-[var(--a-muted)]">
            Title for Google <Counter n={seoTitle.length} max={60} />
          </span>
          <input className="a-input mt-1" value={form.seoTitle} placeholder={form.title || "Same as the post title"} onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))} maxLength={120} />
        </label>
        <label className="block mt-3">
          <span className="flex justify-between text-xs font-medium text-[var(--a-muted)]">
            Description for Google <Counter n={seoDesc.length} max={160} />
          </span>
          <textarea className="a-input mt-1" rows={3} value={form.seoDescription} placeholder={form.excerpt || "Same as the summary"} onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))} maxLength={320} />
        </label>
        <div className="mt-3 rounded-xl border border-[var(--a-line)] p-3.5">
          <p className="text-xs text-[#4d5156] truncate">
            {SITES[form.sites[0] ?? "pacific"].domain} › blog › {effectiveSlug}
          </p>
          <p className="mt-0.5 text-[#1a0dab] text-[17px] leading-snug line-clamp-2">{seoTitle || "Your post title"}</p>
          <p className="mt-1 text-[13px] text-[#4d5156] line-clamp-2">{seoDesc || "Your summary will show here."}</p>
        </div>
      </Section>

      <p className="mt-6 text-xs text-[var(--a-faint)]">
        {words.toLocaleString("en-US")} words · {Math.max(1, Math.round(words / 220))} min read
        {post ? ` · Last edited by ${post.updatedBy}` : ""}
      </p>
    </div>
  );
}
