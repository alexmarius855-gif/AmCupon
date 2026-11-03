import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import GrilaOferte from "../components/GrilaOferte";
import { poolOferte, grilaOferte, type MagazinGrila } from "@/lib/grilaOferte";
import { cuNumar } from "@/lib/oferteAcasa";
import { numeAfisat } from "@/lib/numeMagazin";
import { CATEGORII_SITE } from "@/lib/site";
import { PesteMagazine } from "@/lib/cifreSite";
import { titluPromotie } from "@/lib/oferta";

/**
 * Toate ofertele active, remodelata pe 03.11.2026. Masurat inainte: 80.895 px pe telefon, cate un card pentru fiecare
 * dintre cele ~270 de oferte, sortate „cod intai" (deci magazine straine primele), cu etichetele categoriilor pe
 * taxonomia engleza moarta si un text fals („1000+ magazine", „o data pe saptamana"). Acum: aceeasi ordine si acelasi
 * card ca pe prima pagina, primele 24 + „Arată încă".
 */
interface Magazin extends MagazinGrila {
  categorie_slug?: string;
}

const LUNI_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
  "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

const eticheta = (slug: string) => CATEGORII_SITE.find((c) => c.slug === slug)?.label;

function citeste(): Magazin[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ cat?: string }> },
): Promise<Metadata> {
  const { cat } = await searchParams;
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();
  const catLabel = cat ? eticheta(cat) : null;
  const title = catLabel
    ? `Oferte ${catLabel} de Azi — Reduceri ${luna} ${an} | AmCupon.ro`
    : `Oferte de azi: toate promoțiile active, ${luna} ${an}`;
  const description = catLabel
    ? `Toate ofertele active ${catLabel} din România pentru ${luna} ${an}. Coduri de reducere și promoții actualizate zilnic pe AmCupon.ro.`
    : `Toate ofertele și promoțiile active de azi în România. Coduri de reducere actualizate zilnic la ${PesteMagazine()} online. Actualizat ${luna} ${an}.`;
  return {
    title,
    description,
    keywords: ["oferte de azi", "promoții de azi", "reduceri de azi românia", "coduri reducere active", "oferte online românia"],
    alternates: { canonical: "https://amcupon.ro/oferte-azi" },
    openGraph: {
      title, description,
      url: "https://amcupon.ro/oferte-azi",
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630, alt: "AmCupon.ro" }],
    },
  };
}

const chip = (activ: boolean) =>
  `whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
    activ
      ? "bg-[#ddf93c] text-[#0c1000]"
      : "bg-[var(--surface-alt)] text-[var(--text-soft)] border border-[var(--border-strong)] hover:text-[var(--foreground)]"
  }`;

export default async function OferteAziPage(
  { searchParams }: { searchParams: Promise<{ cat?: string }> },
) {
  const { cat } = await searchParams;
  const luna = LUNI_RO[new Date().getMonth()];
  const an = new Date().getFullYear();

  const toate = poolOferte(citeste());
  const peCategorie = new Map<string, number>();
  for (const o of toate) {
    const s = o.m.categorie_slug || "";
    peCategorie.set(s, (peCategorie.get(s) || 0) + 1);
  }
  const categorii = CATEGORII_SITE
    .filter((c) => peCategorie.get(c.slug))
    .sort((a, b) => (peCategorie.get(b.slug) || 0) - (peCategorie.get(a.slug) || 0));
  const pool = cat ? toate.filter((o) => o.m.categorie_slug === cat) : toate;
  const grila = grilaOferte(pool, { limita: 400, maxPeMagazinToate: 3, faraFiltre: [] });
  const nrMagazine = new Set(pool.map((o) => o.m.magazin)).size;
  const catLabel = cat ? eticheta(cat) : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Oferte de Azi România — ${luna} ${an}`,
    url: "https://amcupon.ro/oferte-azi",
    numberOfItems: pool.length,
    itemListElement: pool.slice(0, 24).map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: titluPromotie(o.promo, numeAfisat(o.m.magazin)),
      url: `https://amcupon.ro/cod-reducere/${o.m.magazin}`,
    })),
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight mb-2">
          {catLabel ? `Oferte ${catLabel} de azi` : "Oferte de azi"}
        </h1>
        <p className="text-[var(--text-soft)] mb-4">
          {cuNumar(pool.length, "ofertă activă", "oferte active")} la {cuNumar(nrMagazine, "magazin", "magazine")}, actualizate de trei ori pe zi. Magazinele din România sunt primele, apoi reducerile cele mai mari.
        </p>

        <nav aria-label="Categorii" className="-mx-4 px-4 mb-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex items-center gap-2 min-w-max">
            <Link href="/oferte-azi" className={chip(!cat)}>Toate ({toate.length})</Link>
            {categorii.map((c) => (
              <Link key={c.slug} href={`/oferte-azi?cat=${c.slug}`} className={chip(cat === c.slug)}>
                {c.label} ({peCategorie.get(c.slug)})
              </Link>
            ))}
          </div>
        </nav>

        {pool.length === 0 ? (
          <div className="text-center py-16 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <p className="font-black text-lg mb-2">Nicio ofertă activă în această categorie</p>
            <p className="text-[var(--text-soft)] text-sm mb-5">Încearcă altă categorie sau revino mai târziu.</p>
            <Link href="/oferte-azi" className="inline-block bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Vezi toate ofertele
            </Link>
          </div>
        ) : (
          <GrilaOferte key={cat || "toate"} {...grila} sursa="oferte_azi" pas={24} />
        )}
      </div>
    </div>
  );
}
