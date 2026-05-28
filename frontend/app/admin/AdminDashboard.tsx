"use client";

import { useEffect, useState, useCallback } from "react";

interface SiteStats {
  totalMagazine: number;
  cuPromotii: number;
  cuCod: number;
  totalPromotii: number;
  lastUpdate: string;
}

interface GithubRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  createdAt: string;
  updatedAt: string;
  url: string;
}

interface BrevoStats {
  subscribers: number;
  blacklisted: number;
  listName: string;
}

interface TopProduse {
  categorii: number;
  produse: number;
  updated: string;
}

interface StatusData {
  ok: boolean;
  timestamp: string;
  site: SiteStats | null;
  github: GithubRun[] | null;
  brevo: BrevoStats | null;
  topProduse: TopProduse | null;
  env: { hasGithubToken: boolean; hasBrevoKey: boolean; hasAdminPass: boolean };
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `acum ${Math.round(diff)}s`;
  if (diff < 3600) return `acum ${Math.round(diff / 60)}m`;
  if (diff < 86400) return `acum ${Math.round(diff / 3600)}h`;
  return `acum ${Math.round(diff / 86400)}z`;
}

function StatusBadge({ status, conclusion }: { status: string; conclusion: string | null }) {
  if (status === "in_progress" || status === "queued") {
    return (
      <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
        RUNNING
      </span>
    );
  }
  if (conclusion === "success") {
    return (
      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        SUCCESS
      </span>
    );
  }
  if (conclusion === "failure") {
    return (
      <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        FAILED
      </span>
    );
  }
  return (
    <span className="text-slate-400 text-xs font-bold">{conclusion || status}</span>
  );
}

const AGENTS = [
  {
    id:    "content",
    emoji: "📝",
    label: "Agent Continut",
    desc:  "Genereaza script YouTube + idei blog",
    color: "violet",
  },
  {
    id:    "business",
    emoji: "💡",
    label: "Agent Business",
    desc:  "Analizeaza oportunitati de afaceri",
    color: "amber",
  },
  {
    id:    "social",
    emoji: "📱",
    label: "Agent Social Media",
    desc:  "Postari Instagram, TikTok, Facebook",
    color: "pink",
  },
  {
    id:    "update-data",
    emoji: "🔄",
    label: "Actualizeaza Date",
    desc:  "Ruleaza pipeline complet de date",
    color: "blue",
  },
];

