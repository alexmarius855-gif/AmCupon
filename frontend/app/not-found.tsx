import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagina nu a fost găsită | AmCupon.ro",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <a href="/" className="flex items-center gap-1.5 w-fit">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="text-8xl md:text-9xl font-black text-gray-200 leading-none mb-4 select-none">
          404
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-3">
          Pagina nu a fost găsită
        </h1>
        <p className="text-gray-500 text-base mb-8 max-w-sm">
          Pagina pe care o cauți nu există sau a fost mutată. Încearcă să cauți un magazin sau o categorie.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            ← Înapoi la homepage
          </a>
          <a href="/categorii"
            className="bg-white border-2 border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-500 font-bold px-6 py-3 rounded-xl transition-colors">
            Caută pe categorii
          </a>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg">
          {[
            { emoji: "👗", label: "Fashion", href: "/categorii/fashion" },
            { emoji: "💻", label: "Electronice", href: "/categorii/electronics-itc" },
            { emoji: "💄", label: "Frumusețe", href: "/categorii/beauty" },
            { emoji: "🏡", label: "Casă", href: "/categorii/home-garden" },
          ].map((c) => (
            <a key={c.href} href={c.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">{c.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
