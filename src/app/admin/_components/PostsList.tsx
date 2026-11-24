"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Eye, ImageIcon, MoreHorizontal, PenSquare, Pin, RotateCcw, Search, Trash2 } from "lucide-react";
import { alertDialog, confirmDialog } from "./DialogHost";
import { liveStatus, type Post, type PostStatus } from "@/lib/admin/post-types";
import { SITES } from "@/lib/admin/sites";

const TABS: { id: "all" | PostStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "scheduled", label: "Scheduled" },
  { id: "draft", label: "Drafts" },
];

export const STATUS_STYLE: Record<PostStatus, { label: string; cls: string }> = {
  published: { label: "Published", cls: "bg-[#e3f4ea] text-[#1d6b3f]" },
  scheduled: { label: "Scheduled", cls: "bg-[#e6effc] text-[#1f5aa6]" },
  draft: { label: "Draft", cls: "bg-[#eef0f2] text-[#55626e]" },
};

export function when(p: Post) {
  const s = liveStatus(p);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" };
  if (s === "draft") return `Edited ${new Date(p.updatedAt).toLocaleDateString("en-US", opts)}`;
  const d = new Date(p.publishAt!);
  if (s === "scheduled")
    return `Goes live ${d.toLocaleString("en-US", { ...opts, year: undefined, hour: "numeric", minute: "2-digit" })}`;
  return `Published ${d.toLocaleDateString("en-US", opts)}`;
}

type Trashed = Post & { deletedAt?: string | null };

