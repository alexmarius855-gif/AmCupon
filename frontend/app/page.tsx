import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "AmCupon.ro — Coduri de reducere si oferte verificate zilnic",
  description:
    "Peste 1000 de magazine partenere din Romania cu coduri de reducere si oferte verificate zilnic. Economiseste inteligent la eMAG, Fashion Days, Notino, Dr.Max si multe altele.",
  alternates: { canonical: "https://amcupon.ro" },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere si oferte verificate zilnic",
    description:
      "Peste 1000 de magazine partenere cu coduri si oferte verificate zilnic. Economiseste la fiecare comanda.",
    url: "https://amcupon.ro",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

// Server Component: citeste datele o singura data la build/request (SSR) → continut
// real in HTML pentru Google + prima pictura instant, fara fetch de 929KB in client.
function readJSON<T>(rel: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), "public", rel);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

interface HomeProdus {
  title: string; url: string; image: string; price: number;
  old_price?: number; discount_pct: number; brand: string;
  merchant: string; merchant_slug: string;
}
interface ProdusCategorie { slug: string; label: string; emoji: string; products: HomeProdus[]; }

function buildProduseCategorii(): ProdusCategorie[] {
  const data = readJSON<{ by_category?: ProdusCategorie[]; products?: HomeProdus[] }>("products-home.json", {});
  const cats = data?.by_category || [];
  const valid = cats.filter((c) => (c.products?.length || 0) >= 2);
  if (valid.length > 0) return valid;
  // Fallback: lista plata → un singur rand "Produse populare"
  const all = (data?.products || []).filter((p) => p.image && p.price > 0);
  if (all.length === 0) return [];
  all.sort((a, b) => (b.discount_pct || 0) - (a.discount_pct || 0));
  return [{ slug: "toate", label: "Produse populare", emoji: "🛍️", products: all.slice(0, 16) }];
}

interface HomeBanner {
  id: number; image_url: string; landing_url: string;
  width: number; height: number; merchant: string; name: string;
}
function buildBanners(): HomeBanner[] {
  const parsed = readJSON<HomeBanner[] | { banners?: HomeBanner[] }>("banners.json", []);
  const raw: HomeBanner[] = Array.isArray(parsed) ? parsed : (parsed?.banners || []);
  // Dreptunghiuri/patrate potrivite pentru un grid curat (nu leaderboard/skyscraper/buton)
  return raw
    .filter(b => b.image_url && b.landing_url && b.width >= 250 && b.width <= 420 && b.height >= 180 && b.height <= 360)
    .slice(0, 8);
}

export default function Page() {
  const magazine = readJSON<Parameters<typeof HomeClient>[0]["magazine"]>("output.json", []);
  const blogAll = readJSON<Parameters<typeof HomeClient>[0]["blogPosts"]>("blog-latest.json", []);
  const recomandate = readJSON<Parameters<typeof HomeClient>[0]["recomandate"]>("recomandate.json", []);
  const produseCategorii = buildProduseCategorii();
  const banners = buildBanners();

  return (
    <HomeClient
      magazine={magazine}
      blogPosts={(blogAll || []).slice(0, 3)}
      recomandate={recomandate || []}
      produseCategorii={produseCategorii}
      banners={banners}
    />
  );
}
