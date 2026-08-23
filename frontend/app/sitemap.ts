import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { MACRO_ORDINE, getMacro } from "./blog/categories";
import { buildMerchantTokens, esteIndexabil, type IndexableProdus } from "../lib/seoIndexable";
import { CAI_REDIRECTIONATE } from "../lib/redirecturi";
import { ceruteInSitemap, construiesteIndexMagazine } from "../lib/blogCanonical";

const BASE_URL = "https://amcupon.ro";

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

/**
 * `lastModified` REAL per URL, din `public/sitemap-dates.json`.
 *
 * Inainte, toate cele ~425 de intrari aveau `new Date()`: pipeline-ul ruleaza la
 * 4h, deci Google primea "tot site-ul s-a modificat acum", de 6 ori pe zi. Cand
 * totul pare mereu proaspat, nimic nu mai pare proaspat — semnalul devine zgomot.
 *
 * Fisierul e produs de `scripts/track_sitemap_dates.py` (in pipeline): pagini de
 * date -> amprenta de continut (data se muta doar la schimbare reala), articole
 * -> data de publicare, pagini statice -> data ultimului commit git.
 *
 * Rezerva e data build-ului: pentru un URL nou, "modificat acum" e adevarat.
 */
let DATE_URL: Record<string, string> = {};
try {
  DATE_URL = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "sitemap-dates.json"), "utf-8")
  );
} catch {
  DATE_URL = {};
}
const ACUM = new Date();

