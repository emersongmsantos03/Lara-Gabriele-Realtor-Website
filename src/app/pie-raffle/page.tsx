import type { Metadata } from "next";
import Image from "next/image";
import { CalendarCheck, Gift, PenLine, Phone } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import Reveal from "@/components/Reveal";
import PieArt from "@/components/raffle/PieArt";
import Countdown from "@/components/raffle/Countdown";
import RaffleForm from "@/components/raffle/RaffleForm";
import { raffle } from "@/lib/raffle";
import { site, jsonLdScript } from "@/lib/site";

const title = "Win a Pie for Christmas — Lara's Christmas Pie Raffle";
const description = `Three San Diego County neighbors win a fresh-baked holiday pie from Lara Gabriele. It takes 30 seconds to enter — enter by ${raffle.closesLabel}. No purchase necessary.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: raffle.path },
  openGraph: { title: "Win a pie for Christmas 🥧", description, url: raffle.path, type: "website" },
  twitter: { card: "summary_large_image", title: "Win a pie for Christmas 🥧", description },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Lara's Christmas Pie Raffle",
  description,
  startDate: "2026-11-23",
  endDate: raffle.closesAt,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  location: { "@type": "VirtualLocation", url: `${site.url}${raffle.path}` },
  organizer: { "@id": `${site.url}/#agent` },
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: 0, priceCurrency: "USD", url: `${site.url}${raffle.path}`, availability: "https://schema.org/InStock" },
};

const steps = [
  {
    icon: PenLine,
    when: `By ${raffle.closesLabel}`,
    title: "Enter in 30 seconds",
    text: "Name, email, your neighborhood and the pie you’d love. That’s it — one entry per person.",
  },
  {
    icon: CalendarCheck,
    when: raffle.drawLabel,
    title: "I draw 3 winners",
    text: "Picked completely at random from every entry, and contacted by email or phone that same day.",
  },
  {
    icon: Gift,
    when: "Before Christmas",
    title: "Your pie, fresh-baked",
    text: "We’ll set up a time that works for you so your pie arrives fresh for the holidays.",
  },
];

