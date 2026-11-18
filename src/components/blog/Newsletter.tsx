import { Mail } from "lucide-react";
import { site } from "@/lib/site";

/** Newsletter invite shown on the blog pages. */
export default function Newsletter() {
  return (
    <section className="bg-cream-deep/70 border-y border-line">
      <div className="mx-auto max-w-5xl px-6 lg:px-10 py-12 md:py-14 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <span className="h-14 w-14 shrink-0 rounded-2xl bg-ink text-gold-light flex items-center justify-center">
          <Mail size={24} />
        </span>
        <div className="flex-1">
          <h2 className="font-display text-2xl md:text-3xl leading-tight">Get local market updates in your inbox</h2>
          <p className="mt-2 text-ink-soft">New articles, neighborhood news and homes before they hit the big sites. No spam, unsubscribe anytime.</p>
        </div>
        <a
          href={site.newsletterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center rounded-full bg-ink text-cream text-sm font-medium px-7 py-3.5 hover:bg-gold transition-colors"
        >
          Subscribe
        </a>
      </div>
    </section>
  );
}
