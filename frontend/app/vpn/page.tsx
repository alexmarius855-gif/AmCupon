import { Metadata } from "next";
import Link from "next/link";

// ── LINKURI AFILIATE VPN ── inlocuieste cu linkurile tale din Impact.com ──
// NordVPN: aplica la https://partners.nordvpn.com → primesti link personalizat
// Surfshark: aplica la https://surfshark.com/affiliates → primesti link Impact.com
// ExpressVPN: aplica la https://www.expressvpn.com/affiliates
const LINK_NORDVPN    = "https://nordvpn.com/?aff_id=AMCUPON";   // inlocuieste cu Impact.com link
const LINK_SURFSHARK  = "https://surfshark.com/?coupon=amcupon";  // inlocuieste cu link afiliat
const LINK_EXPRESSVPN = "https://expressvpn.com/?ref=amcupon";   // inlocuieste cu link afiliat
// ──────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Cel mai bun VPN Romania 2026 — Comparatie NordVPN vs Surfshark | AmCupon.ro",
  description: "Comparam cele mai bune VPN-uri pentru Romania in 2026. NordVPN, Surfshark, ExpressVPN — preturi, viteza, securitate. Alege VPN-ul potrivit pentru streaming si confidentialitate.",
  keywords: ["cel mai bun vpn romania", "nordvpn romania", "surfshark parere", "vpn streaming", "vpn ieftin romania 2026", "vpn recenzii"],
  alternates: { canonical: "https://amcupon.ro/vpn" },
  openGraph: {
    title: "Cel mai bun VPN Romania 2026 | AmCupon.ro",
    description: "Comparatie detaliata NordVPN vs Surfshark vs ExpressVPN. Preturi, viteza, securitate — ghid complet pentru romani.",
    url: "https://amcupon.ro/vpn",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const VPN_LIST = [
  {
    rank: 1,
    name: "NordVPN",
    tagline: "Cel mai complet VPN — lider mondial cu 6000+ servere",
    badge: "Recomandat #1",
    badgeColor: "bg-blue-600",
    emoji: "🏆",
    pret_luna: "2.99€",
    pret_nota: "plan 2 ani",
    rating: "9.8",
    url: LINK_NORDVPN,
    pros: [
      "6000+ servere in 111 tari",
      "Viteza mare (NordLynx protocol)",
      "Netflix, Disney+, HBO Max deblocat",
      "Threat Protection — blocheaza malware si reclame",
      "Pana la 10 dispozitive simultan",
      "Garantie ramburs 30 zile",
      "No-logs auditat independent",
    ],
    cons: ["Interfata desktop putin incarcata", "Pretul creste dupa primul an"],
    ideal: "Streaming, torrent, securitate maxima",
  },
  {
    rank: 2,
    name: "Surfshark",
    tagline: "Dispozitive nelimitate — cel mai bun raport calitate/pret",
    badge: "Cel mai accesibil",
    badgeColor: "bg-teal-600",
    emoji: "💰",
    pret_luna: "2.39€",
    pret_nota: "plan 2 ani",
    rating: "9.4",
    url: LINK_SURFSHARK,
    pros: [
      "Dispozitive NELIMITATE",
      "CleanWeb — blocheaza reclame si trackeri",
      "Camouflage Mode — ascunde ca folosesti VPN",
      "MultiHop — doua tari simultan",
      "Garantie ramburs 30 zile",
      "No-logs policy verificata",
    ],
    cons: ["Server count mai mic ca NordVPN", "Viteza variabila pe servere aglomerate"],
    ideal: "Familii cu multe dispozitive, pret mic",
  },
  {
    rank: 3,
    name: "ExpressVPN",
    tagline: "Cel mai rapid VPN — pentru streaming 4K fara buffering",
    badge: "Cel mai rapid",
    badgeColor: "bg-red-600",
    emoji: "⚡",
    pret_luna: "6.67€",
    pret_nota: "plan 1 an",
    rating: "9.2",
    url: LINK_EXPRESSVPN,
    pros: [
      "Lightway — protocol propriu ultra-rapid",
      "3000 servere in 105 tari",
      "Functioneaza in China si tari restrictive",
      "Router app inclusa",
      "Suport live chat 24/7",
    ],
    cons: ["Cel mai scump dintre top 3", "Maxim 8 dispozitive simultan"],
    ideal: "Utilizatori avansati, streaming 4K, business",
  },
];

const CAZURI_UTILIZARE = [
  { emoji: "🎬", titlu: "Streaming Netflix / HBO Max", desc: "NordVPN deblocheaza Netflix US, UK, JP. Surfshark merge pe mai multe conturi simultan. ExpressVPN e cel mai stabil pentru 4K." },
  { emoji: "🛡", titlu: "Wi-Fi public (cafenele, hoteluri)", desc: "Orice VPN din lista e perfect. Activeaza VPN inainte sa te conectezi — protectie totala impotriva interceptarii." },
  { emoji: "⬇️", titlu: "Torrente si download-uri", desc: "NordVPN si Surfshark au servere dedicate P2P. Viteza buna, fara limitare de viteza." },
  { emoji: "🏠", titlu: "Remote work / VPN corporativ", desc: "NordVPN Teams sau ExpressVPN pentru echipe. Securitate business-grade la pret rezonabil." },
  { emoji: "🌍", titlu: "Calatorii in strainatate", desc: "ExpressVPN functioneaza si in China, Iran, UAE unde alte VPN-uri sunt blocate." },
  { emoji: "🎮", titlu: "Gaming", desc: "NordVPN are servere dedicate gaming cu latenta mica. Surfshark e mai ieftin si merge bine pentru gaming casual." },
];

const FAQ = [
  { q: "VPN-ul meu incetineste internetul?", a: "Cu un VPN bun (NordVPN, Surfshark) pierzi maxim 10-20% din viteza pe servere apropiate. Conexiunile gigabit nu vor simti diferenta. Serverele din Romania sau Europa Centrala sunt cele mai rapide." },
  { q: "E legal sa folosesti VPN in Romania?", a: "Da, complet legal. VPN-urile sunt instrumente de securitate legitime, folosite de milioane de persoane si de companii. Nu sunt ilegale in Romania sau UE." },
  { q: "Pot folosi VPN pe telefon si laptop simultan?", a: "Da. NordVPN permite 10 dispozitive simultan, Surfshark permite dispozitive NELIMITATE. Un singur abonament acopera toata familia." },
  { q: "VPN-urile gratuite sunt ok?", a: "NU. VPN-urile gratuite iti vand datele de browsing advertiseri, au viteza foarte mica si nu ofera securitate reala. Un VPN platit bun costa 2-3€/luna — mai ieftin decat un Netflix." },
  { q: "NordVPN sau Surfshark — care e mai bun?", a: "NordVPN e mai complet (mai multi servere, protocol mai rapid, mai sigur). Surfshark e mai ieftin si are dispozitive nelimitate. Daca ai o familie mare sau multi bani putini: Surfshark. Daca vrei cel mai bun: NordVPN." },
  { q: "Pot da inapoi banii daca nu sunt multumit?", a: "Da — toate 3 VPN-urile din lista au garantie de rambursare 30 de zile. Dai cerere, primesti banii inapoi, fara intrebari." },
];

export default function VpnPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-slate-300">Cel mai bun VPN Romania</span>
          </nav>
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Cel mai bun <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #3b82f6, #06b6d4)" }}>VPN Romania</span> 2026
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
            Am testat cele mai populare VPN-uri si ti le prezentam comparativ. Preturi reale, viteza, securitate — tot ce trebuie sa stii inainte sa cumperi.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Actualizat iunie 2026</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Testate independent</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Garantie 30 zile toate</span>
          </div>
        </div>
      </section>

      {/* Comparatie rapida */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8">
          <p className="text-slate-300 text-sm text-center">
            <span className="text-white font-bold">Concluzia scurta:</span> Alege <strong className="text-blue-400">NordVPN</strong> daca vrei cel mai bun si nu te deranjeaza un pret putin mai mare. Alege <strong className="text-teal-400">Surfshark</strong> daca ai multi bani putini sau vrei dispozitive nelimitate.
          </p>
        </div>

        <div className="space-y-6">
          {VPN_LIST.map((vpn) => (
            <div key={vpn.name} className={`bg-slate-900 border rounded-2xl p-6 transition-all ${vpn.rank === 1 ? "border-blue-500/40 shadow-lg shadow-blue-500/10" : "border-slate-800 hover:border-slate-700"}`}>
              {vpn.rank === 1 && (
                <div className="text-xs text-blue-400 font-bold mb-3 flex items-center gap-2">
                  <span>⭐ EDITORUL NOSTRU RECOMANDA</span>
                </div>
              )}
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{vpn.emoji}</span>
                    <h2 className="text-xl font-black text-white">#{vpn.rank} {vpn.name}</h2>
                    <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${vpn.badgeColor}`}>{vpn.badge}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{vpn.tagline}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-bold mb-2">AVANTAJE</p>
                      <ul className="space-y-1">
                        {vpn.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 shrink-0 mt-0.5">+</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-bold mb-2">DEZAVANTAJE</p>
                      <ul className="space-y-1 mb-3">
                        {vpn.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-red-400 shrink-0 mt-0.5">-</span>{c}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-500">Ideal pentru: <span className="text-slate-400">{vpn.ideal}</span></p>
                    </div>
                  </div>
                </div>

                <div className="md:w-44 flex flex-col items-center gap-3 shrink-0">
                  <div className="text-center">
                    <div className="text-3xl font-black text-white">{vpn.pret_luna}</div>
                    <div className="text-xs text-slate-500">/luna ({vpn.pret_nota})</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-white font-bold text-sm">{vpn.rating}</span>
                      <span className="text-slate-500 text-xs">/10</span>
                    </div>
                  </div>
                  <a href={vpn.url} target="_blank" rel="sponsored noopener noreferrer"
                    className={`w-full text-center py-3 px-4 rounded-xl font-black text-sm text-white transition-all hover:-translate-y-0.5 shadow-lg ${vpn.rank === 1 ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" : "bg-slate-700 hover:bg-slate-600"}`}>
                    Incearca {vpn.name} →
                  </a>
                  <p className="text-[10px] text-slate-500 text-center">Garantie ramburs 30 zile</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cazuri de utilizare */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-800">
        <h2 className="text-2xl font-black text-white mb-6">Pentru ce ai nevoie de VPN?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAZURI_UTILIZARE.map((c, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-2xl mb-2">{c.emoji}</div>
              <h3 className="text-sm font-bold text-white mb-1">{c.titlu}</h3>
              <p className="text-xs text-slate-400">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* De ce sa NU folosesti VPN gratuit */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-800">
        <div className="bg-red-950/30 border border-red-800/40 rounded-2xl p-6">
          <h2 className="text-xl font-black text-white mb-3 flex items-center gap-2">
            <span>⚠️</span> De ce VPN-urile gratuite sunt periculoase
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-red-400 font-bold mb-1">Iti vand datele</p>
              <p className="text-slate-400">VPN-urile gratuite sunt gratuite pentru ca iti vand istoricul de browsing advertiseri. Tu esti produsul.</p>
            </div>
            <div>
              <p className="text-red-400 font-bold mb-1">Viteza extrem de mica</p>
              <p className="text-slate-400">Servere aglomerate, bandwidth limitat la 500MB/zi sau 2GB/luna. Inutile pentru streaming.</p>
            </div>
            <div>
              <p className="text-red-400 font-bold mb-1">Securitate falsa</p>
              <p className="text-slate-400">Unele VPN-uri "gratuite" injecteaza reclame in paginile web sau contin malware. Mai periculos decat fara VPN.</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4">Un VPN platit bun costa <strong className="text-white">2.39-3€/luna</strong> — mai ieftin decat un Netflix. Nu merita riscul pentru cateva euro.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-slate-800">
        <h2 className="text-2xl font-black text-white mb-6">Intrebari frecvente despre VPN</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-white mb-2">{item.q}</h3>
              <p className="text-slate-400 text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-blue-950/40 to-teal-950/30 border border-blue-800/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-black text-white mb-3">Gata sa iti protejezi conexiunea?</h2>
          <p className="text-slate-400 mb-6 text-sm max-w-xl mx-auto">Oricare ai alege, ai garantie de ramburs 30 zile. Incearca fara risc — daca nu esti multumit, primesti banii inapoi.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://nordvpn.com" target="_blank" rel="sponsored noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-500/20">
              NordVPN — de la 2.99€/luna →
            </a>
            <a href="https://surfshark.com" target="_blank" rel="sponsored noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5">
              Surfshark — de la 2.39€/luna →
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-slate-600 text-xs text-center">
          Unele linkuri de pe aceasta pagina sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine. Recomandam doar servicii pe care le-am testat sau verificat independent.
        </p>
      </div>
    </div>
  );
}
