import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import GrilaOferte from "../../components/GrilaOferte";
import MagazineCompacte from "../../components/MagazineCompacte";
import { CardProdus } from "../../components/OferteParteneri";
import { poolOferte, grilaOferte } from "@/lib/grilaOferte";
import { cuNumar, EXCLUSE_ACASA } from "@/lib/oferteAcasa";
import { linkuriPlatite } from "@/lib/oferteTema";
import { GAZDE_TRACKING } from "@/lib/linkMagazin";
import { numeAfisat } from "@/lib/numeMagazin";
import type { ProdusFeed } from "@/lib/topFeed";
import { CATEGORIE_PAGINA } from "@/lib/cadouri";
import { criteriiCategorie } from "@/lib/criterii";

/**
 * Pagina unei categorii, remodelata pe 03.11.2026. Ordinea: ce oferte sunt azi (acelasi card si aceeasi ordine ca pe
 * prima pagina, partenerii .ro intai) -> produse cu pret si link platit (formatul care a adus clicuri) -> magazinele
 * fara oferta, compact -> intrebari. Inainte, fiecare magazin fara oferta era un card mare (103 pe casa-gradina),
 * iar FAQPage din schema nu aparea pe pagina (LECTII-TEHNICE #7): acum textul vizibil si schema vin din aceeasi lista.
 */
interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  logo_url?: string;
  categorie: string;
  categorie_slug: string;
  sales_number: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string; descriere?: string; cod_cupon?: string; landing_page?: string; zile_ramase: number }[];
}

// Doar sluguri reale; restul numelor vin din date (`categorie`). Titlurile din Google raman cele de pana acum.
const NUME_CATEGORIE: Record<string, string> = { fashion: "Fashion", beauty: "Frumusețe", software: "Software" };

// Textele NU numesc magazine: numele vin din date, deci nu pot deveni false (LECTII-TEHNICE #2, valul 5).
const DESC_CATEG: Record<string, string> = {
  marketplace: "Coduri de reducere pentru marketplace-uri și magazine generaliste, unde găsești de toate într-un singur loc.",
  "casa-gradina": "Reduceri la mobila, decorațiuni, unelte și tot ce tine de casa și gradina.",
  electronice: "Coduri de reducere pentru laptopuri, telefoane, televizoare și electronice IT.",
  fashion: "Vouchere și coduri de reducere pentru haine, încălțăminte și accesorii.",
  software: "Reduceri la licențe software, aplicații și servicii digitale, de la antivirus și VPN pana la unelte de productivitate.",
  calatorii: "Coduri de reducere pentru cazare, zboruri, eSIM și servicii de călătorie.",
  beauty: "Vouchere și coduri de reducere pentru parfumuri, cosmetice și produse de îngrijire.",
  sanatate: "Reduceri la farmacii online, suplimente, vitamine și produse de îngrijire personala.",
  sport: "Coduri de reducere pentru echipament sportiv, îmbrăcăminte de antrenament și articole outdoor.",
  "carti-educatie": "Reduceri la carti, manuale și audiobook-uri.",
  copii: "Coduri de reducere la jucării, haine și produse pentru copii și bebeluși.",
  "auto-moto": "Reduceri la piese auto, anvelope, accesorii și echipament moto.",
  servicii: "Coduri de reducere pentru servicii online: găzduire, unelte de business, abonamente și platforme digitale.",
  bijuterii: "Vouchere și reduceri la bijuterii, ceasuri și accesorii.",
  animale: "Coduri de reducere pentru hrana, accesorii și produse de îngrijire pentru animale de companie.",
  "mancare-bauturi": "Reduceri la livrare de mâncare, cafea, vin și băuturi.",
  "cadouri-flori": "Coduri de reducere pentru flori, cadouri personalizate și experiente.",
  financiar: "Oferte la carduri, credite, asigurări și servicii financiare.",
};

function loadData(): Magazin[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
}

