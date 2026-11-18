"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Info, LogOut, Trash2, Undo2, type LucideIcon } from "lucide-react";

// Friendly replacements for the browser's confirm() and alert().
//
//   if (!(await confirmDialog({ title: "Move to trash?", tone: "danger" }))) return;
//   await alertDialog({ title: "Couldn't save", message: "Please try again." });
//
// <DialogHost /> is mounted once in the admin layout.

type Tone = "danger" | "warning" | "info";
type IconName = "trash" | "warning" | "info" | "undo" | "logout";

export type DialogOptions = {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  icon?: IconName;
};

type Request = DialogOptions & { kind: "confirm" | "alert"; resolve: (ok: boolean) => void };

let open: ((r: Request) => void) | null = null;

export function confirmDialog(o: DialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    if (open) open({ ...o, kind: "confirm", resolve });
    else resolve(window.confirm([o.title, typeof o.message === "string" ? o.message : ""].filter(Boolean).join("\n\n")));
  });
}

export function alertDialog(o: DialogOptions): Promise<void> {
  return new Promise((resolve) => {
    if (open) open({ ...o, kind: "alert", resolve: () => resolve() });
    else {
      window.alert([o.title, typeof o.message === "string" ? o.message : ""].filter(Boolean).join("\n\n"));
      resolve();
    }
  });
}

const ICONS: Record<IconName, LucideIcon> = { trash: Trash2, warning: AlertTriangle, info: Info, undo: Undo2, logout: LogOut };
const TONE: Record<Tone, { ring: string; icon: string; btn: string }> = {
  danger: { ring: "bg-[#fdecea]", icon: "text-[#b4372a]", btn: "bg-[#b4372a] hover:bg-[#9a2c21] text-white" },
  warning: { ring: "bg-[#fff4e5]", icon: "text-[#b86a0b]", btn: "bg-[var(--a-navy)] hover:bg-[#18405d] text-white" },
  info: { ring: "bg-[#eaf3fc]", icon: "text-[#1f5aa6]", btn: "bg-[var(--a-navy)] hover:bg-[#18405d] text-white" },
};

export default function DialogHost() {
  const [queue, setQueue] = useState<Request[]>([]);
  const [leaving, setLeaving] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const req = queue[0];

  useEffect(() => {
    open = (r) => setQueue((q) => [...q, r]);
    return () => {
      open = null;
    };
  }, []);

  const close = useCallback(
    (ok: boolean) => {
      if (!req || leaving) return;
      setLeaving(true);
      setTimeout(() => {
        req.resolve(ok);
        setQueue((q) => q.slice(1));
        setLeaving(false);
        lastFocus.current?.focus?.();
      }, 140);
    },
    [req, leaving],
  );

  // Focus: the safe choice (Cancel) for destructive actions, otherwise the main button.
  useEffect(() => {
    if (!req) return;
    lastFocus.current = document.activeElement as HTMLElement;
    const t = setTimeout(() => (req.kind === "confirm" && req.tone === "danger" ? cancelRef : okRef).current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      }
      if (e.key === "Tab") {
        // Keep keyboard focus inside the dialog.
        const items = [cancelRef.current, okRef.current].filter(Boolean) as HTMLElement[];
        const i = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [req, close]);

  if (!req) return null;
  const tone = TONE[req.tone ?? (req.kind === "alert" ? "warning" : "info")];
  const Icon = ICONS[req.icon ?? (req.tone === "danger" ? "trash" : req.kind === "alert" ? "warning" : "info")];

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6 transition-opacity duration-150 ${leaving ? "opacity-0" : "opacity-100"}`}
      style={{ background: "rgba(14,25,35,0.5)", backdropFilter: "blur(3px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && close(false)}
    >
      <div
        role={req.kind === "alert" ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby="dlg-title"
        aria-describedby={req.message ? "dlg-msg" : undefined}
        className={`a-toast w-full sm:max-w-[420px] bg-white rounded-t-2xl sm:rounded-2xl shadow-[0_30px_80px_rgba(10,20,30,0.35)] p-6 transition-transform duration-150 ${
          leaving ? "translate-y-2 sm:scale-[0.98]" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <span className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center ${tone.ring}`}>
            <Icon size={21} className={tone.icon} />
          </span>
          <div className="min-w-0 pt-1">
            <h2 id="dlg-title" className="text-[17px] font-semibold leading-snug text-[var(--a-text)]">
              {req.title}
            </h2>
            {req.message && (
              <div id="dlg-msg" className="mt-2 text-[14.5px] leading-relaxed text-[var(--a-muted)] space-y-2">
                {req.message}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {req.kind === "confirm" && (
            <button ref={cancelRef} type="button" className="a-btn a-btn-ghost h-11 sm:h-10" onClick={() => close(false)}>
              {req.cancelLabel ?? "Cancel"}
            </button>
          )}
          <button ref={okRef} type="button" className={`a-btn h-11 sm:h-10 ${tone.btn}`} onClick={() => close(true)}>
            {req.confirmLabel ?? (req.kind === "alert" ? "OK" : "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
