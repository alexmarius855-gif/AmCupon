import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard, { CardMagazin } from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import { areLinkAfiliat } from "@/lib/linkMagazin";

/**
 * Black Friday — doar magazinele la care clicul aduce comision.
 *
 * Rescrisă pe 24.09.2026. Versiunea veche promitea „coduri verificate la eMAG, FashionDays,
 * Altex, Dedeman": primele trei nu au program la noi (nu sunt in output.json), iar codurile nu
 * le testeaza nimeni. Mai spunea ca Black Friday e „in ultima vineri a lunii", fals pentru
 * Romania, iar lista de top era scrisa de mana. Acum totul vine din date, prin `areLinkAfiliat`
 * (aceeasi functie ca pe restul site-ului).
 *
 * Datele se schimba in fiecare an, intr-un singur loc: `public/black-friday.json`, pe care il
 * citeste si newsletterul (scripts/send_newsletter.py).
 */
function incarcaBF() {
  const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "black-friday.json"), "utf-8"));
  const zi = (iso: string, o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("ro-RO", { ...o, timeZone: "UTC" }).format(new Date(iso + "T00:00:00Z"));
  const [start, final] = d.international as [string, string];
  // 26.10.2026: campaniile CONFIRMATE ale partenerilor (doar cu sursa). Pagina se regenereaza la fiecare deploy
  // (de trei ori pe zi), deci o campanie terminata dispare singura de pe pagina.
  const azi = new Date().toISOString().slice(0, 10);
  const parteneri = ((d.parteneri || []) as { magazin: string; nume: string; start: string; final: string; nota?: string; sursa: string }[])
    .filter((p) => p.final >= azi)
    .map((p) => ({
      ...p,
      interval: `${zi(p.start, { day: "numeric", month: "long" })} – ${zi(p.final, { day: "numeric", month: "long" })}`,
    }));
  return {
    an: d.an as number,
    emag: zi(d.emag, { weekday: "long", day: "numeric", month: "long" }),
    international: `${zi(start, { day: "numeric" })}–${zi(final, { day: "numeric", month: "long" })}`,
    sursa: d.sursa as string,
    parteneri,
  };
}

const BF = incarcaBF();

const MAX_CARDURI = 48;

// „vineri, 6 noiembrie" -> „6 noiembrie", pentru descrierea scurtă din Google.
const emagScurt = BF.emag.replace(/^[^,]+,\s*/, "");

export const metadata: Metadata = {
  title: `Black Friday ${BF.an} România — Coduri Reducere & Oferte`,
  description: `Black Friday ${BF.an}: eMAG pe ${emagScurt}, magazinele internaționale pe ${BF.international}. Ofertele și codurile active acum la partenerii AmCupon, actualizate zilnic.`,
  keywords: [
    `black friday romania ${BF.an}`,
    `black friday ${BF.an} data`,
    "oferte black friday",
    "coduri reducere black friday",
    "voucher black friday",
  ],
  alternates: { canonical: "https://amcupon.ro/black-friday" },
  openGraph: {
    title: `Black Friday ${BF.an} România — Oferte & Coduri Reducere | AmCupon.ro`,
    description: `Datele Black Friday ${BF.an} și ofertele active acum la magazinele partenere AmCupon.`,
    url: "https://amcupon.ro/black-friday",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Black Friday AmCupon.ro" }],
  },
};

interface Magazin extends CardMagazin {
  scor_final?: number;
}

function incarca(): Magazin[] {
  const date = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
  return Array.isArray(date) ? date : (Object.values(date)[0] as Magazin[]);
}

const esteRomanesc = (m: Magazin) => /\.ro$/i.test(m.magazin);
/**
 * 14.10.2026: la Black Friday 2025, pe 2Performant s-au vandut cel mai mult carti, fashion si farmacie (BusinessLeague,
 * citat de Capital). Partenerii din aceste categorii trec primii, dupa regula magazinelor .ro.
 */
const CATEGORII_BF = new Set(["carti-educatie", "fashion", "sanatate"]);
const categorieBF = (m: Magazin) => CATEGORII_BF.has(String((m as { categorie_slug?: string }).categorie_slug || ""));

/** Sursa unica pentru intrebari: din ea se face si textul vizibil, si schema FAQPage. */
function intrebari(parteneri: number, cuOferta: number) {
  return [
    {
      q: `Când e Black Friday ${BF.an} în România?`,
      a: `Nu în ultima vineri din noiembrie, ca în SUA. eMAG îl ține ${BF.emag}, iar magazinele internaționale au valul lor pe ${BF.international}, până la Cyber Monday. Multe magazine pornesc reducerile cu câteva zile sau săptămâni înainte.`,
    },
    {
      q: "Ce magazine găsesc pe AmCupon de Black Friday?",
      a: `Doar magazinele partenere, acum ${parteneri}. Pe pagina asta apar cele ${cuOferta} care au o ofertă activă azi. eMAG, Altex și Fashion Days nu sunt parteneri AmCupon, așa că pentru ele mergi direct pe site-ul lor.`,
    },
    {
      q: "Codurile sunt testate?",
      a: "Nu le testăm în coș. Le preluăm de la rețelele de afiliere, le afișăm cât timp sunt valabile după data lor și le scoatem când expiră. Lista se actualizează de trei ori pe zi.",
    },
    {
      q: "Cum afli dacă o reducere de Black Friday e reală?",
      a: "În România, prețul tăiat de lângă o reducere trebuie să fie cel mai mic preț practicat de magazin în ultimele 30 de zile (HG 686/2022). Notează prețul cu câteva săptămâni înainte, compară-l cu cel din ziua reducerii și citește condițiile codului: valoarea minimă a comenzii și categoriile excluse. Pe pagina Reduceri reale arătăm produsele partenerilor care sunt azi sub prețul minim din ultimele 30 de zile, după istoricul nostru de prețuri.",
    },
  ];
}