/** Produsele magazinelor din categorie: doar cu link platit, maximum 2 de la acelasi magazin (exact pe merchant_slug). */
function loadProduse(magazine: Set<string>, slug: string, limita = 8): ProdusFeed[] {
  // Magazinul singur nu ajunge (fond de ten la Bijuterii, lotiune de corp la Mancare): `cat_slug` din categorii_produse.py.
  const tinta = CATEGORIE_PAGINA[slug];
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "products.json"), "utf-8"));
    const lista: ProdusFeed[] = Array.isArray(raw) ? raw : (raw.products || []);
    const platite = linkuriPlatite();
    const vazute = new Set<string>();
    const peMagazin = new Map<string, number>();
    const out: ProdusFeed[] = [];
    for (const p of lista) {
      const m = (p.merchant_slug || "").toLowerCase();
      if (!magazine.has(m) || !platite.has(m) || EXCLUSE_ACASA.has(m)) continue;
      if (tinta && p.cat_slug !== tinta) continue;
      if (p.is_promo || !p.image || !p.title || !p.url || !GAZDE_TRACKING.test(p.url) || typeof p.price !== "number" || p.price <= 0) continue;
      if (vazute.has(p.title) || (peMagazin.get(m) || 0) >= 2) continue;
      vazute.add(p.title);
      peMagazin.set(m, (peMagazin.get(m) || 0) + 1);
      out.push(p);
      if (out.length >= limita) break;
    }
    return out;
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const slugs = [...new Set(loadData().map((m) => m.categorie_slug).filter(Boolean))];
  return slugs.map((slug) => ({ slug }));
}

const LUNI_RO = [
  "ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie",
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const mag = loadData().filter((m) => m.categorie_slug === slug);
  if (!mag.length) return { title: "Categorie negasita | AmCupon.ro" };

  const numeCateg = NUME_CATEGORIE[slug] || mag[0].categorie;
  const cuPromo = mag.filter((m) => m.are_promotie).length;
  const cuCod = mag.filter((m) => m.cod_cupon).length;
  const an = new Date().getFullYear();
  const luna = LUNI_RO[new Date().getMonth()];
  const pageUrl = `https://amcupon.ro/categorii/${slug}`;

  const titluPlin = cuCod > 0
    // 22.09.2026, doua reparatii pe cele 49 de pagini de categorie:
    //  1. „1 oferte active" / „1 coduri active" — pluralul era hardcodat, deci
    //     singularul iesea in dezacord, direct in rezultatul Google;
    //  2. toate cele 49 treceau de 60 de caractere, deci titlul era taiat exact pe
    //     partea utila. Sufixul de brand cade primul — nu el aduce clicul.
    ? `Cod Reducere ${numeCateg} ${luna} ${an} — ${cuNumar(cuCod, "cod activ", "coduri active")}`
    : `Coduri reducere ${numeCateg} ${an} — ${cuNumar(cuPromo, "ofertă activă", "oferte active")}`;
  // Peste 60 de caractere, luna cade prima: anul si numarul de coduri spun mai mult.
  const title = titluPlin.length <= 60 ? titluPlin : titluPlin.replace(` ${luna} ${an}`, ` ${an}`);

  const description = `${cuPromo > 0 ? `✅ ${cuPromo === 1 ? "O promoție activă" : cuNumar(cuPromo, "promoție activă", "promoții active")}` : "Coduri și oferte"} la ${cuNumar(mag.length, "magazin", "magazine")} de ${numeCateg} din România. ${cuCod > 0 ? `${cuCod === 1 ? "Un cod de reducere activ" : cuNumar(cuCod, "cod de reducere activ", "coduri de reducere active")} în ${luna} ${an}. ` : ""}Oferte actualizate zilnic pe AmCupon.ro.`;

  return {
    title,
    description,
    keywords: [
      `cod reducere ${numeCateg.toLowerCase()}`,
      `reduceri ${numeCateg.toLowerCase()} ${an}`,
      `magazine ${numeCateg.toLowerCase()} românia`,
      `voucher ${numeCateg.toLowerCase()}`,
      `promoții ${numeCateg.toLowerCase()}`,
      "coduri reducere românia",
      "amcupon.ro",
    ],
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
    },
  };
}

