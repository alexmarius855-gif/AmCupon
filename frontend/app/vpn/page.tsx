import { Metadata } from "next";
import Link from "next/link";
import { linkPlatit } from "@/lib/linkPlatit";

// ── LINKURI AFILIATE VPN — REALE din Impact.com (account 7401119) ──
const LINK_NORDVPN    = "https://nordvpn.sjv.io/c/7401119/417838/7452";   // REAL Impact
const LINK_SURFSHARK  = "https://surfshark.sjv.io/c/7401119/535269/9043"; // REAL Impact
// ExpressVPN: nu avem program afiliat inca → link curat homepage (fara tracking fals)
const LINK_EXPRESSVPN = "https://www.expressvpn.com";
// Linkuri reale, aprobate pe Impact.com
const LINK_ADGUARD_VPN = "https://adguard.sjv.io/c/7401119/3824000/49891";
const LINK_ICEVPN      = "https://iceprivacyltd.pxf.io/c/7401119/3741732/47094";
const LINK_IPROYAL     = "https://iproyal.sjv.io/c/7401119/1295570/15731";
// Linkuri reale, aprobate pe Awin (account 101829567)
const LINK_HIDEMYNAME  = "https://www.awin1.com/cread.php?awinmid=5887918&awinaffid=101829567&clickref=";
// ──────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "VPN Romania 2026 — NordVPN vs Surfshark | AmCupon.ro",
  description: "Comparăm NordVPN, Surfshark și ExpressVPN pentru România în 2026: funcții, dispozitive, securitate, garanție. Alege VPN-ul potrivit pentru streaming și confidențialitate.",
  keywords: ["cel mai bun vpn romania", "nordvpn romania", "surfshark parere", "vpn streaming", "vpn ieftin romania 2026", "vpn recenzii"],
  alternates: { canonical: "https://amcupon.ro/vpn" },
  openGraph: {
    title: "Cel mai bun VPN Romania 2026 | AmCupon.ro",
    description: "Comparație NordVPN vs Surfshark vs ExpressVPN: funcții, dispozitive, securitate — ghid pentru români.",
    url: "https://amcupon.ro/vpn",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

// 07.10.2026: fara preturi scrise de mana (se schimba des, iar pagina nu afla) si fara superlative.
// badgeColor poarta si culoarea textului: pe lime textul e inchis.
const VPN_LIST = [
  {
    rank: 1,
    name: "NordVPN",
    tagline: "VPN complet: protocol rapid, blocare de reclame și malware, audit no-logs",
    badge: "VPN + blocare reclame",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "🏆",
    url: LINK_NORDVPN,
    pros: [
      "Servere în peste 100 de țări",
      "Protocolul NordLynx (bazat pe WireGuard)",
      "Threat Protection — blochează malware și reclame",
      "Până la 10 dispozitive simultan",
      "Garanție de rambursare 30 de zile",
      "Politică no-logs verificată de auditori externi",
    ],
    cons: ["Interfața desktop e mai încărcată", "Prețul crește la reînnoire, după prima perioadă"],
    ideal: "Streaming, torrente, securitate",
  },
  {
    rank: 2,
    name: "Surfshark",
    tagline: "Dispozitive nelimitate pe un singur abonament",
    badge: "Dispozitive nelimitate",
    badgeColor: "bg-[#ddf93c] text-[#0c1000]",
    emoji: "💰",
    url: LINK_SURFSHARK,
    pros: [
      "Dispozitive NELIMITATE",
      "CleanWeb — blochează reclame și trackere",
      "Camouflage Mode — ascunde faptul că folosești VPN",
      "MultiHop — conexiune prin două țări",
      "Garanție de rambursare 30 de zile",
      "Politică no-logs",
    ],
    cons: ["Mai puține servere decât NordVPN", "Viteza variază pe serverele aglomerate"],
    ideal: "Familii cu multe dispozitive",
  },
  {
    rank: 3,
    name: "ExpressVPN",
    tagline: "VPN cu protocol propriu (Lightway) și aplicație pentru router",
    badge: "Servere în peste 100 de țări",
    badgeColor: "bg-red-600 text-[#ffffff]",
    emoji: "⚡",
    url: LINK_EXPRESSVPN,
    pros: [
      "Protocolul propriu Lightway",
      "Servere în peste 100 de țări",
      "Aplicație pentru router",
      "Suport prin chat 24/7",
      "Garanție de rambursare 30 de zile",
    ],
    cons: ["Prețul crește la reînnoire, după prima perioadă", "Nu avem parteneriat cu ExpressVPN: linkul duce direct pe site-ul lor"],
    ideal: "Utilizatori avansați, router, călătorii",
  },
];

const ALTE_VPN = [
  {
    name: "AdGuard VPN",
    emoji: "🛡️",
    desc: "De la echipa AdGuard, cunoscută pentru blocarea reclamelor. VPN simplu, cu politică no-logs, fără reclame în aplicație.",
    url: LINK_ADGUARD_VPN,
    ideal: "Cei care vor un VPN simplu, de la un brand cunoscut pentru confidențialitate",
  },
  {
    name: "IceVPN",
    emoji: "🧊",
    desc: "VPN mai mic, cu funcțiile de bază.",
    url: LINK_ICEVPN,
    ideal: "Utilizare de bază: navigare pe Wi-Fi public",
  },
  {
    name: "HideMy.Name",
    emoji: "🕶️",
    desc: "VPN axat pe confidențialitate, cu aplicații pentru toate platformele și extensii de browser.",
    url: LINK_HIDEMYNAME,
    ideal: "Cei care vor o alternativă mai puțin cunoscută",
  },
];

const CAZURI_UTILIZARE = [
  { emoji: "🎬", titlu: "Streaming", desc: "Toate trei au servere în SUA, Marea Britanie și alte țări. Ce cataloage merg se schimbă des și depinde de regulile fiecărei platforme de streaming." },
  { emoji: "🛡", titlu: "Wi-Fi public (cafenele, hoteluri)", desc: "Oricare din listă criptează conexiunea. Pornește VPN-ul înainte să te conectezi la rețea." },
  { emoji: "⬇️", titlu: "Torrente și download-uri", desc: "NordVPN și Surfshark permit P2P. VPN-ul nu face legal un download care încalcă drepturile de autor." },
  { emoji: "🏠", titlu: "Remote work / firme", desc: "Pentru firme, Nord Security are un produs separat, NordLayer. Pentru uz personal, oricare din listă." },
  { emoji: "🌍", titlu: "Călătorii în străinătate", desc: "Te protejează pe Wi-Fi-ul hotelurilor și al aeroporturilor. Unele țări restricționează VPN-urile — verifică legislația locală înainte să pleci." },
  { emoji: "🎮", titlu: "Gaming", desc: "Un VPN adaugă de obicei latență. La jocuri îl pornești doar când ai un motiv, de exemplu protecția IP-ului." },
];

const FAQ = [
  { q: "VPN-ul meu încetinește internetul?", a: "Puțin pe serverele apropiate, mai mult pe cele îndepărtate. Contează protocolul (NordLynx, Lightway și WireGuard sunt mai rapide decât OpenVPN) și distanța până la server — alege un server din România sau din apropiere." },
  { q: "E legal să folosești VPN în România?", a: "Da. VPN-urile sunt instrumente de securitate folosite de persoane și de firme și nu sunt interzise în România sau în UE. Ce faci prin VPN rămâne supus acelorași legi." },
  { q: "Pot folosi VPN pe telefon și laptop simultan?", a: "Da. NordVPN permite până la 10 dispozitive simultan, iar Surfshark — dispozitive nelimitate. Un singur abonament acoperă toată familia." },
  { q: "VPN-urile gratuite sunt ok?", a: "Unele da, multe nu. Un VPN gratuit trebuie să se finanțeze cumva: prin reclame, din datele tale sau ca variantă limitată a unuia plătit. Variantele gratuite ale firmelor cunoscute pot fi o opțiune; aplicațiile gratuite necunoscute sunt riscante." },
  { q: "NordVPN sau Surfshark — care e mai bun?", a: "NordVPN are mai multe servere și audituri no-logs repetate; Surfshark are dispozitive nelimitate. Pentru o familie cu multe dispozitive: Surfshark. Pentru cele mai multe funcții: NordVPN." },
  { q: "Pot da înapoi banii dacă nu sunt mulțumit?", a: "Da — toate trei au garanție de rambursare de 30 de zile. Citește condițiile pe site: garanția se aplică de obicei la plata făcută direct pe site, nu prin magazinele de aplicații." },
];

export default function VpnPage() {
  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Cel mai bun VPN Romania</span>
          </nav>
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Cel mai bun <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #c3dd2c)" }}>VPN Romania</span> 2026
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto mb-6">
            Am comparat funcțiile, limitele și garanțiile celor mai populare VPN-uri, din ce publică fiecare furnizor. Prețurile se schimbă des, așa că le vezi actualizate pe site-ul lor.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#c9ced5]">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Revizuit în octombrie 2026</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Garanție de rambursare 30 de zile la toate trei</span>
          </div>
        </div>
      </section>

      {/* Comparatie rapida */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5 mb-8">
          <p className="text-[#c9ced5] text-sm text-center">
            <span className="text-[#ffffff] font-bold">Concluzia scurtă:</span> Alege <strong className="text-[#c3dd2c]">NordVPN</strong> dacă vrei cele mai multe funcții (blocare de reclame și malware, audit no-logs). Alege <strong className="text-[#c3dd2c]">Surfshark</strong> dacă vrei să acoperi multe dispozitive cu un singur abonament.
          </p>
        </div>

        <div className="space-y-6">
          {VPN_LIST.map((vpn) => (
            <div key={vpn.name} className={`bg-[#14181c] border rounded-xl p-6 transition-all ${vpn.rank === 1 ? "border-[#ddf93c]/40 shadow-lg shadow-[#ddf93c]/10" : "border-[#1f2329] hover:border-[#2a2f36]"}`}>
              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{vpn.emoji}</span>
                    <h2 className="text-xl font-black text-[#ffffff]">#{vpn.rank} {vpn.name}</h2>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${vpn.badgeColor}`}>{vpn.badge}</span>
                  </div>
                  <p className="text-[#c9ced5] text-sm mb-4">{vpn.tagline}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-bold mb-2">AVANTAJE</p>
                      <ul className="space-y-1">
                        {vpn.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                            <span className="text-emerald-400 shrink-0 mt-0.5">+</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-bold mb-2">DEZAVANTAJE</p>
                      <ul className="space-y-1 mb-3">
                        {vpn.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#c9ced5]">
                            <span className="text-red-400 shrink-0 mt-0.5">-</span>{c}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-[#9399a0]">Ideal pentru: <span className="text-[#c9ced5]">{vpn.ideal}</span></p>
                    </div>
                  </div>
                </div>

                <div className="md:w-44 flex flex-col items-center gap-3 shrink-0">
                  <a href={linkPlatit(vpn.url)} target="_blank" rel="sponsored noopener noreferrer"
                    className={`w-full text-center py-3 px-4 rounded-xl font-black text-sm transition-all hover:-translate-y-0.5 shadow-lg ${vpn.rank === 1 ? "bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] shadow-[#ddf93c]/20" : "bg-[#2a2f36] hover:bg-[#3a4048] text-[#ffffff]"}`}>
                    Încearcă {vpn.name} →
                  </a>
                  <p className="text-[10px] text-[#9399a0] text-center">Garanție de rambursare 30 de zile</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Alte VPN-uri verificate */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
        <h2 className="text-xl font-black text-[#ffffff] mb-2">Alte VPN-uri</h2>
        <p className="text-[#9399a0] text-sm mb-5">Optiuni suplimentare, pentru cazuri specifice sau buget mai mic.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALTE_VPN.map((v) => (
            <div key={v.name} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{v.emoji}</span>
                <span className="font-black text-[#ffffff]">{v.name}</span>
              </div>
              <p className="text-[#c9ced5] text-xs">{v.desc}</p>
              <p className="text-[11px] text-[#9399a0]">Ideal pentru: <span className="text-[#c9ced5]">{v.ideal}</span></p>
              <a href={linkPlatit(v.url)} target="_blank" rel="sponsored noopener noreferrer"
                className="mt-auto bg-[#2a2f36] hover:bg-[#2a2f36] text-[#ffffff] text-sm font-bold py-2.5 rounded-lg text-center transition-all">
                Încearcă {v.name} →
              </a>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-[#14181c]/60 border border-[#1f2329] rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-[#c9ced5]">
            <strong className="text-[#c9ced5]">IPRoyal</strong> — nu e un VPN clasic, ci o retea de proxy rezidential. Util pentru web scraping, verificare reclame sau administrare de conturi multiple, nu pentru streaming general.
          </p>
          <a href={linkPlatit(LINK_IPROYAL)} target="_blank" rel="sponsored noopener noreferrer"
            className="shrink-0 text-xs font-bold text-[#c9ced5] hover:text-[#ffffff] bg-[#1f2329] hover:bg-[#2a2f36] px-3 py-1.5 rounded-lg transition-all">
            Vezi IPRoyal →
          </a>
        </div>
      </section>

      {/* Cazuri de utilizare */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
        <h2 className="text-2xl font-black text-[#ffffff] mb-6">Pentru ce ai nevoie de VPN?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAZURI_UTILIZARE.map((c, i) => (
            <div key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4">
              <div className="text-2xl mb-2">{c.emoji}</div>
              <h3 className="text-sm font-bold text-[#ffffff] mb-1">{c.titlu}</h3>
              <p className="text-xs text-[#c9ced5]">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* De ce sa NU folosesti VPN gratuit */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-6">
          <h2 className="text-xl font-black text-[#ffffff] mb-3 flex items-center gap-2">
            <span>⚠️</span> De ce să fii atent la VPN-urile gratuite
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-red-400 font-bold mb-1">Pot să-ți vândă datele</p>
              <p className="text-[#c9ced5]">Un serviciu gratuit trebuie să se finanțeze cumva; la unele aplicații, din datele tale de navigare.</p>
            </div>
            <div>
              <p className="text-red-400 font-bold mb-1">Limite de trafic și viteză</p>
              <p className="text-[#c9ced5]">Multe variante gratuite au o limită de date pe lună și servere aglomerate.</p>
            </div>
            <div>
              <p className="text-red-400 font-bold mb-1">Securitate falsă</p>
              <p className="text-[#c9ced5]">Unele aplicații VPN gratuite injectează reclame în pagini sau conțin malware — mai periculos decât fără VPN.</p>
            </div>
          </div>
          <p className="text-[#c9ced5] text-sm mt-4">Planurile pe 1–2 ani ale VPN-urilor mari costă de obicei <strong className="text-[#ffffff]">câțiva euro pe lună</strong>.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-[#1f2329]">
        <h2 className="text-2xl font-black text-[#ffffff] mb-6">Întrebări frecvente despre VPN</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
              <h3 className="font-bold text-[#ffffff] mb-2">{item.q}</h3>
              <p className="text-[#c9ced5] text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-[#ddf93c]/40 to-[#ddf93c]/30 border border-[#ddf93c]/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-black text-[#ffffff] mb-3">Gata să îți protejezi conexiunea?</h2>
          <p className="text-[#c9ced5] mb-6 text-sm max-w-xl mx-auto">Oricare ai alege, ai garanție de rambursare de 30 de zile (condițiile sunt pe site-ul fiecăruia).</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={linkPlatit(LINK_NORDVPN)} target="_blank" rel="sponsored noopener noreferrer"
              className="bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-[#ddf93c]/20">
              Încearcă NordVPN →
            </a>
            <a href={linkPlatit(LINK_SURFSHARK)} target="_blank" rel="sponsored noopener noreferrer"
              className="bg-[#2a2f36] hover:bg-[#2a2f36] text-[#ffffff] font-bold px-8 py-3 rounded-xl transition-all hover:-translate-y-0.5">
              Încearcă Surfshark →
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-[#9399a0] text-xs text-center">
          Unele linkuri de pe această pagină sunt linkuri de afiliat. Dacă faci o achiziție, AmCupon.ro primește un comision, fără cost suplimentar pentru tine. Descrierile se bazează pe ce publică fiecare furnizor; prețurile și condițiile le vezi pe site-ul lor.
        </p>
      </div>
    </div>
  );
}
