import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import HomeClient, { type Magazin } from "./HomeClient";

export const metadata: Metadata = {
  title: "AmCupon.ro — Coduri de reducere si oferte verificate zilnic",
  description:
    "Peste 1000 de magazine partenere din Romania cu coduri de reducere si oferte actualizate zilnic. Economiseste inteligent la eMAG, Fashion Days, Notino, Dr.Max si multe altele.",
  alternates: { canonical: "https://amcupon.ro" },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere si oferte verificate zilnic",
    description:
      "Peste 1000 de magazine partenere cu coduri si oferte actualizate zilnic. Economiseste la fiecare comanda.",
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

// Campuri din output.json pe care prima pagina NU le citeste. Masurat 14.09.2026: HTML-ul
// avea 1,57 MB, din care 1,08 MB date trimise catre HomeClient — toate cele 1.151 de magazine,
// cu TOATE campurile. Scoase de aici, ele nu mai pot fi citite nici din greseala: interfata
// `Magazin` din HomeClient nu le mai declara, deci `tsc` pica daca cineva le foloseste.
// CU O EXCEPTIE, prinsa la comparatia textului vizibil, nu de tsc: un camp OPTIONAL in
// interfata altei componente trece de compilare. `ultima_verificare` e optional in
// `lib/dealScore.ts`; scos, Deal Score-ul afisat scadea (90 -> 75). Inainte sa adaugi un
// camp aici: grep in lib/ si app/components/, nu doar in HomeClient.
// `comision` e si o scurgere: comisionul nostru nu are ce cauta in browser (LECTII-TEHNICE #10).
const CAMPURI_NEFOLOSITE = [
  "platforma", "program_id", "program_name", "unique_code", "allows_deep_linking",
  "canal_recomandat", "scor_afiliere", "rank", "trend", "prioritate",
  "comision", "procent_succes", "folosit_de", "produse_in_feed", "sursa_import",
];

function doarCeFolosesteHomepage(lista: Record<string, unknown>[]): Magazin[] {
  return lista.map((m) => {
    const usor: Record<string, unknown> = { ...m };
    for (const k of CAMPURI_NEFOLOSITE) delete usor[k];
    if (Array.isArray(usor.promotii)) {
      usor.promotii = (usor.promotii as Record<string, unknown>[]).map((p) => {
        const { sursa: _sursa, ...rest } = p;
        return rest;
      });
    }
    return usor as unknown as Magazin;
  });
}

export default function Page() {
  const magazine = doarCeFolosesteHomepage(readJSON<Record<string, unknown>[]>("output.json", []));
  const blogAll = readJSON<Parameters<typeof HomeClient>[0]["blogPosts"]>("blog-latest.json", []);
  // Doar ce afiseaza sectiunea „Recomandate". Fisierul are si `comision` si `oferta` (textul
  // retelei, uneori scris pentru afiliati: „Câștigă premii și comision de 19%!") — nu se
  // afisau, dar ajungeau in HTML-ul paginii. Aceeasi regula ca CAMPURI_NEFOLOSITE.
  const recomandate = (readJSON<Record<string, unknown>[]>("recomandate.json", []) || []).map((r) => ({
    magazin: String(r.magazin ?? ""), nume: String(r.nume ?? ""), logo_url: String(r.logo_url ?? ""),
    categorie: String(r.categorie ?? ""), are_cod: Boolean(r.are_cod),
  }));
  const produseCategorii = buildProduseCategorii();

  // Server Component, randat o singura data per request/ISR — Date.now() aici e sigur
  // (nu declanseaza hidratare), acelasi pattern ca cod-reducere/[magazin]/page.tsx.
  const astazi = new Date().toISOString().slice(0, 10);

  return (
    <HomeClient
      magazine={magazine}
      blogPosts={(blogAll || []).slice(0, 3)}
      recomandate={recomandate || []}
      produseCategorii={produseCategorii}
      astazi={astazi}
    />
  );
}
