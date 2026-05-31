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
  title: "Reduceri Vacanțe & Călătorii 2026 — Bilete, Hotel, Troller | AmCupon.ro",
  description: "Coduri de reducere vacanțe și travel 2026: Booking, eMag Vacante, bilete avion, trollere Samsonite. Reduceri verificate pentru vacanță ieftină în România și Europa.",
  keywords: ["reduceri vacante", "cod reducere booking", "vacanta ieftina romania 2026", "bilete avion reducere", "hotel reducere", "troller reducere", "travel reducere romania"],
  alternates: { canonical: "https://amcupon.ro/calatorie" },
  openGraph: { title: "Reduceri Vacanțe & Călătorii 2026 | AmCupon.ro", url: "https://amcupon.ro/calatorie", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_TRAVEL = ["booking.com","airbnb.com","trip.com","rentalcars.com","samsonite.com","delsey.com"];
const CAT_TRAVEL = ["travel","calatorie","vacante","turism","tourism","luggage","transport"];
const DESTINATII = [
  { emoji: "🏔️", label: "Munte Romania", desc: "Bucegi, Retezat, Apuseni" },
  { emoji: "🌊", label: "Litoral Romania", desc: "Mamaia, Vama Veche, Neptun" },
  { emoji: "🌿", label: "Delta Dunării", desc: "Natură sălbatică unică" },
  { emoji: "🏙️", label: "City Break", desc: "Sibiu, Cluj, Brașov, București" },
  { emoji: "✈️", label: "Europa", desc: "Roma, Paris, Viena, Praga" },
  { emoji: "🏖️", label: "Mediterana", desc: "Grecia, Turcia, Spania" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-sky-500","bg-blue-500","bg-cyan-500","bg-teal-500","bg-indigo-500","bg-violet-500"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Reduceri Vacanțe & Călătorii 2026","url":"https://amcupon.ro/calatorie" };

export default function CalatoriePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topTravel = TOP_TRAVEL.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restTravel = all.filter(m =>
    !TOP_TRAVEL.includes(m.magazin) && m.are_promotie &&
    CAT_TRAVEL.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 12);
  const magazine = [...topTravel, ...restTravel];
  const cuPromo = magazine.filter(m => m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/" className="flex items-center gap-1.5 shrink-0">
              <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
              <span className="font-black text-gray-900 text-xl">Cupon</span>
              <span className="text-orange-500 font-black text-xl">.ro</span>
            </a>
          </div>
        </header>
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <a href="/" className="hover:text-orange-500">Acasă</a>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Vacanțe & Călătorii</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-400 text-white py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">✈️</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Vacanțe & Călătorii cu Reducere {an}</h1>
            <p className="text-sky-100 text-lg mb-6 max-w-xl mx-auto">
              Reduceri la cazare, bilete avion, trollere, accesorii travel — planifică vacanța perfectă mai ieftin
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Cazare hotel","Bilete avion","Trollere","Car rental","Excursii","Travel gear"].map(c => (
                <span key={c} className="bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/30">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* DESTINATII */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Destinații populare {an}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DESTINATII.map(d => (
              <a key={d.label} href="/blog/vacanta-ieftina-romania-2026"
                className="bg-sky-50 border border-sky-100 rounded-2xl p-5 hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{d.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{d.label}</h3>
                <p className="text-xs text-gray-500 mb-3">{d.desc}</p>
                <p className="text-xs font-bold text-sky-500 group-hover:text-sky-600">Ghid & reduceri →</p>
              </a>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-gray-900">Parteneri travel cu reduceri active</h2>
          </div>
          {magazine.length === 0 ? (
            <div className="text-center py-10 bg-sky-50 rounded-2xl">
              <p className="text-2xl mb-3">🌍</p>
              <p className="text-gray-600 font-medium mb-2">Explorează articolele noastre travel</p>
              <p className="text-gray-500 text-sm mb-4">Ghiduri de destinații, sfaturi economii, itinerarii România și Europa</p>
              <a href="/blog" className="inline-block bg-sky-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors">
                Citește ghiduri travel →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI[i % CULORI.length];
                const promo = m.promotii[0];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-white border border-gray-200 hover:border-sky-300 rounded-2xl p-4 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      {m.logo_url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                          {nume[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{nume}</p>
                        {m.are_promotie && m.cod_cupon && <span className="text-xs text-orange-500 font-bold">COD</span>}
                        {m.are_promotie && !m.cod_cupon && <span className="text-xs text-green-500 font-medium">Ofertă</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                    ) : (
                      <p className="text-gray-400 text-xs italic">Verifică ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-sky-500 font-semibold group-hover:text-sky-600">Vezi →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        <NisaProduse
          merchantSlugs={["booking.com","airbnb.com","trip.com","samsonite.com","delsey.com"]}
          titlu="Accesorii travel & bagaje cu reducere"
          culoareAccent="sky"
          limit={12}
        />

        {/* SEO */}
        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Sfaturi pentru vacanță mai ieftină</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cum găsești cazarea cea mai ieftină</h3>
                <p>Rezervă cu 2-3 luni avans pentru prețuri cu 20-40% mai mici. Booking.com și Airbnb oferă reduceri frecvente pentru rezervări cu anulare gratuită. Compară întotdeauna cu prețul de rezervare directă la hotel.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Top destinații România pentru vacanță ieftină {an}</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Apuseni</strong> — natură superb ă, prețuri mici, turism rural autentic</li>
                  <li><strong>Sibiu</strong> — city break cultural, medieval, Transfăgărășanul la 30 minute</li>
                  <li><strong>Vama Veche</strong> — alternativă boémă la Mamaia, prețuri mai mici</li>
                  <li><strong>Delta Dunării</strong> — experiență unică, accesibilă din Tulcea</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/top-reduceri", label: "🏆 Top Reduceri" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 hover:border-orange-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          © {an} AmCupon.ro ·{" "}
          <a href="/blog" className="hover:text-orange-500">Blog</a>{" · "}
          <a href="/categorii" className="hover:text-orange-500">Categorii</a>{" · "}
          <a href="/" className="hover:text-orange-500">Acasă</a>
        </footer>
      </div>
    </>
  );
}
