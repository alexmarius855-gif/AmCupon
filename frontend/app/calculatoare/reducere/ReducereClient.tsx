"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Mod = "simplu" | "succesiv" | "invers";

const CARD = "bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm";
const INPUT =
  "w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-4 py-3 text-lg font-semibold text-[var(--foreground)] outline-none focus:border-[var(--accent-text)] transition-colors";
const LABEL = "block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2";

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
    { id: "simplu", eticheta: "Reducere simplă", sub: "Preț și procent" },
    { id: "succesiv", eticheta: "Două reduceri", sub: "Cod peste reducere" },
    { id: "invers", eticheta: "Ce procent e?", sub: "Din două prețuri" },
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
                ? "bg-[#ddf93c] border-[var(--accent-text)] text-[#0f1216]"
                : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-alt)]"
            }`}
          >
            <span className="block text-sm font-bold">{t.eticheta}</span>
            <span
              className={`block text-xs ${mod === t.id ? "text-[#0f1216]/70" : "text-[var(--text-muted)]"}`}
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
                Prețul inițial
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
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
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
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Cazul real de la casă: produsul e deja redus, iar codul de reducere se aplică peste
              prețul redus, nu peste cel inițial. De aceea 30% plus 20% nu înseamnă 50%.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={LABEL} htmlFor="pretS">
                  Prețul inițial
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
                Prețul inițial
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
                Prețul plătit
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
          <p className="text-[var(--text-muted)] text-sm">Completează câmpurile de mai sus.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <span className={LABEL}>{mod === "invers" ? "Ai plătit" : "Preț final"}</span>
              <span className="block text-3xl sm:text-4xl font-black text-[var(--accent-text)] leading-tight">
                {lei(rezultat.final)}
              </span>
            </div>
            <div>
              <span className={LABEL}>Economisești</span>
              <span className="block text-3xl sm:text-4xl font-black text-[var(--foreground)] leading-tight">
                {lei(rezultat.economie)}
              </span>
            </div>
            <div>
              <span className={LABEL}>Reducere reală</span>
              <span className="block text-3xl sm:text-4xl font-black text-[var(--foreground)] leading-tight">
                {proc(rezultat.procentTotal)}
              </span>
              {mod === "succesiv" && isFinite(rezultat.dupaPrima) && (
                <span className="block text-xs text-[var(--text-muted)] mt-1.5">
                  După prima reducere: {lei(rezultat.dupaPrima)}
                </span>
              )}
            </div>
          </div>
        )}

        {mod === "succesiv" && rezultat !== null && (
          <p className="text-sm text-[var(--text-muted)] mt-5 pt-5 border-t border-[var(--border)]">
            Adunate, cele două reduceri ar da {proc(num(r1) + num(r2))}. Real, primești{" "}
            <span className="text-[var(--foreground)] font-semibold">{proc(rezultat.procentTotal)}</span>.
          </p>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        Calculele se fac în browserul tău. Nu trimitem și nu stocăm nimic.{" "}
        <Link href="/calculatoare" className="text-[var(--accent-text)] hover:underline">
          Vezi toate calculatoarele
        </Link>
      </p>
    </div>
  );
}
