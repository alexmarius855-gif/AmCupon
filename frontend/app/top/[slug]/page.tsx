import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import TopProduseClient from "./TopProduseClient";
import OferteParteneri from "../../components/OferteParteneri";
import { numeInFraza, type SectiuneTema } from "../../../lib/topFeed";
import { linkuriPlatite, sectiunePentru, dataFeed } from "../../../lib/oferteTema";
import { numeAfisat } from "../../../lib/numeMagazin";

interface Produs {
  pozitie: number;
  badge: string | null;
  badge_color: string | null;
  nume: string;
  model: string;
  imagine: string;
  pret_de_la: number;
  moneda: string;
  scor_total: number;
  scoruri: Record<string, number>;
  verdict_scurt: string;
  verdict_detaliat: string;
  pro: string[];
  contra: string[];
  specificatii: Record<string, string>;
  magazine: {
    magazin_slug: string;
    eticheta: string;
    pret: number;
    recomandat: boolean;
    url_afiliat?: string;
  }[];
}

interface Categorie {
  slug: string;
  titlu: string;
  titlu_scurt: string;
  emoji: string;
  descriere: string;
  culoare: string;
  tag: string | null;
  produse: Produs[];
}

interface TopData {
  updated: string;
  categorii: Categorie[];
}

// Hero-ul era un gradient colorat pe toata latimea, cu text alb peste. Dupa trecerea
// la tema lime (11.08.2026) toate cele 8 variante au ajuns identice, iar lime-ul e
// prea deschis ca sa tina text alb — devenea ilizibil. In referinta pe care o urmam,
// lime e ACCENT (numere, butoane, badge-uri), nu suprafata mare. Deci hero-ul devine
// inchis, iar accentul ramane pe titlu/cifre. `cat.culoare` nu mai controleaza
// culoarea de fundal, dar il pastram in date pentru eventuale accente viitoare.
const HERO_BG = "from-[#14181c] via-[#0f1317] to-[#06080b]";

/**
 * Cand au fost alese modelele si notate preturile din top-produse.json (git: 28.05,
 * 06.06 si 15.06.2026). De atunci fisierul s-a schimbat doar la linkuri si la reparatia
 * de onestitate din 10.08 — `updated` se muta zilnic, dar NU inseamna ca s-a schimbat
 * selectia sau pretul. Pretul de atunci se afiseaza ca „de referinta", cu luna lui.
 */
const SELECTIE = "mai–iunie 2026";

