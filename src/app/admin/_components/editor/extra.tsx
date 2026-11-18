"use client";

import { useEffect, useState } from "react";
import { History, Loader2, RotateCcw } from "lucide-react";
import type { Revision } from "@/lib/admin/post-types";
import { TEMPLATES, type Template } from "./templates";
import { Modal } from "./ui";
import { mod } from "./Toolbar";

export function TemplatePicker({ onPick, onClose }: { onPick: (t: Template) => void; onClose: () => void }) {
  return (
    <Modal title="What would you like to write?" onClose={onClose} wide>
      <p className="text-sm text-[var(--a-muted)] -mt-1 mb-4">Pick a ready-made layout and just fill in the [brackets], or start blank.</p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onPick(t)}
            className="flex items-start gap-3 rounded-xl border border-[var(--a-line)] p-3.5 text-left hover:border-[#2a78d6] hover:bg-[#f6faff] transition-colors"
          >
            <span className="text-2xl leading-none mt-0.5">{t.emoji}</span>
            <span>
              <span className="block font-semibold">{t.label}</span>
              <span className="block text-sm text-[var(--a-muted)]">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function HistoryDialog({
  postId,
  onRestore,
  onClose,
}: {
  postId: string;
  onRestore: (r: Revision) => void;
  onClose: () => void;
}) {
  const [list, setList] = useState<Revision[] | null>(null);
  const [pick, setPick] = useState(0);
  useEffect(() => {
    fetch(`/api/admin/posts/${postId}/revisions`)
      .then((r) => r.json())
      .then((d) => setList(d.revisions ?? []))
      .catch(() => setList([]));
  }, [postId]);
  const sel = list?.[pick];
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });

  return (
    <Modal title="Version history" onClose={onClose} wide>
      {!list ? (
        <div className="py-10 flex justify-center">
          <Loader2 className="animate-spin text-[var(--a-faint)]" />
        </div>
      ) : list.length === 0 ? (
        <div className="py-8 text-center text-[var(--a-muted)]">
          <History className="mx-auto mb-2 text-[var(--a-faint)]" />
          No earlier versions yet. A version is kept each time you save, publish or update (and every 10 minutes while writing).
        </div>
      ) : (
        <div className="grid sm:grid-cols-[180px_1fr] gap-4">
          <ul className="space-y-1 max-h-[50vh] overflow-y-auto">
            {list.map((r, i) => (
              <li key={r.at + i}>
                <button
                  type="button"
                  onClick={() => setPick(i)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm ${i === pick ? "bg-[#eaf3fc] font-semibold" : "hover:bg-[var(--a-hover)]"}`}
                >
                  {fmt(r.at)}
                  <span className="block text-xs font-normal text-[var(--a-muted)]">
                    {r.by} · {r.status === "draft" ? "draft" : r.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {sel && (
            <div className="min-w-0">
              <div className="rounded-xl border border-[var(--a-line)] bg-[var(--cream)] p-5 max-h-[50vh] overflow-y-auto">
                <h3 className="font-display text-2xl text-[var(--ink)]">{sel.title || "Untitled"}</h3>
                <div className="post-body mt-4 text-base" dangerouslySetInnerHTML={{ __html: sel.contentHtml || "<p><em>Empty</em></p>" }} />
              </div>
              <button className="a-btn a-btn-primary mt-4" onClick={() => onRestore(sel)}>
                <RotateCcw size={16} /> Restore this version
              </button>
              <p className="mt-2 text-xs text-[var(--a-muted)]">Restoring puts this version in the editor. Nothing changes on your websites until you save or update.</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

const SHORTCUTS: [string, string][] = [
  ["Insert any block", "Type /"],
  ["Bold", `${mod} B`],
  ["Italic", `${mod} I`],
  ["Underline", `${mod} U`],
  ["Link", `${mod} K`],
  ["Save", `${mod} S`],
  ["Undo / Redo", `${mod} Z / ${mod} Shift Z`],
  ["Big heading", "## then space"],
  ["Small heading", "### then space"],
  ["Bullet list", "- then space"],
  ["Numbered list", "1. then space"],
  ["Quote", "> then space"],
  ["Divider", "---"],
  ["Line break (same paragraph)", "Shift Enter"],
];

export function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="Tips & shortcuts" onClose={onClose}>
      <ul className="divide-y divide-[var(--a-line)]">
        {SHORTCUTS.map(([what, keys]) => (
          <li key={what} className="flex items-center justify-between py-2 text-sm">
            <span>{what}</span>
            <kbd className="rounded-md border border-[var(--a-line)] bg-[var(--a-bg)] px-2 py-0.5 text-xs font-mono">{keys}</kbd>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-[var(--a-muted)]">
        Hover any block and drag the <b>⋮⋮</b> handle on its left to move it. Click <b>+</b> next to it to add something below.
      </p>
    </Modal>
  );
}
