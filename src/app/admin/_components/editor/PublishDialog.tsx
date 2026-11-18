"use client";

import { useState } from "react";
import { CalendarClock, Check, ExternalLink, Loader2, PartyPopper, Send } from "lucide-react";
import { SITE_LIST, SITES, type SiteId } from "@/lib/admin/sites";
import { formatPacific, isoToPacific, pacificToIso } from "@/lib/admin/time";
import type { Post } from "@/lib/admin/post-types";
import { Modal } from "./ui";

export function SitePicker({ value, onChange }: { value: SiteId[]; onChange: (v: SiteId[]) => void }) {
  const all = value.length === SITE_LIST.length;
  const toggle = (id: SiteId) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <div>
      <div className="space-y-2">
        {SITE_LIST.map((s) => {
          const on = value.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={on}
              className={`w-full flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                on ? "border-[#2a78d6] bg-[#f1f7fe]" : "border-[var(--a-line)] hover:bg-[var(--a-hover)]"
              }`}
            >
              <span
                className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center ${
                  on ? "bg-[#2a78d6] border-[#2a78d6] text-white" : "border-[#c3cbd3]"
                }`}
              >
                {on && <Check size={14} strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-2 font-medium text-[15px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.name}
                </span>
                <span className="block text-xs text-[var(--a-muted)]">{s.domain}</span>
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => onChange(all ? ["pacific"] : SITE_LIST.map((s) => s.id))}
        className="mt-2 text-sm font-medium text-[#1f5aa6] hover:underline"
      >
        {all ? "Only the main site" : "Select all 3 websites"}
      </button>
    </div>
  );
}

function defaultSchedule() {
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  return { date: isoToPacific(tomorrow).date, time: "09:00" };
}

export default function PublishDialog({
  post,
  sites,
  setSites,
  problems,
  scheduleOnly,
  onPublish,
  onClose,
}: {
  post: Post | null;
  sites: SiteId[];
  setSites: (v: SiteId[]) => void;
  problems: string[];
  scheduleOnly?: boolean;
  onPublish: (when: string | null) => Promise<Post | null>;
  onClose: () => void;
}) {
  const initial = post?.publishAt && post.status === "scheduled" ? isoToPacific(post.publishAt) : defaultSchedule();
  const [mode, setMode] = useState<"now" | "later">(scheduleOnly ? "later" : "now");
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Post | null>(null);
  const [openedAt] = useState(() => Date.now());

  const when = mode === "later" && date && time ? pacificToIso(date, time) : null;
  const past = when ? new Date(when).getTime() < openedAt : false;
  const blockers = [...problems, ...(sites.length ? [] : ["Pick at least one website."]), ...(past ? ["That time has already passed."] : [])];

  if (done) {
    const live = done.status === "published";
    return (
      <Modal title={live ? "Your post is live!" : "Post scheduled"} onClose={onClose}>
        <div className="text-center py-2">
          <div className="mx-auto h-14 w-14 rounded-full bg-[#e3f4ea] text-[#1d6b3f] flex items-center justify-center">
            {live ? <PartyPopper size={26} /> : <CalendarClock size={26} />}
          </div>
          <p className="mt-4 text-[var(--a-muted)]">
            {live
              ? "It may take up to a minute to show up everywhere."
              : `It will go live on its own on ${formatPacific(done.publishAt!)} (San Diego time).`}
          </p>
        </div>
        {live && (
          <div className="mt-4 space-y-2">
            {done.sites.map((id) => (
              <a key={id} href={SITES[id].postUrl(done.slug)} target="_blank" rel="noreferrer" className="a-btn a-btn-ghost w-full justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: SITES[id].color }} />
                  View on {SITES[id].short}
                </span>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        )}
        <button className="a-btn a-btn-primary w-full mt-5" onClick={onClose}>
          Done
        </button>
      </Modal>
    );
  }

  return (
    <Modal title={scheduleOnly ? "Change schedule" : "Ready to publish?"} onClose={onClose} wide>
      <h3 className="text-sm font-semibold mt-1">1. Where should it appear?</h3>
      <div className="mt-2">
        <SitePicker value={sites} onChange={setSites} />
      </div>

      <h3 className="text-sm font-semibold mt-6">2. When?</h3>
      <div className="mt-2 grid sm:grid-cols-2 gap-2">
        {(
          [
            ["now", "Right now", Send],
            ["later", "Schedule for later", CalendarClock],
          ] as const
        ).map(([id, label, Icon]) =>
          scheduleOnly && id === "now" ? null : (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left font-medium ${
                mode === id ? "border-[#2a78d6] bg-[#f1f7fe]" : "border-[var(--a-line)] hover:bg-[var(--a-hover)]"
              }`}
            >
              <Icon size={18} className={mode === id ? "text-[#2a78d6]" : "text-[var(--a-muted)]"} />
              {label}
            </button>
          ),
        )}
      </div>
      {mode === "later" && (
        <div className="mt-3 rounded-xl bg-[var(--a-bg)] p-3.5">
          <div className="flex flex-wrap gap-2">
            <input type="date" className="a-input w-auto flex-1 min-w-[150px]" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
            <input type="time" className="a-input w-auto min-w-[120px]" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Time" />
          </div>
          <p className="mt-2 text-xs text-[var(--a-muted)]">
            San Diego time (Pacific).{when && !past ? ` Goes live ${formatPacific(when)}.` : ""}
          </p>
        </div>
      )}

      {blockers.length > 0 && (
        <ul className="mt-5 rounded-xl bg-[#fff4e5] text-[#7a4a10] text-sm px-4 py-3 space-y-1">
          {blockers.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex gap-2 justify-end">
        <button className="a-btn a-btn-ghost" onClick={onClose}>
          Not yet
        </button>
        <button
          className="a-btn a-btn-accent"
          disabled={busy || blockers.length > 0}
          onClick={async () => {
            setBusy(true);
            const saved = await onPublish(mode === "later" ? when : null);
            setBusy(false);
            if (saved) setDone(saved);
          }}
        >
          {busy && <Loader2 size={16} className="animate-spin" />}
          {mode === "now" ? "Publish now" : "Schedule post"}
        </button>
      </div>
    </Modal>
  );
}
