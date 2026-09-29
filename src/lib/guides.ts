// Buyer & seller guides written from Lara's underwriting background — content
// only a former senior mortgage underwriter can credibly write, and the kind of
// question people actually search for. Drafted for Lara to review; keep the
// first-person voice when editing.

export type Guide = {
  slug: string;
  title: string;
  /** One sentence for the index card and the meta description. */
  summary: string;
  audience: "Buyers" | "Sellers" | "Buyers & sellers";
  minutes: number;
  /** ISO date the guide was last reviewed. */
  updated: string;
  sections: { heading?: string; paragraphs: string[] }[];
};

export const guides: Guide[] = [
  {
    slug: "what-underwriters-look-at",
    title: "What mortgage underwriters look at that buyers don't expect",
    summary:
      "The deposits, job changes and new debts that trip up buyers in escrow — from someone who reviewed loan files for 15 years.",
    audience: "Buyers",
    minutes: 5,
    updated: "2026-09-29",
    sections: [
      {
        paragraphs: [
          "Before I became a REALTOR®, I spent 15 years as a senior mortgage underwriter. The underwriter is the person who decides whether your loan actually funds — and most buyers never talk to them. Here's what I looked at that buyers usually don't see coming.",
        ],
      },
      {
        heading: "Every large deposit needs a paper trail",
        paragraphs: [
          "Underwriters review your recent bank statements line by line. Any deposit that isn't your regular paycheck can trigger a request to document where it came from — a transfer between your own accounts, a bonus, a sold car.",
          "Money from family is fine, but it needs a signed gift letter and proof of the transfer. Cash that can't be traced often can't be used for your down payment at all. If you're moving money around to prepare for a purchase, keep every statement.",
        ],
      },
      {
        heading: "Your credit is checked again before closing",
        paragraphs: [
          "Your pre-approval is a snapshot. Many lenders re-check credit shortly before closing, and a new car loan, a furniture account or co-signing for someone can change your debt-to-income ratio enough to put the loan back in question.",
          "The rule I give every buyer: from pre-approval to keys, don't open, close or co-sign anything without calling your lender first.",
        ],
      },
      {
        heading: "Your job is verified — sometimes days before closing",
        paragraphs: [
          "Lenders commonly verify employment again right before funding. Changing jobs mid-escrow, even for more money, can delay or derail the loan. Commission, bonus and self-employed income are usually averaged over two years, so a great recent year may count for less than you expect.",
        ],
      },
      {
        heading: "The whole payment counts, not just the mortgage",
        paragraphs: [
          "Property taxes, homeowners insurance, HOA dues and Mello-Roos assessments all go into your debt-to-income ratio. In newer San Marcos and North County communities, those extras can add hundreds a month — and change how much home you qualify for.",
        ],
      },
      {
        heading: "The house has to qualify too",
        paragraphs: [
          "The appraisal, the condition of the home and — for condos — the health of the HOA all matter. Unpermitted additions, deferred maintenance or an HOA in litigation can create conditions the lender needs cleared before closing.",
          "I look at these things before we write an offer, not after. It's the simplest way to keep your escrow boring — which is exactly what you want.",
        ],
      },
    ],
  },
  {
    slug: "why-offers-fall-through",
    title: "Why offers fall through in escrow — from a former underwriter",
    summary:
      "Appraisal gaps, financing surprises and insurance problems: the real reasons deals collapse, and how buyers and sellers can avoid them.",
    audience: "Buyers & sellers",
    minutes: 5,
    updated: "2026-09-29",
    sections: [
      {
        paragraphs: [
          "An accepted offer isn't a closed sale. From my years in underwriting, most deals that fall apart do so for a handful of predictable reasons — and most of them can be spotted early.",
        ],
      },
      {
        heading: "The appraisal comes in low",
        paragraphs: [
          "The lender only lends against the appraised value. If a home appraises below the contract price, someone has to cover the gap: the buyer brings more cash, the seller lowers the price, or they meet in the middle. In a competitive market, I help buyers decide up front how much of a gap they can realistically cover.",
        ],
      },
      {
        heading: "The buyer's financing wasn't as solid as it looked",
        paragraphs: [
          "A quick pre-qualification isn't the same as a reviewed loan file. New debt, an undocumented deposit or income that doesn't calculate the way the buyer expected can all surface late. The strongest buyers have had their file reviewed by an underwriter before they ever make an offer.",
        ],
      },
      {
        heading: "Insurance is harder to get than expected",
        paragraphs: [
          "Homeowners insurance has become harder to find in parts of California, especially near canyons and open space. The lender requires it to fund, so I have buyers get quotes during the inspection period — not the week before closing.",
        ],
      },
      {
        heading: "Condo and HOA issues",
        paragraphs: [
          "For condos and some townhomes, the lender reviews the HOA itself: budget, reserves, owner-occupancy and any litigation. A problem there can stop an otherwise perfect buyer. It's worth checking before you're in contract.",
        ],
      },
      {
        heading: "For sellers: how to pick the offer that closes",
        paragraphs: [
          "The highest price isn't always the best offer. When I help sellers compare offers, I look at who the lender is, how thoroughly the buyer has been reviewed, the down payment, how an appraisal gap would be handled and how long the contingencies run.",
          "A slightly lower offer with a fully underwritten buyer can be worth far more than a higher one that falls apart three weeks in and sends you back to market.",
        ],
      },
    ],
  },
  {
    slug: "pre-approval-vs-underwriting-approval",
    title: "Pre-approval vs. underwriting approval: what's the difference?",
    summary:
      "Pre-qualified, pre-approved, underwritten, clear to close — what each step really means and why it makes your offer stronger.",
    audience: "Buyers",
    minutes: 4,
    updated: "2026-09-29",
    sections: [
      {
        paragraphs: [
          "Buyers hear a lot of similar-sounding terms. They are not the same, and in a competitive market the difference can decide whose offer gets accepted.",
        ],
      },
      {
        heading: "Pre-qualification",
        paragraphs: [
          "An estimate based mostly on what you tell the lender about your income, debts and savings. It's a useful starting point for a budget, but sellers and their agents know it hasn't been verified.",
        ],
      },
      {
        heading: "Pre-approval",
        paragraphs: [
          "The lender pulls your credit and reviews documents like pay stubs, tax returns and bank statements, and often runs your file through an automated underwriting system. It's much stronger than a pre-qualification — but in most cases a human underwriter still hasn't reviewed your file.",
        ],
      },
      {
        heading: "Underwriting approval before you find a home",
        paragraphs: [
          "Some lenders will have an underwriter fully review your file before you have a property, leaving only the home-specific items — appraisal, title and insurance — as conditions. This is the closest a financed buyer can get to looking like a cash buyer.",
          "Having been that underwriter, I can tell you: most of the surprises that sink loans are found at this stage. Finding them before you write an offer is a huge advantage.",
        ],
      },
      {
        heading: "Conditional approval and clear to close",
        paragraphs: [
          "Once you're in contract, the underwriter issues a conditional approval — a list of the last items needed. When every condition is cleared, you're \"clear to close,\" and the lender is ready to fund.",
          "If you're planning to buy in San Marcos, Poway or anywhere in San Diego County, I'm happy to look at where your financing stands and what would make your offer stronger.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
