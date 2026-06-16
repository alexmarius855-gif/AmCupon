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
  title: "Laptop Ieftin Romania 2026 — Coduri Reducere eMAG, Altex, PCGarage | AmCupon.ro",
  description: "Cele mai bune oferte laptopuri 2026: gaming, business, student. Reduceri verificate la eMAG, Altex, PCGarage, Flanco. Laptop sub 2000 lei, 3000 lei, 5000 lei.",
  keywords: ["laptop ieftin romania", "laptop gaming reducere", "laptop student ieftin", "cel mai bun laptop 2026", "laptop sub 3000 lei", "emag laptop reducere", "altex laptop promotie"],
  alternates: { canonical: "https://amcupon.ro/laptop" },
  openGraph: { title: "Laptop Ieftin Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/laptop", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_LAPTOP = ["emag.ro","altex.ro","pcgarage.ro","flanco.ro","evomag.ro","cel.ro","quickmobile.ro"];
const CAT_LAPTOP = ["electronics","electronice","laptop","it"];

const BUGETE = [
  { pret: "Sub 2.000 lei", emoji: "💰", desc: "Chromebook, student basic, navigare web", culoare: "bg-green-500" },
  { pret: "2.000 – 3.500 lei", emoji: "💻", desc: "Office, multitasking, student productivitate", culoare: "bg-blue-500" },
  { pret: "3.500 – 5.000 lei", emoji: "⚡", desc: "Laptop gaming entry, creatori continut", culoare: "bg-purple-500" },
  { pret: "Peste 5.000 lei", emoji: "🚀", desc: "Gaming high-end, workstation, MacBook", culoare: "bg-orange-500" },
];

const BRANDURI = [
  { brand: "ASUS", desc: "ROG (gaming), Zenbook (ultrabook), VivoBook (buget)" },
  { brand: "Lenovo", desc: "ThinkPad (business), Legion (gaming), IdeaPad (buget)" },
  { brand: "HP", desc: "Pavilion (buget), Spectre (premium), Omen (gaming)" },
  { brand: "Dell", desc: "XPS (ultrabook premium), Inspiron (buget), Alienware (gaming)" },
  { brand: "Acer", desc: "Nitro (gaming buget), Swift (ultrabook), Aspire (student)" },
  { brand: "Apple", desc: "MacBook Air M3 (eficienta), MacBook Pro (profesional)" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-blue-600","bg-orange-500","bg-purple-600","bg-red-500","bg-teal-500","bg-indigo-500","bg-green-600"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Laptop Ieftin Romania 2026","url":"https://amcupon.ro/laptop","description":"Oferte laptopuri Romania 2026 — gaming, business, student la preturi reduse" };

export default function LaptopPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topLaptop = TOP_LAPTOP.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restLaptop = all.filter(m =>
    !TOP_LAPTOP.includes(m.magazin) && m.are_promotie &&
    CAT_LAPTOP.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 8);
  const magazine = [...topLaptop, ...restLaptop];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-orange-500">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Laptop Ieftin</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 text-white py-14 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">💻</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Laptop Ieftin Romania {an}</h1>
            <p className="text-blue-200 text-lg mb-6 max-w-xl mx-auto">
              Gaming, business, student — cele mai bune oferte laptopuri cu reduceri verificate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Gaming","Student","Business","MacBook","Sub 3000 lei","Sub 5000 lei","Ultrabook"].map(c => (
                <span key={c} className="bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/25">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Alege laptopul dupa buget</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BUGETE.map(b => (
              <div key={b.pret} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${b.culoare} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                  {b.emoji}
                </div>
                <h3 className="font-black text-gray-900 text-base mb-1">{b.pret}</h3>
                <p className="text-xs text-gray-500">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-gray-900 mb-5">Magazine laptopuri cu reduceri active</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-green-500 font-medium">Oferta</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">Verifica ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-blue-600 font-semibold group-hover:text-blue-700">Vezi &rarr;</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["emag.ro","altex.ro","pcgarage.ro","flanco.ro","evomag.ro","cel.ro"]}
          catSlug="electronice"
          titlu="Laptopuri populare cu reducere"
          culoareAccent="blue"
          limit={12}
        />

        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Ce laptop sa cumperi in {an}</h2>
            <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Cele mai bune branduri laptop in {an}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRANDURI.map(b => (
                    <div key={b.brand} className="bg-white border border-gray-100 rounded-xl p-3">
                      <p className="font-bold text-gray-900 text-xs mb-1">{b.brand}</p>
                      <p className="text-xs text-gray-500">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Ce specificatii conteaza cu adevarat</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Procesor:</strong> Intel Core i5/i7 13th gen sau AMD Ryzen 5/7 7000 — ambele excelente</li>
                  <li><strong>RAM:</strong> minimum 16GB pentru confort real in {an} (8GB e deja insuficient)</li>
                  <li><strong>SSD:</strong> minimum 512GB NVMe — viteza de boot si aplicatii radical mai buna</li>
                  <li><strong>Display:</strong> IPS 1920x1080 minimum; daca lucrezi cu imagini, cauta 2K/OLED</li>
                  <li><strong>Baterie:</strong> 50+ Wh pentru o zi completa de lucru fara incarcator</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Cand sunt cele mai mari reduceri la laptopuri</h3>
                <p>Black Friday (noiembrie) si Zilele eMAG (mai, octombrie) aduc reduceri de 20-35% la laptopuri. Verifica codurile AmCupon pentru discount suplimentar de 5-10% aplicabil pe langa promotia activa.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/telefoane", label: "📲 Telefoane" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 hover:border-blue-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-orange-500">Electronice</Link>{" · "}
          <Link href="/gaming" className="hover:text-orange-500">Gaming</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-500">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
