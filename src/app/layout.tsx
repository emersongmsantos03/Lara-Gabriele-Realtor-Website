import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { site, jsonLdScript } from "@/lib/site";
import { areas } from "@/lib/areas";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const title = "San Diego Realtor | Lara Gabriele — Homes for Sale & Real Estate Agent";
const description =
  "Lara Gabriele is a San Diego REALTOR® with 20+ years of experience helping buyers and sellers in La Jolla, Del Mar, Carlsbad, Coronado, Point Loma, Encinitas and across San Diego County. Free home valuations. eXp Luxury.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: "%s | Lara Gabriele, San Diego Realtor",
  },
  description,
  applicationName: site.brand,
  authors: [{ name: site.agent }],
  keywords: [
    "San Diego realtor",
    "San Diego real estate agent",
    "homes for sale San Diego",
    "sell my house San Diego",
    "La Jolla realtor",
    "Carlsbad realtor",
    "Del Mar real estate",
    "Coronado real estate agent",
    "luxury real estate San Diego",
    "eXp Luxury",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: site.brand,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Paste the verification code from Google Search Console here.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${site.url}/#agent`,
      name: `${site.agent}, ${site.title} — ${site.brand}`,
      alternateName: [site.brand, site.agent],
      description,
      url: site.url,
      image: `${site.url}/images/lara-headshot.jpg`,
      logo: `${site.url}/images/logo.png`,
      telephone: site.phoneSchema,
      email: site.email,
      priceRange: "$$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "San Diego",
        addressRegion: "CA",
        addressCountry: "US",
      },
      geo: { "@type": "GeoCoordinates", ...site.geo },
      areaServed: [
        { "@type": "AdministrativeArea", name: "San Diego County, CA" },
        ...areas.map((a) => ({
          "@type": "Place",
          name: `${a.name}, CA`,
          url: `${site.url}/areas/${a.slug}`,
        })),
      ],
      knowsAbout: [
        "Residential real estate",
        "Luxury homes",
        "Home valuation",
        "First-time home buyers",
        "VA loans",
        "Relocation",
      ],
      memberOf: { "@type": "Organization", name: site.brokerage },
      sameAs: [site.socials.instagram, site.socials.linkedin],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.brand,
      publisher: { "@id": `${site.url}/#agent` },
      inLanguage: "en-US",
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(jsonLd)}
        />
      </head>
      <body className="min-h-full flex flex-col bg-cream text-ink font-body pb-[64px] md:pb-0">
        {children}
      </body>
    </html>
  );
}
