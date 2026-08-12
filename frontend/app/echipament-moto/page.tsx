import Link from "next/link";
import { Metadata } from "next";

// ── LINKURI AFILIATE ── quicklink-uri reale 2Performant (aprobate 17.07.2026) ──
const LINK_FIXATO = "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=541547473&unique=bb3071a7d&redirect_to=https%3A%2F%2Ffixato.ro";
const LINK_MXENDURO = "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=541547473&unique=bb3071a7d&redirect_to=https%3A%2F%2Fmxenduro.ro";
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Echipament Moto cu Reducere Romania 2026 — Casti, Piese | AmCupon.ro",
  description: "Casti, geci, manusi si piese pentru motociclete si scutere. Comparatie Fixato si MxEnduro — coduri de reducere verificate pe AmCupon.ro.",
  keywords: ["echipament moto reducere", "casti moto ieftine", "costume motociclisti reducere", "piese moto online", "cod reducere fixato", "cod reducere mxenduro"],
  alternates: { canonical: "https://amcupon.ro/echipament-moto" },
  openGraph: { title: "Echipament Moto cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/echipament-moto", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const MAGAZINE = [
  {
    name: "Fixato",
    tagline: "Casti si echipament pentru moto, scutere, ATV si biciclete",
    badge: "Casti & siguranta",
    url: LINK_FIXATO,
    beneficii: ["Casti omologate ECE 22.06", "Geci si pantaloni cu protectii", "Manusi pentru toate sezoanele", "Accesorii scutere si ATV"],
  },
  {
    name: "MxEnduro",
    tagline: "Piese si accesorii moto — catalog de peste 4 milioane de produse",
    badge: "Piese moto",
    url: LINK_MXENDURO,
    beneficii: ["Piese pentru orice marca/model", "Anvelope moto si scuter", "Accesorii tuning si intretinere", "Catalog uriaș, aproape orice piesa gasesti"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Echipament Moto cu Reducere Romania 2026",
  "url": "https://amcupon.ro/echipament-moto",
};

export default function EchipamentMotoPage() {
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#06080b]">

        {/* HERO */}
        <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
              <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[#c9ced5]">Echipament Moto</span>
            </nav>
            <div className="text-5xl mb-4">🏍️</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
              Echipament <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>Moto</span> {an}
            </h1>
            <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto">
              Casti, geci, manusi si piese pentru motociclete si scutere — partenerii nostri verificati.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MAGAZINE.map(m => (
              <div key={m.name} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/30 rounded-xl p-6 flex flex-col gap-4 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-black text-[#ffffff]">{m.name}</span>
                    <span className="text-[10px] font-black text-[#0c1000] px-2 py-0.5 rounded-full bg-[#ddf93c]">{m.badge}</span>
                  </div>
                  <p className="text-[#c9ced5] text-xs">{m.tagline}</p>
                </div>
                <ul className="space-y-1">
                  {m.beneficii.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#c9ced5]">
                      <span className="text-[#ddf93c] shrink-0">✓</span>{b}
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
          <section className="mt-10 bg-[#14181c] border border-[#1f2329] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#ffffff] mb-4">Cum alegi echipamentul moto potrivit?</h2>
            <ul className="space-y-2 text-sm text-[#c9ced5]">
              <li><strong className="text-[#c9ced5]">Casca</strong> — verifica intotdeauna omologarea ECE 22.06, marimea corecta conteaza mai mult decat designul</li>
              <li><strong className="text-[#c9ced5]">Geaca si pantaloni</strong> — cauta protectii CE la coate, umeri, genunchi si spate</li>
              <li><strong className="text-[#c9ced5]">Sezonalitate</strong> — echipamentul de iarna (impermeabil, captuseala termica) costa cel mai putin vara</li>
              <li><strong className="text-[#c9ced5]">Piese de schimb</strong> — compara pretul intre 2-3 magazine, diferentele pot fi semnificative</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/piese-auto", label: "🔧 Piese Auto" },
              { href: "/moto", label: "🚗 Auto-Moto General" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-[#14181c] hover:bg-[#1f2329] text-[#c9ced5] hover:text-[#ffffff] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#1f2329]">
                {l.label}
              </Link>
            ))}
          </div>

          <p className="text-[#9399a0] text-xs text-center mt-8">Unele linkuri sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine.</p>
        </section>
      </div>
    </>
  );
}
