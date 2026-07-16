import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Idei de Cadouri 2026 — Reduceri la Cadouri Online | AmCupon.ro",
  description: "Idei de cadouri pentru orice ocazie: ziua de naștere, aniversare, Crăciun, Valentine's Day. Coduri de reducere verificate la jucării, fashion, beauty, electronice și bijuterii.",
  keywords: ["idei cadouri", "cadouri reducere", "cadou ziua nasterii", "cadou craciun", "cadouri online ieftine", "voucher cadou romania", "cod reducere cadouri"],
  alternates: { canonical: "https://amcupon.ro/idei-cadouri" },
  openGraph: { title: "Idei Cadouri cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/idei-cadouri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_CADOURI = [
  "noriel.ro","fashiondays.ro","notino.ro","elefant.ro",
  "libris.ro","emag.ro","floria.ro","answear.ro","zchocolat.com",
];
const CAT_CADOURI = ["toys","gifts","flower","beauty","fashion","jewelry","books","kids"];

const OCAZII = [
  { emoji:"🎂", label:"Ziua de naștere", culoare:"bg-[#14b8a6] text-[#0f766e]" },
  { emoji:"💕", label:"Valentine's Day", culoare:"bg-red-100 text-red-700" },
  { emoji:"🎄", label:"Crăciun", href:"/craciun", culoare:"bg-green-100 text-[#0f766e]" },
  { emoji:"👩", label:"8 Martie", culoare:"bg-[#14b8a6] text-[#0f766e]" },
  { emoji:"🐣", label:"Paște", culoare:"bg-yellow-100 text-[#0f766e]" },
  { emoji:"👫", label:"Aniversare", culoare:"bg-[#14b8a6] text-[#0f766e]" },
  { emoji:"🎓", label:"Absolvire", culoare:"bg-[#14b8a6] text-[#0f766e]" },
  { emoji:"🏡", label:"Inaugurare casă", culoare:"bg-emerald-100 text-[#0f766e]" },
];

const IDEI_PER_PROFIL = [
  {
    profil: "👩 Cadouri pentru ea", culoare: "bg-[#111827] border-[#14b8a6]",
    idei: ["Parfumuri & Cosmetice → Notino", "Haine & Accesorii → FashionDays", "Bijuterii → Bijuteria.ro", "Carte preferată → Elefant"],
    link: "/categorii/beauty",
  },
  {
    profil: "👨 Cadouri pentru el", culoare: "bg-[#111827] border-[#14b8a6]",
    idei: ["Gadget tech → eMAG", "Echipament sport → Decathlon", "Parfum masculin → Notino", "Carte business → Libris"],
    link: "/categorii/electronice",
  },
  {
    profil: "🧒 Cadouri pentru copii", culoare: "bg-[#111827] border-yellow-200",
    idei: ["Jucării educative → Noriel", "Cărți ilustrate → Elefant", "Jocuri de masă → eMAG", "Set creativ → Smyths"],
    link: "/categorii/copii",
  },
  {
    profil: "👴 Cadouri pentru părinți", culoare: "bg-[#111827] border-green-200",
    idei: ["Aparate electrocasnice → eMAG", "Cărți → Libris", "Îngrijire → Notino", "Accesorii casă → Dedeman"],
    link: "/categorii/casa-gradina",
  },
];

const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Idei Cadouri cu Reducere 2026","url":"https://amcupon.ro/idei-cadouri" };

