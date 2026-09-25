import Image from "next/image";
import Reveal from "./Reveal";
import { areas } from "@/lib/areas";

const facts = [
  { value: "20+", label: "years in real estate" },
  { value: String(areas.length), label: "San Diego communities" },
  { value: "1:1", label: "you work with me directly" },
];

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 rounded-3xl overflow-hidden">
            <Image
              src="/images/lara-bw.jpg"
              alt="Lara Gabriele, San Diego REALTOR®"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 90vw"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="font-display text-4xl md:text-6xl leading-[1.05] text-balance">
              Buying or selling a home is personal. I treat it that way.
            </h2>
            <div className="mt-8 space-y-5 text-ink-soft text-lg leading-relaxed max-w-xl">
              <p>
                For more than twenty years I&rsquo;ve helped San Diego families
                move with confidence — telling the truth about value,
                negotiating like it&rsquo;s my own money, and handling every
                detail so you don&rsquo;t have to.
              </p>
              <p>No assistants, no call centers. You call, I answer.</p>
            </div>
            <p className="mt-8 font-display italic text-3xl text-gold">Lara</p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-xl border-t border-line pt-8">
              {facts.map((f) => (
                <div key={f.label}>
                  <div className="font-display text-3xl md:text-4xl text-ink">{f.value}</div>
                  <div className="mt-1 text-sm text-ink-soft">{f.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
