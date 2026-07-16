"use client";

import { useState, useMemo } from "react";

interface Scor { [criteriu: string]: number; }

interface Magazin {
  magazin_slug: string;
  eticheta: string;
  pret: number;
  recomandat: boolean;
  url_afiliat?: string;
  logo_url?: string;
}

interface Produs {
  pozitie: number;
  badge: string | null;
  badge_color: string | null;
  nume: string;
  model: string;
  imagine: string;
  pret_de_la: number;
  moneda: string;
  scor_total: number;
  scoruri: Scor;
  verdict_scurt: string;
  verdict_detaliat: string;
  pro: string[];
  contra: string[];
  specificatii: { [key: string]: string };
  magazine: Magazin[];
}

interface TopProduseClientProps {
  produse: Produs[];
  culoare: string;
}

// Accent uniform indigo/cyan pentru toate cheile — diferentierea per-categorie
// se face prin emoji/titlu, nu prin culoare (aceeasi regula ca /top/page.tsx)
const BADGE_COLORS: Record<string, string> = new Proxy({}, { get: () => "bg-[#0d9488] text-white" });

const ACCENT_UNIFORM = { ring: "ring-[#14b8a6]", btn: "bg-[#0d9488] hover:bg-[#14b8a6]", score: "text-[#0d9488]" };
const ACCENT: Record<string, { ring: string; btn: string; score: string }> = new Proxy({}, { get: () => ACCENT_UNIFORM });

function ScorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#cbd5e1] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#334155] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#14b8a6] rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-[#cbd5e1] w-8 text-right">{value}</span>
    </div>
  );
}

