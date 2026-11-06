import Link from "next/link";
import { Metadata } from "next";
import { linkPlatit } from "@/lib/linkPlatit";

// ── LINKURI AFILIATE ── quicklink-uri reale 2Performant (aprobate 17.07.2026) ──
// 05.10.2026: linkurile erau quicklink-uri 2P scrise de mana, si pentru programe NEAPROBATE
// (fixato.ro, trendiva.ro nu sunt in output.json) — clic fara comision, prezentat ca partener.
// Acum vin din output.json prin linkPlatit(): partenerul primeste linkul platit, restul linkul simplu.
const LINK_TRENDIVA  = linkPlatit("https://trendiva.ro");
const LINK_VIADA     = linkPlatit("https://viada.ro");
const LINK_DYFASHION = linkPlatit("https://dyfashion.ro");
// ─────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Rochii de Mireasă și Ocazie cu Reducere 2026 | AmCupon.ro",
  description: "Rochii de mireasă, domnișoare de onoare și ocazii speciale la prețuri reduse. Trendiva, Viada, DYFashion — magazine românești de rochii și ținute de ocazie.",
  keywords: ["rochii mireasă reducere", "rochii ocazie reducere", "cod reducere rochii nuntă", "rochii domnișoare de onoare", "rochii elegante reducere"],
  alternates: { canonical: "https://amcupon.ro/rochii-mireasa" },
  openGraph: { title: "Rochii de Mireasă și Ocazie cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/rochii-mireasa", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const MAGAZINE = [
  {
    name: "Trendiva",
    tagline: "Brand românesc de rochii elegante — ocazie, seară, bal și nuntă",
    badge: "Rochii nuntă & gala",
    url: LINK_TRENDIVA,
    beneficii: ["Gamă largă de rochii de ocazie și nuntă", "Brand 100% românesc", "Descrieri detaliate pe mărimi", "Livrare în toată țara"],
  },
  {
    name: "Viada",
    tagline: "Rochii elegante, costume office, plus size — pentru orice eveniment",
    badge: "Elegant & plus size",
    url: LINK_VIADA,
    beneficii: ["Mărimi extinse, inclusiv plus size", "Rochii elegante pentru nuntă ca invitată", "Costume și blazere asortate", "Colecții reînnoite frecvent"],
  },
  {
    name: "DYFashion",
    tagline: "Rochii de seară și zi, ținute office și plajă — catalog variat",
    badge: "Catalog variat",
    url: LINK_DYFASHION,
    beneficii: ["Rochii de seară și ocazie", "Accesorii și genți asortate", "Prețuri accesibile", "Ținute pentru toate evenimentele"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Rochii de Mireasă și Ocazie cu Reducere 2026",
  "url": "https://amcupon.ro/rochii-mireasa",
};

export default function RochiiMireasaPage() {
  const an = new Date().getFullYear();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* HERO */}
        <section className="relative bg-[var(--background)] border-b border-[var(--border)] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[var(--text-muted)] mb-8">
              <Link href="/" className="hover:text-[var(--text-soft)]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[var(--text-soft)]">Rochii Mireasă & Ocazie</span>
            </nav>
            <div className="text-5xl mb-4">👰</div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4">
              Rochii de <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>Mireasa</span> & Ocazie {an}
            </h1>
            <p className="text-[var(--text-soft)] text-lg max-w-2xl mx-auto">
              Pentru mireasă, domnișoare de onoare sau invitați — magazine românești de profil.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
            <h2 className="text-lg font-black text-[var(--foreground)] mb-4">Cum alegi rochia potrivită pentru nuntă?</h2>
            <ul className="space-y-2 text-sm text-[var(--text-soft)]">
              <li><strong className="text-[var(--text-soft)]">Comandă din timp</strong> — rochiile de mireasă personalizate pot dura 4-8 săptămâni de la comandă</li>
              <li><strong className="text-[var(--text-soft)]">Domnișoare de onoare</strong> — alege un model ușor de reprodus în mai multe mărimi, nu personalizat excesiv</li>
              <li><strong className="text-[var(--text-soft)]">Invitată la nuntă</strong> — evită albul și nuanțele foarte deschise, verifică dress code-ul</li>
              <li><strong className="text-[var(--text-soft)]">Reduceri sezoniere</strong> — cele mai mari reduceri la rochii de ocazie apar după Crăciun și după sezonul de nunți (sept-oct)</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/bijuterii", label: "💍 Bijuterii" },
              { href: "/fashion", label: "👗 Fashion" },
              { href: "/frumusete", label: "💄 Frumusețe" },
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
