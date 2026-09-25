import Image from "next/image";
import { ArrowDown } from "lucide-react";
import { site } from "@/lib/site";

export default function Hero() {
  return (
    <section id="top" className="relative h-[100svh] min-h-[720px] w-full overflow-hidden">
      <Image
        src="/images/hero-poster.jpg"
        alt="Coastal homes in San Diego County"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="/images/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
      >
        {/* Desktop only: keeps the 8.5 MB video off mobile data plans. */}
        <source
          src="/images/hero-loop.mp4"
          type="video/mp4"
          media="(min-width: 768px)"
        />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-transparent" />

      <div className="relative z-10 h-full mx-auto max-w-7xl px-6 lg:px-10 flex items-end pb-20 md:pb-24">
        <div className="grid lg:grid-cols-12 gap-10 items-end w-full">
          <div className="lg:col-span-8">
            <p className="text-gold-light tracking-[0.3em] text-xs md:text-sm uppercase mb-5">
              San Diego County
            </p>
            <h1 className="font-display text-cream text-[2.6rem] leading-[1.03] sm:text-6xl md:text-7xl max-w-3xl text-balance">
              Your San Diego home story{" "}
              <em className="text-gold-light font-light">starts here.</em>
            </h1>
            <p className="mt-6 max-w-lg text-cream/85 text-base md:text-lg leading-relaxed">
              I&rsquo;m Lara Gabriele, a San Diego REALTOR&reg; helping you buy
              and sell from La Jolla to Carlsbad &mdash; with honesty and
              twenty years of local know-how.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#sell"
                className="inline-flex items-center rounded-full bg-gold text-ink text-sm font-medium px-7 py-3.5 hover:bg-gold-light transition-colors"
              >
                I&rsquo;m selling
              </a>
              <a
                href="#buy"
                className="inline-flex items-center rounded-full border border-cream/40 text-cream text-sm font-medium px-7 py-3.5 hover:bg-cream/10 transition-colors"
              >
                I&rsquo;m buying
              </a>
            </div>

            <div className="mt-10 flex items-center gap-5">
              <Image
                src="/images/exp-luxury-logo-light.png"
                alt="eXp Realty Luxury"
                width={871}
                height={252}
                className="h-7 w-auto opacity-90"
              />
              <span className="h-6 w-px bg-cream/25" />
              <a
                href={site.phoneHref}
                className="text-sm text-cream/80 hover:text-cream transition-colors"
              >
                {site.phone}
              </a>
            </div>
          </div>

          {/* Personal card: people hire a person, not a logo. */}
          <div className="hidden lg:block lg:col-span-4">
            <a
              href="#about"
              className="group block ml-auto max-w-[280px] rounded-2xl bg-cream/10 backdrop-blur-md ring-1 ring-cream/20 p-3 hover:bg-cream/15 transition-colors"
            >
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                <Image
                  src="/images/lara-headshot.jpg"
                  alt="Lara Gabriele, San Diego REALTOR®"
                  fill
                  priority
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  sizes="280px"
                />
              </div>
              <div className="px-2 pt-4 pb-2 flex items-center justify-between">
                <div>
                  <div className="font-display text-xl text-cream">Lara Gabriele</div>
                  <div className="text-xs text-cream/65 mt-0.5">REALTOR&reg; &middot; eXp Luxury</div>
                </div>
                <span className="text-xs text-gold-light tracking-wide uppercase">
                  Meet me →
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-8 right-6 lg:hidden z-10 text-cream/70 hover:text-cream transition-colors animate-bounce"
        aria-label="Scroll to learn more"
      >
        <ArrowDown size={22} />
      </a>
    </section>
  );
}
