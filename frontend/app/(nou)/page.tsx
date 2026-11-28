import type { Metadata } from "next";
import Link from "next/link";
import Bon, { type ProdusBon } from "./_ui/Bon";
import Cautator, { type TemaCautator } from "./_ui/Cautator";
import GrilaCupoane from "./_ui/GrilaCupoane";
import CardProdus from "./_ui/CardProdus";
import { IconRegula } from "./_ui/Iconite";
import { citesteJSON, dateBF } from "./_date";
import { pesteMagazine, PesteMagazine, laParteneri } from "@/lib/cifreSite";
import { numeAfisat } from "@/lib/numeMagazin";
import { CATEGORII_SITE } from "@/lib/site";
import { MAGAZINE_POPULARE } from "@/lib/magazinePopulare";
import { oferteDePeMagazin, magazinePopulareAcasa } from "@/lib/oferteAcasa";
import { cuNumar } from "@/lib/acordNumeral";
import { poolOferte, grilaOferte, type MagazinGrila } from "@/lib/grilaOferte";
import { campaniiBF } from "@/lib/campaniiBlackFriday";
import { aziRomania, calendarScurt, fazaBF } from "@/lib/momentBF";
import { sectiunePentru } from "@/lib/oferteTema";
import { criterii as toateCriteriile, temeCriterii } from "@/lib/criterii";
import { topuri as toateTopurile } from "@/lib/legaturiInterne";
import { termometru, ziuaTermometrului, type Termometru } from "@/lib/termometru";
import { lei, procent, ziLunga, ziScurta, zileIntre } from "@/lib/formatRo";
import { imagineSigura, titluAfisat } from "@/lib/topFeed";

/**
 * Prima pagina a noului site („Pretul adevarat", 25.11.2026). In primul ecran: cautatorul („Ce cumperi?") si bonul
 * de pret cu un produs real de azi. Apoi, pe placi: ofertele de azi (codul ca bon), „sub minimul din 30 de zile",
 * calendarul Black Friday (doar in fereastra lui), magazinele, cum lucram, harta de linkuri si intrebarile.
 * Titlul, descrierea, canonical-ul si FAQPage-ul sunt cele ale vechii prime pagini (adresa nu se schimba).
 * Fiecare cifra vine din date (lib/cifreSite.ts, lib/acordNumeral.ts).
 */
