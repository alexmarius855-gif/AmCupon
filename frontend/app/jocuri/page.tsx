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
  title: "Cod Reducere Jocuri Video & Consola 2026 — PC, PS5, Xbox | AmCupon.ro",
  description: "Coduri de reducere jocuri video Romania: Altex, eMAG, Gaming Gear, PcGarage. Jocuri PC, PS5, Xbox, Nintendo Switch si console la preturi mici. Verificate zilnic.",
  keywords: ["cod reducere jocuri","reduceri jocuri video","ps5 ieftin","xbox reducere","jocuri pc reducere","console gaming romania","pcgarage cod cupon"],
  alternates: { canonical: "https://amcupon.ro/jocuri" },
  openGraph: { title: "Jocuri Video cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/jocuri", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_JOCURI = ["pcgarage.ro","evomag.ro","altex.ro","emag.ro","gamers.ro","gaming-gear.ro","nexus.ro","toysrus.ro"];
const CAT_JOCURI = ["game","gaming","joc","consol","playstation","xbox","nintendo","steam"];

const AVANTAJE = [
  { icon: "🎮", titlu: "Console Gaming", desc: "PS5, Xbox Series X/S, Nintendo Switch — console noi si bundle-uri speciale" },
  { icon: "🕹️", titlu: "Jocuri AAA", desc: "Titluri mari pe disc sau cod digital — FIFA, GTA, Call of Duty, Fortnite" },
  { icon: "💻", titlu: "Gaming PC", desc: "Placi video, procesoare, RAM, monitoare gaming 144Hz+" },
  { icon: "🎧", titlu: "Accesorii Gaming", desc: "Casti, mouse, tastatura mecanica, controller, scaun gaming" },
  { icon: "📦", titlu: "Bundle-uri Speciale", desc: "Consola + joc + controller extra — economii de 200-500 lei" },
  { icon: "🏆", titlu: "Jocuri Mobile", desc: "Carduri gift Google Play, App Store, coduri in-game" },
];

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" ");
}
const CULORI = ["bg-[#b8912e]","bg-[#b8912e]","bg-[#c9a63e]","bg-[#b8912e]","bg-[#b8912e]","bg-[#b8912e]"];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Jocuri Video cu Reducere 2026",
  "url": "https://amcupon.ro/jocuri",
  "description": "Coduri reducere jocuri video si console Romania — PS5, Xbox, Nintendo, PC gaming"
};

