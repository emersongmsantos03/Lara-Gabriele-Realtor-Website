import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { areas } from "@/lib/areas";
import { guides } from "@/lib/guides";
import { livePosts } from "@/lib/admin/posts";

// Includes blog posts written in /admin; refreshed hourly and after each publish.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await livePosts("pacific").catch(() => []);

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
    {
      url: `${site.url}/guides`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...guides.map((guide) => ({
      url: `${site.url}/guides/${guide.slug}`,
      lastModified: new Date(guide.updated),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    {
      url: `${site.url}/pie-raffle`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${site.url}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${site.url}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
