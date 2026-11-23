"use client";

import { FormEvent, useState, useSyncExternalStore } from "react";
import { Check, Copy, Loader2, Share2, Sparkles } from "lucide-react";
import { PIES, RAFFLE_AREAS, raffle, raffleOpen, type PieId } from "@/lib/raffle";

type Status = "idle" | "loading" | "done" | "already" | "error";

function formatPhone(raw: string) {
  if (raw.startsWith("+") && !raw.startsWith("+1")) return raw.slice(0, 20);
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length < 4) return d.length ? `(${d}` : "";
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const PIE_COLORS: Record<PieId, string> = {
  apple: "#e3a14f",
  pumpkin: "#d9792a",
  pecan: "#8a4b22",
  surprise: "#1b9aaa",
};

export default function RaffleForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [pie, setPie] = useState<PieId>("apple");
  const [firstName, setFirstName] = useState("");

  // Server HTML always shows the form; the visitor's clock decides after hydration.
  const open = useSyncExternalStore(noop, () => raffleOpen(), () => true);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("loading");
    setError("");
    const name = String(data.get("name") || "");
    try {
      const res = await fetch("/api/raffle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: data.get("email"),
          phone: phone && !phone.startsWith("+") ? `+1 ${phone}` : phone,
          area: data.get("area"),
          pie,
          marketingOk: data.get("marketingOk") === "on",
          agree: data.get("agree") === "on",
          company: data.get("company"),
        }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.error || "Something went wrong. Please try again.");
      setFirstName(name.trim().split(/\s+/)[0] || "");
      setStatus(body?.already ? "already" : "done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (!open) {
    return (
      <Card>
        <div className="text-center py-6">
          <div className="mx-auto w-14 h-14 rounded-full bg-gold/15 flex items-center justify-center">
            <Sparkles size={24} className="text-gold" />
          </div>
          <h2 className="mt-5 font-display text-3xl">Entries are closed</h2>
          <p className="mt-3 text-ink-soft leading-relaxed">
            Thank you to everyone who entered! Winners are drawn {raffle.drawLabel} and contacted by email or phone.
          </p>
        </div>
      </Card>
    );
  }

  if (status === "done" || status === "already") {
    return (
      <Card>
        <Success name={firstName} already={status === "already"} />
      </Card>
    );
  }

  const input =
    "w-full rounded-xl border border-line bg-white/70 px-4 py-3.5 text-[15px] text-ink placeholder:text-ink-soft/70 transition-colors focus:outline-none focus:border-sea focus:ring-2 focus:ring-sea/20";

  return (
    <Card>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[28px] leading-tight">Enter to win</h2>
          <span className="hidden xl:inline text-xs text-ink-soft whitespace-nowrap">~30 seconds</span>
        </div>

        {/* Honeypot for bots: hidden from people and screen readers. */}
        <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
          <label>
            Company <input name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div>
          <label htmlFor="r-name" className="sr-only">Your name</label>
          <input id="r-name" name="name" required minLength={2} autoComplete="name" placeholder="Your name" className={input} />
        </div>
        <div>
          <label htmlFor="r-email" className="sr-only">Email</label>
          <input id="r-email" name="email" type="email" required autoComplete="email" placeholder="Email" className={input} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
          <div>
            <label htmlFor="r-phone" className="sr-only">Phone (optional)</label>
            <input
              id="r-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              pattern="\(\d{3}\) \d{3}-\d{4}|\+.{6,}"
              title="Enter a 10-digit US number, or start with + for international"
              className={input}
            />
          </div>
          <div>
            <label htmlFor="r-area" className="sr-only">Where do you live?</label>
            <select id="r-area" name="area" required defaultValue="" className={`${input} appearance-none bg-[length:16px] bg-no-repeat bg-[right_14px_center] pr-10`} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%234a6273' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }}>
              <option value="" disabled>
                Where do you live?
              </option>
              {RAFFLE_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset>
          <legend className="text-sm font-medium mb-2.5">Which pie would you love?</legend>
          <div className="grid grid-cols-2 gap-2">
            {PIES.map((p) => (
              <label key={p.id} className="cursor-pointer">
                <input type="radio" name="pie" value={p.id} checked={pie === p.id} onChange={() => setPie(p.id)} className="peer sr-only" />
                <span className="flex items-center gap-2.5 rounded-xl border border-line bg-white/60 px-3 py-2.5 transition-all hover:border-ink/30 peer-checked:border-ink peer-checked:bg-ink peer-checked:text-cream peer-focus-visible:ring-2 peer-focus-visible:ring-sea">
                  <span className="w-3.5 h-3.5 shrink-0 rounded-full ring-2 ring-white/70" style={{ background: PIE_COLORS[p.id] }} />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium leading-tight">{p.label}</span>
                    <span className="block text-[11px] leading-tight opacity-70 truncate">{p.note}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="space-y-2.5 pt-1">
          <label className="flex items-start gap-3 text-[13px] leading-snug text-ink-soft cursor-pointer">
            <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]" />
            <span>
              I&rsquo;m 18 or older, live in San Diego County, and agree to the{" "}
              <a href="#rules" className="underline underline-offset-2 hover:text-ink">official rules</a>.
            </span>
          </label>
          <label className="flex items-start gap-3 text-[13px] leading-snug text-ink-soft cursor-pointer">
            <input type="checkbox" name="marketingOk" className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ink)]" />
            <span>Also send me Lara&rsquo;s occasional local market updates. (Optional — doesn&rsquo;t affect your chances.)</span>
          </label>
        </div>

        {status === "error" && (
          <p role="alert" className="text-sm text-clay">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="group w-full inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm font-medium tracking-[0.14em] uppercase px-8 py-4 shadow-[0_10px_30px_-10px_rgba(14,43,64,0.6)] hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "loading" ? <Loader2 size={18} className="animate-spin" /> : null}
          {status === "loading" ? "Entering…" : "Enter to win"}
        </button>
        <p className="text-[12px] text-ink-soft text-center">
          No purchase necessary &middot; One entry per person &middot; Your info is never shared or sold.
        </p>
      </form>
    </Card>
  );
}

const noop = () => () => {};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div id="enter" className="relative scroll-mt-28 rounded-[28px] bg-cream text-ink p-6 sm:p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/40">
      {children}
    </div>
  );
}

