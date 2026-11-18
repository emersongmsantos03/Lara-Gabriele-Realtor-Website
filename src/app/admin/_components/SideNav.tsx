"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpenCheck, ExternalLink, FileText, LogOut, PenSquare, ShieldCheck } from "lucide-react";
import { SITE_LIST } from "@/lib/admin/sites";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: BarChart3, exact: true },
  { href: "/admin/posts", label: "Blog posts", icon: FileText },
  { href: "/admin/blog-stats", label: "Blog stats", icon: BookOpenCheck },
  { href: "/admin/account", label: "Security", icon: ShieldCheck },
];

export default function SideNav({ name }: { name: string }) {
  const path = usePathname();
  const active = (href: string, exact?: boolean) => (exact ? path === href : path.startsWith(href));

  return (
    <aside className="lg:w-[248px] lg:shrink-0 lg:min-h-screen bg-[var(--a-navy)] text-white lg:sticky lg:top-0 lg:h-screen flex lg:flex-col">
      <div className="flex lg:flex-col flex-1 items-center lg:items-stretch gap-2 lg:gap-0 px-3 lg:px-4 py-2.5 lg:py-6 overflow-x-auto">
        <Link href="/admin" className="shrink-0 lg:px-2 lg:mb-8 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-mark.png" alt="" className="h-9 w-9 object-contain bg-white rounded-lg p-1" />
          <span className="hidden lg:block leading-tight">
            <span className="block text-[15px] font-semibold">Pacific Friendly</span>
            <span className="block text-xs text-white/55">Admin</span>
          </span>
        </Link>

        <nav className="flex lg:flex-col gap-1" aria-label="Admin">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-3 h-10 text-sm font-medium whitespace-nowrap transition-colors ${
                active(href, exact) ? "bg-white/14 text-white" : "text-white/70 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <Link
            href="/admin/posts/new"
            aria-label="Write a post"
            className="lg:mt-3 flex items-center gap-3 rounded-lg px-2.5 sm:px-3 h-10 text-sm font-semibold whitespace-nowrap bg-[var(--a-accent)] hover:bg-[#b15816] transition-colors"
          >
            <PenSquare size={18} />
            <span className="hidden sm:inline">Write a post</span>
          </Link>
        </nav>

        <div className="hidden lg:block mt-10">
          <p className="px-3 text-[11px] uppercase tracking-[0.14em] text-white/45 mb-2">Your websites</p>
          {SITE_LIST.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/8"
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="truncate">{s.short}</span>
              <ExternalLink size={13} className="ml-auto opacity-0 group-hover:opacity-60" />
            </a>
          ))}
        </div>

        <form action="/api/admin/logout" method="post" className="ml-auto lg:ml-0 lg:mt-auto shrink-0">
          <div className="hidden lg:block px-3 mb-2 text-xs text-white/50">
            Signed in as <span className="text-white/85">{name}</span>
          </div>
          <button aria-label="Log out" className="flex items-center gap-3 rounded-lg px-2.5 sm:px-3 h-10 text-sm text-white/70 hover:text-white hover:bg-white/8 w-full">
            <LogOut size={18} />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
