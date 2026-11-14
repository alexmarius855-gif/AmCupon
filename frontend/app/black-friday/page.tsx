import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import GrilaOferte from "../components/GrilaOferte";
import ZilePana from "../components/ZilePana";
import { areLinkAfiliat } from "@/lib/linkMagazin";
import { campaniiBF, categoriiBF, toateCampaniileBF } from "@/lib/campaniiBlackFriday";
import { deNumar } from "@/lib/acordNumeral";
import { poolOferte, grilaOferte, type MagazinGrila } from "@/lib/grilaOferte";
import { cuNumar } from "@/lib/oferteAcasa";
import { aziRomania, promoBF } from "@/lib/momentBF";
import StudiuReale from "./StudiuReale";

/**
 * Black Friday — doar magazinele la care clicul aduce comision.
 *
 * Rescrisă pe 24.09.2026. Versiunea veche promitea „coduri verificate la eMAG, FashionDays,
 * Altex, Dedeman": primele trei nu au program la noi (nu sunt in output.json), iar codurile nu
 * le testeaza nimeni. Mai spunea ca Black Friday e „in ultima vineri a lunii", fals pentru
 * Romania, iar lista de top era scrisa de mana. Acum totul vine din date, prin `areLinkAfiliat`
 * (aceeasi functie ca pe restul site-ului).
 *
 * 03.11.2026, remodelata: datele -> ofertele de Black Friday de azi -> calendarul (69 de carduri stateau inaintea
 * ofertelor, deci prima oferta incepea dupa ~5 ecrane pe telefon) -> studiul -> intrebari.
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
  // 01.11.2026: si campaniile anuntate de magazine in 2Performant — sursa unica in lib/campaniiBlackFriday.ts,
  // citita si de pagina fiecarui magazin.
  const azi = aziRomania();
  const parteneri = campaniiBF(azi)
    .map((p) => ({
      ...p,
      inCurs: p.start <= azi,
      interval: `${zi(p.start, { day: "numeric", month: "short" })} – ${zi(p.final, { day: "numeric", month: "short" })}`,
    }));
  const toate = toateCampaniileBF();
  const durate = toate
    .map((c) => Math.round((Date.parse(c.final) - Date.parse(c.start)) / 86400000) + 1)
    .sort((x, y) => x - y);
  return {
    an: d.an as number,
    // Numarul din titlu: toate campaniile anului, ca titlul sa nu se schimbe zilnic pe masura ce se termina.
    totalCampanii: toate.length,
    // Cifre despre calendar, calculate din date (fara nume de magazine): Black Friday nu mai e o singura zi.
    inainteDeEmag: toate.filter((c) => c.start < (d.emag as string)).length,
    primaZi: toate.length ? zi(toate.map((c) => c.start).sort()[0], { day: "numeric", month: "long" }) : "",
    medianaZile: durate.length ? durate[Math.floor(durate.length / 2)] : 0,
    celMaiLung: durate.length ? durate[durate.length - 1] : 0,
    dataEmag: d.emag as string,
    dataInt: start,
    emag: zi(d.emag, { weekday: "long", day: "numeric", month: "long" }),
    international: `${zi(start, { day: "numeric" })}–${zi(final, { day: "numeric", month: "long" })}`,
    sursa: d.sursa as string,
    parteneri,
  };
}

const BF = incarcaBF();

// „vineri, 6 noiembrie" -> „6 noiembrie", pentru descrierea scurtă din Google.
const emagScurt = BF.emag.replace(/^[^,]+,\s*/, "");

