import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import MagazinCard, { type CardMagazin } from "../components/MagazinCard";

interface Magazin extends CardMagazin {
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
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="bg-[#0a0f1a] border-b border-[#1e293b] sticky top-[64px] z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form action="/cautare" method="get" className="flex gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                name="q"
                type="search"
                defaultValue={q || ""}
                placeholder="Cauta magazin sau categorie..."
                autoFocus
                className="w-full border border-[#1e293b] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] bg-[#111827]"
              />
            </div>
            <button type="submit" className="bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold px-5 py-2 rounded-full text-sm transition-colors">
              Cauta
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {query.length < 2 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <h1 className="text-2xl font-black text-[#f1f5f9] mb-2">Cauta un magazin</h1>
            <p className="text-[#cbd5e1]">Introdu cel putin 2 caractere pentru a cauta.</p>
          </div>
        ) : rezultate.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-xl font-black text-[#f1f5f9] mb-2">Niciun rezultat pentru &ldquo;{q}&rdquo;</h1>
            <p className="text-[#cbd5e1] mb-6">Incearca un alt termen sau browseza categoriile.</p>
            <Link href="/categorii" className="bg-[#0d9488] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#14b8a6] transition-colors">
              Exploreaza categorii
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-xl font-black text-[#f1f5f9]">
                {rezultate.length} rezultate pentru &ldquo;{q}&rdquo;
              </h1>
              {cuPromo > 0 && (
                <p className="text-sm text-[#cbd5e1] mt-1">
                  <span className="text-[#0d9488] font-semibold">{cuPromo} magazine</span> cu promotii active
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rezultate.map(m => (
                <MagazinCard key={m.magazin} m={m} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="border-t border-[#1e293b] py-6 text-center text-xs text-[#94a3b8] mt-8">
        <Link href="/" className="hover:text-[#0d9488]">← Inapoi la AmCupon.ro</Link>
      </footer>
    </div>
  );
}
