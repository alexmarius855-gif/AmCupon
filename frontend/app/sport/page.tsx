import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Reduceri Sport & Fitness 2026 — Coduri Decathlon, Sportisimo | AmCupon.ro",
  description: "Coduri de reducere echipament sport și fitness 2026: Decathlon, Sportisimo, Sport Vision, Intersport. Biciclete, echipament sală, outdoor, running.",
  keywords: ["reduceri sport", "cod reducere decathlon", "echipament fitness ieftin", "bicicleta reducere", "sportisimo reducere", "sport outdoor reducere romania"],
  alternates: { canonical: "https://amcupon.ro/sport" },
  openGraph: { title: "Reduceri Sport & Fitness 2026 | AmCupon.ro", url: "https://amcupon.ro/sport", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SPORT = ["decathlon.ro","sportisimo.ro","sport-vision.ro","intersport.ro","hervis.ro","gigasport.ro"];
const CAT_SPORT = ["sport","outdoor","fitness","running","cycling","hiking","sports"];
const SUBCATEGORII = [
  { emoji: "🏃", label: "Running", href: "/categorii/sport" },
  { emoji: "🚴", label: "Ciclism", href: "/categorii/sport" },
  { emoji: "⛺", label: "Camping", href: "/categorii/sport" },
  { emoji: "🏋️", label: "Fitness & Sală", href: "/categorii/sport" },
  { emoji: "⚽", label: "Fotbal", href: "/categorii/sport" },
  { emoji: "🎿", label: "Ski & Iarnă", href: "/categorii/sport" },
  { emoji: "🏊", label: "Înot", href: "/categorii/sport" },
  { emoji: "🧗", label: "Hiking & Alpinism", href: "/categorii/sport" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-[#0d9488]","bg-[#0d9488]","bg-[#0d9488]","bg-[#0d9488]","bg-[#0d9488]","bg-[#0d9488]"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Sport & Fitness 2026","url":"https://amcupon.ro/sport" };

export default function SportPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSport = TOP_SPORT.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restSport = all.filter(m =>
    !TOP_SPORT.includes(m.magazin) && m.are_promotie &&
    CAT_SPORT.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 16);
  const magazine = [...topSport, ...restSport];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="bg-[#0a0f1a] border-b border-[#1e293b]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#94a3b8]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#cbd5e1] font-medium">Sport & Fitness</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#f1f5f9] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🏃</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Sport & Fitness cu Reducere {an}</h1>
            <p className="text-[#ccfbf1] text-lg mb-6 max-w-xl mx-auto">
              Echipament sport, biciclete, sală fitness — coduri de reducere verificate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUBCATEGORII.map(s => (
                <a key={s.label} href={s.href}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#f1f5f9] text-sm font-semibold px-4 py-1.5 rounded-full border border-slate-200 transition-colors">
                  {s.emoji} {s.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#f1f5f9]">Magazine sport cu reduceri active</h2>
          </div>
          {magazine.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#cbd5e1] mb-4">Momentan nu sunt magazine sport cu promoții active.</p>
              <Link href="/categorii/sport"
                className="inline-block bg-[#0d9488] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#14b8a6] transition-colors">
                Vezi echipament sport →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI[i % CULORI.length];
                const promo = m.promotii[0];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-[#111827] border border-[#1e293b] hover:border-[#0f766e] rounded-xl p-4 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      {m.logo_url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#ffffff] border border-[#1e293b] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-[#f1f5f9] font-black text-lg shrink-0`}>
                          {nume[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[#f1f5f9] text-sm">{nume}</p>
                        {m.are_promotie && m.cod_cupon && <span className="text-xs text-[#0d9488] font-bold">COD</span>}
                        {m.are_promotie && !m.cod_cupon && <span className="text-xs text-[#0d9488] font-medium">Ofertă</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-[#cbd5e1] text-xs line-clamp-2">{promo.nume}</p>
                    ) : (
                      <p className="text-[#94a3b8] text-xs italic">Verifică ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-[#0d9488] font-semibold group-hover:text-[#0f766e]">Vezi →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        <NisaProduse
          merchantSlugs={["decathlon.ro","sportisimo.ro","sport-vision.ro","intersport.ro","hervis.ro","gigasport.ro"]}
          catSlug="sport"
          titlu="Echipament sport popular cu reducere"
          culoareAccent="indigo"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-[#111827] border-t border-[#1e293b] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#f1f5f9] mb-5">Ghid: Echipament sport mai ieftin</h2>
            <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Cum economisești la echipament sport</h3>
                <p>Decathlon oferă cel mai bun raport calitate-preț pentru echipament entry-level cu brandurile proprii (Quechua, Domyos, Kipsta). Pentru echipament premium, caută reduceri la finalul sezonului — reduceri de 40-60% sunt frecvente în ianuarie și august.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Cele mai bune perioade pentru cumpărături sport</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Ianuarie</strong> — solduri de iarnă, reduceri echipament ski și fitness</li>
                  <li><strong>Iulie-August</strong> — solduri de vară, echipament outdoor, biciclete</li>
                  <li><strong>Black Friday</strong> — reduceri mari la electronice sport (ceasuri GPS, earbuds sport)</li>
                  <li><strong>Back to School</strong> — septembrie, echipament pentru activități sportive școlare</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#f1f5f9] mb-1">Echipament sport la cel mai mic preț</h3>
                <p>Combină prețul din ShopMania cu codul de reducere de pe AmCupon.ro. La echipament scump (biciclete, ceasuri GPS, căști sport), diferența poate ajunge la sute de lei.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#cbd5e1] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/farmacie", label: "💊 Farmacie" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/moto", label: "🚗 Auto-Moto" },
              { href: "/sanatate", label: "🌿 Sanatate" },
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
          © {an} AmCupon.ro ·{" "}
          <Link href="/moto" className="hover:text-[#0d9488]">Auto-Moto</Link>{" · "}
          <Link href="/gadgets" className="hover:text-[#0d9488]">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