export default function AdminDashboard() {
  const [data,         setData]         = useState<StatusData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [triggering,   setTriggering]   = useState<string | null>(null);
  const [triggerMsg,   setTriggerMsg]   = useState<string | null>(null);
  const [lastRefresh,  setLastRefresh]  = useState(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/status");
      if (res.ok) {
        setData(await res.json());
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // refresh la 30s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  async function triggerAgent(workflow: string, agentType?: string) {
    setTriggering(workflow + (agentType || ""));
    setTriggerMsg(null);
    try {
      const res = await fetch("/api/admin/trigger", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          workflow: workflow === "update-data" ? "update-data" : "run-agent",
          inputs:   agentType ? { agent_type: agentType } : {},
        }),
      });
      const d = await res.json();
      setTriggerMsg(d.ok ? `✅ ${d.message}` : `❌ ${d.error}`);
      setTimeout(() => { fetchStatus(); setTriggerMsg(null); }, 3000);
    } catch {
      setTriggerMsg("❌ Eroare de conexiune");
    } finally {
      setTriggering(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-slate-400 text-sm">Se incarca Mission Control...</p>
        </div>
      </div>
    );
  }

  const s = data?.site;
  const g = data?.github;
  const b = data?.brevo;
  const t = data?.topProduse;
  const lastRun = g?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* TOPBAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-black text-sm">M</div>
            <span className="font-black text-lg tracking-tight">Mission Control</span>
            <span className="text-slate-600 text-sm hidden sm:block">amcupon.ro</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · {lastRefresh.toLocaleTimeString("ro-RO")}
            </div>
            <button
              onClick={fetchStatus}
              className="text-slate-400 hover:text-white transition-colors text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              ↻ Refresh
            </button>
            <a href="https://amcupon.ro" target="_blank" rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800">
              ↗ Site
            </a>
            <button onClick={logout}
              className="text-slate-500 hover:text-red-400 transition-colors text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* TRIGGER MSG */}
        {triggerMsg && (
          <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            triggerMsg.startsWith("✅")
              ? "bg-emerald-900/40 border border-emerald-700/50 text-emerald-300"
              : "bg-red-900/40 border border-red-700/50 text-red-300"
          }`}>
            {triggerMsg}
          </div>
        )}

        {/* ENV WARNINGS */}
        {data?.env && (
          <div className="flex flex-wrap gap-2">
            {!data.env.hasGithubToken && (
              <span className="text-xs bg-yellow-900/40 border border-yellow-700/40 text-yellow-400 px-3 py-1 rounded-full">
                ⚠ ADMIN_GITHUB_TOKEN lipsa — trigger dezactivat
              </span>
            )}
            {!data.env.hasBrevoKey && (
              <span className="text-xs bg-yellow-900/40 border border-yellow-700/40 text-yellow-400 px-3 py-1 rounded-full">
                ⚠ BREVO_API_KEY lipsa — newsletter stats dezactivat
              </span>
            )}
          </div>
        )}

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Magazine",    val: s?.totalMagazine ?? "—",  icon: "🏪", color: "blue" },
            { label: "Cu promotii", val: s?.cuPromotii ?? "—",     icon: "🔥", color: "orange" },
            { label: "Coduri",      val: s?.cuCod ?? "—",          icon: "🎟",  color: "violet" },
            { label: "Abonati",     val: b?.subscribers ?? "—",    icon: "📧", color: "emerald" },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-white">{stat.val.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GITHUB ACTIONS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-base flex items-center gap-2">
                <span>⚙️</span> GitHub Actions
              </h2>
              {data?.env.hasGithubToken ? (
                <button
                  onClick={() => triggerAgent("update-data")}
                  disabled={!!triggering}
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {triggering === "update-data" ? "Se porneste..." : "▶ Run Now"}
                </button>
              ) : (
                <span className="text-xs text-slate-500">Token lipsa</span>
              )}
            </div>

            {g && g.length > 0 ? (
              <div className="space-y-2">
                {g.map(run => (
                  <a key={run.id} href={run.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl hover:bg-slate-800 transition-colors group">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">{run.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{timeAgo(run.updatedAt)}</p>
                    </div>
                    <StatusBadge status={run.status} conclusion={run.conclusion} />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm text-center py-6">
                {data?.env.hasGithubToken ? "Niciun run recent" : "Configureaza ADMIN_GITHUB_TOKEN"}
              </p>
            )}

            {s?.lastUpdate && (
              <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-800">
                Date actualizate: {timeAgo(s.lastUpdate)}
              </p>
            )}
          </div>

          {/* SITE HEALTH */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h2 className="font-black text-base flex items-center gap-2 mb-4">
              <span>📊</span> Sanatate Site
            </h2>
            <div className="space-y-3">
              {[
                { label: "Magazine totale",    val: s?.totalMagazine, max: 700, color: "blue" },
                { label: "Cu promotii active", val: s?.cuPromotii,    max: s?.totalMagazine || 1, color: "orange" },
                { label: "Cu cod reducere",    val: s?.cuCod,         max: s?.cuPromotii || 1, color: "violet" },
              ].map(item => {
                const pct = item.val && item.max ? Math.round((item.val / item.max) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white font-bold">{item.val ?? "—"}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full">
                      <div
                        className={`h-full rounded-full bg-${item.color}-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 mt-2">
                {t && (
                  <div className="bg-slate-800/60 rounded-xl p-3">
                    <div className="text-lg font-black text-orange-400">{t.produse}</div>
                    <div className="text-xs text-slate-500">Produse in /top</div>
                  </div>
                )}
                {b && (
                  <div className="bg-slate-800/60 rounded-xl p-3">
                    <div className="text-lg font-black text-emerald-400">{b.subscribers}</div>
                    <div className="text-xs text-slate-500">Abonati newsletter</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI AGENTS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-base flex items-center gap-2">
              <span>🤖</span> AI Agents
            </h2>
            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
              powered by Claude
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {AGENTS.map(agent => (
              <button
                key={agent.id}
                onClick={() => triggerAgent("run-agent", agent.id === "update-data" ? undefined : agent.id)}
                disabled={!!triggering || !data?.env.hasGithubToken}
                className="group text-left p-4 bg-slate-800/60 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="text-2xl mb-3">{agent.emoji}</div>
                <div className="font-bold text-sm text-white mb-1 group-hover:text-orange-300 transition-colors">
                  {agent.label}
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">{agent.desc}</div>
                <div className="mt-3 text-xs font-bold text-slate-600 group-hover:text-orange-400 transition-colors">
                  {triggering === ("run-agent" + agent.id) ? "Se porneste..." : "▶ Run →"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* QUICK LINKS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h2 className="font-black text-base flex items-center gap-2 mb-4">
            <span>🔗</span> Quick Links
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Vercel Dashboard",   href: "https://vercel.com/dashboard",                          emoji: "▲" },
              { label: "GitHub Actions",     href: `https://github.com/${data?.env.hasGithubToken ? "alexmarius855/afiliere-site" : "#"}/actions`, emoji: "⚙️" },
              { label: "Brevo Contacts",     href: "https://app.brevo.com/contact/list",                    emoji: "📧" },
              { label: "Google Analytics",   href: "https://analytics.google.com",                          emoji: "📈" },
              { label: "Google Search",      href: "https://search.google.com/search-console",              emoji: "🔍" },
              { label: "2Performant",        href: "https://app.2performant.com",                            emoji: "💰" },
              { label: "Profitshare",        href: "https://www.profitshare.ro",                             emoji: "💰" },
              { label: "Site Live",          href: "https://amcupon.ro",                                    emoji: "🌐" },
            ].map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-700 hover:border-slate-500">
                <span>{l.emoji}</span>{l.label}
              </a>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-xs text-slate-700 pb-4">
          Mission Control v1.0 · AmCupon.ro · Auto-refresh 30s
        </p>
      </div>
    </div>
  );
}
