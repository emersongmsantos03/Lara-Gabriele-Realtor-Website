import Reveal from "./Reveal";

const insights = [
  {
    title: "Visit in May and June, too",
    detail:
      "\"May Gray\" and \"June Gloom\" can keep some coastal streets overcast for weeks while homes a few miles inland are sunny. I'll tell you how a home feels in every season, not just on a perfect showing day.",
  },
  {
    title: "Ask about Mello-Roos",
    detail:
      "Many newer communities — parts of Carmel Valley, San Marcos and Otay Ranch — carry special tax assessments on top of property tax. They can add hundreds per month, so we factor them in before you fall in love.",
  },
  {
    title: "Check the flight path",
    detail:
      "Parts of Point Loma, Mission Hills and Ocean Beach sit under San Diego International's approach. Some buyers don't mind; others do. You'll know before you make an offer.",
  },
  {
    title: "Get insurance quotes early",
    detail:
      "Homeowners insurance has become harder to find in some inland and canyon-edge areas. I have buyers get quotes during escrow — not after — so there are no surprises at the finish line.",
  },
  {
    title: "Coastal rules shape remodels",
    detail:
      "Bluff-top and near-beach homes may need Coastal Commission review for major changes. If you're buying to renovate, we'll look at what's realistically possible first.",
  },
  {
    title: "Solar and ADUs add real value",
    detail:
      "With some of the highest electricity rates in the country, owned solar is a big selling point here. And California's ADU laws make a backyard cottage a genuine income or family option on many lots.",
  },
];

export default function LocalInsight() {
  return (
    <section id="local-insight" className="py-16 md:py-20 bg-cream-deep/60 border-t border-line">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <p className="text-gold text-xs tracking-[0.25em] uppercase mb-3">Local know-how</p>
          <h2 className="font-display text-3xl md:text-4xl leading-tight text-balance max-w-2xl">
            Six things most websites won&rsquo;t tell you about buying here.
          </h2>
        </Reveal>

        <Reveal delay={100}>
          <ol className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
            {insights.map((item, i) => (
              <li key={item.title} className="border-t border-line pt-5">
                <span className="text-xs font-medium text-gold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-display text-lg">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{item.detail}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