export default function PostsList({
  initialPosts,
  initialTab,
  views = {},
  initialTrash = [],
}: {
  initialPosts: Post[];
  initialTab: string;
  views?: Record<string, number>;
  initialTrash?: Trashed[];
}) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [tab, setTab] = useState(TABS.some((t) => t.id === initialTab) || initialTab === "trash" ? initialTab : "all");
  const [trash, setTrash] = useState<Trashed[]>(initialTrash);
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: posts.length, published: 0, scheduled: 0, draft: 0 };
    for (const p of posts) c[liveStatus(p)]++;
    return c;
  }, [posts]);

  const shown = posts.filter(
    (p) => (tab === "all" || liveStatus(p) === tab) && (!q || `${p.title} ${p.excerpt} ${p.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
  );

  async function duplicate(p: Post) {
    setMenu(null);
    setBusy(p.id);
    const res = await fetch(`/api/admin/posts/${p.id}`, { method: "POST" });
    const data = await res.json();
    setBusy(null);
    if (res.ok) router.push(`/admin/posts/${data.post.id}`);
    else await alertDialog({ title: "Couldn't duplicate this post", message: data.error || "Please try again." });
  }

  async function remove(p: Post) {
    setMenu(null);
    const live = liveStatus(p) === "published";
    const ok = await confirmDialog({
      title: "Move this post to the trash?",
      message: (
        <>
          <p>
            <b className="text-[var(--a-text)]">“{p.title || "Untitled"}”</b>
            {live ? " will disappear from your websites right away." : " will be moved to the trash."}
          </p>
          <p>You can restore it from the Trash for 30 days.</p>
        </>
      ),
      confirmLabel: "Move to trash",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(p.id);
    const res = await fetch(`/api/admin/posts/${p.id}`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) {
      setPosts((ps) => ps.filter((x) => x.id !== p.id));
      setTrash((t) => [{ ...p, deletedAt: new Date().toISOString() }, ...t]);
    } else await alertDialog({ title: "Couldn't move it to the trash", message: "Please check your connection and try again." });
  }

  async function restore(p: Trashed) {
    setBusy(p.id);
    const res = await fetch(`/api/admin/posts/${p.id}/restore`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) return alertDialog({ title: "Couldn't restore this post", message: data.error || "Please try again." });
    setTrash((t) => t.filter((x) => x.id !== p.id));
    setPosts((ps) => [data.post, ...ps]);
  }

  async function deleteForever(p: Trashed) {
    const ok = await confirmDialog({
      title: "Delete forever?",
      message: (
        <>
          <p>
            <b className="text-[var(--a-text)]">“{p.title || "Untitled"}”</b> and its version history will be permanently deleted.
          </p>
          <p>This can&apos;t be undone.</p>
        </>
      ),
      confirmLabel: "Delete forever",
      tone: "danger",
    });
    if (!ok) return;
    setBusy(p.id);
    const res = await fetch(`/api/admin/posts/${p.id}?forever=1`, { method: "DELETE" });
    setBusy(null);
    if (res.ok) setTrash((t) => t.filter((x) => x.id !== p.id));
    else await alertDialog({ title: "Couldn't delete this post", message: "Please check your connection and try again." });
  }

  return (
    <div onClick={() => setMenu(null)}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Blog posts</h1>
          <p className="mt-1 text-[var(--a-muted)]">Write once, choose which websites show it.</p>
        </div>
        <Link href="/admin/posts/new" className="a-btn a-btn-accent">
          <PenSquare size={16} /> Write a post
        </Link>
      </header>

      <div className="mt-7 flex flex-wrap items-center gap-3 justify-between">
        <div className="inline-flex flex-wrap gap-1 rounded-xl bg-white border border-[var(--a-line)] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 h-8 text-sm font-medium ${
                tab === t.id ? "bg-[var(--a-navy)] text-white" : "text-[var(--a-muted)] hover:text-[var(--a-text)] hover:bg-[var(--a-hover)]"
              }`}
            >
              {t.label}
              <span className={`text-xs tabular-nums ${tab === t.id ? "text-white/70" : "text-[var(--a-faint)]"}`}>{counts[t.id]}</span>
            </button>
          ))}
          <button
            onClick={() => setTab("trash")}
            className={`flex items-center gap-2 rounded-lg px-3 h-8 text-sm font-medium ${
              tab === "trash" ? "bg-[var(--a-navy)] text-white" : "text-[var(--a-muted)] hover:text-[var(--a-text)] hover:bg-[var(--a-hover)]"
            }`}
          >
            <Trash2 size={14} /> Trash
            <span className={`text-xs tabular-nums ${tab === "trash" ? "text-white/70" : "text-[var(--a-faint)]"}`}>{trash.length}</span>
          </button>
        </div>
        <label className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--a-faint)]" />
          <input className="a-input pl-9 h-10" placeholder="Search posts" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>

      {tab === "trash" ? (
        <div className="a-card mt-4">
          {trash.length === 0 ? (
            <p className="py-14 text-center text-[var(--a-muted)]">The trash is empty.</p>
          ) : (
            <>
              <p className="px-4 sm:px-5 pt-4 text-sm text-[var(--a-muted)]">Posts here are off your websites. They&apos;re deleted for good after 30 days.</p>
              <ul className="divide-y divide-[var(--a-line)] mt-2">
                {trash.map((p) => (
                  <li key={p.id} className={`flex flex-wrap items-center gap-3 p-3 sm:p-4 ${busy === p.id ? "opacity-50" : ""}`}>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{p.title || "Untitled"}</p>
                      <p className="text-sm text-[var(--a-muted)]">
                        Moved to trash {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                      </p>
                    </div>
                    <button className="a-btn a-btn-ghost h-9" onClick={() => restore(p)}>
                      <RotateCcw size={15} /> Restore as draft
                    </button>
                    <button className="a-btn a-btn-danger h-9" onClick={() => deleteForever(p)}>
                      Delete forever
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : (
      <div className="a-card mt-4 overflow-visible">
        {shown.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <p className="font-medium">{posts.length ? "Nothing here." : "No posts yet."}</p>
            <p className="mt-1 text-sm text-[var(--a-muted)]">
              {posts.length ? "Try another tab or search." : "Your first post is one click away."}
            </p>
            {!posts.length && (
              <Link href="/admin/posts/new" className="a-btn a-btn-primary mt-5">
                <PenSquare size={16} /> Write your first post
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--a-line)]">
            {shown.map((p) => {
              const s = liveStatus(p);
              return (
                <li key={p.id} className={`relative flex items-center gap-4 p-3 sm:p-4 ${busy === p.id ? "opacity-50" : ""}`}>
                  <Link href={`/admin/posts/${p.id}`} className="shrink-0 h-16 w-24 sm:h-[72px] sm:w-[108px] rounded-lg overflow-hidden bg-[var(--a-hover)] flex items-center justify-center">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon size={22} className="text-[var(--a-faint)]" />
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/posts/${p.id}`} className="block font-semibold truncate hover:underline">
                      {p.title || <span className="text-[var(--a-faint)]">Untitled</span>}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[s].cls}`}>{STATUS_STYLE[s].label}</span>
                      <span className="text-[var(--a-muted)]">{when(p)}</span>
                      {s === "published" && (
                        <span className="inline-flex items-center gap-1 text-[var(--a-muted)]" title="Views on all sites, all time">
                          <Eye size={14} /> {(views[p.slug] ?? 0).toLocaleString("en-US")}
                        </span>
                      )}
                      {p.featured && (
                        <span className="inline-flex items-center gap-1 text-[#1f5aa6] text-xs font-semibold" title="Pinned to the top of the blog">
                          <Pin size={13} /> Pinned
                        </span>
                      )}
                      <span className="flex flex-wrap gap-1.5">
                        {p.sites.map((id) => (
                          <span key={id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--a-line)] px-2 py-0.5 text-xs text-[var(--a-muted)]">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: SITES[id].color }} />
                            {SITES[id].short}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                  <Link href={`/admin/posts/${p.id}`} className="a-btn a-btn-ghost hidden sm:inline-flex h-9">
                    Edit
                  </Link>
                  <div className="relative">
                    <button
                      className="tb-btn"
                      aria-label="More actions"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenu(menu === p.id ? null : p.id);
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menu === p.id && (
                      <div className="pop right-0 top-10 w-52" onClick={(e) => e.stopPropagation()}>
                        <Link className="pop-item sm:hidden" href={`/admin/posts/${p.id}`}>
                          <PenSquare size={16} /> Edit
                        </Link>
                        {s === "published" &&
                          p.sites.map((id) => (
                            <a key={id} className="pop-item" href={SITES[id].postUrl(p.slug)} target="_blank" rel="noreferrer">
                              <ExternalLink size={16} /> View on {SITES[id].short}
                            </a>
                          ))}
                        <button className="pop-item" onClick={() => duplicate(p)}>
                          <Copy size={16} /> Duplicate
                        </button>
                        <button className="pop-item text-[var(--a-bad)]" onClick={() => remove(p)}>
                          <Trash2 size={16} /> Move to trash
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      )}
    </div>
  );
}
