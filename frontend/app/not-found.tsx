import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

export const metadata: Metadata = {
  title: "404 — Pagina nu a fost găsită | AmCupon.ro",
  robots: { index: false, follow: true },
};

function loadTopStores() {
  try {
    const filePath = path.join(process.cwd(), "public", "output.json");
    const data: { magazin: string; are_promotie: boolean; promotii: { cod_cupon: string }[] }[] =
      JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data
      .filter((m) => m.are_promotie)
      .slice(0, 8);
  } catch {
    return [];
  }
}

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function NotFound() {
  const topStores = loadTopStores();

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col">
      {/* Header */}
      <header className="bg-[#F7F9FC] border-b border-[#e2e8f0]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="bg-[#0d9488] text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-[#0f172a] text-xl">Cupon</span>
            <span className="text-[#0d9488] font-black text-xl">.ro</span>
          </Link>
          <a
            href="/"
            className="text-sm text-[#0d9488] hover:text-[#0f766e] font-semibold transition-colors"
          >
            ← Toate reducerile
          </a>
        </div>
      </header>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(13,148,136,0.15) 0%, transparent 65%)" }} />
        {/* 404 Visual */}
        <div className="relative z-10 mb-6 select-none">
          <div className="text-[120px] md:text-[160px] font-black text-[#ffffff] leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🎟️</span>
          </div>
        </div>

        <h1 className="relative z-10 text-2xl md:text-3xl font-black text-[#0f172a] mb-3">
          Cuponul s-a pierdut undeva...
        </h1>
        <p className="relative z-10 text-[#475569] text-base mb-8 max-w-sm">
          Pagina pe care o cauți nu există sau a fost mutată.
          Încearcă una dintre opțiunile de mai jos.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-12">
          <a
            href="/"
            className="bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-[#14b8a6]/20"
          >
            🏠 Acasă — toate reducerile
          </a>
          <a
            href="/toate-magazinele"
            className="bg-[#ffffff] border border-[#cbd5e1] hover:border-[#14b8a6] text-[#334155] hover:text-[#0d9488] font-bold px-7 py-3 rounded-xl transition-colors"
          >
            🏪 Toate magazinele
          </a>
          <a
            href="/categorii"
            className="bg-[#ffffff] border border-[#cbd5e1] hover:border-[#14b8a6] text-[#334155] hover:text-[#0d9488] font-bold px-7 py-3 rounded-xl transition-colors"
          >
            📂 Categorii
          </a>
        </div>

        {/* Quick category links */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl w-full mb-12">
          {[
            { emoji: "👗", label: "Fashion", href: "/categorii/fashion" },
            { emoji: "💻", label: "Electronice", href: "/categorii/electronice" },
            { emoji: "💄", label: "Frumusețe", href: "/categorii/beauty" },
            { emoji: "🧸", label: "Jucării", href: "/categorii/copii" },
          ].map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="flex flex-col items-center gap-2 p-4 bg-[#ffffff] rounded-xl border border-[#e2e8f0] hover:border-[#14b8a6]/50 hover:shadow-lg hover:shadow-slate-300/60 transition-all"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold text-[#334155]">{c.label}</span>
            </a>
          ))}
        </div>

        {/* Top stores with promos */}
        {topStores.length > 0 && (
          <div className="relative z-10 w-full max-w-2xl">
            <p className="text-sm font-semibold text-[#64748b] mb-4 uppercase tracking-wide">
              Magazine cu reduceri active acum
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topStores.map((store) => {
                const nume = numeAfisat(store.magazin);
                const hasCod = store.promotii.some((p) => p.cod_cupon);
                return (
                  <a
                    key={store.magazin}
                    href={`/cod-reducere/${store.magazin}`}
                    className="flex flex-col items-center gap-2 p-4 bg-[#ffffff] rounded-xl border border-[#e2e8f0] hover:border-[#14b8a6]/50 hover:shadow-lg hover:shadow-slate-300/60 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center text-white font-black text-lg">
                      {nume.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-[#334155] text-center leading-tight">
                      {nume}
                    </span>
                    {hasCod && (
                      <span className="text-xs text-[#0d9488] font-bold">COD</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-[#e2e8f0] py-5 text-center text-xs text-[#64748b]">
        © {new Date().getFullYear()} AmCupon.ro ·{" "}
        <Link href="/contact" className="hover:text-[#0d9488]">Contact</Link>
      </footer>
    </div>
  );
}
