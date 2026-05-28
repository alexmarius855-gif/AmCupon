"use client";

import { useEffect, useState, useCallback } from "react";

/* ─── Types ─────────────────────────────────────────────── */
interface SiteStats { totalMagazine:number; cuPromotii:number; cuCod:number; lastUpdate:string; }
interface GithubRun { id:number; name:string; status:string; conclusion:string|null; updatedAt:string; url:string; }
interface BrevoStats { subscribers:number; listName:string; }
interface StatusData {
  ok:boolean; timestamp:string;
  site:SiteStats|null; github:GithubRun[]|null; brevo:BrevoStats|null;
  env:{ hasGithubToken:boolean; hasBrevoKey:boolean; };
}
type NavItem = "agents"|"tasks"|"memory"|"logs"|"links";

/* ─── Agent definitions ─────────────────────────────────── */
const AGENTS = [
  {
    id:      "nexus",
    name:    "NEXUS",
    role:    "Data & Sync",
    model:   "claude-haiku",
    color:   "#00f5d4",
    bg:      "from-cyan-900/40 to-slate-900",
    border:  "border-cyan-500/30",
    glow:    "shadow-cyan-500/20",
    desc:    "NEXUS actualizeaza magazine, promotii si merge toate platformele de afiliere. Ruleaza de 4 ori pe zi.",
    skills:  ["Scraper","Merge","2Performant","Profitshare","Auto"],
    avatar:  "N",
    avatarBg:"#00f5d4",
    workflow:"update-data",
    agentType: null,
    status:  "idle",
  },
  {
    id:      "echo",
    name:    "ECHO",
    role:    "Content & YouTube",
    model:   "claude-sonnet",
    color:   "#ff3cac",
    bg:      "from-pink-900/40 to-slate-900",
    border:  "border-pink-500/30",
    glow:    "shadow-pink-500/20",
    desc:    "ECHO genereaza scripturi complete YouTube, articole SEO, idei blog si ghiduri de cumparare.",
    skills:  ["YouTube","Blog","SEO","Creative","Scripts"],
    avatar:  "E",
    avatarBg:"#ff3cac",
    workflow:"run-agent",
    agentType:"youtube",
    status:  "idle",
  },
  {
    id:      "pulse",
    name:    "PULSE",
    role:    "Social & Newsletter",
    model:   "claude-haiku",
    color:   "#f7971e",
    bg:      "from-orange-900/40 to-slate-900",
    border:  "border-orange-500/30",
    glow:    "shadow-orange-500/20",
    desc:    "PULSE creeaza continut pentru Instagram, TikTok, Facebook si campanii email pentru abonati.",
    skills:  ["Instagram","TikTok","Email","Growth","Viral"],
    avatar:  "P",
    avatarBg:"#f7971e",
    workflow:"run-agent",
    agentType:"social",
    status:  "idle",
  },
  {
    id:      "sigma",
    name:    "SIGMA",
    role:    "Business & Strategy",
    model:   "claude-opus",
    color:   "#784ba0",
    bg:      "from-violet-900/40 to-slate-900",
    border:  "border-violet-500/30",
    glow:    "shadow-violet-500/20",
    desc:    "SIGMA analizeaza oportunitati de business, strategii de crestere si idei de monetizare noi.",
    skills:  ["Business","Strategy","Analytics","Research","Ideas"],
    avatar:  "S",
    avatarBg:"#784ba0",
    workflow:"run-agent",
    agentType:"business",
    status:  "idle",
  },
];

/* ─── Helpers ───────────────────────────────────────────── */
function timeAgo(iso:string):string {
  const d=(Date.now()-new Date(iso).getTime())/1000;
  if(d<60) return `${Math.round(d)}s`;
  if(d<3600) return `${Math.round(d/60)}m`;
  if(d<86400) return `${Math.round(d/3600)}h`;
  return `${Math.round(d/86400)}z`;
}
function runColor(r:GithubRun) {
  if(r.status==="in_progress"||r.status==="queued") return "#f7971e";
  if(r.conclusion==="success") return "#00f5d4";
  if(r.conclusion==="failure") return "#ff3cac";
  return "#666";
}
function runLabel(r:GithubRun) {
  if(r.status==="in_progress") return "RUNNING";
  if(r.status==="queued")      return "QUEUED";
  return (r.conclusion||r.status).toUpperCase();
}

