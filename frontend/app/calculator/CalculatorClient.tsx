"use client";

import { useState } from "react";

// ── Tipuri calcule disponibile ────────────────────────────────────────────────
type Mode = "reducere" | "pret-final" | "procent" | "cos";

interface CosItem { pret: number; qty: number; label: string }

export default function CalculatorClient() {
  const [mode, setMode] = useState<Mode>("reducere");

  // Reducere simplă
  const [pret, setPret]       = useState("");
  const [procent, setProcent] = useState("");

  // Calculare procent dintr-un preț vechi+nou
  const [pretVechi, setPretVechi] = useState("");
  const [pretNou, setPretNou]     = useState("");

  // Coș de cumpărături
  const [cos, setCos] = useState<CosItem[]>([
    { pret: 0, qty: 1, label: "Produs 1" },
  ]);
  const [cosDiscount, setCosDiscount] = useState("");

  // ── Calcule ───────────────────────────────────────────────────────────────
  const pretNum    = parseFloat(pret.replace(",", "."))    || 0;
  const procentNum = parseFloat(procent.replace(",", ".")) || 0;
  const economie   = pretNum * (procentNum / 100);
  const pretFinal  = pretNum - economie;

  const pretVechiNum = parseFloat(pretVechi.replace(",", ".")) || 0;
  const pretNouNum   = parseFloat(pretNou.replace(",", "."))   || 0;
  const procentCalc  = pretVechiNum > 0
    ? Math.round(((pretVechiNum - pretNouNum) / pretVechiNum) * 100)
    : 0;

  const totalCos       = cos.reduce((s, i) => s + i.pret * i.qty, 0);
  const cosDiscountNum = parseFloat(cosDiscount.replace(",", ".")) || 0;
  const economieCos    = totalCos * (cosDiscountNum / 100);
  const totalFinalCos  = totalCos - economieCos;

  function addCosItem() {
    setCos([...cos, { pret: 0, qty: 1, label: `Produs ${cos.length + 1}` }]);
  }
  function updateCos(idx: number, field: keyof CosItem, val: string | number) {
    setCos(cos.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }
  function removeCos(idx: number) {
    setCos(cos.filter((_, i) => i !== idx));
  }

  const MODURI: { key: Mode; label: string; icon: string }[] = [
    { key: "reducere",   label: "Economie la cod",    icon: "🎟" },
    { key: "pret-final", label: "Cat platesc final",  icon: "🏷" },
    { key: "procent",    label: "Ce % reducere am",   icon: "📊" },
    { key: "cos",        label: "Cos de cumparaturi", icon: "🛒" },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-400">Calculator Reduceri</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧮</div>
          <h1 className="text-3xl font-black text-white mb-2">Calculator Reduceri</h1>
          <p className="text-slate-400">Calculeaza instant cat economisesti cu un cod de reducere</p>
        </div>

        {/* Tab-uri mod */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {MODURI.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`p-3 rounded-xl text-sm font-bold transition-all text-center ${
                mode === m.key
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-orange-500/40"
              }`}
            >
              <span className="block text-xl mb-1">{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>

        {/* ── MOD 1: Economie la cod ── */}
        {mode === "reducere" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="font-black text-white text-lg">Cat economisesc cu codul?</h2>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Pretul original (lei)</label>
              <input
                type="number" value={pret} onChange={e => setPret(e.target.value)}
                placeholder="ex: 350" min="0"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Procentul de reducere (%)</label>
              <input
                type="number" value={procent} onChange={e => setProcent(e.target.value)}
                placeholder="ex: 20" min="0" max="100"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/50"
              />
            </div>
            {pretNum > 0 && procentNum > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pret original</span>
                  <span className="text-white font-semibold">{pretNum.toFixed(2)} lei</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Reducere -{procentNum}%</span>
                  <span className="text-red-400 font-semibold">-{economie.toFixed(2)} lei</span>
                </div>
                <div className="h-px bg-slate-700 my-1" />
                <div className="flex justify-between">
                  <span className="text-white font-bold text-lg">Platesti</span>
                  <span className="text-orange-400 font-black text-2xl">{pretFinal.toFixed(2)} lei</span>
                </div>
                <p className="text-emerald-400 text-sm font-bold text-center pt-1">
                  Economisesti {economie.toFixed(2)} lei ({procentNum}%)!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── MOD 2: Cat platesc final ── */}
        {mode === "pret-final" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="font-black text-white text-lg">Cat platesc dupa reducere?</h2>
            <p className="text-slate-500 text-sm">Introduce pretul si procentul reducerii — acelasi calculator, alta perspectiva.</p>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Pretul afisat (lei)</label>
              <input type="number" value={pret} onChange={e => setPret(e.target.value)}
                placeholder="ex: 500"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Reducerea codului (%)</label>
              <input type="number" value={procent} onChange={e => setProcent(e.target.value)}
                placeholder="ex: 15" min="0" max="100"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
            {pretNum > 0 && procentNum > 0 && (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 text-center">
                <p className="text-slate-400 text-sm mb-1">Platesti efectiv</p>
                <p className="text-orange-400 font-black text-4xl">{pretFinal.toFixed(2)} lei</p>
                <p className="text-slate-500 text-xs mt-2">
                  fata de {pretNum.toFixed(2)} lei — economie {economie.toFixed(2)} lei
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── MOD 3: Ce procent am ── */}
        {mode === "procent" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="font-black text-white text-lg">Ce procent de reducere am primit?</h2>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Pretul vechi / barat (lei)</label>
              <input type="number" value={pretVechi} onChange={e => setPretVechi(e.target.value)}
                placeholder="ex: 400"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Pretul nou / redus (lei)</label>
              <input type="number" value={pretNou} onChange={e => setPretNou(e.target.value)}
                placeholder="ex: 299"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
            {pretVechiNum > 0 && pretNouNum > 0 && pretNouNum < pretVechiNum && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 text-center">
                <p className="text-slate-400 text-sm mb-1">Reducere reala</p>
                <p className="text-purple-400 font-black text-4xl">-{procentCalc}%</p>
                <p className="text-slate-500 text-xs mt-2">
                  {(pretVechiNum - pretNouNum).toFixed(2)} lei economisiti
                </p>
              </div>
            )}
            {pretNouNum >= pretVechiNum && pretVechiNum > 0 && (
              <p className="text-red-400 text-sm text-center">Pretul nou trebuie sa fie mai mic decat pretul vechi.</p>
            )}
          </div>
        )}

        {/* ── MOD 4: Cos ── */}
        {mode === "cos" && (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
            <h2 className="font-black text-white text-lg">Calculator cos de cumparaturi</h2>
            <div className="space-y-3">
              {cos.map((item, idx) => (
                <div key={idx} className="bg-slate-800 rounded-xl p-3 flex gap-2 items-center">
                  <input
                    value={item.label}
                    onChange={e => updateCos(idx, "label", e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm focus:outline-none min-w-0"
                    placeholder="Nume produs"
                  />
                  <input
                    type="number" value={item.pret || ""}
                    onChange={e => updateCos(idx, "pret", parseFloat(e.target.value) || 0)}
                    placeholder="Pret"
                    className="w-24 bg-slate-700 text-white text-sm rounded-lg px-2 py-1.5 text-right focus:outline-none"
                  />
                  <span className="text-slate-500 text-xs">lei</span>
                  <input
                    type="number" value={item.qty}
                    onChange={e => updateCos(idx, "qty", parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-12 bg-slate-700 text-white text-sm rounded-lg px-2 py-1.5 text-center focus:outline-none"
                  />
                  {cos.length > 1 && (
                    <button onClick={() => removeCos(idx)} className="text-slate-500 hover:text-red-400 transition-colors text-lg">×</button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addCosItem}
              className="w-full border border-dashed border-slate-600 hover:border-orange-500 text-slate-400 hover:text-orange-400 rounded-xl py-2 text-sm font-semibold transition-all">
              + Adauga produs
            </button>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Cod reducere (%) — optional</label>
              <input type="number" value={cosDiscount} onChange={e => setCosDiscount(e.target.value)}
                placeholder="ex: 10" min="0" max="100"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              />
            </div>
            {totalCos > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total cos</span>
                  <span className="text-white font-semibold">{totalCos.toFixed(2)} lei</span>
                </div>
                {cosDiscountNum > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Reducere -{cosDiscountNum}%</span>
                    <span className="text-red-400 font-semibold">-{economieCos.toFixed(2)} lei</span>
                  </div>
                )}
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between">
                  <span className="text-white font-bold">Total de plata</span>
                  <span className="text-orange-400 font-black text-2xl">{totalFinalCos.toFixed(2)} lei</span>
                </div>
                {cosDiscountNum > 0 && (
                  <p className="text-emerald-400 text-sm font-bold text-center">
                    Economisesti {economieCos.toFixed(2)} lei cu codul!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col sm:flex-row items-center gap-4">
          <div>
            <p className="text-white font-bold text-sm">Cauta un cod de reducere acum</p>
            <p className="text-slate-500 text-xs">600+ magazine, verificate zilnic</p>
          </div>
          <a href="/toate-magazinele"
            className="ml-auto shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            Cauta coduri →
          </a>
        </div>
      </div>
    </div>
  );
}
