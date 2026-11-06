import { Metadata } from "next";
import Link from "next/link";
import { pesteMagazine } from "@/lib/cifreSite";

export const metadata: Metadata = {
  title: "Idei Cadouri 2026 — Cadouri pentru Orice Ocazie | AmCupon.ro",
  description: "Cele mai bune idei de cadouri pentru orice ocazie: botez, naștere, Valentine, Crăciun, nași, mama, tata. Produse cu prețuri reale, de la magazinele partenere.",
  keywords: ["idei cadouri românia", "cadouri originale", "cadouri botez", "cadouri nași", "cadouri naștere", "cadouri valentine", "cadouri crăciun", "cadouri mama"],
  alternates: { canonical: "https://amcupon.ro/cadouri" },
  openGraph: {
    title: "Idei Cadouri pentru Orice Ocazie | AmCupon.ro",
    description: `Cadouri botez, nași, Valentine, Crăciun, naștere — idei cu prețuri reale de la ${pesteMagazine()} partenere.`,
    url: "https://amcupon.ro/cadouri",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const OCAZII = [
  { slug: "ea",         emoji: "💝", titlu: "Cadouri pentru Ea",       desc: "Bijuterii, fashion, parfumuri", color: "#ddf93c", popular: true },
  { slug: "el",         emoji: "🎁", titlu: "Cadouri pentru El",       desc: "Electronice, auto, sport",     color: "#ddf93c", popular: true },
  { slug: "copii",      emoji: "🧸", titlu: "Cadouri Copii",           desc: "Jucării, cărți, sport",        color: "#ddf93c", popular: true },
  { slug: "mama",       emoji: "🌸", titlu: "Cadouri Mama",            desc: "Bijuterii, cosmetice, răsfăț", color: "#ddf93c", popular: true },
  { slug: "tata",       emoji: "👨", titlu: "Cadouri Tata",            desc: "Gadgeturi, auto, unelte",      color: "#1f2329", popular: false },
  { slug: "botez",      emoji: "👶", titlu: "Cadouri Botez",           desc: "Bijuterii argint, personalizate", color: "#ddf93c", popular: true },
  { slug: "nasi",       emoji: "💍", titlu: "Cadouri Nași",            desc: "Bijuterii premium, elegante",  color: "#7c3aed", popular: true },
  { slug: "nastere",    emoji: "🎂", titlu: "Cadouri Naștere",         desc: "Bijuterii, parfumuri, gadgeturi", color: "#ddf93c", popular: false },
  { slug: "valentine",  emoji: "❤️", titlu: "Valentine's Day",         desc: "Bijuterii romantice, parfumuri", color: "#e64343", popular: false },
  { slug: "craciun",    emoji: "🎄", titlu: "Cadouri Crăciun",         desc: "Cadouri pentru toată familia", color: "#16a34a", popular: false },
  { slug: "absolvire",  emoji: "🎓", titlu: "Cadouri Absolvire",       desc: "Gadgeturi, bijuterii, cărți",  color: "#ddf93c", popular: false },
  { slug: "pasti",      emoji: "🐣", titlu: "Cadouri Paște",           desc: "Seturi cadou, bijuterii, flori", color: "#84cc16", popular: false },
];

const SFATURI = [
  { emoji: "🎯", titlu: "Personalizează cadoul", desc: "Un cadou cu gravură sau personalizat cu numele destinatarului are valoare emoțională mult mai mare." },
  { emoji: "💰", titlu: "Buget recomandat", desc: "Nași/Fini: 300-1000 RON. Familie apropiată: 150-500 RON. Prieteni: 50-200 RON. Colegi: 30-100 RON." },
  { emoji: "⏰", titlu: "Comandă din timp", desc: "Termenele de livrare diferă de la un magazin la altul; în perioada sărbătorilor comandă cu cel puțin o săptămână înainte." },
  { emoji: "📦", titlu: "Ambalaj premium", desc: "Multe magazine oferă ambalaj cadou gratuit sau contra cost. Întreabă la checkout — face diferența!" },
];

export default function CadouriPage() {
  const populare = OCAZII.filter(o => o.popular);
  const altele   = OCAZII.filter(o => !o.popular);

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* Header breadcrumb */}
      <header className="bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-[#ddf93c] text-[#0c1000] font-black text-sm px-1.5 py-0.5 rounded-md">Am</div>
            <span className="font-black text-[var(--foreground)]">Cupon.ro</span>
          </Link>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="text-[var(--text-soft)] font-semibold">Idei Cadouri</span>
        </div>
      </header>

      {/* Hero */}
      <div className="relative py-12 px-4 text-center overflow-hidden border-b border-[var(--border)]"
        style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.08) 0%, rgba(236,72,153,0.06) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(13,148,136,0.12) 0%, transparent 70%)" }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="text-5xl mb-4">🎁</div>
          <h1 className="text-3xl md:text-4xl font-black text-[var(--foreground)] mb-3">
            Idei Cadouri pentru Orice Ocazie
          </h1>
          <p className="text-[var(--text-soft)] text-base mb-6 max-w-xl mx-auto">
            De la botez la Crăciun, de la nași la mama — găsești cadoul perfect
            de la <span className="text-[var(--foreground)] font-bold">{pesteMagazine()}</span> partenere.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            {[
              { v: "12", l: "Ocazii acoperite" },
              { v: "6000+", l: "Produse disponibile" },
              { v: "291+", l: "Magazine partenere" },
              { v: "24h", l: "Livrare medie" },
            ].map(s => (
              <div key={s.l} className="bg-[var(--surface)]/80 border border-[var(--border-strong)] rounded-xl px-4 py-2 text-center">
                <div className="text-[var(--accent-text)] font-black text-lg">{s.v}</div>
                <div className="text-[var(--text-muted)] text-xs">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Ocazii populare */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-[var(--foreground)]">Ocazii populare</h2>
            <span className="text-xs text-[var(--accent-text)] bg-[#ddf93c]/10 border border-[var(--accent-text)]/20 px-2 py-0.5 rounded-full font-bold">TRENDING</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {populare.map(o => (
              <Link
                key={o.slug}
                href={`/cadouri/${o.slug}`}
                className="group relative rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--border-strong)] transition-all hover:-translate-y-1 hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${o.color}15 0%, ${o.color}08 100%)` }}
              >
                <div className="p-5">
                  <div className="text-4xl mb-3">{o.emoji}</div>
                  <h3 className="text-[var(--foreground)] font-black text-base mb-1 group-hover:text-[var(--accent-text)] transition-colors">{o.titlu}</h3>
                  <p className="text-[var(--text-muted)] text-xs mb-3">{o.desc}</p>
                  <div
                    className="inline-flex items-center gap-1 text-xs font-bold"
                    style={{ color: `color-mix(in srgb, ${o.color} 45%, var(--foreground))` }}
                  >
                    Vezi idei <span>→</span>
                  </div>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${o.color}, transparent)` }}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Alte ocazii */}
        <section className="mb-12">
          <h2 className="text-lg font-black text-[var(--foreground)] mb-4">Toate ocaziile</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {altele.map(o => (
              <Link
                key={o.slug}
                href={`/cadouri/${o.slug}`}
                className="group flex flex-col items-center text-center bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-xl p-4 transition-all hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-2">{o.emoji}</div>
                <div className="text-[var(--foreground)] text-xs font-bold group-hover:text-[var(--accent-text)] transition-colors">{o.titlu}</div>
                <div className="text-[var(--text-muted)] text-[10px] mt-1">{o.desc}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Filtre buget */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-black text-[var(--foreground)]">Cadouri după buget</h2>
            <span className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">NOU</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { slug: "sub-100-lei",  emoji: "💰", label: "Sub 100 Lei",     desc: "Cadouri accesibile",   from: "#22c55e", to: "#10b981" },
              { slug: "sub-200-lei",  emoji: "🎁", label: "Sub 200 Lei",     desc: "Raport preț/calitate", from: "#ddf93c", to: "#c3dd2c" },
              { slug: "sub-500-lei",  emoji: "💎", label: "Sub 500 Lei",     desc: "Cadouri premium",      from: "#ddf93c", to: "#ddf93c" },
              { slug: "peste-500-lei",emoji: "👑", label: "Peste 500 Lei",   desc: "Cadouri de lux",       from: "#7c3aed", to: "#c084fc" },
            ].map(b => (
              <Link
                key={b.slug}
                href={`/cadouri/${b.slug}`}
                className="group relative rounded-xl border border-[var(--border)] hover:border-[var(--border-strong)] transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${b.from}15 0%, ${b.to}08 100%)` }}
              >
                <div className="p-5 text-center">
                  <div className="text-4xl mb-3">{b.emoji}</div>
                  <div className="text-[var(--foreground)] font-black text-sm mb-1 group-hover:text-[var(--accent-text)] transition-colors">{b.label}</div>
                  <div className="text-[var(--text-muted)] text-xs">{b.desc}</div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${b.from}, transparent)` }} />
              </Link>
            ))}
          </div>
        </section>

        {/* Sfaturi */}
        <section className="mb-10">
          <h2 className="text-lg font-black text-[var(--foreground)] mb-4">Sfaturi pentru alegerea cadoului perfect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SFATURI.map((s, i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                <div className="text-2xl mb-2">{s.emoji}</div>
                <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">{s.titlu}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Link magazine relevante */}
        <section className="border-t border-[var(--border)] pt-8">
          <h2 className="text-base font-bold text-[var(--foreground)] mb-4">Magazine recomandate pentru cadouri</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/noriel", label: "Noriel — Jucării" },
              { href: "/carturesti", label: "Cărturești — Cărți & Cadouri" },
              { href: "/notino", label: "Notino — Parfumuri" },
              { href: "/answear", label: "Answear — Fashion" },
              { href: "/bijuterii", label: "Bijuterii & Ceasuri" },
              { href: "/sport", label: "Sport & Fitness" },
              { href: "/idei-cadouri", label: "Idei Cadouri — Ghid complet" },
            ].map(m => (
              <Link
                key={m.href}
                href={m.href}
                className="text-sm text-[var(--text-soft)] hover:text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 px-3 py-2 rounded-lg transition-all"
              >
                {m.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
