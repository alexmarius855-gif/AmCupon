import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinClient from "./MagazinClient";
import BannerAd2P from "../../components/BannerAd2P";

interface Promotie {
  nume: string;
  descriere: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  comision: string;
  rank?: number;
  scor_afiliere: number;
  scor_final: number;
  prioritate: string;
  canal_recomandat: string;
  sales_number: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
}

interface MagazinSimilar {
  magazin: string;
  logo_url?: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string }[];
}

// ─── Luna curentă în română ────────────────────────────────────────────────────
const LUNI_RO = [
  "ianuarie","februarie","martie","aprilie","mai","iunie",
  "iulie","august","septembrie","octombrie","noiembrie","decembrie",
];

function lunaRo(): string {
  return LUNI_RO[new Date().getMonth()];
}

// ─── Descrieri custom pentru magazinele cele mai căutate ──────────────────────
const DESCRIERI_CUSTOM: Record<string, string> = {
  "emag.ro":
    "Cele mai noi coduri de reducere eMAG verificate zilnic. Voucher eMAG activ pentru electronice, electrocasnice, fashion și mii de alte produse. Economisește cu AmCupon.ro.",
  "fashiondays.ro":
    "Cod reducere FashionDays verificat — reduceri la fashion, încălțăminte și accesorii premium. Voucher FashionDays actualizat zilnic pe AmCupon.ro.",
  "notino.ro":
    "Cod reducere Notino pentru parfumuri, cosmetice și produse de îngrijire. Voucher Notino verificat și actualizat zilnic. Cele mai bune oferte beauty pe AmCupon.ro.",
  "answear.ro":
    "Cod reducere Answear pentru fashion online — haine, pantofi, accesorii de brand. Voucher Answear activ verificat pe AmCupon.ro.",
  "noriel.ro":
    "Cod reducere Noriel pentru jucării, jocuri și produse pentru copii. Voucher Noriel verificat zilnic pe AmCupon.ro.",
  "drmax.ro":
    "Cod reducere Dr. Max pentru medicamente OTC, suplimente și produse farmaceutice. Voucher Dr. Max activ pe AmCupon.ro.",
  "elefant.ro":
    "Cod reducere Elefant pentru cărți, electronice și jocuri. Voucher Elefant verificat zilnic pe AmCupon.ro.",
  "libris.ro":
    "Cod reducere Libris pentru cărți, manuale și audiobook-uri. Voucher Libris verificat pe AmCupon.ro — cele mai bune prețuri la cărți.",
  "sportisimo.ro":
    "Cod reducere Sportisimo pentru echipamente sportive, îmbrăcăminte și încălțăminte sport. Voucher Sportisimo verificat pe AmCupon.ro.",
  "altex.ro":
    "Cod reducere Altex pentru electronice, electrocasnice și IT. Voucher Altex verificat zilnic pe AmCupon.ro.",
  "dedeman.ro":
    "Cod reducere Dedeman pentru bricolaj, materiale de construcții și grădină. Voucher Dedeman activ pe AmCupon.ro.",
  "decathlon.ro":
    "Cod reducere Decathlon pentru sport și outdoor — echipamente, haine și accesorii. Voucher Decathlon verificat pe AmCupon.ro.",
  "zara.com":
    "Cod reducere Zara pentru fashion și accesorii. Voucher Zara verificat pe AmCupon.ro — colecțiile noi la prețuri reduse.",
  "hm.com":
    "Cod reducere H&M pentru haine, accesorii și cosmetice. Voucher H&M verificat zilnic pe AmCupon.ro.",
  "vegis.ro":
    "Cod reducere Vegis pentru produse bio, suplimente naturale și alimente sănătoase. Voucher Vegis verificat pe AmCupon.ro.",
  "temu.com":
    "Cod reducere Temu verificat pentru mii de produse la prețuri mici. Voucher Temu activ pe AmCupon.ro — economii garantate.",
  "aliexpress.com":
    "Cod reducere AliExpress pentru produse din toate categoriile. Voucher AliExpress verificat și actualizat pe AmCupon.ro.",
};

