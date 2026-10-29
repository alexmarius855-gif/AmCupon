import fs from "fs";
import type { Metadata } from "next";
import { gasesteMagazinBrand } from "@/lib/brandMagazin";
import { linkAfiliat, linkPromotie } from "@/lib/linkMagazin";
import path from "path";
import Link from "next/link";
import MagazinCard, { type CardMagazin } from "./MagazinCard";
import CuponInteractiv from "./CuponInteractiv";

interface Promotie {
  nume: string;
  descriere?: string;
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
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: Promotie[];
  scor_final?: number;
  comision?: string;
}
export interface BrandConfig {
  slug: string;          // ex: "altex.ro"
  slugAlt?: string;      // slug alternativ (ex: "altex")
  name: string;          // ex: "Altex"
  tagline: string;       // ex: "Cel mai mare retailer de electronice"
  emoji: string;
  desc: string;          // descriere scurta pentru SEO
  editorial: string[];   // paragrafe editoriale
  tips: string[];        // sfaturi cumparatori
  faq: { q: string; a: string }[];
  canonical: string;     // ex: "/altex"
  // Folosit DOAR cand brandul nu exista in output.json (fara program de afiliere
  // inca): butonul secundar trimite in categoria asta, unde exista alternative
  // reale, in loc sa duca la /cod-reducere/<slug> care ar da 404.
  categorieSlug?: string; // ex: "electronice"
}

// Cele ~30 de pagini de brand se genereaza in acelasi proces: output.json se citeste o data.
let _toate: Magazin[] | null = null;
function toateMagazinele(): Magazin[] {
  if (!_toate) {
    try {
      _toate = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
    } catch {
      _toate = [];
    }
  }
  return _toate as Magazin[];
}

function loadMagazin(slugs: string[]): Magazin | null {
  // Aceeasi potrivire ca sitemap-ul (lib/brandMagazin.ts).
  try {
    return gasesteMagazinBrand(toateMagazinele(), slugs);
  } catch {
    return null;
  }
}

/**
 * Metadata pentru o pagina de brand, cu reparare automata (05.10.2026).
 *
 * 11 pagini de brand erau ale unor magazine fara program la noi (altex, flanco, elefant,
 * temu, shein, trendyol, vidaxl, iherb, asos, bookzone, banggood) si promiteau „coduri
 * actualizate zilnic" / „promotii verificate"; patru isi declarau canonical-ul catre
 * /cod-reducere/<magazin>, adica un 404. Cand magazinul nu e in output.json, pagina devine
 * onesta si `noindex`, cu canonical catre ea insasi; cand intra in date (program aprobat),
 * revine singura la metadata normala, la urmatorul build.
 */
export function metadataBrand(
  c: Pick<BrandConfig, "slug" | "slugAlt" | "name" | "canonical">,
  normal: Metadata,
): Metadata {
  if (loadMagazin([c.slug, ...(c.slugAlt ? [c.slugAlt] : [])])) return normal;
  return {
    title: `${c.name}: nu avem coduri de reducere | AmCupon.ro`,
    description: `${c.name} nu are program de afiliere pe AmCupon.ro, deci nu publicăm coduri ${c.name}. Vezi ofertele active de la magazinele partenere din aceeași categorie.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `https://amcupon.ro${c.canonical}` },
  };
}

/** Partenerii cu link platit si oferta activa din categorie — .ro intai, apoi dupa scor. */
function alternative(categorieSlug: string | undefined, n = 8): Magazin[] {
  const cat = categorieSlug || "marketplace";
  return toateMagazinele()
    .filter((m) => (m.categorie_slug || "") === cat && linkAfiliat(m) && m.are_promotie && (m.promotii || []).length > 0)
    .sort((a, b) =>
      Number(b.magazin.endsWith(".ro")) - Number(a.magazin.endsWith(".ro")) || (b.scor_final || 0) - (a.scor_final || 0))
    .slice(0, n);
}

/**
 * Pagina unui brand FARA program la noi. Inainte arata „0 oferte active", „Revino maine —
 * actualizam ofertele zilnic de la Temu", „Nu rata urmatoarea oferta Temu" si textul
 * editorial „Pe AmCupon.ro monitorizam toate promotiile Temu" — nimic din toate astea nu
 * se intampla. Aratam doar ce e adevarat si ce poate face omul acum: alternativele reale.
 */
