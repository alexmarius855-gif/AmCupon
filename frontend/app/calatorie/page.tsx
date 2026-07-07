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
  title: "Reduceri Vacanțe & Călătorii 2026 — Bilete, Hotel, Troller | AmCupon.ro",
  description: "Coduri de reducere vacanțe și travel 2026: Booking, eMag Vacante, bilete avion, trollere Samsonite. Reduceri verificate pentru vacanță ieftină în România și Europa.",
  keywords: ["reduceri vacante", "cod reducere booking", "vacanta ieftina romania 2026", "bilete avion reducere", "hotel reducere", "troller reducere", "travel reducere romania"],
  alternates: { canonical: "https://amcupon.ro/calatorie" },
  openGraph: { title: "Reduceri Vacanțe & Călătorii 2026 | AmCupon.ro", url: "https://amcupon.ro/calatorie", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_TRAVEL = ["booking.com","airbnb.com","trip.com","rentalcars.com","samsonite.com","delsey.com"];
const PARTENERI_INTL = [
  { nume: "KKday", emoji: "🎟️", desc: "Excursii, tururi ghidate si activitati locale in Asia si nu numai — rezervare instanta.", url: "https://kkday.sjv.io/n4P9qx" },
  { nume: "Pelago by Singapore Airlines", emoji: "✈️", desc: "Experiente si excursii curate de Singapore Airlines — de la city tours la activitati exclusive.", url: "https://pelago.pxf.io/3kyVBv" },
];
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
const CULORI = ["bg-[#0d9488]","bg-[#0d9488]","bg-[#14b8a6]","bg-[#0d9488]","bg-[#14b8a6]","bg-[#0d9488]"];
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
      <div className="min-h-screen bg-[#F7F9FC]">
        <nav className="bg-[#F7F9FC] border-b border-[#e2e8f0]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#64748b]">
            <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
            <span className="mx-1">/</span>
            <span className="text-[#334155] font-medium">Vacanțe & Călătorii</span>
          </div>
        </nav>

        {/* HERO */}
        <section className="bg-gradient-to-br from-[#0f766e] via-[#14b8a6] to-[#0f766e] text-[#0f172a] py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">✈️</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Vacanțe & Călătorii cu Reducere {an}</h1>
            <p className="text-[#ccfbf1] text-lg mb-6 max-w-xl mx-auto">
              Reduceri la cazare, bilete avion, trollere, accesorii travel — planifică vacanța perfectă mai ieftin
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Cazare hotel","Bilete avion","Trollere","Car rental","Excursii","Travel gear"].map(c => (
                <span key={c} className="bg-slate-100 text-[#0f172a] text-sm font-semibold px-4 py-1.5 rounded-full border border-slate-200">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* DESTINATII */}
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-[#0f172a] mb-6 text-center">Destinații populare {an}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DESTINATII.map(d => (
              <a key={d.label} href="/blog/vacanta-ieftina-romania-2026"
                className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-5 hover:shadow-md transition-all group">
                <div className="text-3xl mb-2">{d.emoji}</div>
                <h3 className="font-bold text-[#0f172a] text-sm mb-1">{d.label}</h3>
                <p className="text-xs text-[#475569] mb-3">{d.desc}</p>
                <p className="text-xs font-bold text-[#14b8a6] group-hover:text-[#14b8a6]">Ghid & reduceri →</p>
              </a>
            ))}
          </div>
        </section>

        {/* MAGAZINE */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-5">
            
            <h2 className="text-xl font-black text-[#0f172a]">Parteneri travel cu reduceri active</h2>
          </div>
          {magazine.length === 0 ? (
            <div className="text-center py-10 bg-[#ffffff] rounded-xl">
              <p className="text-2xl mb-3">🌍</p>
              <p className="text-[#475569] font-medium mb-2">Explorează articolele noastre travel</p>
              <p className="text-[#475569] text-sm mb-4">Ghiduri de destinații, sfaturi economii, itinerarii România și Europa</p>
              <Link href="/blog" className="inline-block bg-[#0d9488] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#0d9488] transition-colors">
                Citește ghiduri travel →
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
                    className="group bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/40 rounded-xl p-4 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      {m.logo_url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-[#e2e8f0] shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-[#0f172a] font-black text-lg shrink-0`}>
                          {nume[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-[#0f172a] text-sm">{nume}</p>
                        {m.are_promotie && m.cod_cupon && <span className="text-xs text-[#0d9488] font-bold">COD</span>}
                        {m.are_promotie && !m.cod_cupon && <span className="text-xs text-[#0d9488] font-medium">Ofertă</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-[#475569] text-xs line-clamp-2">{promo.nume}</p>
                    ) : (
                      <p className="text-[#64748b] text-xs italic">Verifică ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-[#14b8a6] font-semibold group-hover:text-[#14b8a6]">Vezi →</span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </section>

        <NisaProduse
          merchantSlugs={["booking.com","airbnb.com","trip.com","samsonite.com","delsey.com"]}
          catSlug="calatorie"
          titlu="Accesorii travel & bagaje cu reducere"
          culoareAccent="sky"
          limit={12}
        />

        {/* Parteneri internationali (Impact.com) */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-[#0f172a] mb-5">Excursii & activitati internationale</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {PARTENERI_INTL.map(p => (
              <a key={p.nume} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                className="bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/40 rounded-xl p-5 transition-all hover:shadow-md flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="font-black text-[#0f172a]">{p.nume}</span>
                </div>
                <p className="text-[#475569] text-xs">{p.desc}</p>
                <p className="text-xs font-bold text-[#14b8a6] mt-1">Vezi oferte →</p>
              </a>
            ))}
          </div>
        </section>

        {/* SEO */}
        <section className="bg-[#ffffff] border-t border-[#e2e8f0] py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-[#0f172a] mb-5">Sfaturi pentru vacanță mai ieftină</h2>
            <div className="space-y-4 text-sm text-[#475569] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0f172a] mb-1">Cum găsești cazarea cea mai ieftină</h3>
                <p>Rezervă cu 2-3 luni avans pentru prețuri cu 20-40% mai mici. Booking.com și Airbnb oferă reduceri frecvente pentru rezervări cu anulare gratuită. Compară întotdeauna cu prețul de rezervare directă la hotel.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a] mb-1">Top destinații România pentru vacanță ieftină {an}</h3>
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
          <h2 className="text-base font-black text-[#334155] mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/esim", label: "📡 eSIM Calatorie" },
              { href: "/gadgets", label: "🎮 Gadgets" },
              { href: "/idei-cadouri", label: "🎁 Idei Cadouri" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/top-reduceri", label: "🏆 Top Reduceri" },
              { href: "/categorii", label: "📂 Categorii" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[#ffffff] hover:bg-[#e2e8f0] hover:text-[#0f766e] text-[#334155] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#e2e8f0] hover:border-[#e6d5a8]">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[#e2e8f0] py-6 text-center text-xs text-[#64748b] mt-4">
          © {an} AmCupon.ro ·{" "}
          <Link href="/blog" className="hover:text-[#0d9488]">Blog</Link>{" · "}
          <Link href="/categorii" className="hover:text-[#0d9488]">Categorii</Link>{" · "}
          <Link href="/" className="hover:text-[#0d9488]">Acasă</Link>
        </footer>
      </div>
    </>
  );
}
