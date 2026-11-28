import type { Metadata } from "next";
import Link from "next/link";
import Termometru, { SeriePret } from "../_ui/Termometru";
import { citesteJSON } from "../_date";
import { numeAfisat } from "@/lib/numeMagazin";
import { imagineSigura, titluAfisat } from "@/lib/topFeed";
import { cuNumar } from "@/lib/acordNumeral";
import { lei, procent, ziLunga } from "@/lib/formatRo";
import { termometru, type Termometru as DateTermo } from "@/lib/termometru";

/**
 * /reduceri-reale — pagina-vedeta a termometrului (noul site, 25.11.2026). Produsele al caror pret de AZI e cu cel
 * putin 10% sub minimul din ultimele 30 de zile, din istoricul nostru (scripts/istoric_preturi.py), nu din pretul
 * taiat de magazin. Nou fata de vechea pagina: fara variante neclare (o mostra de 15 ml langa pretul flaconului mare,
 * un sac de 7 kg langa cel de 12 kg — 24.11), fara aceeasi oferta repetata de pe trei adrese, si cu bara de pret.
 * Cifrele de ansamblu nu numesc niciun magazin. Titlul, descrierea, canonical-ul si JSON-LD-ul raman cele vechi.
 */
interface Produs { title: string; url: string; image?: string; merchant_slug?: string; pret: number; minim_30_zile: number; scadere_pct: number }
interface Statistici {
  produse: number; scumpite: number; ieftinite: number; neschimbate: number;
  mediana_scumpire_pct: number | null; mediana_ieftinire_pct: number | null; excluse: number;
  fereastra_zile: number; acoperire_min_zile: number;
}
interface DatePagina { actualizat: string; fereastra_zile: number; statistici?: Statistici; produse: Produs[] }

