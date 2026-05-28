import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const BASE_URL = "https://amcupon.ro";

// Sluguri pagini multi-nisa (/nisa/[slug])
const NISA_SLUGURI = ["auto", "carti", "casa", "tech", "fashion", "sport", "frumusete"];

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
    // ─── Pagini principale ───────────────────────────────────────────────────
    { url: BASE_URL,                             lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/oferte-azi`,             lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE_URL}/black-friday`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE_URL}/produse`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/toate-magazinele`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/categorii`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/blog`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },

    // ─── Landing pages sezoniere & nisa ─────────────────────────────────────
    { url: `${BASE_URL}/craciun`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/farmacie`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/sport`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/copii`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/frumusete`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/gadgets`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/moto`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/idei-cadouri`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/calatorie`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/electronice`,            lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/parfumuri`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/carti`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/extensie`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/casa`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/fashion`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/sanatate`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/animale`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },

    // ─── Pagini nisa (/nisa/[slug]) ──────────────────────────────────────────
    ...NISA_SLUGURI.map((slug) => ({
      url: `${BASE_URL}/nisa/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),

    // ─── Tool pages ─────────────────────────────────────────────────────────
    { url: `${BASE_URL}/top-reduceri`,            lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/calculator`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },

    // ─── Pagini utilitare ────────────────────────────────────────────────────
    { url: `${BASE_URL}/cautare`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/newsletter`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/wishlist`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.4 },
    { url: `${BASE_URL}/contact`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/despre-noi`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/confidentialitate`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/termeni`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },

    // ─── Categorii dinamice (/categorii/[slug]) ──────────────────────────────
    ...categoriiSluguri.map((slug) => ({
      url: `${BASE_URL}/categorii/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),

    // ─── Blog posts ──────────────────────────────────────────────────────────
    ...blogPosts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),

    // ─── Pagini magazine (/cod-reducere/[magazin]) ────────────────────────────
    // Filtram sluguri invalide: cu spatii, cu "/" in interior, sau retele afiliere
    ...magazine
      .filter((m) => {
        const slug = m.magazin || "";
        if (!slug) return false;
        if (/\s/.test(slug)) return false;           // spatii in slug
        if (slug.split("/").length > 2) return false; // prea multe slash-uri
        if (["profitshare.ro", "2performant.com"].includes(slug)) return false; // retele, nu magazine
        return true;
      })
      .map((m) => ({
        url: `${BASE_URL}/cod-reducere/${m.magazin}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: m.are_promotie ? 0.9 : 0.6,
      })),
  ];
}
