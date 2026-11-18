"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (step === "password") {
        const data = await post("/api/admin/login", { email, password });
        setPassword(""); // don't keep the password in memory longer than needed
        if (data.mfa) {
          setStep("code");
          setBusy(false);
          return;
        }
      } else {
        await post("/api/admin/login/mfa", { code });
      }
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      if (/timed out|sign in again/i.test(msg)) {
        setStep("password");
        setCode("");
      }
      setBusy(false);
    }
  }

  if (step === "code") {
    return (
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-[#eef4fd] p-3.5 text-sm text-[#1f4f8f]">
          <ShieldCheck size={18} className="shrink-0 mt-0.5" />
          {useRecovery
            ? "Enter one of the recovery codes you saved when you turned on 2-step verification."
            : "Open your authenticator app and type the 6-digit code for Pacific Friendly Admin."}
        </div>
        <label className="block">
          <span className="text-sm font-medium">{useRecovery ? "Recovery code" : "6-digit code"}</span>
          <input
            className="a-input mt-1.5 text-center text-xl tracking-[0.35em] font-semibold"
            inputMode={useRecovery ? "text" : "numeric"}
            autoComplete="one-time-code"
            maxLength={useRecovery ? 12 : 6}
            pattern={useRecovery ? undefined : "[0-9]{6}"}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(useRecovery ? e.target.value : e.target.value.replace(/\D/g, ""))}
            placeholder={useRecovery ? "xxxx-xxxx" : "000000"}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-[var(--a-bad)] bg-[#fdf0ee] rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="a-btn a-btn-primary w-full h-11">
          {busy && <Loader2 size={16} className="animate-spin" />}
          {busy ? "Checking…" : "Verify"}
        </button>
        <button
          type="button"
          className="w-full text-sm text-[var(--a-muted)] hover:text-[var(--a-text)] underline underline-offset-2"
          onClick={() => {
            setUseRecovery((r) => !r);
            setCode("");
            setError("");
          }}
        >
          {useRecovery ? "Use the code from my app instead" : "Lost your phone? Use a recovery code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Email</span>
        <input className="a-input mt-1.5" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus maxLength={254} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <div className="relative mt-1.5">
          <input
            className="a-input pr-11"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={200}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-1.5 top-1/2 -translate-y-1/2 tb-btn" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </label>
      {error && (
        <p role="alert" className="text-sm text-[var(--a-bad)] bg-[#fdf0ee] rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="a-btn a-btn-primary w-full h-11">
        {busy && <Loader2 size={16} className="animate-spin" />}
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
