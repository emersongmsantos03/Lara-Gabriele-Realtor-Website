// Single source of truth for business details. Keep name, phone and email
// identical to the Google Business Profile — consistent NAP data is a local
// ranking signal.
export const site = {
  // Set NEXT_PUBLIC_SITE_URL to the live domain (e.g. https://laragabriele.com)
  // so canonical URLs, the sitemap and social previews point to it.
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://laragabriele.com").replace(/\/$/, ""),
  brand: "Pacific Friendly Realty",
  agent: "Lara Gabriele",
  title: "REALTOR®",
  brokerage: "eXp Realty",
  // California DRE license number. The DRE requires it on advertising,
  // including websites — fill it in before launch.
  dreLicense: process.env.NEXT_PUBLIC_DRE_LICENSE || "",
  phone: "+1 (512) 638-7486",
  phoneHref: "tel:+15126387486",
  phoneSchema: "+1-512-638-7486",
  email: "lara.gabriele@exprealty.com",
  newsletterUrl: "https://laragabrielerealty.myflodesk.com/getintouch",
  socials: {
    instagram: "https://www.instagram.com/lara_gabriele_realtor/",
    linkedin: "https://www.linkedin.com/in/laragabrielerealtor/",
  },
  geo: { latitude: 32.7157, longitude: -117.1611 },
};

export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