function loadData(): TopData {
  const filePath = path.join(process.cwd(), "public", "top-produse.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/** Pretul exact, cu zecimale doar cand exista. */
function pret(n: number): string {
  return `${n.toLocaleString("ro-RO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lei`;
}

/** „1 produs", „7 produse", „20 de produse". */
function cate(n: number, unul: string, multe: string): string {
  if (n === 1) return `1 ${unul}`;
  const r = n % 100;
  return `${n.toLocaleString("ro-RO")}${n !== 0 && (r === 0 || r >= 20) ? " de" : ""} ${multe}`;
}

export async function generateStaticParams() {
  const data = loadData();
  return data.categorii.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = loadData();
  const cat = data.categorii.find(c => c.slug === slug);
  if (!cat) return { title: "Pagina negasita | AmCupon.ro" };

  const pretMinim = Math.min(...cat.produse.map(p => p.pret_de_la));
  const scorMax   = Math.max(...cat.produse.map(p => p.scor_total));
  const pageUrl   = `https://amcupon.ro/top/${slug}`;

  return {
    // 23.09.2026: era „Top 5 Modele Testate" pe toate cele 30 de pagini. Nimeni nu testeaza
    // produsele — pretentia a fost scoasa din PAGINA pe 10.08 (fix_top_onestitate.py), dar
    // ramasese in <title>, adica exact in rezultatul Google. Si toate treceau de 60 de caractere.
    title: (() => {
      const baza = `${cat.titlu} — top ${cat.produse.length} comparate`;
      if (`${baza} | AmCupon.ro`.length <= 60) return `${baza} | AmCupon.ro`;
      if (baza.length <= 60) return baza;
      return cat.titlu.length <= 60 ? cat.titlu : cat.titlu.slice(0, 60).replace(/\s+\S*$/, "");
    })(),
    // NEATINS pe 05.10.2026, desi „Preturi de la X lei" e pretul de referinta din mai–iunie si
    // „actualizat" e data rularii: title/description raman decizia lui Alex (SEO). Vezi CLAUDE.md.
    description: `${cat.descriere} Preturi de la ${pretMinim.toLocaleString("ro-RO")} lei. Scor maxim: ${scorMax}/10. Ghid de cumparare actualizat ${data.updated}.`,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${cat.titlu} | AmCupon.ro`,
      description: cat.descriere,
      url: pageUrl,
      siteName: "AmCupon.ro",
      locale: "ro_RO",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.titlu} | AmCupon.ro`,
      description: cat.descriere,
    },
  };
}

export default async function TopCategoriePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = loadData();
  const cat = data.categorii.find(c => c.slug === slug);
  if (!cat) notFound();

  const an = new Date().getFullYear();
  const gradient = HERO_BG;
  const numeTema = numeInFraza(slug, cat.titlu_scurt);

  // ── Magazinele din topul editorial: DOAR partenerii, cu linkul platit de azi ──
  // 05.10.2026: butonul principal era eMAG printr-un link Profitshare (cont respins si
  // retea exclusa pe 19.08 — clicul nu plateste), iar altex/flanco/pcgarage/douglas si
  // inca 9 duceau la /cod-reducere/<magazin>, care nu exista: 404 pe paginile cu trafic.
  // Pretul de atunci al magazinului nu se mai afiseaza pe buton (e din mai–iunie).
  const linkuri = linkuriPlatite();
  const produse: Produs[] = cat.produse.map(p => ({
    ...p,
    magazine: p.magazine
      .filter(m => linkuri.has(m.magazin_slug))
      .map(m => ({ ...m, url_afiliat: linkuri.get(m.magazin_slug) as string })),
  }));

  // ── Ofertele de azi din feed-ul partenerilor (lib/topFeed.ts) ──
  const sectiune: SectiuneTema | null = sectiunePentru(slug);
  const actualizat = dataFeed();
  const ieftin = sectiune ? sectiune.game[0]?.produse[0] : undefined;
  const ceaMaiIeftinaMag = sectiune
    ? [...sectiune.magazine].sort((a, b) => a.min - b.min)[0]
    : undefined;

  const pretMinim = Math.min(...cat.produse.map(p => p.pret_de_la));
  const pretMaxim = Math.max(...cat.produse.map(p => p.pret_de_la));
  const scorMediu = (
    cat.produse.reduce((a, p) => a + p.scor_total, 0) / cat.produse.length
  ).toFixed(1);

  const bestPick = produse.find(p => p.badge === "Alegerea Redactiei") || produse[0];

  // JSON-LD: ItemList schema
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: cat.titlu,
    description: cat.descriere,
    url: `https://amcupon.ro/top/${slug}`,
    numberOfItems: cat.produse.length,
    itemListElement: cat.produse.map(p => ({
      "@type": "ListItem",
      position: p.pozitie,
      name: p.nume,
      description: p.verdict_scurt,
      url: `https://amcupon.ro/top/${slug}#${p.pozitie}`,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "AmCupon.ro", item: "https://amcupon.ro" },
      { "@type": "ListItem", position: 2, name: "Top Produse", item: "https://amcupon.ro/top" },
      { "@type": "ListItem", position: 3, name: cat.titlu, item: `https://amcupon.ro/top/${slug}` },
    ],
  };

  // Intrebarile frecvente — aceeasi lista pentru textul vizibil SI pentru FAQPage.
  // 05.10.2026: doua raspunsuri afirmau „modele testate de noi" / „testate si verificate de
  // echipa AmCupon.ro", iar al cincilea „preturile si disponibilitatea sunt verificate
  // saptamanal". Nimic din toate astea nu se intampla. Raspunsurile sunt acum generate din
  // date: se schimba singure cu feed-ul si nu pot ramane false.
  // Intrebarile se potrivesc gramatical cu un plural nearticulat („Cat costa laptopuri"
  // si „cel mai bun laptopuri" erau intrebarile vechi, generate din eticheta temei).
  const intrebari: { i: string; r: string }[] = [
    {
      i: `Ce recomandă AmCupon.ro la ${numeTema} în ${an}?`,
      r: bestPick
        ? `Alegerea redacției este ${bestPick.nume}. ${bestPick.verdict_detaliat}`
        : cat.descriere,
    },
    {
      i: `Unde găsești ${numeTema} mai ieftin în România?`,
      r: sectiune && ieftin && ceaMaiIeftinaMag
        ? `La magazinele partenere AmCupon, cel mai mic preț de azi este ${pret(sectiune.min)}, la ${numeAfisat(ceaMaiIeftinaMag.slug)}. Am găsit ${cate(sectiune.total, "produs", "produse")} în ${cate(sectiune.magazine.length, "magazin", "magazine")}; cele mai multe sunt la ${numeAfisat(sectiune.magazine[0].slug)} (${sectiune.magazine[0].nr}). Lista, cu prețurile de azi, e mai sus pe pagină.`
        : `Nu avem încă un magazin partener cu ${numeTema} în feed. Prețurile din top sunt de referință, notate în ${SELECTIE}; verifică prețul actual direct în magazin.`,
    },
    {
      i: `La ce prețuri găsești ${numeTema} în România?`,
      r: sectiune
        ? `La magazinele partenere, azi, prețurile merg de la ${pret(sectiune.min)} la ${pret(sectiune.max)}, iar prețul median este ${pret(sectiune.median)} (din ${cate(sectiune.total, "produs", "produse")}). Modelele din topul editorial aveau, la selecție, prețuri între ${pretMinim.toLocaleString("ro-RO")} și ${pretMaxim.toLocaleString("ro-RO")} lei.`
        : `Modelele din topul editorial aveau, la selecție (${SELECTIE}), prețuri între ${pretMinim.toLocaleString("ro-RO")} și ${pretMaxim.toLocaleString("ro-RO")} lei. Prețul de azi poate fi diferit.`,
    },
    {
      i: `Ce să verifici înainte să cumperi ${numeTema}?`,
      r: `Specificațiile tehnice, recenziile cumpărătorilor, garanția și politica de retur. Scorurile din top sunt evaluarea noastră pe specificații și prețuri publice, nu rezultatul unui test fizic.`,
    },
    {
      i: `Este actualizat topul de ${numeTema}?`,
      r: sectiune
        ? `Prețurile din secțiunea cu oferte de la magazinele partenere se actualizează automat de mai multe ori pe zi; ultima actualizare: ${actualizat}. Selecția editorială a modelelor este din ${SELECTIE}.`
        : `Selecția editorială a modelelor și prețurile de referință sunt din ${SELECTIE}. Nu avem încă oferte de la magazinele partenere pentru ${numeTema}.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: intrebari.map(q => ({
      "@type": "Question",
      name: q.i,
      acceptedAnswer: { "@type": "Answer", text: q.r },
    })),
  };

  // Magazinele partenere din topul editorial, pentru linkurile catre paginile lor de coduri.
  const parteneriEditoriali = [...new Set(produse.flatMap(p => p.magazine.map(m => m.magazin_slug)))];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="min-h-screen bg-[#06080b] dark:bg-[#14181c]">
        {/* HERO */}
        <section className={`bg-gradient-to-br ${gradient} text-[#ffffff] border-b border-[#1f2329] py-10 px-4`}>
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <Link href="/top" className="text-slate-500 hover:text-[#ffffff] text-sm transition-colors">
                &larr; Top Produse
              </Link>
              {cat.tag && (
                <span className="bg-[#1f2329] text-[#ffffff] text-xs font-bold px-2.5 py-0.5 rounded-full ml-2">
                  {cat.tag}
                </span>
              )}
            </div>

            <div className="flex items-start gap-4 mb-6">
              <div className="text-5xl shrink-0">{cat.emoji}</div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black leading-tight mb-2">{cat.titlu}</h1>
                <p className="text-slate-500 text-base max-w-2xl">{cat.descriere}</p>
                {/* Metodologie explicita. Pana pe 10.08.2026 paginile scriau "Am analizat
                    20+ modele" / "testate in bucatarie" — o testare care nu a avut loc
                    niciodata. Scorurile sunt evaluare EDITORIALA pe date publice, si spunem
                    asta direct, in loc sa lasam cititorul sa creada ca sunt masuratori. */}
                <p className="text-xs text-slate-500/80 max-w-2xl mt-2 leading-relaxed">
                  Selecție editorială pe baza specificațiilor și prețurilor publice, din {SELECTIE}. Scorurile
                  sunt evaluarea noastră, nu rezultate de laborator, iar prețurile din top sunt de referință,
                  notate la selecție. Linkurile către magazine sunt afiliate — prețul tău rămâne același.
                </p>
                {sectiune && (
                  <Link
                    href="#unde-cumperi"
                    className="inline-flex items-center gap-2 mt-4 bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    Prețurile de azi la magazinele partenere &darr;
                  </Link>
                )}
              </div>
            </div>

            {/* STATS BAR — fiecare cifra spune de unde e: top editorial sau feed-ul de azi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {[
                { val: `${cat.produse.length}`, label: "Modele comparate" },
                { val: scorMediu, label: "Scor editorial mediu" },
                ...(sectiune
                  ? [
                      { val: `${sectiune.total}`, label: "Oferte azi la parteneri" },
                      { val: pret(sectiune.min), label: "Cel mai mic preț azi" },
                    ]
                  : [
                      { val: `${pretMinim.toLocaleString("ro-RO")}+ lei`, label: "Preț de referință" },
                      { val: SELECTIE, label: "Selecția modelelor" },
                    ]),
              ].map(s => (
                <div key={s.label} className="bg-[#1f2329] rounded-xl py-2.5 px-3">
                  <div className="text-base font-black">{s.val}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BEST PICK QUICK INFO */}
        {bestPick && (
          <div className="bg-[#14181c] dark:bg-[#1f2329] border-b border-[#1f2329] dark:border-[#2a2f36]">
            <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-[#c9ced5] dark:text-[#c9ced5]">
              <span className="font-semibold text-[#ffffff] dark:text-[#ffffff]">
                {cat.emoji} Recomandăm:
              </span>
              <span className="font-bold text-[#ddf93c]">{bestPick.nume}</span>
              <span>{bestPick.verdict_scurt}</span>
              <span className="ml-auto text-xs text-[#9399a0]">
                preț de referință ({SELECTIE}):{" "}
                <span className="font-black text-[#ddf93c] text-sm">{bestPick.pret_de_la.toLocaleString("ro-RO")} lei</span>
              </span>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <TopProduseClient produse={produse} culoare={cat.culoare} areSectiune={!!sectiune} selectie={SELECTIE} />

          {sectiune && <OferteParteneri sectiune={sectiune} numeTema={numeTema} actualizat={actualizat} />}

          {/* CUM AM FACUT TOPUL — pana pe 05.10.2026 aici scria „Cum testam" si „Fiecare produs
              este testat timp de minim 2 saptamani in conditii reale de utilizare". Niciun produs
              n-a fost testat. Sectiunea spune acum exact ce s-a facut. */}
          <section className="mt-10 bg-[#14181c] dark:bg-[#1f2329] border border-[#1f2329] dark:border-[#2a2f36] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#ffffff] dark:text-[#ffffff] mb-3">
              Cum am făcut topul de {numeTema}
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: "📋", titlu: "Selecție editorială", desc: `Modelele au fost alese în ${SELECTIE}, după specificațiile și prețurile publice. Nu le-am testat fizic.` },
                { icon: "⚖️", titlu: "Scoruri explicate", desc: "Scorurile sunt evaluarea noastră pe criteriile din tabel. Nu sunt măsurători de laborator și nu sunt plătite de producători." },
                {
                  icon: "🔄",
                  titlu: "Prețuri",
                  desc: sectiune
                    ? `Prețurile din top sunt de referință, din ${SELECTIE}. Ofertele de la magazinele partenere vin din feed-ul lor și se actualizează de mai multe ori pe zi.`
                    : `Prețurile din top sunt de referință, din ${SELECTIE}. Verifică prețul actual direct în magazin.`,
                },
              ].map(item => (
                <div key={item.titlu} className="text-center p-4">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h3 className="font-bold text-[#ffffff] dark:text-[#ffffff] text-sm mb-1">{item.titlu}</h3>
                  <p className="text-xs text-[#c9ced5] dark:text-[#c9ced5] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* INTERVAL DE PRETURI — doar fara sectiunea de oferte (acolo intervalul e cel de azi).
              Linkurile „Coduri X" duceau si la magazine care nu sunt pe site (404); acum doar partenerii. */}
          {!sectiune && (
            <section className="mt-6 bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
              <h3 className="font-bold text-[#ffffff] mb-2 text-sm">
                Interval de prețuri pentru {numeTema}
              </h3>
              <p className="text-sm text-[#c9ced5]">
                La selecție ({SELECTIE}), modelele din acest top costau între{" "}
                <strong className="text-[#c3dd2c]">{pretMinim.toLocaleString("ro-RO")} lei</strong> și{" "}
                <strong className="text-[#c3dd2c]">{pretMaxim.toLocaleString("ro-RO")} lei</strong>.
                Prețul de azi poate fi diferit.
              </p>
              {parteneriEditoriali.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {parteneriEditoriali.slice(0, 5).map(s => (
                    <Link key={s} href={`/cod-reducere/${s}`}
                      className="text-sm font-semibold text-[#c3dd2c] dark:text-[#ddf93c] hover:underline">
                      Coduri {numeAfisat(s)} &rarr;
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* FAQ */}
          <section className="mt-6 bg-[#14181c] dark:bg-[#1f2329] border border-[#1f2329] dark:border-[#2a2f36] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#ffffff] dark:text-[#ffffff] mb-4">
              Întrebări frecvente despre {numeTema}
            </h2>
            <div className="space-y-4">
              {intrebari.map((item, i) => (
                <details key={i} className="group border-b border-[#1f2329] dark:border-[#2a2f36] last:border-0 pb-4 last:pb-0">
                  <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-[#ffffff] dark:text-[#c9ced5] list-none select-none gap-2">
                    <span>{item.i}</span>
                    <span className="text-[#ddf93c] text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-[#c9ced5] dark:text-[#c9ced5] leading-relaxed">
                    {item.r}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* NEWSLETTER — „Primeste review-uri noi" si „1000+ magazine monitorizate" erau false:
              newsletterul trimite ofertele active, o data pe zi, iar pe site sunt sub 1.000 de magazine. */}
          <section className="mt-6 bg-[#14181c] dark:bg-[#06080b] rounded-xl p-6 text-center">
            <p className="text-[#ddf93c] text-xs font-black uppercase tracking-widest mb-2">Newsletter gratuit</p>
            <h3 className="text-xl font-black text-[#ffffff] mb-1">
              Ofertele active, pe email, o dată pe zi
            </h3>
            <p className="text-[#c9ced5] text-sm mb-5">
              Te dezabonezi oricând, dintr-un clic.
            </p>
            <Link href="/newsletter"
              className="inline-flex items-center gap-2 bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] font-bold px-6 py-3 rounded-xl text-sm transition-colors">
              Abonează-te gratuit &rarr;
            </Link>
          </section>
        </div>

        {/* OTHER CATEGORIES */}
        <div className="max-w-5xl mx-auto px-4 pb-12">
          <h3 className="text-base font-black text-[#c9ced5] dark:text-[#c9ced5] mb-4">
            Alte categorii recomandate
          </h3>
          <div className="flex flex-wrap gap-2">
            <Link href="/top" className="bg-[#14181c] dark:bg-[#1f2329] hover:bg-[#ddf93c]/10 dark:hover:bg-[#2a2f36] text-[#c9ced5] dark:text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl border border-[#1f2329] dark:border-[#3a4048] hover:border-[#c9ced5] transition-colors">
              Toate topurile &rarr;
            </Link>
            {[
              { href: "/gadgets",     label: "📡 Gadgets" },
              { href: "/electronice", label: "💻 Electronice" },
              { href: "/oferte-azi",  label: "🔥 Oferte de azi" },
              { href: "/blog",        label: "📖 Blog" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#14181c] dark:bg-[#1f2329] hover:bg-[#ddf93c]/10 dark:hover:bg-[#2a2f36] hover:text-[#c3dd2c] text-[#c9ced5] dark:text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl border border-[#1f2329] dark:border-[#3a4048] hover:border-[#c9ced5] transition-colors">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <footer className="border-t border-[#1f2329] dark:border-[#2a2f36] py-6 text-center text-xs text-[#9399a0]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
          {" · "}<Link href="/top" className="hover:text-[#ddf93c]">Top Produse</Link>
          {" · "}<Link href="/blog" className="hover:text-[#ddf93c]">Blog</Link>
        </footer>
      </div>
    </>
  );
}
