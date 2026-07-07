import Link from "next/link";
import { Metadata } from "next";

// ── LINKURI AFILIATE ── de actualizat dupa aprobare pe 2Performant ─────────
// Fixato si MxEnduro sunt programe REALE pe 2Performant, NU sunt inca aprobate
// pentru contul AmCupon — aplica din 2Performant > Affiliate Programs, apoi
// inlocuieste linkul de mai jos cu quicklink-ul real (vezi CLAUDE.md pentru format).
const LINK_FIXATO = "https://fixato.ro";     // aplicare necesara pe 2Performant
const LINK_MXENDURO = "https://mxenduro.ro"; // aplicare necesara pe 2Performant
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
      <div className="min-h-screen bg-[#F7F9FC]">

        {/* HERO */}
        <section className="relative bg-[#F7F9FC] border-b border-[#e2e8f0] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(20,184,166,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[#64748b] mb-8">
              <Link href="/" className="hover:text-[#334155]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[#334155]">Echipament Moto</span>
            </nav>
            <div className="text-5xl mb-4">🏍️</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">
              Echipament <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0d9488, #0d9488)" }}>Moto</span> {an}
            </h1>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Casti, geci, manusi si piese pentru motociclete si scutere — partenerii nostri verificati.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MAGAZINE.map(m => (
              <div key={m.name} className="bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/30 rounded-xl p-6 flex flex-col gap-4 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-black text-[#0f172a]">{m.name}</span>
                    <span className="text-[10px] font-black text-white px-2 py-0.5 rounded-full bg-[#0d9488]">{m.badge}</span>
                  </div>
                  <p className="text-[#475569] text-xs">{m.tagline}</p>
                </div>
                <ul className="space-y-1">
                  {m.beneficii.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                      <span className="text-[#0d9488] shrink-0">✓</span>{b}
                    </li>
                  ))}
                </ul>
                <a href={m.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="mt-auto bg-[#0d9488] hover:bg-[#14b8a6] text-white font-black px-4 py-3 rounded-xl text-sm transition-all text-center hover:-translate-y-0.5">
                  Vezi {m.name} →
                </a>
              </div>
            ))}
          </div>

          {/* GHID */}
          <section className="mt-10 bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#0f172a] mb-4">Cum alegi echipamentul moto potrivit?</h2>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li><strong className="text-[#1e293b]">Casca</strong> — verifica intotdeauna omologarea ECE 22.06, marimea corecta conteaza mai mult decat designul</li>
              <li><strong className="text-[#1e293b]">Geaca si pantaloni</strong> — cauta protectii CE la coate, umeri, genunchi si spate</li>
              <li><strong className="text-[#1e293b]">Sezonalitate</strong> — echipamentul de iarna (impermeabil, captuseala termica) costa cel mai putin vara</li>
              <li><strong className="text-[#1e293b]">Piese de schimb</strong> — compara pretul intre 2-3 magazine, diferentele pot fi semnificative</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/piese-auto", label: "🔧 Piese Auto" },
              { href: "/moto", label: "🚗 Auto-Moto General" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-[#ffffff] hover:bg-[#e2e8f0] text-[#334155] hover:text-[#0f172a] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#e2e8f0]">
                {l.label}
              </Link>
            ))}
          </div>

          <p className="text-[#94a3b8] text-xs text-center mt-8">Unele linkuri sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine.</p>
        </section>
      </div>
    </>
  );
}
