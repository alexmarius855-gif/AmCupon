import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const BASE_URL = "https://amcupon.ro";

export default function sitemap(): MetadataRoute.Sitemap {
  const magazine: { magazin: string; are_promotie: boolean; categorie_slug?: string }[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );

  let blogPosts: { slug: string; date: string }[] = [];
  const blogPath = path.join(process.cwd(), "public", "blog-posts.json");
  if (fs.existsSync(blogPath)) {
    blogPosts = JSON.parse(fs.readFileSync(blogPath, "utf-8"));
  }

  const categoriiSluguri = [...new Set(magazine.map((m) => m.categorie_slug).filter(Boolean))];

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/black-friday`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${BASE_URL}/craciun`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/gadgets`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/moto`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/idei-cadouri`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/farmacie`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/sport`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/copii`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/frumusete`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/calatorie`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/produse`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/toate-magazinele`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/categorii`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/despre-noi`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/confidentialitate`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/termeni`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    ...categoriiSluguri.map((slug) => ({
      url: `${BASE_URL}/categorii/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...blogPosts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...magazine.map((m) => ({
      url: `${BASE_URL}/cod-reducere/${m.magazin}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: m.are_promotie ? 0.9 : 0.6,
    })),
  ];
}
