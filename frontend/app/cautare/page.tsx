import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";

interface Magazin {
  magazin: string;
  logo_url?: string;
  categorie: string;
  are_promotie: boolean;
  cod_cupon: boolean;
  promotii: { nume: string; cod_cupon: string }[];
  procent_succes: number;
}

function numeAfisat(s: string) {
  return s.split(".")[0].replace(/-/g, " ").split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function loadData(): Magazin[] {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q || "").trim();
  return {
    title: query ? `Rezultate pentru "${query}" — AmCupon.ro` : "Cauta coduri de reducere — AmCupon.ro",
    description: query
      ? `Coduri de reducere si oferte pentru "${query}" — magazine verificate zilnic pe AmCupon.ro.`
      : "Cauta orice magazin online si gaseste coduri de reducere active verificate zilnic.",
    robots: { index: false },
  };
}

export default async function CautarePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q || "").trim().toLowerCase();
  const all = loadData();

  const rezultate = query.length >= 2
    ? all.filter(m =>
        m.magazin.toLowerCase().includes(query) ||
        numeAfisat(m.magazin).toLowerCase().includes(query) ||
        m.categorie.toLowerCase().includes(query)
      ).sort((a, b) => (b.are_promotie ? 1 : 0) - (a.are_promotie ? 1 : 0))
      .slice(0, 30)
    : [];

  const cuPromo = rezultate.filter(m => m.are_promotie).length;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </Link>
          <form action="/cautare" method="get" className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                name="q"
                type="search"
                defaultValue={q || ""}
                placeholder="Cauta magazin sau categorie..."
                autoFocus
                className="w-full border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50"
              />
            </div>
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors">
              Cauta
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {query.length < 2 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Cauta un magazin</h1>
            <p className="text-gray-500">Introdu cel putin 2 caractere pentru a cauta.</p>
          </div>
        ) : rezultate.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-xl font-black text-gray-900 mb-2">Niciun rezultat pentru &ldquo;{q}&rdquo;</h1>
            <p className="text-gray-500 mb-6">Incearca un alt termen sau browseza categoriile.</p>
            <Link href="/categorii" className="bg-orange-500 text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-orange-600 transition-colors">
              Exploreaza categorii
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-black text-gray-900">
                {rezultate.length} rezultate pentru &ldquo;{q}&rdquo;
              </h1>
              {cuPromo > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  <span className="text-emerald-600 font-semibold">{cuPromo} magazine</span> cu promotii active
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rezultate.map(m => {
                const nume = numeAfisat(m.magazin);
                const promo = m.promotii[0];
                return (
                  <Link key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group bg-white border border-gray-200 hover:border-orange-300 rounded-2xl p-4 transition-all hover:shadow-md flex gap-3 items-start">
                    <div className="w-11 h-11 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {m.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.logo_url} alt={nume} className="w-9 h-9 object-contain" />
                      ) : (
                        <span className="font-black text-orange-500 text-lg">{nume[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-gray-900 text-sm group-hover:text-orange-600 truncate">{nume}</p>
                      <p className="text-[11px] text-gray-400 mb-1">{m.categorie}</p>
                      {m.are_promotie && m.cod_cupon && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">Cod cupon</span>
                      )}
                      {m.are_promotie && !m.cod_cupon && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">Oferta activa</span>
                      )}
                      {promo && <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{promo.nume}</p>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-8">
        <Link href="/" className="hover:text-orange-500">← Inapoi la AmCupon.ro</Link>
      </footer>
    </div>
  );
}