export const metadata: Metadata = {
  title: `Black Friday ${BF.an}: calendarul a ${BF.totalCampanii}${deNumar(BF.totalCampanii)} magazine`,
  description: `Când începe Black Friday ${BF.an} la ${BF.totalCampanii}${deNumar(BF.totalCampanii)} magazine din România: datele fiecărei campanii, ofertele active și câte reduceri sunt reale. eMAG pe ${emagScurt}.`,
  keywords: [
    `black friday românia ${BF.an}`,
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

function incarca(): MagazinGrila[] {
  const date = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
  return Array.isArray(date) ? date : (Object.values(date)[0] as MagazinGrila[]);
}

/** Sursa unica pentru intrebari: din ea se face si textul vizibil, si schema FAQPage. */
function intrebari(parteneri: number, cuOferta: number) {
  return [
    {
      q: `Când e Black Friday ${BF.an} în România?`,
      a: `Nu în ultima vineri din noiembrie, ca în SUA. eMAG îl ține ${BF.emag}, iar magazinele internaționale au valul lor pe ${BF.international}, până la Cyber Monday. Multe magazine pornesc reducerile cu câteva zile sau săptămâni înainte.`,
    },
    {
      q: "Ce magazine găsesc pe AmCupon de Black Friday?",
      a: `Doar magazinele partenere, acum ${parteneri}. Pe pagina asta apar cele ${cuOferta} care au o ofertă de Black Friday activă azi. eMAG, Altex și Fashion Days nu sunt parteneri AmCupon, așa că pentru ele mergi direct pe site-ul lor.`,
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

const H2 = "text-xl md:text-2xl font-black tracking-tight";

function RandCampanie({ p }: { p: (typeof BF.parteneri)[number] }) {
  return (
    <li className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3.5 py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <Link href={`/black-friday/${p.magazin}`} className="min-w-0 font-bold hover:text-[var(--accent-text)] truncate">Black Friday {p.nume}</Link>
        <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{p.interval}</span>
      </div>
      {p.nota && (
        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
          {p.nota}
          {p.sursa?.startsWith("http") && (
            <>{" · "}<a href={p.sursa} target="_blank" rel="noopener noreferrer" className="underline">sursa</a></>
          )}
        </p>
      )}
    </li>
  );
}

function ListaCampanii({ titlu, lista }: { titlu: string; lista: typeof BF.parteneri }) {
  if (lista.length === 0) return null;
  const VIZIBILE = 6;
  return (
    <div className="min-w-0">
      <h3 className="font-black mb-2">{titlu} ({lista.length})</h3>
      <ul className="space-y-2">
        {lista.slice(0, VIZIBILE).map((p) => <RandCampanie key={p.magazin} p={p} />)}
      </ul>
      {lista.length > VIZIBILE && (
        <details className="mt-2">
          <summary className="cursor-pointer text-sm font-bold text-[var(--accent-text)]">Încă {cuNumar(lista.length - VIZIBILE, "campanie", "campanii")}</summary>
          <ul className="space-y-2 mt-2">
            {lista.slice(VIZIBILE).map((p) => <RandCampanie key={p.magazin} p={p} />)}
          </ul>
        </details>
      )}
    </div>
  );
}

export default function BlackFridayPage() {
  const toate = incarca();
  const parteneri = toate.filter(areLinkAfiliat).length;
  const pool = poolOferte(toate).filter((o) => promoBF(`${o.promo.nume || ""} ${o.promo.descriere || ""}`));
  const nrMagazine = new Set(pool.map((o) => o.m.magazin)).size;
  const grila = grilaOferte(pool, { limita: 100, faraFiltre: ["oferta"] });
  const faq = intrebari(parteneri, nrMagazine);
  const inCurs = BF.parteneri.filter((p) => p.inCurs);
  const urmeaza = BF.parteneri.filter((p) => !p.inCurs);

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
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-10 space-y-10">
        <header>
          <h1 className="text-[1.75rem] md:text-4xl font-black tracking-tight leading-tight mb-2">Black Friday {BF.an} în România</h1>
          <p className="text-[var(--text-soft)] max-w-2xl">
            {cuNumar(pool.length, "ofertă de Black Friday activă", "oferte de Black Friday active")} azi, la {cuNumar(nrMagazine, "magazin partener", "magazine partenere")}. Lista se actualizează de trei ori pe zi.
          </p>
          <dl className="grid sm:grid-cols-2 gap-3 mt-4 max-w-2xl">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
              <dt className="text-xs text-[var(--text-muted)]">Black Friday la eMAG (nu e partener AmCupon)</dt>
              <dd className="font-bold mt-0.5">{BF.emag}<ZilePana data={BF.dataEmag} /></dd>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5">
              <dt className="text-xs text-[var(--text-muted)]">Magazinele internaționale</dt>
              <dd className="font-bold mt-0.5">{BF.international}<ZilePana data={BF.dataInt} /></dd>
            </div>
          </dl>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Sursa datelor:{" "}
            <a href={BF.sursa} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent-text)]">wall-street.ro</a>
          </p>
        </header>

        <section id="oferte" className="scroll-mt-20" aria-labelledby="oferte-h">
          <h2 id="oferte-h" className={`${H2} mb-3`}>Ofertele de Black Friday de azi</h2>
          {pool.length > 0 ? (
            <GrilaOferte {...grila} sursa="black_friday" pas={12} />
          ) : (
            <p className="text-center py-10 text-[var(--text-muted)] text-sm border border-dashed border-[var(--border-strong)] rounded-xl">
              Niciun magazin partener nu are o ofertă de Black Friday activă chiar acum.
            </p>
          )}
          <Link href="/oferte-azi" className="mt-3 block text-center text-sm font-bold text-[var(--accent-text)] hover:underline">Toate ofertele de azi →</Link>
        </section>

        {BF.parteneri.length > 0 && (
          <section aria-labelledby="cal-h">
            <h2 id="cal-h" className={`${H2} mb-1`}>Calendarul partenerilor</h2>
            <p className="text-sm text-[var(--text-muted)] mb-4 max-w-2xl">
              Datele sunt cele anunțate de magazine în rețeaua de afiliere 2Performant sau publicate de presă; reducerile le stabilește fiecare magazin.
            </p>
            {BF.totalCampanii > 0 && (
              <p className="text-sm text-[var(--text-soft)] mb-3 max-w-2xl">
                Black Friday nu mai e o singură zi: {BF.inainteDeEmag} din {cuNumar(BF.totalCampanii, "campanie", "campanii")} încep înainte de {emagScurt}, prima
                pe {BF.primaZi}. O campanie ține {cuNumar(BF.medianaZile, "zi", "zile")} în mod obișnuit (valoarea mediană), iar cea mai lungă, {cuNumar(BF.celMaiLung, "zi", "zile")}.
              </p>
            )}
            <nav aria-label="Campanii pe categorii" className="flex flex-wrap gap-2 mb-4">
              {categoriiBF().map((k) => (
                <Link key={k.slug} href={`/black-friday/categorie/${k.slug}`}
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--border-strong)]">
                  {k.nume} ({k.campanii})
                </Link>
              ))}
            </nav>
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <ListaCampanii titlu="Urmează" lista={urmeaza} />
              <ListaCampanii titlu="În desfășurare" lista={inCurs} />
            </div>
          </section>
        )}

        <div>
          <StudiuReale />
          <Link
            href="/reduceri-reale"
            className="mt-4 flex items-center justify-between gap-3 max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--border-strong)] transition-colors"
          >
            <span>
              <span className="block font-bold">E reală reducerea?</span>
              <span className="block text-xs text-[var(--text-muted)] mt-0.5">
                Produsele partenerilor sub prețul minim din ultimele 30 de zile, după istoricul nostru de prețuri.
              </span>
            </span>
            <span className="text-sm font-semibold text-[var(--accent-text)] shrink-0">Reduceri reale →</span>
          </Link>
        </div>

        <section className="max-w-3xl" aria-labelledby="faq-h">
          <h2 id="faq-h" className={`${H2} mb-4`}>Întrebări despre Black Friday {BF.an}</h2>
          <div className="space-y-5">
            {faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-bold mb-1">{f.q}</h3>
                <p className="text-[var(--text-soft)] text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
