import "server-only";

// The original starter articles of SantaFeHillsSD.com and LomasVerdesEstates.com,
// moved into the admin (migration 3) so every post is managed in one place.
// Only used once, to create the posts; after that they live in the database.

export type StarterPost = {
  slug: string;
  site: "santafe" | "lomasverdes";
  title: string;
  excerpt: string;
  /** File in public/images/blog/. */
  image: string;
  imageAlt: string;
  tags: string[];
  publishAt: string;
  contentHtml: string;
};

export const STARTER_POSTS: StarterPost[] = [
  {
    "slug": "buying-in-santa-fe-hills-what-to-check",
    "site": "santafe",
    "title": "Buying in Santa Fe Hills? 5 things to check before you make an offer",
    "excerpt": "No HOA on many streets is a big draw. Here's what else to look at, from Mello-Roos to solar, before you write an offer in Santa Fe Hills.",
    "image": "sf-hero.jpg",
    "imageAlt": "Aerial view of homes in Santa Fe Hills, San Marcos",
    "tags": [
      "Buying"
    ],
    "publishAt": "2026-11-17T18:02:00.000Z",
    "contentHtml": "<p>Santa Fe Hills is one of those San Marcos neighborhoods people go looking for on purpose. Homes don't come up often, so when one does, you want to be ready to move. Here's what to check first.</p><h2>1. HOA: none, or a small one?</h2><p>Many streets in Santa Fe Hills have no HOA at all, which is a big part of the appeal. But some pockets, like Rancho Santalina and some newer builds, do have their own associations with monthly dues. Don't assume. Ask for the HOA status of the exact address, and if there is one, read the CC&amp;Rs and the budget before you're out of contingencies.</p><h2>2. Mello-Roos and special taxes</h2><p>Listings here often mention low Mello-Roos, but special assessments are set property by property. Pull the actual tax bill for the home you're considering so you know your real monthly cost, not an estimate.</p><h2>3. Solar: owned, leased or financed?</h2><p>Plenty of homes in the area have solar. Paid-off panels are a plus. A lease or a loan can come with a transfer process and a monthly payment you'll take over. Get the contract early.</p><h2>4. School assignments</h2><p>Santa Fe Hills is in San Marcos Unified School District. Boundaries can change, so confirm the assigned schools for the specific address directly with the district.</p><h2>5. The age of big-ticket items</h2><p>Most homes here were built between 1990 and 2005. That means roofs, water heaters, HVAC systems and windows may be original or recently replaced, and the difference matters. A good inspection, and asking the seller for receipts, will tell you which one you're getting.</p><h2>The bottom line</h2><p>With few homes for sale at any time, the buyers who win in Santa Fe Hills are the ones who did this homework before the right house appeared. Get pre-approved, set up alerts, and know the neighborhood street by street.</p>"
  },
  {
    "slug": "selling-in-santa-fe-hills-before-you-list",
    "site": "santafe",
    "title": "Thinking of selling in Santa Fe Hills? 6 steps before you list",
    "excerpt": "Homes here don't come up often, which works in your favor. These six steps help you get top dollar when you do sell.",
    "image": "sf-lake.jpg",
    "imageAlt": "Lake and footbridge near Santa Fe Hills",
    "tags": [
      "Selling"
    ],
    "publishAt": "2026-11-17T18:01:00.000Z",
    "contentHtml": "<p>Because Santa Fe Hills owners tend to stay put, a well-prepared listing here gets attention fast. These six steps make the difference between \"sold quickly\" and \"sold for the most it could.\"</p><h2>1. Price from the neighborhood, not the zip code</h2><p>Online estimates mix Santa Fe Hills in with very different parts of 92069. The right price comes from recent sales of comparable homes on comparable streets: same size range, similar lot, same HOA situation.</p><h2>2. Lead with \"no HOA\" if it applies</h2><p>If your street has no HOA, say so up front. It's one of the most-searched features for buyers in this area. If you do have an HOA, have the documents ready so buyers aren't left guessing.</p><h2>3. Fix the small things buyers notice</h2><p>Touch-up paint, sticky doors, dated light fixtures and tired landscaping cost little to fix and change how buyers feel in the first five minutes.</p><h2>4. Gather your paperwork early</h2><p>Roof and HVAC receipts, solar contracts, permits for any additions and your HOA documents (if any). Having them ready makes your home feel lower-risk, and that shows up in the offers.</p><h2>5. Show off the outdoors</h2><p>Hillside views, the backyard and nearby trails are a big part of why people buy here. Great photos of the outdoor spaces matter as much as the kitchen.</p><h2>6. Consider a quiet pre-market launch</h2><p>Some sellers want to test the market privately before going public. A pre-market or off-market launch can reach serious local buyers first, without the home sitting on public sites.</p><p>Curious what your home would sell for today? Lara can put together a free value report based on real Santa Fe Hills sales.</p>"
  },
  {
    "slug": "living-in-lomas-verdes-estates",
    "site": "lomasverdes",
    "title": "Living in Lomas Verdes Estates: a guide to North Poway's acre-lot enclave",
    "excerpt": "Single-level estates, acre lots, low HOA dues and a winery down the road. What daily life looks like in Lomas Verdes Estates.",
    "image": "lv-hero.jpg",
    "imageAlt": "Estate homes in Lomas Verdes Estates, North Poway",
    "tags": [
      "Neighborhood guide"
    ],
    "publishAt": "2026-11-17T18:02:00.000Z",
    "contentHtml": "<p>Lomas Verdes Estates sits in the hills of North Poway, off Valle Verde and Old Winery Road. It's a small, established enclave of estate homes: private and quiet, yet close to wineries, golf, trails and shopping.</p><h2>The homes</h2><p>Most homes were built in the mid-1980s and early 1990s on lots of around one acre. You'll find custom and semi-custom estates, many of them single-level, typically from about 3,000 to 6,500 square feet with three to five bedrooms. Pools, mature landscaping and three-car garages are common, and some homes sit behind private gates.</p><h2>The views</h2><p>Elevated lots give many homes panoramic views across the golf course, the historic Old Winery and the Lake Hodges basin. Sunsets are part of the deal.</p><h2>Low HOA dues</h2><p>The Lomas Verdes Estates HOA keeps annual dues modest, around $460–$525 a year in recent listings. That's unusually low for homes at this level.</p><h2>Weekends close to home</h2><ul><li><b>Bernardo Winery</b>, the region's historic winery, with shops and cafés. Some homes are within walking distance.</li><li><b>Rancho Bernardo Inn</b>, for championship golf, the spa and dining.</li><li><b>Lake Poway</b> and a network of hiking and biking trails, including the climb to Potato Chip Rock.</li></ul><h2>Schools</h2><p>Homes here are in Poway Unified School District, one of the most sought-after in San Diego County. Chaparral Elementary is close by. Always confirm the assigned schools for a specific address with the district.</p><p>Thinking about a move into, or out of, Lomas Verdes Estates? Lara can walk you through what's selling and why.</p>"
  },
  {
    "slug": "selling-an-acre-lot-estate-in-north-poway",
    "site": "lomasverdes",
    "title": "Selling an acre-lot estate in North Poway: how to price and prepare",
    "excerpt": "Estate homes don't sell like tract homes. How to price, prepare and market a Lomas Verdes Estates property for the right buyer.",
    "image": "lv-lake.jpg",
    "imageAlt": "Lake view near Lomas Verdes Estates",
    "tags": [
      "Selling"
    ],
    "publishAt": "2026-11-17T18:01:00.000Z",
    "contentHtml": "<p>Estate homes in Lomas Verdes Estates are all a little different: lot size, views, single-level or not, gated or not, updated or original. That's exactly why they need a different selling approach than a typical tract home.</p><h2>Pricing: comps are only the start</h2><p>With only a handful of sales in the neighborhood each year, the closest comparable may be months old or quite different from your home. A good price accounts for what buyers at this level actually pay extra for: views, a single-level floor plan, a usable acre, pool and outdoor living, and recent updates.</p><h2>Prepare the land, not just the house</h2><p>On an acre, the grounds are half the listing. Clean up slopes, refresh landscaping, service the pool and make sure gates, lighting and irrigation work. Buyers walk the property, and every rough edge becomes a negotiation point.</p><h2>Know your numbers before buyers ask</h2><p>Have HOA documents, permits for any additions, septic or sewer details, solar contracts and recent service records ready. At this price point, buyers and their agents ask detailed questions early.</p><h2>Market to the right buyer</h2><p>Buyers for acre-lot estates in North Poway may be moving up from nearby communities or relocating from out of state, and many start their search online. Professional photography, video and drone shots of the lot and views aren't optional here. They're how those buyers decide to visit.</p><h2>Consider a private launch</h2><p>Many estate sellers prefer privacy. A quiet, pre-market or off-market launch to qualified buyers lets you test pricing without public days on market.</p><p>Want a realistic price range for your Lomas Verdes Estates home? Lara offers a private, no-obligation consultation.</p>"
  }
];
