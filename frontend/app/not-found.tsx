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
    <div className="min-h-screen bg-[#06080b] flex flex-col">
      {/* Header */}
      <header className="bg-[#06080b] border-b border-[#1f2329]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="bg-[#ddf93c] text-[#0c1000] font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-[#ffffff] text-xl">Cupon</span>
            <span className="text-[#ddf93c] font-black text-xl">.ro</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#ddf93c] hover:text-[#c3dd2c] font-semibold transition-colors"
          >
            ← Toate reducerile
          </Link>
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

        <h1 className="relative z-10 text-2xl md:text-3xl font-black text-[#ffffff] mb-3">
          Cuponul s-a pierdut undeva...
        </h1>
        <p className="relative z-10 text-[#c9ced5] text-base mb-8 max-w-sm">
          Pagina pe care o cauți nu există sau a fost mutată.
          Încearcă una dintre opțiunile de mai jos.
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3 mb-12">
          <Link
            href="/"
            className="bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-bold px-7 py-3 rounded-xl transition-colors shadow-lg shadow-[#ddf93c]/20"
          >
            🏠 Acasă — toate reducerile
          </Link>
          <Link
            href="/toate-magazinele"
            className="bg-[#14181c] border border-[#2a2f36] hover:border-[#ddf93c] text-[#c9ced5] hover:text-[#ddf93c] font-bold px-7 py-3 rounded-xl transition-colors"
          >
            🏪 Toate magazinele
          </Link>
          <Link
            href="/categorii"
            className="bg-[#14181c] border border-[#2a2f36] hover:border-[#ddf93c] text-[#c9ced5] hover:text-[#ddf93c] font-bold px-7 py-3 rounded-xl transition-colors"
          >
            📂 Categorii
          </Link>
        </div>

        {/* Quick category links */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl w-full mb-12">
          {[
            { emoji: "👗", label: "Fashion", href: "/categorii/fashion" },
            { emoji: "💻", label: "Electronice", href: "/categorii/electronice" },
            { emoji: "💄", label: "Frumusețe", href: "/categorii/beauty" },
            { emoji: "🧸", label: "Jucării", href: "/categorii/copii" },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex flex-col items-center gap-2 p-4 bg-[#14181c] rounded-xl border border-[#1f2329] hover:border-[#ddf93c]/50 hover:shadow-lg hover:shadow-black/40 transition-all"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold text-[#c9ced5]">{c.label}</span>
            </Link>
          ))}
        </div>

        {/* Top stores with promos */}
        {topStores.length > 0 && (
          <div className="relative z-10 w-full max-w-2xl">
            <p className="text-sm font-semibold text-[#9399a0] mb-4 uppercase tracking-wide">
              Magazine cu reduceri active acum
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topStores.map((store) => {
                const nume = numeAfisat(store.magazin);
                const hasCod = store.promotii.some((p) => p.cod_cupon);
                return (
                  <Link
                    key={store.magazin}
                    href={`/cod-reducere/${store.magazin}`}
                    className="flex flex-col items-center gap-2 p-4 bg-[#14181c] rounded-xl border border-[#1f2329] hover:border-[#ddf93c]/50 hover:shadow-lg hover:shadow-black/40 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ddf93c] to-[#c3dd2c] flex items-center justify-center text-[#0c1000] font-black text-lg">
                      {nume.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-[#c9ced5] text-center leading-tight">
                      {nume}
                    </span>
                    {hasCod && (
                      <span className="text-xs text-[#ddf93c] font-bold">COD</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-[#1f2329] py-5 text-center text-xs text-[#9399a0]">
        © {new Date().getFullYear()} AmCupon.ro ·{" "}
        <Link href="/contact" className="hover:text-[#ddf93c]">Contact</Link>
      </footer>
    </div>
  );
}
