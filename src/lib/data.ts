// Not currently rendered: confirm these numbers before bringing Stats back
// to the homepage.
export const stats = [
  { value: "$180M+", label: "In career sales volume" },
  { value: "260+", label: "Homes bought & sold" },
  { value: "20+", label: "Years in real estate" },
  { value: "98%", label: "Clients who refer a friend" },
];

export type ReviewKind = "Sold" | "Bought" | "Rented";

export type Review = {
  id: string;
  // Pull quote shown as the headline — must be an exact phrase from `text`.
  highlight: string;
  text: string;
  author: string;
  kind: ReviewKind;
  place: string;
  year?: number;
  date?: string;
  source: "Zillow" | "RealSatisfied";
  rating: number;
};

// Real client reviews, copied verbatim from Lara's Zillow profile and
// RealSatisfied. Zillow shows usernames only, so those are labelled by
// what the client did instead of by name.
export const reviews: Review[] = [
  {
    id: "scott-steele",
    highlight:
      "She even helped coordinate pre-sale repairs and termite tenting since we live out of town.",
    text: "Lara navigated the sale of our house with professionalism, diligence, and thoughtfulness. She even helped coordinate pre-sale repairs and termite tenting since we live out of town. Strongly recommend!",
    author: "Scott Steele",
    kind: "Sold",
    place: "San Diego, CA",
    source: "RealSatisfied",
    rating: 5,
  },
  {
    id: "rancho-bernardo",
    highlight: "Someone who listens and responds to what the clients want.",
    text: "Lara is personable, professional, and someone who listens and responds to what the clients want. I strongly recommend Lara for anyone looking for a real estate agent to optimally market and sell their home",
    author: "Home seller",
    kind: "Sold",
    place: "Rancho Bernardo, San Diego, CA",
    year: 2025,
    date: "2026-04-30",
    source: "Zillow",
    rating: 5,
  },
  {
    id: "liberty-hill",
    highlight: "She will cross the finish line with you cheering all the way!",
    text: "In October 2015 my wife and I decided to make our final move since our recent retirement and we sold our house in San Diego Ca. We researched Southern Texas for cost of living, taxes and home values. We chose the Austin area. Next we researched Real Estate professionals and after much deliberation we chose Lara with JB Goodwin Realtors. We have had many experiences over the years with other realtors but none has come close to the professionalism Lara has displayed. All Questions regarding the area, HOAs, schools, traffic, Dining, Shopping and medical were answered. She is very familiar with local utilities. Lara went the extra mile DAILY by watching the process of our home as it was being built. While we were still finishing up in CA, Lara would text or email us continuously with updates and photos. She even caught many problems with the build that would have cost us thousands had we not forced the builder to fix it during construction. She would handle the issue with the builder herself so that we did not have to stress from 1500 miles away. Many of these could have also caused delays in closing. She made sure we closed on time and happy. We obviously highly recommend Lara to all our family and friends in CA who are thinking of moving here. We recommend anyone call her and see for yourself how rare it is to find someone truly honest and helpful and not just motivated my money. She could have signed us up with the builder and left us in their hands, thankfully she didn't. She actually cares about her clients.. .she will cross the finish line with you cheering all the way!",
    author: "Retired couple relocating from San Diego",
    kind: "Bought",
    place: "Liberty Hill, TX",
    year: 2015,
    date: "2016-08-11",
    source: "Zillow",
    rating: 5,
  },
  {
    id: "mission-viejo",
    highlight: "She found me the perfect house that went above my expectations.",
    text: "I used Lara to help me identify, negotiate and handle all of the contractual components for my home purchase in December. She was fantastic. She was very informed on the market and neighborhoods that I was interested in. She found me the perfect house that went above my expectations. She is well organized and thoughtful. Her knowledge base is impressive and she had information that went well beyond what I imagined was needed for making an educated offer on my house. With her guidance identifying and buying my house was great. She spearheaded a process that completed within 30 days. She was totally great and a pleasure to deal with. I highly recommend talking to her and using her as an agent!",
    author: "Home buyer",
    kind: "Bought",
    place: "Mission Viejo, CA",
    year: 2011,
    date: "2012-12-10",
    source: "Zillow",
    rating: 5,
  },
  {
    id: "austin-rental",
    highlight: "I've tried using apartment locators and other realtors, and none of them compare to Lara.",
    text: "Lara is simply amazing! She's incredibly knowledgeable about the city and the market, which makes her very easy to trust. She's also enthusiastic about helping you find the right home, which is an added bonus to her services. I've tried using apartment locators and other realtors, and none of them compare to Lara. She was with me every single step of the way—and made sure that I was getting exactly what I wanted. I have two larger dogs, which was a huge concern when I was moving. She understood that they were family and really helped find a fantastic yard for them AND wood floors for me. Lara was hands-on throughout the entire process, and wanted to make sure that everything was what I wanted and needed. I WILL use Lara for all future rentals, purchases and sells. No doubt in my mind!",
    author: "Renter with two big dogs",
    kind: "Rented",
    place: "Austin, TX 78759",
    date: "2016-09-08",
    source: "Zillow",
    rating: 5,
  },
  {
    id: "cedar-park",
    highlight: "She did an amazing job both times!",
    text: "We absolutely recommend Lara Gabriele! She helped us close on two real estate transactions in 2017. She did an amazing job both times! We are very satisfied customers!",
    author: "Two-time clients",
    kind: "Sold",
    place: "Cedar Park, TX",
    year: 2017,
    date: "2018-04-12",
    source: "Zillow",
    rating: 5,
  },
];

export const faqs = [
  {
    q: "What areas of San Diego do you serve?",
    a: "I'm based in San Marcos and work with buyers and sellers across San Diego County — especially San Marcos, Poway, Rancho Bernardo, Escondido and Carmel Valley, plus the coastal cities from La Jolla and Del Mar to Encinitas, Carlsbad and Oceanside.",
  },
  {
    q: "How does your mortgage underwriting background help me?",
    a: "I spent 15 years as a senior mortgage underwriter before becoming a REALTOR®. For buyers, that means I spot financing problems before they cost you a home and help make your offer stronger. For sellers, it means I can tell which offers are most likely to close — not just which one is highest.",
  },
  {
    q: "How do I know what my San Diego home is worth?",
    a: "Online estimates can be off by tens of thousands of dollars in San Diego because values change block by block — views, lot size, and school boundaries all matter. I'll prepare a free, no-obligation comparative market analysis based on recent nearby sales and walk you through it in plain language.",
  },
  {
    q: "Do you work with first-time home buyers?",
    a: "Absolutely. I explain every step — pre-approval, offers, inspections, appraisal, and closing — and connect you with trusted local lenders, including those who specialize in first-time buyer and down-payment assistance programs.",
  },
  {
    q: "Do buyers need to sign an agreement before touring homes?",
    a: "Yes. Since August 2024, buyers need a written agreement with their agent before touring homes. I'll go over it with you in detail, including how my compensation works, so there are no surprises.",
  },
  {
    q: "Can you help military families using a VA loan?",
    a: "Yes. San Diego has a large military community — Coronado, Point Loma, Oceanside, and Chula Vista are especially popular with service members. I understand VA loan timelines and appraisal requirements and can help you plan around PCS moves.",
  },
  {
    q: "I'm relocating to San Diego. Can you help me choose a neighborhood?",
    a: "That's one of my favorite parts of the job. We'll talk about commute, schools, budget, and lifestyle, and I'll help you narrow the county down to a few neighborhoods that fit — with video tours if you can't be here in person.",
  },
];