function ScorCircle({ scor, size = "lg" }: { scor: number; size?: "sm" | "lg" }) {
  const color =
    scor >= 9.5 ? "text-emerald-500" :
    scor >= 8.5 ? "text-green-500" :
    scor >= 7.5 ? "text-yellow-500" : "text-[#0d9488]";

  if (size === "sm") {
    return (
      <div className={`text-sm font-black ${color}`}>{scor.toFixed(1)}</div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <div className={`text-3xl font-black ${color} leading-none`}>{scor.toFixed(1)}</div>
      <div className="text-xs text-[#94a3b8] mt-0.5">/ 10</div>
    </div>
  );
}

export default function TopProduseClient({ produse, culoare }: TopProduseClientProps) {
  const [sortare, setSortare] = useState<"pozitie" | "scor" | "pret">("pozitie");
  const [expandat, setExpandat] = useState<number | null>(null);
  const accent = ACCENT[culoare] || ACCENT.blue;

  const produseSortate = useMemo(() => {
    const arr = [...produse];
    if (sortare === "scor")  arr.sort((a, b) => b.scor_total - a.scor_total);
    if (sortare === "pret")  arr.sort((a, b) => a.pret_de_la - b.pret_de_la);
    if (sortare === "pozitie") arr.sort((a, b) => a.pozitie - b.pozitie);
    return arr;
  }, [produse, sortare]);

  const bestPick = produse.find(p => p.badge === "Alegerea Redactiei") || produse[0];

  return (
    <div>
      {/* BEST PICK BAR */}
      {bestPick && (
        <div className="bg-[#0d9488]/10 dark:bg-[#111827]/30 border border-[#cbd5e1] dark:border-[#1e293b]/40 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-[#0d9488] text-white text-xs font-black px-3 py-1.5 rounded-xl shrink-0">
            ⭐ Alegerea redactiei
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[#cbd5e1] dark:text-[#f1f5f9]">{bestPick.nume}</span>
            <span className="text-[#cbd5e1] text-sm ml-2">— {bestPick.verdict_scurt}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-lg font-black text-[#0d9488]">{bestPick.pret_de_la.toLocaleString("ro-RO")} lei</span>
            <a
              href={`/cod-reducere/${bestPick.magazine[0]?.magazin_slug}`}
              className="bg-gradient-to-r from-[#14b8a6] to-[#0d9488] hover:from-[#0d9488] hover:to-[#14b8a6] text-[#ffffff] text-sm font-bold px-4 py-2 rounded-xl transition-all"
            >
              Cauta pret &rarr;
            </a>
          </div>
        </div>
      )}

      {/* SORT CONTROLS */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-[#cbd5e1] mr-1">Sorteaza:</span>
        {[
          { val: "pozitie" as const, label: "Recomandate" },
          { val: "scor" as const,    label: "Scor" },
          { val: "pret" as const,    label: "Pret" },
        ].map(opt => (
          <button
            key={opt.val}
            onClick={() => setSortare(opt.val)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors ${
              sortare === opt.val
                ? "bg-[#0d9488] text-white"
                : "bg-[#1e293b] text-[#cbd5e1] border border-[#475569] hover:border-[#0f766e]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* COMPARISON TABLE — desktop */}
      <div className="hidden lg:block mb-8 overflow-x-auto">
        <table className="w-full bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden text-sm">
          <thead>
            <tr className="bg-[#334155]/50 border-b border-[#475569]">
              <th className="text-left px-4 py-3 font-bold text-[#cbd5e1] w-48">Produs</th>
              <th className="px-4 py-3 font-bold text-[#cbd5e1]">Scor</th>
              {Object.keys(produseSortate[0]?.scoruri || {}).map(k => (
                <th key={k} className="px-3 py-3 font-bold text-[#cbd5e1] text-xs">{k}</th>
              ))}
              <th className="px-4 py-3 font-bold text-[#cbd5e1]">Pret de la</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produseSortate.map((p, i) => (
              <tr key={p.pozitie}
                className={`border-b border-[#334155] last:border-0 ${i === 0 ? "bg-[#0d9488]/10/50 dark:bg-[#111827]/10" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#334155] text-xs font-black flex items-center justify-center text-[#cbd5e1] shrink-0">
                      {p.pozitie}
                    </span>
                    <div>
                      <div className="font-semibold text-[#cbd5e1] dark:text-[#f1f5f9] text-xs leading-tight">{p.nume}</div>
                      {p.badge && (
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${BADGE_COLORS[p.badge_color || "orange"] || BADGE_COLORS.orange}`}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <ScorCircle scor={p.scor_total} size="sm" />
                </td>
                {Object.values(p.scoruri).map((v, j) => (
                  <td key={j} className="px-3 py-3 text-center text-xs font-bold text-[#cbd5e1]">
                    {v}
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <span className="font-black text-[#0d9488] text-sm">
                    {p.pret_de_la.toLocaleString("ro-RO")} lei
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a href={`/cod-reducere/${p.magazine[0]?.magazin_slug}`}
                    className={`text-xs font-bold text-[#f1f5f9] px-3 py-1.5 rounded-lg ${accent.btn} transition-colors`}>
                    Cauta &rarr;
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRODUCT CARDS */}
      <div className="space-y-5">
        {produseSortate.map(p => {
          const isExpaneded = expandat === p.pozitie;
          return (
            <div
              key={p.pozitie}
              className={`bg-[#1e293b] rounded-xl border transition-all duration-200 overflow-hidden ${
                p.badge === "Alegerea Redactiei"
                  ? `border-[#0f766e] dark:border-[#0f766e] ring-1 ${accent.ring}`
                  : "border-[#334155]"
              }`}
            >
              {/* CARD HEADER */}
              <div className="p-5">
                <div className="flex gap-4">
                  {/* RANK + IMAGE */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center font-black text-[#cbd5e1]">
                      {p.pozitie}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imagine}
                      alt={p.nume}
                      className="w-20 h-14 object-cover rounded-xl border border-[#475569]"
                      loading="lazy"
                    />
                  </div>

                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="font-black text-[#cbd5e1] dark:text-[#f1f5f9] text-base leading-tight">{p.nume}</h3>
                      {p.badge && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${BADGE_COLORS[p.badge_color || "orange"] || BADGE_COLORS.orange}`}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#94a3b8] mb-2">{p.model}</p>
                    <p className="text-sm text-[#cbd5e1] leading-relaxed mb-3">{p.verdict_scurt}</p>

                    {/* SCORES */}
                    <div className="space-y-1.5 mb-3">
                      {Object.entries(p.scoruri).slice(0, 3).map(([k, v]) => (
                        <ScorBar key={k} label={k} value={v} />
                      ))}
                    </div>
                  </div>

                  {/* SCORE + BUY */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <ScorCircle scor={p.scor_total} />
                    <div className="text-right">
                      <div className="text-xs text-[#94a3b8]">de la</div>
                      <div className="text-xl font-black text-[#0d9488] leading-tight">
                        {p.pret_de_la.toLocaleString("ro-RO")} lei
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRO/CONTRA - mereu vizibil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#334155]">
                  <div>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1.5">Avantaje</p>
                    <ul className="space-y-1">
                      {p.pro.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-[#cbd5e1] flex items-start gap-1.5">
                          <span className="text-green-500 shrink-0 mt-0.5">+</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-500 dark:text-red-400 mb-1.5">Dezavantaje</p>
                    <ul className="space-y-1">
                      {p.contra.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-[#cbd5e1] flex items-start gap-1.5">
                          <span className="text-red-400 shrink-0 mt-0.5">-</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* MAGAZINE BUTTONS */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.magazine.map(mag => (
                    <a
                      key={mag.magazin_slug}
                      href={mag.url_afiliat || `/cod-reducere/${mag.magazin_slug}`}
                      target={mag.url_afiliat ? "_blank" : undefined}
                      rel={mag.url_afiliat ? "noopener noreferrer nofollow" : undefined}
                      className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
                        mag.recomandat
                          ? "bg-[#0d9488] hover:bg-[#14b8a6] text-white"
                          : "bg-[#334155] hover:bg-[#334155] dark:hover:bg-[#334155] text-[#cbd5e1]"
                      }`}
                    >
                      {mag.recomandat && <span className="text-yellow-300">★</span>}
                      {mag.eticheta}
                      {mag.pret > 0 && (
                        <span className={mag.recomandat ? "opacity-80" : "text-[#94a3b8]"}>
                          · {mag.pret.toLocaleString("ro-RO")} lei
                        </span>
                      )}
                    </a>
                  ))}
                </div>

                {/* EXPAND TOGGLE */}
                <button
                  onClick={() => setExpandat(isExpaneded ? null : p.pozitie)}
                  className="mt-3 text-xs text-[#94a3b8] hover:text-[#0d9488] transition-colors flex items-center gap-1"
                >
                  {isExpaneded ? "▲ Ascunde detalii" : "▼ Specificatii complete si review detaliat"}
                </button>
              </div>

              {/* EXPANDED DETAILS */}
              {isExpaneded && (
                <div className="px-5 pb-5 border-t border-[#334155] pt-4">
                  {/* VERDICT DETALIAT */}
                  <div className="bg-[#1e293b] dark:bg-[#14b8a6]/20 border border-[#14b8a6] dark:border-[#14b8a6]/30 rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-[#14b8a6] dark:text-[#0f766e] mb-1.5">Review detaliat</p>
                    <p className="text-sm text-[#cbd5e1] leading-relaxed">{p.verdict_detaliat}</p>
                  </div>

                  {/* TOATE SCORURILE */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-[#cbd5e1] mb-2">Scoruri complete</p>
                    <div className="space-y-2">
                      {Object.entries(p.scoruri).map(([k, v]) => (
                        <ScorBar key={k} label={k} value={v} />
                      ))}
                    </div>
                  </div>

                  {/* SPECIFICATII */}
                  <div>
                    <p className="text-xs font-bold text-[#cbd5e1] mb-2">Specificatii tehnice</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {Object.entries(p.specificatii).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2 bg-[#334155]/50 rounded-lg px-3 py-2">
                          <span className="text-xs font-semibold text-[#94a3b8] w-28 shrink-0">{k}</span>
                          <span className="text-xs text-[#cbd5e1]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