export interface Produs {
  title: string;
  url: string;
  image: string;
  price: number;
  old_price?: number;
  discount_pct: number;
  category: string;
  brand: string;
  merchant: string;
  merchant_slug: string;
}

interface BlogPostMic {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  cover: string;
}

interface Banner2P {
  id: number;
  image_url: string;
  landing_url: string;
  landing_raw: string;
  width: number;
  height: number;
  merchant: string;
  merchant_slug: string;
  name: string;
  category: string;
  b_type: string;
}

function loadData(): Magazin[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function loadBanner(magazinSlug: string): Banner2P | null {
  try {
    const p = path.join(process.cwd(), "public", "banners.json");
    if (!fs.existsSync(p)) return null;
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    const banners: Banner2P[] = raw.banners || raw;
    if (!banners.length) return null;

    const slugBase = magazinSlug.split(".")[0].toLowerCase();

    // Prefer 300x250 sau 300x600 — formate universale
    const preferred = [300, 336];

    // 1. Cauta banner al aceluiasi magazin (300x250 sau 300x600)
    const own = banners.find(
      (b) =>
        (b.merchant_slug?.replace(/-ro$/, "") === slugBase ||
          b.merchant?.split(".")[0].toLowerCase() === slugBase) &&
        preferred.includes(b.width)
    );
    if (own) return own;

    // 2. Banner de la alt magazin (evita conflicte cu merchantul curent)
    const other = banners.find(
      (b) =>
        b.merchant_slug?.replace(/-ro$/, "") !== slugBase &&
        b.merchant?.split(".")[0].toLowerCase() !== slugBase &&
        preferred.includes(b.width) &&
        b.image_url
    );
    if (other) return other;

    // 3. Orice banner cu imagine
    return banners.find((b) => b.image_url) || null;
  } catch {
    return null;
  }
}

function loadBlogPost(magazinSlug: string): BlogPostMic | null {
  try {
    const p = path.join(process.cwd(), "public", "blog-posts.json");
    if (!fs.existsSync(p)) return null;
    const posts: { slug: string; title: string; excerpt: string; date: string; cover: string; magazin?: string }[] =
      JSON.parse(fs.readFileSync(p, "utf-8"));
    return posts.find((post) => post.magazin === magazinSlug) || null;
  } catch { return null; }
}

interface StoreDesc { titlu: string; paragrafe: string[]; sursa?: string; }

function loadDescriere(slug: string): StoreDesc | null {
  try {
    const p = path.join(process.cwd(), "public", "store-descriptions.json");
    if (!fs.existsSync(p)) return null;
    const all: Record<string, StoreDesc> = JSON.parse(fs.readFileSync(p, "utf-8"));
    return all[slug] || null;
  } catch { return null; }
}

function loadProducts(slug: string): Produs[] {
  try {
    const p = path.join(process.cwd(), "public", "products.json");
    if (!fs.existsSync(p)) return [];
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    const all: Produs[] = raw.products || raw;
    return all.filter((pr) => {
      const ms = (pr.merchant_slug || "").toLowerCase();
      const mn = (pr.merchant || "").toLowerCase();
      const s = slug.toLowerCase();
      return ms === s || mn === s || ms.startsWith(s.split(".")[0]) || mn.includes(s.split(".")[0]);
    }).slice(0, 24);
  } catch { return []; }
}

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Cauta magazinul tolerand URL-uri vechi (majuscule/forme anterioare ale slug-ului):
// 1) potrivire exacta  2) case-insensitive  3) pe primul label de domeniu (surfshark ~ surfshark.com)
function gasesteMagazin(magazine: Magazin[], slug: string): Magazin | undefined {
  const s = slug.toLowerCase();
  const base = s.split(".")[0];
  return (
    magazine.find((x) => x.magazin === slug) ||
    magazine.find((x) => x.magazin.toLowerCase() === s) ||
    magazine.find((x) => x.magazin.toLowerCase().split(".")[0] === base)
  );
}

export async function generateStaticParams() {
  const magazine = loadData();
  return magazine.map((m) => ({ magazin: m.magazin }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ magazin: string }>;
}): Promise<Metadata> {
  const { magazin: slug } = await params;
  const magazine = loadData();
  const m = gasesteMagazin(magazine, slug);

  if (!m) return { title: "Magazin negăsit | AmCupon.ro" };

  const nume = numeAfisat(m.magazin);
  const an = new Date().getFullYear();
  const luna = lunaRo();
  const nrPromo = m.promotii.length;
  const nrCod = m.promotii.filter((p) => p.cod_cupon).length;
  // Canonical = mereu slug-ul curat al magazinului (nu forma din URL accesat)
  const pageUrl = `https://amcupon.ro/cod-reducere/${m.magazin}`;

  // Titlu optimizat — format care rankuieste (ex: cuponeria)
  const title = nrCod > 0
    ? `Cod Reducere ${nume} ${luna} ${an} — ${nrCod} cod${nrCod > 1 ? "uri" : ""} activ${nrCod > 1 ? "e" : ""} | AmCupon.ro`
    : nrPromo > 0
    ? `Cod Reducere ${nume} ${luna} ${an} — ${nrPromo} ofert${nrPromo > 1 ? "e" : "ă"} active | AmCupon.ro`
    : `Cod Reducere ${nume} ${luna} ${an} — Voucher verificat | AmCupon.ro`;

  // Descriere: custom pentru top magazine, generic pentru restul
  const descCustom = DESCRIERI_CUSTOM[slug];
  const descGeneric = nrPromo > 0
    ? `✅ ${nrPromo} cod${nrPromo > 1 ? "uri" : ""} de reducere ${nume} verificate ${luna} ${an}. Voucher ${nume} activ — ${m.promotii[0].nume}. Economisește cu AmCupon.ro, actualizat zilnic.`
    : `Cod reducere ${nume} ${an} — voucher și promoții verificate pe AmCupon.ro. Categorie: ${m.categorie}. Actualizat zilnic.`;
  const description = descCustom || descGeneric;

  return {
    title,
    description,
    keywords: [
      `cod reducere ${nume.toLowerCase()}`,
      `voucher ${nume.toLowerCase()}`,
      `cupon ${nume.toLowerCase()}`,
      `cod promotional ${nume.toLowerCase()}`,
      `reducere ${nume.toLowerCase()} ${an}`,
      `${nume.toLowerCase()} discount`,
      `${slug}`,
      "coduri reducere romania",
      "amcupon.ro",
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [
        {
          url: m.logo_url || "/og-image.png",
          width: m.logo_url ? 400 : 1200,
          height: m.logo_url ? 400 : 630,
          alt: `Cod reducere ${nume} — AmCupon.ro`,
        },
      ],
    },
    twitter: {
      card: m.logo_url ? "summary" : "summary_large_image",
      title,
      description,
      images: [m.logo_url || "/og-image.png"],
    },
  };
}

export default async function PaginaMagazin({
  params,
}: {
  params: Promise<{ magazin: string }>;
}) {
  const { magazin: slug } = await params;
  const magazine = loadData();
  const m = gasesteMagazin(magazine, slug);

  if (!m) notFound();

  // Folosim slug-ul curat al magazinului pentru toate loader-ele (consistenta)
  const cleanSlug = m.magazin;
  const produse = loadProducts(cleanSlug);
  const blogPost = loadBlogPost(cleanSlug);
  const banner = loadBanner(cleanSlug);
  const descriere = loadDescriere(cleanSlug);

  // Magazine similare din aceeasi categorie (max 8, prioritate la cele cu promotii)
  const RETELE_AFILIERE = ["profitshare.ro", "2performant.com"];
  const similare: MagazinSimilar[] = magazine
    .filter((x) =>
      x.magazin !== slug &&
      x.categorie_slug &&
      x.categorie_slug === m.categorie_slug &&
      !RETELE_AFILIERE.includes(x.magazin) &&
      !/\s/.test(x.magazin)
    )
    .sort((a, b) =>
      (b.are_promotie ? 1 : 0) - (a.are_promotie ? 1 : 0) ||
      (a.rank || 999) - (b.rank || 999)
    )
    .slice(0, 8)
    .map((x) => ({
      magazin: x.magazin,
      logo_url: x.logo_url,
      are_promotie: x.are_promotie,
      cod_cupon: x.cod_cupon,
      promotii: x.promotii.map((p) => ({ nume: p.nume })),
    }));

  const nume = numeAfisat(m.magazin);
  const an = new Date().getFullYear();
  const luna = lunaRo();
  const pageUrl = `https://amcupon.ro/cod-reducere/${slug}`;
  const nrPromo = m.promotii.length;
  const nrCod = m.promotii.filter((p) => p.cod_cupon).length;
  const descCustom = DESCRIERI_CUSTOM[slug];

  // ── Schema.org ─────────────────────────────────────────────────────────────
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: "Magazine", item: "https://amcupon.ro/toate-magazinele" },
      { "@type": "ListItem", position: 3, name: `Cod reducere ${nume}`, item: pageUrl },
    ],
  };

  const offerList = nrPromo > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Coduri reducere ${nume} ${luna} ${an}`,
    description: `${nrPromo} oferte active ${nume} verificate pe AmCupon.ro`,
    url: pageUrl,
    numberOfItems: nrPromo,
    itemListElement: m.promotii.map((promo, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Offer",
        name: promo.nume,
        description: promo.descriere || promo.nume,
        url: promo.landing_page || pageUrl,
        availability: "https://schema.org/InStock",
        validThrough: new Date(Date.now() + promo.zile_ramase * 86400000).toISOString(),
        ...(promo.cod_cupon ? { disambiguatingDescription: `Cod: ${promo.cod_cupon}` } : {}),
        seller: {
          "@type": "Organization",
          name: nume,
          url: m.url,
          ...(m.logo_url ? { logo: m.logo_url } : {}),
        },
      },
    })),
  } : null;

  // AggregateRating: calculat din procent_succes (0-100) → scala 1-5
  // Afișat doar dacă magazinul are date suficiente (folosit_de >= 5 sau procent_succes > 0)
  const ratingValue = m.procent_succes > 0
    ? Math.min(5, Math.max(1, 1 + (m.procent_succes / 100) * 4)).toFixed(1)
    : null;
  const reviewCount = Math.max(5, m.folosit_de || 5);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: nume,
    url: m.url,
    ...(m.logo_url ? { logo: m.logo_url } : {}),
    sameAs: [m.url],
    ...(ratingValue ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    } : {}),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Cum folosesc codul de reducere ${nume}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Copiază codul de reducere ${nume} de pe AmCupon.ro, adaugă produsele în coș pe ${m.url}, iar la finalizarea comenzii introdu codul în câmpul „Cod promoțional" sau „Voucher". Reducerea se aplică automat înainte de plată.`,
        },
      },
      {
        "@type": "Question",
        name: `Codul de reducere ${nume} este verificat?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Da. AmCupon.ro verifică și actualizează zilnic toate codurile ${nume}. Afișăm rata de succes (${m.procent_succes}%) și zilele rămase de valabilitate pentru fiecare cod în parte.`,
        },
      },
      {
        "@type": "Question",
        name: `Câte oferte active are ${nume} acum?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: nrPromo > 0
            ? `${nume} are ${nrPromo} ofert${nrPromo > 1 ? "e" : "ă"} active în ${luna} ${an}${nrCod > 0 ? `, dintre care ${nrCod} cu cod de reducere` : ""}. Toate sunt verificate și actualizate zilnic pe AmCupon.ro.`
            : `Verificăm zilnic promoțiile ${nume}. Revino în curând pentru oferte noi.`,
        },
      },
      {
        "@type": "Question",
        name: "Este AmCupon.ro gratuit?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Da, AmCupon.ro este 100% gratuit pentru utilizatori. Nu plătești nimic în plus față de prețul normal al produselor. Noi primim un mic comision de la magazine din bugetul lor de marketing, fără costuri suplimentare pentru tine.",
        },
      },
      {
        "@type": "Question",
        name: `Ce categorie de produse oferă ${nume}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${nume} este un magazin din categoria ${m.categorie}. ${descCustom ? descCustom.split(".")[0] + "." : `Găsești coduri de reducere ${nume} actualizate zilnic pe AmCupon.ro.`}`,
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      {offerList && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerList) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MagazinClient magazin={m} produse={produse} similare={similare} blogPost={blogPost} banner={banner} descriere={descriere} />
    </>
  );
}
