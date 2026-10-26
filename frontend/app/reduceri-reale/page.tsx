import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import { numeAfisat } from "@/lib/numeMagazin";
import { imagineSigura } from "@/lib/topFeed";

/**
 * /reduceri-reale — produse al căror preț de AZI e sub minimul din ultimele 30 de zile (26.10.2026).
 *
 * DE CE: afiliatul cu cele mai multe vânzări din 2Performant e un site de istoric de prețuri (vezi
 * scripts/istoric_preturi.py). Colectăm prețurile a ~48.000 de produse din feed-urile partenerilor din
 * 07.10.2026, deci la Black Friday-ul eMAG (06.11) avem 30 de zile de istoric — exact reperul cerut de
 * lege pentru „prețul anterior" (HG 686/2022, directiva Omnibus). Prețul tăiat din feed nu-l folosim:
 * îl pune magazinul.
 *
 * Datele vin din public/scaderi-pret.json, scris de pipeline de trei ori pe zi. Pagina nu inventează
 * nimic: fără istoric de cel puțin 14 zile un produs nu apare, iar cifrele de ansamblu nu numesc
 * niciun magazin (descriem piața, nu acuzăm pe cineva).
 */

interface Produs {
  title: string;
  url: string;
  image?: string;
  merchant_slug?: string;
  pret: number;
  minim_30_zile: number;
  scadere_pct: number;
}

interface Statistici {
  produse: number;
  scumpite: number;
  ieftinite: number;
  neschimbate: number;
  mediana_scumpire_pct: number | null;
  mediana_ieftinire_pct: number | null;
  excluse: number;
  fereastra_zile: number;
  acoperire_min_zile: number;
}

interface DatePagina {
  actualizat: string;
  fereastra_zile: number;
  statistici?: Statistici;
  produse: Produs[];
}

function incarca(): DatePagina {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "scaderi-pret.json"), "utf-8"));
  } catch {
    return { actualizat: "", fereastra_zile: 30, produse: [] };
  }
}

const lei = (n: number) =>
  new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " lei";
const nr = (n: number) => new Intl.NumberFormat("ro-RO").format(n);
const pct = (n: number | null) => (n === null ? "—" : `${new Intl.NumberFormat("ro-RO").format(n)}%`);
const ziua = (iso: string) =>
  iso
    ? new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(iso + "T00:00:00Z"),
      )
    : "";

export const metadata: Metadata = {
  title: "Reduceri reale — sub prețul minim din 30 de zile",
  description:
    "Produse al căror preț de azi e sub cel mai mic preț din ultimele 30 de zile, la magazinele partenere AmCupon. Istoric propriu de prețuri, actualizat de trei ori pe zi.",
  alternates: { canonical: "https://amcupon.ro/reduceri-reale" },
  openGraph: {
    title: "Reduceri reale — sub prețul minim din ultimele 30 de zile | AmCupon.ro",
    description: "Verificăm reducerile cu istoricul nostru de prețuri, nu cu prețul tăiat de magazin.",
    url: "https://amcupon.ro/reduceri-reale",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Reduceri reale AmCupon.ro" }],
  },
};

function intrebari(s?: Statistici) {
  return [
    {
      q: "Ce înseamnă „reducere reală” pe pagina asta?",
      a: "Prețul de azi e cu cel puțin 10% sub cel mai mic preț pe care l-am văzut la același produs, în același magazin, în ultimele 30 de zile. Nu ne uităm la prețul tăiat de lângă produs: pe acela îl pune magazinul.",
    },
    {
      q: "De unde aveți prețurile?",
      a: `Din feed-urile de produse ale magazinelor partenere, citite de trei ori pe zi. Păstrăm fiecare schimbare de preț din 7 octombrie 2026. Un produs apare aici doar dacă îl urmărim de cel puțin ${s?.acoperire_min_zile ?? 14} zile.`,
    },
    {
      q: "Ce spune legea despre prețul anterior al unei reduceri?",
      a: "În România, când un magazin anunță o reducere, prețul anterior afișat trebuie să fie cel mai mic preț practicat de el în ultimele 30 de zile (HG 686/2022, care transpune directiva europeană Omnibus).",
    },
    {
      q: "Sunt aici toate reducerile de la partenerii AmCupon?",
      a: "Nu. Apar doar produsele din feed-urile pe care le citim și care îndeplinesc regula de mai sus. Ofertele și codurile magazinelor sunt pe paginile lor și pe pagina de Black Friday.",
    },
  ];
}

