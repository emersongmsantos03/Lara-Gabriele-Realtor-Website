import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { faqs } from "@/lib/data";
import { jsonLdScript } from "@/lib/site";
import Reveal from "./Reveal";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function Faq() {
  return (
    <section id="faq" className="py-16 md:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqJsonLd)}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-8 lg:gap-12">
        <Reveal className="lg:col-span-4">
          <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">FAQ</p>
          <h2 className="font-display text-3xl md:text-4xl leading-tight">
            Good questions.
          </h2>
          <p className="mt-3 text-sm text-ink-soft leading-relaxed">
            Don&rsquo;t see your question?{" "}
            <a href="#contact" className="text-ink underline decoration-gold underline-offset-4 hover:text-gold">
              Ask me directly
            </a>{" "}
            — there&rsquo;s no such thing as a silly one.
          </p>
          <Link
            href="/guides"
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-gold transition-colors"
          >
            Read my guides from a former underwriter
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="lg:col-span-8 divide-y divide-line border-y border-line">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 40}>
              <details className="group py-5">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-lg text-ink group-hover:text-gold transition-colors">
                    {f.q}
                  </h3>
                  <span className="mt-1 w-7 h-7 shrink-0 rounded-full border border-line flex items-center justify-center group-open:rotate-45 group-open:bg-gold group-open:border-gold transition-all">
                    <Plus size={14} />
                  </span>
                </summary>
                <p className="mt-3 text-sm md:text-base text-ink-soft leading-relaxed max-w-2xl">
                  {f.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
