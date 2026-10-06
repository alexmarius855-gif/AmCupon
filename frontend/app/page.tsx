import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import HomeClient, { type Magazin } from "./HomeClient";
import { pesteMagazine, PesteMagazine, laParteneri } from "@/lib/cifreSite";

export const metadata: Metadata = {
  title: "AmCupon.ro — Coduri de reducere si oferte actualizate zilnic",
  description:
    `${PesteMagazine()} partenere cu coduri de reducere si oferte actualizate zilnic: ${laParteneri(["fashion", "beauty", "sanatate", "electronice"], 4).replace(/^la /, "")} si multe altele.`,
  alternates: { canonical: "https://amcupon.ro" },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere si oferte actualizate zilnic",
    description:
      `${PesteMagazine()} partenere cu coduri si oferte actualizate zilnic.`,
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

// Pentru un magazin FARA oferta, prima pagina citeste doar numele (cautarea), logo-ul (peretele de
// logo-uri, „Magazine populare"), categoria si vanzarile (ordinea categoriilor). Restul — linkul de
// afiliere, URL-ul, data verificarii — ajungea degeaba in HTML: masurat 27.09.2026, 832 de magazine
// fara oferta = 388 KiB din cei 538 ai listei. Campurile grele le citesc DOAR cardurile de magazin,
// care apar numai pentru magazinele cu oferta (`cuPromotii`, `FiltreRapide`, „Reduceri mari azi").
// Daca adaugi un loc care citeste alt camp pentru TOATE magazinele, adauga campul aici.
const CAMPURI_FARA_OFERTA = ["magazin", "logo_url", "categorie_slug", "sales_number"];

function doarCeFolosesteHomepage(lista: Record<string, unknown>[]): Magazin[] {
  return lista.map((m) => {
    if (!Array.isArray(m.promotii) || m.promotii.length === 0) {
      const mic: Record<string, unknown> = { are_promotie: false, promotii: [] };
      for (const k of CAMPURI_FARA_OFERTA) if (m[k] !== undefined) mic[k] = m[k];
      return mic as unknown as Magazin;
    }
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
      pesteMagazine={pesteMagazine()}
    />
  );
}
