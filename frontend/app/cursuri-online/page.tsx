import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";

import { numeAfisat } from "@/lib/numeMagazin";
import { maskCod } from "@/lib/maskCod";
import { linkPlatit } from "@/lib/linkPlatit";

// Adresele platformelor; linkul platit vine din output.json prin linkPlatit() (Udemy = Impact).
// 07.10.2026: Coursera NU e partener — sablonul `coursera.pxf.io/c/7761435/1/0` dadea 404.
const LINK_COURSERA = "https://www.coursera.org";
const LINK_UDEMY    = "https://www.udemy.com";
const LINK_LINKEDIN = "https://www.linkedin.com/learning";

/** Platforme de cursuri partenere afisate in grila (potrivire EXACTA pe slug; Udemy e mai jos). */
const CURSURI_PARTENERI = new Set(["internationalopenacademy.com", "novakidschool.com"]);

export const metadata: Metadata = {
  title: "Cursuri Online Romania 2026 — Platforme și Certificări",
  description: "Platforme de cursuri online cu certificat — Coursera, Udemy, LinkedIn Learning — și partenerii AmCupon, cu ofertele active când există.",
  keywords: ["cursuri online reducere", "cod reducere cursuri online", "cursuri ai romania reducere", "e-learning reducere", "certificari online ieftine", "coursera reducere"],
  alternates: { canonical: "https://amcupon.ro/cursuri-online" },
  openGraph: { title: "Cursuri Online 2026 — Platforme și Certificări | AmCupon.ro", url: "https://amcupon.ro/cursuri-online", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

const PLATFORME_INTL = [
  {
    name: "Coursera",
    tagline: "Cursuri și certificate de la universități și companii (Google, IBM, Meta)",
    badge: "Certificate",
    url: LINK_COURSERA,
    beneficii: ["Certificate profesionale Google, IBM, Meta", "Specializări în mai mulți pași, cu proiecte practice", "Perioadă de probă gratuită la Coursera Plus"],
  },
  {
    name: "Udemy",
    tagline: "Cursuri cumpărate individual, cu acces pe viață la cele cumpărate",
    badge: "Plată per curs",
    url: LINK_UDEMY,
    beneficii: ["Peste 200.000 de cursuri", "Acces pe viață la cursurile cumpărate", "Certificat de absolvire", "Aplicație pentru telefon"],
  },
  {
    name: "LinkedIn Learning",
    tagline: "Cursuri de business și tehnologie, legate de profilul tău profesional",
    badge: "Business & carieră",
    url: LINK_LINKEDIN,
    beneficii: ["Inclus în LinkedIn Premium", "Certificatele apar pe profilul LinkedIn", "Cursuri de business, tehnologie și creație"],
  },
];

const DOMENII = [
  { emoji: "🤖", titlu: "Inteligenta Artificiala & ML", desc: "Unelte AI, Python, machine learning, prompt engineering." },
  { emoji: "💻", titlu: "Programare & Web Dev", desc: "React, Next.js, Python, JavaScript, TypeScript — de la începător la avansat." },
  { emoji: "📈", titlu: "Marketing Digital", desc: "SEO, Google Ads, Meta Ads, email marketing, analytics." },
  { emoji: "🎨", titlu: "Design & UX", desc: "Figma, Adobe, UI/UX design, branding." },
  { emoji: "📊", titlu: "Date & Analiza", desc: "Excel avansat, SQL, Power BI, Tableau." },
  { emoji: "💼", titlu: "Business & Management", desc: "Project management, antreprenoriat, finanțe personale." },
];

interface Promotie { descriere?: string; cod_cupon?: string; zile_ramase?: number; }
interface Mag { magazin: string; url_afiliat: string; are_promotie: boolean; promotii: Promotie[]; categorie_slug?: string; }

export default function CursuriOnlinePage() {
  const allMag: Mag[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );
  const cursuri2p = allMag.filter(m => CURSURI_PARTENERI.has(m.magazin));

  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.08) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <Link href="/servicii" className="hover:text-[#c9ced5]">Servicii</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Cursuri Online</span>
          </nav>
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Cursuri <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #ddf93c, #ddf93c)" }}>Online</span> 2026
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto">
            Platforme de cursuri online cu certificat și partenerii AmCupon — cu ofertele lor active, când există.
          </p>
        </div>
      </section>

      {/* Domenii populare */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-xl font-black text-[#ffffff] mb-5">Ce sa inveti in 2026?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DOMENII.map((d, i) => (
            <div key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{d.emoji}</div>
              <p className="text-xs font-bold text-[#ffffff] mb-1">{d.titlu}</p>
              <p className="text-[10px] text-[#9399a0]">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cursuri din 2Performant */}
      {cursuri2p.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
          <h2 className="text-xl font-black text-[#ffffff] mb-2">Alte platforme de cursuri partenere</h2>
          <p className="text-[#c9ced5] text-sm mb-5">Când au o ofertă activă, o vezi pe card și pe pagina lor.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cursuri2p.map(m => {
              const promo = m.promotii.find(p => (p.zile_ramase ?? 99) >= 0) ?? m.promotii[0] ?? {};
              return (
                <div key={m.magazin} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/30 rounded-xl p-5 flex flex-col gap-3 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-black text-[#ffffff]">{numeAfisat(m.magazin)}</p>
                      <p className="text-xs text-[#9399a0]">{m.magazin}</p>
                    </div>
                  </div>
                  {promo.descriere && <p className="text-[#c9ced5] text-sm">{promo.descriere.slice(0,120)}</p>}
                  {promo.cod_cupon && (
                    <div className="bg-[#1f2329] border border-dashed border-[#3a4048] rounded-lg px-3 py-2 text-center">
                      <p className="text-[10px] text-[#9399a0] mb-0.5">Cod reducere</p>
                      <p className="font-mono font-black text-[#ddf93c] text-sm tracking-wider">{maskCod(promo.cod_cupon)}</p>
                    </div>
                  )}
                  <Link href={`/cod-reducere/${m.magazin}`}
                    className="mt-auto bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] text-sm font-bold py-2.5 rounded-lg text-center transition-all">
                    {promo.cod_cupon ? "Vezi codul" : `Vezi ${numeAfisat(m.magazin)}`} →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Platforme internationale */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-t border-[#1f2329]">
        <h2 className="text-xl font-black text-[#ffffff] mb-2">Platforme internationale recomandate</h2>
        <p className="text-[#c9ced5] text-sm mb-5">Platforme mari, cu certificat la finalul cursurilor. Prețurile și perioadele de probă le vezi pe site-ul fiecăreia.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLATFORME_INTL.map(p => (
            <div key={p.name} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/30 rounded-xl p-6 flex flex-col gap-4 transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-[#ffffff]">{p.name}</span>
                  <span className="text-[10px] font-black text-[#0c1000] bg-[#ddf93c] px-2 py-0.5 rounded-full">{p.badge}</span>
                </div>
                <p className="text-[#c9ced5] text-xs">{p.tagline}</p>
              </div>
              <ul className="space-y-1">
                {p.beneficii.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#c9ced5]">
                    <span className="text-emerald-400 shrink-0">✓</span>{b}
                  </li>
                ))}
              </ul>
              <a href={linkPlatit(p.url)} target="_blank" rel="sponsored noopener noreferrer"
                className="mt-auto bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-4 py-3 rounded-xl text-sm transition-all text-center hover:-translate-y-0.5 shadow-lg shadow-[#ddf93c]/20">
                Incearca {p.name} →
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-[#9399a0] text-xs text-center">Unele linkuri sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine.</p>
      </div>
    </div>
  );
}
