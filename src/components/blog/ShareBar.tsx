"use client";

import { useState } from "react";
import { Check, Link2, Mail } from "lucide-react";
import { trackBlog } from "./track";

const FB = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
    <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
  </svg>
);
const X = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
    <path d="M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
  </svg>
);
const IN = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
    <path d="M6.9 8.8H3.7V20h3.2V8.8ZM5.3 3.5a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8ZM20.3 13.6c0-3-1.6-5-4.3-5-1.3 0-2.4.7-2.9 1.5V8.8H10V20h3.2v-5.8c0-1.6.8-2.6 2.1-2.6 1.3 0 1.9.9 1.9 2.6V20h3.2v-6.4Z" />
  </svg>
);

export default function ShareBar({ slug, url, title, dark }: { slug: string; url: string; title: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const items = [
    { name: "Facebook", icon: FB, href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "X", icon: X, href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { name: "LinkedIn", icon: IN, href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { name: "Email", icon: <Mail size={16} />, href: `mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n\n${url}`)}` },
  ];
  const btn = `h-9 w-9 inline-flex items-center justify-center rounded-full border transition-colors ${
    dark ? "border-cream/25 text-cream/85 hover:bg-cream hover:text-ink" : "border-line text-ink-soft hover:bg-ink hover:text-cream hover:border-ink"
  }`;
  return (
    <div className="flex items-center gap-2" aria-label="Share this article">
      <span className={`text-xs mr-1 ${dark ? "text-cream/60" : "text-ink-soft"}`}>Share</span>
      {items.map((i) => (
        <a
          key={i.name}
          href={i.href}
          target={i.name === "Email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={btn}
          aria-label={`Share on ${i.name}`}
          title={`Share on ${i.name}`}
          onClick={() => trackBlog(slug, "share", i.name)}
        >
          {i.icon}
        </a>
      ))}
      <button
        type="button"
        className={btn}
        aria-label="Copy link"
        title={copied ? "Copied!" : "Copy link"}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {}
          trackBlog(slug, "share", "Copy link");
        }}
      >
        {copied ? <Check size={16} /> : <Link2 size={16} />}
      </button>
    </div>
  );
}