function ultimaModificare(urlComplet: string): Date {
  const cale = urlComplet.replace(BASE_URL, "") || "/";
  const d = DATE_URL[cale];
  if (!d) return ACUM;
  const parsat = new Date(`${d}T00:00:00Z`);
  return isNaN(parsat.getTime()) ? ACUM : parsat;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const magazine: { magazin: string; are_promotie: boolean; categorie_slug?: string; promotii?: unknown[] }[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );

  // Index produse-per-magazin, construit o singura data (vezi lib/seoIndexable.ts).
  // Sitemap-ul trimite la Google DOAR paginile cu continut real — restul primesc
  // `noindex, follow` in cod-reducere/[magazin]/page.tsx, prin ACEEASI functie.
  let produseFeed: IndexableProdus[] = [];
  try {
    const pPath = path.join(process.cwd(), "public", "products.json");
    if (fs.existsSync(pPath)) {
      const raw = JSON.parse(fs.readFileSync(pPath, "utf-8"));
      produseFeed = (raw.products || raw) as IndexableProdus[];
    }
  } catch {
    produseFeed = [];
  }
  const merchantTokens = buildMerchantTokens(produseFeed);
  // Construit O SINGURA DATA. Prima versiune il apela din interiorul filtrului de
  // articole, deci reconstruia indexul celor 1.156 de magazine pentru fiecare din
  // cele 163 de articole — 188.000 de verificari in loc de 1.156.
  const magazineIndexabile = construiesteIndexMagazine(magazine, produseFeed);

  let blogPosts: { slug: string; date: string; category: string; excerpt?: string; magazin?: string | null; tip?: string | null }[] = [];
  const blogPath = path.join(process.cwd(), "public", "blog-posts.json");
  if (fs.existsSync(blogPath)) {
    blogPosts = JSON.parse(fs.readFileSync(blogPath, "utf-8"));
  }

  // Categorii blog cu articole (pentru URL-urile /blog?cat=X)
  const blogCategoriiCuPosts = MACRO_ORDINE.filter(
    (m) => blogPosts.some((p) => getMacro(p.category) === m)
  );

  let comparatiiSluguri: string[] = [];
  const comparatiiPath = path.join(process.cwd(), "public", "comparisons.json");
  if (fs.existsSync(comparatiiPath)) {
    comparatiiSluguri = Object.keys(JSON.parse(fs.readFileSync(comparatiiPath, "utf-8")));
  }

  const categoriiSluguri = [...new Set(magazine.map((m) => m.categorie_slug).filter(Boolean))];

  const intrari: MetadataRoute.Sitemap = [
    // ─── Pagini principale ───────────────────────────────────────────────────
    { url: BASE_URL,                             lastModified: ultimaModificare(BASE_URL), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/studiu/coduri-reducere-romania`, lastModified: ultimaModificare(`${BASE_URL}/studiu/coduri-reducere-romania`), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/radar`,                  lastModified: ultimaModificare(`${BASE_URL}/radar`), changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE_URL}/oferte-azi`,             lastModified: ultimaModificare(`${BASE_URL}/oferte-azi`), changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE_URL}/black-friday`,           lastModified: ultimaModificare(`${BASE_URL}/black-friday`), changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE_URL}/produse`,                lastModified: ultimaModificare(`${BASE_URL}/produse`), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/toate-magazinele`,       lastModified: ultimaModificare(`${BASE_URL}/toate-magazinele`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/categorii`,              lastModified: ultimaModificare(`${BASE_URL}/categorii`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/blog`,                   lastModified: ultimaModificare(`${BASE_URL}/blog`), changeFrequency: "daily",   priority: 0.8 },

    // ─── Landing pages sezoniere & nisa ─────────────────────────────────────
    { url: `${BASE_URL}/craciun`,                lastModified: ultimaModificare(`${BASE_URL}/craciun`), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/farmacie`,               lastModified: ultimaModificare(`${BASE_URL}/farmacie`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/sport`,                  lastModified: ultimaModificare(`${BASE_URL}/sport`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/copii`,                  lastModified: ultimaModificare(`${BASE_URL}/copii`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/frumusete`,              lastModified: ultimaModificare(`${BASE_URL}/frumusete`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/gadgets`,                lastModified: ultimaModificare(`${BASE_URL}/gadgets`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/moto`,                   lastModified: ultimaModificare(`${BASE_URL}/moto`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/idei-cadouri`,           lastModified: ultimaModificare(`${BASE_URL}/idei-cadouri`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/flori`,                  lastModified: ultimaModificare(`${BASE_URL}/flori`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/pescuit`,               lastModified: ultimaModificare(`${BASE_URL}/pescuit`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/esim`,                  lastModified: ultimaModificare(`${BASE_URL}/esim`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/calatorie`,              lastModified: ultimaModificare(`${BASE_URL}/calatorie`), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/electronice`,            lastModified: ultimaModificare(`${BASE_URL}/electronice`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/parfumuri`,              lastModified: ultimaModificare(`${BASE_URL}/parfumuri`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/carti`,                  lastModified: ultimaModificare(`${BASE_URL}/carti`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/extensie`,              lastModified: ultimaModificare(`${BASE_URL}/extensie`), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/casa`,                  lastModified: ultimaModificare(`${BASE_URL}/casa`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/fashion`,               lastModified: ultimaModificare(`${BASE_URL}/fashion`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/sanatate`,              lastModified: ultimaModificare(`${BASE_URL}/sanatate`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/animale`,               lastModified: ultimaModificare(`${BASE_URL}/animale`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/bijuterii`,             lastModified: ultimaModificare(`${BASE_URL}/bijuterii`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/jocuri`,                lastModified: ultimaModificare(`${BASE_URL}/jocuri`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/supermarket`,           lastModified: ultimaModificare(`${BASE_URL}/supermarket`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/gaming`,               lastModified: ultimaModificare(`${BASE_URL}/gaming`), changeFrequency: "daily",   priority: 0.9  },
    { url: `${BASE_URL}/laptop`,               lastModified: ultimaModificare(`${BASE_URL}/laptop`), changeFrequency: "daily",   priority: 0.9  },
    { url: `${BASE_URL}/telefoane`,            lastModified: ultimaModificare(`${BASE_URL}/telefoane`), changeFrequency: "daily",   priority: 0.9  },
    { url: `${BASE_URL}/antivirus`,            lastModified: ultimaModificare(`${BASE_URL}/antivirus`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/smart-home`,           lastModified: ultimaModificare(`${BASE_URL}/smart-home`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/instrumente-seo`,      lastModified: ultimaModificare(`${BASE_URL}/instrumente-seo`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/trading`,             lastModified: ultimaModificare(`${BASE_URL}/trading`), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/vpn`,                 lastModified: ultimaModificare(`${BASE_URL}/vpn`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/hosting`,             lastModified: ultimaModificare(`${BASE_URL}/hosting`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/ai-tools`,            lastModified: ultimaModificare(`${BASE_URL}/ai-tools`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/carduri-bancare`,     lastModified: ultimaModificare(`${BASE_URL}/carduri-bancare`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/piese-auto`,          lastModified: ultimaModificare(`${BASE_URL}/piese-auto`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/echipament-moto`,     lastModified: ultimaModificare(`${BASE_URL}/echipament-moto`), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/rochii-mireasa`,      lastModified: ultimaModificare(`${BASE_URL}/rochii-mireasa`), changeFrequency: "weekly",  priority: 0.8  },

    // ─── Pagini produse pe categorie (/produse/[categorie]) ─────────────────
    ...PRODUSE_CATEGORII.map((slug) => ({
      url: `${BASE_URL}/produse/${slug}`,
      lastModified: ultimaModificare(`${BASE_URL}/produse/${slug}`),
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),

    // /nisa/[slug] NU e in sitemap intentionat: paginile isi declara canonical catre
    // pagina de nisa principala (/fashion, /electronice...), iar a trimite la indexare
    // un URL care se declara duplicat e un semnal contradictoriu. Raman live si linkuite.

    // ─── Top Produse (/top si /top/[slug]) ───────────────────────────────────
    { url: `${BASE_URL}/top`,                     lastModified: ultimaModificare(`${BASE_URL}/top`), changeFrequency: "weekly",  priority: 0.9 },
    ...getTopSluguriDinamic().map(slug => ({
      url: `${BASE_URL}/top/${slug}`,
      lastModified: ultimaModificare(`${BASE_URL}/top/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),

    // ─── Pagini brand-uri mari ───────────────────────────────────────────────
    { url: `${BASE_URL}/altex`,                   lastModified: ultimaModificare(`${BASE_URL}/altex`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/elefant`,                 lastModified: ultimaModificare(`${BASE_URL}/elefant`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/decathlon`,               lastModified: ultimaModificare(`${BASE_URL}/decathlon`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/carturesti`,              lastModified: ultimaModificare(`${BASE_URL}/carturesti`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/drmax`,                   lastModified: ultimaModificare(`${BASE_URL}/drmax`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/noriel`,                  lastModified: ultimaModificare(`${BASE_URL}/noriel`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/petmart`,                 lastModified: ultimaModificare(`${BASE_URL}/petmart`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/brico`,                   lastModified: ultimaModificare(`${BASE_URL}/brico`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/liki24`,                  lastModified: ultimaModificare(`${BASE_URL}/liki24`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/vidaxl`,                  lastModified: ultimaModificare(`${BASE_URL}/vidaxl`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/answear`,                 lastModified: ultimaModificare(`${BASE_URL}/answear`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/notino`,                  lastModified: ultimaModificare(`${BASE_URL}/notino`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/flanco`,                  lastModified: ultimaModificare(`${BASE_URL}/flanco`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/bookzone`,                lastModified: ultimaModificare(`${BASE_URL}/bookzone`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/petmax`,                  lastModified: ultimaModificare(`${BASE_URL}/petmax`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/sportdepot`,              lastModified: ultimaModificare(`${BASE_URL}/sportdepot`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/automobilus`,             lastModified: ultimaModificare(`${BASE_URL}/automobilus`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/litera`,                  lastModified: ultimaModificare(`${BASE_URL}/litera`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/otter`,                   lastModified: ultimaModificare(`${BASE_URL}/otter`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/recomandari`,             lastModified: ultimaModificare(`${BASE_URL}/recomandari`), changeFrequency: "monthly", priority: 0.7  },
    { url: `${BASE_URL}/servicii`,                lastModified: ultimaModificare(`${BASE_URL}/servicii`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/servicii-internationale`, lastModified: ultimaModificare(`${BASE_URL}/servicii-internationale`), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE_URL}/comparator`,              lastModified: ultimaModificare(`${BASE_URL}/comparator`), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE_URL}/albire-dinti`,            lastModified: ultimaModificare(`${BASE_URL}/albire-dinti`), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE_URL}/asigurari`,               lastModified: ultimaModificare(`${BASE_URL}/asigurari`), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/cursuri-online`,          lastModified: ultimaModificare(`${BASE_URL}/cursuri-online`), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/software-business`,       lastModified: ultimaModificare(`${BASE_URL}/software-business`), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/temu`,                    lastModified: ultimaModificare(`${BASE_URL}/temu`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/shein`,                   lastModified: ultimaModificare(`${BASE_URL}/shein`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/trendyol`,                lastModified: ultimaModificare(`${BASE_URL}/trendyol`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/amazon`,                  lastModified: ultimaModificare(`${BASE_URL}/amazon`), changeFrequency: "daily",   priority: 0.85 },
    { url: `${BASE_URL}/asos`,                    lastModified: ultimaModificare(`${BASE_URL}/asos`), changeFrequency: "daily",   priority: 0.8  },
    { url: `${BASE_URL}/iherb`,                   lastModified: ultimaModificare(`${BASE_URL}/iherb`), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE_URL}/banggood`,                lastModified: ultimaModificare(`${BASE_URL}/banggood`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/scule365`,                lastModified: ultimaModificare(`${BASE_URL}/scule365`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/kitunghii`,               lastModified: ultimaModificare(`${BASE_URL}/kitunghii`), changeFrequency: "daily",   priority: 0.75 },
    { url: `${BASE_URL}/pfarma`,                  lastModified: ultimaModificare(`${BASE_URL}/pfarma`), changeFrequency: "daily",   priority: 0.75 },

    // ─── Cadouri nisa ───────────────────────────────────────────────────────
    { url: `${BASE_URL}/cadouri`,                 lastModified: ultimaModificare(`${BASE_URL}/cadouri`), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/cadouri/ea`,              lastModified: ultimaModificare(`${BASE_URL}/cadouri/ea`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/el`,              lastModified: ultimaModificare(`${BASE_URL}/cadouri/el`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/copii`,           lastModified: ultimaModificare(`${BASE_URL}/cadouri/copii`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/mama`,            lastModified: ultimaModificare(`${BASE_URL}/cadouri/mama`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/tata`,            lastModified: ultimaModificare(`${BASE_URL}/cadouri/tata`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/botez`,           lastModified: ultimaModificare(`${BASE_URL}/cadouri/botez`), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/cadouri/nasi`,            lastModified: ultimaModificare(`${BASE_URL}/cadouri/nasi`), changeFrequency: "weekly",  priority: 0.9  },
    { url: `${BASE_URL}/cadouri/nastere`,         lastModified: ultimaModificare(`${BASE_URL}/cadouri/nastere`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/valentine`,       lastModified: ultimaModificare(`${BASE_URL}/cadouri/valentine`), changeFrequency: "yearly",  priority: 0.8  },
    { url: `${BASE_URL}/cadouri/craciun`,         lastModified: ultimaModificare(`${BASE_URL}/cadouri/craciun`), changeFrequency: "yearly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/absolvire`,       lastModified: ultimaModificare(`${BASE_URL}/cadouri/absolvire`), changeFrequency: "weekly",  priority: 0.8  },
    { url: `${BASE_URL}/cadouri/pasti`,           lastModified: ultimaModificare(`${BASE_URL}/cadouri/pasti`), changeFrequency: "yearly",  priority: 0.8  },
    // Filtre buget
    { url: `${BASE_URL}/cadouri/sub-100-lei`,     lastModified: ultimaModificare(`${BASE_URL}/cadouri/sub-100-lei`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/sub-200-lei`,     lastModified: ultimaModificare(`${BASE_URL}/cadouri/sub-200-lei`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/sub-500-lei`,     lastModified: ultimaModificare(`${BASE_URL}/cadouri/sub-500-lei`), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE_URL}/cadouri/peste-500-lei`,   lastModified: ultimaModificare(`${BASE_URL}/cadouri/peste-500-lei`), changeFrequency: "weekly",  priority: 0.8  },

    // ─── Comparatii magazine ─────────────────────────────────────────────────
    { url: `${BASE_URL}/comparatii`, lastModified: ultimaModificare(`${BASE_URL}/comparatii`), changeFrequency: "weekly", priority: 0.85 },
    ...comparatiiSluguri.map((slug) => ({
      url: `${BASE_URL}/comparatii/${slug}`,
      lastModified: ultimaModificare(`${BASE_URL}/comparatii/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),

    // ─── Tool pages ─────────────────────────────────────────────────────────
    { url: `${BASE_URL}/top-reduceri`,            lastModified: ultimaModificare(`${BASE_URL}/top-reduceri`), changeFrequency: "daily",   priority: 0.85 },

    // ─── Pagini utilitare ────────────────────────────────────────────────────
    { url: `${BASE_URL}/newsletter`,              lastModified: ultimaModificare(`${BASE_URL}/newsletter`), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/wishlist`,               lastModified: ultimaModificare(`${BASE_URL}/wishlist`), changeFrequency: "weekly",  priority: 0.4 },
    { url: `${BASE_URL}/contact`,                lastModified: ultimaModificare(`${BASE_URL}/contact`), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/despre-noi`,             lastModified: ultimaModificare(`${BASE_URL}/despre-noi`), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/confidentialitate`,      lastModified: ultimaModificare(`${BASE_URL}/confidentialitate`), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/termeni`,                lastModified: ultimaModificare(`${BASE_URL}/termeni`), changeFrequency: "monthly", priority: 0.3 },

    // ─── Categorii dinamice (/categorii/[slug]) ──────────────────────────────
    ...categoriiSluguri.map((slug) => ({
      url: `${BASE_URL}/categorii/${slug}`,
      lastModified: ultimaModificare(`${BASE_URL}/categorii/${slug}`),
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),

    // ─── Categorii blog (/blog?cat=X) — hub-uri topicale ─────────────────────
    ...blogCategoriiCuPosts.map((cat) => ({
      url: `${BASE_URL}/blog?cat=${encodeURIComponent(cat)}`,
      lastModified: ultimaModificare(`${BASE_URL}/blog?cat=${encodeURIComponent(cat)}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    // ─── Blog posts ──────────────────────────────────────────────────────────
    // Excludem articolele despre magazine fara nicio promotie activa (continut
    // subtire/templat, noindex si in generateMetadata din blog/[slug]/page.tsx) —
    // sa nu iroseasca bugetul de crawl Google pe pagini fara valoare unica.
    ...blogPosts
      .filter((p) => !/\b0 promotii active\b/.test(p.excerpt || ""))
      // Si articolele care isi declara canonical catre pagina de magazin: a trimite
      // la indexare un URL care se declara duplicat e un semnal care se contrazice
      // singur. Aceeasi regula aplicata paginilor /nisa/* pe 16.08.
      .filter((p) => ceruteInSitemap(p, magazineIndexabile))
      .map((p) => ({
        url: `${BASE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.date),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),

    // ─── Pagini magazine (/cod-reducere/[magazin]) ────────────────────────────
    // Filtram sluguri invalide: cu spatii, cu "/" in interior, sau retele afiliere.
    // SI paginile fara continut real (vezi lib/seoIndexable.ts): din 1177 de magazine
    // doar ~92 aveau promotie sau produse; restul de ~1085 erau acelasi template gol,
    // trimis la Google, care pe un domeniu fara autoritate arde tot bugetul de crawl
    // si semnaleaza "site de calitate mica". Paginile raman LIVE pentru utilizatori
    // si pastreaza `follow` — doar nu mai cer indexare pana au ceva de aratat.
    ...magazine
      .filter((m) => {
        const slug = m.magazin || "";
        if (!slug) return false;
        if (/\s/.test(slug)) return false;           // spatii in slug
        if (slug.split("/").length > 2) return false; // prea multe slash-uri
        if (["profitshare.ro", "2performant.com"].includes(slug)) return false; // retele, nu magazine
        return esteIndexabil(m, merchantTokens);
      })
      .map((m) => ({
        url: `${BASE_URL}/cod-reducere/${m.magazin}`,
        lastModified: ultimaModificare(`${BASE_URL}/cod-reducere/${m.magazin}`),
        changeFrequency: "daily" as const,
        priority: m.are_promotie ? 0.9 : 0.7,
      })),
  ];

  // ─── Plasa de siguranta: nimic redirectionat nu pleaca la indexare ────────
  // Un sitemap trebuie sa contina DOAR URL-uri care raspund 200. Pe 21.08.2026
  // exportul GSC a aratat 7 URL-uri din 462 care raspundeau 308 — pagini sterse
  // si redirectionate in next.config.ts, dar ramase in lista de mai sus. Filtrul
  // citeste ACEEASI sursa ca redirecturile (lib/redirecturi.ts), deci de acum
  // divergenta e imposibila: adaugi un redirect si URL-ul iese singur din sitemap.
  return intrari.filter(
    (i) => !CAI_REDIRECTIONATE.has(i.url.replace(BASE_URL, "") || "/")
  );
}
