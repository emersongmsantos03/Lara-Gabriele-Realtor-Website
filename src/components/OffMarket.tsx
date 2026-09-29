import { ArrowRight, Lock } from "lucide-react";
import { getWisprInventory, type WisprListing } from "@/lib/wispr";
import IntentLink from "./IntentLink";
import Reveal from "./Reveal";

function facts(l: WisprListing) {
  return [
    l.priceLabel,
    l.beds !== undefined && `${l.beds} bd`,
    l.baths !== undefined && `${l.baths} ba`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default async function OffMarket() {
  // Empty until the Wispr API is configured — see src/lib/wispr.ts.
  const { listings, total } = await getWisprInventory(3);

  return (
    <section id="off-market" className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink text-cream p-8 md:p-12">
            <div
              aria-hidden="true"
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-sea/25 blur-3xl"
            />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-8 md:gap-12 items-center">
              <div>
                <p className="inline-flex items-center gap-2 text-gold-light text-xs tracking-[0.25em] uppercase mb-3">
                  <Lock size={12} />
                  Wispr Properties
                </p>
                <h2 className="font-display text-3xl md:text-4xl leading-tight">
                  Off-market homes, shared privately.
                </h2>
                <p className="mt-3 text-cream/70 leading-relaxed max-w-xl">
                  Homes whose owners sell quietly &mdash; not on the MLS, Zillow
                  or any public site. The only way to see them is through me.
                </p>

                {listings.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-cream/60 mb-2">
                      {total} private {total === 1 ? "home" : "homes"} available now
                    </p>
                    <ul className="divide-y divide-cream/10 border-y border-cream/10 max-w-xl">
                      {listings.map((l) => (
                        <li key={l.id} className="py-2.5 flex items-center justify-between gap-4 text-sm">
                          <span className="inline-flex items-center gap-2 min-w-0">
                            <Lock size={12} className="text-gold-light shrink-0" />
                            <span className="truncate">{l.area}</span>
                          </span>
                          <span className="text-cream/70 whitespace-nowrap">{facts(l)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start md:items-center gap-3">
                <IntentLink
                  intent="Off-market homes"
                  message="I'd like private access to Wispr Properties off-market homes."
                  className="group inline-flex items-center gap-2 rounded-full bg-gold-light text-ink text-sm font-medium px-7 py-3.5 hover:bg-cream transition-colors"
                >
                  Request private access
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </IntentLink>
                <IntentLink
                  intent="Sell"
                  message="I'm interested in selling my home privately through Wispr Properties."
                  className="text-sm text-cream/70 hover:text-cream transition-colors"
                >
                  Selling quietly? Ask me how
                </IntentLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
