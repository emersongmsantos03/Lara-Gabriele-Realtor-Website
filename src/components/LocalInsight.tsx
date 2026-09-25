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
    <section id="local-insight" className="py-24 md:py-32 bg-ink text-cream relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="grid lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <p className="text-gold-light text-xs md:text-sm tracking-[0.25em] uppercase mb-4">
                Local know-how
              </p>
              <h2 className="font-display text-3xl md:text-5xl leading-tight text-balance">
                Six things about buying in San Diego that most websites won&rsquo;t tell you.
              </h2>
            </div>
            <p className="lg:col-span-5 text-cream/65 leading-relaxed">
              This is the kind of advice that saves clients real money — and
              it&rsquo;s why working with someone who knows the county block by
              block matters.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-cream/10 rounded-2xl overflow-hidden">
          {insights.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 90}>
              <div className="h-full bg-ink p-8 hover:bg-[#123650] transition-colors">
                <div className="font-display text-4xl text-gold-light/40">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 font-display text-xl">{item.title}</h3>
                <p className="mt-3 text-sm text-cream/65 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
