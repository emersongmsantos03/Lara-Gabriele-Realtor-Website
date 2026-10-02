import Image from "next/image";
import Reveal from "./Reveal";
import { site } from "@/lib/site";

const facts = [
  { value: "15", label: "years as a mortgage underwriter" },
  { value: "2009", label: "selling homes since" },
  { value: "1:1", label: "you work with me directly" },
];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[4/3] sm:aspect-[4/5] w-full max-w-sm mx-auto lg:mx-0 rounded-3xl overflow-hidden">
            <Image
              src="/images/lara-bw.jpg"
              alt="Lara Gabriele, San Diego REALTOR®"
              fill
              className="object-cover object-[50%_25%]"
              sizes="(min-width: 1024px) 40vw, 90vw"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="font-display text-3xl md:text-5xl leading-[1.1] text-balance">
              I spent 15 years on the lender&rsquo;s side of the table.
            </h2>
            <div className="mt-6 space-y-4 text-ink-soft md:text-lg leading-relaxed max-w-xl">
              <p>
                Before I became a REALTOR&reg; in 2009, I was a senior mortgage
                underwriter. I know which offers will actually close, why deals
                fall apart in escrow, and how to structure financing so yours
                doesn&rsquo;t.
              </p>
              <p>
                Today I help buyers and sellers from my home base in San Marcos,
                across Poway, North County and the coast &mdash; with honest
                advice and a lot of attention to detail.
              </p>
              <p>
                I&rsquo;m also a certified Seniors Real Estate Specialist
                (SRES&reg;) and a luxury specialist &mdash; whether you&rsquo;re
                downsizing after decades in one home or buying at the high end.
              </p>
              <p>No assistants, no call centers. You call, I answer.</p>
            </div>
            <p className="mt-6 font-display italic text-2xl text-gold">Lara</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-xl border-t border-line pt-6">
              {facts.map((f) => (
                <div key={f.label}>
                  <div className="font-display text-2xl md:text-3xl text-ink">{f.value}</div>
                  <div className="mt-1 text-sm text-ink-soft">{f.label}</div>
                </div>
              ))}
            </div>
            <ul className="mt-6 flex flex-wrap gap-2 max-w-xl">
              {site.credentials.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-gold/40 px-3.5 py-1.5 text-xs text-ink-soft"
                >
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
