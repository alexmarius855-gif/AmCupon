import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; scor_final: number; are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[];
}

export const metadata: Metadata = {
  title: "Instrumente SEO cu Reducere 2026 — Cod Semrush, Ahrefs, SE Ranking | AmCupon.ro",
  description: "Coduri reducere instrumente SEO 2026: Semrush, Ahrefs, SE Ranking, Moz, Screaming Frog. Trial gratuit si reduceri pana la 40% la cele mai bune tool-uri SEO profesionale.",
  keywords: ["instrumente seo gratuite", "semrush reducere", "ahrefs cod reducere", "se ranking discount", "tool seo romania", "semrush trial gratuit", "software seo ieftin"],
  alternates: { canonical: "https://amcupon.ro/instrumente-seo" },
  openGraph: { title: "Instrumente SEO cu Reducere 2026 | AmCupon.ro", url: "https://amcupon.ro/instrumente-seo", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SEO_TOOLS = ["semrush.com","ahrefs.com","moz.com"];

const TOOLS_SEO = [
  {
    slug: "semrush.com",
    name: "Semrush",
    emoji: "📊",
    nota: "9.8/10",
    pret: "de la 99$/luna",
    highlight: "All-in-one SEO suite",
    culoare: "bg-indigo-600",
    desc: "Cea mai completa platforma SEO: research cuvinte cheie, audit site, analiza backlink-uri, monitorizare pozitii, analiza concurenta. Over 55+ instrumente intr-un singur abonament.",
    features: ["Keyword Research", "Site Audit", "Backlink Analysis", "Rank Tracking", "Competitor Analysis", "Content Marketing"],
  },
  {
    slug: "ahrefs.com",
    name: "Ahrefs",
    emoji: "🔗",
    nota: "9.6/10",
    pret: "de la 99$/luna",
    highlight: "Best backlink database",
    culoare: "bg-blue-600",
    desc: "Cea mai mare baza de date de backlink-uri din lume. Perfect pentru link building, analiza site-urilor concurentilor si research de continut. Site Explorer, Keywords Explorer, Site Audit.",
    features: ["Site Explorer", "Keywords Explorer", "Content Explorer", "Site Audit", "Rank Tracker", "Web Explorer"],
  },
  {
    slug: "moz.com",
    name: "Moz Pro",
    emoji: "🎯",
    nota: "9.2/10",
    pret: "de la 99$/luna",
    highlight: "Domain Authority inventor",
    culoare: "bg-blue-500",
    desc: "Inventatorul metricii Domain Authority. Moz Pro ofera keyword research, site crawl, rank tracking si link research. Ideal pentru agentii SEO si freelanceri.",
    features: ["Keyword Research", "Link Explorer", "Site Crawl", "Rank Tracking", "On-Page Grader", "MozBar Extension"],
  },
];

const TOOLS_GRATUITE = [
  { emoji: "🔍", nume: "Google Search Console", desc: "Gratuit de la Google — indexare, erori, click-uri, pozitii reale in search" },
  { emoji: "📈", nume: "Google Analytics 4", desc: "Analiza trafic, conversii, comportament vizitatori — 100% gratuit" },
  { emoji: "🕷️", nume: "Screaming Frog (free)", desc: "Crawl pana la 500 pagini gratuit — identifica erori 404, duplicate content, redirecturi" },
  { emoji: "💡", nume: "Ubersuggest (free)", desc: "Research cuvinte cheie si analiza de baza a domeniului — 3 cautari/zi gratuit" },
  { emoji: "📝", nume: "Google PageSpeed Insights", desc: "Viteza de incarcare si Core Web Vitals — esential pentru SEO tehnic" },
  { emoji: "🗺️", nume: "XML Sitemap Generator", desc: "Genereaza automat sitemap.xml pentru site-ul tau — gratuit online" },
];

const GHID_SEO = [
  {
    titlu: "Semrush sau Ahrefs — care e mai bun?",
    continut: "Semrush este mai complet pentru marketing digital general (PPC, social, content) si are un keyword database mai mare pentru Romania si Europa de Est. Ahrefs exceleaza la analiza backlink-urilor si link building. Daca bugetul permite un singur tool, Semrush este alegerea mai versatila pentru piata romaneasca.",
  },
  {
    titlu: "Poti face SEO bun cu instrumente gratuite?",
    continut: "Da, la inceput. Google Search Console + Google Analytics + Screaming Frog free + Ubersuggest free acopera 60-70% din nevoile unui site mic. Treci la tool premium cand ai nevoie de date competitionale, tracking avansat de pozitii sau audit la scara.",
  },
  {
    titlu: "Cand merita un abonament Semrush?",
    continut: "Merita abonamentul Semrush cand: ai un site cu mai mult de 5.000 vizitatori/luna, lucrezi cu mai multi clienti SEO, vrei sa monitorizezi pozitii pentru sute de cuvinte cheie sau ai nevoie de date despre concurenti. La 99$/luna, ROI-ul se obtine rapid daca esti serios in SEO.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Instrumente SEO cu Reducere 2026",
  "url": "https://amcupon.ro/instrumente-seo",
  "description": "Coduri reducere si trial gratuit la cele mai bune instrumente SEO: Semrush, Ahrefs, Moz, SE Ranking",
};

export default function InstrumenteSeoPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topTools = TOP_SEO_TOOLS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-slate-950">

        {/* Breadcrumb */}
        <nav className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Acasa</Link>
            <span>/</span>
            <Link href="/servicii" className="hover:text-indigo-400 transition-colors">Servicii</Link>
            <span>/</span>
            <span className="text-slate-300 font-medium">Instrumente SEO</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-teal-600/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              Trial gratuit disponibil
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">📊</div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Instrumente SEO cu Reducere <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #34d399, #22d3ee)"}}>{an}</span>
            </h1>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Semrush, Ahrefs, Moz — tool-uri SEO profesionale cu trial gratuit si reduceri pana la 40%
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Semrush","Ahrefs","Moz Pro","SE Ranking","Trial Gratuit","Keyword Research","Audit Site","Backlink Analysis"].map(c => (
                <span key={c} className="bg-white/8 border border-white/15 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Tool cards principale */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">TOP INSTRUMENTE</p>
            <h2 className="text-2xl font-black text-white">Cele mai bune tool-uri SEO in {an}</h2>
          </div>
          <div className="space-y-4">
            {TOOLS_SEO.map(t => {
              const mag = topTools.find(m => m.magazin === t.slug);
              const promo = mag?.promotii[0];
              return (
                <div key={t.slug} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-6 transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    <div className={`w-14 h-14 ${t.culoare} rounded-2xl flex items-center justify-center text-3xl shrink-0`}>{t.emoji}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-white">{t.name}</h3>
                        <span className="bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full">{t.nota}</span>
                        <span className="text-slate-400 text-xs">{t.highlight}</span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">{t.desc}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {t.features.map(f => (
                          <span key={f} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-indigo-400 font-black text-base">{t.pret}</span>
                        {mag ? (
                          <a href={`/cod-reducere/${t.slug}`}
                            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-cyan-500/20">
                            {mag.are_promotie ? (mag.cod_cupon ? "Cod reducere activ" : "Oferta activa") : "Vezi oferta"}
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                          </a>
                        ) : (
                          <a href={`https://www.${t.slug}`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
                            Site oficial
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          </a>
                        )}
                        {promo?.cod_cupon && (
                          <div className="border border-dashed border-cyan-400/50 rounded-xl px-3 py-1.5 bg-cyan-500/8">
                            <span className="font-mono font-black text-indigo-400 text-sm tracking-widest">{promo.cod_cupon}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Instrumente gratuite */}
        <section className="bg-slate-900 border-t border-slate-800 py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">100% GRATUIT</p>
              <h2 className="text-2xl font-black text-white">Instrumente SEO gratuite recomandate</h2>
              <p className="text-slate-400 text-sm mt-2">Start ideal daca esti la inceput sau ai un buget limitat</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOLS_GRATUITE.map((t, i) => (
                <div key={t.nume} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 hover:border-teal-500/30 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-600/20 border border-teal-500/30 rounded-xl flex items-center justify-center text-xl">{t.emoji}</div>
                    <h3 className="font-bold text-white text-sm">{t.nume}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{t.desc}</p>
                  <div className="mt-3">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">GRATUIT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ghid */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">GHID ALEGERE</p>
            <h2 className="text-2xl font-black text-white">Cum alegi tool-ul SEO potrivit</h2>
          </div>
          <div className="space-y-4">
            {GHID_SEO.map((g, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center text-indigo-400 text-xs font-black">{i+1}</span>
                  {g.titlu}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{g.continut}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Newsletter / Alerte */}
        <section className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border-t border-emerald-500/20 py-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-3xl mb-3">🔔</div>
            <h2 className="text-xl font-black text-white mb-2">Vrei alerte cand apare un cod Semrush?</h2>
            <p className="text-slate-400 text-sm mb-5">Abonat-te la newsletter-ul AmCupon — trimitem alerte gratuite cand apar coduri de reducere la tool-uri SEO si software.</p>
            <Link href="/#newsletter"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-emerald-500/25">
              Vreau alerte gratuite
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/hosting", label: "🌐 Hosting Web" },
              { href: "/vpn", label: "🔒 VPN & Securitate" },
              { href: "/servicii", label: "⚙️ Servicii Online" },
              { href: "/software-business", label: "💼 Software Business" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/hosting" className="hover:text-indigo-400 transition-colors">Hosting</Link>{" · "}
          <Link href="/vpn" className="hover:text-indigo-400 transition-colors">VPN</Link>{" · "}
          <Link href="/categorii" className="hover:text-indigo-400 transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
