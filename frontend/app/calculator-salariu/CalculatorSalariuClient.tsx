"use client";

import Link from "next/link";
import { useState } from "react";

// ── Cote fiscale Romania 2026 (verificate iunie 2026) ──────────────────────
const CAS_RATE = 0.25;
const CASS_RATE = 0.10;
const IMPOZIT_RATE = 0.10;

// Salariul minim brut creste de la 1 iulie 2026: 4050 -> 4325 lei (HG 146/2026)
function getSalariuMinim(): number {
  const cutover = new Date(2026, 6, 1); // luna 0-indexed, 6 = iulie
  return new Date() >= cutover ? 4325 : 4050;
}

// Deducere personala (OG 16/2022): procent din brut, scade 0.5pp la fiecare 50 lei
// peste salariul minim, pana ajunge la 0.
const BASE_PCT: Record<number, number> = { 0: 20, 1: 25, 2: 30, 3: 35, 4: 45 };

function calculDeducerePersonala(brut: number, persoane: number, salariuMinim: number): number {
  const basePct = BASE_PCT[Math.min(persoane, 4)];
  const delta = Math.max(0, brut - salariuMinim);
  const pctDrop = Math.floor(delta / 50) * 0.5;
  const finalPct = Math.max(0, basePct - pctDrop);
  if (finalPct <= 0) return 0;
  return Math.ceil((brut * (finalPct / 100)) / 10) * 10;
}

interface Rezultat {
  brut: number;
  cas: number;
  cass: number;
  deducere: number;
  bazaImpozabila: number;
  impozit: number;
  net: number;
}

function calculeaza(brut: number, persoane: number, salariuMinim: number): Rezultat {
  const cas = brut * CAS_RATE;
  const cass = brut * CASS_RATE;
  const deducere = calculDeducerePersonala(brut, persoane, salariuMinim);
  const bazaImpozabila = Math.max(0, brut - cas - cass - deducere);
  const impozit = bazaImpozabila * IMPOZIT_RATE;
  const net = brut - cas - cass - impozit;
  return { brut, cas, cass, deducere, bazaImpozabila, impozit, net };
}

const fmt = (n: number) =>
  n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CalculatorSalariuClient() {
  const [brutStr, setBrutStr] = useState("");
  const [persoane, setPersoane] = useState(0);
  const salariuMinim = getSalariuMinim();

  const brut = parseFloat(brutStr.replace(",", ".")) || 0;
  const r = brut > 0 ? calculeaza(brut, persoane, salariuMinim) : null;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💰</div>
          <h1 className="text-3xl font-black text-white mb-2">Calculator Salariu Net 2026</h1>
          <p className="text-slate-400">Afla salariul net din brut, conform cotelor fiscale actuale din Romania</p>
        </div>

        {/* Input card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-5">
          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Salariul brut (lei/luna)</label>
            <input
              type="number" value={brutStr} onChange={e => setBrutStr(e.target.value)}
              placeholder={`ex: ${salariuMinim}`} min="0"
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-cyan-500/50"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-1.5 block">Persoane in intretinere</label>
            <div className="grid grid-cols-5 gap-2">
              {[0, 1, 2, 3, 4].map(p => (
                <button
                  key={p}
                  onClick={() => setPersoane(p)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                    persoane === p
                      ? "bg-indigo-600 text-white shadow-lg shadow-cyan-500/25"
                      : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-cyan-500/40"
                  }`}
                >
                  {p === 4 ? "4+" : p}
                </button>
              ))}
            </div>
          </div>

          {r && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
              <div className="text-center pb-2">
                <p className="text-slate-400 text-sm mb-1">Salariu net</p>
                <p className="text-emerald-400 font-black text-4xl">{fmt(r.net)} lei</p>
              </div>
              <div className="h-px bg-slate-700 my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Salariu brut</span>
                <span className="text-white font-semibold">{fmt(r.brut)} lei</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">CAS (pensie) -25%</span>
                <span className="text-red-400 font-semibold">-{fmt(r.cas)} lei</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">CASS (sanatate) -10%</span>
                <span className="text-red-400 font-semibold">-{fmt(r.cass)} lei</span>
              </div>
              {r.deducere > 0 && (
                <div className="flex justify-between text-xs text-slate-500 italic">
                  <span>din care deducere personala ({persoane === 4 ? "4+" : persoane} pers.)</span>
                  <span>-{fmt(r.deducere)} lei din baza impozabila</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Impozit pe venit -10%</span>
                <span className="text-red-400 font-semibold">-{fmt(r.impozit)} lei</span>
              </div>
              <div className="h-px bg-slate-700 my-2" />
              <div className="flex justify-between">
                <span className="text-white font-bold text-lg">Total retineri</span>
                <span className="text-red-400 font-black text-xl">-{fmt(r.brut - r.net)} lei</span>
              </div>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-slate-600 text-xs text-center mt-4 px-4 leading-relaxed">
          Calculator pentru salariati cu contract standard, norma intreaga. Cote valabile {salariuMinim === 4325 ? "din 1 iulie 2026" : "ianuarie-iunie 2026"}:
          CAS 25%, CASS 10%, impozit pe venit 10%, salariu minim brut {salariuMinim} lei. Nu acopera facilitati sectoriale speciale
          (constructii, agricultura) sau contracte part-time. Caracter informativ, nu inlocuieste un calcul oficial de salarizare.
        </p>

        {/* CTA investitii */}
        <div className="bg-gradient-to-r from-indigo-950/30 to-slate-900 border border-indigo-800/30 rounded-2xl p-6 mt-6 text-center">
          <p className="text-white font-bold mb-1">Vrei sa pui surplusul la treaba?</p>
          <p className="text-slate-400 text-sm mb-4">Compara platformele de investitii si trading disponibile in Romania.</p>
          <Link href="/trading"
            className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
            Vezi platformele →
          </Link>
        </div>

        {/* Link catre celalalt calculator */}
        <div className="text-center mt-6">
          <Link href="/calculator" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            🧮 Cauti calculator de reduceri si coduri cupon?
          </Link>
        </div>
      </div>
    </div>
  );
}
