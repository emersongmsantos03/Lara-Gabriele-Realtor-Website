"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { confirmDialog } from "./DialogHost";
import { Check, Copy, Download, KeyRound, Laptop, Loader2, LogOut, ShieldCheck, ShieldOff, Smartphone } from "lucide-react";

type Account = { email: string; name: string; totpEnabled: boolean; recoveryCodesLeft: number; passwordChangedAt: string };
type Session = { id: string; current: boolean; createdAt: string; lastSeenAt: string; ip: string; userAgent: string };
type Activity = { at: string; actor: string | null; action: string; target: string | null; ip: string | null };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });

function deviceName(ua: string) {
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Computer";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  return { label: `${br} on ${os}`, mobile: /iPhone|Android|iPad/.test(ua) };
}

const ACTIONS: Record<string, string> = {
  "login.success": "Signed in",
  "login.failed": "Wrong password",
  "login.locked": "Sign-in blocked (account locked)",
  "login.mfa_failed": "Wrong 2-step code",
  "login.recovery_code": "Signed in with a recovery code",
  logout: "Signed out",
  "password.changed": "Changed password",
  "mfa.enabled": "Turned on 2-step verification",
  "mfa.disabled": "Turned off 2-step verification",
  "mfa.recovery_regenerated": "Made new recovery codes",
  "sessions.revoked": "Signed out devices",
  "post.created": "Created post",
  "post.updated": "Updated post",
  "post.published": "Published post",
  "post.scheduled": "Scheduled post",
  "post.unpublished": "Unpublished post",
  "post.trashed": "Moved post to trash",
  "post.restored": "Restored post",
  "post.deleted": "Deleted post forever",
  "image.uploaded": "Uploaded a photo",
  "data.exported": "Downloaded a backup",
  "sale.created": "Added a recent sale",
  "sale.updated": "Updated a recent sale",
  "sale.deleted": "Removed a recent sale",
};
const ALERT = new Set(["login.failed", "login.locked", "login.mfa_failed", "mfa.disabled", "login.recovery_code"]);

