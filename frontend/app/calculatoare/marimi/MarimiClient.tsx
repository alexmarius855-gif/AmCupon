"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Categorie = "femei-haine" | "barbati-haine" | "incaltaminte" | "copii";

interface Rand {
  ro: string;
  uk: string;
  us: string;
  it: string;
  fr: string;
  cm?: string;
}

/**
 * Tabelele sunt echivalentele uzuale intre sistemele de marimi.
 * NU sunt un standard unic: fiecare brand isi croieste propriul tipar, iar
 * diferentele de un numar intre branduri sunt normale. De aceea pagina spune
 * explicit ca sunt orientative si recomanda tabelul brandului.
 */
const TABELE: Record<Categorie, { titlu: string; coloane: string[]; randuri: Rand[] }> = {
  "femei-haine": {
    titlu: "Haine damă",
    coloane: ["RO / EU", "UK", "US", "IT", "FR"],
    randuri: [
      { ro: "32", uk: "4", us: "0", it: "36", fr: "32" },
      { ro: "34", uk: "6", us: "2", it: "38", fr: "34" },
      { ro: "36", uk: "8", us: "4", it: "40", fr: "36" },
      { ro: "38", uk: "10", us: "6", it: "42", fr: "38" },
      { ro: "40", uk: "12", us: "8", it: "44", fr: "40" },
      { ro: "42", uk: "14", us: "10", it: "46", fr: "42" },
      { ro: "44", uk: "16", us: "12", it: "48", fr: "44" },
      { ro: "46", uk: "18", us: "14", it: "50", fr: "46" },
      { ro: "48", uk: "20", us: "16", it: "52", fr: "48" },
      { ro: "50", uk: "22", us: "18", it: "54", fr: "50" },
    ],
  },
  "barbati-haine": {
    titlu: "Haine bărbați",
    coloane: ["RO / EU", "UK", "US", "IT", "FR"],
    randuri: [
      { ro: "44", uk: "34", us: "34", it: "44", fr: "44" },
      { ro: "46", uk: "36", us: "36", it: "46", fr: "46" },
      { ro: "48", uk: "38", us: "38", it: "48", fr: "48" },
      { ro: "50", uk: "40", us: "40", it: "50", fr: "50" },
      { ro: "52", uk: "42", us: "42", it: "52", fr: "52" },
      { ro: "54", uk: "44", us: "44", it: "54", fr: "54" },
      { ro: "56", uk: "46", us: "46", it: "56", fr: "56" },
      { ro: "58", uk: "48", us: "48", it: "58", fr: "58" },
    ],
  },
  incaltaminte: {
    titlu: "Încălțăminte",
    coloane: ["RO / EU", "UK", "US (F)", "US (B)", "Talpă"],
    randuri: [
      { ro: "35", uk: "2,5", us: "5", it: "3,5", fr: "-", cm: "22,5 cm" },
      { ro: "36", uk: "3,5", us: "6", it: "4,5", fr: "-", cm: "23 cm" },
      { ro: "37", uk: "4", us: "6,5", it: "5", fr: "-", cm: "23,5 cm" },
      { ro: "38", uk: "5", us: "7,5", it: "6", fr: "-", cm: "24,5 cm" },
      { ro: "39", uk: "6", us: "8,5", it: "7", fr: "-", cm: "25 cm" },
      { ro: "40", uk: "6,5", us: "9", it: "7,5", fr: "-", cm: "25,5 cm" },
      { ro: "41", uk: "7,5", us: "10", it: "8,5", fr: "-", cm: "26,5 cm" },
      { ro: "42", uk: "8", us: "10,5", it: "9", fr: "-", cm: "27 cm" },
      { ro: "43", uk: "9", us: "11,5", it: "10", fr: "-", cm: "27,5 cm" },
      { ro: "44", uk: "9,5", us: "12", it: "10,5", fr: "-", cm: "28,5 cm" },
      { ro: "45", uk: "10,5", us: "13", it: "11,5", fr: "-", cm: "29 cm" },
      { ro: "46", uk: "11", us: "13,5", it: "12", fr: "-", cm: "29,5 cm" },
    ],
  },
  copii: {
    titlu: "Copii (după înălțime)",
    coloane: ["Înălțime", "Vârstă", "UK", "US", "Talie"],
    randuri: [
      { ro: "86 cm", uk: "18-24 luni", us: "2T", it: "18-24m", fr: "-", cm: "49 cm" },
      { ro: "92 cm", uk: "2 ani", us: "3T", it: "2Y", fr: "-", cm: "51 cm" },
      { ro: "98 cm", uk: "3 ani", us: "4T", it: "3Y", fr: "-", cm: "53 cm" },
      { ro: "104 cm", uk: "4 ani", us: "4", it: "4Y", fr: "-", cm: "55 cm" },
      { ro: "110 cm", uk: "5 ani", us: "5", it: "5Y", fr: "-", cm: "56 cm" },
      { ro: "116 cm", uk: "6 ani", us: "6", it: "6Y", fr: "-", cm: "57 cm" },
      { ro: "128 cm", uk: "8 ani", us: "7", it: "8Y", fr: "-", cm: "59 cm" },
      { ro: "140 cm", uk: "10 ani", us: "10", it: "10Y", fr: "-", cm: "62 cm" },
      { ro: "152 cm", uk: "12 ani", us: "12", it: "12Y", fr: "-", cm: "65 cm" },
    ],
  },
};

