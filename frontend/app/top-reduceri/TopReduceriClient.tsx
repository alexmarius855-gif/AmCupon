"use client";

import { useState } from "react";

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
  rank?: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  trend: number;
}

interface Props {
  luna: string;
  an: number;
  topCoduri: Magazin[];
  topPromo: Magazin[];
  trending: Magazin[];
  expiraCurand: Magazin[];
  totalMagazine: number;
  totalCoduri: number;
}

type Tab = "coduri" | "promo" | "trending" | "expira";

function numeAfisat(magazin: string): string {
  return magazin
    .split(".")[0]
    .replace(/-/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function bestCod(promotii: Promotie[]): Promotie | null {
  const cuCod = promotii.filter((p) => p.cod_cupon);
  return cuCod[0] || null;
}

function MagazinCard({
  m,
  rank,
  showTrend,
  showExpiry,
}: {
  m: Magazin;
  rank: number;
  showTrend?: boolean;
  showExpiry?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const cod = bestCod(m.promotii);
  const promo = m.promotii[0];
  const nume = numeAfisat(m.magazin);

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-orange-500/30 transition-all group">
      <div className="flex items-start gap-3">
        {/* Rank badge */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-all">
          {rank}
        </div>

        {/* Logo */}
        {m.logo_url ? (
          <img
            src={m.logo_url}
            alt={nume}
            className="w-10 h-10 object-contain rounded-lg bg-white p-1 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-sm font-black text-slate-400 shrink-0">
            {nume.charAt(0)}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`/cod-reducere/${m.magazin}`}
              className="font-bold text-white hover:text-orange-400 transition-colors text-sm"
            >
              {nume}
            </a>
            {showTrend && m.trend > 0 && (
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                +{m.trend}% trend
              </span>
            )}
            {showExpiry && m.zile_ramase > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                m.zile_ramase === 1
                  ? "bg-red-500/15 text-red-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}>
                {m.zile_ramase === 1 ? "Expira azi!" : `${m.zile_ramase} zile`}
              </span>
            )}
          </div>

          {promo && (
            <p className="text-xs text-slate-400 mt-0.5 truncate">{promo.nume}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs text-slate-500">
              {m.procent_succes}% succes
            </span>
            {m.folosit_de > 0 && (
              <span className="text-xs text-slate-500">
                {m.folosit_de.toLocaleString()} utilizatori
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          {cod ? (
            <button
              onClick={() => handleCopy(cod.cod_cupon)}
              className={`text-xs font-bold px-3 py-2 rounded-xl transition-all ${
                copied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500 hover:text-white"
              }`}
            >
              {copied ? "Copiat!" : cod.cod_cupon}
            </button>
          ) : (
            <a
              href={m.url_afiliat || m.url}
              target="_blank"
              rel="nofollow noopener"
              className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
            >
              Vezi &rarr;
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TopReduceriClient({
  luna,
  an,
  topCoduri,
  topPromo,
  trending,
  expiraCurand,
  totalMagazine,
  totalCoduri,
}: Props) {
  const [tab, setTab] = useState<Tab>("coduri");

  const TABS: { key: Tab; label: string; icon: string; count: number; desc: string }[] = [
    { key: "coduri",   label: "Top Coduri",      icon: "🎟", count: topCoduri.length,    desc: "Cele mai bune coduri verificate" },
    { key: "promo",    label: "Top Reduceri",     icon: "🏷", count: topPromo.length,     desc: "Reduceri automate active" },
    { key: "trending", label: "In Trend",         icon: "🔥", count: trending.length,     desc: "Magazine cu crestere rapida" },
    { key: "expira",   label: "Expira Curand",    icon: "⏰", count: expiraCurand.length, desc: "Ultima sansa" },
  ];

  const activeList = {
    coduri:   topCoduri,
    promo:    topPromo,
    trending: trending,
    expira:   expiraCurand,
  }[tab];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-400">Top Reduceri</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-orange-400 text-xs font-bold mb-4">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            Actualizat zilnic
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Top Reduceri {luna} {an}
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Selectia celor mai bune coduri si reduceri active, sortate dupa rata de succes. Verificate zilnic.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-black text-orange-400">{totalMagazine}+</div>
              <div className="text-xs text-slate-500">magazine</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black text-orange-400">{totalCoduri}</div>
              <div className="text-xs text-slate-500">coduri active</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-500">gratuit</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`p-3 rounded-xl text-sm font-bold transition-all text-left ${
                tab === t.key
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-orange-500/40"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span>{t.icon}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-black ${
                  tab === t.key ? "bg-white/20" : "bg-slate-800"
                }`}>
                  {t.count}
                </span>
              </div>
              <div className="font-black">{t.label}</div>
              <div className={`text-xs mt-0.5 ${tab === t.key ? "text-orange-100" : "text-slate-500"}`}>
                {t.desc}
              </div>
            </button>
          ))}
        </div>

        {/* List */}
        {activeList.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-slate-400">Nu sunt oferte in aceasta categorie momentan.</p>
            <a href="/toate-magazinele" className="mt-4 inline-block text-orange-400 hover:text-orange-300 text-sm font-semibold">
              Vezi toate magazinele &rarr;
            </a>
          </div>
        ) : (
          <div className="space-y-2">
            {activeList.map((m, i) => (
              <MagazinCard
                key={m.magazin}
                m={m}
                rank={i + 1}
                showTrend={tab === "trending"}
                showExpiry={tab === "expira"}
              />
            ))}
          </div>
        )}

        {/* CTA tools */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
            <span className="text-3xl">🧮</span>
            <div>
              <p className="text-white font-bold text-sm">Calculator Reduceri</p>
              <p className="text-slate-500 text-xs">Cat economisesti cu un cod?</p>
            </div>
            <a
              href="/calculator"
              className="ml-auto shrink-0 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Calculeaza
            </a>
          </div>
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex items-center gap-4">
            <span className="text-3xl">🏪</span>
            <div>
              <p className="text-white font-bold text-sm">Toate Magazinele</p>
              <p className="text-slate-500 text-xs">{totalMagazine}+ magazine verificate</p>
            </div>
            <a
              href="/toate-magazinele"
              className="ml-auto shrink-0 bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
            >
              Cauta
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
