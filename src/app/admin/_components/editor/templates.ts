// Starting points for new posts. Placeholders in [brackets] are meant to be
// replaced. The HTML uses the same block formats the editor produces.

const MAIN = "https://www.pacificfriendlyrealty.com";

const btn = (text: string, href: string, color = "#c9671f") =>
  `<div data-type="button" data-align="center"><a href="${href}" data-variant="filled" data-size="md" data-shape="pill" style="background-color:${color};color:#ffffff;border-color:${color}">${text}</a></div>`;
const box = (inner: string, bg = "#f4ecdf", emoji = "") =>
  `<div data-type="callout" data-tone="light"${emoji ? ` data-emoji="${emoji}"` : ""} style="background-color:${bg}">${inner}</div>`;

export type Template = { id: string; label: string; desc: string; emoji: string; title: string; tags: string[]; html: string };

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    label: "Blank post",
    desc: "Start from an empty page",
    emoji: "📝",
    title: "",
    tags: [],
    html: "",
  },
  {
    id: "market",
    label: "Market update",
    desc: "Monthly prices, inventory and what it means",
    emoji: "📈",
    title: "[Neighborhood] market update: [Month Year]",
    tags: ["Market update"],
    html: `<p>Here's what happened in the <strong>[Neighborhood]</strong> real estate market this month, and what it means if you're thinking of buying or selling.</p>
<h2>The numbers at a glance</h2>
<table><tbody><tr><th><p></p></th><th><p>This month</p></th><th><p>Last year</p></th></tr><tr><td><p>Median sale price</p></td><td><p>$[0]</p></td><td><p>$[0]</p></td></tr><tr><td><p>Homes sold</p></td><td><p>[0]</p></td><td><p>[0]</p></td></tr><tr><td><p>Days on market</p></td><td><p>[0]</p></td><td><p>[0]</p></td></tr></tbody></table>
<h2>What it means for buyers</h2><p>[Write two or three sentences.]</p>
<h2>What it means for sellers</h2><p>[Write two or three sentences.]</p>
${box("<p><strong>Thinking about selling?</strong> I'll put together a free value report based on real sales in your neighborhood.</p>", "#e6f1fb", "💡")}
${btn("Get my free home value", `${MAIN}/#valuation`)}`,
  },
  {
    id: "listing",
    label: "New listing",
    desc: "Show off a home that just hit the market",
    emoji: "🏡",
    title: "Just listed: [Address], [City]",
    tags: ["New listing"],
    html: `<p class="lead">[One sentence that makes people want to see this home.]</p>
<ul><li><p><strong>[0] bedrooms · [0] bathrooms</strong></p></li><li><p><strong>[0] sq ft</strong> on a [0] sq ft lot</p></li><li><p><strong>$[Price]</strong></p></li></ul>
<h2>Why you'll love it</h2><p>[Describe the best features: views, kitchen, backyard, location.]</p>
<h2>The neighborhood</h2><p>[Schools, parks, shopping, commute.]</p>
<div data-type="map" data-address="[Address], [City], CA"></div>
${btn("Schedule a private tour", `${MAIN}/#contact`, "#1b8a99")}`,
  },
  {
    id: "openhouse",
    label: "Open house",
    desc: "Date, time, address and a map",
    emoji: "🔑",
    title: "Open house this [Day] at [Address]",
    tags: ["Open house"],
    html: `${box("<p><strong>📅 [Day, Month Date]</strong><br>⏰ [1:00 PM – 4:00 PM]<br>📍 [Address], [City]</p>", "#fde8da")}
<p>Come see this [bedrooms]-bedroom home in <strong>[Neighborhood]</strong>. [One or two sentences about the home.]</p>
<h2>Highlights</h2><ul><li><p>[Highlight]</p></li><li><p>[Highlight]</p></li><li><p>[Highlight]</p></li></ul>
<div data-type="map" data-address="[Address], [City], CA"></div>
<p>Can't make it? I'm happy to show you the home privately.</p>
${btn("Book a private showing", `${MAIN}/#contact`)}`,
  },
  {
    id: "guide",
    label: "Neighborhood guide",
    desc: "What it's like to live there",
    emoji: "📍",
    title: "Living in [Neighborhood]: a local's guide",
    tags: ["Neighborhood guide"],
    html: `<p>[Neighborhood] is one of [City]'s most [quiet / walkable / sought-after] neighborhoods. Here's what daily life looks like.</p>
<h2>The homes</h2><p>[Home styles, years built, lot sizes, price range.]</p>
<h2>Things to do</h2><ul><li><p><strong>[Place]</strong> – [why locals love it]</p></li><li><p><strong>[Place]</strong> – [why locals love it]</p></li></ul>
<h2>Schools</h2><p>[District and nearby schools. Always confirm boundaries with the district.]</p>
${box("<p><strong>Good to know:</strong> [HOA, Mello-Roos, commute tip…]</p>", "#e3f4ea", "📌")}
${btn("Ask me about [Neighborhood]", `${MAIN}/#contact`)}`,
  },
  {
    id: "buyers",
    label: "Buyer tips",
    desc: "Advice for people buying a home",
    emoji: "💡",
    title: "[Number] things to know before buying in [Area]",
    tags: ["Buying"],
    html: `<p>Buying a home in [Area]? Here's what I tell every buyer before they make an offer.</p>
<h2>1. [Tip]</h2><p>[Explain.]</p><h2>2. [Tip]</h2><p>[Explain.]</p><h2>3. [Tip]</h2><p>[Explain.]</p>
<blockquote><p>[A short quote or testimonial from a happy buyer.]</p></blockquote>
${btn("Talk to Lara", `${MAIN}/#contact`)}`,
  },
  {
    id: "sellers",
    label: "Seller checklist",
    desc: "Step-by-step list to get ready to sell",
    emoji: "✅",
    title: "Getting your home ready to sell: a checklist",
    tags: ["Selling"],
    html: `<p>A little preparation goes a long way. Use this checklist in the weeks before you list.</p>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Fix small things buyers notice (doors, paint, light bulbs)</p></li><li data-type="taskItem" data-checked="false"><p>Deep clean and declutter every room</p></li><li data-type="taskItem" data-checked="false"><p>Refresh the front yard and entry</p></li><li data-type="taskItem" data-checked="false"><p>Gather receipts, permits and HOA documents</p></li><li data-type="taskItem" data-checked="false"><p>Book professional photos</p></li></ul>
${box("<p>Want a pricing plan based on real sales near you? It's free and there's no obligation.</p>", "#0e2b40")}
${btn("Get my free home value", `${MAIN}/#valuation`)}`,
  },
];