export const metadata: Metadata = {
  title: "Reduceri reale — sub prețul minim din 30 de zile",
  description: "Produse al căror preț de azi e sub cel mai mic preț din ultimele 30 de zile, la magazinele partenere AmCupon.",
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

const nr = (n: number) => n.toLocaleString("ro-RO");
const pct = (n: number | null) => (n === null ? "—" : `${n.toLocaleString("ro-RO")}%`);

export default function ReduceriRealePage() {
  const d = citesteJSON<DatePagina>("scaderi-pret.json", { actualizat: "", fereastra_zile: 30, produse: [] });
  const s = d.statistici;
  const faq = intrebari(s);

  // Fara dubluri (aceeasi oferta de pe mai multe adrese) si fara variante neclare.
  const vazute = new Set<string>();
  const curate: { p: Produs; t: DateTermo | null }[] = [];
  let neclare = 0;
  for (const p of [...d.produse].sort((a, b) => b.scadere_pct - a.scadere_pct)) {
    const k = `${p.merchant_slug}|${titluAfisat(p.title).toLowerCase()}`;
    if (vazute.has(k)) continue;
    vazute.add(k);
    const t = termometru(p.url, p.pret);
    if (t?.verdict === "tace") { neclare++; continue; }
    // Fara termometru (fisierul n-a putut fi scris la rularea asta): produsul ramane, fara bara.
    curate.push({ p, t });
  }
  const lista = curate.slice(0, 120);

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
    <div className="cadru" data-loc="reduceri-reale">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="firimituri">
        <Link href="/">Acasă</Link><span aria-hidden="true">/</span><span>Reduceri reale</span>
      </nav>

      <header className="sectiune-mica" style={{ maxWidth: 820 }}>
        <p className="eticheta">{d.actualizat ? `Actualizat pe ${ziLunga(d.actualizat)}` : "Istoric propriu de prețuri"}</p>
        <h1 className="h1" style={{ marginTop: 10 }}>Reduceri reale</h1>
        <p className="lead" style={{ marginTop: 14 }}>
          Produse al căror preț de azi e sub cel mai mic preț din ultimele {d.fereastra_zile} de zile. Verificăm cu istoricul
          nostru de prețuri, nu cu prețul tăiat de magazin.
        </p>
      </header>

      {s && s.produse > 0 && (
        <section className="sectiune-mica" aria-labelledby="stat-h">
          <h2 id="stat-h" className="h3" style={{ marginBottom: 6 }}>Ce s-a întâmplat cu prețurile în ultimele {s.fereastra_zile} de zile</h2>
          <p className="nota" style={{ marginBottom: 14 }}>
            Din {cuNumar(s.produse, "produs urmărit", "produse urmărite")} de cel puțin {cuNumar(s.acoperire_min_zile, "zi", "zile")} la magazinele partenere, comparate cu prețul lor de acum {s.fereastra_zile} de zile:
          </p>
          <div className="statistici">
            <div className="stat"><b className="rau">{nr(s.scumpite)}</b><span>s-au scumpit (mediana {pct(s.mediana_scumpire_pct)})</span></div>
            <div className="stat"><b className="bun">{nr(s.ieftinite)}</b><span>s-au ieftinit (mediana {pct(s.mediana_ieftinire_pct)})</span></div>
            <div className="stat"><b>{nr(s.neschimbate)}</b><span>au același preț</span></div>
          </div>
          <p className="nota" style={{ marginTop: 12 }}>
            Nu numim magazine. {s.excluse > 0 ? `${cuNumar(s.excluse, "produs", "produse")} cu o variație mai mare de trei ori nu sunt numărate: pe aceeași adresă apare uneori altă variantă (alt gramaj, alt set), deci nu e o schimbare de preț.` : ""}
          </p>
        </section>
      )}

      <section className="sectiune-mica" aria-labelledby="lista-h">
        <div className="cap-sectiune">
          <h2 id="lista-h" className="h2">Sub minimul din ultimele {d.fereastra_zile} de zile, azi</h2>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: ".85rem", whiteSpace: "nowrap" }}>{cuNumar(lista.length, "produs", "produse")}</span>
        </div>
        {lista.length > 0 ? (
          <div className="grila-cupoane">
            {lista.map(({ p, t }) => {
              const img = imagineSigura(p.image);
              const magazin = numeAfisat(p.merchant_slug || "");
              return (
                <article key={p.url} className="bon-mic cupon" data-loc="reale">
                  <div className="hartie pe-hartie">
                    <div className="bon-mic-cap">
                      <span className="scadere-img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {img ? <img src={img} alt="" loading="lazy" decoding="async" /> : null}
                      </span>
                      <div>
                        <h3 className="bon-mic-titlu">{titluAfisat(p.title)}</h3>
                        <p className="bon-mic-mag">la {magazin}</p>
                      </div>
                    </div>
                    <hr className="bon-taiere" />
                    <p className="bon-rand"><span>Preț azi</span><i /><b>{lei(p.pret)}</b></p>
                    <p className="bon-rand"><span>Minim 30 de zile</span><i /><b>{lei(t?.min ?? p.minim_30_zile)}</b></p>
                    {t && <SeriePret t={t} azi={d.actualizat} />}
                    {t && <Termometru t={t} peHartie />}
                    <div style={{ marginTop: 14 }}>
                      <a className="cupon-go" href={p.url} target="_blank" rel="sponsored nofollow noopener noreferrer">
                        Vezi produsul la {magazin} →
                      </a>
                    </div>
                  </div>
                  {(t ? t.verdict === "reala" : p.scadere_pct >= 10) && <span className="stampila stampila-copiat" aria-hidden="true">{t ? procent(t.sub) : `−${p.scadere_pct}%`}</span>}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="gol">
            Azi niciun produs urmărit nu e cu cel puțin 10% sub minimul lui din ultimele {d.fereastra_zile} de zile. Lista se
            actualizează de trei ori pe zi. După Black Friday e normal să fie scurtă: prețurile reduse din ultimele săptămâni
            sunt acum chiar minimul din 30 de zile.
          </p>
        )}
        <p className="nota" style={{ marginTop: 14 }}>
          {neclare > 0 && `${cuNumar(neclare, "produs scos", "produse scoase")} azi: pe aceeași adresă par să fie variante diferite (mărime, gramaj, set), deci nu spunem dacă e o reducere. `}
          Linkurile duc la magazinele partenere; AmCupon poate primi un comision, fără cost pentru tine. Prețul din magazin poate
          diferi de cel citit de noi la ultima actualizare.
        </p>
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 18 }}>
          <Link href="/black-friday" className="legatura">Black Friday la partenerii AmCupon →</Link>
          <Link href="/oferte-azi" className="legatura">Toate ofertele de azi →</Link>
          <Link href="/alege" className="legatura">Produse cu prețul confirmat la magazin →</Link>
        </div>
      </section>

      <section className="sectiune faq" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2" style={{ marginBottom: 8 }}>Întrebări despre reducerile reale</h2>
        <dl className="faq-simplu">
          {faq.map((f) => <div key={f.q}><dt>{f.q}</dt><dd>{f.a}</dd></div>)}
        </dl>
      </section>
    </div>
  );
}
