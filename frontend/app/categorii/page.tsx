import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toate categoriile | AmCupon.ro",
  description: "Coduri de reducere organizate pe categorii: Fashion, Electronice, Frumusețe, Casă & Grădină, Sport, Farmacie și multe altele. Oferte verificate zilnic.",
};

const CATEGORII = [
  { slug: "fashion", emoji: "👗", label: "Fashion", desc: "Îmbrăcăminte & Accesorii", bg: "bg-pink-50", border: "border-pink-200", hover: "hover:border-pink-400" },
  { slug: "electronics-itc", emoji: "💻", label: "Electronice IT&C", desc: "Laptopuri, telefoane, gadgeturi", bg: "bg-blue-50", border: "border-blue-200", hover: "hover:border-blue-400" },
  { slug: "beauty", emoji: "💄", label: "Frumusețe", desc: "Cosmetice & Parfumuri", bg: "bg-rose-50", border: "border-rose-200", hover: "hover:border-rose-400" },
  { slug: "home-garden", emoji: "🏡", label: "Casă & Grădină", desc: "Mobilă, decorațiuni, unelte", bg: "bg-green-50", border: "border-green-200", hover: "hover:border-green-400" },
  { slug: "sports-outdoors", emoji: "🏃", label: "Sport & Outdoor", desc: "Echipament sportiv & fitness", bg: "bg-orange-50", border: "border-orange-200", hover: "hover:border-orange-400" },
  { slug: "pharma", emoji: "💊", label: "Farmacie", desc: "Medicamente & suplimente", bg: "bg-red-50", border: "border-red-200", hover: "hover:border-red-400" },
  { slug: "babies-kids-toys", emoji: "👶", label: "Copii & Jucării", desc: "Produse pentru copii", bg: "bg-purple-50", border: "border-purple-200", hover: "hover:border-purple-400" },
  { slug: "automotive", emoji: "🚗", label: "Auto-Moto", desc: "Piese & accesorii auto", bg: "bg-slate-50", border: "border-slate-200", hover: "hover:border-slate-400" },
  { slug: "books", emoji: "📚", label: "Cărți", desc: "Cărți, papetărie & e-books", bg: "bg-yellow-50", border: "border-yellow-200", hover: "hover:border-yellow-400" },
  { slug: "hypermarket-groceries", emoji: "🛒", label: "Hypermarket", desc: "Alimente & produse zilnice", bg: "bg-emerald-50", border: "border-emerald-200", hover: "hover:border-emerald-400" },
  { slug: "gifts-flowers", emoji: "🎁", label: "Cadouri & Flori", desc: "Cadouri pentru orice ocazie", bg: "bg-fuchsia-50", border: "border-fuchsia-200", hover: "hover:border-fuchsia-400" },
  { slug: "telecom", emoji: "📱", label: "Telecom", desc: "Abonamente & servicii mobile", bg: "bg-cyan-50", border: "border-cyan-200", hover: "hover:border-cyan-400" },
  { slug: "pet-supplies", emoji: "🐾", label: "Animale de Companie", desc: "Hrană, jucării, accesorii", bg: "bg-amber-50", border: "border-amber-200", hover: "hover:border-amber-400" },
  { slug: "jewelry", emoji: "💎", label: "Bijuterii", desc: "Bijuterii & ceasuri", bg: "bg-violet-50", border: "border-violet-200", hover: "hover:border-violet-400" },
  { slug: "games", emoji: "🎮", label: "Jocuri", desc: "Jocuri video & console", bg: "bg-indigo-50", border: "border-indigo-200", hover: "hover:border-indigo-400" },
  { slug: "health-personal-care", emoji: "🧴", label: "Sănătate", desc: "Îngrijire personală & wellness", bg: "bg-teal-50", border: "border-teal-200", hover: "hover:border-teal-400" },
  { slug: "online-mall", emoji: "🛍️", label: "Online Mall", desc: "Platforme cu mai multe branduri", bg: "bg-sky-50", border: "border-sky-200", hover: "hover:border-sky-400" },
  { slug: "watches", emoji: "⌚", label: "Ceasuri", desc: "Ceasuri & smartwatch-uri", bg: "bg-stone-50", border: "border-stone-200", hover: "hover:border-stone-400" },
  { slug: "software", emoji: "💾", label: "Software", desc: "Licențe & aplicații", bg: "bg-lime-50", border: "border-lime-200", hover: "hover:border-lime-400" },
  { slug: "insurance", emoji: "🛡️", label: "Asigurări", desc: "Asigurări auto, medicale", bg: "bg-zinc-50", border: "border-zinc-200", hover: "hover:border-zinc-400" },
  { slug: "office-supplies", emoji: "📎", label: "Papetărie & Birou", desc: "Rechizite & mobilier birou", bg: "bg-neutral-50", border: "border-neutral-200", hover: "hover:border-neutral-400" },
  { slug: "others", emoji: "🔖", label: "Altele", desc: "Diverse categorii", bg: "bg-gray-50", border: "border-gray-200", hover: "hover:border-gray-400" },
];

export default function CategoriPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">Categorii</span>
        </div>
      </header>

      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black mb-1">Categorii coduri reducere</h1>
          <p className="text-orange-100 text-sm">
            Descoperă oferte organizate pe {CATEGORII.length} categorii · Actualizat zilnic
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {CATEGORII.map((c) => (
            <a
              key={c.slug}
              href={`/categorii/${c.slug}`}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 ${c.bg} ${c.border} ${c.hover} transition-all duration-200 group`}
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{c.emoji}</span>
              <div className="text-center">
                <div className="font-black text-gray-900 text-sm leading-tight">{c.label}</div>
                <div className="text-xs text-gray-500 mt-1 leading-tight">{c.desc}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
            ← Înapoi la AmCupon.ro
          </a>
        </div>
      </div>
    </div>
  );
}
