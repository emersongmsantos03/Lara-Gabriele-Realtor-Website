// Single source of truth for business details. Keep name, phone and email
// identical to the Google Business Profile — consistent NAP data is a local
// ranking signal.
export const site = {
  // Live domain. www is the primary host (the bare domain redirects to it in
  // Vercel), so canonical URLs, the sitemap and social previews use www.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.pacificfriendlyrealty.com").replace(/\/$/, ""),
  brand: "Pacific Friendly Realty",
  agent: "Lara Gabriele",
  title: "REALTOR®",
  brokerage: "eXp Realty",
  // The DRE requires the agent's own license number and the responsible
  // broker's name on advertising, including websites. Verified on the DRE
  // public license lookup.
  dreLicense: "01900255",
  // Professional designations shown on the About section and in schema.
  credentials: ["Seniors Real Estate Specialist (SRES®)", "Luxury Specialist"],
  brokerageLegal: "eXp Realty of Southern California, Inc.",
  brokerageDre: "02187306",
  // Lara lives and works in San Marcos.
  city: "San Marcos",
  phone: "+1 (512) 638-7486",
  phoneHref: "tel:+15126387486",
  phoneSchema: "+1-512-638-7486",
  email: "lara.gabriele@exprealty.com",
  newsletterUrl: "https://laragabrielerealty.myflodesk.com/getintouch",
  socials: {
    instagram: "https://www.instagram.com/lara_gabriele_realtor/",
    linkedin: "https://www.linkedin.com/in/laragabrielerealtor/",
  },
  geo: { latitude: 33.1434, longitude: -117.1661 },
};

export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