export const metadata: Metadata = {
  title: "AmCupon.ro — Coduri de reducere și oferte actualizate zilnic",
  description:
    `${PesteMagazine()} partenere cu coduri de reducere și oferte actualizate zilnic: ${laParteneri(["fashion", "beauty", "sanatate", "electronice"], 4).replace(/^la /, "")} și multe altele.`,
  alternates: { canonical: "https://amcupon.ro" },
  openGraph: {
    title: "AmCupon.ro — Coduri de reducere și oferte actualizate zilnic",
    description: `${PesteMagazine()} partenere cu coduri și oferte actualizate zilnic.`,
    url: "https://amcupon.ro",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

interface Magazin extends MagazinGrila { categorie_slug?: string }

interface Scadere { title: string; url: string; image?: string; merchant_slug?: string; pret: number; minim_30_zile: number; scadere_pct: number }
interface Statistici { produse: number; scumpite: number; ieftinite: number; neschimbate: number; fereastra_zile: number; acoperire_min_zile: number }
interface Scaderi { actualizat: string; statistici?: Statistici; produse: Scadere[] }

// Formatul care a adus clicuri pe vechiul site: produse din feed, cu pret si link platit, langa ghidul temei.
const TEME_ACASA = [
  { tema: "parfumuri-barbati", titlu: "Parfumuri pentru bărbați", href: "/top/parfumuri-barbati" },
  { tema: "aspiratoare-fara-fir", titlu: "Aspiratoare fără fir", href: "/top/aspiratoare-fara-fir" },
  { tema: "friteuze", titlu: "Friteuze cu aer", href: "/blog/cea-mai-buna-friteuza-aer-2026" },
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

/** Aceeasi oferta de pe mai multe adrese (aqualine, 28.11: trei randuri identice): un singur rand, cel mai bun. */
function faraDubluri(xs: Scadere[]): Scadere[] {
  const vazute = new Set<string>();
  const out: Scadere[] = [];
  for (const s of [...xs].sort((a, b) => b.scadere_pct - a.scadere_pct)) {
    const k = `${s.merchant_slug}|${titluAfisat(s.title).toLowerCase()}`;
    if (vazute.has(k)) continue;
    vazute.add(k);
    out.push(s);
  }
  return out;
}

/** Datele cautatorului: temele /alege publicate, cu cele mai ieftine 3 produse ale fiecarei caracteristici; in HTML
 *  intra cel mult 60 de produse (o caracteristica in plus ramane doar cu linkul spre pagina ei). */
function dateCautator(): TemaCautator[] {
  let buget = 60;
  return temeCriterii().map((t) => ({
    tema: t.tema,
    nume: t.nume,
    criterii: t.criterii.map((c) => {
      const alese = [...c.produse].sort((a, b) => a.pret - b.pret).slice(0, Math.max(0, Math.min(3, buget)));
      buget -= alese.length;
      return {
        slug: c.slug, titlu: c.titlu, modele: c.produse.length, dela: Math.min(...c.produse.map((p) => p.pret)),
        produse: alese.map((p) => ({
          titlu: p.titlu, pret: p.pret, imagine: imagineSigura(p.imagine) || undefined, url: p.url,
          magazin: numeAfisat(p.magazin), confirmat: p.verificat,
        })),
      };
    }),
  }));
}

export default function Page() {
  const magazine = citesteJSON<Magazin[]>("output.json", []);
  const azi = aziRomania();
  const ziDate = ziuaTermometrului() || azi;

  // ── Ofertele: aceeasi ordine ca pe vechiul site, in HTML doar cele afisate ──
  const pool = poolOferte(magazine);
  const grila = grilaOferte(pool, { limita: 6 });
  const numere = grila.numere;
  const peMagazin = oferteDePeMagazin(pool);

  // ── Black Friday: doar in fereastra lui ──
  const bf = dateBF();
  const faza = bf.an ? fazaBF(azi, bf) : "inchis";
  const { inCurs, urmeaza, urmatoare } = calendarScurt(azi, campaniiBF(azi));
  const inDate = new Set(magazine.map((m) => m.magazin));

  // ── Cautatorul: doar paginile /alege publicate, cate 3 produse (cel mult 60 in HTML) ──
  const teme = dateCautator();
  const nrAlege = teme.reduce((n, t) => n + t.criterii.length, 0);

  // ── Termometrul: scaderile reale de azi, fara dubluri si fara variante neclare ──
  const scaderi = citesteJSON<Scaderi>("scaderi-pret.json", { actualizat: "", produse: [] });
  const stat = scaderi.statistici;
  const reale: { s: Scadere; t: Termometru }[] = [];
  for (const s of faraDubluri(scaderi.produse)) {
    const t = termometru(s.url, s.pret);
    if (t && t.verdict !== "tace") reale.push({ s, t });
  }
  // Bonul: cea mai mare scadere reala; altfel un produs /alege cu destul istoric (verdictul spune ce e).
  let bon: { produs: ProdusBon; t: Termometru } | null = reale[0]
    ? { produs: { titlu: titluAfisat(reale[0].s.title), magazin: numeAfisat(reale[0].s.merchant_slug || ""), url: reale[0].s.url }, t: reale[0].t }
    : null;
  if (!bon) {
    for (const c of toateCriteriile()) {
      for (const p of c.produse) {
        const t = termometru(p.url_magazin, p.pret);
        if (t && t.verdict !== "tace") { bon = { produs: { titlu: p.titlu, magazin: numeAfisat(p.magazin), url: p.url }, t }; break; }
      }
      if (bon) break;
    }
  }

  // ── Produse din topuri (pretul din feed, langa ghidul temei) ──
  const temeProduse = TEME_ACASA.map((x) => {
    const s = sectiunePentru(x.tema);
    const produse = s ? s.game.flatMap((g) => g.produse.slice(0, 1)).slice(0, 2) : [];
    return { ...x, produse };
  }).filter((x) => x.produse.length === 2).slice(0, 3);

  // ── Magazine si harta de linkuri ──
  const populare = magazinePopulareAcasa(magazine, MAGAZINE_POPULARE.map((x) => x.slug), new Set(peMagazin.keys()));
  const hrefPopular = new Map(MAGAZINE_POPULARE.filter((x) => x.href).map((x) => [x.slug, x.href as string]));
  const numePopular = new Map(MAGAZINE_POPULARE.map((x) => [x.slug, x.label]));
  const promoPeCategorie = new Map<string, number>();
  const cuMagazine = new Set<string>();
  for (const m of magazine) {
    if (!m.categorie_slug) continue;
    cuMagazine.add(m.categorie_slug);
    if (m.promotii?.length) promoPeCategorie.set(m.categorie_slug, (promoPeCategorie.get(m.categorie_slug) || 0) + 1);
  }
  const categorii = CATEGORII_SITE
    .filter((c) => cuMagazine.has(c.slug) && c.slug !== "marketplace" && c.slug !== "servicii")
    .sort((a, b) => (promoPeCategorie.get(b.slug) || 0) - (promoPeCategorie.get(a.slug) || 0));
  const ghiduri = citesteJSON<{ slug: string; title: string; surse_din?: string }[]>("blog-posts.json", [])
    .filter((p) => p.surse_din)
    .sort((a, b) => a.title.localeCompare(b.title, "ro"));
  const alege = toateCriteriile().map((c) => ({ slug: c.slug, titlu: c.titlu })).sort((x, y) => x.titlu.localeCompare(y.titlu, "ro"));
  const listaTopuri = toateTopurile();
  const intrebari = intrebariAcasa(pesteMagazine());

  const intl = bf.an ? `${Number(bf.international[0].slice(8))}–${ziLunga(bf.international[1]).replace(/ \d{4}$/, "")}` : "";
  const eticheta = faza === "international"
    ? `Black Friday ${bf.an} · valul internațional e acum, ${intl}`
    : faza === "intre-valuri" ? `Black Friday ${bf.an} · urmează valul internațional, ${intl}`
    : faza === "inainte-emag" ? `Black Friday ${bf.an} · eMAG pe ${ziLunga(bf.emag).replace(/ \d{4}$/, "")}`
    : "Prețul adevărat";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: intrebari.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
        }).replace(/</g, "\\u003c") }}
      />

      <section className="erou" aria-labelledby="h1">
        <div className="cadru erou-grila">
          <div>
            <span className="eticheta">{eticheta}</span>
            <h1 id="h1" className="h1">Coduri de reducere și prețul adevărat, înainte să plătești</h1>
            <p className="lead">
              {cuNumar(numere.toate, "ofertă activă", "oferte active")} azi, dintre care {cuNumar(numere.cod, "cod de reducere", "coduri de reducere")}.
              {stat && stat.produse > 0 && <> Pentru {cuNumar(stat.produse, "produs", "produse")} știm și prețul din ultimele 30 de zile, ca să vezi dacă o reducere e reală.</>}
            </p>
            <div className="erou-cautator">
              <Cautator teme={teme} />
              {nrAlege > 0 && (
                <p className="nota" style={{ marginTop: 10 }}>
                  Doar caracteristicile la care am confirmat prețurile pe site-ul magazinului ({cuNumar(nrAlege, "pagină", "pagini")} azi). Lista crește pe măsură ce confirmăm.
                </p>
              )}
            </div>
          </div>
          <Bon produs={bon?.produs ?? null} t={bon?.t ?? null} azi={ziDate} />
        </div>
      </section>

      <div className="cadru sectiune">
        <div className="bento">
          <section className="placa lat" id="oferte" aria-labelledby="oferte-h">
            <div className="cap-sectiune">
              <div>
                <h2 id="oferte-h" className="h2">Ofertele de azi</h2>
                <p className="sub">{cuNumar(numere.toate, "ofertă activă", "oferte active")}, din care {cuNumar(numere.cod, "cod", "coduri")}. Magazinele din România sunt primele.</p>
              </div>
              <Link href="/oferte-azi" className="legatura">Toate ofertele →</Link>
            </div>
            <GrilaCupoane {...grila} sursa="homepage" />
          </section>

          <section className={faza !== "inchis" ? "placa doua-treimi" : "placa lat"} aria-labelledby="reale-h">
            <div className="placa-cap">
              <h2 id="reale-h">Sub minimul din 30 de zile</h2>
              <Link href="/reduceri-reale" className="legatura">Toate →</Link>
            </div>
            {reale.length > 0 ? (
              <ul>
                {reale.slice(0, 4).map(({ s, t }) => {
                  const img = imagineSigura(s.image);
                  return (
                    <li key={s.url}>
                      <a className="scadere" href={s.url} target="_blank" rel="sponsored noopener noreferrer" data-loc="reale">
                        <span className="scadere-img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {img ? <img src={img} alt="" loading="lazy" decoding="async" /> : null}
                        </span>
                        <span>
                          <span className="scadere-titlu">{titluAfisat(s.title)}</span>
                          <span className="scadere-pret mono"><b>{lei(t.azi)}</b> · minim {lei(t.min)} · {procent(t.sub)} · la {numeAfisat(s.merchant_slug || "")}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="gol">Azi niciun produs urmărit nu e cu cel puțin 10% sub minimul lui din ultimele 30 de zile. După Black Friday e normal: prețurile reduse din ultimele săptămâni sunt acum chiar minimul.</p>
            )}
            {stat && stat.produse > 0 && (
              <p className="nota" style={{ marginTop: 14 }}>
                Din {cuNumar(stat.produse, "produs urmărit", "produse urmărite")}, față de acum {stat.fereastra_zile} de zile: {stat.ieftinite.toLocaleString("ro-RO")} s-au ieftinit, {stat.scumpite.toLocaleString("ro-RO")} s-au scumpit, restul au același preț. Nu numim magazine.
              </p>
            )}
          </section>

          {faza !== "inchis" && (
            <section className="placa treime cal" aria-labelledby="bf-h">
              <div className="placa-cap">
                <h2 id="bf-h">Black Friday {bf.an}</h2>
                <Link href="/black-friday" className="legatura">Calendarul →</Link>
              </div>
              <dl>
                <div><dt>eMAG</dt><dd>{ziScurta(bf.emag)}{azi > bf.emag ? " (a trecut)" : ""}</dd></div>
                <div><dt>Internațional</dt><dd className={faza === "international" ? "acum" : undefined}>{intl}{faza === "international" ? " · acum" : ` · în ${cuNumar(zileIntre(azi, bf.international[0]), "zi", "zile")}`}</dd></div>
                <div><dt>La parteneri, acum</dt><dd>{cuNumar(inCurs, "campanie", "campanii")}</dd></div>
              </dl>
              {urmatoare.length > 0 && (
                <>
                  <p className="eticheta" style={{ marginTop: 16 }}>Urmează ({urmeaza})</p>
                  <ul>
                    {urmatoare.map((u) => (
                      <li key={u.magazin}>
                        {inDate.has(u.magazin) ? <Link href={`/cod-reducere/${u.magazin}`}>{u.nume}</Link> : <span>{u.nume}</span>}
                        <span>{ziScurta(u.start)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="nota" style={{ marginTop: 12 }}>eMAG nu e partener AmCupon; aici sunt campaniile magazinelor partenere.</p>
            </section>
          )}

          {temeProduse.length > 0 && (
            <section className="placa lat" aria-labelledby="teme-h">
              <div className="cap-sectiune">
                <div>
                  <h2 id="teme-h" className="h2">Din topurile noastre</h2>
                  <p className="sub">Produse din feed-urile magazinelor partenere, cu prețul de azi, lângă ghidul fiecărei teme.</p>
                </div>
              </div>
              <div className="grila" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 330px), 1fr))" }}>
                {temeProduse.map((x) => (
                  <div key={x.tema}>
                    <div className="placa-cap" style={{ marginBottom: 10 }}>
                      <h3 className="h3">{x.titlu}</h3>
                      <Link href={x.href} className="legatura">Ghidul →</Link>
                    </div>
                    <div className="grila-produse" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                      {x.produse.map((p) => (
                        <CardProdus key={p.url} p={{ titlu: titluAfisat(p.title), pret: Number(p.price), imagine: imagineSigura(p.image), url: p.url || "", magazin: numeAfisat(p.merchant_slug || "") }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="placa doua-treimi" aria-labelledby="pop-h">
            <div className="placa-cap">
              <h2 id="pop-h">Magazine populare</h2>
              <Link href="/toate-magazinele" className="legatura">Toate cele {cuNumar(magazine.length, "magazin", "magazine")} →</Link>
            </div>
            <div className="magazine">
              {populare.map((m) => {
                const nume = numePopular.get(m.magazin) || numeAfisat(m.magazin);
                const x = peMagazin.get(m.magazin);
                const insigna = x?.cod ? cuNumar(x.cod, "cod", "coduri") : x?.oferta ? cuNumar(x.oferta, "ofertă", "oferte") : "";
                return (
                  <Link key={m.magazin} href={hrefPopular.get(m.magazin) || `/cod-reducere/${m.magazin}`} className="mag" title={nume} aria-label={insigna ? `${nume}: ${insigna}` : nume}>
                    {insigna && <i className={x?.cod ? undefined : "slab"} aria-hidden="true">{insigna}</i>}
                    {m.logo_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={m.logo_url} alt="" loading="lazy" decoding="async" />
                      : <span className="ini">{nume.slice(0, 2)}</span>}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="placa treime" aria-labelledby="cum-h">
            <div className="placa-cap"><h2 id="cum-h">Cum lucrăm</h2></div>
            <ul className="reguli">
              <li><IconRegula tip="ceas" /><span><b>Ofertele vin de la rețelele de afiliere</b> și se actualizează de trei ori pe zi. Cele expirate dispar singure.</span></li>
              <li><IconRegula tip="cos" /><span><b>Codurile nu le testăm în coș.</b> Dacă unul nu merge, încearcă alt cod al magazinului.</span></li>
              <li><IconRegula tip="termometru" /><span><b>{"„Reducere reală”"}</b> doar sub cel mai mic preț din ultimele 30 de zile, la aceeași variantă. Altfel, tăcem.</span></li>
              <li><IconRegula tip="ban" /><span><b>Primim un comision</b> de la magazin când cumperi prin linkurile noastre. Prețul tău rămâne același.</span></li>
            </ul>
          </section>
        </div>
      </div>

      <section className="cadru sectiune" aria-labelledby="harta-h">
        <div className="cap-sectiune"><h2 id="harta-h" className="h2">Pe AmCupon</h2></div>
        <div className="harta">
          <nav aria-label="Categorii">
            <h3>Categorii</h3>
            <ul>
              {categorii.map((c) => {
                const nr = promoPeCategorie.get(c.slug) || 0;
                return <li key={c.slug}><Link href={`/categorii/${c.slug}`}>{c.label}</Link>{nr > 0 && <span className="mono" style={{ color: "var(--text-3)", fontSize: ".75rem" }}> · {cuNumar(nr, "magazin", "magazine")} cu oferte</span>}</li>;
              })}
            </ul>
          </nav>
          {alege.length > 0 && (
            <nav aria-label="Alege după caracteristică">
              <h3>Alege după caracteristică</h3>
              <ul>{alege.slice(0, 12).map((c) => <li key={c.slug}><Link href={`/alege/${c.slug}`}>{c.titlu}</Link></li>)}</ul>
              {alege.length > 12 && (
                <details>
                  <summary>Toate cele {cuNumar(alege.length, "pagină", "pagini")}</summary>
                  <ul>{alege.slice(12).map((c) => <li key={c.slug}><Link href={`/alege/${c.slug}`}>{c.titlu}</Link></li>)}</ul>
                </details>
              )}
            </nav>
          )}
          {listaTopuri.length > 0 && (
            <nav aria-label="Topuri de produse">
              <h3>Topuri de produse</h3>
              <ul>{listaTopuri.slice(0, 12).map((t) => <li key={t.slug}><Link href={`/top/${t.slug}`}>{t.titlu}</Link></li>)}</ul>
              {listaTopuri.length > 12 && (
                <details>
                  <summary>Toate cele {cuNumar(listaTopuri.length, "top", "topuri")}</summary>
                  <ul>{listaTopuri.slice(12).map((t) => <li key={t.slug}><Link href={`/top/${t.slug}`}>{t.titlu}</Link></li>)}</ul>
                </details>
              )}
            </nav>
          )}
          {ghiduri.length > 0 && (
            <nav aria-label="Ghiduri de cumpărare">
              <h3>Ghiduri de cumpărare</h3>
              <ul>{ghiduri.slice(0, 10).map((g) => <li key={g.slug}><Link href={`/blog/${g.slug}`}>{g.title}</Link></li>)}</ul>
              {ghiduri.length > 10 && (
                <details>
                  <summary>Toate cele {cuNumar(ghiduri.length, "ghid", "ghiduri")}</summary>
                  <ul>{ghiduri.slice(10).map((g) => <li key={g.slug}><Link href={`/blog/${g.slug}`}>{g.title}</Link></li>)}</ul>
                </details>
              )}
            </nav>
          )}
        </div>
      </section>

      <section className="cadru sectiune faq" aria-labelledby="faq-h">
        <h2 id="faq-h" className="h2" style={{ marginBottom: 12 }}>Întrebări frecvente</h2>
        {intrebari.map((i) => (
          <details key={i.q}>
            <summary><h3>{i.q}</h3></summary>
            <p>{i.a}</p>
          </details>
        ))}
      </section>
    </>
  );
}
