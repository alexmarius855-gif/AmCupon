import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import GraficCategorii from "./GraficCategorii";
import { cuNumar, deNumar } from "@/lib/acordNumeral";

/**
 * Studiu public pe datele proprii — pagina construita ca sa poata fi CITATA.
 *
 * De ce exista: pe un domeniu cu autoritate mica, singurul tip de continut care
 * aduce link editorial real e un studiu pe date pe care nu le are altcineva.
 * Concurentul cu ~350k vizite/luna se tine pe ~5 linkuri editoriale, unul dintre
 * ele obtinut exact asa. AmCupon urmareste automat 1100+ magazine romanesti —
 * seria asta de date nu exista public nicaieri.
 *
 * Rezultatul central ne contrazice interesul comercial (un site de cupoane care
 * arata cat de putine coduri reale exista) — de aceea e credibil.
 *
 * REGULA PAGINII: fiecare cifra vine din `studiu-cupoane.json`, generat de
 * scripts/generate_studiu_cupoane.py la fiecare rulare de pipeline. Nimic
 * hardcodat, nimic rotunjit "ca sa sune bine". Limitele metodei sunt scrise pe
 * pagina, nu ascunse — un jurnalist care gaseste singur o limita nedeclarata nu
 * mai scrie articolul si nu mai raspunde la al doilea email.
 */

interface Categorie {
  slug: string;
  nume: string;
  magazine: number;
  cu_promotie: number;
  reducere_mediana: number | null;
  reducere_max: number | null;
  esantion: number;
}
/** O luna din seria lunara (scripts/generate_studiu_cupoane.py, `serie_lunara`). Cand
 *  `incomplet` e true, lipsesc toate cifrele: luna n-a avut destule zile cu date bune. */
interface Luna {
  luna: string;
  incomplet: boolean;
  zile: number;
  zile_bune: number;
  promotii_noi?: number;
  cu_cod?: number;
  magazine?: number;
  din_magazine_ro?: number;
  active_pe_zi?: number;
  top_ro?: { slug: string; nume: string; promotii: number; cu_cod: number }[];
  categorii?: { slug: string; nume: string; promotii: number }[];
}
interface Studiu {
  generat: string;
  total_magazine: number;
  cu_promotie: number;
  cu_cod_real: number;
  doar_oferta: number;
  procent_cu_promotie: number;
  procent_cu_cod: number;
  reducere_mediana_generala: number | null;
  magazine_cu_procent_declarat: number;
  categorii: Categorie[];
  retele: string[];
  prag_esantion: number;
  serie_de_la?: string;
  lunar?: Luna[];
  /** Din 15.10.2026: cifrele de mai sus sunt doar pe magazinele cu domeniu .ro. */
  criteriu?: string;
  international?: { total: number; cu_promotie: number; cu_cod: number };
}

const LUNA = new Intl.DateTimeFormat("ro-RO", { month: "long", year: "numeric", timeZone: "UTC" });
const ZI = new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const numeLuna = (l: string) => LUNA.format(new Date(`${l}-01T00:00:00Z`));
/** „138 de magazine", nu „138 magazine": numeralul romanesc cere „de" de la 20 in sus. */
const cuDe = (n: number | undefined) => `${n ?? 0}${deNumar(n ?? 0)}`;

function loadStudiu(): Studiu | null {
  try {
    const p = path.join(process.cwd(), "public", "studiu-cupoane.json");
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return null;
  }
}

const URL_PAGINA = "https://amcupon.ro/studiu/coduri-reducere-romania";

export function generateMetadata(): Metadata {
  const s = loadStudiu();
  const titlu = s
    ? `Doar ${s.cu_cod_real} din ${cuNumar(s.total_magazine, "magazin", "magazine")} au cod de reducere`
    : "Studiu: codurile de reducere în România";
  return {
    title: `${titlu} | AmCupon.ro`,
    description: s
      ? `Studiu pe ${s.total_magazine} de magazine online românești: doar ${s.cu_cod_real} au cod de reducere activ, ${s.doar_oferta} au promoții fără cod. Reduceri mediane pe categorii, date actualizate ${s.generat}.`
      : "Studiu pe magazinele online românești: câte au cu adevărat coduri de reducere active.",
    keywords: [
      "studiu coduri reducere românia", "câte magazine au cupoane", "reduceri online românia date",
      "e-commerce românia statistici", "cod reducere românia studiu",
    ],
    alternates: { canonical: URL_PAGINA },
    openGraph: {
      title: titlu,
      url: URL_PAGINA,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "article",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
    },
  };
}

