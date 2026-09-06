"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Mod = "simplu" | "succesiv" | "invers";

const CARD = "bg-[#14181c] rounded-xl border border-[#1f2329] shadow-sm";
const INPUT =
  "w-full bg-[#0f1216] border border-[#1f2329] rounded-lg px-4 py-3 text-lg font-semibold text-white outline-none focus:border-[#ddf93c] transition-colors";
const LABEL = "block text-xs font-semibold text-[#9399a0] uppercase tracking-wide mb-2";

function lei(n: number): string {
  if (!isFinite(n)) return "-";
  return n.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " lei";
}

function proc(n: number): string {
  if (!isFinite(n)) return "-";
  return n.toLocaleString("ro-RO", { maximumFractionDigits: 2 }) + "%";
}

/** Numar din input, tolerant la virgula zecimala romaneasca. */
function num(v: string): number {
  const curat = v.replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(curat);
  return isFinite(n) ? n : NaN;
}

export default function ReducereClient() {
  const [mod, setMod] = useState<Mod>("simplu");

  const [pret, setPret] = useState("249");
  const [reducere, setReducere] = useState("30");

  const [pretS, setPretS] = useState("249");
  const [r1, setR1] = useState("30");
  const [r2, setR2] = useState("20");

  const [pretInitial, setPretInitial] = useState("249");
  const [pretFinal, setPretFinal] = useState("174,30");

  const rezultat = useMemo(() => {
    if (mod === "simplu") {
      const p = num(pret);
      const r = num(reducere);
      if (isNaN(p) || isNaN(r)) return null;
      const economie = (p * r) / 100;
      return { final: p - economie, economie, procentTotal: r, dupaPrima: NaN };
    }
    if (mod === "succesiv") {
      const p = num(pretS);
      const a = num(r1);
      const b = num(r2);
      if (isNaN(p) || isNaN(a) || isNaN(b)) return null;
      const dupaPrima = p * (1 - a / 100);
      const final = dupaPrima * (1 - b / 100);
      const economie = p - final;
      return { final, economie, procentTotal: p > 0 ? (economie / p) * 100 : NaN, dupaPrima };
    }
    const pi = num(pretInitial);
    const pf = num(pretFinal);
    if (isNaN(pi) || isNaN(pf) || pi <= 0) return null;
    const economie = pi - pf;
    return { final: pf, economie, procentTotal: (economie / pi) * 100, dupaPrima: NaN };
  }, [mod, pret, reducere, pretS, r1, r2, pretInitial, pretFinal]);

  const taburi: { id: Mod; eticheta: string; sub: string }[] = [
    { id: "simplu", eticheta: "Reducere simpla", sub: "Pret si procent" },
    { id: "succesiv", eticheta: "Doua reduceri", sub: "Cod peste reducere" },
    { id: "invers", eticheta: "Ce procent e?", sub: "Din doua preturi" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {taburi.map((t) => (
          <button
            key={t.id}
            onClick={() => setMod(t.id)}
            className={`text-left px-4 py-3 rounded-xl border transition-colors ${
              mod === t.id
                ? "bg-[#ddf93c] border-[#ddf93c] text-[#0f1216]"
                : "bg-[#14181c] border-[#1f2329] text-white hover:bg-[#1f2329]"
            }`}
          >
            <span className="block text-sm font-bold">{t.eticheta}</span>
            <span
              className={`block text-xs ${mod === t.id ? "text-[#0f1216]/70" : "text-[#9399a0]"}`}
            >
              {t.sub}
            </span>
          </button>
        ))}
      </div>

      <div className={`${CARD} p-5 sm:p-6`}>
        {mod === "simplu" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL} htmlFor="pret">
                Pretul initial
              </label>
              <input
                id="pret"
                className={INPUT}
                inputMode="decimal"
                value={pret}
                onChange={(e) => setPret(e.target.value)}
                placeholder="249"
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="reducere">
                Reducerea (%)
              </label>
              <input
                id="reducere"
                className={INPUT}
                inputMode="decimal"
                value={reducere}
                onChange={(e) => setReducere(e.target.value)}
                placeholder="30"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10, 15, 20, 25, 30, 40, 50, 70].map((p) => (
                  <button
                    key={p}
                    onClick={() => setReducere(String(p))}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1f2329] hover:bg-[#2a2f36] text-[#9399a0] hover:text-white transition-colors"
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mod === "succesiv" && (
          <>
            <p className="text-sm text-[#9399a0] mb-4">
              Cazul real de la casa: produsul e deja redus, iar codul de reducere se aplica peste
              pretul redus, nu peste cel initial. De aceea 30% plus 20% nu inseamna 50%.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={LABEL} htmlFor="pretS">
                  Pretul initial
                </label>
                <input
                  id="pretS"
                  className={INPUT}
                  inputMode="decimal"
                  value={pretS}
                  onChange={(e) => setPretS(e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="r1">
                  Prima reducere (%)
                </label>
                <input
                  id="r1"
                  className={INPUT}
                  inputMode="decimal"
                  value={r1}
                  onChange={(e) => setR1(e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL} htmlFor="r2">
                  Codul de reducere (%)
                </label>
                <input
                  id="r2"
                  className={INPUT}
                  inputMode="decimal"
                  value={r2}
                  onChange={(e) => setR2(e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {mod === "invers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={LABEL} htmlFor="pi">
                Pretul initial
              </label>
              <input
                id="pi"
                className={INPUT}
                inputMode="decimal"
                value={pretInitial}
                onChange={(e) => setPretInitial(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="pf">
                Pretul platit
              </label>
              <input
                id="pf"
                className={INPUT}
                inputMode="decimal"
                value={pretFinal}
                onChange={(e) => setPretFinal(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className={`${CARD} p-5 sm:p-6`}>
        {rezultat === null ? (
          <p className="text-[#9399a0] text-sm">Completeaza campurile de mai sus.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <span className={LABEL}>{mod === "invers" ? "Ai platit" : "Pret final"}</span>
              <span className="block text-3xl sm:text-4xl font-black text-[#ddf93c] leading-tight">
                {lei(rezultat.final)}
              </span>
            </div>
            <div>
              <span className={LABEL}>Economisesti</span>
              <span className="block text-3xl sm:text-4xl font-black text-white leading-tight">
                {lei(rezultat.economie)}
              </span>
            </div>
            <div>
              <span className={LABEL}>Reducere reala</span>
              <span className="block text-3xl sm:text-4xl font-black text-white leading-tight">
                {proc(rezultat.procentTotal)}
              </span>
              {mod === "succesiv" && isFinite(rezultat.dupaPrima) && (
                <span className="block text-xs text-[#9399a0] mt-1.5">
                  Dupa prima reducere: {lei(rezultat.dupaPrima)}
                </span>
              )}
            </div>
          </div>
        )}

        {mod === "succesiv" && rezultat !== null && (
          <p className="text-sm text-[#9399a0] mt-5 pt-5 border-t border-[#1f2329]">
            Adunate, cele doua reduceri ar da {proc(num(r1) + num(r2))}. Real, primesti{" "}
            <span className="text-white font-semibold">{proc(rezultat.procentTotal)}</span>.
          </p>
        )}
      </div>

      <p className="text-xs text-[#9399a0]">
        Calculele se fac in browserul tau. Nu trimitem si nu stocam nimic.{" "}
        <Link href="/calculatoare" className="text-[#ddf93c] hover:underline">
          Vezi toate calculatoarele
        </Link>
      </p>
    </div>
  );
}