export default function PieRafflePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <NavBar />
      <main className="flex-1">
        {/* ---------- Hero + form ---------- */}
        <section id="top" className="relative overflow-hidden bg-ink text-cream">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-24 w-[620px] h-[620px] rounded-full bg-gold/25 blur-[120px]" />
            <div className="absolute -bottom-48 -left-32 w-[560px] h-[560px] rounded-full bg-sea/20 blur-[120px]" />
            <div className="raffle-snow absolute inset-0 opacity-70" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-32 pb-20 md:pt-40 md:pb-28 grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            <div className="lg:col-span-7 relative">
              <div className="hidden xl:block absolute -right-4 -top-6 w-[240px] h-[240px] pointer-events-none">
                <PieArt uid="pie-lg" className="w-full h-full raffle-float" />
              </div>
              <p className="inline-flex items-center gap-2 rounded-full bg-cream/[0.08] ring-1 ring-cream/15 px-4 py-1.5 text-[11px] sm:text-xs uppercase tracking-[0.28em] text-sea-light">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-light animate-pulse" />
                Lara&rsquo;s Christmas Pie Raffle
              </p>
              <h1 className="mt-6 font-display text-[52px] leading-[0.98] sm:text-7xl lg:text-[88px] tracking-tight text-balance">
                Win a <em className="text-gold-light italic pr-[0.08em]">pie</em> for Christmas.
              </h1>
              <p className="mt-6 max-w-lg text-lg sm:text-xl text-cream/80 leading-relaxed">
                Three neighbors win a fresh-baked holiday pie, on me. It takes 30 seconds to enter.
              </p>

              <div className="mt-9">
                <p className="text-xs uppercase tracking-[0.22em] text-cream/55 mb-3">Entries close {raffle.closesLabel} at midnight</p>
                <Countdown />
              </div>

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/70">
                <li className="flex items-center gap-2"><Dot /> 3 winners</li>
                <li className="flex items-center gap-2"><Dot /> Drawn {raffle.drawLabel}</li>
                <li className="flex items-center gap-2"><Dot /> No purchase necessary</li>
              </ul>

            </div>

            <div className="lg:col-span-5 relative">
              <div className="xl:hidden absolute -top-16 right-2 w-32 h-32 z-10 pointer-events-none">
                <PieArt uid="pie-sm" className="w-full h-full raffle-float" />
              </div>
              <RaffleForm />
            </div>
          </div>

          {/* scalloped crust edge into the next section */}
          <svg aria-hidden="true" viewBox="0 0 1440 40" preserveAspectRatio="none" className="relative block w-full h-6 sm:h-10 text-cream">
            <path
              fill="currentColor"
              d={`M0 40 V20 ${Array.from({ length: 36 }, (_, i) => `Q ${i * 40 + 20} 0 ${(i + 1) * 40} 20`).join(" ")} V40 Z`}
            />
          </svg>
        </section>

        {/* ---------- How it works ---------- */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <Reveal className="text-center max-w-2xl mx-auto">
              <p className="text-sea tracking-[0.28em] text-xs uppercase">How it works</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl leading-tight text-balance">
                Three easy steps to a very good December.
              </h2>
            </Reveal>

            <ol className="mt-14 grid md:grid-cols-3 gap-5 md:gap-6">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={i * 120}>
                  <li className="relative h-full rounded-3xl bg-white/70 ring-1 ring-line p-7 md:p-8">
                    <span className="absolute top-6 right-7 font-display text-6xl leading-none text-ink/[0.06]">{i + 1}</span>
                    <span className="inline-flex w-12 h-12 rounded-2xl bg-ink text-gold-light items-center justify-center">
                      <s.icon size={22} />
                    </span>
                    <p className="mt-6 text-xs uppercase tracking-[0.2em] text-gold">{s.when}</p>
                    <h3 className="mt-2 font-display text-2xl">{s.title}</h3>
                    <p className="mt-3 text-ink-soft leading-relaxed">{s.text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Note from Lara ---------- */}
        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <Reveal>
              <div className="relative overflow-hidden rounded-[32px] bg-cream-deep p-8 sm:p-12 md:p-14 grid md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
                <div aria-hidden="true" className="absolute -right-10 -bottom-16 font-display text-[260px] leading-none text-ink/[0.04] select-none">&rdquo;</div>
                <div className="relative mx-auto md:mx-0 w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden ring-4 ring-cream shadow-xl">
                  <Image src="/images/lara-headshot.jpg" alt="Lara Gabriele" fill sizes="176px" className="object-cover" />
                </div>
                <div className="relative">
                  <p className="text-sea tracking-[0.28em] text-xs uppercase">A note from Lara</p>
                  <blockquote className="mt-4 font-display text-2xl sm:text-[28px] leading-snug text-balance">
                    The holidays are about the people next door. This is my small way of saying thank you to the neighbors who make
                    North County feel like home.
                  </blockquote>
                  <p className="mt-5 text-ink-soft leading-relaxed">
                    No catch, no sales pitch — just pie. Good luck, and happy holidays from my family to yours.
                  </p>
                  <p className="mt-5 font-display text-xl">— Lara Gabriele</p>
                  <p className="text-sm text-ink-soft">{site.title} &middot; {site.brand}</p>
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-10 text-center">
              <a
                href="#enter"
                className="inline-flex items-center justify-center rounded-full bg-ink text-cream text-sm font-medium tracking-[0.14em] uppercase px-10 py-4 hover:bg-gold transition-colors shadow-[0_10px_30px_-10px_rgba(14,43,64,0.6)]"
              >
                Enter to win
              </a>
              <p className="mt-3 text-sm text-ink-soft">Enter by {raffle.closesLabel}. No purchase necessary.</p>
            </Reveal>
          </div>
        </section>

        {/* ---------- Official rules ---------- */}
        <section id="rules" className="pb-24 scroll-mt-28">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <details className="group rounded-2xl ring-1 ring-line bg-white/60 open:bg-white/80 transition-colors">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-6 py-5">
                <span className="font-display text-xl">Official rules</span>
                <span className="text-sm text-ink-soft group-open:hidden">Read</span>
                <span className="text-sm text-ink-soft hidden group-open:inline">Close</span>
              </summary>
              <div className="px-6 pb-6 text-sm text-ink-soft leading-relaxed space-y-3">
                <p><b className="text-ink">No purchase or transaction necessary to enter or win.</b> A purchase or real estate transaction will not improve your chances of winning.</p>
                <p><b className="text-ink">Who can enter:</b> legal U.S. residents of San Diego County, California, 18 years or older. Void where prohibited.</p>
                <p><b className="text-ink">How to enter:</b> complete the entry form on this page by 11:59 p.m. Pacific Time on Sunday, December 13, 2026. Limit one entry per person and per email address; duplicate entries are ignored.</p>
                <p><b className="text-ink">Drawing:</b> three (3) winners will be selected at random from all eligible entries on Monday, December 14, 2026. Odds of winning depend on the number of eligible entries received.</p>
                <p><b className="text-ink">Prize:</b> each winner receives one fresh-baked holiday pie, delivered or picked up at a mutually agreed time before December 25, 2026, within San Diego County. No cash alternative; prizes are not transferable.</p>
                <p><b className="text-ink">Winner notification:</b> winners will be contacted by email or phone and must respond within 48 hours, or an alternate winner may be drawn.</p>
                <p><b className="text-ink">Privacy:</b> your information is used only to run this raffle and contact winners. You&rsquo;ll receive market updates only if you check that box, and you can unsubscribe at any time. We never sell or share your information.</p>
                <p><b className="text-ink">Sponsor:</b> {site.agent}, {site.title}, {site.brand} &middot; CA DRE #{site.dreLicense} &middot; {site.brokerageLegal}, DRE #{site.brokerageDre}. Questions? Call or text <a href={site.phoneHref} className="underline underline-offset-2">{site.phone}</a>.</p>
              </div>
            </details>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />

      {/* Mobile: keep the entry one tap away. */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-cream/95 backdrop-blur-md border-t border-line px-4 py-3 flex items-center gap-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <a href={site.phoneHref} aria-label="Call Lara" className="w-12 h-12 shrink-0 inline-flex items-center justify-center rounded-full border border-ink/20 text-ink">
          <Phone size={18} className="text-gold" />
        </a>
        <a href="#enter" className="flex-1 inline-flex items-center justify-center rounded-full bg-ink text-cream text-sm font-medium tracking-[0.14em] uppercase py-3.5">
          Enter to win 🥧
        </a>
      </div>
    </>
  );
}

function Dot() {
  return <span className="w-1.5 h-1.5 rounded-full bg-gold-light" />;
}
