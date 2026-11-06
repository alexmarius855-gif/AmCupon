import Link from "next/link";
import { Metadata } from "next";
import { linkPlatit } from "@/lib/linkPlatit";

// ── LINKURI AFILIATE ── quicklink-uri reale 2Performant (aprobate 17.07.2026) ──
// 05.10.2026: linkurile erau quicklink-uri 2P scrise de mana, si pentru programe NEAPROBATE
// (fixato.ro, trendiva.ro nu sunt in output.json) — clic fara comision, prezentat ca partener.
// Acum vin din output.json prin linkPlatit(): partenerul primeste linkul platit, restul linkul simplu.
const LINK_FIXATO = linkPlatit("https://fixato.ro");
const LINK_MXENDURO = linkPlatit("https://mxenduro.ro");
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Echipament Moto cu Reducere România 2026 — Căști, Piese",
  description: "Căști, geci, mănuși și piese pentru motociclete și scutere, de la magazinele românești de echipament moto partenere AmCupon, precum MxEnduro.",
  keywords: ["echipament moto reducere", "căști moto ieftine", "costume motocicliști reducere", "piese moto online", "cod reducere fixato", "cod reducere mxenduro"],
  alternates: { canonical: "https://amcupon.ro/echipament-moto" },
  openGraph: { title: "Echipament Moto cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/echipament-moto", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const MAGAZINE = [
  {
    name: "Fixato",
    tagline: "Căști și echipament pentru moto, scutere, ATV și biciclete",
    badge: "Căști & siguranță",
    url: LINK_FIXATO,
    beneficii: ["Căști omologate ECE 22.06", "Geci și pantaloni cu protecții", "Mănuși pentru toate sezoanele", "Accesorii scutere și ATV"],
  },
  {
    name: "MxEnduro",
    tagline: "Piese și accesorii moto — catalog de peste 4 milioane de produse",
    badge: "Piese moto",
    url: LINK_MXENDURO,
    beneficii: ["Piese pentru orice marca/model", "Anvelope moto și scuter", "Accesorii tuning și întreținere", "Catalog uriaș, aproape orice piesă găsești"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Echipament Moto cu Reducere România 2026",
  "url": "https://amcupon.ro/echipament-moto",
};

export default function EchipamentMotoPage() {
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* HERO */}
        <section className="relative bg-[var(--background)] border-b border-[var(--border)] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[var(--text-muted)] mb-8">
              <Link href="/" className="hover:text-[var(--text-soft)]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[var(--text-soft)]">Echipament Moto</span>
            </nav>
            <div className="text-5xl mb-4">🏍️</div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4">
              Echipament <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>Moto</span> {an}
            </h1>
            <p className="text-[var(--text-soft)] text-lg max-w-2xl mx-auto">
              Căști, geci, mănuși și piese pentru motociclete și scutere — magazine românești de profil.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MAGAZINE.map(m => (
              <div key={m.name} className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/30 rounded-xl p-6 flex flex-col gap-4 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-black text-[var(--foreground)]">{m.name}</span>
                    <span className="text-[10px] font-black text-[#0c1000] px-2 py-0.5 rounded-full bg-[#ddf93c]">{m.badge}</span>
                  </div>
                  <p className="text-[var(--text-soft)] text-xs">{m.tagline}</p>
                </div>
                <ul className="space-y-1">
                  {m.beneficii.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-soft)]">
                      <span className="text-[var(--accent-text)] shrink-0">✓</span>{b}
                    </li>
                  ))}
                </ul>
                <a href={m.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="mt-auto bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-4 py-3 rounded-xl text-sm transition-all text-center hover:-translate-y-0.5">
                  Vezi {m.name} →
                </a>
              </div>
            ))}
          </div>

          {/* GHID */}
          <section className="mt-10 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-black text-[var(--foreground)] mb-4">Cum alegi echipamentul moto potrivit?</h2>
            <ul className="space-y-2 text-sm text-[var(--text-soft)]">
              <li><strong className="text-[var(--text-soft)]">Casca</strong> — verifică întotdeauna omologarea ECE 22.06, mărimea corectă contează mai mult decât designul</li>
              <li><strong className="text-[var(--text-soft)]">Geaca și pantaloni</strong> — caută protecții CE la coate, umeri, genunchi și spate</li>
              <li><strong className="text-[var(--text-soft)]">Sezonalitate</strong> — echipamentul de iarnă (impermeabil, căptușeală termică) e de obicei mai ieftin în afara sezonului</li>
              <li><strong className="text-[var(--text-soft)]">Piese de schimb</strong> — compară prețul între 2-3 magazine, diferențele pot fi semnificative</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/piese-auto", label: "🔧 Piese Auto" },
              { href: "/moto", label: "🚗 Auto-Moto General" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-[var(--surface)] hover:bg-[var(--surface-alt)] text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[var(--border)]">
                {l.label}
              </Link>
            ))}
          </div>

          <p className="text-[var(--text-muted)] text-xs text-center mt-8">Unele linkuri sunt linkuri de afiliat. Dacă faci o achiziție, AmCupon.ro primește un comision fără cost suplimentar pentru tine.</p>
        </section>
      </div>
    </>
  );
}
