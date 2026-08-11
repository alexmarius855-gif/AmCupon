"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Cote TVA Romania — verificate 10.08.2026 din surse multiple independente.
 *
 * Din 1 august 2025: standard 19% -> 21%, iar cotele reduse de 5% si 9% au fost
 * comasate intr-una singura, 11%. Cota tranzitorie de 9% (locuinte, contracte
 * semnate inainte de 01.08.2025) a EXPIRAT pe 31 iulie 2026 — deci azi raman
 * doar 21% si 11%. O pastram in lista doar ca referinta istorica, marcata clar,
 * pentru cine recalculeaza o factura mai veche.
 */
const COTE = [
  { val: 21, label: "21%", desc: "Cota standard — majoritatea bunurilor si serviciilor" },
  { val: 11, label: "11%", desc: "Cota redusa — alimente, medicamente, carti, apa, lemn de foc, HoReCa, cazare" },
  { val: 9,  label: "9%",  desc: "Cota tranzitorie, expirata la 31.07.2026 — doar pentru facturi mai vechi", istoric: true },
] as const;

type Mod = "adauga" | "extrage";

const fmt = (n: number) =>
  n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CalculatorTvaClient() {
  const [sumaStr, setSumaStr] = useState("");
  const [cota, setCota] = useState<number>(21);
  const [mod, setMod] = useState<Mod>("adauga");

  const suma = parseFloat(sumaStr.replace(",", ".")) || 0;
  const r = cota / 100;

  // "adauga": suma introdusa e FARA TVA -> aflam TVA-ul si totalul
  // "extrage": suma introdusa e CU TVA -> aflam cat din ea e TVA
  const baza  = suma > 0 ? (mod === "adauga" ? suma : suma / (1 + r)) : 0;
  const tva   = suma > 0 ? (mod === "adauga" ? suma * r : suma - baza) : 0;
  const total = baza + tva;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🧾</div>
          <h1 className="text-3xl font-black text-[#f1f5f9] mb-2">Calculator TVA 2026</h1>
          <p className="text-[#cbd5e1]">
            Adauga sau extrage TVA-ul, cu cotele actuale din Romania: 21% standard si 11% redusa
          </p>
        </div>

        {/* Selector mod */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {([
            { id: "adauga",  titlu: "Adauga TVA",  sub: "am pretul fara TVA" },
            { id: "extrage", titlu: "Extrage TVA", sub: "am pretul cu TVA inclus" },
          ] as const).map((m) => (
            <button
              key={m.id}
              onClick={() => setMod(m.id)}
              className={`rounded-xl px-4 py-3 text-left border transition-all ${
                mod === m.id
                  ? "bg-[#14b8a6]/10 border-[#14b8a6] text-[#f1f5f9]"
                  : "bg-[#111827] border-[#334155] text-[#cbd5e1] hover:border-[#475569]"
              }`}
            >
              <span className="block font-bold text-sm">{m.titlu}</span>
              <span className="block text-xs text-[#94a3b8] mt-0.5">{m.sub}</span>
            </button>
          ))}
        </div>

        {/* Input suma */}
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 mb-4">
          <label htmlFor="suma" className="block text-sm font-bold text-[#cbd5e1] mb-2">
            {mod === "adauga" ? "Suma fara TVA (lei)" : "Suma cu TVA inclus (lei)"}
          </label>
          <input
            id="suma"
            type="text"
            inputMode="decimal"
            value={sumaStr}
            onChange={(e) => setSumaStr(e.target.value)}
            placeholder="ex: 1000"
            className="w-full bg-[#1e293b] border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#14b8a6] focus:border-[#14b8a6] transition-all"
          />

          <p className="text-sm font-bold text-[#cbd5e1] mt-5 mb-2">Cota TVA</p>
          <div className="flex flex-wrap gap-2">
            {COTE.map((c) => (
              <button
                key={c.val}
                onClick={() => setCota(c.val)}
                title={c.desc}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  cota === c.val
                    ? "bg-[#0d9488] border-[#0d9488] text-white"
                    : "bg-[#1e293b] border-[#334155] text-[#cbd5e1] hover:border-[#14b8a6]/60"
                }`}
              >
                {c.label}
                {"istoric" in c && c.istoric && (
                  <span className="ml-1.5 text-[10px] font-semibold opacity-70">expirata</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
            {COTE.find((c) => c.val === cota)?.desc}
          </p>
        </div>

        {/* Rezultat */}
        {suma > 0 ? (
          <div className="bg-[#111827] border border-[#14b8a6]/40 rounded-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-[#14b8a6]/15 to-transparent px-5 py-4 border-b border-[#1e293b]">
              <p className="text-xs font-black text-[#5eead4] uppercase tracking-widest mb-1">
                {mod === "adauga" ? "Total de plata (cu TVA)" : "Pret fara TVA"}
              </p>
              <p className="text-3xl font-black text-[#f1f5f9]">
                {fmt(mod === "adauga" ? total : baza)} <span className="text-lg text-[#94a3b8]">lei</span>
              </p>
            </div>
            <div className="divide-y divide-[#1e293b]">
              {[
                { k: "Baza (fara TVA)", v: baza },
                { k: `TVA ${cota}%`,     v: tva, accent: true },
                { k: "Total (cu TVA)",   v: total },
              ].map((row) => (
                <div key={row.k} className="flex items-center justify-between px-5 py-3">
                  <span className={`text-sm ${row.accent ? "font-bold text-[#5eead4]" : "text-[#cbd5e1]"}`}>
                    {row.k}
                  </span>
                  <span className={`font-black tabular-nums ${row.accent ? "text-[#5eead4]" : "text-[#f1f5f9]"}`}>
                    {fmt(row.v)} lei
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#111827]/50 border border-dashed border-[#334155] rounded-xl p-8 text-center mb-8">
            <p className="text-[#94a3b8] text-sm">Introdu o suma ca sa vezi calculul</p>
          </div>
        )}

        {/* Formule — utile si pentru SEO (raspund la "cum se calculeaza TVA") */}
        <section className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-black text-[#f1f5f9] mb-4">Cum se calculeaza TVA-ul</h2>
          <div className="space-y-4 text-sm text-[#cbd5e1] leading-relaxed">
            <div>
              <p className="font-bold text-[#f1f5f9] mb-1">Adaugare TVA (ai pretul fara TVA)</p>
              <code className="block bg-[#0a0f1a] border border-[#334155] rounded-lg px-3 py-2 text-[#5eead4] text-xs">
                TVA = pret fara TVA × {cota}/100 &nbsp;|&nbsp; Total = pret fara TVA + TVA
              </code>
              <p className="mt-1.5 text-[#94a3b8] text-xs">
                Exemplu la cota {cota}%: 1.000 lei → TVA {fmt(1000 * r)} lei → total {fmt(1000 * (1 + r))} lei.
              </p>
            </div>
            <div>
              <p className="font-bold text-[#f1f5f9] mb-1">Extragere TVA (ai pretul cu TVA inclus)</p>
              <code className="block bg-[#0a0f1a] border border-[#334155] rounded-lg px-3 py-2 text-[#5eead4] text-xs">
                Baza = pret cu TVA ÷ {(1 + r).toFixed(2)} &nbsp;|&nbsp; TVA = pret cu TVA − baza
              </code>
              <p className="mt-1.5 text-[#94a3b8] text-xs">
                Greseala frecventa: sa scazi direct {cota}% din pretul cu TVA. Rezultatul e gresit — la{" "}
                {fmt(1000 * (1 + r))} lei cu TVA, baza reala e 1.000 lei, nu {fmt(1000 * (1 + r) * (1 - r))} lei.
              </p>
            </div>
          </div>
        </section>

        {/* Cote — continut real, nu umplutura */}
        <section className="bg-[#111827] border border-[#1e293b] rounded-xl p-6 mb-6">
          <h2 className="text-lg font-black text-[#f1f5f9] mb-4">Cotele de TVA din Romania in 2026</h2>
          <div className="space-y-3">
            {COTE.map((c) => (
              <div key={c.val} className="flex gap-3">
                <span className={`shrink-0 w-14 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                  "istoric" in c && c.istoric
                    ? "bg-[#1e293b] text-[#94a3b8] border border-[#334155]"
                    : "bg-[#14b8a6]/15 text-[#5eead4] border border-[#14b8a6]/30"
                }`}>
                  {c.label}
                </span>
                <p className="text-sm text-[#cbd5e1] leading-relaxed pt-1">{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#94a3b8] mt-4 leading-relaxed">
            Cotele s-au schimbat la 1 august 2025: standardul a urcat de la 19% la 21%, iar cotele
            reduse de 5% si 9% au fost inlocuite cu una singura, de 11%. Verifica intotdeauna
            incadrarea produsului tau — acest calculator face aritmetica, nu incadrarea fiscala.
          </p>
        </section>

        {/* Legaturi interne catre celelalte unelte */}
        <section className="mb-8">
          <p className="text-xs font-black text-[#94a3b8] uppercase tracking-widest mb-3">Alte calculatoare gratuite</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { href: "/calculator-salariu",  emoji: "💰", label: "Calculator salariu net din brut" },
              { href: "/calculator",          emoji: "🏷️", label: "Calculator reduceri si cupoane" },
              { href: "/generator-proforma",  emoji: "📄", label: "Generator proforma" },
              { href: "/oferte-azi",          emoji: "🔥", label: "Ofertele de azi" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2.5 bg-[#111827] border border-[#1e293b] hover:border-[#14b8a6]/50 rounded-xl px-4 py-3 text-sm font-semibold text-[#cbd5e1] hover:text-[#f1f5f9] transition-all"
              >
                <span>{l.emoji}</span>
                {l.label}
              </Link>
            ))}
          </div>
        </section>

        <div className="text-center">
          <Link href="/" className="text-sm text-[#94a3b8] hover:text-[#0d9488] transition-colors">
            ← Inapoi la AmCupon.ro
          </Link>
        </div>
      </div>
    </div>
  );
}
