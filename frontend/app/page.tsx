import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import GrilaOferte from "./components/GrilaOferte";
import ButonCautare from "./components/ButonCautare";
import ZilePana from "./components/ZilePana";
import CategoryIcon from "./components/CategoryIcon";
import LogoMagazin from "./components/LogoMagazin";
import { CardProdus } from "./components/OferteParteneri";
import { pesteMagazine, PesteMagazine, laParteneri } from "@/lib/cifreSite";
import { numeAfisat } from "@/lib/numeMagazin";
import { CATEGORII_SITE } from "@/lib/site";
import { MAGAZINE_POPULARE } from "@/lib/magazinePopulare";
import { oferteDePeMagazin, magazinePopulareAcasa, cuNumar } from "@/lib/oferteAcasa";
import { poolOferte, grilaOferte, type MagazinGrila } from "@/lib/grilaOferte";
import { campaniiBF } from "@/lib/campaniiBlackFriday";
import { aziRomania, calendarScurt, fazaBF, type DateBF } from "@/lib/momentBF";
import { sectiunePentru } from "@/lib/oferteTema";
import { criterii as toateCriteriile } from "@/lib/criterii";
import { topuri as toateTopurile } from "@/lib/legaturiInterne";

/**
 * Prima pagina, rearanjata pe 03.11.2026 („pe criterii corecte, vizibilitate, hook"), din masuratori:
 *  - 9.931 px pe desktop, cu 4 sectiuni de magazine (populare, perete de logo-uri, „Magazine cu oferte",
 *    ghiduri de brand) si 2 de oferte; primul card de oferta incepea la ~870 px;
 *  - clicurile reale (19.10-03.11, tabelul clicuri_afiliate): 11, din care 1 de pe prima pagina; cele 5 de
 *    pe mobil vin toate din carduri „produs + pret + link" pe /top/* si pe ghiduri.
 *
 * Ordinea: carligul adevarat (Black Friday, cu datele din black-friday.json) -> ofertele de azi, partenerii
 * .ro cu link platit intai -> calendarul campaniilor -> formatul care a adus clicuri -> categorii -> magazine
 * -> ghiduri -> intrebari. Pagina e randata pe server; in browser ajunge doar grila de oferte
 * (OferteAcasaClient). Cautarea e SearchModal, ca pe restul site-ului.
 */
