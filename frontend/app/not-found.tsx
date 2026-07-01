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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="bg-indigo-600 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-indigo-400 font-black text-xl">.ro</span>
          </Link>
          <a
            href="/"
            className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
          >
            ← Toate reducerile
          </a>
        </div>
      </header>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(79,70,229,0.15) 0%, transparent 65%)" }} />
        {/* 404 Visual */}
        <div className="relative z-10 mb-6 select-none">
          <div className="text-[120px] md:text-[160px] font-black text-slate-900 leading-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl">🎟️</span>
          </div>
        </div>

        <h1 className="relative z-10 text-2xl md:text-3xl font-black text-white mb-3">
          Cuponul s-a pierdut undeva...
        </h1>
        <p className="relative z-10 text-slate-400 text-base mb-8 max-w-sm">
          Pagina pe care o cauți nu există sau a fost mutată.
          Încearcă una dintre opțiunile de mai jos.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-12">
          <a
            href="/"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
          >
            🏠 Acasă — toate reducerile
          </a>
          <a
            href="/toate-magazinele"
            className="bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-indigo-400 font-bold px-7 py-3 rounded-xl transition-colors"
          >
            🏪 Toate magazinele
          </a>
          <a
            href="/categorii"
            className="bg-slate-900 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-indigo-400 font-bold px-7 py-3 rounded-xl transition-colors"
          >
            📂 Categorii
          </a>
        </div>

        {/* Quick category links */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl w-full mb-12">
          {[
            { emoji: "👗", label: "Fashion", href: "/categorii/fashion" },
            { emoji: "💻", label: "Electronice", href: "/categorii/electronics-itc" },
            { emoji: "💄", label: "Frumusețe", href: "/categorii/beauty" },
            { emoji: "🧸", label: "Jucării", href: "/categorii/babies-kids-toys" },
          ].map((c) => (
            <a
              key={c.href}
              href={c.href}
              className="flex flex-col items-center gap-2 p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-black/30 transition-all"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold text-slate-300">{c.label}</span>
            </a>
          ))}
        </div>

        {/* Top stores with promos */}
        {topStores.length > 0 && (
          <div className="relative z-10 w-full max-w-2xl">
            <p className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">
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
                    className="flex flex-col items-center gap-2 p-4 bg-slate-900 rounded-2xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-black/30 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-lg">
                      {nume.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-300 text-center leading-tight">
                      {nume}
                    </span>
                    {hasCod && (
                      <span className="text-xs text-indigo-400 font-bold">COD</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} AmCupon.ro ·{" "}
        <Link href="/contact" className="hover:text-indigo-400">Contact</Link>
      </footer>
    </div>
  );
}
