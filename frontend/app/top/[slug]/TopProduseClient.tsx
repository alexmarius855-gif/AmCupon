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
  /** Vin din page.tsx cu `magazine` = DOAR partenerii, cu linkul platit de azi. */
  produse: Produs[];
  culoare: string;
  /** Exista sectiunea „Unde gasesti azi" (#unde-cumperi) pe pagina. */
  areSectiune: boolean;
  /** Cand au fost notate preturile din top — eticheta pretului de referinta. */
  selectie: string;
}

/**
 * Unde duce butonul unui model din top: primul partener (link afiliat real), altfel
 * sectiunea cu ofertele de azi, altfel nicaieri — butonul nu se afiseaza.
 * Pana pe 05.10.2026 ducea la /cod-reducere/<primul magazin>, care pentru eMAG era un
 * redirect spre /categorii/marketplace, iar pentru altex/flanco/pcgarage, 404.
 */
function destinatie(p: Produs, areSectiune: boolean): { href: string; extern: boolean; text: string } | null {
  const m = p.magazine[0];
  if (m?.url_afiliat) return { href: m.url_afiliat, extern: true, text: `Vezi la ${m.eticheta}` };
  if (areSectiune) return { href: "#unde-cumperi", extern: false, text: "Prețuri de azi" };
  return null;
}

// Accent uniform indigo/cyan pentru toate cheile — diferentierea per-categorie
// se face prin emoji/titlu, nu prin culoare (aceeasi regula ca /top/page.tsx)
const BADGE_COLORS: Record<string, string> = new Proxy({}, { get: () => "bg-[#ddf93c] text-[#0c1000]" });

const ACCENT_UNIFORM = { ring: "ring-[#ddf93c]", btn: "bg-[#ddf93c] hover:bg-[#ddf93c]", score: "text-[#ddf93c]" };
const ACCENT: Record<string, { ring: string; btn: string; score: string }> = new Proxy({}, { get: () => ACCENT_UNIFORM });

function ScorBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round((value / 10) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#c9ced5] w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-[#2a2f36] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#ddf93c] rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-bold text-[#c9ced5] w-8 text-right">{value}</span>
    </div>
  );
}