export const metadata: Metadata = {
  title: "AmCupon.ro — Coduri de reducere și oferte actualizate zilnic",
  description:
    `${PesteMagazine()} partenere cu coduri de reducere și oferte actualizate zilnic: ${laParteneri(["fashion", "beauty", "sanatate", "electronice"], 4).replace(/^la /, "")} și multe altele.`,
  alternates: { canonical: "https://amcupon.ro" },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere și oferte actualizate zilnic",
    description:
      `${PesteMagazine()} partenere cu coduri și oferte actualizate zilnic.`,
    url: "https://amcupon.ro",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

function readJSON<T>(rel: string, fallback: T): T {
  try {
    const p = path.join(process.cwd(), "public", rel);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

interface Magazin extends MagazinGrila {
  categorie_slug?: string;
}

// Formatul care a adus clicuri: produse reale din feed, cu pret si link platit. Temele sunt cele pe care s-a dat
// clic (/top/parfumuri-barbati 2, /blog/cea-mai-buna-friteuza-aer-2026 2, /top/aspiratoare-fara-fir 1).
const TEME_ACASA = [
  { tema: "parfumuri-barbati", titlu: "Parfumuri pentru bărbați", href: "/top/parfumuri-barbati" },
  { tema: "aspiratoare-fara-fir", titlu: "Aspiratoare fără fir", href: "/top/aspiratoare-fara-fir" },
  { tema: "friteuze", titlu: "Friteuze cu aer", href: "/blog/cea-mai-buna-friteuza-aer-2026" },
  // Rezerva: o tema iese singura cand feed-ul are prea putine produse (azi, aspiratoarele fara fir: 5).
  { tema: "parfumuri-femei", titlu: "Parfumuri pentru femei", href: "/top/parfumuri-femei" },
];

function intrebariAcasa(peste: string): { q: string; a: string }[] {
  return [
    {
      q: "Cum folosesc un cod de reducere de pe AmCupon.ro?",
      a: "Alegi magazinul dorit, apeși pe cod ca să îl copiezi, apoi mergi la magazin prin butonul nostru. La finalizarea comenzii (checkout) lipești codul în câmpul \"Cod reducere\" sau \"Voucher\" și reducerea se aplică automat.",
    },
    {
      q: "Codurile de reducere sunt gratuite?",
      a: "Da, 100% gratuit. Nu plătești nimic și nu ai nevoie de cont. AmCupon.ro este gratuit pentru toți utilizatorii, fără costuri ascunse.",
    },
    {
      q: "Cât de des se actualizează ofertele și codurile?",
      a: `Ofertele se actualizează automat de trei ori pe zi, de la ${peste} partenere. Cele expirate dispar după data lor, iar cele noi apar la următoarea actualizare. Codurile nu le testăm în coș.`,
    },
    {
      q: "De ce unele coduri nu mai funcționează?",
      a: "Magazinele pot opri o promoție înainte de data anunțată sau pot limita stocul. Dacă un cod nu mai merge, încearcă alt cod activ din aceeași pagină de magazin sau verifică ofertele fără cod, care se aplică automat.",
    },
    {
      q: "Trebuie să îmi fac cont ca să folosesc codurile?",
      a: "Nu. Toate codurile și ofertele sunt disponibile fără cont și fără înregistrare. Opțional, te poți abona la newsletter pentru a primi ofertele active, o dată pe zi, pe email.",
    },
    {
      q: "Cum câștigă bani AmCupon.ro?",
      a: "Primim un comision de la magazine atunci când cumperi prin link-urile noastre, din bugetul lor de marketing. Pentru tine prețul rămâne același, fără costuri suplimentare. Așa putem menține serviciul gratuit.",
    },
  ];
}

const dataRo = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("ro-RO", { ...o, timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/** Ce vede omul in primul ecran, dupa faza Black Friday. Fiecare fraza vine din date. */
function carlig(azi: string, d: DateBF, inCurs: number, nrOferte: number, nrMagazine: number) {
  const faza = fazaBF(azi, d);
  const magazineBF = cuNumar(inCurs, "magazin partener are", "magazine partenere au");
  const emag = dataRo(d.emag, { weekday: "long", day: "numeric", month: "long" });
  const intl = `${dataRo(d.international[0], { day: "numeric" })}–${dataRo(d.international[1], { day: "numeric", month: "long" })}`;
  if (faza === "inainte-emag") {
    return { faza, h1: "Coduri de reducere și oferte de Black Friday", lead: `Black Friday la eMAG e ${emag}. Până atunci, ${magazineBF} deja reduceri de Black Friday.`, emag, intl };
  }
  if (faza === "intre-valuri" || faza === "international") {
    const val = faza === "international" ? `Valul internațional e acum, ${intl}.` : `Urmează valul internațional, ${intl}.`;
    return { faza, h1: "Coduri de reducere și oferte de Black Friday", lead: `${inCurs > 0 ? `Acum, ${magazineBF} campanii de Black Friday. ` : ""}${val}`, emag, intl };
  }
  return {
    faza, emag, intl,
    h1: "Coduri de reducere și oferte active azi",
    lead: `${cuNumar(nrOferte, "ofertă activă", "oferte active")} la ${cuNumar(nrMagazine, "magazin", "magazine")}, actualizate de trei ori pe zi.`,
  };
}

const H2 = "am-h2 text-2xl md:text-3xl font-black tracking-tight text-[var(--foreground)]";
const LINK = "text-sm font-bold text-[var(--accent-text)] hover:underline whitespace-nowrap";

export default function Page() {
  const magazine = readJSON<Magazin[]>("output.json", []);
  const azi = aziRomania();

  // ── Ofertele: in HTML ajung doar cele afisate, o oferta pe magazin la „Toate" ──
  const pool = poolOferte(magazine);
  const grila = grilaOferte(pool);
  const numere = grila.numere;
  const peMagazin = oferteDePeMagazin(pool);

  // ── Carligul si calendarul ──
  const bf = readJSON<DateBF>("black-friday.json", { an: 0, emag: "", international: ["", ""] });
  const campanii = campaniiBF(azi);
  const { inCurs, urmeaza, urmatoare } = calendarScurt(azi, campanii);
  const c = carlig(azi, bf, inCurs, pool.length, peMagazin.size);
  const inDate = new Set(magazine.map((m) => m.magazin));

  // ── Formatul care a adus clicuri ──
  const teme = TEME_ACASA.map((t) => {
    const s = sectiunePentru(t.tema);
    const produse = s ? s.game.flatMap((g) => g.produse.slice(0, 1)).slice(0, 2) : [];
    return { ...t, produse };
  }).filter((t) => t.produse.length === 2).slice(0, 3);

  // ── Categorii si magazine ──
  const promoPeCategorie = new Map<string, number>();
  const cuMagazine = new Set<string>();
  for (const m of magazine) {
    if (!m.categorie_slug) continue;
    cuMagazine.add(m.categorie_slug);
    if (m.promotii?.length) promoPeCategorie.set(m.categorie_slug, (promoPeCategorie.get(m.categorie_slug) || 0) + 1);
  }
  // Generale la coada: „Marketplace" si „Servicii" nu spun ce cauta cineva. Primele 16, dupa ofertele de azi.
  const categorii = CATEGORII_SITE
    .filter((c) => cuMagazine.has(c.slug) && c.slug !== "marketplace" && c.slug !== "servicii")
    .sort((a, b) => (promoPeCategorie.get(b.slug) || 0) - (promoPeCategorie.get(a.slug) || 0));
  const populare = magazinePopulareAcasa(magazine, MAGAZINE_POPULARE.map((x) => x.slug), new Set(peMagazin.keys()));
  const hrefPopular = new Map(MAGAZINE_POPULARE.filter((x) => x.href).map((x) => [x.slug, x.href as string]));
  const numePopular = new Map(MAGAZINE_POPULARE.map((x) => [x.slug, x.label]));

  // Ghidurile rescrise pe surse: lista lor da Google un drum direct spre ele (Search Console, 08.10.2026).
  const ghiduri = (readJSON<{ slug: string; title: string; surse_din?: string }[]>("blog-posts.json", []) || [])
    .filter((p) => p.surse_din)
    .sort((a, b) => a.title.localeCompare(b.title, "ro"));
  const intrebari = intrebariAcasa(pesteMagazine());
  // 14.11.2026: /alege aduce 77 din 86 de clicuri reale pe 7 zile; topurile n-aveau alt link din site (04.11).
  const alege = toateCriteriile().map((c) => ({ slug: c.slug, titlu: c.titlu })).sort((x, y) => x.titlu.localeCompare(y.titlu, "ro"));
  const listaTopuri = toateTopurile();

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: intrebari.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
        }).replace(/</g, "\\u003c") }}
      />

      {/* Carlig + oferte + calendar. O singura lista in DOM: pe telefon ofertele vin imediat dupa carlig, iar
          calendarul dupa ele; pe desktop calendarul sta langa carlig, in primul ecran. */}
      <div className="max-w-7xl mx-auto px-4 pt-6 md:pt-10 grid gap-x-10 gap-y-7 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="am-aurora order-1 lg:col-start-1 lg:row-start-1">
          {c.faza !== "inchis" && (
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent-text)] mb-2">Black Friday {bf.an}</p>
          )}
          <h1 className="text-[1.75rem] md:text-5xl font-black tracking-tight leading-[1.1] mb-3 max-w-3xl">{c.h1}</h1>
          <p className="text-[var(--text-soft)] md:text-lg leading-relaxed max-w-2xl mb-5">{c.lead}</p>
          <ButonCautare text="Caută un magazin: Notino, Answear, Noriel..." className="max-w-xl mb-3" />
          <div className="flex flex-wrap gap-2.5">
            {/* Pe telefon ofertele incep imediat dedesubt: butonul ar arata spre ce se vede deja. */}
            <a href="#promotii" className="hidden lg:block bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] font-black px-5 py-3 rounded-xl text-sm transition-colors">
              Ofertele de azi
            </a>
            <Link href={c.faza !== "inchis" ? "/black-friday" : "/top-reduceri"} className="border border-[var(--border-strong)] hover:border-[var(--accent-text)]/60 text-[var(--foreground)] font-bold px-5 py-3 rounded-xl text-sm transition-colors">
              {c.faza !== "inchis" ? "Calendar Black Friday" : "Top reduceri"}
            </Link>
          </div>
        </section>

        {c.faza !== "inchis" && (
          <aside className="order-3 lg:order-none lg:col-start-2 lg:row-start-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4" aria-labelledby="cal-h">
            <h2 id="cal-h" className="font-black text-lg mb-3">Când sunt reducerile</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">eMAG</dt>
                <dd className="font-bold text-right">{c.emag}<ZilePana data={bf.emag} /></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">Internațional</dt>
                <dd className="font-bold text-right">{c.intl}<ZilePana data={bf.international[0]} /></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--text-muted)]">La parteneri, acum</dt>
                <dd className="font-bold text-right">{cuNumar(inCurs, "campanie", "campanii")}</dd>
              </div>
            </dl>
            {urmatoare.length > 0 && (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mt-4 mb-1.5">Urmează ({urmeaza})</p>
                <ul className="space-y-1.5 text-sm">
                  {urmatoare.map((u) => (
                    <li key={u.magazin} className="flex justify-between gap-3">
                      {inDate.has(u.magazin)
                        ? <Link href={`/cod-reducere/${u.magazin}`} className="font-semibold hover:text-[var(--accent-text)] truncate">{u.nume}</Link>
                        : <span className="font-semibold truncate">{u.nume}</span>}
                      <span className="text-[var(--text-muted)] whitespace-nowrap">{dataRo(u.start, { day: "numeric", month: "short" })}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
              eMAG nu e partener AmCupon; aici sunt ofertele magazinelor partenere.{" "}
              <Link href="/black-friday" className="font-bold text-[var(--accent-text)] hover:underline">Tot calendarul →</Link>
            </p>
          </aside>
        )}

        <section id="promotii" className={`order-2 lg:order-none scroll-mt-20 ${c.faza !== "inchis" ? "lg:col-span-2 lg:row-start-2" : "lg:col-span-2"}`} aria-labelledby="oferte-h">
          <div className="flex items-end justify-between gap-4 mb-3">
            <div>
              <h2 id="oferte-h" className={H2}>Ofertele de azi</h2>
              <p className="text-sm text-[var(--text-soft)] mt-1">
                {cuNumar(numere.toate, "ofertă activă", "oferte active")}, din care {cuNumar(numere.cod, "cod", "coduri")}. Magazinele din România sunt primele.
              </p>
            </div>
            <Link href="/oferte-azi" className={`${LINK} hidden sm:block`}>Toate ofertele →</Link>
          </div>
          <GrilaOferte {...grila} sursa="homepage" scurtPeTelefon />
          <Link href="/oferte-azi" className="mt-4 block text-center border border-[var(--border-strong)] hover:border-[var(--accent-text)]/60 rounded-xl py-3 text-sm font-bold transition-colors">
            Vezi toate cele {cuNumar(numere.toate, "ofertă", "oferte")} →
          </Link>
        </section>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {teme.length > 0 && (
          <section aria-labelledby="teme-h">
            <h2 id="teme-h" className={`${H2} mb-1`}>Produse cu prețul de azi</h2>
            <p className="text-sm text-[var(--text-soft)] mb-5">Din feed-urile magazinelor partenere, alături de ghidul fiecărei teme.</p>
            <div className="grid gap-6 lg:grid-cols-3">
              {teme.map((t) => (
                <div key={t.tema}>
                  <div className="flex items-baseline justify-between gap-3 mb-2.5">
                    <h3 className="font-black">{t.titlu}</h3>
                    <Link href={t.href} className={LINK}>Ghidul →</Link>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {t.produse.map((p) => <CardProdus key={p.url} p={p} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {alege.length > 0 && (
          <section aria-labelledby="alege-h">
            <div className="flex items-end justify-between gap-4 mb-1">
              <h2 id="alege-h" className={H2}>Alege după caracteristică</h2>
              <Link href="/alege" className={LINK}>Toate →</Link>
            </div>
            <p className="text-sm text-[var(--text-soft)] mb-4">Produse cu prețul verificat pe site-ul magazinului, grupate după ce contează la cumpărare.</p>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              {alege.slice(0, 12).map((c) => (
                <li key={c.slug}><Link href={`/alege/${c.slug}`} className="text-[var(--text-soft)] hover:text-[var(--accent-text)]">{c.titlu}</Link></li>
              ))}
            </ul>
            {alege.length > 12 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-[var(--accent-text)]">Toate cele {cuNumar(alege.length, "pagină", "pagini")}</summary>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm mt-3">
                  {alege.slice(12).map((c) => (
                    <li key={c.slug}><Link href={`/alege/${c.slug}`} className="text-[var(--text-soft)] hover:text-[var(--accent-text)]">{c.titlu}</Link></li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        )}

        <section aria-labelledby="cat-h">
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2 id="cat-h" className={H2}>Categorii</h2>
            <Link href="/categorii" className={LINK}>Toate →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {categorii.map((c) => {
              const nr = promoPeCategorie.get(c.slug) || 0;
              return (
                <Link key={c.slug} href={`/categorii/${c.slug}`} className="am-tile flex items-center gap-2.5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl px-3 py-2.5">
                  <CategoryIcon slug={c.slug} size="sm" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-tight truncate">{c.label}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{nr > 0 ? `${cuNumar(nr, "magazin", "magazine")} cu oferte` : "Vezi magazinele"}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="pop-h">
          <div className="flex items-end justify-between gap-4 mb-4">
            <h2 id="pop-h" className={H2}>Magazine populare</h2>
            <Link href="/toate-magazinele" className={LINK}>Toate cele {cuNumar(magazine.length, "magazin", "magazine")} →</Link>
          </div>
          <div className="pop-grid">
            {populare.map((m) => {
              const nume = numePopular.get(m.magazin) || numeAfisat(m.magazin);
              const x = peMagazin.get(m.magazin);
              const insigna = x?.cod ? cuNumar(x.cod, "cod", "coduri") : x?.oferta ? cuNumar(x.oferta, "ofertă", "oferte") : "";
              return (
                <Link key={m.magazin} href={hrefPopular.get(m.magazin) || `/cod-reducere/${m.magazin}`}
                  className="pop" title={nume} aria-label={insigna ? `${nume}: ${insigna}` : nume}>
                  {insigna && <span className={x?.cod ? "pop-b" : "pop-b pop-b-soft"} aria-hidden="true">{insigna}</span>}
                  <LogoMagazin src={m.logo_url} nume={nume} />
                </Link>
              );
            })}
          </div>
        </section>

        {ghiduri.length > 0 && (
          <section aria-labelledby="ghid-h">
            <div className="flex items-end justify-between gap-4 mb-4">
              <h2 id="ghid-h" className={H2}>Ghiduri de cumpărare</h2>
              <Link href="/blog" className={LINK}>Blog →</Link>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              {ghiduri.slice(0, 9).map((g) => (
                <li key={g.slug}><Link href={`/blog/${g.slug}`} className="text-[var(--text-soft)] hover:text-[var(--accent-text)]">{g.title}</Link></li>
              ))}
            </ul>
            {ghiduri.length > 9 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-bold text-[var(--accent-text)]">Toate cele {cuNumar(ghiduri.length, "ghid", "ghiduri")}</summary>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm mt-3">
                  {ghiduri.slice(9).map((g) => (
                    <li key={g.slug}><Link href={`/blog/${g.slug}`} className="text-[var(--text-soft)] hover:text-[var(--accent-text)]">{g.title}</Link></li>
                  ))}
                </ul>
              </details>
            )}
          </section>
        )}

        {listaTopuri.length > 0 && (
          <nav aria-labelledby="top-h">
            <div className="flex items-end justify-between gap-4 mb-4">
              <h2 id="top-h" className={H2}>Topuri de produse</h2>
              <Link href="/top" className={LINK}>Toate →</Link>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-sm">
              {listaTopuri.map((t) => (
                <li key={t.slug}><Link href={`/top/${t.slug}`} className="text-[var(--text-soft)] hover:text-[var(--accent-text)]">{t.titlu}</Link></li>
              ))}
            </ul>
          </nav>
        )}

        <section aria-labelledby="faq-h" className="max-w-3xl">
          <h2 id="faq-h" className={`${H2} mb-4`}>Întrebări frecvente</h2>
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
      </div>
    </div>
  );
}