async function call(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function Card({ icon: Icon, title, desc, children }: { icon: typeof KeyRound; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="a-card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="h-10 w-10 shrink-0 rounded-xl bg-[var(--a-bg)] flex items-center justify-center text-[var(--a-navy)]">
          <Icon size={19} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-lg">{title}</h2>
          {desc && <p className="text-sm text-[var(--a-muted)]">{desc}</p>}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Msg({ ok, text }: { ok?: boolean; text: string }) {
  return <p role={ok ? "status" : "alert"} className={`mt-3 text-sm rounded-lg px-3 py-2 ${ok ? "bg-[#e3f4ea] text-[#1d6b3f]" : "bg-[#fdf0ee] text-[var(--a-bad)]"}`}>{text}</p>;
}

function RecoveryCodes({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false);
  const text = `Pacific Friendly Admin — recovery codes\nEach code works once. Keep them somewhere safe.\n\n${codes.join("\n")}\n`;
  return (
    <div className="mt-4 rounded-xl border-2 border-dashed border-[#f0c48f] bg-[#fffaf2] p-4">
      <p className="font-semibold">Save these recovery codes now</p>
      <p className="text-sm text-[var(--a-muted)]">If you lose your phone, each code lets you sign in once. They won&apos;t be shown again.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[15px]">
        {codes.map((c) => (
          <span key={c} className="rounded-md bg-white border border-[var(--a-line)] px-3 py-1.5 text-center">{c}</span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="a-btn a-btn-ghost h-9"
          onClick={async () => {
            await navigator.clipboard.writeText(text).catch(() => {});
            setCopied(true);
          }}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
        </button>
        <a className="a-btn a-btn-ghost h-9" download="pacific-friendly-recovery-codes.txt" href={`data:text/plain;charset=utf-8,${encodeURIComponent(text)}`}>
          <Download size={15} /> Download
        </a>
      </div>
    </div>
  );
}

export default function AccountClient({ account, sessions, activity }: { account: Account; sessions: Session[]; activity: Activity[] }) {
  const router = useRouter();

  // ---------- Password ----------
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const strength = pw.next.length >= 16 ? "Strong" : pw.next.length >= 12 ? "Good" : pw.next ? "Too short" : "";

  // ---------- 2-step ----------
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [mfaPw, setMfaPw] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);
  const [mfaMsg, setMfaMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const [devMsg, setDevMsg] = useState<string | null>(null);

  async function run(fn: () => Promise<void>, setBusy: (b: boolean) => void, setMsg: (m: { ok?: boolean; text: string } | null) => void) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
    } catch (e) {
      setMsg({ text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <header>
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight">Security</h1>
        <p className="mt-1 text-[var(--a-muted)]">
          Signed in as <b>{account.name}</b> ({account.email})
        </p>
      </header>

      <div className="mt-7 grid gap-4">
        {/* 2-step verification */}
        <Card
          icon={account.totpEnabled ? ShieldCheck : ShieldOff}
          title="2-step verification"
          desc="After your password, sign-in also asks for a code from your phone. Even if someone learns your password, they can't get in."
        >
          {account.totpEnabled && !codes ? (
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#e3f4ea] text-[#1d6b3f] px-3 py-1 text-sm font-semibold">
                <Check size={15} /> On
              </p>
              <p className="mt-2 text-sm text-[var(--a-muted)]">{account.recoveryCodesLeft} of 10 recovery codes left.</p>
              <div className="mt-4 flex flex-wrap items-end gap-2">
                <label className="block">
                  <span className="text-xs font-medium text-[var(--a-muted)]">Your password (to make changes)</span>
                  <input type="password" autoComplete="current-password" className="a-input mt-1 w-64 max-w-full" value={mfaPw} onChange={(e) => setMfaPw(e.target.value)} />
                </label>
                <button
                  className="a-btn a-btn-ghost"
                  disabled={mfaBusy || !mfaPw}
                  onClick={() =>
                    run(async () => {
                      const d = await call({ action: "recovery-codes", password: mfaPw });
                      setCodes(d.recoveryCodes);
                      setMfaPw("");
                    }, setMfaBusy, setMfaMsg)
                  }
                >
                  New recovery codes
                </button>
                <button
                  className="a-btn a-btn-danger"
                  disabled={mfaBusy || !mfaPw}
                  onClick={async () => {
                    const ok = await confirmDialog({
                      title: "Turn off 2-step verification?",
                      message: "Your account will be protected by your password only. Anyone who learns it could sign in.",
                      confirmLabel: "Turn off",
                      tone: "danger",
                      icon: "warning",
                    });
                    if (!ok) return;
                    run(async () => {
                      await call({ action: "totp-disable", password: mfaPw });
                      router.refresh();
                    }, setMfaBusy, setMfaMsg);
                  }}
                >
                  Turn off
                </button>
              </div>
            </div>
          ) : codes ? (
            <div>
              <Msg ok text="2-step verification is on. Other devices were signed out." />
              <RecoveryCodes codes={codes} />
              <button className="a-btn a-btn-primary mt-4" onClick={() => { setCodes(null); router.refresh(); }}>
                I saved my codes
              </button>
            </div>
          ) : !setup ? (
            <button className="a-btn a-btn-accent" disabled={mfaBusy} onClick={() => run(async () => setSetup(await call({ action: "totp-start" })), setMfaBusy, setMfaMsg)}>
              {mfaBusy && <Loader2 size={16} className="animate-spin" />} Turn on 2-step verification
            </button>
          ) : (
            <ol className="space-y-5 text-[15px]">
              <li>
                <b>1.</b> Install a free authenticator app on your phone: <b>Google Authenticator</b>, <b>Microsoft Authenticator</b> or <b>1Password</b>.
              </li>
              <li>
                <b>2.</b> In the app, tap <b>+</b> and scan this code:
                <div className="mt-3 flex flex-wrap items-center gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={setup.qr} alt="QR code for your authenticator app" width={180} height={180} className="rounded-lg border border-[var(--a-line)]" />
                  <div className="text-sm text-[var(--a-muted)] max-w-[260px]">
                    Can&apos;t scan? Choose &ldquo;enter a setup key&rdquo; and type:
                    <code className="mt-1 block font-mono text-[15px] text-[var(--a-text)] bg-[var(--a-bg)] rounded-md px-2 py-1 break-all">{setup.secret}</code>
                  </div>
                </div>
              </li>
              <li>
                <b>3.</b> Type the 6-digit code the app shows:
                <div className="mt-2 flex flex-wrap gap-2">
                  <input
                    className="a-input w-40 text-center text-lg tracking-[0.3em] font-semibold"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                  />
                  <button
                    className="a-btn a-btn-primary"
                    disabled={mfaBusy || code.length !== 6}
                    onClick={() =>
                      run(async () => {
                        const d = await call({ action: "totp-confirm", code });
                        setCodes(d.recoveryCodes);
                        setSetup(null);
                        setCode("");
                      }, setMfaBusy, setMfaMsg)
                    }
                  >
                    {mfaBusy && <Loader2 size={16} className="animate-spin" />} Turn on
                  </button>
                </div>
              </li>
            </ol>
          )}
          {mfaMsg && <Msg {...mfaMsg} />}
        </Card>

        {/* Password */}
        <Card icon={KeyRound} title="Password" desc={`Last changed ${when(account.passwordChangedAt)}. Use 12+ characters; a short sentence is easy to remember and hard to guess.`}>
          <form
            className="grid gap-3 max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              if (pw.next !== pw.confirm) return setPwMsg({ text: "The two new passwords don't match." });
              run(async () => {
                await call({ action: "password", current: pw.current, next: pw.next });
                setPw({ current: "", next: "", confirm: "" });
                setPwMsg({ ok: true, text: "Password changed. Any other device was signed out." });
                router.refresh();
              }, setPwBusy, setPwMsg);
            }}
          >
            <input type="email" autoComplete="username" value={account.email} readOnly hidden />
            <label className="block">
              <span className="text-sm font-medium">Current password</span>
              <input type="password" autoComplete="current-password" required className="a-input mt-1" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            </label>
            <label className="block">
              <span className="flex justify-between text-sm font-medium">
                New password
                {strength && <span className={strength === "Too short" ? "text-[var(--a-bad)]" : "text-[var(--a-good)]"}>{strength}</span>}
              </span>
              <input type="password" autoComplete="new-password" required minLength={12} maxLength={200} className="a-input mt-1" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">New password again</span>
              <input type="password" autoComplete="new-password" required className="a-input mt-1" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </label>
            <button className="a-btn a-btn-primary justify-self-start" disabled={pwBusy}>
              {pwBusy && <Loader2 size={16} className="animate-spin" />} Change password
            </button>
          </form>
          {pwMsg && <Msg {...pwMsg} />}
          <p className="mt-3 text-xs text-[var(--a-faint)]">New passwords are checked against known data breaches without ever sending the password anywhere.</p>
        </Card>

        {/* Devices */}
        <Card icon={Laptop} title="Signed-in devices" desc="Sessions end by themselves after 7 days without use. Sign out anything you don't recognize.">
          <ul className="divide-y divide-[var(--a-line)]">
            {sessions.map((s) => {
              const d = deviceName(s.userAgent || "");
              return (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  {d.mobile ? <Smartphone size={18} className="text-[var(--a-muted)]" /> : <Laptop size={18} className="text-[var(--a-muted)]" />}
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">
                      {d.label} {s.current && <span className="ml-1 rounded-full bg-[#e3f4ea] text-[#1d6b3f] px-2 py-0.5 text-xs font-semibold">This device</span>}
                    </p>
                    <p className="text-[var(--a-muted)]">
                      {s.ip} · signed in {when(s.createdAt)} · last active {when(s.lastSeenAt)}
                    </p>
                  </div>
                  {!s.current && (
                    <button
                      className="a-btn a-btn-ghost h-9"
                      onClick={async () => {
                        try {
                          await call({ action: "revoke-session", id: s.id });
                          router.refresh();
                        } catch (e) {
                          setDevMsg((e as Error).message);
                        }
                      }}
                    >
                      <LogOut size={15} /> Sign out
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {sessions.length > 1 && (
            <button
              className="a-btn a-btn-danger mt-3"
              onClick={async () => {
                const ok = await confirmDialog({
                  title: "Sign out every other device?",
                  message: "Phones and computers signed in to this account will need the password again. This device stays signed in.",
                  confirmLabel: "Sign them out",
                  tone: "danger",
                  icon: "logout",
                });
                if (!ok) return;
                await call({ action: "revoke-others" }).catch((e) => setDevMsg((e as Error).message));
                router.refresh();
              }}
            >
              Sign out everywhere else
            </button>
          )}
          {devMsg && <Msg text={devMsg} />}
        </Card>

        {/* Backup */}
        <Card icon={Download} title="Backup" desc="Download every post (with its version history) as one file. Your database also keeps automatic backups.">
          <a className="a-btn a-btn-ghost" href="/api/admin/export">
            <Download size={16} /> Download a backup
          </a>
        </Card>

        {/* Activity */}
        <section className="a-card p-5 sm:p-6">
          <h2 className="font-semibold text-lg">Recent activity</h2>
          <p className="text-sm text-[var(--a-muted)]">Every sign-in and change in the admin, by both accounts.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <tbody>
                {activity.map((a, i) => (
                  <tr key={i} className="border-t border-[var(--a-line)]">
                    <td className="py-2 pr-3 whitespace-nowrap text-[var(--a-muted)]">{when(a.at)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{a.actor ?? <span className="text-[var(--a-faint)]">unknown</span>}</td>
                    <td className={`py-2 pr-3 ${ALERT.has(a.action) ? "text-[var(--a-bad)] font-medium" : ""}`}>
                      {ACTIONS[a.action] ?? a.action}
                      {a.target && <span className="text-[var(--a-muted)]"> · {a.target}</span>}
                    </td>
                    <td className="py-2 text-right text-xs text-[var(--a-faint)] whitespace-nowrap">{a.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activity.length === 0 && <p className="text-sm text-[var(--a-faint)]">Nothing yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