function ScorCircle({ scor, size = "lg" }: { scor: number; size?: "sm" | "lg" }) {
  const color =
    scor >= 9.5 ? "text-emerald-500" :
    scor >= 8.5 ? "text-green-500" :
    scor >= 7.5 ? "text-yellow-500" : "text-[#ddf93c]";

  if (size === "sm") {
    return (
      <div className={`text-sm font-black ${color}`}>{scor.toFixed(1)}</div>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <div className={`text-3xl font-black ${color} leading-none`}>{scor.toFixed(1)}</div>
      <div className="text-xs text-[#9399a0] mt-0.5">/ 10</div>
    </div>
  );
}

export default function TopProduseClient({ produse, culoare, areSectiune, selectie }: TopProduseClientProps) {
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
  const destBest = bestPick ? destinatie(bestPick, areSectiune) : null;

  return (
    <div>
      {/* BEST PICK BAR */}
      {bestPick && (
        <div className="bg-[#ddf93c]/10 border border-[#2a2f36] rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="bg-[#ddf93c] text-[#0c1000] text-xs font-black px-3 py-1.5 rounded-xl shrink-0">
            ⭐ Alegerea redacției
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-bold text-[#ffffff]">{bestPick.nume}</span>
            <span className="text-[#c9ced5] text-sm ml-2">— {bestPick.verdict_scurt}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-right leading-tight">
              <span className="block text-[11px] text-[#9399a0]">preț de referință, {selectie}</span>
              <span className="text-lg font-black text-[#ddf93c]">{bestPick.pret_de_la.toLocaleString("ro-RO")} lei</span>
            </span>
            {destBest && (
              <a
                href={destBest.href}
                {...(destBest.extern ? { target: "_blank", rel: "nofollow sponsored noopener noreferrer" } : {})}
                className="bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] text-sm font-bold px-4 py-2 rounded-xl transition-colors"
              >
                {destBest.text} {destBest.extern ? <>&rarr;</> : <>&darr;</>}
              </a>
            )}
          </div>
        </div>
      )}

      {/* SORT CONTROLS */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-[#c9ced5] mr-1">Sorteaza:</span>
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
                ? "bg-[#ddf93c] text-[#0c1000]"
                : "bg-[#1f2329] text-[#c9ced5] border border-[#3a4048] hover:border-[#c3dd2c]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* COMPARISON TABLE — desktop */}
      <div className="hidden lg:block mb-8 overflow-x-auto">
        <table className="w-full bg-[#1f2329] rounded-xl border border-[#2a2f36] overflow-hidden text-sm">
          <thead>
            <tr className="bg-[#2a2f36]/50 border-b border-[#3a4048]">
              <th className="text-left px-4 py-3 font-bold text-[#c9ced5] w-48">Produs</th>
              <th className="px-4 py-3 font-bold text-[#c9ced5]">Scor</th>
              {Object.keys(produseSortate[0]?.scoruri || {}).map(k => (
                <th key={k} className="px-3 py-3 font-bold text-[#c9ced5] text-xs">{k}</th>
              ))}
              <th className="px-4 py-3 font-bold text-[#c9ced5]" title={`Preț de referință, notat în ${selectie}`}>Preț ref.</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produseSortate.map((p, i) => (
              <tr key={p.pozitie}
                className={`border-b border-[#2a2f36] last:border-0 ${i === 0 ? "bg-[#ddf93c]/10/50 dark:bg-[#14181c]/10" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#2a2f36] text-xs font-black flex items-center justify-center text-[#c9ced5] shrink-0">
                      {p.pozitie}
                    </span>
                    <div>
                      <div className="font-semibold text-[#c9ced5] dark:text-[#ffffff] text-xs leading-tight">{p.nume}</div>
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
                  <td key={j} className="px-3 py-3 text-center text-xs font-bold text-[#c9ced5]">
                    {v}
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <span className="font-black text-[#ddf93c] text-sm">
                    {p.pret_de_la.toLocaleString("ro-RO")} lei
                  </span>
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const d = destinatie(p, areSectiune);
                    return d ? (
                      <a href={d.href}
                        {...(d.extern ? { target: "_blank", rel: "nofollow sponsored noopener noreferrer" } : {})}
                        className={`whitespace-nowrap text-xs font-bold text-[#0c1000] px-3 py-1.5 rounded-lg ${accent.btn} transition-colors`}>
                        {d.text} {d.extern ? <>&rarr;</> : <>&darr;</>}
                      </a>
                    ) : null;
                  })()}
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
              className={`bg-[#1f2329] rounded-xl border transition-all duration-200 overflow-hidden ${
                p.badge === "Alegerea Redactiei"
                  ? `border-[#c3dd2c] dark:border-[#c3dd2c] ring-1 ${accent.ring}`
                  : "border-[#2a2f36]"
              }`}
            >
              {/* CARD HEADER */}
              <div className="p-5">
                <div className="flex gap-4">
                  {/* RANK + IMAGE */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[#2a2f36] flex items-center justify-center font-black text-[#c9ced5]">
                      {p.pozitie}
                    </div>
                    {/* Imaginea se afiseaza DOAR daca e reala. Inainte, toate cele 142 de
                        produse aveau `picsum.photos` — poze stock aleatoare prezentate ca
                        fiind produsul. Eliminate (vezi scripts/fix_top_onestitate.py); pana
                        avem poze reale, aratam initiala, care nu pretinde ca e produsul. */}
                    {p.imagine ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imagine}
                        alt={p.nume}
                        className="w-20 h-14 object-cover rounded-xl border border-[#3a4048]"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-20 h-14 rounded-xl border border-[#3a4048] bg-[#1f2329] flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="text-[#6b7178] font-black text-lg">
                          {(p.nume || "?").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* MAIN INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="font-black text-[#c9ced5] dark:text-[#ffffff] text-base leading-tight">{p.nume}</h3>
                      {p.badge && (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${BADGE_COLORS[p.badge_color || "orange"] || BADGE_COLORS.orange}`}>
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#9399a0] mb-2">{p.model}</p>
                    <p className="text-sm text-[#c9ced5] leading-relaxed mb-3">{p.verdict_scurt}</p>

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
                      <div className="text-[11px] text-[#9399a0] leading-tight">preț de referință<br />{selectie}</div>
                      <div className="text-xl font-black text-[#ddf93c] leading-tight">
                        {p.pret_de_la.toLocaleString("ro-RO")} lei
                      </div>
                    </div>
                  </div>
                </div>

                {/* PRO/CONTRA - mereu vizibil */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#2a2f36]">
                  <div>
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1.5">Avantaje</p>
                    <ul className="space-y-1">
                      {p.pro.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-[#c9ced5] flex items-start gap-1.5">
                          <span className="text-green-500 shrink-0 mt-0.5">+</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-500 dark:text-red-400 mb-1.5">Dezavantaje</p>
                    <ul className="space-y-1">
                      {p.contra.slice(0, 3).map((item, i) => (
                        <li key={i} className="text-xs text-[#c9ced5] flex items-start gap-1.5">
                          <span className="text-red-400 shrink-0 mt-0.5">-</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* MAGAZINE — doar partenerii, cu linkul platit; fara pretul lor din mai–iunie.
                    Fara partener: trimitere la ofertele de azi de pe aceeasi pagina. */}
                {(p.magazine.length > 0 || areSectiune) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {p.magazine.map((mag, i) => (
                      <a
                        key={mag.magazin_slug}
                        href={mag.url_afiliat}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
                          i === 0
                            ? "bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000]"
                            : "bg-[#2a2f36] hover:bg-[#3a4048] text-[#ffffff]"
                        }`}
                      >
                        Vezi la {mag.eticheta} &rarr;
                      </a>
                    ))}
                    {p.magazine.length === 0 && areSectiune && (
                      <a
                        href="#unde-cumperi"
                        className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl bg-[#2a2f36] hover:bg-[#3a4048] text-[#ffffff] transition-colors"
                      >
                        Prețurile de azi la magazinele partenere &darr;
                      </a>
                    )}
                  </div>
                )}

                {/* EXPAND TOGGLE */}
                <button
                  onClick={() => setExpandat(isExpaneded ? null : p.pozitie)}
                  aria-expanded={isExpaneded}
                  className="mt-3 text-xs text-[#9399a0] hover:text-[#ddf93c] transition-colors flex items-center gap-1"
                >
                  {isExpaneded ? "▲ Ascunde detaliile" : "▼ Specificații și verdictul redacției"}
                </button>
              </div>

              {/* EXPANDED DETAILS */}
              {isExpaneded && (
                <div className="px-5 pb-5 border-t border-[#2a2f36] pt-4">
                  {/* VERDICT DETALIAT */}
                  <div className="bg-[#1f2329] dark:bg-[#ddf93c]/20 border border-[#ddf93c] dark:border-[#ddf93c]/30 rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-[#ddf93c] dark:text-[#c3dd2c] mb-1.5">Verdictul redacției</p>
                    <p className="text-sm text-[#c9ced5] leading-relaxed">{p.verdict_detaliat}</p>
                  </div>

                  {/* TOATE SCORURILE */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-[#c9ced5] mb-2">Scoruri complete</p>
                    <div className="space-y-2">
                      {Object.entries(p.scoruri).map(([k, v]) => (
                        <ScorBar key={k} label={k} value={v} />
                      ))}
                    </div>
                  </div>

                  {/* SPECIFICATII */}
                  <div>
                    <p className="text-xs font-bold text-[#c9ced5] mb-2">Specificatii tehnice</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {Object.entries(p.specificatii).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2 bg-[#2a2f36]/50 rounded-lg px-3 py-2">
                          <span className="text-xs font-semibold text-[#9399a0] w-28 shrink-0">{k}</span>
                          <span className="text-xs text-[#c9ced5]">{v}</span>
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
