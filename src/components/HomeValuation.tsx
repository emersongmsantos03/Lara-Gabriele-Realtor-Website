"use client";

import { FormEvent, useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

type Status = "idle" | "loading" | "success" | "error";

export default function HomeValuation() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "valuation",
          address: data.get("address"),
          email: data.get("email"),
        }),
      });

      if (!res.ok) throw new Error();

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const input =
    "w-full rounded-full border border-line bg-cream px-5 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-sea focus:ring-2 focus:ring-sea/20";

  return (
    <section id="valuation" className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="rounded-3xl bg-cream-deep/70 border border-line p-8 md:p-12 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">
                Free &amp; no obligation
              </p>
              <h2 className="font-display text-3xl md:text-4xl leading-tight text-balance">
                What&rsquo;s your home worth today?
              </h2>
              <p className="mt-3 text-ink-soft leading-relaxed max-w-md">
                A real valuation from local sales, not an online guess &mdash;
                usually in your inbox within one business day.
              </p>
            </div>

            {status === "success" ? (
              <p className="rounded-2xl bg-cream border border-line px-6 py-5 text-ink">
                Thanks! I&rsquo;ll follow up with your estimate shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <label htmlFor="valuation-address" className="sr-only">
                  Property address
                </label>
                <input
                  id="valuation-address"
                  type="text"
                  name="address"
                  autoComplete="street-address"
                  required
                  placeholder="Property address"
                  className={input}
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="valuation-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="valuation-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    placeholder="Your email"
                    className={`${input} sm:flex-1`}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-cream text-sm font-medium px-6 py-3 hover:bg-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {status === "loading" ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                    Get my estimate
                  </button>
                </div>
                {status === "error" && (
                  <p className="text-sm text-clay">Something went wrong. Please try again.</p>
                )}
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
