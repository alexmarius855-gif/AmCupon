import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; comision?: string;
}

export const metadata: Metadata = {
  title: "Piese Auto Online Romania 2026 — Coduri Reducere Verificate | AmCupon.ro",
  description: "Compara magazinele de piese auto, anvelope, jante si detailing din Romania. Coduri de reducere verificate zilnic — Automobilus, Janta.ro, Anvelino si altele.",
  keywords: ["piese auto online", "cod reducere piese auto", "anvelope reducere", "jante auto reducere", "detailing auto romania", "magazin piese auto romania"],
  alternates: { canonical: "https://amcupon.ro/piese-auto" },
  openGraph: { title: "Piese Auto Online Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/piese-auto", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const SUBCATEGORII = [
  { emoji: "🛞", label: "Anvelope" },
  { emoji: "⚙️", label: "Jante" },
  { emoji: "🎨", label: "Vopsele & Detailing" },
  { emoji: "🔧", label: "Piese motor" },
  { emoji: "📡", label: "Navigatie auto" },
  { emoji: "🔋", label: "Baterii auto" },
];

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g, " ").split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Piese Auto Online Romania 2026",
  "url": "https://amcupon.ro/piese-auto",
};

export default function PieseAutoPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const magazine = all.filter(m => m.categorie_slug === "automotive");
  const cuPromo = magazine.filter(m => m.are_promotie);
  const faraPromo = magazine.filter(m => !m.are_promotie);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-[#F7F9FC]">

        {/* HERO */}
        <section className="relative bg-[#F7F9FC] border-b border-[#e2e8f0] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.1) 0%, transparent 65%)" }} />
          <div className="relative max-w-5xl mx-auto px-4 pt-12 pb-10 text-center">
            <nav className="flex justify-center gap-2 text-xs text-[#64748b] mb-8">
              <Link href="/" className="hover:text-[#334155]">AmCupon.ro</Link>
              <span>/</span>
              <span className="text-[#334155]">Piese Auto</span>
            </nav>
            <div className="text-5xl mb-4">🔧</div>
            <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-4">
              Piese Auto cu <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #0d9488, #0d9488)" }}>Reducere</span> {an}
            </h1>
            <p className="text-[#475569] text-lg max-w-2xl mx-auto mb-8">
              Anvelope, jante, vopsele, navigatie si piese de motor — magazine romanesti verificate zilnic.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { val: `${magazine.length}`, label: "Magazine" },
                { val: `${cuPromo.length}`, label: "Cu reduceri" },
                { val: "Zilnic", label: "Verificat" },
              ].map(s => (
                <div key={s.label} className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl py-3 px-2">
                  <div className="text-xl font-black text-[#0f172a]">{s.val}</div>
                  <div className="text-xs text-[#64748b]">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SUBCATEGORII */}
        <section className="border-b border-[#e2e8f0] py-5 px-4">
          <div className="max-w-5xl mx-auto flex flex-wrap gap-2 justify-center">
            {SUBCATEGORII.map(c => (
              <span key={c.label} className="flex items-center gap-1.5 bg-[#ffffff] text-[#334155] font-semibold text-sm px-4 py-2 rounded-full border border-[#e2e8f0]">
                <span>{c.emoji}</span>{c.label}
              </span>
            ))}
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {cuPromo.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-black text-[#0f172a] mb-5">Oferte active acum</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cuPromo.map(m => {
                  const nume = numeAfisat(m.magazin);
                  const promo = m.promotii[0];
                  return (
                    <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                      className="group bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/40 rounded-xl p-5 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        {m.logo_url ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-[#0d9488] flex items-center justify-center text-white font-black text-lg shrink-0">
                            {nume[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-[#0f172a] text-sm">{nume}</p>
                          {m.cod_cupon && <span className="text-xs text-[#0d9488] font-bold">COD REDUCERE</span>}
                        </div>
                      </div>
                      {promo && <p className="text-[#475569] text-xs line-clamp-2 mb-2">{promo.nume}</p>}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[#64748b]">{m.promotii.length} oferte</span>
                        <span className="text-xs text-[#0d9488] font-semibold group-hover:text-[#0f766e]">Vezi →</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {faraPromo.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-black text-[#0f172a] mb-4">Toate magazinele de piese auto</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {faraPromo.map(m => {
                  const nume = numeAfisat(m.magazin);
                  return (
                    <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                      className="flex items-center gap-3 bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6]/40 rounded-xl p-3 transition-all group">
                      {m.logo_url ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 p-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#0d9488] flex items-center justify-center text-white font-black text-sm shrink-0">
                          {nume[0]}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-[#334155] group-hover:text-[#0d9488] transition-colors truncate">{nume}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* GHID */}
          <section className="mt-10 bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-6">
            <h2 className="text-lg font-black text-[#0f172a] mb-4">Cum economisesti la piese auto online?</h2>
            <ul className="space-y-2 text-sm text-[#475569]">
              <li><strong className="text-[#1e293b]">Compara pretul</strong> intre cel putin 2-3 magazine — diferentele pot fi de 15-30% pentru aceeasi piesa</li>
              <li><strong className="text-[#1e293b]">Verifica compatibilitatea</strong> cu modelul exact al masinii inainte de comanda</li>
              <li><strong className="text-[#1e293b]">Anvelopele si jantele</strong> au cele mai mari reduceri sezoniere — primavara si toamna (schimb sezonier)</li>
              <li><strong className="text-[#1e293b]">Foloseste codul de reducere</strong> afisat pe AmCupon.ro — verificat zilnic, fara cod expirat</li>
            </ul>
          </section>

          <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {[
              { href: "/echipament-moto", label: "🏍️ Echipament Moto" },
              { href: "/moto", label: "🔧 Auto-Moto General" },
              { href: "/categorii/auto-moto", label: "📂 Toate magazinele Auto" },
              { href: "/oferte-azi", label: "🔥 Oferte de azi" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="bg-[#ffffff] hover:bg-[#e2e8f0] text-[#334155] hover:text-[#0f172a] text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-[#e2e8f0]">
                {l.label}
              </Link>
            ))}
          </div>

          <p className="text-[#94a3b8] text-xs text-center mt-8">Unele linkuri sunt linkuri de afiliat. Daca faci o achizitie, AmCupon.ro primeste un comision fara cost suplimentar pentru tine.</p>
        </div>
      </div>
    </>
  );
}