const H2 = "text-xl md:text-2xl font-black tracking-tight text-[var(--foreground)]";

export default async function PaginaCategorie({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mag = loadData().filter((m) => m.categorie_slug === slug);
  if (!mag.length) notFound();

  const numeCateg = NUME_CATEGORIE[slug] || mag[0].categorie;
  const an = new Date().getFullYear();
  const luna = LUNI_RO[new Date().getMonth()];
  const pageUrl = `https://amcupon.ro/categorii/${slug}`;
  const dinRo = (s: string) => s.endsWith(".ro") || s.startsWith("ro.");

  const pool = poolOferte(mag);
  const grila = grilaOferte(pool, { limita: 60, maxPeMagazinToate: 2 });
  const cuOferta = new Set(pool.map((o) => o.m.magazin));
  const nrCod = grila.numere.cod;
  // 14.11.2026: /alege aduce aproape toate clicurile reale; fiecare categorie trimite spre paginile ei.
  const criteriiCat = criteriiCategorie(slug);
  const produse = loadProduse(new Set(mag.map((m) => (m.magazin || "").toLowerCase())), slug);
  const faraOferta = mag
    .filter((m) => !cuOferta.has(m.magazin) && !EXCLUSE_ACASA.has(m.magazin))
    .sort((a, b) => Number(dinRo(b.magazin)) - Number(dinRo(a.magazin)) || (b.sales_number || 0) - (a.sales_number || 0));
  // Magazinele cu cod pe care le numeste raspunsul, din aceleasi oferte ca pagina.
  const cuCod = [...new Set(pool.filter((o) => o.cod).map((o) => numeAfisat(o.m.magazin)))].slice(0, 3);

  const intrebari = [
    {
      q: `Unde găsesc coduri de reducere la magazine de ${numeCateg}?`,
      a: `Pe AmCupon.ro, azi: ${cuNumar(pool.length, "ofertă activă", "oferte active")} la ${cuNumar(mag.length, "magazin", "magazine")} de ${numeCateg}. Lista se actualizează automat de trei ori pe zi și e gratuită.`,
    },
    {
      q: `Câte coduri de reducere ${numeCateg} sunt active în ${luna} ${an}?`,
      a: nrCod > 0
        ? `Azi ${nrCod === 1 ? "este activ 1 cod" : `sunt active ${cuNumar(nrCod, "cod", "coduri")}`} de reducere, la magazine precum ${cuCod.join(", ")}. Nu le testăm în coș: le preluăm de la rețelele de afiliere și le scoatem când expiră.`
        : `Azi nu este activ niciun cod în această categorie, dar sunt ${cuNumar(pool.length, "ofertă", "oferte")} care nu cer cod.`,
    },
    {
      q: "Cum folosesc un cod de reducere?",
      a: `Apeși pe cod: se copiază și se deschide magazinul. Adaugi produsele în coș, iar la plată lipești codul în câmpul „Cod promoțional" sau „Voucher".`,
    },
    {
      q: "Este AmCupon.ro gratuit?",
      a: "Da, e gratuit pentru cumpărători. Magazinele ne plătesc un comision din bugetul lor de marketing, fără cost în plus pentru tine.",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
        { "@type": "ListItem", position: 2, name: "Categorii", item: "https://amcupon.ro/categorii" },
        { "@type": "ListItem", position: 3, name: numeCateg, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: intrebari.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
    },
    ...(cuOferta.size > 0 ? [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Magazine ${numeCateg} cu reduceri — ${luna} ${an}`,
      url: pageUrl,
      numberOfItems: cuOferta.size,
      itemListElement: [...cuOferta].slice(0, 10).map((s, i) => ({
        "@type": "ListItem", position: i + 1, url: `https://amcupon.ro/cod-reducere/${s}`, name: numeAfisat(s),
      })),
    }] : []),
  ];

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="max-w-7xl mx-auto px-4 pt-4 pb-10 space-y-10">
        <header>
          <nav aria-label="Breadcrumb" className="text-xs text-[var(--text-muted)] mb-4">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1.5">/</span>
            <Link href="/categorii" className="hover:text-[var(--accent-text)]">Categorii</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[var(--text-soft)]">{numeCateg}</span>
          </nav>
          <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight mb-2">Coduri de reducere {numeCateg} {an}</h1>
          <p className="text-[var(--text-soft)] max-w-3xl">
            {DESC_CATEG[slug] ? `${DESC_CATEG[slug]} ` : ""}
            {cuNumar(pool.length, "ofertă activă", "oferte active")} la {cuNumar(mag.length, "magazin", "magazine")}, actualizate de trei ori pe zi.
          </p>
        </header>

        {pool.length > 0 && (
          <section aria-labelledby="oferte-h">
            <h2 id="oferte-h" className={`${H2} mb-3`}>Ofertele de azi</h2>
            <GrilaOferte {...grila} sursa="categorie" />
          </section>
        )}

        {produse.length >= 4 && (
          <section aria-labelledby="produse-h">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <h2 id="produse-h" className={H2}>Produse din {numeCateg}</h2>
              <Link href="/produse" className="text-sm font-bold text-[var(--accent-text)] hover:underline whitespace-nowrap">Toate →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {produse.map((p) => <CardProdus key={p.url} p={p} />)}
            </div>
          </section>
        )}

        {criteriiCat.length > 0 && (
          <nav aria-labelledby="alege-h">
            <h2 id="alege-h" className={`${H2} mb-1`}>Alege după caracteristică</h2>
            <p className="text-sm text-[var(--text-soft)] mb-3">Produse cu prețul verificat pe site-ul magazinului.</p>
            <div className="flex flex-wrap gap-2">
              {criteriiCat.map((c) => (
                <Link key={c.slug} href={`/alege/${c.slug}`} className="text-sm font-semibold px-3 py-1.5 rounded-full border border-[var(--border-strong)] text-[var(--text-soft)] hover:border-[var(--accent-text)] hover:text-[var(--accent-text)] transition-colors">
                  {c.titlu}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {faraOferta.length > 0 && (
          <section aria-labelledby="magazine-h">
            <h2 id="magazine-h" className={`${H2} mb-1`}>{pool.length > 0 ? "Alte magazine" : "Magazine"} din {numeCateg}</h2>
            <p className="text-sm text-[var(--text-muted)] mb-3">Fără ofertă azi. Pe pagina fiecărui magazin poți cere o alertă când apare una.</p>
            <MagazineCompacte magazine={faraOferta} />
          </section>
        )}

        <section aria-labelledby="faq-h" className="max-w-3xl">
          <h2 id="faq-h" className={`${H2} mb-3`}>Întrebări despre reducerile {numeCateg}</h2>
          <div className="space-y-2">
            {intrebari.map((i) => (
              <details key={i.q} className="group bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none">
                  <h3 className="font-bold text-sm leading-snug">{i.q}</h3>
                  <span className="text-[var(--accent-text)] text-lg leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="px-4 pb-4 text-sm text-[var(--text-soft)] leading-relaxed">{i.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="pt-6 border-t border-[var(--border)] flex justify-between flex-wrap gap-3 text-sm">
          <Link href="/categorii" className="text-[var(--text-muted)] hover:text-[var(--accent-text)]">← Toate categoriile</Link>
          <Link href="/toate-magazinele" className="text-[var(--text-muted)] hover:text-[var(--accent-text)]">Toate magazinele →</Link>
        </div>
      </div>
    </div>
  );
}