export default function ReduceriRealePage() {
  const d = incarca();
  const s = d.statistici;
  const produse = d.produse.slice(0, 120);
  const faq = intrebari(s);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Reduceri reale — sub prețul minim din ultimele 30 de zile",
      description: "Produse al căror preț de azi e sub minimul din ultimele 30 de zile, după istoricul de prețuri AmCupon.",
      url: "https://amcupon.ro/reduceri-reale",
      ...(d.actualizat ? { dateModified: d.actualizat } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]" data-loc="reduceri-reale">
        <nav className="max-w-6xl mx-auto px-4 pt-4 text-xs text-[var(--text-muted)] flex items-center gap-1">
          <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-[var(--text-soft)]">Reduceri reale</span>
        </nav>

        <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-text)] mb-3">
            {d.actualizat ? `Actualizat pe ${ziua(d.actualizat)}` : "Istoric propriu de prețuri"}
          </p>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">Reduceri reale</h1>
          <p className="text-[var(--text-soft)] text-base md:text-lg max-w-2xl">
            Produse al căror preț de azi e sub cel mai mic preț din ultimele {d.fereastra_zile} de zile. Verificăm cu
            istoricul nostru de prețuri, nu cu prețul tăiat de magazin.
          </p>
        </section>

        {s && s.produse > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-black mb-2">Ce s-a întâmplat cu prețurile în ultimele {s.fereastra_zile} de zile</h2>
            <p className="text-sm text-[var(--text-soft)] mb-5 max-w-3xl">
              Din {nr(s.produse)} de produse urmărite de cel puțin {s.acoperire_min_zile} zile la magazinele partenere,
              comparate cu prețul lor de acum {s.fereastra_zile} de zile:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-2xl font-black text-[var(--danger-text)]">{nr(s.scumpite)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">s-au scumpit (mediana {pct(s.mediana_scumpire_pct)})</p>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-2xl font-black text-[var(--accent-text)]">{nr(s.ieftinite)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">s-au ieftinit (mediana {pct(s.mediana_ieftinire_pct)})</p>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <p className="text-2xl font-black">{nr(s.neschimbate)}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">au același preț</p>
              </div>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-3 max-w-3xl">
              Nu numim magazine. {s.excluse > 0 ? `${nr(s.excluse)} produse cu o variație mai mare de trei ori nu sunt numărate: pe aceeași adresă apare uneori altă variantă (alt gramaj, alt set), deci nu e o schimbare de preț. ` : ""}
              Înainte de Black Friday merită să notezi prețul produsului pe care îl vrei.
            </p>
          </section>
        )}

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-baseline justify-between mb-5 gap-4">
            <h2 className="text-xl font-black">Sub minimul din ultimele {d.fereastra_zile} de zile, azi</h2>
            <span className="text-sm text-[var(--text-muted)] shrink-0">
              {produse.length === 1 ? "1 produs" : produse.length < 20 ? `${produse.length} produse` : `${produse.length} de produse`}
            </span>
          </div>
          {produse.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produse.map((p) => {
                const img = imagineSigura(p.image);
                return (
                  <a
                    key={p.url}
                    href={p.url}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="flex gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 hover:border-[var(--border-strong)] transition-colors"
                  >
                    <div className="w-20 h-20 shrink-0 rounded-lg bg-[#ffffff] overflow-hidden flex items-center justify-center">
                      {img ? (
                        <Image src={img} alt={p.title} width={80} height={80} unoptimized className="object-contain w-full h-full" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text-muted)]">{numeAfisat(p.merchant_slug || "")}</p>
                      <p className="text-sm font-semibold leading-snug line-clamp-2">{p.title}</p>
                      <p className="mt-1 text-sm">
                        <span className="font-black text-[var(--accent-text)]">{lei(p.pret)}</span>
                        <span className="text-xs text-[var(--text-muted)]"> · minim 30 zile {lei(p.minim_30_zile)} · −{p.scadere_pct}%</span>
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm border border-dashed border-[var(--border-strong)] rounded-xl">
              Azi niciun produs urmărit nu e cu cel puțin 10% sub minimul din ultimele {d.fereastra_zile} de zile. Lista se
              actualizează de trei ori pe zi; în perioadele de reduceri mari (Black Friday) se umple singură.
            </div>
          )}
          <p className="text-xs text-[var(--text-muted)] mt-4">
            Linkurile duc la magazinele partenere; AmCupon poate primi un comision, fără cost pentru tine. Prețul din magazin
            poate diferi de cel citit de noi la ultima actualizare.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/black-friday" className="text-[var(--accent-text)]">Black Friday la partenerii AmCupon →</Link>
            <Link href="/oferte-azi" className="text-[var(--accent-text)]">Toate ofertele de azi →</Link>
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--background)]">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-black mb-6">Întrebări despre reducerile reale</h2>
            <div className="space-y-6">
              {faq.map((f) => (
                <div key={f.q}>
                  <h3 className="font-bold mb-2">{f.q}</h3>
                  <p className="text-[var(--text-soft)] text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
