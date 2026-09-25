import Image from "next/image";
import Link from "next/link";
import { areas } from "@/lib/areas";
import { site } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="7.5" y1="10" x2="7.5" y2="16.5" />
      <circle cx="7.5" cy="7" r="0.6" fill="currentColor" />
      <path d="M11.5 16.5V10M11.5 12.7c0-1.5 1-2.7 2.5-2.7s2.5 1.2 2.5 2.7v3.8" />
    </svg>
  );
}

function EqualHousingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10v9.5h13V10" />
      <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
      <line x1="9.5" y1="16.5" x2="14.5" y2="16.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-ink text-cream/70 border-t border-cream/10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Image
              src="/images/logo-light.png"
              alt="Pacific Friendly Realty — Lara Gabriele, REALTOR®"
              width={1200}
              height={230}
              className="h-12 w-auto"
            />
            <p className="mt-5 text-sm max-w-sm">
              Lara Gabriele, San Diego REALTOR&reg; — helping buyers and
              sellers move with confidence across San Diego County.
            </p>
            <div className="mt-5 space-y-1.5 text-sm">
              <a href={site.phoneHref} className="block hover:text-gold-light transition-colors">
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="block hover:text-gold-light transition-colors">
                {site.email}
              </a>
            </div>
            <Image
              src="/images/exp-luxury-logo-light.png"
              alt="eXp Realty Luxury"
              width={871}
              height={252}
              className="mt-6 h-7 w-auto opacity-90"
            />
            <div className="mt-6 flex items-center gap-4">
              <a
                href={site.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              >
                <InstagramIcon />
              </a>
              <a
                href={site.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-colors"
              >
                <LinkedinIcon />
              </a>
            </div>
            <a
              href={site.newsletterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-1.5 text-sm text-gold-light hover:text-cream transition-colors"
            >
              Get new listings before they hit the market
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          <nav aria-label="San Diego neighborhoods" className="lg:col-span-8">
            <p className="text-gold-light text-xs tracking-[0.25em] uppercase mb-4">
              <Link href="/areas" className="hover:text-cream transition-colors">
                San Diego neighborhoods
              </Link>
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5 text-sm">
              {areas.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/areas/${a.slug}`}
                    className="hover:text-gold-light transition-colors"
                  >
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col md:flex-row gap-3 md:gap-6 text-xs">
          <span>© {new Date().getFullYear()} Pacific Friendly Realty. All rights reserved.</span>
          <span>
            Lara Gabriele, REALTOR&reg; — eXp Realty of California, Inc.
            {site.dreLicense && <> &middot; DRE #{site.dreLicense}</>}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <EqualHousingIcon />
            Equal Housing Opportunity
          </span>
        </div>
      </div>
    </footer>
  );
}
