import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const BASE_URL = "https://amcupon.ro";

// Sluguri pagini multi-nisa (/nisa/[slug])
const NISA_SLUGURI = ["auto", "carti", "casa", "tech", "fashion", "sport", "frumusete"];

// Sluguri pagini /top/[slug] — citite dinamic din top-produse.json
function getTopSluguriDinamic(): string[] {
  try {
    const topPath = path.join(process.cwd(), "public", "top-produse.json");
    const data = JSON.parse(fs.readFileSync(topPath, "utf-8"));
    return (data.categorii || []).map((c: { slug: string }) => c.slug);
  } catch {
    return ["laptopuri", "telefoane", "casti-wireless", "televizoare"];
  }
}

// Sluguri pagini produse pe categorie (/produse/[categorie])
const PRODUSE_CATEGORII = ["fashion", "electronice", "beauty", "sport", "casa", "copii", "farmacie", "carti", "auto", "animale", "alimente", "bijuterii", "jocuri"];

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
    { url: `${BASE_URL}/radar`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
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
    { url: `${BASE_URL}/flori`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/pescuit`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/calatorie`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/electronice`,            lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/parfumuri`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/carti`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/extensie`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/casa`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/fashion`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/sanatate`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/animale`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/bijuterii`,             lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/jocuri`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/supermarket`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/gaming`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.9  },
    { url: `${BASE_URL}/laptop`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.9  },
    { url: `${BASE_URL}/telefoane`,            lastModified: new Date(), changeFrequency: "daily",   priority: 0.9  },
    { url: `${BASE_URL}/antivirus`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/smart-home`,           lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/instrumente-seo`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/trading`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/vpn`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/hosting`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/ai-tools`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/carduri-bancare`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/piese-auto`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/echipament-moto`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/rochii-mireasa`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },

    // ─── Pagini produse pe categorie (/produse/[categorie]) ─────────────────
    ...PRODUSE_CATEGORII.map((slug) => ({
      url: `${BASE_URL}/produse/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),

    // ─── Pagini nisa (/nisa/[slug]) ──────────────────────────────────────────
    ...NISA_SLUGURI.map((slug) => ({
      url: `${BASE_URL}/nisa/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),

    // ─── Top Produse (/top si /top/[slug]) ───────────────────────────────────
    { url: `${BASE_URL}/top`,                     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    ...getTopSluguriDinamic().map(slug => ({
      url: `${BASE_URL}/top/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),

    // ─── Pagini brand-uri mari ───────────────────────────────────────────────
    { url: `${BASE_URL}/altex`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/emag`,                    lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/elefant`,                 lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/decathlon`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/libris`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/fashiondays`,             lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/carturesti`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/drmax`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/noriel`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/petmart`,                 lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/brico`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/liki24`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/vidaxl`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/answear`,                 lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/notino`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/flanco`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/bookzone`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/vegis`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/petmax`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/sportdepot`,              lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/automobilus`,             lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/litera`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/pcmadd`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/otter`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/recomandari`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.7  },
    { url: `${BASE_URL}/vpn`,                     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8  },
    { url: `${BASE_URL}/ai-tools`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/hosting`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.8  },
    { url: `${BASE_URL}/servicii`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/albire-dinti`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE_URL}/cursuri-online`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/software-business`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/temu`,                    lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/shein`,                   lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/trendyol`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/scule365`,                lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/kitunghii`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/pfarma`,                  lastModified: new Date(), changeFrequency: "daily",   priority: 0.75 },

    // ─── Cadouri nisa ───────────────────────────────────────────────────────
    { url: `${BASE_URL}/cadouri`,                 lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/cadouri/ea`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/el`,              lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/copii`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/mama`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/tata`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/botez`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/cadouri/nasi`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/cadouri/nastere`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/valentine`,       lastModified: new Date(), changeFrequency: "yearly",  priority: 0.8  },
    { url: `${BASE_URL}/cadouri/craciun`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/absolvire`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/cadouri/pasti`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.8  },
    // Filtre buget
    { url: `${BASE_URL}/cadouri/sub-100-lei`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/sub-200-lei`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/sub-500-lei`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/peste-500-lei`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8  },

    // ─── Tool pages ─────────────────────────────────────────────────────────
    { url: `${BASE_URL}/top-reduceri`,            lastModified: new Date(), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/calculator`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE_URL}/calculator-salariu`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8  },
    { url: `${BASE_URL}/generator-proforma`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8  },

    // ─── Pagini utilitare ────────────────────────────────────────────────────
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
