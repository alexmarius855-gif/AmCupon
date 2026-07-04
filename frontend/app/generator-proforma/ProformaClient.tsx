"use client";

import Link from "next/link";
import { useState } from "react";

interface Item {
  denumire: string;
  cantitate: number;
  um: string;
  pretUnitar: number;
}

const ITEM_GOL: Item = { denumire: "", cantitate: 1, um: "buc", pretUnitar: 0 };

function azi(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatData(iso: string): string {
  if (!iso) return "";
  const [an, luna, zi] = iso.split("-");
  return `${zi}.${luna}.${an}`;
}

const fmt = (n: number) =>
  n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProformaClient() {
  // Emitent
  const [emitentNume, setEmitentNume] = useState("");
  const [emitentCif, setEmitentCif] = useState("");
  const [emitentAdresa, setEmitentAdresa] = useState("");
  const [emitentIban, setEmitentIban] = useState("");
  const [emitentBanca, setEmitentBanca] = useState("");

  // Client
  const [clientNume, setClientNume] = useState("");
  const [clientAdresa, setClientAdresa] = useState("");

  // Document
  const [numarDoc, setNumarDoc] = useState("PF-001");
  const [dataEmiterii, setDataEmiterii] = useState(azi);
  const [valabilitateZile, setValabilitateZile] = useState(15);
  const [aplicaTva, setAplicaTva] = useState(false);
  const [tvaProcent, setTvaProcent] = useState(19);
  const [mentiuni, setMentiuni] = useState("");

  const [items, setItems] = useState<Item[]>([{ ...ITEM_GOL }]);

  function updateItem(idx: number, field: keyof Item, val: string | number) {
    setItems(items.map((it, i) => (i === idx ? { ...it, [field]: val } : it)));
  }
  function addItem() {
    setItems([...items, { ...ITEM_GOL }]);
  }
  function removeItem(idx: number) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((s, it) => s + it.cantitate * it.pretUnitar, 0);
  const tva = aplicaTva ? subtotal * (tvaProcent / 100) : 0;
  const total = subtotal + tva;

  const completData = emitentNume.trim() !== "" && clientNume.trim() !== "";

  return (
    <div className="min-h-screen bg-[#0b0a07] print:bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10 print:max-w-none print:px-0 print:py-0">

        {/* Hero — ascuns la print */}
        <div className="text-center mb-8 print:hidden">
          <div className="text-5xl mb-3">📄</div>
          <h1 className="text-3xl font-black text-white mb-2">Generator Proforma Gratuit</h1>
          <p className="text-[#a89a78]">Completezi datele, vezi totalul calculat automat, salvezi ca PDF</p>
        </div>

        {/* Disclaimer legal — ascuns la print, vizibil clar in UI */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-8 print:hidden">
          <p className="text-amber-300 text-sm font-bold mb-1">⚠️ Proforma ≠ factura fiscala</p>
          <p className="text-amber-200/80 text-xs leading-relaxed">
            Acest document NU este o factura fiscala si nu inlocuieste obligatia de e-Factura (transmitere
            catre ANAF prin SPV), obligatorie pentru majoritatea facturilor emise in Romania din 2024-2025.
            Proforma e o oferta/deviz informal trimis inainte de plata — utila pentru a comunica un pret
            clientului, dar facturarea fiscala reala se face separat, prin sistemul tau de contabilitate.
            Verifica intotdeauna obligatiile curente pe anaf.ro.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 print:block">

          {/* ── FORMULAR (ascuns la print) ─────────────────────────────────── */}
          <div className="space-y-4 print:hidden">

            <div className="bg-[#15120c] rounded-3xl border border-[#26211a] p-5 space-y-3">
              <h2 className="font-black text-white text-sm uppercase tracking-wide text-[#a89a78]">Datele tale (emitent)</h2>
              <input value={emitentNume} onChange={e => setEmitentNume(e.target.value)} placeholder="Nume / Denumire firma"
                className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
              <input value={emitentCif} onChange={e => setEmitentCif(e.target.value)} placeholder="CUI / CIF (optional)"
                className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
              <input value={emitentAdresa} onChange={e => setEmitentAdresa(e.target.value)} placeholder="Adresa"
                className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
              <div className="grid grid-cols-2 gap-2">
                <input value={emitentIban} onChange={e => setEmitentIban(e.target.value)} placeholder="IBAN"
                  className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
                <input value={emitentBanca} onChange={e => setEmitentBanca(e.target.value)} placeholder="Banca"
                  className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
              </div>
            </div>

            <div className="bg-[#15120c] rounded-3xl border border-[#26211a] p-5 space-y-3">
              <h2 className="font-black text-white text-sm uppercase tracking-wide text-[#a89a78]">Client</h2>
              <input value={clientNume} onChange={e => setClientNume(e.target.value)} placeholder="Nume client / firma"
                className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
              <input value={clientAdresa} onChange={e => setClientAdresa(e.target.value)} placeholder="Adresa client (optional)"
                className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
            </div>

            <div className="bg-[#15120c] rounded-3xl border border-[#26211a] p-5 space-y-3">
              <h2 className="font-black text-white text-sm uppercase tracking-wide text-[#a89a78]">Document</h2>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[#8c8064] mb-1 block">Numar</label>
                  <input value={numarDoc} onChange={e => setNumarDoc(e.target.value)}
                    className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
                </div>
                <div>
                  <label className="text-xs text-[#8c8064] mb-1 block">Data emiterii</label>
                  <input type="date" value={dataEmiterii} onChange={e => setDataEmiterii(e.target.value)}
                    className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#8c8064] mb-1 block">Valabilitate oferta (zile)</label>
                <input type="number" value={valabilitateZile} onChange={e => setValabilitateZile(parseInt(e.target.value) || 0)} min="1"
                  className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
              </div>
              <label className="flex items-center gap-2 text-sm text-[#c8bda2] cursor-pointer pt-1">
                <input type="checkbox" checked={aplicaTva} onChange={e => setAplicaTva(e.target.checked)}
                  className="w-4 h-4 accent-[#b8912e]" />
                Aplic TVA
              </label>
              {aplicaTva && (
                <input type="number" value={tvaProcent} onChange={e => setTvaProcent(parseFloat(e.target.value) || 0)}
                  placeholder="Cota TVA %" min="0" max="100"
                  className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40" />
              )}
            </div>

            <div className="bg-[#15120c] rounded-3xl border border-[#26211a] p-5 space-y-3">
              <h2 className="font-black text-white text-sm uppercase tracking-wide text-[#a89a78]">Produse / servicii</h2>
              {items.map((it, idx) => (
                <div key={idx} className="bg-[#26211a] rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={it.denumire} onChange={e => updateItem(idx, "denumire", e.target.value)}
                      placeholder="Descriere produs/serviciu"
                      className="flex-1 bg-[#37301f] border border-[#473d28] text-white rounded-lg px-3 py-2 text-sm focus:outline-none min-w-0" />
                    {items.length > 1 && (
                      <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-300 px-2 text-sm shrink-0">✕</button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={it.cantitate} onChange={e => updateItem(idx, "cantitate", parseFloat(e.target.value) || 0)}
                      placeholder="Cant." min="0"
                      className="bg-[#37301f] border border-[#473d28] text-white rounded-lg px-2 py-2 text-sm focus:outline-none" />
                    <input value={it.um} onChange={e => updateItem(idx, "um", e.target.value)}
                      placeholder="UM"
                      className="bg-[#37301f] border border-[#473d28] text-white rounded-lg px-2 py-2 text-sm focus:outline-none" />
                    <input type="number" value={it.pretUnitar} onChange={e => updateItem(idx, "pretUnitar", parseFloat(e.target.value) || 0)}
                      placeholder="Pret unitar" min="0"
                      className="bg-[#37301f] border border-[#473d28] text-white rounded-lg px-2 py-2 text-sm focus:outline-none" />
                  </div>
                </div>
              ))}
              <button onClick={addItem}
                className="w-full bg-[#26211a] hover:bg-[#37301f] text-[#c8bda2] border border-dashed border-[#473d28] rounded-xl py-2.5 text-sm font-bold transition-colors">
                + Adauga produs/serviciu
              </button>
              <textarea value={mentiuni} onChange={e => setMentiuni(e.target.value)} placeholder="Mentiuni (optional)"
                rows={2}
                className="w-full bg-[#26211a] border border-[#37301f] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/40 resize-none" />
            </div>

            {completData && (
              <button onClick={() => window.print()}
                className="w-full bg-[#b8912e] hover:bg-[#c9a63e] text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-[#c9a63e]/20">
                🖨️ Printeaza / Salveaza ca PDF
              </button>
            )}
          </div>

          {/* ── PREVIEW DOCUMENT (vizibil mereu + la print) ─────────────────── */}
          <div id="proforma-preview" className="bg-white text-[#15120c] rounded-2xl print:rounded-none p-8 print:p-0 shadow-2xl print:shadow-none h-fit">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#a89a78] font-bold">Proforma</p>
                <p className="text-2xl font-black">{numarDoc || "—"}</p>
              </div>
              <div className="text-right text-sm text-[#473d28]">
                <p>Data: <strong>{formatData(dataEmiterii)}</strong></p>
                <p>Valabila {valabilitateZile} zile</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#a89a78] font-bold mb-1.5">Furnizor</p>
                <p className="font-bold">{emitentNume || "—"}</p>
                {emitentCif && <p className="text-[#473d28]">CUI/CIF: {emitentCif}</p>}
                {emitentAdresa && <p className="text-[#473d28]">{emitentAdresa}</p>}
                {emitentIban && <p className="text-[#473d28]">IBAN: {emitentIban}</p>}
                {emitentBanca && <p className="text-[#473d28]">{emitentBanca}</p>}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#a89a78] font-bold mb-1.5">Client</p>
                <p className="font-bold">{clientNume || "—"}</p>
                {clientAdresa && <p className="text-[#473d28]">{clientAdresa}</p>}
              </div>
            </div>

            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="border-b-2 border-[#15120c]">
                  <th className="text-left py-2">Descriere</th>
                  <th className="text-right py-2 w-16">Cant.</th>
                  <th className="text-right py-2 w-14">UM</th>
                  <th className="text-right py-2 w-24">Pret unitar</th>
                  <th className="text-right py-2 w-24">Valoare</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx} className="border-b border-[#dcd0b8]">
                    <td className="py-2">{it.denumire || "—"}</td>
                    <td className="text-right py-2">{it.cantitate}</td>
                    <td className="text-right py-2">{it.um}</td>
                    <td className="text-right py-2">{fmt(it.pretUnitar)}</td>
                    <td className="text-right py-2 font-semibold">{fmt(it.cantitate * it.pretUnitar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-8">
              <div className="w-56 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#473d28]">Subtotal</span>
                  <span className="font-semibold">{fmt(subtotal)} lei</span>
                </div>
                {aplicaTva && (
                  <div className="flex justify-between">
                    <span className="text-[#473d28]">TVA {tvaProcent}%</span>
                    <span className="font-semibold">{fmt(tva)} lei</span>
                  </div>
                )}
                <div className="h-px bg-[#15120c] my-1.5" />
                <div className="flex justify-between text-lg">
                  <span className="font-black">Total</span>
                  <span className="font-black">{fmt(total)} lei</span>
                </div>
              </div>
            </div>

            {mentiuni && <p className="text-[#473d28] text-xs mb-6 whitespace-pre-wrap">{mentiuni}</p>}

            <p className="text-[#a89a78] text-[10px] text-center border-t border-[#dcd0b8] pt-4">
              Document cu caracter informativ — nu reprezinta factura fiscala. Generat pe amcupon.ro/generator-proforma
            </p>
          </div>
        </div>

        {/* Link catre celelalte unelte — ascuns la print */}
        <div className="text-center mt-8 print:hidden space-x-4">
          <Link href="/calculator-salariu" className="text-[#8c8064] hover:text-[#c8bda2] text-sm transition-colors">
            💰 Calculator salariu net
          </Link>
          <Link href="/calculator" className="text-[#8c8064] hover:text-[#c8bda2] text-sm transition-colors">
            🧮 Calculator reduceri
          </Link>
        </div>
      </div>
    </div>
  );
}
