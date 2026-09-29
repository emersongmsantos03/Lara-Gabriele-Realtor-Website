"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { site } from "@/lib/site";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#services", label: "Buy & Sell" },
  { href: "/#off-market", label: "Off-Market" },
  { href: "/#reviews", label: "Reviews" },
  { href: "/areas", label: "Neighborhoods" },
  { href: "/guides", label: "Guides" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        solid ? "bg-cream/95 backdrop-blur-md shadow-sm border-b border-line" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-20 flex items-center justify-between">
        <div className="relative shrink-0">
          <Link href="/" className="relative block h-10 sm:h-11 w-[195px] sm:w-[220px]" aria-label="Pacific Friendly Realty — Lara Gabriele, REALTOR® — home">
            <Image
              src="/images/logo-light.png"
              alt="Pacific Friendly Realty — Lara Gabriele, REALTOR®"
              fill
              priority
              sizes="220px"
              className={`object-contain object-left transition-opacity duration-300 ${solid ? "opacity-0" : "opacity-100"}`}
            />
            <Image
              src="/images/logo.png"
              alt=""
              fill
              priority
              sizes="220px"
              className={`object-contain object-left transition-opacity duration-300 ${solid ? "opacity-100" : "opacity-0"}`}
            />
          </Link>
          {/* Sits on the logo's "Lara Gabriele · REALTOR®" line, just past its end. */}
          <a
            href={site.phoneHref}
            className={`absolute left-[76%] bottom-0 inline-flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-[11px] leading-none tracking-wide tabular-nums transition-colors ${
              solid ? "text-ink-soft hover:text-gold" : "text-cream/85 hover:text-gold-light"
            }`}
          >
            <Phone size={10} className={solid ? "text-gold" : "text-gold-light"} />
            {site.phone}
          </a>
        </div>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                solid ? "text-ink-soft hover:text-ink" : "text-cream/85 hover:text-cream"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/#contact"
            className={`inline-flex items-center rounded-full text-sm px-5 py-2.5 transition-colors ${
              solid
                ? "bg-ink text-cream hover:bg-gold hover:text-ink"
                : "bg-cream text-ink hover:bg-gold"
            }`}
          >
            Let&rsquo;s Talk
          </Link>
        </div>

        <button
          className={`lg:hidden -mr-2 w-11 h-11 inline-flex items-center justify-center transition-colors ${solid ? "text-ink" : "text-cream"}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden bg-cream border-t border-line px-6 py-6 flex flex-col gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base text-ink-soft"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="inline-flex justify-center items-center rounded-full bg-ink text-cream text-sm px-5 py-3 mt-2"
            onClick={() => setOpen(false)}
          >
            Let&rsquo;s Talk
          </Link>
        </div>
      )}
    </header>
  );
}