function Success({ name, already }: { name: string; already: boolean }) {
  const [copied, setCopied] = useState(false);
  // Only ever rendered in the browser (after a submit), so navigator is safe here.
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const url = typeof window !== "undefined" ? `${window.location.origin}${raffle.path}` : raffle.path;
  const text = "Lara is giving away 3 fresh-baked Christmas pies to neighbors — it takes 30 seconds to enter:";

  async function share() {
    try {
      await navigator.share({ title: "Win a pie for Christmas", text, url });
    } catch {
      /* closed the share sheet */
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="text-center py-4" role="status">
      <div className="relative mx-auto w-16 h-16 rounded-full bg-sea/15 flex items-center justify-center">
        <Check size={30} className="text-sea" />
        <span className="absolute inset-0 rounded-full ring-2 ring-sea/30 animate-ping" />
      </div>
      <h2 className="mt-6 font-display text-[34px] leading-tight">
        {already ? "You’re already in!" : `You’re in${name ? `, ${name}` : ""}!`}
      </h2>
      <p className="mt-3 text-ink-soft leading-relaxed max-w-sm mx-auto">
        {already
          ? "We only need one entry per person — you’re all set for the drawing."
          : `Fingers crossed. I’ll draw 3 winners on ${raffle.drawLabel} and reach out to winners by email or phone.`}
      </p>

      <div className="mt-7 rounded-2xl bg-cream-deep/70 p-5">
        <p className="text-sm font-medium">Know a neighbor who&rsquo;d love a pie?</p>
        <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center">
          {canShare && (
            <button onClick={share} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm px-5 py-2.5 hover:bg-gold transition-colors">
              <Share2 size={16} /> Share
            </button>
          )}
          <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 text-sm px-5 py-2.5 hover:border-ink transition-colors">
            {copied ? <Check size={16} className="text-sea" /> : <Copy size={16} />}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
