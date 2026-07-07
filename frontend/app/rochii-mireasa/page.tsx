import Link from "next/link";
import { Metadata } from "next";

// ── LINKURI AFILIATE ── de actualizat dupa aprobare pe 2Performant ─────────
// Trendiva, Viada si DYFashion sunt programe REALE pe 2Performant (categoria
// Fashion), NU sunt inca aprobate pentru contul AmCupon — aplica din
// 2Performant > Affiliate Programs, apoi inlocuieste cu quicklink-ul real.
const LINK_TRENDIVA  = "https://trendiva.ro";  // aplicare necesara pe 2Performant
const LINK_VIADA     = "https://viada.ro";     // aplicare necesara pe 2Performant
const LINK_DYFASHION = "https://dyfashion.ro"; // aplicare necesara pe 2Performant
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Rochii de Mireasa si Ocazie cu Reducere 2026 | AmCupon.ro",
  description: "Rochii de mireasa, domnisoare de onoare si ocazii speciale la preturi reduse. Trendiva, Viada, DYFashion — coduri de reducere verificate pe AmCupon.ro.",
  keywords: ["rochii mireasa reducere", "rochii ocazie reducere", "cod reducere rochii nunta", "rochii domnisoare de onoare", "rochii elegante reducere"],
  alternates: { canonical: "https://amcupon.ro/rochii-mireasa" },
  openGraph: { title: "Rochii de Mireasa si Ocazie cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/rochii-mireasa", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const MAGAZINE = [
  {
    name: "Trendiva",
    tagline: "Brand romanesc de rochii elegante — ocazie, seara, bal si nunta",
    badge: "Rochii nunta & gala",
    url: LINK_TRENDIVA,
    beneficii: ["Gama larga de rochii de ocazie si nunta", "Brand 100% romanesc", "Descrieri detaliate pe marimi", "Livrare in toata tara"],
  },
  {
    name: "Viada",
    tagline: "Rochii elegante, costume office, plus size — pentru orice eveniment",
    badge: "Elegant & plus size",
    url: LINK_VIADA,
    beneficii: ["Marimi extinse, inclusiv plus size", "Rochii elegante pentru nunta ca invitata", "Costume si blazere asortate", "Colectii reinnoite frecvent"],
  },
  {
    name: "DYFashion",
    tagline: "Rochii de seara si zi, tinute office si plaja — catalog variat",
    badge: "Catalog variat",
    url: LINK_DYFASHION,
    beneficii: ["Rochii de seara si ocazie", "Accesorii si genti asortate", "Preturi accesibile", "Tinute pentru toate evenimentele"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Rochii de Mireasa si Ocazie cu Reducere 2026",
  "url": "https://amcupon.ro/rochii-mireasa",
};

export default function RochiiMireasaPage() {
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#F7F9FC]">

        {/* HERO */}
        <section className="relative bg-[#F7F9FC] border-b border-[#e2e8f0] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[#64748b] mb-8">
              <Link href="/" className="hover:text-[#334155]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[#334155]">Rochii Mireasa & Ocazie</span>
            </nav>
            <div className="text-5xl mb-4">👰</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">
              Rochii de <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0d9488, #0d9488)" }}>Mireasa</span> & Ocazie {an}
            </h1>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto">
              Pentru mireasa, domnisoare de onoare sau invitati — magazine romanesti verificate.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <h2 className="text-lg font-black text-[#0f172a] mb-4">Cum alegi rochia potrivita pentru nunta?</h2>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li><strong className="text-[#1e293b]">Comanda din timp</strong> — rochiile de mireasa personalizate pot dura 4-8 saptamani de la comanda</li>
              <li><strong className="text-[#1e293b]">Domnisoare de onoare</strong> — alege un model usor de reprodus in mai multe marimi, nu personalizat excesiv</li>
              <li><strong className="text-[#1e293b]">Invitata la nunta</strong> — evita albul si nuantele foarte deschise, verifica dress code-ul</li>
              <li><strong className="text-[#1e293b]">Reduceri sezoniere</strong> — cele mai mari reduceri la rochii de ocazie apar dupa Craciun si dupa sezonul de nunti (sept-oct)</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/bijuterii", label: "💍 Bijuterii" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/frumusete", label: "💄 Frumusete" },
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
