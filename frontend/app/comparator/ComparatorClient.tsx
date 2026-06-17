"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

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
  logo_url?: string;
  categorie: string;
  categorie_slug?: string;
  comision: string;
  scor_final: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
  trend: number;
}

function numeAfisat(slug: string) {
  return slug.split(".")[0].replace(/-/g," ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function maxDiscount(promotii: Promotie[]): number {
  let max = 0;
  for (const p of promotii) {
    const m = (p.nume + " " + p.descriere).match(/(\d+)\s*%/g);
    if (m) for (const x of m) { const v = parseInt(x); if (v > max && v <= 90) max = v; }
  }
  return max;
}

function parseCashback(comision: string): number {
  const m = comision?.match(/(\d+(?:\.\d+)?)\s*%/);
  return m ? parseFloat(m[1]) : 0;
}

function ScorBar({ value, max = 100, color = "bg-indigo-600" }: { value: number; max?: number; color?: string }) {
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

function MagazinCard({ m, onRemove, onSwap, position }: { m: Magazin; onRemove: () => void; onSwap?: () => void; position: number }) {
  const [imgOk, setImgOk] = useState(true);
  const discount  = maxDiscount(m.promotii);
  const cashback  = parseCashback(m.comision);
  const nrCoduri  = m.promotii.filter(p => p.cod_cupon).length;
  const nrOferte  = m.promotii.length;
  const trustScore = m.procent_succes || (m.are_promotie ? 78 : 50);
  const gradients = ["from-violet-500 to-fuchsia-600", "from-blue-500 to-indigo-600"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header gradient */}
      <div className={`bg-gradient-to-r ${gradients[position % 2]} p-5 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">Magazin #{position + 1}</span>
          <div className="flex gap-2">
            {onSwap && (
              <button onClick={onSwap} title="Schimbă magazin" className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </button>
            )}
            <button onClick={onRemove} title="Elimină" className="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        {/* Logo + Nume */}
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
            {m.logo_url && imgOk
              ? <img src={m.logo_url} alt={numeAfisat(m.magazin)} className="w-10 h-10 object-contain" onError={() => setImgOk(false)} />
              : <span className="text-xl font-black text-indigo-400">{numeAfisat(m.magazin)[0]}</span>
            }
          </div>
          <div>
            <h2 className="text-xl font-black">{numeAfisat(m.magazin)}</h2>
            <p className="text-white/70 text-sm">{m.categorie}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 space-y-4">
        {/* Oferte */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Oferte active</span>
            <span className={`text-sm font-black ${nrOferte > 0 ? "text-emerald-600" : "text-slate-400"}`}>{nrOferte}</span>
          </div>
          <ScorBar value={nrOferte} max={20} color="bg-emerald-500" />
        </div>

        {/* Coduri cupon */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Coduri cupon</span>
            <span className={`text-sm font-black ${nrCoduri > 0 ? "text-violet-600" : "text-slate-400"}`}>{nrCoduri}</span>
          </div>
          <ScorBar value={nrCoduri} max={10} color="bg-violet-500" />
        </div>

        {/* Reducere max */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Reducere maximă</span>
            <span className={`text-sm font-black ${discount > 0 ? "text-indigo-300" : "text-slate-400"}`}>{discount > 0 ? `${discount}%` : "—"}</span>
          </div>
          <ScorBar value={discount} max={80} color="bg-indigo-600" />
        </div>

        {/* Cashback */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cashback</span>
            <span className={`text-sm font-black ${cashback > 0 ? "text-teal-600" : "text-slate-400"}`}>{cashback > 0 ? `${cashback}%` : "—"}</span>
          </div>
          <ScorBar value={cashback} max={20} color="bg-teal-500" />
        </div>

        {/* Trust Score */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trust Score</span>
            <span className="text-sm font-black text-slate-700">{trustScore}%</span>
          </div>
          <ScorBar value={trustScore} max={100} color={trustScore >= 80 ? "bg-emerald-500" : trustScore >= 60 ? "bg-amber-500" : "bg-red-500"} />
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {m.exclusiv    && <span className="text-[10px] font-bold bg-cyan-100 text-indigo-300 px-2 py-0.5 rounded-full">Exclusiv</span>}
          {m.cod_cupon   && <span className="text-[10px] font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">Cod cupon</span>}
          {m.are_promotie&& <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Ofertă activă</span>}
          {m.trend > 2   && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">🔥 Trending</span>}
          {cashback > 0  && <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Cashback</span>}
        </div>

        {/* Top promotii */}
        {m.promotii.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Top oferte</p>
            <ul className="space-y-1.5">
              {m.promotii.slice(0, 3).map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <span className="text-indigo-400 shrink-0 mt-0.5">•</span>
                  <span className="line-clamp-2">{p.nume}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <a href={`/cod-reducere/${m.magazin}`}
          className="flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-2">
          Vezi toate ofertele →
        </a>
      </div>
    </div>
  );
}

function SearchMagazin({ onSelect, exclude }: { onSelect: (slug: string) => void; exclude: string[] }) {
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<Magazin[]>([]);
  const [all, setAll]         = useState<Magazin[]>([]);
  const [show, setShow]       = useState(false);

  useEffect(() => {
    fetch("/output.json").then(r => r.json()).then(setAll).catch(() => {});
  }, []);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setShow(false); return; }
    const q = query.toLowerCase();
    setResults(all.filter(m => !exclude.includes(m.magazin) && (m.magazin.toLowerCase().includes(q) || numeAfisat(m.magazin).toLowerCase().includes(q))).slice(0, 6));
    setShow(true);
  }, [query, all, exclude]);

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShow(true)}
          onBlur={() => setTimeout(() => setShow(false), 150)}
          placeholder="Cauta magazin (ex: eMAG, Notino...)"
          className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition-all" />
      </div>
      {show && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
          {results.map(m => (
            <button key={m.magazin} onMouseDown={() => { onSelect(m.magazin); setQuery(""); setShow(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-cyan-50 text-left transition-colors">
              {m.logo_url
                ? <img src={m.logo_url} alt={numeAfisat(m.magazin)} className="w-7 h-7 object-contain" />
                : <div className="w-7 h-7 bg-cyan-100 rounded-lg flex items-center justify-center text-xs font-black text-indigo-400">{numeAfisat(m.magazin)[0]}</div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{numeAfisat(m.magazin)}</p>
                <p className="text-xs text-slate-400 truncate">{m.categorie}</p>
              </div>
              {m.are_promotie && <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full shrink-0">Activ</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ComparatorInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const [all, setAll]         = useState<Magazin[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetch("/output.json").then(r => r.json()).then((data: Magazin[]) => {
      setAll(data);
      const m1 = searchParams.get("m1");
      const m2 = searchParams.get("m2");
      const slugs: string[] = [];
      if (m1 && data.find(m => m.magazin === m1)) slugs.push(m1);
      if (m2 && data.find(m => m.magazin === m2)) slugs.push(m2);
      if (slugs.length === 0) slugs.push(...data.filter(m => m.are_promotie).slice(0, 2).map(m => m.magazin));
      setSelected(slugs);
    }).catch(() => {});
  }, [searchParams]);

  const updateURL = useCallback((slugs: string[]) => {
    const params = new URLSearchParams();
    if (slugs[0]) params.set("m1", slugs[0]);
    if (slugs[1]) params.set("m2", slugs[1]);
    router.replace(`/comparator?${params.toString()}`, { scroll: false });
  }, [router]);

  function addMagazin(slug: string) {
    if (selected.includes(slug) || selected.length >= 2) return;
    const next = [...selected, slug];
    setSelected(next); updateURL(next);
  }
  function removeMagazin(slug: string) {
    const next = selected.filter(s => s !== slug);
    setSelected(next); updateURL(next);
  }
  function swapMagazin(idx: number) {
    setSelected([]); updateURL([]);
  }

  const magazine = selected.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];

  // Scor final comparativ
  function totalScore(m: Magazin) {
    return (m.promotii.length * 5) + (m.procent_succes || 0) + maxDiscount(m.promotii) + parseCashback(m.comision) * 2;
  }
  const winner = magazine.length === 2
    ? totalScore(magazine[0]) >= totalScore(magazine[1]) ? magazine[0] : magazine[1]
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">INSTRUMENT NOU</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3">Comparator Magazine</h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Compară două magazine online side-by-side — oferte, coduri, cashback și trust score
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Winner banner */}
        {winner && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-black text-lg">{numeAfisat(winner.magazin)} câștigă comparația!</p>
              <p className="text-emerald-100 text-sm">Cel mai bun scor combinat — oferte + reduceri + cashback + trust</p>
            </div>
          </div>
        )}

        {/* Grid comparator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {magazine.map((m, i) => (
            <MagazinCard key={m.magazin} m={m} position={i}
              onRemove={() => removeMagazin(m.magazin)}
              onSwap={() => swapMagazin(i)} />
          ))}

          {/* Slot gol */}
          {selected.length < 2 && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-4 min-h-[200px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <p className="text-slate-400 text-sm font-semibold text-center">Adaugă al {selected.length + 1}-lea magazin pentru comparație</p>
              <SearchMagazin onSelect={addMagazin} exclude={selected} />
            </div>
          )}
        </div>

        {/* Adauga alt magazin */}
        {selected.length === 2 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6">
            <p className="text-sm font-bold text-slate-700 mb-3">Schimbă un magazin:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {magazine.map((m, i) => (
                <div key={m.magazin}>
                  <p className="text-xs text-slate-400 mb-1">Înlocuiește Magazin #{i + 1} ({numeAfisat(m.magazin)}):</p>
                  <SearchMagazin onSelect={(slug) => {
                    const next = [...selected];
                    next[i] = slug;
                    setSelected(next); updateURL(next);
                  }} exclude={selected.filter(s => s !== m.magazin)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sugestii rapide */}
        {selected.length < 2 && all.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Sugestii populare</p>
            <div className="flex flex-wrap gap-2">
              {all.filter(m => m.are_promotie && !selected.includes(m.magazin)).slice(0, 10).map(m => (
                <button key={m.magazin} onClick={() => addMagazin(m.magazin)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-cyan-50 rounded-full text-sm font-semibold text-slate-700 hover:text-indigo-300 transition-all">
                  {m.logo_url && <img src={m.logo_url} alt="" className="w-4 h-4 object-contain" />}
                  {numeAfisat(m.magazin)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComparatorClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-pulse text-slate-400">Se încarcă...</div></div>}>
      <ComparatorInner />
    </Suspense>
  );
}
