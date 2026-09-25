import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { areas } from "@/lib/areas";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${site.url}/images/lara-headshot.jpg`],
    },
    {
      url: `${site.url}/areas`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...areas.map((area) => ({
      url: `${site.url}/areas/${area.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: area.featured ? 0.8 : 0.7,
    })),
  ];
}