const CARD = "bg-[#14181c] rounded-xl border border-[#1f2329] shadow-sm";

export default function MarimiClient() {
  const [categorie, setCategorie] = useState<Categorie>("femei-haine");
  const [cautare, setCautare] = useState("");

  const tabel = TABELE[categorie];

  const randuriFiltrate = useMemo(() => {
    const q = cautare.trim().toLowerCase().replace(",", ".");
    if (!q) return tabel.randuri;
    return tabel.randuri.filter((r) =>
      [r.ro, r.uk, r.us, r.it, r.fr, r.cm]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().replace(",", ".").startsWith(q)),
    );
  }, [tabel, cautare]);

  const taburi: { id: Categorie; eticheta: string }[] = [
    { id: "femei-haine", eticheta: "Haine damă" },
    { id: "barbati-haine", eticheta: "Haine bărbați" },
    { id: "incaltaminte", eticheta: "Încălțăminte" },
    { id: "copii", eticheta: "Copii" },
  ];

  const areCm = categorie === "incaltaminte" || categorie === "copii";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {taburi.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setCategorie(t.id);
              setCautare("");
            }}
            className={`px-4 py-3 rounded-xl border text-sm font-bold transition-colors ${
              categorie === t.id
                ? "bg-[#ddf93c] border-[#ddf93c] text-[#0f1216]"
                : "bg-[#14181c] border-[#1f2329] text-white hover:bg-[#1f2329]"
            }`}
          >
            {t.eticheta}
          </button>
        ))}
      </div>

      <div>
        <label
          className="block text-xs font-semibold text-[#9399a0] uppercase tracking-wide mb-2"
          htmlFor="cautare"
        >
          Caută mărimea ta
        </label>
        <input
          id="cautare"
          className="w-full bg-[#0f1216] border border-[#1f2329] rounded-lg px-4 py-3 text-lg font-semibold text-white outline-none focus:border-[#ddf93c] transition-colors"
          value={cautare}
          onChange={(e) => setCautare(e.target.value)}
          placeholder={categorie === "incaltaminte" ? "ex: 42" : "ex: 38"}
        />
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-[#0f1216] border-b border-[#1f2329]">
                {tabel.coloane.map((c) => (
                  <th
                    key={c}
                    className="text-left px-4 py-3 text-xs font-semibold text-[#9399a0] uppercase tracking-wide"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2329]">
              {randuriFiltrate.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#9399a0]">
                    Nicio mărime nu începe cu {cautare}. Încearcă alt număr.
                  </td>
                </tr>
              ) : (
                randuriFiltrate.map((r) => (
                  <tr key={r.ro} className="hover:bg-[#1f2329]/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#ddf93c]">{r.ro}</td>
                    <td className="px-4 py-3">{r.uk}</td>
                    <td className="px-4 py-3">{r.us}</td>
                    <td className="px-4 py-3">{r.it}</td>
                    <td className="px-4 py-3 text-[#9399a0]">{areCm ? r.cm : r.fr}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${CARD} p-5`}>
        <p className="text-sm text-[#9399a0] leading-relaxed">
          <span className="text-white font-semibold">Echivalențele sunt orientative.</span> Nu
          există un standard unic: fiecare brand își croiește propriul tipar, iar o diferență de un
          număr între branduri e normală. Când magazinul are tabel propriu de mărimi, acela are
          prioritate. Pentru încălțăminte, măsoară talpa piciorului seara, când e ușor umflat.
        </p>
      </div>

      <p className="text-xs text-[#9399a0]">
        Conversia se face în browserul tău. Nu trimitem și nu stocăm nimic.{" "}
        <Link href="/calculatoare" className="text-[#ddf93c] hover:underline">
          Vezi toate uneltele
        </Link>
      </p>
    </div>
  );
}