/* ─── Avatar SVG ────────────────────────────────────────── */
function AgentAvatar({ letter, color }: { letter:string; color:string }) {
  return (
    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
      style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, border:`1.5px solid ${color}66` }}>
      <div className="absolute inset-0 flex items-center justify-center font-black text-2xl"
        style={{ color, textShadow:`0 0 12px ${color}` }}>
        {letter}
      </div>
      {/* scanline effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)" }} />
    </div>
  );
}

/* ─── Sidebar nav items ─────────────────────────────────── */
const NAV = [
  { id:"agents" as NavItem, icon:"🤖", label:"Agent Roster",  sub:"ECHIPA" },
  { id:"tasks"  as NavItem, icon:"⚙️", label:"GitHub Actions", sub:"TASKS" },
  { id:"memory" as NavItem, icon:"💾", label:"Site Stats",     sub:"MEMORIE" },
  { id:"logs"   as NavItem, icon:"📋", label:"Logs & Output",  sub:"LOGS" },
  { id:"links"  as NavItem, icon:"🔗", label:"Quick Links",    sub:"LINKS" },
];

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const [data,       setData]       = useState<StatusData|null>(null);
  const [loading,    setLoading]    = useState(true);
  const [nav,        setNav]        = useState<NavItem>("agents");
  const [triggering, setTriggering] = useState<string|null>(null);
  const [triggerMsg, setTriggerMsg] = useState<{ text:string; ok:boolean }|null>(null);
  const [now,        setNow]        = useState(new Date());
  const [agentStates, setAgentStates] = useState<Record<string,"idle"|"running"|"done">>({});

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/status");
      if(res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStatus();
    const si = setInterval(fetchStatus, 30000);
    const st = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(si); clearInterval(st); };
  }, [fetchStatus]);

  async function runAgent(agent: typeof AGENTS[0]) {
    const key = agent.id;
    setTriggering(key);
    setAgentStates(s => ({ ...s, [key]: "running" }));
    setTriggerMsg(null);
    try {
      const res = await fetch("/api/admin/trigger", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          workflow: agent.workflow,
          inputs:   agent.agentType ? { agent_type: agent.agentType } : {},
        }),
      });
      const d = await res.json();
      if(d.ok) {
        setAgentStates(s => ({ ...s, [key]: "done" }));
        setTriggerMsg({ text: `✅ ${agent.name} pornit cu succes!`, ok:true });
        setTimeout(() => { fetchStatus(); setAgentStates(s => ({ ...s, [key]: "idle" })); }, 5000);
      } else {
        setAgentStates(s => ({ ...s, [key]: "idle" }));
        setTriggerMsg({ text:`❌ ${d.error}`, ok:false });
      }
    } catch {
      setAgentStates(s => ({ ...s, [key]: "idle" }));
      setTriggerMsg({ text:"❌ Eroare conexiune", ok:false });
    } finally { setTriggering(null); }
  }

  async function logout() {
    await fetch("/api/admin/login", { method:"DELETE" });
    window.location.href = "/admin";
  }

  /* ── bg scanline ── */
  const scanlineBg = {
    backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,255,212,0.012) 3px,rgba(0,255,212,0.012) 4px)",
  };

  if(loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"#07071a", ...scanlineBg }}>
      <div className="text-center">
        <div className="text-4xl mb-3 animate-spin">⚙️</div>
        <p className="font-mono text-sm" style={{ color:"#00f5d4" }}>INITIALIZING MISSION CONTROL...</p>
      </div>
    </div>
  );

  const s  = data?.site;
  const g  = data?.github || [];
  const b  = data?.brevo;
  const lastRun = g[0];

  return (
    <div className="flex h-screen overflow-hidden font-sans" style={{ background:"#07071a", ...scanlineBg }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside className="w-52 flex flex-col shrink-0 border-r overflow-y-auto"
        style={{ background:"#0d0d26", borderColor:"#1a1a40" }}>

        {/* Logo */}
        <div className="px-4 py-5 border-b" style={{ borderColor:"#1a1a40" }}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">🎛️</span>
            <span className="font-black text-sm tracking-widest" style={{ color:"#00f5d4" }}>MISSION</span>
          </div>
          <span className="font-black text-base tracking-widest ml-7" style={{ color:"#ff3cac" }}>CONTROL</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {NAV.map(n => (
            <button key={n.id} onClick={() => setNav(n.id)}
              className="w-full text-left px-3 py-2.5 rounded-xl transition-all group"
              style={{
                background: nav===n.id ? "rgba(0,245,212,0.08)" : "transparent",
                border: `1px solid ${nav===n.id ? "rgba(0,245,212,0.2)" : "transparent"}`,
              }}>
              <div className="flex items-center gap-2.5">
                <span className="text-base">{n.icon}</span>
                <div>
                  <p className="text-xs font-bold leading-none"
                    style={{ color: nav===n.id ? "#00f5d4" : "#8888aa" }}>{n.label}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color:"#444466", fontSize:"9px" }}>{n.sub}</p>
                </div>
              </div>
            </button>
          ))}
        </nav>

        {/* System status */}
        <div className="px-4 py-4 border-t" style={{ borderColor:"#1a1a40" }}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:"#00f5d4" }} />
            <span className="text-xs font-mono font-bold" style={{ color:"#00f5d4", fontSize:"10px" }}>SYSTEM ONLINE</span>
          </div>
          <button onClick={logout} className="text-xs font-mono mt-2 transition-colors hover:opacity-100 opacity-40"
            style={{ color:"#ff3cac", fontSize:"10px" }}>
            [ LOGOUT ]
          </button>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="px-6 py-3 flex items-center justify-between shrink-0 border-b"
          style={{ background:"rgba(13,13,38,0.8)", borderColor:"#1a1a40", backdropFilter:"blur(8px)" }}>
          <div className="flex items-center gap-4">
            <h1 className="font-black text-2xl tracking-widest" style={{
              background:"linear-gradient(90deg,#00f5d4,#ff3cac,#784ba0)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            }}>
              MISSION CONTROL
            </h1>
            <span className="text-xs font-mono hidden sm:block" style={{ color:"#444466" }}>
              AmCupon.ro Command Center &nbsp;|&nbsp; Last update: {now.toLocaleTimeString("ro-RO")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
              style={{ color:"#ff3cac", borderColor:"#ff3cac44", background:"#ff3cac11", fontSize:"10px" }}>
              SYNTHWAVE MODE
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md border"
              style={{ color:"#00f5d4", borderColor:"#00f5d444", background:"#00f5d411", fontSize:"10px" }}>
              PHASE 2: AGENTS
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">

          {/* Trigger message */}
          {triggerMsg && (
            <div className="mb-4 px-4 py-2.5 rounded-xl text-sm font-mono font-bold border"
              style={{
                color:       triggerMsg.ok ? "#00f5d4" : "#ff3cac",
                borderColor: triggerMsg.ok ? "#00f5d444" : "#ff3cac44",
                background:  triggerMsg.ok ? "#00f5d411" : "#ff3cac11",
              }}>
              {triggerMsg.text}
            </div>
          )}

          {/* MISIUNE banner */}
          {nav==="agents" && (
            <div className="mb-5 px-5 py-3 rounded-2xl border text-center"
              style={{ background:"rgba(120,75,160,0.08)", borderColor:"#784ba033" }}>
              <span className="text-sm font-mono" style={{ color:"#784ba0" }}>🎯 MISIUNE &nbsp;🎯</span>
              <p className="text-sm font-mono mt-1" style={{ color:"#ff3cac" }}>
                Autonomous data sync, content creation &amp; business growth for AmCupon.ro operations
              </p>
            </div>
          )}

          {/* ── AGENTS VIEW ──────────────────────────────── */}
          {nav==="agents" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AGENTS.map(agent => {
                const state = agentStates[agent.id] || "idle";
                const isRunning = state==="running" || triggering===agent.id;
                const isDone    = state==="done";
                return (
                  <div key={agent.id}
                    className={`rounded-2xl border p-5 transition-all duration-300 bg-gradient-to-br ${agent.bg} shadow-xl ${agent.glow}`}
                    style={{
                      borderColor: isRunning ? agent.color : isDone ? "#00f5d4" : agent.color+"44",
                      boxShadow:   isRunning ? `0 0 20px ${agent.color}33` : "none",
                    }}>

                    {/* Card header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AgentAvatar letter={agent.avatar} color={agent.color} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-lg tracking-wider" style={{ color:agent.color, textShadow:`0 0 8px ${agent.color}66` }}>
                              {agent.name}
                            </h3>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md border font-mono"
                              style={{ color:agent.color, borderColor:agent.color+"55", background:agent.color+"11" }}>
                              {agent.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* Model badge */}
                      <span className="text-xs font-mono px-2 py-1 rounded-md border shrink-0"
                        style={{ color:"#666688", borderColor:"#333355", background:"#111128", fontSize:"10px" }}>
                        ● {agent.model}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-3" style={{ color:"#8888aa" }}>{agent.desc}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {agent.skills.map(sk => (
                        <span key={sk} className="text-xs font-mono px-2 py-0.5 rounded-md"
                          style={{ color:agent.color+"cc", background:agent.color+"15", border:`1px solid ${agent.color}33` }}>
                          {sk}
                        </span>
                      ))}
                    </div>

                    {/* Status + Run button */}
                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor:"#ffffff0d" }}>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full"
                          style={{ background: isRunning ? agent.color : isDone ? "#00f5d4" : "#333355",
                            boxShadow: isRunning ? `0 0 6px ${agent.color}` : "none",
                            animation: isRunning ? "pulse 1s infinite" : "none",
                          }} />
                        <span className="text-xs font-mono" style={{ color:"#666688", fontSize:"10px" }}>
                          {isRunning ? "RUNNING..." : isDone ? "DONE ✓" : "Fara sesiune activa"}
                        </span>
                      </div>
                      <button
                        onClick={() => runAgent(agent)}
                        disabled={isRunning || !data?.env.hasGithubToken}
                        className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{
                          color:       isRunning ? "#333355" : agent.color,
                          border:      `1px solid ${agent.color}55`,
                          background:  isRunning ? "#1a1a30" : agent.color+"15",
                        }}>
                        {isRunning ? "RUNNING..." : "▶ RUN"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── TASKS VIEW ──────────────────────────────── */}
          {nav==="tasks" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black tracking-wider" style={{ color:"#00f5d4" }}>⚙️ GITHUB ACTIONS</h2>
                <button onClick={() => runAgent(AGENTS[0])}
                  disabled={!!triggering || !data?.env.hasGithubToken}
                  className="text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-30"
                  style={{ color:"#00f5d4", border:"1px solid #00f5d444", background:"#00f5d411" }}>
                  ▶ RUN UPDATE NOW
                </button>
              </div>
              <div className="space-y-2">
                {g.length>0 ? g.map(run => (
                  <a key={run.id} href={run.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border transition-all hover:border-opacity-60"
                    style={{ background:"rgba(13,13,38,0.8)", borderColor:"#1a1a40" }}>
                    <div>
                      <p className="text-sm font-semibold text-white">{run.name}</p>
                      <p className="text-xs font-mono mt-0.5" style={{ color:"#444466" }}>{timeAgo(run.updatedAt)} ago</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-md"
                      style={{ color:runColor(run), background:runColor(run)+"11", border:`1px solid ${runColor(run)}44` }}>
                      {runLabel(run)}
                    </span>
                  </a>
                )) : (
                  <div className="text-center py-12" style={{ color:"#444466" }}>
                    <p className="font-mono text-sm">
                      {data?.env.hasGithubToken ? "Niciun run recent" : "⚠ ADMIN_GITHUB_TOKEN neconfigurat"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MEMORY / STATS VIEW ─────────────────────── */}
          {nav==="memory" && (
            <div>
              <h2 className="font-black tracking-wider mb-4" style={{ color:"#f7971e" }}>💾 SITE STATS</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { l:"Magazine",    v:s?.totalMagazine, c:"#00f5d4" },
                  { l:"Cu promotii", v:s?.cuPromotii,    c:"#ff3cac" },
                  { l:"Cu cod",      v:s?.cuCod,         c:"#f7971e" },
                  { l:"Abonati NL",  v:b?.subscribers,   c:"#784ba0" },
                ].map(st => (
                  <div key={st.l} className="rounded-2xl p-4 border" style={{ background:"rgba(13,13,38,0.8)", borderColor:st.c+"33" }}>
                    <div className="text-2xl font-black mb-1" style={{ color:st.c, textShadow:`0 0 10px ${st.c}55` }}>
                      {st.v?.toLocaleString() ?? "—"}
                    </div>
                    <div className="text-xs font-mono" style={{ color:"#666688" }}>{st.l}</div>
                  </div>
                ))}
              </div>
              {s?.lastUpdate && (
                <p className="text-xs font-mono" style={{ color:"#444466" }}>
                  Date actualizate: {timeAgo(s.lastUpdate)} ago
                </p>
              )}
            </div>
          )}

          {/* ── LOGS VIEW ──────────────────────────────── */}
          {nav==="logs" && (
            <div>
              <h2 className="font-black tracking-wider mb-4" style={{ color:"#ff3cac" }}>📋 OUTPUT AGENTI</h2>
              <div className="rounded-2xl p-5 border" style={{ background:"#0a0a1e", borderColor:"#1a1a40" }}>
                <p className="text-xs font-mono mb-3" style={{ color:"#444466" }}>// Ultimul output generat de agenti</p>
                <a href="/agent-content-latest.json" target="_blank" rel="noopener noreferrer"
                  className="text-sm font-mono transition-colors hover:underline" style={{ color:"#00f5d4" }}>
                  → /agent-content-latest.json
                </a>
                <p className="text-xs font-mono mt-4" style={{ color:"#333355" }}>
                  Ruleaza un agent din tab-ul AGENT ROSTER pentru a genera continut nou.
                </p>
              </div>
            </div>
          )}

          {/* ── LINKS VIEW ──────────────────────────────── */}
          {nav==="links" && (
            <div>
              <h2 className="font-black tracking-wider mb-4" style={{ color:"#784ba0" }}>🔗 QUICK LINKS</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { l:"Vercel Dashboard",  h:"https://vercel.com/dashboard",               c:"#00f5d4", e:"▲" },
                  { l:"GitHub Actions",    h:"https://github.com/alexmarius855/afiliere-site/actions", c:"#ff3cac", e:"⚙" },
                  { l:"Brevo Contacts",    h:"https://app.brevo.com/contact/list",           c:"#f7971e", e:"📧" },
                  { l:"Google Analytics",  h:"https://analytics.google.com",                 c:"#784ba0", e:"📈" },
                  { l:"Search Console",    h:"https://search.google.com/search-console",     c:"#00f5d4", e:"🔍" },
                  { l:"2Performant",       h:"https://app.2performant.com",                  c:"#ff3cac", e:"💰" },
                  { l:"Profitshare",       h:"https://www.profitshare.ro",                   c:"#f7971e", e:"💰" },
                  { l:"Site Live →",       h:"https://amcupon.ro",                           c:"#784ba0", e:"🌐" },
                ].map(l => (
                  <a key={l.l} href={l.h} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-2xl border transition-all hover:scale-[1.02]"
                    style={{ background:"rgba(13,13,38,0.8)", borderColor:l.c+"33" }}>
                    <span className="text-xl">{l.e}</span>
                    <span className="font-semibold text-sm" style={{ color:l.c }}>{l.l}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Terminal bar */}
        <div className="px-5 py-2.5 border-t shrink-0 flex items-center gap-3"
          style={{ background:"#0a0a1e", borderColor:"#1a1a40" }}>
          <span className="font-mono text-xs" style={{ color:"#00f5d4" }}>root@amcupon-mc:~$</span>
          <span className="font-mono text-xs animate-pulse" style={{ color:"#666688" }}>_</span>
          <div className="ml-auto flex items-center gap-4 text-xs font-mono" style={{ color:"#333355" }}>
            <span>amcupon.ro v2.0</span>
            <span>|</span>
            <span>{now.toLocaleTimeString("ro-RO")}</span>
            <span>|</span>
            <span style={{ color: data?.env.hasGithubToken ? "#00f5d4" : "#ff3cac" }}>
              {data?.env.hasGithubToken ? "● GITHUB CONNECTED" : "○ GITHUB OFFLINE"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
