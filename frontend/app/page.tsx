"use client";

import { useEffect, useState } from "react";

interface Promotie {
  nume: string;
  descriere: string;
  cod_cupon: string;
  landing_page: string;
  zile_ramase: number;
}

interface Magazin {
  magazin: string;
  url: string;
  url_afiliat: string;
  categorie: string;
  comision: string;
  scor_afiliere: number;
  scor_final: number;
  prioritate: string;
  canal_recomandat: string;
  sales_number: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
}

export default function Home() {
  const [magazine, setMagazine] = useState<Magazin[]>([]);
  const [filtru, setFiltru] = useState("toate");
  const [cautare, setCautare] = useState("");
  const [copiat, setCopiat] = useState<string | null>(null);

  useEffect(() => {
    fetch("/output.json")
      .then((r) => r.json())
      .then(setMagazine);
  }, []);

  const categorii = [
    "toate",
    ...Array.from(new Set(magazine.map((m) => m.categorie).filter(Boolean))).sort(),
  ];

  const filtrate = magazine.filter((m) => {
    const potrivestCategoria = filtru === "toate" || m.categorie === filtru;
    const potrivesteCautarea =
      cautare === "" ||
      m.magazin.toLowerCase().includes(cautare.toLowerCase());
    return potrivestCategoria && potrivesteCautarea;
  });

  const topCuPromotii = filtrate.filter((m) => m.are_promotie).slice(0, 6);
  const restul = filtrate.filter((m) => !m.are_promotie).slice(0, 50);

  function copiazaCod(cod: string) {
    navigator.clipboard.writeText(cod);
    setCopiat(cod);
    setTimeout(() => setCopiat(null), 2000);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-8 px-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold">AfiliereRO</h1>
          <p className="mt-1 text-blue-100 text-sm">
            Cele mai bune oferte si coduri de reducere din Romania
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="Cauta magazin..."
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            value={filtru}
            onChange={(e) => setFiltru(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {categorii.map((c) => (
              <option key={c} value={c}>
                {c === "toate" ? "Toate categoriile" : c}
              </option>
            ))}
          </select>
        </div>

        {topCuPromotii.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">LIVE</span>
              Promotii Active
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topCuPromotii.map((m) => (
                <CardMagazin key={m.magazin} m={m} copiat={copiat} onCopiaza={copiazaCod} highlight />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Magazine ({filtrate.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restul.map((m) => (
              <CardMagazin key={m.magazin} m={m} copiat={copiat} onCopiaza={copiazaCod} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function CardMagazin({
  m,
  copiat,
  onCopiaza,
  highlight = false,
}: {
  m: Magazin;
  copiat: string | null;
  onCopiaza: (cod: string) => void;
  highlight?: boolean;
}) {
  const primaPromotie = m.promotii[0];

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col gap-3 hover:shadow-md transition-shadow ${highlight ? "border-orange-300 ring-1 ring-orange-200" : "border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{m.magazin}</h3>
          <span className="text-xs text-gray-500">{m.categorie}</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {m.comision}
          </span>
          {m.trend > 0 && (
            <span className="text-xs text-green-600">+{(m.trend * 100).toFixed(0)}% trend</span>
          )}
        </div>
      </div>

      {primaPromotie && (
        <div className="bg-orange-50 rounded-lg p-3 text-xs">
          <p className="font-medium text-orange-800 line-clamp-2">{primaPromotie.nume}</p>
          {primaPromotie.zile_ramase <= 3 && (
            <p className="text-red-500 font-semibold mt-1">Expira in {primaPromotie.zile_ramase} zile!</p>
          )}
        </div>
      )}

      {primaPromotie?.cod_cupon && (
        <button
          onClick={() => onCopiaza(primaPromotie.cod_cupon)}
          className="flex items-center justify-between bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
        >
          <span className="font-mono text-sm font-bold text-gray-700">{primaPromotie.cod_cupon}</span>
          <span className="text-xs text-blue-600">
            {copiat === primaPromotie.cod_cupon ? "Copiat!" : "Copiaza"}
          </span>
        </button>
      )}

      <a
        href={primaPromotie?.landing_page || m.url_afiliat || m.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg text-center transition-colors"
      >
        Vezi oferta
      </a>

      <div className="flex justify-between text-xs text-gray-400">
        <span>Scor: {m.scor_final}</span>
        <span>{m.promotii.length > 0 ? `${m.promotii.length} promotii` : ""}</span>
      </div>
    </div>
  );
}
