"use client";

import { FormEvent, useState } from "react";
import { Home, Loader2, ArrowRight } from "lucide-react";
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

  return (
    <section id="valuation" className="py-20 md:py-28 bg-ink text-cream relative overflow-hidden">
      <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative mx-auto max-w-3xl px-6 lg:px-10 text-center">
        <Reveal>
          <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center mx-auto">
            <Home size={20} className="text-gold-light" />
          </div>
          <p className="mt-6 text-gold-light text-xs md:text-sm tracking-[0.25em] uppercase">
            Free &amp; no obligation
          </p>
          <h2 className="mt-4 font-display text-3xl md:text-5xl leading-tight text-balance">
            Curious what your home is worth today?
          </h2>
          <p className="mt-5 text-cream/70 max-w-xl mx-auto leading-relaxed">
            Online estimates miss what makes your home unique. Get a complimentary, no-pressure valuation based on
            current San Diego County market data — usually back in your
            inbox within one business day.
          </p>
        </Reveal>

        <Reveal delay={100}>
          {status === "success" ? (
            <div className="mt-9 rounded-full border border-gold/40 bg-cream/5 px-8 py-4 inline-block">
              Thanks! I&rsquo;ll follow up with your estimate shortly.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-9 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
            >
              <label htmlFor="valuation-address" className="sr-only">
                Property address
              </label>
              <input
                id="valuation-address"
                type="text"
                name="address"
                autoComplete="street-address"
                required
                placeholder="Enter your property address"
                className="flex-1 rounded-full border border-cream/20 bg-cream/5 px-6 py-3.5 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold"
              />
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
                className="sm:w-48 rounded-full border border-cream/20 bg-cream/5 px-6 py-3.5 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold text-ink text-sm font-medium px-7 py-3.5 hover:bg-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === "loading" ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <ArrowRight size={16} />
                )}
                Get My Estimate
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-3 text-sm text-clay">
              Something went wrong. Please try again.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
