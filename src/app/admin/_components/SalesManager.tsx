"use client";

import { useState } from "react";
import { ExternalLink, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { alertDialog, confirmDialog } from "./DialogHost";
import { pickImage, uploadImage } from "./editor/media";
import { REPRESENTED_LABEL, SALE_SITES, SALES_SHOWN, type Represented, type Sale, type SaleSite } from "@/lib/admin/sale-types";
import { SITES } from "@/lib/admin/sites";

type Draft = {
  site: SaleSite;
  address: string;
  price: string;
  soldOn: string;
  beds: string;
  baths: string;
  sqft: string;
  photo: string;
  represented: Represented;
  note: string;
};

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
const blank = (site: SaleSite): Draft => ({
  site,
  address: "",
  price: "",
  soldOn: today(),
  beds: "",
  baths: "",
  sqft: "",
  photo: "",
  represented: "",
  note: "",
});
const toDraft = (s: Sale): Draft => ({
  site: s.site,
  address: s.address,
  price: String(s.price),
  soldOn: s.soldOn,
  beds: s.beds?.toString() ?? "",
  baths: s.baths?.toString() ?? "",
  sqft: s.sqft?.toString() ?? "",
  photo: s.photo,
  represented: s.represented,
  note: s.note,
});

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const day = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const digits = (v: string) => v.replace(/[^\d.]/g, "");

export default function SalesManager({ initialSales }: { initialSales: Sale[] }) {
  const [sales, setSales] = useState(initialSales);
  const [site, setSite] = useState<SaleSite>("santafe");
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const shown = sales.filter((s) => s.site === site);
  const set = (patch: Partial<Draft>) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e));

  async function addPhoto() {
    const file = await pickImage();
    if (!file) return;
    setUploading(true);
    try {
      set({ photo: await uploadImage(file) });
    } catch (e) {
      await alertDialog({ title: "Couldn't upload the photo", message: (e as Error).message });
    } finally {
      setUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const d = editing.draft;
    setSaving(true);
    setError("");
    const body = {
      ...d,
      price: Number(digits(d.price)),
      beds: d.beds === "" ? null : Number(d.beds),
      baths: d.baths === "" ? null : Number(d.baths),
      sqft: d.sqft === "" ? null : Number(digits(d.sqft)),
    };
    const res = await fetch(editing.id ? `/api/admin/sales/${editing.id}` : "/api/admin/sales", {
      method: editing.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setError(data.error || "Couldn't save. Please try again.");
    const sale = data.sale as Sale;
    setSales((list) =>
      [...list.filter((x) => x.id !== sale.id), sale].sort((a, b) => b.soldOn.localeCompare(a.soldOn)),
    );
    setSite(sale.site);
    setEditing(null);
  }

  async function remove(s: Sale) {
    const ok = await confirmDialog({
      title: "Remove this sale?",
      message: (
        <p>
          <b className="text-[var(--a-text)]">{s.address}</b> will disappear from {SITES[s.site].name} right away.
        </p>
      ),
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!ok) return;
    const res = await fetch(`/api/admin/sales/${s.id}`, { method: "DELETE" });
    if (res.ok) setSales((list) => list.filter((x) => x.id !== s.id));
    else await alertDialog({ title: "Couldn't remove it", message: "Please check your connection and try again." });
  }

  const d = editing?.draft;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Recent sales</h1>
          <p className="mt-1 text-[var(--a-muted)] max-w-2xl">
            Homes sold in each neighborhood. They appear in the &ldquo;Recently sold&rdquo; section of that website, newest first (the
            latest {SALES_SHOWN}). The section stays hidden until you add one.
          </p>
        </div>
        {!editing && (
          <button className="a-btn a-btn-accent" onClick={() => (setError(""), setEditing({ id: null, draft: blank(site) }))}>
            <Plus size={16} /> Add a sale
          </button>
        )}
      </header>

      {editing && d && (
        <form onSubmit={save} className="a-card mt-6 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-lg font-semibold">{editing.id ? "Edit sale" : "Add a sale"}</h2>
            <button type="button" aria-label="Close" className="a-btn a-btn-ghost h-9 px-2.5" onClick={() => setEditing(null)}>
              <X size={16} />
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-[220px_1fr]">
            <div>
              <span className="block text-sm font-medium mb-1.5">Photo</span>
              {d.photo ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.photo} alt="" className="w-full aspect-[4/3] object-cover rounded-xl border border-[var(--a-line)]" />
                  <button
                    type="button"
                    onClick={() => set({ photo: "" })}
                    className="absolute top-2 right-2 a-btn a-btn-ghost h-8 px-2 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={addPhoto}
                  disabled={uploading}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-[var(--a-line)] hover:bg-[var(--a-hover)] flex flex-col items-center justify-center gap-2 text-sm text-[var(--a-muted)]"
                >
                  <ImagePlus size={22} />
                  {uploading ? "Uploading…" : "Add the front photo"}
                </button>
              )}
              <p className="mt-1.5 text-xs text-[var(--a-faint)]">Optional. Use a photo you have the right to share.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Website" full>
                <select className="a-input h-10" value={d.site} onChange={(e) => set({ site: e.target.value as SaleSite })}>
                  {SALE_SITES.map((id) => (
                    <option key={id} value={id}>
                      {SITES[id].name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Address" hint="Full address, or just the street (e.g. “Via Vera Cruz”)." full>
                <input className="a-input h-10" required maxLength={160} value={d.address} onChange={(e) => set({ address: e.target.value })} />
              </Field>
              <Field label="Sold price">
                <input
                  className="a-input h-10"
                  required
                  inputMode="numeric"
                  placeholder="$1,150,000"
                  value={d.price ? `$${Number(digits(d.price)).toLocaleString("en-US")}` : ""}
                  onChange={(e) => set({ price: digits(e.target.value).split(".")[0] })}
                />
              </Field>
              <Field label="Sold on">
                <input className="a-input h-10" type="date" required max={today()} value={d.soldOn} onChange={(e) => set({ soldOn: e.target.value })} />
              </Field>
              <div className="grid grid-cols-3 gap-3 sm:col-span-2">
                <Field label="Beds">
                  <input className="a-input h-10" inputMode="decimal" value={d.beds} onChange={(e) => set({ beds: digits(e.target.value) })} />
                </Field>
                <Field label="Baths">
                  <input className="a-input h-10" inputMode="decimal" value={d.baths} onChange={(e) => set({ baths: digits(e.target.value) })} />
                </Field>
                <Field label="Sq ft">
                  <input className="a-input h-10" inputMode="numeric" value={d.sqft} onChange={(e) => set({ sqft: digits(e.target.value).split(".")[0] })} />
                </Field>
              </div>
              <Field label="Lara's role" full>
                <select className="a-input h-10" value={d.represented} onChange={(e) => set({ represented: e.target.value as Represented })}>
                  {(Object.keys(REPRESENTED_LABEL) as Represented[]).map((r) => (
                    <option key={r} value={r}>
                      {REPRESENTED_LABEL[r]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Short note" hint="Optional, e.g. “Sold over asking in 6 days”." full>
                <input className="a-input h-10" maxLength={160} value={d.note} onChange={(e) => set({ note: e.target.value })} />
              </Field>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-[var(--a-bad)]">{error}</p>}
          <div className="mt-5 flex flex-wrap gap-3 justify-end">
            <button type="button" className="a-btn a-btn-ghost" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="a-btn a-btn-primary" disabled={saving || uploading}>
              {saving ? "Saving…" : editing.id ? "Save changes" : "Add sale"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-xl bg-white border border-[var(--a-line)] p-1">
          {SALE_SITES.map((id) => (
            <button
              key={id}
              onClick={() => setSite(id)}
              className={`flex items-center gap-2 rounded-lg px-3 h-8 text-sm font-medium ${
                site === id ? "bg-[var(--a-navy)] text-white" : "text-[var(--a-muted)] hover:text-[var(--a-text)] hover:bg-[var(--a-hover)]"
              }`}
            >
              {SITES[id].name}
              <span className={`text-xs tabular-nums ${site === id ? "text-white/70" : "text-[var(--a-faint)]"}`}>
                {sales.filter((s) => s.site === id).length}
              </span>
            </button>
          ))}
        </div>
        <a href={`${SITES[site].url}/#sold`} target="_blank" rel="noreferrer" className="text-sm text-[var(--a-muted)] hover:text-[var(--a-text)] inline-flex items-center gap-1.5">
          See it on {SITES[site].domain} <ExternalLink size={14} />
        </a>
      </div>

      <div className="a-card mt-4">
        {shown.length === 0 ? (
          <p className="py-14 px-6 text-center text-[var(--a-muted)]">
            No sales yet for {SITES[site].name}. The &ldquo;Recently sold&rdquo; section is hidden on the website until you add one.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--a-line)]">
            {shown.map((s, i) => (
              <li key={s.id} className={`grid grid-cols-[6rem_1fr] items-center gap-x-4 gap-y-3 p-3 sm:flex sm:p-4 ${i >= SALES_SHOWN ? "opacity-55" : ""}`}>
                {s.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.photo} alt="" className="h-16 w-24 rounded-lg object-cover shrink-0 border border-[var(--a-line)]" />
                ) : (
                  <div className="h-16 w-24 rounded-lg shrink-0 bg-gradient-to-br from-[#123A57] to-[#1E9BA8]" />
                )}
                <div className="min-w-0 sm:flex-1">
                  <p className="font-medium truncate">{s.address}</p>
                  <p className="text-sm text-[var(--a-muted)]">
                    {money(s.price)} · sold {day(s.soldOn)}
                    {[s.beds != null && `${s.beds} bd`, s.baths != null && `${s.baths} ba`, s.sqft && `${s.sqft.toLocaleString("en-US")} sq ft`]
                      .filter(Boolean)
                      .map((x) => ` · ${x}`)}
                  </p>
                  <p className="text-xs text-[var(--a-faint)] mt-0.5">
                    {REPRESENTED_LABEL[s.represented]}
                    {s.note && ` · “${s.note}”`}
                    {i >= SALES_SHOWN && " · not shown (only the latest " + SALES_SHOWN + " appear)"}
                  </p>
                </div>
                <div className="col-span-2 flex justify-end gap-2 sm:ml-auto">
                  <button className="a-btn a-btn-ghost h-9" onClick={() => (setError(""), setEditing({ id: s.id, draft: toDraft(s) }), window.scrollTo({ top: 0, behavior: "smooth" }))}>
                    <Pencil size={15} /> Edit
                  </button>
                  <button className="a-btn a-btn-ghost h-9 px-2.5" aria-label={`Remove ${s.address}`} onClick={() => remove(s)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="mt-4 text-xs text-[var(--a-faint)] max-w-2xl">
        Only list sales you can share: Lara&apos;s own deals, or closed sales from public records/MLS data you&apos;re allowed to display.
        Neighborhood sales are labelled as such on the website, never as Lara&apos;s.
      </p>
    </div>
  );
}

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
      {hint && <span className="block mt-1 text-xs text-[var(--a-faint)]">{hint}</span>}
    </label>
  );
}
