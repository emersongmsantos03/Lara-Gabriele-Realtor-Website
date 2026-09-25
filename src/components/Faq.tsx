import { Plus } from "lucide-react";
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
    <section id="faq" className="py-24 md:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqJsonLd)}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12">
        <Reveal className="lg:col-span-4">
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
            Good questions.
          </h2>
          <p className="mt-5 text-ink-soft leading-relaxed">
            Don&rsquo;t see your question?{" "}
            <a href="#contact" className="text-ink underline decoration-gold underline-offset-4 hover:text-gold">
              Ask me directly
            </a>{" "}
            — there&rsquo;s no such thing as a silly one.
          </p>
        </Reveal>

        <div className="lg:col-span-8 divide-y divide-line border-y border-line">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="group py-6">
                <summary className="flex items-start justify-between gap-6 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-lg md:text-xl text-ink group-hover:text-gold transition-colors">
                    {f.q}
                  </h3>
                  <span className="mt-1 w-7 h-7 shrink-0 rounded-full border border-line flex items-center justify-center group-open:rotate-45 group-open:bg-gold group-open:border-gold transition-all">
                    <Plus size={14} />
                  </span>
                </summary>
                <p className="mt-4 text-ink-soft leading-relaxed max-w-2xl">
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
