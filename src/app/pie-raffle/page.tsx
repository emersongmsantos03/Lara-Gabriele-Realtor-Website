import type { Metadata } from "next";
import Link from "next/link";
import { Check, Phone } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PieArt from "@/components/raffle/PieArt";
import Countdown from "@/components/raffle/Countdown";
import { raffle } from "@/lib/raffle";
import { site } from "@/lib/site";

const description = `Thank you for entering Lara's Christmas Pie Raffle. Three winners are drawn ${raffle.drawLabel}.`;

// Thank-you page people reach after entering from Lara's email.
// Kept out of Google: it only makes sense right after entering.
export const metadata: Metadata = {
  title: { absolute: "You're in! — Lara's Christmas Pie Raffle" },
  description,
  alternates: { canonical: raffle.path },
  robots: { index: false, follow: true },
  openGraph: { title: "Lara's Christmas Pie Raffle 🥧", description, url: raffle.path, type: "website" },
};

export default function PieRaffleThankYou() {
  return (
    <>
      <NavBar />
      <main className="flex-1">
        <section id="top" className="relative overflow-hidden bg-ink text-cream min-h-[100svh] flex flex-col">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 -right-24 w-[620px] h-[620px] rounded-full bg-gold/25 blur-[120px]" />
            <div className="absolute -bottom-48 -left-32 w-[560px] h-[560px] rounded-full bg-sea/20 blur-[120px]" />
            <div className="raffle-snow absolute inset-0 opacity-70" />
          </div>

          <div className="relative flex-1 mx-auto w-full max-w-6xl px-6 lg:px-10 pt-32 pb-20 md:pt-36 md:pb-24 grid content-center lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-cream/[0.08] ring-1 ring-cream/15 px-4 py-1.5 text-[11px] sm:text-xs uppercase tracking-[0.28em] text-sea-light">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-light animate-pulse" />
                Lara&rsquo;s Christmas Pie Raffle
              </p>

              <div className="mt-8 flex justify-center lg:justify-start">
                <span className="relative inline-flex w-16 h-16 rounded-full bg-sea/20 ring-1 ring-sea-light/40 items-center justify-center">
                  <Check size={30} className="text-sea-light" />
                  <span className="absolute inset-0 rounded-full ring-2 ring-sea-light/30 animate-ping" />
                </span>
              </div>

              <h1 className="mt-6 font-display text-[52px] leading-[0.98] sm:text-7xl lg:text-[84px] tracking-tight text-balance">
                You&rsquo;re in. <em className="text-gold-light italic pr-[0.08em]">Thank you!</em>
              </h1>
              <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg sm:text-xl text-cream/80 leading-relaxed">
                Your entry for a fresh-baked Christmas pie is in. I&rsquo;ll draw {raffle.winners} winners on {raffle.drawLabel} and
                get in touch with the winners by email or phone. Good luck!
              </p>

              <div className="mt-10 flex flex-col items-center lg:items-start">
                <Countdown label="The drawing is in" />
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full bg-cream text-ink text-sm font-medium px-7 py-3.5 hover:bg-gold-light transition-colors"
                >
                  Visit Pacific Friendly Realty
                </Link>
                <a
                  href={site.phoneHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full ring-1 ring-cream/25 text-cream text-sm px-7 py-3.5 hover:bg-cream/10 transition-colors"
                >
                  <Phone size={16} className="text-gold-light" /> {site.phone}
                </a>
              </div>

              <p className="mt-10 font-display text-xl text-cream/90">Happy holidays — Lara Gabriele</p>
            </div>

            <div className="lg:col-span-5 flex justify-center order-first lg:order-none">
              <PieArt uid="pie" className="w-48 h-48 sm:w-64 sm:h-64 lg:w-[400px] lg:h-[400px] raffle-float" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