export default function IdeiCadouriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topCadouri = TOP_CADOURI.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restCadouri = all.filter(m =>
    !TOP_CADOURI.includes(m.magazin) &&
    m.are_promotie &&
    CAT_CADOURI.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 20);
  const magazine = [...topCadouri, ...restCadouri];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#0a0f1a]">

        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1 text-gray-300">/</span>
            <span className="text-[#cbd5e1] font-medium">Idei Cadouri</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#f1f5f9] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🎁</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Idei de Cadouri {an}</h1>
            <p className="text-[#ccfbf1] text-lg mb-8 max-w-xl mx-auto">
              Cadoul perfect pentru orice ocazie, la prețuri reduse — jucării, fashion, beauty, electronice, cărți
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {OCAZII.map(o => (
                o.href ? (
                  <a key={o.label} href={o.href}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#f1f5f9] font-semibold text-sm px-4 py-2 rounded-full transition-colors border border-slate-200">
                    {o.emoji} {o.label}
                  </a>
                ) : (
                  <span key={o.label}
                    className="flex items-center gap-1.5 bg-slate-100 text-[#f1f5f9] font-semibold text-sm px-4 py-2 rounded-full border border-slate-200">
                    {o.emoji} {o.label}
                  </span>
                )
              ))}
            </div>
          </div>
        </section>

        {/* IDEI PER PROFIL */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#f1f5f9] mb-6 text-center">Cadouri după persoană</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {IDEI_PER_PROFIL.map(p => (
              <a key={p.profil} href={p.link}
                className={`${p.culoare} rounded-xl p-5 border hover:shadow-md transition-all group`}>
                <h3 className="font-black text-[#f1f5f9] text-sm mb-3">{p.profil}</h3>
                <ul className="space-y-1.5">
                  {p.idei.map(i => (
                    <li key={i} className="text-xs text-[#cbd5e1] flex items-start gap-1.5">
                      <span className="text-[#94a3b8] mt-0.5 shrink-0">·</span>{i}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-bold text-[#0d9488] mt-3 group-hover:text-[#0f766e]">
                  Vezi reduceri →
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* MAGAZINE CU REDUCERI */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#f1f5f9]">Magazine cu reduceri la cadouri</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={["noriel.ro","fashiondays.ro","notino.ro","elefant.ro","libris.ro","emag.ro","floria.ro"]}
          catSlug="bijuterii"
          titlu="Idei cadouri populare cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO CONTENT */}
        <section className="bg-[#111827] border-t border-[#1e293b] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Ghid: Cum alegi cadoul perfect</h2>
            <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Cum economisești la cadouri online?</h3>
                <p>Folosește codurile de reducere de pe AmCupon.ro înainte de orice comandă. Poți economisi 5-30% din prețul final. Verificăm zilnic ofertele de la Noriel, FashionDays, Notino, Elefant și celelalte magazine partenere.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Când să cumperi cadourile?</h3>
                <p>Cel mai bun moment: Black Friday (noiembrie), perioadele de sale (ianuarie, iulie) sau cu 1-2 săptămâni înainte de ocazie. Evită cumpărăturile de urgență în ultimele zile — prețurile sunt mai mari și livrarea poate întârzia.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Cadouri care nu dau greș niciodată</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Parfumuri originale</strong> — Notino, Douglas (reduceri frecvente)</li>
                  <li><strong>Cărți</strong> — Elefant, Libris (pachete cu reducere)</li>
                  <li><strong>Jucării educative</strong> — Noriel (set LEGO, puzzle)</li>
                  <li><strong>Card cadou</strong> — eMAG, FashionDays (flexibil pentru oricine)</li>
                  <li><strong>Experiențe</strong> — SPA, escape room, curs (pe Groupon)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#cbd5e1] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/frumusete", label: "💄 Frumusete" },
              { href: "/parfumuri", label: "🌹 Parfumuri" },
              { href: "/carti", label: "📚 Carti" },
              { href: "/copii", label: "👶 Copii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#111827] hover:bg-[#1e293b] hover:text-[#0f766e] text-[#cbd5e1] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1e293b] hover:border-[#cbd5e1]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8] mt-4">
          © {an} AmCupon.ro · <Link href="/craciun" className="hover:text-[#0d9488]">Crăciun</Link>
          {" · "}<Link href="/black-friday" className="hover:text-[#0d9488]">Black Friday</Link>
          {" · "}<Link href="/gadgets" className="hover:text-[#0d9488]">Gadgets</Link>
        </footer>
      </div>
    </>
  );
}