export default function BlackFridayPage() {
  const toate = incarca();
  const parteneri = toate.filter(areLinkAfiliat).length;
  const cuOferta = toate
    .filter((m) => areLinkAfiliat(m) && m.are_promotie && (m.promotii?.length ?? 0) > 0)
    .sort(
      (a, b) =>
        Number(esteRomanesc(b)) - Number(esteRomanesc(a)) ||
        Number(categorieBF(b)) - Number(categorieBF(a)) ||
        (b.scor_final ?? 0) - (a.scor_final ?? 0),
    );
  const afisate = cuOferta.slice(0, MAX_CARDURI);
  const oferte = cuOferta.reduce((n, m) => n + m.promotii.length, 0);
  const coduri = cuOferta.reduce((n, m) => n + m.promotii.filter((p) => p.cod_cupon).length, 0);
  const faq = intrebari(parteneri, cuOferta.length);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `Black Friday ${BF.an} România — oferte active`,
      description: "Ofertele active la magazinele partenere AmCupon, actualizate de trei ori pe zi.",
      url: "https://amcupon.ro/black-friday",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <nav className="max-w-6xl mx-auto px-4 pt-4 text-xs text-[var(--text-muted)] flex items-center gap-1">
          <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-[var(--text-soft)]">Black Friday {BF.an}</span>
        </nav>

        <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent-text)] mb-3">
            Actualizat de trei ori pe zi
          </p>
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">
            Black Friday {BF.an} în România
          </h1>
          <p className="text-[var(--text-soft)] text-base md:text-lg max-w-2xl">
            Ofertele active acum la magazinele partenere AmCupon. Pe fiecare magazin vezi codul,
            dacă există, și până când e valabilă oferta.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mt-8 max-w-2xl">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)]">Black Friday la eMAG</p>
              <p className="font-bold text-lg mt-0.5">{BF.emag}</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <p className="text-xs text-[var(--text-muted)]">Magazinele internaționale</p>
              <p className="font-bold text-lg mt-0.5">{BF.international}</p>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Sursa datelor:{" "}
            <a href={BF.sursa} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent-text)]">
              wall-street.ro
            </a>
          </p>

          {BF.parteneri.length > 0 && (
            <div className="mt-8 max-w-2xl">
              <h2 className="text-lg font-black mb-3">Black Friday la partenerii AmCupon</h2>
              <div className="space-y-3">
                {BF.parteneri.map((p) => (
                  <div key={p.magazin} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">{p.nume}: {p.interval}</p>
                      {p.nota && <p className="text-xs text-[var(--text-muted)] mt-0.5">{p.nota} ·{" "}
                        <a href={p.sursa} target="_blank" rel="noopener noreferrer" className="underline">sursa</a></p>}
                    </div>
                    <Link href={`/cod-reducere/${p.magazin}`} className="text-sm font-semibold text-[var(--accent-text)] shrink-0">
                      Ofertele {p.nume} →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/reduceri-reale"
            className="mt-6 flex items-center justify-between gap-3 max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--border-strong)] transition-colors"
          >
            <span>
              <span className="block font-bold">E reală reducerea?</span>
              <span className="block text-xs text-[var(--text-muted)] mt-0.5">
                Produsele partenerilor sub prețul minim din ultimele 30 de zile, după istoricul nostru de prețuri.
              </span>
            </span>
            <span className="text-sm font-semibold text-[var(--accent-text)] shrink-0">Reduceri reale →</span>
          </Link>

          <div className="grid grid-cols-3 gap-3 mt-8 max-w-md">
            {[
              { val: cuOferta.length, eticheta: "magazine cu ofertă acum" },
              { val: oferte, eticheta: "oferte active" },
              { val: coduri, eticheta: "coduri de reducere" },
            ].map((s) => (
              <div key={s.eticheta} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl py-3 px-3">
                <p className="text-2xl font-black text-[var(--accent-text)]">{s.val}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{s.eticheta}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-baseline justify-between mb-5 gap-4">
            <h2 className="text-xl font-black">Ofertele active acum</h2>
            <span className="text-sm text-[var(--text-muted)] shrink-0">
              {afisate.length} din {cuOferta.length}
            </span>
          </div>
          {afisate.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {afisate.map((m) => (
                <MagazinCard key={m.magazin} m={m} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[var(--text-muted)] text-sm border border-dashed border-[var(--border-strong)] rounded-xl">
              Niciun magazin partener nu are o ofertă activă chiar acum. Lista se actualizează de trei ori pe zi.
            </div>
          )}
          {cuOferta.length > afisate.length && (
            <div className="mt-6 text-center">
              <Link href="/oferte-azi" className="text-sm font-semibold text-[var(--accent-text)] hover:text-[var(--accent-text)]">
                Toate ofertele de azi →
              </Link>
            </div>
          )}
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-12">
          <NewsletterCTA titlu="Ofertele active, pe email" />
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--background)]">
          <div className="max-w-3xl mx-auto px-4 py-12">
            <h2 className="text-2xl font-black mb-6">Întrebări despre Black Friday {BF.an}</h2>
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
