import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cele mai bune programe afiliere AI 2026 — Comisioane 20-50% Recurente | AmCupon.ro",
  description: "Top 15 programe afiliere AI cu comisioane recurente. HubSpot, Jasper, Synthesia, ElevenLabs, Semrush — pana la 50% lunar, cookie 180 zile. Ghid complet pentru afiliati romani.",
  keywords: [
    "program afiliere ai romania",
    "afiliere saas comision recurent",
    "jasper afiliere",
    "hubspot afiliere",
    "semrush afiliere",
    "elevenlabs afiliere",
    "ai tools afiliere 2026",
    "comision recurent saas",
  ],
  alternates: { canonical: "https://amcupon.ro/ai-tools" },
  openGraph: {
    title: "Top 15 Programe Afiliere AI — Comisioane Recurente 2026 | AmCupon.ro",
    description: "Cele mai profitabile programe afiliere din nisa AI: HubSpot 30%, Copy.ai 45%, InVideo 50%, cookie 30-180 zile. Ghid complet cu linkuri de aplicatie.",
    url: "https://amcupon.ro/ai-tools",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const AI_TOOLS = [
  {
    rank: 1,
    name: "Copy.ai",
    tagline: "Copywriting AI — cel mai mare comision din nisa",
    badge: "Comision #1",
    badgeColor: "bg-violet-600",
    emoji: "✍️",
    comision: "45%",
    comision_tip: "recurent lunar",
    cookie: "60 zile",
    pret_min: "$36/luna",
    rating: "9.6",
    url: "https://www.copy.ai",
    program_url: "https://www.copy.ai/affiliate",
    pros: [
      "45% comision recurent pe toata durata abonamentului",
      "Cookie 60 zile — conversii intarziate platite",
      "Instrumente copywriting pentru orice nisa",
      "Plan gratuit generos — conversie usoara",
      "Dashboard afiliat in timp real",
    ],
    cons: ["Piata mai mica ca Jasper", "Concurenta cu ChatGPT"],
    ideal: "Bloguri de marketing, copywriteri, agentii",
    cat: "Copywriting AI",
    catColor: "#8b5cf6",
  },
  {
    rank: 2,
    name: "InVideo AI",
    tagline: "Video AI din text — cel mai usor de promovat in Romania",
    badge: "ROI maxim",
    badgeColor: "bg-indigo-500",
    emoji: "🎬",
    comision: "50%",
    comision_tip: "prima luna / 25% recurent",
    cookie: "60 zile",
    pret_min: "$20/luna",
    rating: "9.5",
    url: "https://invideo.io",
    program_url: "https://invideo.io/affiliate",
    pros: [
      "50% comision pe prima luna (cea mai mare plata initiala)",
      "25% comision recurent ulterior",
      "Cerere uriasa — video AI e in trend exploziv",
      "Produs simplu de explicat — genereaza video din text",
      "Materiale marketing incluse: bannere, copie, tracking",
    ],
    cons: ["Structura comision dual (50% + 25%)", "Necesita cont PayPal pentru plati"],
    ideal: "Creatori de continut, YouTube, social media",
    cat: "Video AI",
    catColor: "#6366f1",
  },
  {
    rank: 3,
    name: "HubSpot",
    tagline: "CRM + Marketing AI — comision mare pe produse premium",
    badge: "Valoare mare per vanzare",
    badgeColor: "bg-indigo-600",
    emoji: "🏆",
    comision: "30%",
    comision_tip: "recurent 12 luni",
    cookie: "180 zile",
    pret_min: "$20/luna → $3200+/luna",
    rating: "9.4",
    url: "https://www.hubspot.com",
    program_url: "https://www.hubspot.com/partners/affiliates",
    pros: [
      "Cookie 180 zile — cel mai lung din lista",
      "30% recurent timp de 12 luni (rennewals incluse)",
      "Clientii platesc $800-3200/luna → comisioane de $240-960/luna",
      "Brand mondial cu conversie ridicata",
      "Materiale marketing profesionale incluse",
    ],
    cons: [
      "Public tinta: manageri + antreprenori (trafic calificat necesar)",
      "Ciclul de vanzare mai lung",
    ],
    ideal: "Bloguri B2B, consultanti, agentii marketing",
    cat: "CRM & Marketing",
    catColor: "#f59e0b",
  },
  {
    rank: 4,
    name: "Jasper AI",
    tagline: "Scriitor AI enterprise — lider de piata cu brand puternic",
    badge: "Brand cunoscut",
    badgeColor: "bg-blue-600",
    emoji: "🤖",
    comision: "30%",
    comision_tip: "recurent lunar",
    cookie: "30 zile",
    pret_min: "$39/luna",
    rating: "9.2",
    url: "https://www.jasper.ai",
    program_url: "https://www.jasper.ai/partner",
    pros: [
      "30% comision recurent lunar pe toata durata",
      "Brand recunoscut mondial — conversie usoara",
      "60+ template-uri AI pentru orice tip de continut",
      "Plan Creator $39/luna pana la Business $125/luna",
      "Plata via PayPal sau transfer bancar",
    ],
    cons: ["Cookie 30 zile (scurt)", "Concurenta intensa cu ChatGPT Plus"],
    ideal: "Copywriteri, bloggeri, agentii de continut",
    cat: "Copywriting AI",
    catColor: "#8b5cf6",
  },
  {
    rank: 5,
    name: "Semrush",
    tagline: "SEO & Marketing Suite — $200 fix per vanzare",
    badge: "$200/vanzare",
    badgeColor: "bg-emerald-600",
    emoji: "📈",
    comision: "$200",
    comision_tip: "fix per vanzare + $10 per trial",
    cookie: "120 zile",
    pret_min: "$117/luna",
    rating: "9.2",
    url: "https://www.semrush.com",
    program_url: "https://www.semrush.com/partner/affiliate",
    pros: [
      "$200 fix per vanzare (nu procent — predictibil)",
      "$10 per trial activat (trafic care nu cumpara e platit!)",
      "Cookie 120 zile — conversii intarziate acoperite",
      "Brand SEO numarul 1 mondial",
      "Impact.com dashboard cu tracking complet",
    ],
    cons: ["Pret mare $117/luna → public mai restrictiv", "Comision fix nu creste cu planul"],
    ideal: "Bloguri SEO, consultanti, webmasteri",
    cat: "SEO Tools",
    catColor: "#10b981",
  },
  {
    rank: 6,
    name: "Synthesia",
    tagline: "Video cu avatare AI — cel mai solicitat in B2B",
    badge: "Nisa B2B premium",
    badgeColor: "bg-indigo-600",
    emoji: "🎭",
    comision: "25%",
    comision_tip: "recurent lunar",
    cookie: "60 zile",
    pret_min: "$29/luna",
    rating: "9.0",
    url: "https://www.synthesia.io",
    program_url: "https://www.synthesia.io/affiliates",
    pros: [
      "25% recurent — video training corporate in boom",
      "Avatare AI realiste — produs unic de demonstrat",
      "Clienti corporativi platesc planuri anuale ($10k+)",
      "Cookie 60 zile",
      "Nisa: HR, training, eLearning — bugete mari",
    ],
    cons: ["Piata mai specializata (B2B)", "Necesita content demonstrativ pentru conversie"],
    ideal: "Bloguri eLearning, HR tech, corporate training",
    cat: "Video AI",
    catColor: "#6366f1",
  },
  {
    rank: 7,
    name: "Writesonic",
    tagline: "AI pentru articole SEO + ChatSonic inclus",
    badge: "30% recurent",
    badgeColor: "bg-cyan-600",
    emoji: "📝",
    comision: "30%",
    comision_tip: "recurent lunar",
    cookie: "30 zile",
    pret_min: "$13/luna",
    rating: "8.8",
    url: "https://writesonic.com",
    program_url: "https://writesonic.com/affiliate",
    pros: [
      "30% comision recurent lunar",
      "Pret mic $13/luna → conversie mare",
      "ChatSonic (similar ChatGPT) inclus — produs usor de promovat",
      "Plati rapide via PayPal",
      "Materiale promo gata facute",
    ],
    cons: ["Cookie 30 zile", "Branding mai putin cunoscut ca Jasper"],
    ideal: "Bloggeri, SEO freelanceri, creatori de continut",
    cat: "Copywriting AI",
    catColor: "#8b5cf6",
  },
  {
    rank: 8,
    name: "ElevenLabs",
    tagline: "Voice AI realist — in explozie dupa lansarea V3",
    badge: "Trend exploziv",
    badgeColor: "bg-yellow-600",
    emoji: "🎙️",
    comision: "22%",
    comision_tip: "recurent lunar",
    cookie: "30 zile",
    pret_min: "$5/luna",
    rating: "8.8",
    url: "https://elevenlabs.io",
    program_url: "https://elevenlabs.io/affiliates",
    pros: [
      "22% recurent — cea mai tare voce AI disponibila",
      "Trend exploziv: podcasturi, audiobooks, YouTube faceless",
      "Pret $5-22/luna — volum mare de conversii",
      "API masiv — atragi si developeri",
      "Produs spectaculos de demonstrat in continut",
    ],
    cons: ["Cookie doar 30 zile", "Comision 22% — mai mic ca Copy.ai"],
    ideal: "Podcasteri, YouTuberi, creatori audio, developeri",
    cat: "Voice AI",
    catColor: "#eab308",
  },
  {
    rank: 9,
    name: "Murf AI",
    tagline: "Voce AI studio pentru prezentari si eLearning",
    badge: "eLearning nisa",
    badgeColor: "bg-pink-600",
    emoji: "🔊",
    comision: "30%",
    comision_tip: "recurent lunar",
    cookie: "90 zile",
    pret_min: "$19/luna",
    rating: "8.7",
    url: "https://murf.ai",
    program_url: "https://murf.ai/affiliate",
    pros: [
      "30% recurent cu cookie 90 zile",
      "Nisa clara: prezentari, eLearning, explainer videos",
      "120+ voci in 20 limbi inclusiv romana",
      "Trial gratuit generos — conversie usoara",
    ],
    cons: ["Brand mai putin cunoscut", "Piata mai mica ca ElevenLabs"],
    ideal: "Instructori online, prezentatori, agentii eLearning",
    cat: "Voice AI",
    catColor: "#eab308",
  },
  {
    rank: 10,
    name: "Surfer SEO",
    tagline: "Optimizare on-page AI — nelipsit din toolbelt SEO",
    badge: "SEO must-have",
    badgeColor: "bg-teal-600",
    emoji: "🏄",
    comision: "25%",
    comision_tip: "recurent lunar",
    cookie: "60 zile",
    pret_min: "$89/luna",
    rating: "8.7",
    url: "https://surferseo.com",
    program_url: "https://surferseo.com/affiliate",
    pros: [
      "25% recurent — produs 'sticky', clientii nu renunta",
      "Pret $89-219/luna → comisioane $22-54/luna per client",
      "Cookie 60 zile",
      "Integrat cu Jasper — cross-sell natural",
      "Panel afiliat cu materiale complete",
    ],
    cons: ["Pret mare — public mai restrictiv", "Concurenta cu Semrush Content"],
    ideal: "Bloggeri SEO, agentii, freelanceri SEO",
    cat: "SEO Tools",
    catColor: "#10b981",
  },
  {
    rank: 11,
    name: "Frase.io",
    tagline: "Content brief AI + SEO research automat",
    badge: "30% recurent",
    badgeColor: "bg-lime-600",
    emoji: "🔍",
    comision: "30%",
    comision_tip: "recurent lunar",
    cookie: "60 zile",
    pret_min: "$45/luna",
    rating: "8.6",
    url: "https://www.frase.io",
    program_url: "https://www.frase.io/affiliates",
    pros: [
      "30% comision recurent",
      "Produs unic: genereaza brief-uri SEO automat",
      "Cookie 60 zile",
      "Clienti fideli — odata adoptat nu mai renunta",
    ],
    cons: ["Brand mai putin cunoscut in afara SUA", "Cookie 60 zile — mediu"],
    ideal: "Agentii SEO, editori de continut, freelanceri",
    cat: "SEO Tools",
    catColor: "#10b981",
  },
  {
    rank: 12,
    name: "Pictory AI",
    tagline: "Video scurt din articole lungi — repurposing automat",
    badge: "Repurposing AI",
    badgeColor: "bg-rose-600",
    emoji: "✂️",
    comision: "25%",
    comision_tip: "recurent lunar",
    cookie: "30 zile",
    pret_min: "$19/luna",
    rating: "8.5",
    url: "https://pictory.ai",
    program_url: "https://pictory.ai/affiliate",
    pros: [
      "25% recurent — transforma articole in clipuri scurte",
      "Cerere uriasa din cauza short-form content boom",
      "Pret $19/luna — volum bun de conversii",
      "Produs usor de demonstrat in continut video",
    ],
    cons: ["Cookie 30 zile", "Concurenta cu InVideo si Canva"],
    ideal: "YouTuberi, TikTok creators, bloggeri cu podcast",
    cat: "Video AI",
    catColor: "#6366f1",
  },
  {
    rank: 13,
    name: "Descript",
    tagline: "Editare video/audio ca un document Word",
    badge: "Editare AI",
    badgeColor: "bg-slate-600",
    emoji: "🎞️",
    comision: "15%",
    comision_tip: "recurent lunar",
    cookie: "30 zile",
    pret_min: "$12/luna",
    rating: "8.4",
    url: "https://www.descript.com",
    program_url: "https://www.descript.com/affiliate",
    pros: [
      "Produs revolutionar — editezi video stergand text",
      "15% recurent la plan $24+/luna",
      "Conversie mare — oricine vede demo vrea sa cumpere",
      "Cult following in podcasting si YouTube",
    ],
    cons: ["Comision 15% — mai mic", "Cookie 30 zile"],
    ideal: "Podcasteri, YouTuberi, video editors",
    cat: "Video AI",
    catColor: "#6366f1",
  },
  {
    rank: 14,
    name: "Canva Pro",
    tagline: "Design AI — cel mai mare volum de conversii posibile",
    badge: "Volum maxim",
    badgeColor: "bg-purple-600",
    emoji: "🎨",
    comision: "$36",
    comision_tip: "fix per vanzare Pro",
    cookie: "30 zile",
    pret_min: "$12.99/luna",
    rating: "8.3",
    url: "https://www.canva.com",
    program_url: "https://www.canva.com/affiliates",
    pros: [
      "$36 fix per abonament Pro vandut",
      "Cel mai cunoscut tool de design — 170 milioane useri",
      "Conversie enorma din gratuit la Pro",
      "Promovabil in orice nisa",
    ],
    cons: ["Comision fix $36 — nu creste", "Cookie 30 zile", "Concurenta mare de afiliati"],
    ideal: "Orice blog, social media, continut vizual",
    cat: "Design AI",
    catColor: "#a855f7",
  },
  {
    rank: 15,
    name: "LiveChat",
    tagline: "Customer support AI — comision lifetime recurent",
    badge: "Lifetime comision",
    badgeColor: "bg-green-600",
    emoji: "💬",
    comision: "20%",
    comision_tip: "lifetime recurent (cat timp clientul plateste)",
    cookie: "120 zile",
    pret_min: "$20/luna",
    rating: "8.2",
    url: "https://www.livechat.com",
    program_url: "https://partners.livechat.com",
    pros: [
      "20% LIFETIME — platit luna de luna cat timp clientul e activ",
      "Cookie 120 zile",
      "Produs SaaS cu retentie mare (clientii nu pleaca)",
      "Integreaza AI chatbot — relevant pentru nisa tech",
    ],
    cons: ["Nisa mai specifica (eCommerce, support)", "Comision 20% — nu cel mai mare"],
    ideal: "Bloguri eCommerce, agentii customer support",
    cat: "Customer Support AI",
    catColor: "#22c55e",
  },
];

const CAT_COLORS: Record<string, string> = {
  "Copywriting AI": "#8b5cf6",
  "Video AI": "#6366f1",
  "CRM & Marketing": "#f59e0b",
  "SEO Tools": "#10b981",
  "Voice AI": "#eab308",
  "Design AI": "#a855f7",
  "Customer Support AI": "#22c55e",
};

const CATEGORII = [
  { slug: "copywriting", label: "Copywriting AI", emoji: "✍️", desc: "Jasper, Copy.ai, Writesonic — scriere continut automat" },
  { slug: "video", label: "Video AI", emoji: "🎬", desc: "InVideo, Synthesia, Pictory — video din text" },
  { slug: "seo", label: "SEO Tools", emoji: "📈", desc: "Semrush, Surfer, Frase — pozitii Google" },
  { slug: "voice", label: "Voice AI", emoji: "🎙️", desc: "ElevenLabs, Murf — voci realiste AI" },
  { slug: "design", label: "Design AI", emoji: "🎨", desc: "Canva Pro — grafice si prezentari" },
  { slug: "crm", label: "CRM & Marketing", emoji: "🏆", desc: "HubSpot — automatizare marketing" },
];

const FAQ = [
  {
    q: "Cat se castiga din programe afiliere AI?",
    a: "Depinde de trafic si nisa. Un afiliat cu 5000 vizitatori/luna pe o nisa targetata poate genera 10-30 vanzari/luna. La Jasper $39/luna x 30% = $11.7/vanzare. 20 vanzari = $234/luna RECURENT. Cu mai multe programe simultan, afiliati seriosi fac $2000-10000+/luna.",
  },
  {
    q: "Ce inseamna comision recurent?",
    a: "Comisionul recurent inseamna ca primesti bani LUNAR cat timp clientul referit de tine continua sa plateasca abonamentul. Nu e o singura plata — e venit pasiv real. Copy.ai 45% recurent inseamna: client plateste $36/luna → tu primesti $16.20 in fiecare luna.",
  },
  {
    q: "Cat dureaza pana la prima plata?",
    a: "Depinde de programul ales. Cele mai multe platesc la 30-60 zile dupa prima conversie (period de garantie retururi). HubSpot si Semrush platesc la 90 zile. Poti gana primii bani in prima luna daca ai trafic calificat deja.",
  },
  {
    q: "Ce cookie duration inseamna?",
    a: "Cookie duration = cat timp dupa click-ul initial vei fi creditat cu vanzarea. Cookie 180 zile (HubSpot) inseamna ca daca cineva da click pe linkul tau azi si cumpara oricand in urmatoarele 6 luni, TU primesti comisionul. Cookie 30 zile e minim.",
  },
  {
    q: "Pot promova mai multe programe simultan?",
    a: "Da, si asta e strategia optima. Construiesti un articol comparativ ('Cele mai bune AI tools pentru copywriting'), linkezi 3-4 programe, si castigi comision din oricare il alege cititorul. Diversificarea reduce riscul — daca un program inchide, ai backup.",
  },
  {
    q: "Trebuie sa declar venitul din afiliere?",
    a: "In Romania, venitul din afiliere e venit din activitate independenta. Sub 500 EUR/luna nu ai nevoie de firma. Peste, e recomandat un SRL micro (impozit 1%). Consulta un contabil pentru situatia ta specifica.",
  },
];

export default function AiToolsPage() {
  return (
    <div className="min-h-screen bg-slate-950">

      {/* Hero */}
      <section className="relative bg-slate-950 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.10) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-300">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-slate-300">Programe Afiliere AI</span>
          </nav>
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Top 15 Programe <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #a855f7)" }}>Afiliere AI</span> 2026
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-6">
            Comisioane recurente 20-50%, cookie pana la 180 zile. Cele mai profitabile programe afiliere din nisa AI — ghid complet cu linkuri de aplicare directa.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400 mb-6">
            <span className="flex items-center gap-1.5"><span className="text-violet-400">✓</span> 15 programe verificate</span>
            <span className="flex items-center gap-1.5"><span className="text-violet-400">✓</span> Comisioane recurente reale</span>
            <span className="flex items-center gap-1.5"><span className="text-violet-400">✓</span> Actualizat iunie 2026</span>
          </div>

          {/* Quick stats */}
          <div className="inline-flex flex-wrap justify-center gap-6 bg-slate-900/60 border border-slate-800 rounded-2xl px-6 py-4">
            {[
              { v: "45%", l: "Comision max" },
              { v: "180 zile", l: "Cookie max" },
              { v: "$200", l: "Fix per vanzare" },
              { v: "Lifetime", l: "Recurent disponibil" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-black text-violet-400">{s.v}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorii */}
      <section className="max-w-5xl mx-auto px-4 py-8 border-b border-slate-800">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Browse pe categorie</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORII.map((cat) => (
            <div key={cat.slug} className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-3 text-center cursor-pointer transition-all group">
              <div className="text-2xl mb-1">{cat.emoji}</div>
              <div className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors">{cat.label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">{cat.desc.split("—")[0]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Lista programe */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-black text-white mb-2">Toate programele — clasate dupa profitabilitate</h2>
        <p className="text-slate-500 text-sm mb-8">Clasament bazat pe: comision% × retentie medie clienti × usurinta conversie</p>

        <div className="space-y-5">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className={`bg-slate-900 border rounded-2xl p-6 transition-all ${tool.rank <= 3 ? "border-violet-500/30 shadow-lg shadow-violet-500/5" : "border-slate-800 hover:border-slate-700"}`}
            >
              {tool.rank <= 3 && (
                <div className="text-xs text-violet-400 font-bold mb-3 flex items-center gap-2">
                  <span>⭐ TOP {tool.rank} — RECOMANDAT</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-start gap-5">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-2xl">{tool.emoji}</span>
                    <h2 className="text-xl font-black text-white">#{tool.rank} {tool.name}</h2>
                    <span
                      className="text-[10px] font-black text-white px-2 py-0.5 rounded-full"
                      style={{ background: tool.badgeColor }}
                    >{tool.badge}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: CAT_COLORS[tool.cat] || "#94a3b8", background: `${CAT_COLORS[tool.cat]}18` }}
                    >{tool.cat}</span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{tool.tagline}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-emerald-400 font-bold mb-2">AVANTAJE</p>
                      <ul className="space-y-1">
                        {tool.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 shrink-0 mt-0.5">+</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs text-red-400 font-bold mb-2">DEZAVANTAJE</p>
                      <ul className="space-y-1 mb-3">
                        {tool.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                            <span className="text-red-400 shrink-0 mt-0.5">-</span>{c}
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-slate-500">Ideal pentru: <span className="text-slate-400">{tool.ideal}</span></p>
                    </div>
                  </div>
                </div>

                {/* Sidebar stats */}
                <div className="md:w-48 flex flex-col items-center gap-3 shrink-0">
                  <div className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-white">{tool.comision}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{tool.comision_tip}</div>
                    <div className="mt-2 pt-2 border-t border-slate-700 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-slate-500">Cookie</div>
                        <div className="text-slate-300 font-bold">{tool.cookie}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">Plan min</div>
                        <div className="text-slate-300 font-bold text-[11px]">{tool.pret_min}</div>
                      </div>
                    </div>
                  </div>
                  <a
                    href={tool.program_url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className={`w-full text-center py-3 px-4 rounded-xl font-black text-sm text-white transition-all hover:-translate-y-0.5 shadow-lg ${tool.rank <= 3 ? "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20" : "bg-slate-700 hover:bg-slate-600"}`}
                  >
                    Aplica la {tool.name} →
                  </a>
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Vezi produsul
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategie */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-slate-800">
        <h2 className="text-2xl font-black text-white mb-6">Cum sa castigi bani din afiliere AI — strategie practica</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            {
              step: "01",
              titlu: "Alege 2-3 programe complementare",
              desc: "Combina un tool de scriere (Jasper/Copy.ai) cu un SEO tool (Semrush/Surfer) si un video tool (InVideo/Synthesia). Acelasi public, nevoi diferite.",
              color: "#8b5cf6",
            },
            {
              step: "02",
              titlu: "Creeaza continut comparativ",
              desc: "Articolele 'X vs Y' si 'Cel mai bun tool pentru Z' au intentia de cumparare cea mai mare. Un singur articol bun = sute de conversii pe an.",
              color: "#6366f1",
            },
            {
              step: "03",
              titlu: "Prioritizeaza cookie-uri lungi",
              desc: "HubSpot 180 zile si LiveChat 120 zile inseamna ca link-urile tale lucreaza luni intregi. Un click azi poate fi platit in 6 luni.",
              color: "#10b981",
            },
            {
              step: "04",
              titlu: "Demonstreaza produsul in continut",
              desc: "Arata rezultate reale: screenshot cu articol scris de Jasper, video creat cu InVideo, raport SEO din Semrush. Dovada > orice copie.",
              color: "#eab308",
            },
            {
              step: "05",
              titlu: "Construieste email list de la inceput",
              desc: "50% din conversii vin din email follow-up. Un abonat de newsletter valorizes 10x mai mult decat un vizitator random pentru produse SaaS.",
              color: "#ef4444",
            },
            {
              step: "06",
              titlu: "Optimizeaza pentru cuvinte cu intentie",
              desc: "'Jasper AI parere', 'Semrush alternativa gratuita', 'InVideo vs Pictory' — aceste cautari au conversia de 10x mai mare decat 'AI writing tool'.",
              color: "#06b6d4",
            },
          ].map((s) => (
            <div key={s.step} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="text-3xl font-black mb-2" style={{ color: s.color }}>{s.step}</div>
              <h3 className="text-sm font-bold text-white mb-2">{s.titlu}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Calculator venit estimat */}
        <div
          className="rounded-2xl p-6 border"
          style={{ background: "rgba(139,92,246,0.05)", borderColor: "rgba(139,92,246,0.2)" }}
        >
          <h3 className="text-lg font-black text-white mb-4">Estimare venit pasiv lunar din afiliere AI</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-800">
                  <th className="text-left pb-2">Scenariu</th>
                  <th className="text-right pb-2">Vizitatori/luna</th>
                  <th className="text-right pb-2">Conversii (1.5%)</th>
                  <th className="text-right pb-2">Comision mediu</th>
                  <th className="text-right pb-2">Venit lunar</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { scenariu: "Inceput (blog nou)", viz: "500", conv: "7", com: "$12", venit: "~$84" },
                  { scenariu: "Crestere (6 luni)", viz: "2.000", conv: "30", com: "$15", venit: "~$450" },
                  { scenariu: "Mediu (1 an)", viz: "8.000", conv: "120", com: "$18", venit: "~$2.160" },
                  { scenariu: "Avansat (2 ani)", viz: "25.000", conv: "375", com: "$20", venit: "~$7.500" },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-slate-800/50 ${i === 3 ? "text-violet-300 font-bold" : "text-slate-300"}`}>
                    <td className="py-2">{row.scenariu}</td>
                    <td className="py-2 text-right">{row.viz}</td>
                    <td className="py-2 text-right">{row.conv}</td>
                    <td className="py-2 text-right">{row.com}</td>
                    <td className="py-2 text-right" style={{ color: "#a78bfa" }}>{row.venit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">*Estimare bazata pe programe cu comision recurent mediu 25-30%. Venitul se acumuleaza — un client vandut luna 1 plateste recurent si in luna 24.</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-slate-800">
        <h2 className="text-2xl font-black text-white mb-6">Intrebari frecvente</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="font-bold text-white mb-2">{item.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div
          className="rounded-2xl p-8 text-center border"
          style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(168,85,247,0.04))", borderColor: "rgba(139,92,246,0.2)" }}
        >
          <div className="text-4xl mb-3">🚀</div>
          <h2 className="text-2xl font-black text-white mb-3">Incepe azi cu top 3</h2>
          <p className="text-slate-400 mb-6 text-sm max-w-xl mx-auto">
            Aplica la Copy.ai (45%), InVideo (50%) si HubSpot (30% / 180 zile) — cele mai profitabile 3 programe. Le poti promova simultan pe acelasi blog.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="https://www.copy.ai/affiliate" target="_blank" rel="sponsored noopener noreferrer"
              className="font-black px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg text-sm text-white"
              style={{ background: "#8b5cf6", boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
              Copy.ai — 45% comision →
            </a>
            <a href="https://invideo.io/affiliate" target="_blank" rel="sponsored noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 text-sm">
              InVideo — 50% prima luna →
            </a>
            <a href="https://www.hubspot.com/partners/affiliates" target="_blank" rel="sponsored noopener noreferrer"
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-all hover:-translate-y-0.5 text-sm">
              HubSpot — 30% / 180 zile →
            </a>
          </div>
        </div>
      </section>

      {/* Alte resurse */}
      <section className="max-w-5xl mx-auto px-4 pb-10 border-t border-slate-800 pt-8">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Resurse conexe</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/vpn" className="text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg transition-all">
            🔒 Cele mai bune VPN-uri →
          </Link>
          <Link href="/hosting" className="text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg transition-all">
            🌐 Hosting Romania →
          </Link>
          <Link href="/software-business" className="text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg transition-all">
            💼 Software Business →
          </Link>
          <Link href="/" className="text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-lg transition-all">
            🏷️ Toate magazinele →
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-slate-600 text-xs text-center">
          Unele linkuri de pe aceasta pagina sunt linkuri de afiliat. Daca aplici si obtii un cont, AmCupon.ro poate primi un comision. Recomandam doar programe pe care le-am evaluat independent dupa comision real, retentie si usurinta de promovat.
        </p>
      </div>
    </div>
  );
}
