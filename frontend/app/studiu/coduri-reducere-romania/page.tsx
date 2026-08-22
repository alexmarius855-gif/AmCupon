import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

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
}

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
    ? `Doar ${s.cu_cod_real} din ${s.total_magazine} magazine au cod de reducere`
    : "Studiu: codurile de reducere in Romania";
  return {
    title: `${titlu} | AmCupon.ro`,
    description: s
      ? `Studiu pe ${s.total_magazine} de magazine online romanesti: doar ${s.cu_cod_real} au cod de reducere activ, ${s.cu_promotie} au promotii fara cod. Reduceri mediane pe categorii, date actualizate ${s.generat}.`
      : "Studiu pe magazinele online romanesti: cate au cu adevarat coduri de reducere active.",
    keywords: [
      "studiu coduri reducere romania", "cate magazine au cupoane", "reduceri online romania date",
      "e-commerce romania statistici", "cod reducere romania studiu",
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
      <div className="min-h-screen bg-[#06080b] flex items-center justify-center px-4">
        <p className="text-[#c9ced5]">
          Datele studiului se regenereaza. Revino in cateva minute sau vezi{" "}
          <Link href="/" className="text-[#ddf93c] font-semibold hover:text-[#c3dd2c]">pagina principala</Link>.
        </p>
      </div>
    );
  }

  const cuMediana = s.categorii.filter((c) => c.reducere_mediana !== null);
  const faraMediana = s.categorii.filter((c) => c.reducere_mediana === null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        name: "Coduri de reducere active in magazinele online din Romania",
        description: `Masuratoare pe ${s.total_magazine} de magazine online romanesti: cate au promotii active si cate au cod de reducere real, cu reduceri mediane pe categorie.`,
        url: URL_PAGINA,
        license: "https://creativecommons.org/licenses/by/4.0/",
        creator: { "@type": "Organization", name: "AmCupon.ro", url: "https://amcupon.ro" },
        dateModified: s.generat,
        distribution: [{
          "@type": "DataDownload",
          encodingFormat: "application/json",
          contentUrl: "https://amcupon.ro/studiu-cupoane.json",
        }],
        spatialCoverage: { "@type": "Country", name: "Romania" },
      },
      {
        "@type": "Article",
        headline: `Doar ${s.cu_cod_real} din ${s.total_magazine} de magazine online romanesti au cod de reducere activ`,
        datePublished: s.generat,
        dateModified: s.generat,
        author: { "@type": "Organization", name: "AmCupon.ro" },
        publisher: { "@type": "Organization", name: "AmCupon.ro" },
        mainEntityOfPage: URL_PAGINA,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasa", item: "https://amcupon.ro" },
          { "@type": "ListItem", position: 2, name: "Studiu coduri de reducere", item: URL_PAGINA },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#06080b]">

        <nav className="bg-[#06080b] border-b border-[#1f2329]">
          <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
            <Link href="/" className="hover:text-[#ddf93c]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c9ced5] font-medium">Studiu: coduri de reducere</span>
          </div>
        </nav>

        {/* ── Teza ─────────────────────────────────────────────────────────── */}
        <header className="max-w-3xl mx-auto px-4 pt-12 pb-8">
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#9399a0] mb-5">
            Date proprii &middot; actualizat {s.generat}
          </p>
          <h1 className="text-3xl md:text-[2.6rem] font-black text-[#ffffff] leading-[1.12] mb-6">
            Doar {s.cu_cod_real} din {s.total_magazine.toLocaleString("ro-RO")} de magazine online
            romanesti au azi un cod de reducere real
          </h1>
          <p className="text-[#c9ced5] text-lg leading-relaxed">
            Urmarim automat promotiile din {s.total_magazine.toLocaleString("ro-RO")} de magazine
            care vand in Romania. Am numarat cate au cu adevarat un cod de cupon activ, si cate
            doar par sa aiba. Rezultatul nu ne avantajeaza: administram un site de cupoane.
          </p>
        </header>

        {/* ── Cifrele ──────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { cifra: s.total_magazine.toLocaleString("ro-RO"), eticheta: "magazine urmarite", accent: false },
              { cifra: `${s.cu_promotie}`, eticheta: `cu promotie activa (${s.procent_cu_promotie}%)`, accent: false },
              { cifra: `${s.cu_cod_real}`, eticheta: `cu cod de cupon real (${s.procent_cu_cod}%)`, accent: true },
            ].map((x) => (
              <div key={x.eticheta}
                className={`rounded-xl p-5 border ${x.accent
                  ? "bg-[#1f2329] border-[#ddf93c]/40"
                  : "bg-[#14181c] border-[#1f2329]"}`}>
                <div className={`text-4xl font-black leading-none mb-2 ${x.accent ? "text-[#ddf93c]" : "text-[#ffffff]"}`}>
                  {x.cifra}
                </div>
                <div className="text-xs text-[#9399a0] leading-snug">{x.eticheta}</div>
              </div>
            ))}
          </div>

          <p className="text-[#c9ced5] mt-6 leading-relaxed">
            Diferenta conteaza pentru cumparator: <strong className="text-[#ffffff]">{s.doar_oferta} magazine</strong>{" "}
            au reduceri active, dar afisate direct in pret, fara cod de introdus la finalizarea
            comenzii. Doar <strong className="text-[#ffffff]">{s.cu_cod_real}</strong>{" "}cer un cod.
            Cine cauta &quot;cod reducere X&quot; pe Google gaseste, in marea majoritate a cazurilor,
            pagini care promit un cod ce nu exista.
          </p>
        </section>

        {/* ── Reduceri pe categorie ────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[#ffffff] mb-2">Cat de mari sunt reducerile, pe categorii</h2>
          <p className="text-sm text-[#9399a0] mb-5">
            Procentele sunt extrase din textul promotiilor, asa cum l-au scris magazinele.
            Publicam mediana doar unde avem cel putin {s.prag_esantion} magazine care declara
            un procent &mdash; sub atat, o mediana ar fi zgomot prezentat ca masuratoare.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#1f2329]">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-[#14181c] text-[#9399a0] text-[11px] uppercase tracking-wider">
                  <th className="text-left font-bold px-4 py-3">Categorie</th>
                  <th className="text-right font-bold px-4 py-3">Magazine</th>
                  <th className="text-right font-bold px-4 py-3">Cu promotie</th>
                  <th className="text-right font-bold px-4 py-3">Reducere mediana</th>
                  <th className="text-right font-bold px-4 py-3">Cea mai mare</th>
                </tr>
              </thead>
              <tbody>
                {cuMediana.map((c) => (
                  <tr key={c.slug} className="border-t border-[#1f2329]">
                    <td className="px-4 py-3">
                      <Link href={`/categorii/${c.slug}`} className="text-[#ffffff] font-semibold hover:text-[#ddf93c]">
                        {c.nume}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-[#c9ced5] tabular-nums">{c.magazine}</td>
                    <td className="px-4 py-3 text-right text-[#c9ced5] tabular-nums">{c.cu_promotie}</td>
                    <td className="px-4 py-3 text-right font-black text-[#ddf93c] tabular-nums">{String(c.reducere_mediana).replace(".", ",")}%</td>
                    <td className="px-4 py-3 text-right text-[#c9ced5] tabular-nums">{c.reducere_max}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {faraMediana.length > 0 && (
            <p className="text-xs text-[#9399a0] mt-4 leading-relaxed">
              <strong className="text-[#c9ced5]">Date insuficiente</strong> pentru inca{" "}
              {faraMediana.length} categorii ({faraMediana.map((c) => c.nume).join(", ")}) &mdash;
              prea putine magazine declara un procent ca sa putem publica o mediana onesta.
              Le listam ca sa se vada ce NU stim, nu doar ce stim.
            </p>
          )}
        </section>

        {/* ── Metoda ───────────────────────────────────────────────────────── */}
        <section className="bg-[#14181c] border-y border-[#1f2329] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">Cum am masurat</h2>
            <div className="space-y-4 text-sm text-[#c9ced5] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Sursa datelor</h3>
                <p>
                  Magazinele si promotiile vin din retelele de afiliere in care AmCupon.ro e partener:{" "}
                  {s.retele.join(", ")}. Datele se reimprospateaza automat de trei ori pe zi.
                  Cifrele de pe aceasta pagina sunt cele de la {s.generat}.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Ce inseamna &quot;cod real&quot;</h3>
                <p>
                  O promotie activa care contine un cod de cupon nevid, adica un text pe care
                  cumparatorul chiar il introduce la finalizarea comenzii. Promotiile cu reducere
                  aplicata direct in pret sunt numarate separat, ca oferte fara cod.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Limitele acestei masuratori</h3>
                <p>
                  Acopera magazinele accesibile prin retelele de mai sus si codurile publice
                  distribuite acolo. Un magazin care trimite coduri <strong className="text-[#ffffff]">doar
                  pe newsletter, in aplicatie sau catre clienti individuali</strong>{" "}nu apare in
                  aceste cifre. Nu masuram tot comertul online romanesc, ci partea lui vizibila
                  prin afiliere &mdash; care e, totusi, exact partea pe care o vede oricine cauta
                  un cod de reducere pe Google.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#ffffff] mb-1">Ce nu publicam</h3>
                <p>
                  Comisioanele noastre de afiliere. Sunt ce castigam noi dintr-o vanzare, nu o
                  masura a pietei sau a ofertei pentru cumparator.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Date deschise ────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 py-10">
          <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#ffffff] mb-2">Datele brute, libere de folosit</h2>
            <p className="text-sm text-[#c9ced5] mb-4 leading-relaxed">
              Cifrele complete, inclusiv categoriile cu esantion prea mic, sunt publice in format
              JSON. Se pot prelua si verifica de oricine. Daca le folosesti intr-un articol, te
              rugam sa citezi AmCupon.ro ca sursa.
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="/studiu-cupoane.json"
                className="inline-block bg-[#ddf93c] text-[#0c1000] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#c3dd2c] transition-colors">
                Descarca datele (JSON)
              </a>
              <Link href="/contact"
                className="inline-block bg-[#1f2329] text-[#ffffff] font-bold text-sm px-5 py-2.5 rounded-xl border border-[#2a2f36] hover:border-[#c9ced5] transition-colors">
                Intreaba despre metodologie
              </Link>
            </div>
          </div>
        </section>

        {/* ── Legaturi interne ─────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-4 pb-10">
          <h2 className="text-base font-black text-[#c9ced5] mb-4">Vezi si</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/oferte-azi", label: "Ofertele de azi" },
              { href: "/toate-magazinele", label: "Toate magazinele" },
              { href: "/categorii", label: "Categorii" },
              { href: "/radar", label: "Radar zilnic" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="bg-[#14181c] hover:bg-[#1f2329] hover:text-[#c3dd2c] text-[#c9ced5] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1f2329] hover:border-[#c9ced5]">
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0]">
          &copy; {an} AmCupon.ro &middot; Studiu actualizat automat la fiecare rulare a datelor
        </footer>
      </div>
    </>
  );
}
