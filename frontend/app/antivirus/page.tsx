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
  title: "Antivirus Ieftin Romania 2026 — Cod Reducere Bitdefender, Norton, ESET | AmCupon.ro",
  description: "Coduri reducere antivirus 2026: Bitdefender, Norton, ESET, Kaspersky, Malwarebytes. Protectie PC, Mac, Android la preturi reduse cu pana la 70% discount.",
  keywords: ["antivirus ieftin romania", "cod reducere bitdefender", "norton reducere", "eset reducere", "kaspersky cod reducere", "antivirus 2026", "antivirus pc ieftin"],
  alternates: { canonical: "https://amcupon.ro/antivirus" },
  openGraph: { title: "Antivirus Ieftin Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/antivirus", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_ANTIVIRUS = ["bitdefender.com","norton.com","eset.com","kaspersky.com","malwarebytes.com","emag.ro","altex.ro"];
const CAT_AV = ["software","security","antivirus","tech"];
const TIPURI_PROTECTIE = [
  { emoji: "🛡️", titlu: "Antivirus PC & Mac", desc: "Protectie in timp real impotriva virusilor, ransomware, spyware" },
  { emoji: "📱", titlu: "Antivirus Android & iOS", desc: "Securitate mobila, anti-furt, VPN integrat" },
  { emoji: "👨‍👩‍👧", titlu: "Parental Control", desc: "Filtru continut, monitorizare timp ecran pentru copii" },
  { emoji: "🔐", titlu: "Password Manager", desc: "Stocare parole securizata, autentificare biometrica" },
  { emoji: "🌐", titlu: "VPN inclus", desc: "Navigare anonima, acces continut restrictionat geografic" },
  { emoji: "🔍", titlu: "Dark Web Monitor", desc: "Alerte cand datele tale apar in breach-uri" },
];

const COMPARATIV = [
  { brand: "Bitdefender", nota: "9.8/10", pret: "de la 45 lei/an", highlight: "Cel mai bun detectie malware", culoare: "bg-red-500" },
  { brand: "Norton 360", nota: "9.5/10", pret: "de la 59 lei/an", highlight: "VPN nelimitat inclus", culoare: "bg-yellow-500" },
  { brand: "ESET NOD32", nota: "9.3/10", pret: "de la 39 lei/an", highlight: "Cel mai usor pe sistem", culoare: "bg-blue-500" },
  { brand: "Kaspersky", nota: "9.1/10", pret: "de la 49 lei/an", highlight: "Protectie bancara excelenta", culoare: "bg-green-500" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-red-500","bg-yellow-500","bg-blue-500","bg-green-500","bg-purple-500","bg-orange-500","bg-teal-500"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Antivirus Ieftin Romania 2026","url":"https://amcupon.ro/antivirus","description":"Coduri reducere antivirus Romania — Bitdefender, Norton, ESET, Kaspersky" };

export default function AntivirusPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topAV = TOP_ANTIVIRUS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restAV = all.filter(m =>
    !TOP_ANTIVIRUS.includes(m.magazin) && m.are_promotie &&
    CAT_AV.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 8);
  const magazine = [...topAV, ...restAV];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-orange-500">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Antivirus</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 text-white py-14 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🛡️</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Antivirus Ieftin Romania {an}</h1>
            <p className="text-red-100 text-lg mb-6 max-w-xl mx-auto">
              Bitdefender, Norton, ESET, Kaspersky — protectie completa cu pana la 70% reducere fata de pretul de lista
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["PC & Mac","Android","iOS","5 Dispozitive","Parental Control","VPN Inclus","Dark Web Monitor"].map(c => (
                <span key={c} className="bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/25">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Comparativ antivirus {an} — Romania</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPARATIV.map(c => (
              <div key={c.brand} className="bg-white border-2 border-gray-100 rounded-2xl p-5 hover:border-orange-200 hover:shadow-md transition-all">
                <div className={`w-10 h-10 ${c.culoare} rounded-xl flex items-center justify-center text-white font-black text-sm mb-3`}>
                  {c.brand[0]}
                </div>
                <h3 className="font-black text-gray-900 text-base mb-1">{c.brand}</h3>
                <p className="text-xs text-gray-500 mb-2">{c.highlight}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-500 font-black text-sm">{c.pret}</span>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">{c.nota}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Ce include un antivirus bun</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPURI_PROTECTIE.map(a => (
              <div key={a.titlu} className="bg-red-50 border border-red-100 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {magazine.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-10">
            <h2 className="text-xl font-black text-gray-900 mb-5">Unde gasesti antivirus cu reducere</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {magazine.map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI[i % CULORI.length];
                const promo = m.promotii[0];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-white border border-gray-200 hover:border-red-300 rounded-2xl p-4 transition-all hover:shadow-md">
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
                      <span className="text-xs text-red-500 font-semibold group-hover:text-red-600">Vezi &rarr;</span>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <NisaProduse
          merchantSlugs={["bitdefender.com","norton.com","eset.com","emag.ro","altex.ro","pcgarage.ro"]}
          catSlug="electronice"
          titlu="Licente antivirus cu reducere"
          culoareAccent="red"
          limit={8}
        />

        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Ce antivirus sa alegi in {an}</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Bitdefender — cel mai bun antivirus Romania {an}</h3>
                <p>Bitdefender este o companie romaneasca (Cluj-Napoca) cu una dintre cele mai bune rate de detectie din lume. Total Security include protectie pentru 5 dispozitive, VPN 200MB/zi, Parental Control, Password Manager si protectie webcam. Pretul de lista este 250 lei/an, dar cu coduri AmCupon gasesti frecvent la 80-120 lei.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Norton 360 — VPN nelimitat inclus</h3>
                <p>Singurul antivirus major care include VPN fara limita de trafic in pachetul standard. Ideal daca folosesti frecvent retele Wi-Fi publice sau vrei acces la continut geo-blocat.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Ai nevoie de antivirus pe telefon?</h3>
                <p>Android — da, este vulnerabil. iOS — mai putin, dar un antivirus cu VPN si protectie phishing are sens. Majoritatea pachetelor premium includ protectie mobila fara cost suplimentar.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/vpn", label: "🌐 VPN" },
              { href: "/hosting", label: "🖥️ Hosting" },
              { href: "/software-business", label: "💼 Software" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 hover:border-red-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/vpn" className="hover:text-orange-500">VPN</Link>{" · "}
          <Link href="/hosting" className="hover:text-orange-500">Hosting</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-500">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