export default function JocuriPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topJocuri = TOP_JOCURI
    .map(s => all.find(m => m.magazin === s))
    .filter(Boolean) as Magazin[];

  const restJocuri = all.filter(m =>
    !TOP_JOCURI.includes(m.magazin) && m.are_promotie &&
    CAT_JOCURI.some(c =>
      (m.categorie_slug||"").includes(c) ||
      m.categorie.toLowerCase().includes(c) ||
      m.magazin.toLowerCase().includes(c)
    )
  ).slice(0, 10);

  const magazine = [...topJocuri, ...restJocuri];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[#0b0a07]">

        {/* Header */}

        {/* Breadcrumb */}
        <nav className="bg-[#0b0a07] border-b border-[#26211a]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#8c8064]">
            <Link href="/" className="hover:text-[#d8c091]">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-[#c8bda2] font-medium">Jocuri Video & Gaming</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#9c7a26] via-[#c9a63e] to-[#8a6a1e] text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🎮</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Jocuri Video cu Reducere {an}</h1>
            <p className="text-[#efe3c6] text-lg mb-6 max-w-xl mx-auto">
              Console, jocuri si accesorii gaming la preturi mici. PCGarage, evoMAG, Altex si alte magazine cu stocuri verificate zilnic.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["PS5","Xbox Series","Nintendo Switch","PC Gaming","Jocuri AAA","Accesorii","VR"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="bg-[#15120c] border-[#26211a] py-3 px-4">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-6 text-sm">
            <span className="text-[#e3d1a6] font-semibold">
              <span className="font-black text-[#d8c091]">{magazine.length}</span> magazine gaming
            </span>
            <span className="text-[#e3d1a6] font-semibold">
              <span className="font-black text-[#d8c091]">{cuPromo.length}</span> cu promotii active
            </span>
            <span className="text-[#e3d1a6] font-semibold">&#10003; Actualizat zilnic</span>
          </div>
        </div>

        {/* Avantaje */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-white mb-6 text-center">Ce gasesti la magazinele de gaming online</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVANTAJE.map(a => (
              <div key={a.titlu} className="bg-[#15120c] border border-[#26211a] rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-[#a89a78]">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-white mb-5">Magazine gaming cu reduceri active</h2>
          {magazine.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI[i % CULORI.length];
                const promo = m.promotii[0];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-[#15120c] border border-[#26211a] hover:border-[#c9a63e]/40 rounded-2xl p-4 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      {m.logo_url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#26211a] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                          {nume[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm">{nume}</p>
                        {m.are_promotie && m.cod_cupon && <span className="text-xs text-[#d8c091] font-bold">COD</span>}
                        {m.are_promotie && !m.cod_cupon && <span className="text-xs text-[#d8c091] font-medium">Oferta</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-[#a89a78] text-xs line-clamp-2">{promo.nume}</p>
                    ) : (
                      <p className="text-[#8c8064] text-xs italic">Verifica ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-[#d8c091] font-semibold group-hover:text-[#e3d1a6]">Vezi &rarr;</span>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#15120c] border border-[#26211a] rounded-2xl p-10 text-center">
              <p className="text-4xl mb-3">🎮</p>
              <p className="font-bold text-[#c8bda2] mb-2">Magazine actualizate zilnic</p>
              <p className="text-[#8c8064] text-sm mb-4">Revino curand pentru promotii la jocuri si gaming.</p>
              <Link href="/toate-magazinele" className="text-[#d8c091] font-bold hover:text-[#e3d1a6] text-sm">Toate magazinele &rarr;</Link>
            </div>
          )}
        </section>

        {/* Produse */}
        <NisaProduse
          merchantSlugs={["pcgarage.ro","evomag.ro","altex.ro","gamers.ro"]}
          catSlug="jocuri"
          titlu="Jocuri si accesorii gaming populare"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Editorial */}
        <section className="bg-[#15120c] border-t border-[#26211a] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-white mb-5">Ghid: Unde cumperi jocuri mai ieftin in Romania</h2>
            <div className="space-y-4 text-sm text-[#a89a78] leading-relaxed">
              <div>
                <h3 className="font-bold text-white mb-1">PCGarage vs evoMAG vs Altex pentru gaming</h3>
                <p>PCGarage are cele mai bune preturi la componente PC si accesorii gaming (placi video, procesoare). evoMAG ofera frecvent bundle-uri consola + joc la preturi sub piata. Altex are stocuri mari si livrare rapida pentru console si jocuri fizice.</p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Jocuri fizice vs digitale — ce e mai ieftin</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Jocuri noi (launch)</strong> — pretul e identic fizic/digital; fizic poate fi revandut</li>
                  <li><strong>Dupa 3-6 luni</strong> — reducerile digitale (PS Store, Xbox Game Pass) bat de obicei fizicul</li>
                  <li><strong>Game Pass / PS Plus</strong> — daca joci mult, abonamentul e cel mai ieftin</li>
                  <li><strong>Coduri de reducere retailer</strong> — PCGarage si evoMAG au frecvent -10-15% la lansari</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Cand apar cele mai mari reduceri la gaming</h3>
                <p>Black Friday (nov) are reduceri record la console si jocuri. Steam Summer Sale (iun-iul) si Winter Sale (dec-ian) pentru PC. PlayStation Store face frecvent flash sale-uri de weekend. Aboneaza-te la newsletter-ul PCGarage si evoMAG pentru alerte imediate.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal links */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-[#c8bda2] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "💻 Electronice & IT" },
              { href: "/gadgets",     label: "📱 Gadgets & Telefoane" },
              { href: "/copii",       label: "👶 Copii & Jucarii" },
              { href: "/carti",       label: "📚 Carti & Educatie" },
              { href: "/oferte-azi",  label: "🔥 Toate Ofertele de Azi" },
              { href: "/categorii",   label: "📂 Toate Categoriile" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#15120c] hover:bg-[#26211a] hover:text-[#e3d1a6] text-[#c8bda2] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#26211a] hover:border-[#e6d5a8]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#26211a] py-6 text-center text-xs text-[#8c8064] mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-[#d8c091]">Electronice</Link>{" · "}
          <Link href="/gadgets" className="hover:text-[#d8c091]">Gadgets</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#d8c091]">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
