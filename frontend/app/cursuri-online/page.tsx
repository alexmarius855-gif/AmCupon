import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";

// ── LINKURI AFILIATE ── inlocuieste cu linkurile tale ──────────────────────
// Coursera: aplica la https://about.coursera.org/affiliates
// Udemy: aplica la https://www.udemy.com/affiliate/
// LinkedIn Learning: program indirect, vezi linkedin.com/learning
const LINK_COURSERA = "https://www.coursera.org/?ref=amcupon";
const LINK_UDEMY     = "https://www.udemy.com/?ref=amcupon";
const LINK_LINKEDIN  = "https://www.linkedin.com/learning/?ref=amcupon";
// ──────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Cursuri Online cu Reducere Romania 2026 — Cod Reducere Verificat | AmCupon.ro",
  description: "Coduri de reducere la cursuri online actualizate zilnic. Reduceri la platforme e-learning, cursuri AI, certificari internationale. Coursera, cursuri-ai.ro si altele.",
  keywords: ["cursuri online reducere", "cod reducere cursuri online", "cursuri ai romania reducere", "e-learning reducere", "certificari online ieftine", "coursera reducere"],
  alternates: { canonical: "https://amcupon.ro/cursuri-online" },
  openGraph: { title: "Cursuri Online cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/cursuri-online", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const PLATFORME_INTL = [
  {
    name: "Coursera",
    tagline: "Certificate de la Stanford, Google, IBM, Meta — recunoscute mondial",
    pret: "59$/luna (Plus)",
    comision: "45% din abonament",
    badge: "Certificate globale",
    badgeColor: "bg-blue-600",
    url: LINK_COURSERA,
    program: "coursera.org/affiliates",
    beneficii: ["Certificari Google, IBM, Meta", "7 zile trial gratuit", "Specializari complete (3-6 luni)", "Proiecte practice incluse", "Acces la 7000+ cursuri"],
  },
  {
    name: "Udemy",
    tagline: "Cel mai mare catalog de cursuri — odata cumparat, al tau pe viata",
    pret: "de la 14.99$ (promotii frecvente)",
    comision: "15% per vanzare",
    badge: "Cel mai ieftin",
    badgeColor: "bg-purple-600",
    url: LINK_UDEMY,
    program: "udemy.com/affiliate",
    beneficii: ["210.000+ cursuri disponibile", "Achizitie unica — acces pe viata", "Promotii la 9.99-14.99$ frecvente", "Certificate de absolvire", "App mobila inclusa"],
  },
  {
    name: "LinkedIn Learning",
    tagline: "Cursuri business si tech legate direct de profilul tau profesional",
    pret: "inclus cu LinkedIn Premium",
    comision: "program indirect via LinkedIn",
    badge: "Business & Career",
    badgeColor: "bg-blue-700",
    url: LINK_LINKEDIN,
    program: "linkedin.com/affiliate",
    beneficii: ["Integrat cu profilul LinkedIn", "Cursuri de la experti reali", "Certificate vizibile pe profil", "1 luna trial gratuit", "Recomandate de angajatori"],
  },
];

const DOMENII = [
  { emoji: "🤖", titlu: "Inteligenta Artificiala & ML", desc: "ChatGPT, Python, machine learning, prompt engineering. Cele mai cautate competente in 2026." },
  { emoji: "💻", titlu: "Programare & Web Dev", desc: "React, Next.js, Python, JavaScript, TypeScript. Reconversie profesionala completa." },
  { emoji: "📈", titlu: "Marketing Digital", desc: "SEO, Google Ads, Meta Ads, email marketing, analytics. Demand enorm pe piata." },
  { emoji: "🎨", titlu: "Design & UX", desc: "Figma, Adobe, UI/UX design, branding. Freelancing profitabil din zi 1." },
  { emoji: "📊", titlu: "Date & Analiza", desc: "Excel avansat, SQL, Power BI, Tableau. Cerute in orice companie." },
  { emoji: "💼", titlu: "Business & Management", desc: "Project management, antreprenoriat, finante personale. Certificari recunoscute global." },
];

interface Promotie { descriere?: string; cod_cupon?: string; zile_ramase?: number; }
interface Mag { magazin: string; url_afiliat: string; are_promotie: boolean; promotii: Promotie[]; comision?: string; }

export default function CursuriOnlinePage() {
  const allMag: Mag[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );
  const cursuri2p = allMag.filter(m =>
    ["dacris.net"].includes(m.magazin) ||
    m.magazin.toLowerCase().includes("curs") ||
    m.magazin.toLowerCase().includes("edu") ||
    (m as any).categorie_slug === "software"
  );

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <section className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
            <span>/</span>
            <Link href="/servicii" className="hover:text-slate-300">Servicii</Link>
            <span>/</span>
            <span className="text-slate-300">Cursuri Online</span>
          </nav>
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Cursuri Online cu <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #a78bfa)" }}>Reducere</span> 2026
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Platforme e-learning si cursuri cu certificare verificate. Investitia in educatie cu cel mai mare ROI din 2026.
          </p>
        </div>
      </section>

      {/* Domenii populare */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-black text-white mb-5">Ce sa inveti in 2026?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DOMENII.map((d, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{d.emoji}</div>
              <p className="text-xs font-bold text-white mb-1">{d.titlu}</p>
              <p className="text-[10px] text-slate-500">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cursuri din 2Performant */}
      {cursuri2p.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-800">
          <h2 className="text-xl font-black text-white mb-2">Platforme romanesti cu reduceri active</h2>
          <p className="text-slate-400 text-sm mb-5">Parteneri verificati — comisioane active pe 2Performant.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cursuri2p.map(m => {
              const promo = m.promotii.find(p => (p.zile_ramase ?? 99) >= 0) ?? m.promotii[0] ?? {};
              return (
                <div key={m.magazin} className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-xl p-5 flex flex-col gap-3 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-white">{m.magazin.split(".")[0].charAt(0).toUpperCase() + m.magazin.split(".")[0].slice(1)}</p>
                      <p className="text-xs text-slate-500">{m.magazin}</p>
                    </div>
                    {m.comision && <span className="text-indigo-400 text-xs font-bold">{m.comision.replace(" sale commission","")}</span>}
                  </div>
                  {promo.descriere && <p className="text-slate-300 text-sm">{promo.descriere.slice(0,120)}</p>}
                  {promo.cod_cupon && (
                    <div className="bg-slate-800 border border-dashed border-slate-600 rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] text-slate-500 mb-0.5">Cod reducere</p>
                      <p className="font-mono font-black text-indigo-400 text-sm tracking-wider">{promo.cod_cupon}</p>
                    </div>
                  )}
                  <a href={m.url_afiliat} target="_blank" rel="sponsored noopener noreferrer"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 rounded-lg text-center transition-all">
                    Vezi cursurile →
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Platforme internationale */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-slate-800">
        <h2 className="text-xl font-black text-white mb-2">Platforme internationale recomandate</h2>
        <p className="text-slate-400 text-sm mb-5">Certificate recunoscute mondial — investitie in cariera pe termen lung.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLATFORME_INTL.map(p => (
            <div key={p.name} className="bg-slate-900 border border-slate-800 hover:border-cyan-500/30 rounded-2xl p-6 flex flex-col gap-4 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-white">{p.name}</span>
                  <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                </div>
                <p className="text-slate-400 text-xs">{p.tagline}</p>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-400 font-bold">{p.pret}</span>
                <span className="text-emerald-400 text-xs">{p.comision}</span>
              </div>
              <ul className="space-y-1">
                {p.beneficii.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 shrink-0">✓</span>{b}
                  </li>
                ))}
              </ul>
              <a href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                className="mt-auto bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-3 rounded-xl text-sm transition-all text-center hover:-translate-y-0.5 shadow-lg shadow-cyan-500/20">
                Incearca {p.name} →
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-slate-600 text-xs text-center">Unele linkuri sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine.</p>
      </div>
    </div>
  );
}
