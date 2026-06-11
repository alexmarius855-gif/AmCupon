import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recomandari Premium — VPN, Hosting si Rezervari | AmCupon.ro",
  description: "Cele mai bune servicii online recomandate de AmCupon.ro: VPN sigur, hosting rapid si rezervari travel. Testate si verificate.",
  alternates: { canonical: "https://amcupon.ro/recomandari" },
  openGraph: {
    title: "Recomandari Premium AmCupon.ro",
    description: "VPN, hosting si travel — servicii online testate si recomandate.",
    url: "https://amcupon.ro/recomandari",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const CATEGORII = [
  {
    titlu: "VPN — Navigare Sigura",
    emoji: "🔒",
    desc: "Protejeaza-ti datele online si acceseaza continut din orice tara. Esential pentru Wi-Fi public, streaming si confidentialitate.",
    servicii: [
      {
        name: "NordVPN",
        tagline: "Cel mai popular VPN din lume — 6000+ servere in 111 tari",
        pret: "de la 2.99€/luna",
        badge: "Recomandat",
        color: "bg-blue-600",
        url: "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=YOUR_NORDVPN_ID",
        beneficii: ["6000+ servere in 111 tari", "Viteza mare fara buffering", "Netflix, HBO Max, Disney+", "Garantie 30 zile", "Pana la 10 dispozitive simultan"],
      },
      {
        name: "Surfshark",
        tagline: "VPN rapid si accesibil — dispozitive nelimitate",
        pret: "de la 2.39€/luna",
        badge: "Cel mai ieftin",
        color: "bg-teal-600",
        url: "https://get.surfshark.net/aff_c?offer_id=926&aff_id=YOUR_SURFSHARK_ID",
        beneficii: ["Dispozitive nelimitate", "Camouflage Mode", "CleanWeb — blocare reclame", "Garantie 30 zile", "Suport 24/7"],
      },
    ],
  },
  {
    titlu: "Hosting — Gazduire Web",
    emoji: "🌐",
    desc: "Ai un site sau vrei sa lansezi unul? Alege un hosting rapid si de incredere — diferenta dintre un site lent si unul rapid.",
    servicii: [
      {
        name: "Hostinger",
        tagline: "Cel mai accesibil hosting premium — perfect pentru inceput",
        pret: "de la 2.99€/luna",
        badge: "Cel mai accesibil",
        color: "bg-violet-600",
        url: "https://www.hostinger.com/partners/YOUR_HOSTINGER_ID",
        beneficii: ["WordPress in 1 click", "SSL gratuit", "Domeniu gratuit 1 an", "Uptime 99.9%", "Suport chat 24/7 in romana"],
      },
      {
        name: "SiteGround",
        tagline: "Hosting profesional cu suport exceptional",
        pret: "de la 3.99€/luna",
        badge: "Performanta top",
        color: "bg-orange-600",
        url: "https://www.siteground.com/go/YOUR_SITEGROUND_ID",
        beneficii: ["Viteza mare (SSD NVMe)", "Copii de siguranta zilnice", "Staging environment", "Security AI", "Suport premium"],
      },
    ],
  },
  {
    titlu: "Travel — Rezervari si Vacante",
    emoji: "✈️",
    desc: "Cel mai bun pret pentru cazare, zboruri si masini de inchiriat. Compara inainte de a rezerva.",
    servicii: [
      {
        name: "Booking.com",
        tagline: "Cea mai mare platforma de cazare din lume",
        pret: "fara taxe extra",
        badge: "Cele mai multe optiuni",
        color: "bg-blue-500",
        url: "https://www.booking.com/index.html?aid=YOUR_BOOKING_ID",
        beneficii: ["1M+ proprietati in 220 tari", "Anulare gratuita la multe optiuni", "Genius — discount 10-20%", "Plata la hotel (nu in avans)", "Aplicatie mobila excelenta"],
      },
      {
        name: "Rentalcars",
        tagline: "Compara masini de inchiriat din toata lumea",
        pret: "fara taxe ascunse",
        badge: "Masini de inchiriat",
        color: "bg-green-600",
        url: "https://www.rentalcars.com/?affiliateCode=YOUR_RENTALCARS_ID",
        beneficii: ["60.000+ puncte de ridicare", "Anulare gratuita", "Pret cel mai mic garantat", "Asigurare inclusa", "Comparare instant"],
      },
    ],
  },
];

export default function RecomandariPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-12 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-slate-300">Recomandari Premium</span>
          </nav>
          <div className="text-5xl mb-5">⭐</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Recomandari <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #fb923c, #fbbf24)" }}>Premium</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Servicii online testate si recomandate de echipa AmCupon.ro. VPN pentru siguranta, hosting pentru site-ul tau, rezervari pentru vacanta perfecta.
          </p>
        </div>
      </section>

      {/* Categorii */}
      {CATEGORII.map((cat, ci) => (
        <section key={ci} className="max-w-5xl mx-auto px-4 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <span className="text-3xl">{cat.emoji}</span>
              {cat.titlu}
            </h2>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">{cat.desc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cat.servicii.map((s, si) => (
              <div key={si} className="bg-slate-900 border border-slate-800 hover:border-orange-500/30 rounded-2xl p-6 flex flex-col gap-4 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl font-black text-white">{s.name}</span>
                      <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${s.color}`}>{s.badge}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{s.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-orange-400 font-black text-sm">{s.pret}</div>
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {s.beneficii.map((b, bi) => (
                    <li key={bi} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>

                <a href={s.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="mt-auto bg-orange-500 hover:bg-orange-400 text-white font-black px-5 py-3 rounded-xl text-sm transition-all text-center shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 duration-200">
                  Incepe cu {s.name} →
                </a>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Disclaimer */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-center">
          <p className="text-slate-500 text-xs">
            Unele linkuri de mai sus sunt linkuri de afiliat — daca faci o achizitie, AmCupon.ro primeste un mic comision, fara cost suplimentar pentru tine. Recomandam doar servicii pe care le-am testat sau verificat independent.
          </p>
        </div>
      </section>
    </div>
  );
}