function PaginaFaraProgram({ config }: { config: BrandConfig }) {
  const alt = alternative(config.categorieSlug);
  const linkCategorie = config.categorieSlug ? `/categorii/${config.categorieSlug}` : "/toate-magazinele";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: config.name, item: `https://amcupon.ro${config.canonical}` },
    ],
  };
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <section className="bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 pt-12 pb-12 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[var(--text-muted)] mb-8">
            <Link href="/" className="hover:text-[var(--text-soft)]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[var(--text-soft)]">{config.name}</span>
          </nav>
          <div className="text-5xl mb-4" aria-hidden="true">{config.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-5">
            Reduceri {config.name}: ce găsești pe AmCupon.ro
          </h1>
          <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-6 text-left">
            <p className="font-bold text-[var(--foreground)] mb-2">Nu avem coduri de reducere {config.name}.</p>
            <p className="text-sm text-[var(--text-soft)] leading-relaxed mb-2">
              {config.name} nu are program de afiliere pe AmCupon.ro, așa că rețelele nu ne trimit ofertele sau
              codurile lui. Nu publicăm coduri pe care nu le avem dintr-o sursă: dacă vezi coduri {config.name} pe
              alte site-uri, verifică-le direct pe site-ul {config.name}.
            </p>
            <p className="text-sm text-[var(--text-soft)] leading-relaxed">
              {alt.length > 0
                ? "Mai jos sunt magazinele partenere din aceeași categorie care au oferte active azi."
                : "Ofertele active de la magazinele partenere sunt pe pagina de categorie."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link href={linkCategorie}
              className="bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] font-black px-6 py-3 rounded-xl text-sm transition-colors">
              Vezi categoria &rarr;
            </Link>
            <Link href="/oferte-azi"
              className="bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] border border-[var(--border-strong)] text-[var(--text-soft)] font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Toate ofertele de azi
            </Link>
          </div>
        </div>
      </section>
      {alt.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Alternative cu oferte active azi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {alt.map((m) => (
              <MagazinCard key={m.magazin} m={m as unknown as CardMagazin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function BrandPageTemplate({ config }: { config: BrandConfig }) {
  const slugs = [config.slug, ...(config.slugAlt ? [config.slugAlt] : [])];
  const magazin = loadMagazin(slugs);
  if (!magazin) return <PaginaFaraProgram config={config} />;
  const promotii = magazin.promotii || [];
  // Linkul platit al magazinului sau null (lib/linkMagazin.ts) — nu `url_afiliat` brut, care
  // poate fi chiar adresa simpla a magazinului (click fara comision).
  const linkMagazin = linkAfiliat(magazin);

  const culoare = "bg-gradient-to-br from-[#ddf93c] to-[#c3dd2c]";

  const jsonLd: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
        { "@type": "ListItem", position: 2, name: config.name, item: `https://amcupon.ro${config.canonical}` },
      ],
    },
  ];
  if (config.faq.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: config.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-[var(--background)] overflow-hidden border-b border-[var(--border)]">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.12) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-14 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[var(--text-muted)] mb-8">
            <Link href="/" className="hover:text-[var(--text-soft)]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[var(--text-soft)]">{config.name}</span>
          </nav>

          {/* Logo / initial */}
          <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden mb-5 shadow-xl">
            {magazin?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={magazin.logo_url} alt={`Logo ${config.name}`} className="w-full h-full object-contain bg-[var(--surface)] p-1" />
            ) : (
              <div className={`w-full h-full ${culoare} flex items-center justify-center text-[var(--foreground)] font-black text-3xl`}>
                {config.emoji}
              </div>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-3">
            Reduceri <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>{config.name}</span>
          </h1>
          <p className="text-[var(--text-soft)] text-lg mb-6">{config.tagline}</p>

          {/* Stats row */}
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-8">
            <div className="text-center">
              <div className="font-black text-[var(--foreground)] text-2xl">{promotii.length}</div>
              <div className="text-[var(--text-muted)] text-xs mt-0.5">Oferte active</div>
            </div>
            <div className="text-center">
              <div className="font-black text-[var(--foreground)] text-2xl">{promotii.filter(p => !!p.cod_cupon).length}</div>
              <div className="text-[var(--text-muted)] text-xs mt-0.5">Coduri reducere</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            {linkMagazin && (
              <a href={linkMagazin} target="_blank" rel="sponsored noopener noreferrer"
                className="bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-black px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#ddf93c]/25 hover:-translate-y-0.5 duration-200">
                Mergi la {config.name} →
              </a>
            )}
            {/* Linkul catre pagina de magazin exista DOAR daca magazinul e in
                output.json — /cod-reducere/[magazin] se genereaza din acele date.
                Inainte se randa neconditionat si dadea 404 pe 6 pagini live
                (altex, flanco, asos, elefant, iherb, moto — branduri cu pagina
                editoriala dar fara program de afiliere inca). Fundatura pentru
                utilizator + linkuri interne moarte pentru Google. Gasit 08.08.2026.
                Cand magazinul lipseste, trimitem in categoria relevanta, unde chiar
                exista alternative reale. */}
            {magazin ? (
              <Link href={`/cod-reducere/${magazin.magazin}`}
                className="bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] border border-[var(--border-strong)] text-[var(--text-soft)] font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                Toate codurile {config.name}
              </Link>
            ) : (
              <Link href={config.categorieSlug ? `/categorii/${config.categorieSlug}` : "/toate-magazinele"}
                className="bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] border border-[var(--border-strong)] text-[var(--text-soft)] font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
                Vezi alternative cu reduceri active
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── PROMOTII ─────────────────────────────────────────────────────── */}
      {promotii.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-6">
            Oferte {config.name} Active — {new Date().toLocaleDateString("ro-RO", { month: "long", year: "numeric" })}
          </h2>
          {/* 07.10.2026: cardul unic (CuponCard), ca pe pagina de magazin. Inainte codul se vedea
              intreg fara clic pe linkul platit, iar „Copiază și mergi" nu copia nimic; linkul
              cadea pe „#" cand oferta n-avea destinatie. Vezi components/CuponInteractiv.tsx. */}
          <div className="cz-grid">
            {promotii.map((promo, i) => (
              <CuponInteractiv
                key={i}
                promo={promo}
                numeMagazin={config.name}
                magazinSlug={magazin.magazin}
                logoSrc={magazin.logo_url}
                link={linkPromotie(magazin, promo)}
                sursa="brand"
              />
            ))}
          </div>
        </section>
      )}

      {promotii.length === 0 && (
        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="font-bold text-[var(--text-soft)] mb-2">Nu exista oferte active momentan</p>
            <p className="text-[var(--text-muted)] text-sm mb-4">Revino maine — actualizam ofertele zilnic de la {config.name}.</p>
            {linkMagazin && (
              <a href={linkMagazin} target="_blank" rel="sponsored noopener noreferrer"
                className="inline-block bg-[#ddf93c] text-[#0c1000] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#ddf93c] transition-colors">
                Mergi direct la {config.name} →
              </a>
            )}
          </div>
        </section>
      )}

      {/* ─── EDITORIAL ────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <h2 className="text-xl font-black text-[var(--foreground)] mb-5">
          De ce sa cumperi de la {config.name}?
        </h2>
        <div className="space-y-4">
          {config.editorial.map((para, i) => (
            <p key={i} className="text-[var(--text-soft)] leading-relaxed text-sm">{para}</p>
          ))}
        </div>

        {config.tips.length > 0 && (
          <div className="mt-8 bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-5">
            <h3 className="font-black text-[var(--foreground)] mb-4">Sfaturi pentru cumparaturi mai ieftine la {config.name}</h3>
            <ul className="space-y-2.5">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-soft)]">
                  <span className="text-[var(--accent-text)] font-black mt-0.5 shrink-0">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      {config.faq.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Intrebari frecvente despre {config.name}</h2>
          <div className="divide-y divide-[#e2e8f0] border border-[var(--border)] rounded-xl overflow-hidden">
            {config.faq.map((item, i) => (
              <details key={i} className="group bg-[var(--surface)]">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-[var(--surface-alt)] transition-colors list-none">
                  <span className="font-semibold text-[var(--text-soft)] text-sm">{item.q}</span>
                  <span className="text-[var(--accent-text)] text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-[var(--text-soft)] leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ─── CTA NEWSLETTER ──────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-[var(--surface)] border border-[var(--border-strong)] rounded-xl p-8 text-center">
          <p className="text-2xl font-black text-[var(--foreground)] mb-2">Nu rata urmatoarea oferta {config.name}</p>
          <p className="text-[var(--text-soft)] text-sm mb-5">Aboneaza-te la newsletter si primesti codurile noi direct pe email.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/newsletter"
              className="bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-black px-7 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#ddf93c]/20">
              Aboneaza-te gratuit →
            </Link>
            <Link href="/oferte-azi"
              className="bg-[var(--surface-alt)] border border-[var(--border-strong)] hover:bg-[var(--surface-high)] text-[var(--text-soft)] font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Toate ofertele de azi
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
