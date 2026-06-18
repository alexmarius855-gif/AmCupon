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

// ── LINKURI AFILIATE ── inlocuieste cu linkurile tale dupa aprobare ────────
// Bitdefender: aplica prin Impact.com (cont existent AmCupon) — app.impact.com/campaign-promo-signup/Bitdefender.brand
// Norton: direct, formular propriu — us.norton.com/affiliates
// ESET: via CJ Affiliate (cont nou necesar) — eset.com/us/business/partner/online-affiliates
// Kaspersky: via CJ Affiliate (acelasi cont CJ ca ESET) — kaspersky.com/partners/affiliate
const LINK_BITDEFENDER = "https://www.bitdefender.com/?ref=amcupon";
const LINK_NORTON      = "https://us.norton.com/?ref=amcupon";
const LINK_ESET        = "https://www.eset.com/ro/?ref=amcupon";
const LINK_KASPERSKY   = "https://www.kaspersky.com/?ref=amcupon";
// ──────────────────────────────────────────────────────────────────────────

const COMPARATIV = [
  { brand: "Bitdefender", nota: "9.8/10", pret: "de la 45 lei/an", highlight: "Cel mai bun detectie malware", culoare: "bg-red-600", url: LINK_BITDEFENDER },
  { brand: "Norton 360", nota: "9.5/10", pret: "de la 59 lei/an", highlight: "VPN nelimitat inclus", culoare: "bg-yellow-500", url: LINK_NORTON },
  { brand: "ESET NOD32", nota: "9.3/10", pret: "de la 39 lei/an", highlight: "Cel mai usor pe sistem", culoare: "bg-blue-600", url: LINK_ESET },
  { brand: "Kaspersky", nota: "9.1/10", pret: "de la 49 lei/an", highlight: "Protectie bancara excelenta", culoare: "bg-emerald-600", url: LINK_KASPERSKY },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI_BADGE = ["bg-red-600","bg-yellow-500","bg-blue-600","bg-emerald-600","bg-purple-600","bg-indigo-600","bg-teal-600"];
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
      <div className="min-h-screen bg-slate-950">

        {/* Breadcrumb */}
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">Antivirus</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-red-950 via-slate-900 to-rose-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-rose-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>
              Pana la 70% reducere
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">🛡️</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Antivirus Ieftin Romania <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #8b5cf6, #22d3ee)"}}>{an}</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Bitdefender, Norton, ESET, Kaspersky — protectie completa cu pana la 70% reducere fata de pretul de lista
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["PC & Mac","Android","iOS","5 Dispozitive","Parental Control","VPN Inclus","Dark Web Monitor"].map(c => (
                <span key={c} className="bg-white/8 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Comparativ */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">COMPARATIV</p>
            <h2 className="text-2xl font-black text-white">Cel mai bun antivirus {an} — Romania</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPARATIV.map(c => (
              <a key={c.brand} href={c.url} target="_blank" rel="sponsored noopener noreferrer"
                className="block bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10">
                <div className={`w-11 h-11 ${c.culoare} rounded-xl flex items-center justify-center text-white font-black text-sm mb-4`}>{c.brand[0]}</div>
                <h3 className="font-black text-white text-base mb-1">{c.brand}</h3>
                <p className="text-xs text-slate-400 mb-3">{c.highlight}</p>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-black text-sm">{c.pret}</span>
                  <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{c.nota}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Tipuri protectie */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">FUNCTII</p>
            <h2 className="text-2xl font-black text-white">Ce include un antivirus bun</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPURI_PROTECTIE.map((a, i) => (
              <div key={a.titlu} className="bg-slate-900 border border-slate-800 hover:border-red-500/30 rounded-2xl p-5 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${CULORI_BADGE[i % CULORI_BADGE.length]}`}>{a.emoji}</div>
                  <h3 className="font-bold text-white text-sm">{a.titlu}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        {magazine.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
                <h2 className="text-xl font-black text-white">Unde gasesti antivirus cu reducere</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {magazine.map((m, i) => {
                const nume = numeAfisat(m.magazin);
                const culoare = CULORI_BADGE[i % CULORI_BADGE.length];
                const promo = m.promotii[0];
                return (
                  <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-slate-900 border border-slate-800 hover:border-red-500/50 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10">
                    <div className="flex items-center gap-3 mb-3">
                      {m.logo_url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-white flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.logo_url} alt={`Logo ${nume}`} className="w-8 h-8 object-contain" loading="lazy" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>{nume[0]}</div>
                      )}
                      <div>
                        <p className="font-bold text-white text-sm group-hover:text-red-300 transition-colors">{nume}</p>
                        {m.are_promotie && m.cod_cupon && <span className="text-[10px] font-black text-indigo-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">COD</span>}
                        {m.are_promotie && !m.cod_cupon && <span className="text-[10px] font-medium text-emerald-400">Oferta activa</span>}
                      </div>
                    </div>
                    {promo ? (
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{promo.nume}</p>
                    ) : (
                      <p className="text-slate-600 text-xs italic">Verifica ofertele curente</p>
                    )}
                    <div className="flex justify-end mt-3">
                      <span className="text-xs text-red-400 font-semibold group-hover:text-red-300 flex items-center gap-1">
                        Vezi <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                      </span>
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

        {/* Ghid */}
        <section className="bg-slate-900 border-t border-slate-800 py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">GHID ALEGERE</p>
            <h2 className="text-2xl font-black text-white mb-7">Ce antivirus sa alegi in {an}</h2>
            <div className="space-y-5">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2 text-base">Bitdefender — cel mai bun antivirus Romania {an}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Bitdefender este o companie romaneasca (Cluj-Napoca) cu una dintre cele mai bune rate de detectie din lume. Total Security include protectie pentru 5 dispozitive, VPN 200MB/zi, Parental Control, Password Manager si protectie webcam. Pretul de lista este 250 lei/an, dar cu coduri AmCupon gasesti frecvent la 80-120 lei.</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2 text-base">Norton 360 — VPN nelimitat inclus</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Singurul antivirus major care include VPN fara limita de trafic in pachetul standard. Ideal daca folosesti frecvent retele Wi-Fi publice sau vrei acces la continut geo-blocat.</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="font-bold text-white mb-2 text-base">Ai nevoie de antivirus pe telefon?</h3>
                <p className="text-sm text-slate-400 leading-relaxed">Android — da, este vulnerabil. iOS — mai putin, dar un antivirus cu VPN si protectie phishing are sens. Majoritatea pachetelor premium includ protectie mobila fara cost suplimentar.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/vpn", label: "🌐 VPN" },
              { href: "/hosting", label: "🖥️ Hosting" },
              { href: "/software-business", label: "💼 Software" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/electronice", label: "📱 Electronice" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-red-500/40 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/vpn" className="hover:text-indigo-400 transition-colors">VPN</Link>{" · "}
          <Link href="/hosting" className="hover:text-indigo-400 transition-colors">Hosting</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400 transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
