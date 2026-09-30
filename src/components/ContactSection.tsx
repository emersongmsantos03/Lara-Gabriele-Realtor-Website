"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { Mail, Phone, Loader2, Check } from "lucide-react";
import Reveal from "./Reveal";
import { site } from "@/lib/site";

type Status = "idle" | "loading" | "success" | "error";

// US numbers are formatted as the visitor types: (760) 555-0142. Anything
// starting with "+" (other than +1) is left as typed for international callers.
function formatPhone(raw: string) {
  if (raw.startsWith("+") && !raw.startsWith("+1")) return raw.slice(0, 20);
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length < 4) return d.length ? `(${d}` : "";
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const intents = ["Buy", "Sell", "Relocate", "Off-market homes", "Just exploring"];

export default function ContactSection({ area }: { area?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [phone, setPhone] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: data.get("name"),
          email: data.get("email"),
          phone: phone && !phone.startsWith("+") ? `+1 ${phone}` : phone,
          intent: data.get("intent"),
          message: data.get("message"),
          area,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Something went wrong.");
      }

      setStatus("success");
      form.reset();
      setPhone("");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  }

  const input =
    "w-full rounded-xl border border-line bg-cream px-4 py-3.5 text-sm transition-colors focus:outline-none focus:border-sea focus:ring-2 focus:ring-sea/20";

  return (
    <section id="contact" className="py-20 md:py-24 bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        <Reveal className="lg:col-span-5">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-gold-light/60">
              <Image
                src="/images/lara-headshot.jpg"
                alt="Lara Gabriele"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div>
              <div className="font-display text-xl">Lara Gabriele</div>
              <div className="text-sm text-cream/60">
                CA DRE #{site.dreLicense} &middot; Usually replies the same day
              </div>
            </div>
          </div>
          <h2 className="mt-8 font-display text-3xl md:text-4xl leading-tight text-balance">
            {area ? `Let's talk about ${area}.` : "Let’s talk about your move."}
          </h2>
          <p className="mt-4 text-cream/70 leading-relaxed max-w-md">
            No pressure, no obligation — just honest answers. Prefer to talk
            now? Call or text me.
          </p>
          <div className="mt-8 space-y-4">
            <a href={site.phoneHref} className="group flex items-center gap-4">
              <span className="w-11 h-11 rounded-full bg-cream/10 flex items-center justify-center group-hover:bg-gold-light transition-colors">
                <Phone size={18} className="text-gold-light group-hover:text-ink transition-colors" />
              </span>
              <span className="text-lg group-hover:text-gold-light transition-colors">{site.phone}</span>
            </a>
            <a href={`mailto:${site.email}`} className="group flex items-center gap-4">
              <span className="w-11 h-11 rounded-full bg-cream/10 flex items-center justify-center group-hover:bg-gold-light transition-colors">
                <Mail size={18} className="text-gold-light group-hover:text-ink transition-colors" />
              </span>
              <span className="group-hover:text-gold-light transition-colors break-all">{site.email}</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={100} className="lg:col-span-7">
          {status === "success" ? (
            <div className="rounded-3xl bg-cream text-ink p-10 md:p-12 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-sea/15 flex items-center justify-center">
                <Check size={26} className="text-sea" />
              </div>
              <h3 className="mt-6 font-display text-3xl">Thank you!</h3>
              <p className="mt-3 text-ink-soft">
                Your message is on its way. I&rsquo;ll be in touch within one
                business day.
              </p>
            </div>
          ) : (
            <form
              className="rounded-3xl bg-cream text-ink p-6 sm:p-8 space-y-5"
              onSubmit={handleSubmit}
            >
              <fieldset>
                <legend className="text-sm font-medium mb-3">
                  I&rsquo;m looking to&hellip;
                </legend>
                <div className="flex flex-wrap gap-2">
                  {intents.map((option, i) => (
                    <label key={option} className="cursor-pointer">
                      <input
                        type="radio"
                        name="intent"
                        value={option}
                        defaultChecked={i === 0}
                        className="peer sr-only"
                      />
                      <span className="inline-block rounded-full border border-line px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink/40 peer-checked:bg-ink peer-checked:text-cream peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-sea">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input id="name" name="name" type="text" required autoComplete="name" placeholder="Your name" className={input} />
                </div>
                <div>
                  <label htmlFor="phone" className="sr-only">Phone (optional)</label>
                  <div className="flex items-stretch rounded-xl border border-line bg-cream transition-colors focus-within:border-sea focus-within:ring-2 focus-within:ring-sea/20">
                    <span className="flex items-center gap-1.5 pl-4 pr-3 border-r border-line text-sm text-ink-soft select-none" aria-hidden="true">
                      <span>🇺🇸</span>+1
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="Phone (optional)"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      pattern="\(\d{3}\) \d{3}-\d{4}|\+.{6,}"
                      title="Enter a 10-digit US number, or start with + for international"
                      className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input id="email" name="email" type="email" required autoComplete="email" placeholder="Email" className={input} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    defaultValue={area ? `I'd love to learn more about ${area}.` : undefined}
                    placeholder="Anything I should know? Timeline, budget, neighborhoods… (optional)"
                    className={`${input} resize-none`}
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="text-sm text-clay">
                  {errorMessage || "Something went wrong. Please try again."}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gold text-cream text-sm font-medium px-8 py-3.5 hover:bg-ink transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "loading" && <Loader2 size={18} className="animate-spin" />}
                {status === "loading" ? "Sending…" : "Send to Lara"}
              </button>
              <p className="text-xs text-ink-soft text-center">
                Your information stays private. I never share or sell it.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