export default function StudiuPage() {
  const s = loadStudiu();
  const an = new Date().getFullYear();

  if (!s) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
        <p className="text-[var(--text-soft)]">
          Datele studiului se regenerează. Revino în câteva minute sau vezi{" "}
          <Link href="/" className="text-[var(--accent-text)] font-semibold hover:text-[var(--accent-text)]">pagina principală</Link>.
        </p>
      </div>
    );
  }

  const cuMediana = s.categorii.filter((c) => c.reducere_mediana !== null);
  const faraMediana = s.categorii.filter((c) => c.reducere_mediana === null);
  const lunar = s.lunar ?? [];
  const ultimaLuna = lunar.length > 0 ? lunar[lunar.length - 1] : null;
  const luniPublicate = lunar.filter((l) => !l.incomplet);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        name: "Coduri de reducere active în magazinele online din România",
        description: `Măsurătoare pe ${s.total_magazine} de magazine online românești: câte au promoții active și câte au cod de reducere real, cu reduceri mediane pe categorie.`,
        url: URL_PAGINA,
        license: "https://creativecommons.org/licenses/by/4.0/",
        creator: { "@type": "Organization", name: "AmCupon.ro", url: "https://amcupon.ro" },
        dateModified: s.generat,
        distribution: [{
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: "https://amcupon.ro/studiu-cupoane.json",
        }],
        spatialCoverage: { "@type": "Country", name: "România" },
      },
      {
        "@type": "Article",
        headline: `Doar ${s.cu_cod_real} din ${s.total_magazine} de magazine online românești au cod de reducere activ`,
        datePublished: s.generat,
        dateModified: s.generat,
        author: { "@type": "Organization", name: "AmCupon.ro" },
        publisher: { "@type": "Organization", name: "AmCupon.ro" },
        mainEntityOfPage: URL_PAGINA,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: "https://amcupon.ro" },
          { "@type": "ListItem", position: 2, name: "Studiu coduri de reducere", item: URL_PAGINA },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[var(--background)]">

        <nav className="bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[var(--text-soft)] font-medium">Studiu: coduri de reducere</span>
          </div>
        </nav>

        {/* ── Teza ─────────────────────────────────────────────────────────── */}
        <header className="max-w-3xl mx-auto px-4 pt-12 pb-8">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[var(--text-muted)] mb-5">
            Date proprii &middot; actualizat {s.generat}
          </p>
          <h1 className="text-3xl md:text-[2.6rem] font-black text-[var(--foreground)] leading-[1.12] mb-6">
            Doar {s.cu_cod_real} din {s.total_magazine.toLocaleString("ro-RO")} de magazine online
            românești au azi un cod de reducere real
          </h1>
          <p className="text-[var(--text-soft)] text-lg leading-relaxed">
            Urmărim automat promoțiile din {s.total_magazine.toLocaleString("ro-RO")} de magazine
            online românești (cu domeniu .ro). Am numărat câte au cu adevărat un cod de cupon
            activ, și câte doar par să aibă. Rezultatul nu ne avantajează: administrăm un site de cupoane.
          </p>
        </header>

        {/* ── Cifrele ──────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { cifra: s.total_magazine.toLocaleString("ro-RO"), eticheta: "magazine urmărite", accent: false },
              { cifra: `${s.cu_promotie}`, eticheta: `cu promoție activă (${s.procent_cu_promotie.toLocaleString("ro-RO")}%)`, accent: false },
              { cifra: `${s.cu_cod_real}`, eticheta: `cu cod de cupon real (${s.procent_cu_cod.toLocaleString("ro-RO")}%)`, accent: true },
            ].map((x) => (
              <div key={x.eticheta}
                className={`rounded-xl p-5 border ${x.accent
                  ? "bg-[var(--surface-alt)] border-[var(--accent-text)]/40"
                  : "bg-[var(--surface)] border-[var(--border)]"}`}>
                <div className={`text-4xl font-black leading-none mb-2 ${x.accent ? "text-[var(--accent-text)]" : "text-[var(--foreground)]"}`}>
                  {x.cifra}
                </div>
                <div className="text-xs text-[var(--text-muted)] leading-snug">{x.eticheta}</div>
              </div>
            ))}
          </div>

          <p className="text-[var(--text-soft)] mt-6 leading-relaxed">
            Diferența contează pentru cumpărător: <strong className="text-[var(--foreground)]">{cuDe(s.doar_oferta)} magazine</strong>{" "}
            au reduceri active, dar afișate direct în preț, fără cod de introdus la finalizarea
            comenzii. Doar <strong className="text-[var(--foreground)]">{s.cu_cod_real}</strong>{" "}cer un cod.
            Cine caută &quot;cod reducere X&quot; pe Google găsește, în marea majoritate a cazurilor,
            pagini care promit un cod ce nu există.
          </p>
        </section>

        {/* ── Luna trecuta in cifre (seria lunara, 24.09.2026) ─────────────────
            Apare singura dupa prima luna completa a seriei curate (octombrie 2026 →
            1 noiembrie). O luna cu goluri NU primeste cifre: o retea care n-a raspuns
            ar arata in grafic ca o scadere a promotiilor, iar pagina asta e facuta sa fie citata. */}
        {ultimaLuna && (
          <section className="max-w-3xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-2">
              {numeLuna(ultimaLuna.luna).replace(/^./, (c) => c.toUpperCase())} în cifre
            </h2>
            {ultimaLuna.incomplet ? (
              <p className="text-sm text-[var(--text-soft)] leading-relaxed">
                Pentru {numeLuna(ultimaLuna.luna)} nu publicăm cifrele: doar {ultimaLuna.zile_bune} din{" "}
                {cuNumar(ultimaLuna.zile, "zi a avut", "zile au avut")} date complete. Preferăm o lună lipsă unei luni greșite.
              </p>
            ) : (
              <>
                <p className="text-[var(--text-soft)] leading-relaxed mb-3">
                  În {numeLuna(ultimaLuna.luna)} am văzut{" "}
                  <strong className="text-[var(--foreground)]">{cuDe(ultimaLuna.promotii_noi)} promoții noi</strong> la{" "}
                  {cuDe(ultimaLuna.magazine)} magazine. Dintre ele,{" "}
                  <strong className="text-[var(--accent-text)]">{ultimaLuna.cu_cod}</strong>{" "}
                  ({ultimaLuna.promotii_noi ? Math.round(((ultimaLuna.cu_cod ?? 0) / ultimaLuna.promotii_noi) * 100) : 0}%)
                  au avut cod de reducere; restul au fost oferte fără cod de introdus.
                </p>
                <p className="text-[var(--text-soft)] leading-relaxed mb-5">
                  În medie, {cuDe(ultimaLuna.active_pe_zi)} promoții au fost active în fiecare zi.{" "}
                  {ultimaLuna.din_magazine_ro} dintre promoțiile noi au venit de la magazine cu domeniu .ro.
                </p>

                {(ultimaLuna.top_ro?.length ?? 0) > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-[var(--border)] mb-5">
                    <table className="w-full text-sm min-w-[420px]">
                      <caption className="text-left text-xs text-[var(--text-muted)] px-4 pt-3 pb-1">
                        Magazinele .ro cu cele mai multe promoții noi
                      </caption>
                      <thead>
                        <tr className="bg-[var(--surface)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                          <th className="text-left font-bold px-4 py-3">Magazin</th>
                          <th className="text-right font-bold px-4 py-3">Promoții noi</th>
                          <th className="text-right font-bold px-4 py-3">Cu cod</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimaLuna.top_ro!.map((m) => (
                          <tr key={m.slug} className="border-t border-[var(--border)]">
                            <td className="px-4 py-3">
                              <Link href={`/cod-reducere/${m.slug}`} className="text-[var(--foreground)] font-semibold hover:text-[var(--accent-text)]">
                                {m.nume}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{m.promotii}</td>
                            <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{m.cu_cod}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(ultimaLuna.categorii?.length ?? 0) > 0 && (
                  <p className="text-sm text-[var(--text-soft)] leading-relaxed mb-4">
                    Pe categorii:{" "}
                    {ultimaLuna.categorii!.map((c, i) => (
                      <span key={c.slug}>
                        {i > 0 && ", "}
                        <Link href={`/categorii/${c.slug}`} className="text-[var(--foreground)] hover:text-[var(--accent-text)]">{c.nume}</Link>{" "}
                        {c.promotii}
                      </span>
                    ))}
                    .
                  </p>
                )}
              </>
            )}

            {luniPublicate.length > 1 && (
              <div className="overflow-x-auto rounded-xl border border-[var(--border)] mb-4">
                <table className="w-full text-sm min-w-[420px]">
                  <thead>
                    <tr className="bg-[var(--surface)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                      <th className="text-left font-bold px-4 py-3">Luna</th>
                      <th className="text-right font-bold px-4 py-3">Promoții noi</th>
                      <th className="text-right font-bold px-4 py-3">Cu cod</th>
                      <th className="text-right font-bold px-4 py-3">Magazine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lunar.map((l) => (
                      <tr key={l.luna} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3 text-[var(--foreground)]">{numeLuna(l.luna)}</td>
                        {l.incomplet ? (
                          <td colSpan={3} className="px-4 py-3 text-right text-[var(--text-muted)]">date incomplete</td>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{l.promotii_noi}</td>
                            <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{l.cu_cod}</td>
                            <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{l.magazine}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Date din {ultimaLuna.zile_bune} din cele {cuDe(ultimaLuna.zile)} zile ale lunii. O promoție e nouă în luna
              în care am văzut-o prima dată. Zilele în care o rețea n-a răspuns nu intră în calcule.
            </p>
          </section>
        )}

        {/* ── Reduceri pe categorie ────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[var(--foreground)] mb-2">Cât de mari sunt reducerile, pe categorii</h2>
          <p className="text-sm text-[var(--text-muted)] mb-5">
            Procentele sunt extrase din textul promoțiilor, așa cum l-au scris magazinele.
            Publicăm mediana doar unde avem cel puțin {cuNumar(s.prag_esantion, "magazin care declară", "magazine care declară")}
            un procent &mdash; sub atât, o mediană ar fi zgomot prezentat ca măsurătoare.
          </p>

          <GraficCategorii categorii={s.categorii} />

          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-[var(--surface)] text-[var(--text-muted)] text-[11px] uppercase tracking-wider">
                  <th className="text-left font-bold px-4 py-3">Categorie</th>
                  <th className="text-right font-bold px-4 py-3">Magazine</th>
                  <th className="text-right font-bold px-4 py-3">Cu promoție</th>
                  <th className="text-right font-bold px-4 py-3">Reducere mediană</th>
                  <th className="text-right font-bold px-4 py-3">Cea mai mare</th>
                </tr>
              </thead>
              <tbody>
                {cuMediana.map((c) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3">
                      <Link href={`/categorii/${c.slug}`} className="text-[var(--foreground)] font-semibold hover:text-[var(--accent-text)]">
                        {c.nume}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{c.magazine}</td>
                    <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{c.cu_promotie}</td>
                    <td className="px-4 py-3 text-right font-black text-[var(--accent-text)] tabular-nums">{String(c.reducere_mediana).replace(".", ",")}%</td>
                    <td className="px-4 py-3 text-right text-[var(--text-soft)] tabular-nums">{c.reducere_max}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {faraMediana.length > 0 && (
            <p className="text-xs text-[var(--text-muted)] mt-4 leading-relaxed">
              <strong className="text-[var(--text-soft)]">Date insuficiente</strong> pentru încă{" "}
              {cuNumar(faraMediana.length, "categorie", "categorii")} ({faraMediana.map((c) => c.nume).join(", ")}) &mdash;
              prea puține magazine declară un procent ca să putem publica o mediană onestă.
              Le listăm ca să se vadă ce NU știm, nu doar ce știm.
            </p>
          )}
        </section>

        {/* ── Metoda ───────────────────────────────────────────────────────── */}
        <section className="bg-[var(--surface)] border-y border-[var(--border)] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[var(--foreground)] mb-5">Cum am măsurat</h2>
            <div className="space-y-4 text-sm text-[var(--text-soft)] leading-relaxed">
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Sursa datelor</h3>
                <p>
                  Magazinele și promoțiile vin din rețelele de afiliere în care AmCupon.ro e partener:{" "}
                  {s.retele.join(", ")}. Datele se reîmprospătează automat de trei ori pe zi.
                  Cifrele de pe această pagină sunt cele de la {s.generat}.
                </p>
              </div>
              {s.international && (
                <div>
                  <h3 className="font-bold text-[var(--foreground)] mb-1">Ce numărăm ca magazin românesc</h3>
                  <p>
                    Magazinele cu domeniu .ro. Mai urmărim {s.international.total.toLocaleString("ro-RO")}{deNumar(s.international.total)}
                    magazine internationale care livreaza in Romania (branduri care vand prin Impact.com,
                    magazine cu domeniu .com, .bg sau altul); {s.international.cu_cod} dintre ele au azi un cod
                    de cupon. Nu le adunăm la cifrele de mai sus: ar descrie comerțul altor piețe, nu pe cel
                    românesc.
                  </p>
                </div>
              )}
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Ce inseamna &quot;cod real&quot;</h3>
                <p>
                  O promoție activă care conține un cod de cupon nevid, adică un text pe care
                  cumpărătorul chiar îl introduce la finalizarea comenzii. Promoțiile cu reducere
                  aplicată direct în preț sunt numărate separat, ca oferte fără cod.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Limitele acestei măsurători</h3>
                <p>
                  Acoperă magazinele accesibile prin rețelele de mai sus și codurile publice
                  distribuite acolo. Un magazin care trimite coduri <strong className="text-[var(--foreground)]">doar
                  pe newsletter, în aplicație sau către clienți individuali</strong>{" "}nu apare în
                  aceste cifre. Nu măsurăm tot comerțul online românesc, ci partea lui vizibilă
                  prin afiliere &mdash; care e, totuși, exact partea pe care o vede oricine caută
                  un cod de reducere pe Google.
                </p>
              </div>
              {s.serie_de_la && (
                <div>
                  <h3 className="font-bold text-[var(--foreground)] mb-1">Seria lunară</h3>
                  <p>
                    Seria lunară pornește pe {ZI.format(new Date(`${s.serie_de_la}T00:00:00Z`))}: de atunci
                    numărăm zi de zi promoțiile noi. Datele mai vechi există, dar descriu schimbările surselor
                    noastre, nu piața: între iunie și septembrie am adăugat surse noi, iar până pe 24 septembrie
                    o parte din promoții intrau cu întârziere. O lună se publică doar dacă cel puțin 90% din
                    zilele ei au date complete.
                  </p>
                </div>
              )}
              <div>
                <h3 className="font-bold text-[var(--foreground)] mb-1">Ce nu publicăm</h3>
                <p>
                  Comisioanele noastre de afiliere. Sunt ce câștigăm noi dintr-o vânzare, nu o
                  măsură a pieței sau a ofertei pentru cumpărător.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Date deschise ────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-black text-[var(--foreground)] mb-2">Datele brute, libere de folosit</h2>
            <p className="text-sm text-[var(--text-soft)] mb-4 leading-relaxed">
              Cifrele complete, inclusiv categoriile cu eșantion prea mic, sunt publice în format
              JSON. Se pot prelua și verifica de oricine. Dacă le folosești într-un articol, te
              rugăm să citezi AmCupon.ro ca sursă.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/studiu-cupoane.json"
                className="inline-block bg-[#ddf93c] text-[#0c1000] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#c3dd2c] transition-colors">
                Descarcă datele (JSON)
              </a>
              <Link href="/contact"
                className="inline-block bg-[var(--surface-alt)] text-[var(--foreground)] font-bold text-sm px-5 py-2.5 rounded-xl border border-[var(--border-strong)] hover:border-[#c9ced5] transition-colors">
                Întreabă despre metodologie
              </Link>
            </div>
          </div>
        </section>

        {/* ── Legaturi interne ─────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <h2 className="text-base font-black text-[var(--text-soft)] mb-4">Vezi și</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/oferte-azi", label: "Ofertele de azi" },
              { href: "/toate-magazinele", label: "Toate magazinele" },
              { href: "/categorii", label: "Categorii" },
              { href: "/radar", label: "Radar zilnic" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] hover:text-[var(--accent-text)] text-[var(--text-soft)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)] hover:border-[#c9ced5]">
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)]">
          &copy; {an} AmCupon.ro &middot; Studiu actualizat automat la fiecare rulare a datelor
        </footer>
      </div>
    </>
  );
}
