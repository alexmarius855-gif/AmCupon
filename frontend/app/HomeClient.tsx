"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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
  scor_afiliere: number;
  scor_final: number;
  rank?: number;
  prioritate: string;
  canal_recomandat: string;
  sales_number: number;
  trend: number;
  are_promotie: boolean;
  cod_cupon: boolean;
  zile_ramase: number;
  promotii: Promotie[];
  folosit_de: number;
  procent_succes: number;
  exclusiv: boolean;
}

// Paleta curatata: fiecare categorie are un accent distinct (recunoastere instanta),
// dar toate sunt nuante racoroase premium care se potrivesc pe fundal dark — ZERO
// portocaliu/galben/amber (regula site-ului) si fara rosu pur (rezervat pt "expira azi").
// Categorii CANONICE (aliniate cu canonicalize_categories.py — 18 categorii RO)
// Culoare vibranta distincta per categorie — recunoastere instanta ("curcubeu"),
// pe fundal auriu-premium raman clase (glow + tile colorat, nu card integral tipat).
const CATEGORII = [
  { slug: "fashion",         emoji: "👗", label: "Fashion",            desc: "Haine, pantofi & accesorii",     accent: "#ec4899" },
  { slug: "casa-gradina",    emoji: "🏡", label: "Casă & Grădină",     desc: "Mobilă, decor, electrocasnice",  accent: "#22c55e" },
  { slug: "electronice",     emoji: "💻", label: "Electronice & IT",   desc: "Telefoane, laptopuri, gadgeturi",accent: "#3b82f6" },
  { slug: "beauty",          emoji: "💄", label: "Beauty & Îngrijire", desc: "Cosmetice, parfumuri, unghii",   accent: "#d946ef" },
  { slug: "sanatate",        emoji: "💊", label: "Sănătate & Farmacie",desc: "Farmacie, suplimente, optică",   accent: "#14b8a6" },
  { slug: "software",        emoji: "🖥️", label: "Software & Digital",  desc: "VPN, hosting, AI, aplicații",    accent: "#6366f1" },
  { slug: "sport",           emoji: "🏃", label: "Sport & Fitness",    desc: "Echipament sportiv & fitness",   accent: "#f97316" },
  { slug: "copii",           emoji: "👶", label: "Copii & Familie",    desc: "Jucării, bebe, îmbrăcăminte",    accent: "#f59e0b" },
  { slug: "calatorii",       emoji: "✈️", label: "Călătorii",          desc: "Cazare, zboruri, eSIM",          accent: "#0ea5e9" },
  { slug: "auto-moto",       emoji: "🚗", label: "Auto & Moto",        desc: "Piese, anvelope, accesorii",     accent: "#ef4444" },
  { slug: "carti-educatie",  emoji: "📚", label: "Cărți & Educație",   desc: "Cărți, e-books, cursuri",        accent: "#8b5cf6" },
  { slug: "mancare-bauturi", emoji: "🍔", label: "Mâncare & Băuturi",  desc: "Livrare, cafea, vin, băuturi",   accent: "#fb7185" },
  { slug: "animale",         emoji: "🐾", label: "Pet Shop",           desc: "Hrană & accesorii animale",      accent: "#84cc16" },
  { slug: "cadouri-flori",   emoji: "🎁", label: "Cadouri & Flori",    desc: "Flori, cadouri, experiențe",     accent: "#f43f5e" },
  { slug: "bijuterii",       emoji: "💎", label: "Bijuterii & Ceasuri",desc: "Bijuterii, ceasuri, accesorii",  accent: "#06b6d4" },
  { slug: "financiar",       emoji: "💳", label: "Financiar",          desc: "Carduri, credite, asigurări",    accent: "#10b981" },
];


const BRAND_PAGES = [
  { href: "/emag",        name: "eMAG",         emoji: "🛒" },
  { href: "/altex",       name: "Altex",        emoji: "📺" },
  { href: "/fashiondays", name: "Fashion Days", emoji: "👗" },
  { href: "/decathlon",   name: "Decathlon",    emoji: "🏃" },
  { href: "/noriel",      name: "Noriel",       emoji: "🧸" },
  { href: "/carturesti",  name: "Carturesti",   emoji: "📚" },
  { href: "/drmax",       name: "Dr. Max",      emoji: "💊" },
  { href: "/libris",      name: "Libris",       emoji: "📖" },
  { href: "/petmart",     name: "Petmart",      emoji: "🐾" },
  { href: "/elefant",     name: "Elefant",      emoji: "🐘" },
  { href: "/brico",       name: "Brico",        emoji: "🔨" },
  { href: "/liki24",      name: "Liki24",       emoji: "🏥" },
  { href: "/vidaxl",      name: "vidaXL",       emoji: "🛋️" },
  { href: "/answear",     name: "Answear",      emoji: "👗" },
  { href: "/notino",      name: "Notino",       emoji: "🌸" },
  { href: "/flanco",      name: "Flanco",       emoji: "📺" },
  { href: "/bookzone",    name: "BookZone",     emoji: "📖" },
  { href: "/vegis",       name: "Vegis",        emoji: "🌿" },
  { href: "/petmax",      name: "Petmax",       emoji: "🐕" },
  { href: "/sportdepot",  name: "Sport Depot",  emoji: "⚽" },
  { href: "/automobilus", name: "Automobilus",  emoji: "🚗" },
  { href: "/litera",      name: "Litera",       emoji: "📚" },
  { href: "/pcmadd",      name: "PC Madd",      emoji: "💻" },
  { href: "/otter",       name: "Otter",        emoji: "🧢" },
  { href: "/temu",        name: "Temu",         emoji: "🛍️" },
  { href: "/shein",       name: "SHEIN",        emoji: "👗" },
  { href: "/trendyol",    name: "Trendyol",     emoji: "🧡" },
  { href: "/scule365",    name: "Scule365",     emoji: "🔧" },
  { href: "/kitunghii",   name: "KitUnghii",    emoji: "💅" },
  { href: "/pfarma",      name: "pFarma",       emoji: "💊" },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Cum folosesc un cod de reducere de pe AmCupon.ro?",
    a: "Alegi magazinul dorit, apesi pe cod ca sa il copiezi, apoi mergi la magazin prin butonul nostru. La finalizarea comenzii (checkout) lipesti codul in campul \"Cod reducere\" sau \"Voucher\" si reducerea se aplica automat.",
  },
  {
    q: "Codurile de reducere sunt gratuite?",
    a: "Da, 100% gratuit. Nu platesti nimic si nu ai nevoie de cont. AmCupon.ro este gratuit pentru toti utilizatorii, fara costuri ascunse.",
  },
  {
    q: "Cat de des se actualizeaza ofertele si codurile?",
    a: "Verificam si actualizam codurile zilnic, automat, de la peste 1000 de magazine partenere din Romania. Ofertele expirate sunt eliminate, iar cele noi adaugate in fiecare zi.",
  },
  {
    q: "De ce unele coduri nu mai functioneaza?",
    a: "Magazinele pot opri o promotie inainte de data anuntata sau pot limita stocul. Daca un cod nu mai merge, incearca alt cod activ din aceeasi pagina de magazin sau verifica ofertele fara cod, care se aplica automat.",
  },
  {
    q: "Trebuie sa imi fac cont ca sa folosesc codurile?",
    a: "Nu. Toate codurile si ofertele sunt disponibile fara cont si fara inregistrare. Optional, te poti abona la newsletter pentru a primi top 5 oferte zilnic pe email.",
  },
  {
    q: "Cum castiga bani AmCupon.ro?",
    a: "Primim un comision de la magazine atunci cand cumperi prin link-urile noastre, din bugetul lor de marketing. Pentru tine pretul ramane acelasi, fara costuri suplimentare. Asa putem mentine serviciul gratuit.",
  },
];

function maskCod(cod: string): string {
  if (!cod || cod.length <= 4) return cod;
  return cod.slice(0, 4) + "*".repeat(Math.min(cod.length - 4, 6));
}

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

function maxDiscount(promotii: Promotie[]): string | null {
  let maxPct = 0;
  for (const p of promotii) {
    const texts = [p.nume || "", p.descriere || ""];
    for (const t of texts) {
      const m = t.match(/(\d+)\s*%/g);
      if (m) {
        for (const match of m) {
          const val = parseInt(match);
          if (val > maxPct && val <= 90) maxPct = val;
        }
      }
    }
  }
  return maxPct > 0 ? `Pana la ${maxPct}% reducere` : null;
}

function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

interface Produs {
  title: string;
  url: string;
  image: string;
  price: number;
  old_price?: number;
  discount_pct: number;
  brand: string;
  merchant: string;
  merchant_slug: string;
}

interface ProdusCategorie {
  slug: string;
  label: string;
  emoji: string;
  products: Produs[];
}

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  cover: string;
}

interface HomeClientProps {
  magazine: Magazin[];
  blogPosts: BlogPost[];
  recomandate: { magazin: string; nume: string; logo_url: string; categorie: string; comision: number; are_cod: boolean; oferta: string }[];
  produseCategorii: ProdusCategorie[];
}

export default function HomeClient({
  magazine: initMag,
  blogPosts: initBlog,
  recomandate: initRec,
  produseCategorii: initProd,
}: HomeClientProps) {
  const [magazine]                        = useState<Magazin[]>(initMag);
  const [blogPosts]                       = useState<BlogPost[]>(initBlog);
  const [loading]                         = useState(initMag.length === 0);
  const [cautare, setCautare]             = useState("");
  const [coduriReveal, setCoduriReveal]   = useState<Set<string>>(new Set());
  const [copiat, setCopiat]               = useState<string | null>(null);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [storeLimit, setStoreLimit]       = useState(12);
  const [filtruActiv, setFiltruActiv]     = useState<"toate"|"cod"|"promotie"|"favorite">("toate");
  const [favorite, setFavorite]           = useState<Set<string>>(new Set());
  const [produseCategorii]                = useState<ProdusCategorie[]>(initProd);
  const [activeCatTab, setActiveCatTab]         = useState<string>("toate");
  const [recomandate]                     = useState(initRec);
  const [showFab, setShowFab]             = useState(false);
  const rezultateRef                       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Datele (magazine/blog/recomandate/produse) vin server-side prin props → SSR + SEO.
    // Aici doar starea strict client: favoritele din localStorage.
    try {
      const saved = JSON.parse(localStorage.getItem("favorite_magazine") || "[]");
      setFavorite(new Set(saved));
    } catch {}
  }, []);

  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleFavorit(slug: string, e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setFavorite(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      localStorage.setItem("favorite_magazine", JSON.stringify([...next]));
      return next;
    });
  }

  const filtrate = magazine.filter(m => {
    const matchCautare = cautare === "" || m.magazin.toLowerCase().includes(cautare.toLowerCase()) || numeAfisat(m.magazin).toLowerCase().includes(cautare.toLowerCase());
    if (!matchCautare) return false;
    if (filtruActiv === "cod")       return m.cod_cupon;
    if (filtruActiv === "promotie")  return m.are_promotie;
    if (filtruActiv === "favorite")  return favorite.has(m.magazin);
    return true;
  });

  const expiraAzi   = filtrate.filter(m => m.are_promotie && m.zile_ramase <= 1);
  const cuPromotii  = filtrate.filter(m => m.are_promotie);
  const faraPromotii= filtrate.filter(m => !m.are_promotie);

  const promoPerCateg = magazine.reduce((acc, m) => {
    if (m.are_promotie && m.categorie_slug) acc[m.categorie_slug] = (acc[m.categorie_slug] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Vânzări totale per categorie — sortăm categoriile după popularitate reală
  const vanzariPerCateg = magazine.reduce((acc, m) => {
    if (m.categorie_slug) acc[m.categorie_slug] = (acc[m.categorie_slug] || 0) + (m.sales_number || 0);
    return acc;
  }, {} as Record<string, number>);

  const categoriiSortate = [...CATEGORII].sort(
    (a, b) => (vanzariPerCateg[b.slug] || 0) - (vanzariPerCateg[a.slug] || 0)
  );

  function copiazaCod(id: string, cod: string, link?: string) {
    setCoduriReveal(prev => new Set(prev).add(id));
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiat(id);
    setTimeout(() => setCopiat(null), 3000);
    trackAfiliat("copiere_cod_homepage", id, cod);
    // Deschide magazinul cu link-ul afiliat (sincron = nu e blocat) — prinde comisionul
    if (link) window.open(link, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="gold-home min-h-screen bg-[#F7F9FC]">
      <style>{`
        .gold-home h1, .gold-home h2 { font-family: var(--font-display), Georgia, "Times New Roman", serif; letter-spacing: -0.015em; }
      `}</style>
      {/* ─── BUTON FLOTANT PRODUSE (burtiera) ─────────────────────────────── */}
      <a
        href="/produse"
        aria-label="Vezi produsele cu reducere"
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 bg-gradient-to-r from-[#0d9488] to-[#0f766e] hover:from-[#14b8a6] hover:to-[#0d9488] text-white font-black pl-4 pr-5 py-3 rounded-full shadow-2xl shadow-[#14b8a6]/50 ring-2 ring-[#0f766e]/40 transition-all duration-300 hover:scale-105 ${showFab ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}`}
      >
        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-lg">
          🛍️
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-[#14b8a6] animate-pulse" />
        </span>
        <span className="text-sm leading-tight text-left">Produse cu<br/>reducere</span>
        <span className="bg-slate-100 text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide">HOT</span>
        <span className="text-lg">→</span>
      </a>


      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <header className="bg-[#ffffff]/95 backdrop-blur-sm border-b border-[#cbd5e1] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center gap-3">

          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-[#0d9488] text-white font-black text-sm px-2 py-0.5 rounded-lg tracking-tighter">Am</div>
            <span className="font-black text-[#0f172a] text-xl tracking-tight">Cupon<span className="text-[#0d9488]">.ro</span></span>
          </Link>

          <div className="flex-1 relative max-w-2xl hidden sm:block">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Answear, eMAG, Notino..." value={cautare}
              onChange={e => { setCautare(e.target.value); setMenuOpen(false); }}
              className="w-full bg-[#e2e8f0] border border-[#cbd5e1] text-[#0f172a] placeholder-[#64748b] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488] focus:border-[#0d9488] transition-all" />
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-[#334155] ml-auto">
            <Link href="/oferte-azi" className="flex items-center gap-1 text-[#0d9488] hover:text-[#0f766e] transition-colors font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse" />
              Oferte azi
            </Link>
            <Link href="/produse"  className="hover:text-[#0d9488] transition-colors">Produse</Link>
            <Link href="/blog"     className="hover:text-[#0d9488] transition-colors">Blog</Link>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-[#0d9488] transition-colors py-1">
                Categorii
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 w-60">
                <div className="bg-[#ffffff] border border-[#cbd5e1] rounded-xl shadow-xl py-2">
                  {categoriiSortate.slice(0, 8).map(c => (
                    <a key={c.slug} href={`/categorii/${c.slug}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#334155] hover:bg-[#14b8a6]/15 hover:text-[#0d9488] transition-colors">
                      <span className="text-base">{c.emoji}</span>
                      <span className="font-medium">{c.label}</span>
                      {promoPerCateg[c.slug] > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-[#ccfbf1] text-[#0f766e] px-1.5 py-0.5 rounded-full">{promoPerCateg[c.slug]}</span>
                      )}
                    </a>
                  ))}
                  <div className="border-t border-[#e2e8f0] mt-1 pt-1">
                    <Link href="/categorii" className="flex items-center px-4 py-2 text-sm font-bold text-[#0d9488] hover:bg-[#14b8a6]/15 transition-colors">
                      Toate categoriile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <button onClick={() => setMenuOpen(o => !o)}
            className="md:hidden ml-auto p-2 rounded-xl hover:bg-[#e2e8f0] transition-colors text-[#1e293b]" aria-label="Meniu">
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#e2e8f0] bg-[#ffffff]">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              <div className="relative">
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Cauta magazin..." value={cautare}
                  onChange={e => setCautare(e.target.value)}
                  className="w-full bg-[#e2e8f0] border border-[#cbd5e1] text-[#0f172a] placeholder-[#64748b] rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d9488]" />
              </div>
              <nav className="space-y-1">
                {[
                  { href: "/oferte-azi",  label: "🔥 Oferte de azi" },
                  { href: "/#promotii",  label: "Promotii active" },
                  { href: "/blog",       label: "Blog" },
                  { href: "/fashion",    label: "Fashion & Haine" },
                  { href: "/casa",       label: "Casa & Gradina" },
                  { href: "/farmacie",   label: "Farmacie Online" },
                  { href: "/sport",      label: "Sport & Outdoor" },
                  { href: "/frumusete",  label: "Beauty" },
                  { href: "/calatorie",  label: "Vacante & Travel" },
                  { href: "/copii",      label: "Copii & Jucarii" },
                  { href: "/gadgets",    label: "Gadgets & Tech" },
                  { href: "/sanatate",   label: "Sanatate & Naturiste" },
                  { href: "/animale",    label: "Animale de Companie" },
                  { href: "/categorii",  label: "Toate categoriile" },
                ].map(l => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-[#1e293b] hover:bg-[#e2e8f0] hover:text-[#0d9488] transition-colors">
                    {l.label}
                  </a>
                ))}
              </nav>
              <div>
                <p className="text-xs font-bold text-[#475569] uppercase tracking-wider px-1 mb-3">Categorii populare</p>
                <div className="grid grid-cols-4 gap-2">
                  {categoriiSortate.slice(0, 8).map(c => (
                    <a key={c.slug} href={`/categorii/${c.slug}`} onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#cbd5e1] bg-[#e2e8f0] hover:border-[#14b8a6] transition-colors">
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-[10px] font-semibold text-[#334155] text-center leading-tight">{c.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#F7F9FC] text-[#0f172a] overflow-hidden">
        {/* Fundal premium: aurora indigo/cyan care pluteste lent + grid subtil, ZERO portocaliu */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 80% 60% at 50% -20%, rgba(13,148,136,0.18) 0%, transparent 65%)"}} />
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
          <div className="absolute inset-0" style={{
            backgroundImage:"linear-gradient(rgba(100,116,139,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.08) 1px, transparent 1px)",
            backgroundSize:"58px 58px",
            maskImage:"radial-gradient(ellipse 65% 55% at 50% 32%, black, transparent 78%)",
            WebkitMaskImage:"radial-gradient(ellipse 65% 55% at 50% 32%, black, transparent 78%)"
          }} />
        </div>
        <style>{`
          @keyframes heroFloat1 { 0%,100%{ transform: translate(-8%,-6%) scale(1);} 50%{ transform: translate(9%,6%) scale(1.18);} }
          @keyframes heroFloat2 { 0%,100%{ transform: translate(8%,0%) scale(1.1);} 50%{ transform: translate(-7%,9%) scale(0.94);} }
          @keyframes heroFloat3 { 0%,100%{ transform: translate(0%,8%) scale(1);} 50%{ transform: translate(6%,-7%) scale(1.22);} }
          .hero-blob{ position:absolute; border-radius:9999px; filter:blur(72px); }
          .hero-blob-1{ width:440px;height:440px; top:-130px; left:6%;  background:rgba(13,148,136,0.26); animation:heroFloat1 15s ease-in-out infinite; }
          .hero-blob-2{ width:360px;height:360px; top:-70px;  right:5%; background:rgba(20,184,166,0.16); animation:heroFloat2 19s ease-in-out infinite; }
          .hero-blob-3{ width:320px;height:320px; bottom:-150px; left:44%; background:rgba(13,148,136,0.20); animation:heroFloat3 17s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce){ .hero-blob{ animation:none; } }
        `}</style>

        <div className="relative max-w-3xl mx-auto px-4 pt-20 pb-20 md:pt-28 md:pb-28 text-center">
          {/* Live pill */}
          <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 text-xs font-medium text-[#334155] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0d9488] animate-pulse inline-block"/>
            {cuPromotii.length > 0 ? `${cuPromotii.length} oferte verificate astazi` : "Sute de oferte verificate zilnic"}
          </div>

          {/* H1 */}
          <h1 className="text-[2.5rem] md:text-[3.75rem] font-black tracking-tight leading-[1.08] mb-6">
            <span className="text-[#0f172a]">Gaseste coduri de reducere</span><br/>
            <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #0f766e 0%, #10b981 100%)"}}>
              verificate inainte sa cumperi
            </span>
          </h1>

          <p className="text-[#475569] text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            {magazine.length > 0 ? `Peste ${magazine.length}` : "Peste 1000"} magazine partenere, verificate zilnic. 100% gratuit.
          </p>

          {/* Search hero */}
          <div className="max-w-xl mx-auto relative mb-10">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Cauta: eMAG, Answear, Noriel..." value={cautare}
              onChange={e => {
                setCautare(e.target.value);
                setTimeout(() => rezultateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
              }}
              onKeyDown={e => { if (e.key === "Enter") rezultateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              className="w-full bg-slate-100 border border-slate-200 text-[#0f172a] rounded-xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/60 focus:border-[#14b8a6]/40 placeholder-slate-400 transition-all" />
            {cautare && (
              <button onClick={() => setCautare("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0f172a] transition-colors text-lg leading-none">
                &times;
              </button>
            )}
          </div>

          {/* Quick chips — magazine populare, un click distanta */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <span className="text-xs text-[#64748b] font-medium mr-1">Populare:</span>
            {[
              { nume: "eMAG",        slug: "emag.ro" },
              { nume: "Notino",      slug: "notino.ro" },
              { nume: "FashionDays", slug: "fashiondays.ro" },
              { nume: "Dr.Max",      slug: "drmax.ro" },
              { nume: "Noriel",      slug: "noriel.ro" },
              { nume: "Libris",      slug: "libris.ro" },
            ].map(c => (
              <Link key={c.slug} href={`/cod-reducere/${c.slug}`}
                className="bg-white border border-slate-200 hover:border-[#14b8a6] hover:text-[#0f766e] text-[#334155] text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors shadow-sm">
                {c.nume}
              </Link>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <a href="#promotii"
              className="bg-[#0d9488] hover:bg-[#14b8a6] text-white font-black px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#14b8a6]/25 hover:shadow-[#14b8a6]/40 hover:-translate-y-0.5 duration-200">
              Coduri active acum →
            </a>
            <Link href="/newsletter"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-[#0f172a] font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-sm">
              📬 Top reduceri pe email
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-[#64748b] font-medium">
            <span className="flex items-center gap-1.5"><span className="text-[#0d9488]">✓</span> Gratuit, fara cont</span>
            <span className="flex items-center gap-1.5"><span className="text-[#0d9488]">✓</span> {magazine.length > 0 ? `${magazine.length}+` : "380+"} magazine</span>
            <span className="flex items-center gap-1.5"><span className="text-[#0d9488]">✓</span> Actualizat zilnic automat</span>
            <span className="flex items-center gap-1.5"><span className="text-[#0d9488]">✓</span> 0 reclame invazive</span>
          </div>
        </div>
      </section>

      {/* ─── BARA CATEGORII (stil Kuplio — mereu vizibila, orizontala) ──────── */}
      <section className="relative z-20 bg-[#ffffff] border-y border-[#e2e8f0] shadow-lg shadow-slate-300/60">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5" style={{ scrollbarWidth: "none" }}>
            {CATEGORII.map(c => (
              <a key={c.slug} href={`/categorii/${c.slug}`}
                className="group shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#334155] hover:text-[#F7F9FC] hover:bg-gradient-to-br hover:from-[#0f766e] hover:to-[#14b8a6] transition-all whitespace-nowrap">
                <span className="text-base leading-none">{c.emoji}</span>
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY GRID (colorat, printre primele — recunoastere instanta) ── */}
      <section id="categorii" className="bg-[#ffffff] border-b border-[#e2e8f0] py-14 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-2">CATEGORII</p>
              <h2 className="text-3xl font-black tracking-tight text-[#0f172a]">Exploreaza dupa categorie</h2>
              <p className="text-[#475569] text-sm mt-1.5">Coduri verificate zilnic in fiecare categorie</p>
            </div>
            <Link href="/categorii" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors border border-[#14b8a6]/30 hover:border-[#0d9488]/60 bg-[#14b8a6]/10 hover:bg-[#14b8a6]/20 px-4 py-2 rounded-full whitespace-nowrap">
              Toate categoriile
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Grid principal — top 8 categorii după vânzări */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categoriiSortate.slice(0, 8).map(c => {
              const nrPromo = promoPerCateg[c.slug] || 0;
              return (
                <a
                  key={c.slug}
                  href={`/categorii/${c.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-[#ffffff] border border-[#e2e8f0] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-300/60"
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${c.accent}80`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
                >
                  {/* Tenta colorata pe tot cardul — personalitate per categorie */}
                  <div className="absolute inset-0 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(155deg, ${c.accent}22 0%, transparent 55%)` }} />
                  {/* Glow colorat in colt */}
                  <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full pointer-events-none opacity-35 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
                    style={{ background: c.accent }} />

                  <div className="relative p-5 flex flex-col gap-3 min-h-[140px]">
                    {/* Badge oferte */}
                    {nrPromo > 0 ? (
                      <div className="inline-flex self-start items-center gap-1 px-2 py-0.5 rounded-full border" style={{ background: `${c.accent}22`, borderColor: `${c.accent}55` }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: c.accent }} />
                        <span className="text-[10px] font-bold" style={{ color: c.accent }}>{nrPromo} {nrPromo === 1 ? "oferta" : "oferte"}</span>
                      </div>
                    ) : (
                      <div className="inline-flex self-start bg-[#e2e8f0] px-2 py-0.5 rounded-full">
                        <span className="text-[#475569] text-[10px]">Vezi magazine</span>
                      </div>
                    )}

                    {/* Emoji mare pe tile colorat vibrant */}
                    <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}bb)`, boxShadow: `0 6px 16px ${c.accent}50` }}>
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300 drop-shadow">
                        {c.emoji}
                      </span>
                    </div>

                    {/* Nume + descriere */}
                    <div>
                      <div className="text-[#0f172a] font-black text-sm leading-tight">{c.label}</div>
                      <div className="text-[#475569] text-[10px] mt-0.5 leading-tight">{c.desc}</div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 text-[#64748b] group-hover:text-[#0f172a] group-hover:gap-2 transition-all text-[10px] font-bold">
                      Vezi ofertele
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Grid secundar — restul categoriilor ca chips */}
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2 mt-3">
            {categoriiSortate.slice(8).map(c => {
              const nrPromo = promoPerCateg[c.slug] || 0;
              return (
                <a
                  key={c.slug}
                  href={`/categorii/${c.slug}`}
                  className="group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl overflow-hidden bg-[#ffffff]/60 border border-[#e2e8f0] transition-all duration-200 hover:-translate-y-0.5"
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${c.accent}60`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
                >
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200"
                    style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}bb)`, boxShadow: `0 4px 10px ${c.accent}44` }}>{c.emoji}</span>
                  <span className="text-[10px] font-bold text-[#1e293b] text-center leading-tight">{c.label}</span>
                  {nrPromo > 0 && (
                    <span className="absolute -top-1 -right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm" style={{ background: c.accent }}>
                      {nrPromo > 9 ? "9+" : nrPromo}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <Link href="/categorii" className="sm:hidden mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-[#0d9488] border border-[#14b8a6]/30 bg-[#14b8a6]/10 py-2.5 rounded-xl">
            Toate categoriile →
          </Link>
        </div>
      </section>

      {/* ─── BRAND MARQUEE — dovada vizuala a magazinelor reale ────────────── */}
      {!loading && (() => {
        const logos = magazine
          .filter(m => m.logo_url && !/\s/.test(m.magazin))
          .sort((a, b) => (b.sales_number || 0) - (a.sales_number || 0))
          .slice(0, 30);
        if (logos.length < 8) return null;
        const row = [...logos, ...logos];
        return (
          <section className="relative bg-[#F7F9FC] border-b border-[#e2e8f0] py-8 overflow-hidden">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748b] mb-6">
              Coduri verificate pentru magazinele tale preferate
            </p>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none" style={{background:"linear-gradient(90deg, #F7F9FC 10%, transparent)"}} />
              <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none" style={{background:"linear-gradient(270deg, #F7F9FC 10%, transparent)"}} />
              <div className="marquee-track flex items-center gap-4 w-max">
                {row.map((m, i) => (
                  <a key={`${m.magazin}-${i}`} href={`/cod-reducere/${m.magazin}`} aria-hidden={i >= logos.length}
                    className="shrink-0 w-28 h-16 rounded-xl bg-white border border-[#e2e8f0] hover:border-[#14b8a6]/60 flex items-center justify-center p-3 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.logo_url} alt={numeAfisat(m.magazin)} className="max-w-full max-h-full object-contain" loading="lazy" />
                  </a>
                ))}
              </div>
            </div>
            <style>{`
              @keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
              .marquee-track { animation: marqueeScroll 45s linear infinite; }
              .marquee-track:hover { animation-play-state: paused; }
              @media (prefers-reduced-motion: reduce){ .marquee-track { animation: none; } }
            `}</style>
          </section>
        );
      })()}

      {/* ─── STATS BAR ────────────────────────────────────────────────────── */}
      {!loading && magazine.length > 0 && (() => {
        const nrOferte    = magazine.filter(m => m.are_promotie).length;
        const nrCoduri    = magazine.filter(m => m.cod_cupon).length;
        const nrMagazine  = magazine.length;
        const nrExpiraAzi = magazine.filter(m => m.are_promotie && m.zile_ramase <= 1).length;
        return (
          <div className="bg-[#ffffff]/80 border-b border-[#e2e8f0] py-4 px-4">
            <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-10">
              {[
                { val: nrMagazine,  label: "magazine partenere", icon: "🏪" },
                { val: nrOferte,    label: "oferte active azi",   icon: "🔥" },
                { val: nrCoduri,    label: "coduri de reducere",  icon: "🎟️" },
                { val: nrExpiraAzi, label: "expira astazi",        icon: "⏰" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <span className="font-black text-[#0f172a] text-base">{s.val}</span>
                    <span className="text-[#64748b] ml-1.5 text-xs">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* placeholder pentru a inchide sectiunea corecta daca loading */}
      {loading && <div className="h-[53px] bg-[#ffffff]/80 border-b border-[#e2e8f0]" />}

      {/* ─── OFERTA ZILEI — spotlight cu cea mai buna reducere activa ────────── */}
      {!loading && (() => {
        // Prefera oferte cu link de afiliat REAL (castiga comision), nu url brut (ex: temu.com)
        const cuAfiliat = [...cuPromotii].filter(m => m.promotii?.[0] && m.url_afiliat && m.url_afiliat !== m.url);
        const pool = cuAfiliat.length ? cuAfiliat : [...cuPromotii].filter(m => m.promotii?.[0]);
        const best = pool.sort((a, b) => (b.scor_final || 0) - (a.scor_final || 0))[0];
        if (!best) return null;
        const promo = best.promotii[0];
        const disc = extractDiscount(promo.nume) || extractDiscount(promo.descriere || "");
        const cod = promo.cod_cupon;
        const link = promo.landing_page || best.url_afiliat || best.url;
        const revealed = coduriReveal.has(best.magazin);
        const nume = numeAfisat(best.magazin);
        return (
          <section className="bg-[#F7F9FC] border-b border-[#e2e8f0] py-12 px-4">
            <div className="max-w-5xl mx-auto">
              <p className="text-xs font-black text-[#0d9488] uppercase tracking-widest mb-4">⭐ Oferta zilei</p>
              <div className="relative overflow-hidden rounded-xl border border-[#14b8a6]/30 bg-gradient-to-br from-[#ffffff]/60 via-[#ffffff] to-[#ffffff] p-6 sm:p-8">
                <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{background:"radial-gradient(circle, rgba(20,184,166,0.14), transparent 70%)"}} />
                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-28 h-28 rounded-xl bg-white flex items-center justify-center p-3 shrink-0 shadow-xl">
                    {best.logo_url
                      ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={best.logo_url} alt={nume} className="max-w-full max-h-full object-contain" />
                      : <span className="text-4xl font-black text-[#0d9488]">{nume.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2 flex-wrap">
                      <span className="font-black text-[#0f172a] text-2xl">{nume}</span>
                      {disc && <span className="text-xs font-black text-white bg-[#0d9488] px-2.5 py-1 rounded-full">-{disc}</span>}
                      {(best.zile_ramase ?? 9) <= 2 && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full">expira curand</span>}
                    </div>
                    <p className="text-[#334155] text-sm mb-5 max-w-md mx-auto sm:mx-0 line-clamp-2">{promo.nume}</p>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {cod && (
                        <button onClick={() => copiazaCod(best.magazin, cod, link)}
                          className="group flex items-center gap-2 bg-[#e2e8f0] border-2 border-dashed border-[#14b8a6]/50 hover:border-[#0d9488] rounded-xl px-4 py-2.5 transition-colors">
                          <span className="font-mono font-black text-[#0d9488] tracking-widest text-sm">{revealed ? cod : cod.slice(0, 3) + "•••"}</span>
                          <span className="text-[10px] text-[#64748b] group-hover:text-[#0d9488]">{copiat === best.magazin ? "✓ copiat" : "copiaza"}</span>
                        </button>
                      )}
                      <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                        onClick={() => trackAfiliat("spotlight_cta", best.magazin, cod)}
                        className="bg-[#0d9488] hover:bg-[#14b8a6] text-white font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#14b8a6]/25 hover:-translate-y-0.5 duration-200">
                        {cod ? "Copiaza si mergi la magazin →" : "Vezi oferta →"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ─── PRODUSE PE CATEGORII (mutat sus — prima dovada vizuala de reduceri reale) ── */}
      {produseCategorii.length > 0 && (
        <section className="bg-[#ffffff] border-b border-[#e2e8f0] py-14 px-4">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-2">PRODUSE CU REDUCERE</p>
                <h2 className="text-3xl font-black tracking-tight text-[#0f172a]">Produse pe categorii</h2>
                <p className="text-[#475569] text-sm mt-1.5">Cele mai bune oferte, organizate pe nise</p>
              </div>
              <Link href="/produse" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#0d9488] hover:text-[#0f766e] border border-[#14b8a6]/30 hover:border-[#0d9488]/60 bg-[#14b8a6]/10 hover:bg-[#14b8a6]/20 px-4 py-2 rounded-full whitespace-nowrap transition-all">
                Toate produsele →
              </Link>
            </div>

            {/* Tab pills — filtre categorie */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-9 -mx-4 px-4" style={{scrollbarWidth:"none"}}>
              <button
                onClick={() => setActiveCatTab("toate")}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeCatTab === "toate" ? "bg-[#0d9488] text-white shadow-lg shadow-[#14b8a6]/30" : "bg-[#e2e8f0] text-[#334155] hover:bg-[#cbd5e1] border border-[#cbd5e1]/80"}`}
              >
                🛍️ Toate
              </button>
              {produseCategorii.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCatTab(cat.slug)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeCatTab === cat.slug ? "bg-[#0d9488] text-white shadow-lg shadow-[#14b8a6]/30" : "bg-[#e2e8f0] text-[#334155] hover:bg-[#cbd5e1] border border-[#cbd5e1]/80"}`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Continut: randuri orizontale (mod Toate) sau grid (mod categorie) */}
            {activeCatTab === "toate" ? (
              <div className="space-y-10">
                {produseCategorii.map(cat => (
                  <div key={cat.slug}>
                    {/* Header rand */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{cat.emoji}</span>
                        <h3 className="text-lg font-black text-[#0f172a]">{cat.label}</h3>
                        <span className="text-xs text-[#64748b] font-medium">{cat.products.length} produse</span>
                      </div>
                      <button
                        onClick={() => setActiveCatTab(cat.slug)}
                        className="text-xs font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors flex items-center gap-1 border border-[#14b8a6]/20 hover:border-[#0d9488]/40 px-3 py-1 rounded-full bg-[#14b8a6]/5 hover:bg-[#14b8a6]/10"
                      >
                        Vezi toate →
                      </button>
                    </div>
                    {/* Scroll orizontal */}
                    <div className="overflow-x-auto -mx-4 px-4 pb-2" style={{scrollbarWidth:"none"}}>
                      <div className="flex gap-3" style={{minWidth:"max-content"}}>
                        {cat.products.map((p, i) => (
                          <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                            className="group flex-shrink-0 w-44 bg-[#e2e8f0] border border-[#cbd5e1] hover:border-[#14b8a6]/50 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1 transition-all duration-200">
                            <div className="relative w-full aspect-square bg-[#cbd5e1] overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.image} alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={e => { const el = (e.target as HTMLImageElement).closest("a"); if (el) el.style.display = "none"; }}
                              />
                              {p.discount_pct > 0 && (
                                <div className="absolute top-2 left-2 bg-gradient-to-br from-[#34d399] to-[#14b8a6] text-[#ffffff] text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow-md">
                                  -{p.discount_pct}%
                                </div>
                              )}
                            </div>
                            <div className="p-2.5">
                              <p className="text-[9px] text-[#64748b] mb-0.5 truncate font-medium">{p.merchant.replace(".ro","").replace(".com","")}</p>
                              <p className="text-xs font-semibold text-[#1e293b] line-clamp-2 leading-snug group-hover:text-[#0d9488] transition-colors mb-1.5">{p.title}</p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-black text-[#0d9488]">{p.price.toLocaleString("ro-RO")} lei</span>
                                {p.old_price && p.old_price > p.price && (
                                  <span className="text-[10px] text-[#64748b] line-through">{p.old_price.toLocaleString("ro-RO")}</span>
                                )}
                              </div>
                            </div>
                          </a>
                        ))}
                        {/* Card "Toate" la finalul randului */}
                        <button
                          onClick={() => setActiveCatTab(cat.slug)}
                          className="flex-shrink-0 w-32 bg-[#e2e8f0]/60 border border-dashed border-[#cbd5e1] hover:border-[#14b8a6]/40 rounded-xl flex flex-col items-center justify-center gap-2.5 hover:bg-[#e2e8f0] transition-all duration-200 group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#14b8a6]/15 flex items-center justify-center group-hover:bg-[#14b8a6]/25 transition-colors">
                            <svg className="w-5 h-5 text-[#0d9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-[#475569] group-hover:text-[#0d9488] text-center px-2 leading-tight transition-colors">Toate {cat.label}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Grid pentru categoria selectata */
              (() => {
                const cat = produseCategorii.find(c => c.slug === activeCatTab);
                if (!cat) return null;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {cat.products.map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                        className="group bg-[#e2e8f0] border border-[#cbd5e1] hover:border-[#14b8a6]/50 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1 transition-all duration-200">
                        <div className="relative aspect-square bg-[#cbd5e1] overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={e => { const el = (e.target as HTMLImageElement).closest("a"); if (el) el.style.display = "none"; }}
                          />
                          {p.discount_pct > 0 && (
                            <div className="absolute top-2 left-2 bg-gradient-to-br from-[#34d399] to-[#14b8a6] text-[#ffffff] text-[11px] font-black px-2 py-0.5 rounded-lg shadow-md">
                              -{p.discount_pct}%
                            </div>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="text-[10px] text-[#64748b] mb-0.5 truncate font-medium">{p.merchant.replace(".ro","").replace(".com","")}</p>
                          <p className="text-sm font-semibold text-[#1e293b] line-clamp-2 leading-snug group-hover:text-[#0d9488] transition-colors mb-2">{p.title}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-[#0d9488]">{p.price.toLocaleString("ro-RO")} lei</span>
                            {p.old_price && p.old_price > p.price && (
                              <span className="text-xs text-[#64748b] line-through">{p.old_price.toLocaleString("ro-RO")}</span>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                );
              })()
            )}

            <div className="text-center mt-10">
              <Link href="/produse" className="inline-flex items-center gap-2 text-sm font-bold text-[#475569] hover:text-[#0d9488] transition-colors">
                Toate produsele cu reducere →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── DEAL ZILEI ──────────────────────────────────────────────────── */}
      {!loading && cuPromotii.length > 0 && (() => {
        const deal  = cuPromotii.find(m => m.cod_cupon && m.zile_ramase <= 3) || cuPromotii.find(m => m.cod_cupon) || cuPromotii[0];
        const promo = deal.promotii[0];
        const discountText = maxDiscount(deal.promotii);
        const link  = promo?.landing_page || deal.url_afiliat || deal.url;
        const urgency = deal.zile_ramase <= 1;
        return (
          <div className={`py-6 px-4 border-b ${urgency ? "bg-gradient-to-r from-red-950/60 via-[#ffffff] to-[#ffffff] border-red-500/20" : "bg-[#ffffff] border-slate-200"}`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wider ${urgency ? "bg-red-600 animate-pulse" : "bg-[#0d9488]"}`}>
                  {urgency ? "⚡ EXPIRA AZI" : "🔥 DEAL ZILEI"}
                </span>
                <span className="text-[#64748b] text-xs">{new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}</span>
                {deal.zile_ramase <= 1 && <CardCountdown zileRamase={deal.zile_ramase} />}
                {expiraAzi.length > 1 && (
                  <Link href="/oferte-azi" className="ml-auto text-xs font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors">
                    +{expiraAzi.length - 1} oferte expira azi →
                  </Link>
                )}
              </div>
              <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 border rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 ${urgency ? "bg-red-500/8 hover:bg-red-500/12 border-red-500/30 hover:border-red-400/50 hover:shadow-lg hover:shadow-red-500/10" : "bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-[#14b8a6]/40 hover:shadow-lg hover:shadow-[#14b8a6]/10"}`}>
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-lg">
                  {deal.logo_url ? (
                    <img src={deal.logo_url} alt={numeAfisat(deal.magazin)} className="w-12 h-12 object-contain" loading="lazy"/>
                  ) : (
                    <span className="text-2xl font-black text-[#0d9488]">{numeAfisat(deal.magazin)[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[#0f172a] font-black text-xl">{numeAfisat(deal.magazin)}</span>
                    <span className="text-[#64748b] text-xs">{deal.categorie}</span>
                    {deal.exclusiv && <span className="bg-[#14b8a6]/20 text-[#0f766e] text-[10px] font-black px-2 py-0.5 rounded-full border border-[#14b8a6]/30">EXCLUSIV</span>}
                  </div>
                  <p className="text-[#334155] text-sm line-clamp-2">{promo?.descriere || promo?.nume || "Oferta speciala disponibila"}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {discountText && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                        ✓ {discountText}
                      </span>
                    )}
                    {deal.cod_cupon && promo?.cod_cupon && (
                      <span className="inline-flex items-center gap-1 bg-[#14b8a6]/15 text-[#0d9488] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#14b8a6]/25">
                        🏷 Cod disponibil
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {promo?.cod_cupon && (
                    <div className="hidden sm:block border-2 border-dashed border-[#0d9488]/50 rounded-xl px-4 py-2.5 bg-[#14b8a6]/8">
                      <p className="text-[9px] text-[#64748b] uppercase tracking-widest mb-0.5">Cod reducere</p>
                      <span className="font-mono font-black text-[#0d9488] text-sm tracking-widest">{promo.cod_cupon}</span>
                    </div>
                  )}
                  <span className={`font-black px-5 py-3 rounded-xl text-sm transition-colors whitespace-nowrap shadow-lg ${urgency ? "bg-red-600 group-hover:bg-red-500 text-white shadow-red-500/30" : "bg-[#0d9488] group-hover:bg-[#14b8a6] text-white shadow-[#14b8a6]/20"}`}>
                    {deal.cod_cupon ? "Ia codul →" : "Vezi oferta →"}
                  </span>
                </div>
              </a>
            </div>
          </div>
        );
      })()}

      {/* ─── REDUCERI MARI AZI ───────────────────────────────────────────── */}
      {!loading && (() => {
        const ofertePct = magazine.flatMap(m =>
          m.promotii
            .filter(p => {
              const match = p.nume?.match(/(\d+)\s*%/);
              return match && parseInt(match[1]) >= 20 && parseInt(match[1]) <= 80 && (p.zile_ramase ?? 99) >= 0;
            })
            .map(p => {
              const disc = parseInt(p.nume.match(/(\d+)\s*%/)![1]);
              return { ...p, disc, magazin: m.magazin, logo: m.logo_url, url_mag: m.url_afiliat };
            })
        ).sort((a, b) => b.disc - a.disc).slice(0, 8);

        if (ofertePct.length < 3) return null;
        return (
          <section className="bg-gradient-to-b from-[#ffffff] to-[#F7F9FC] border-b border-[#e2e8f0] py-10 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">REDUCERI MARI</p>
                  <h2 className="text-xl font-black text-[#0f172a]">Cele mai mari reduceri active azi</h2>
                </div>
                <Link href="/oferte-azi" className="text-xs font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors hidden sm:block">
                  Toate ofertele →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {ofertePct.map((o, i) => {
                  const link = o.landing_page || o.url_mag || "#";
                  const name = o.magazin.split(".")[0];
                  const name1 = name.charAt(0).toUpperCase() + name.slice(1);
                  return (
                    <a key={i} href={link} target="_blank" rel="sponsored noopener noreferrer"
                      className="group bg-[#ffffff] border border-[#e2e8f0] hover:border-red-500/40 rounded-xl p-4 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                          {o.logo ? (
                            <img src={o.logo} alt={name1} className="w-7 h-7 object-contain" loading="lazy"/>
                          ) : (
                            <span className="text-sm font-black text-[#0d9488]">{name1[0]}</span>
                          )}
                        </div>
                        <span className="bg-gradient-to-br from-[#34d399] to-[#14b8a6] text-[#ffffff] text-sm font-black px-2.5 py-1 rounded-lg">-{o.disc}%</span>
                      </div>
                      <p className="text-xs font-bold text-[#0f172a] mt-1">{name1}</p>
                      <p className="text-[11px] text-[#475569] line-clamp-2 leading-tight">{o.nume}</p>
                      {o.cod_cupon && (
                        <div className="mt-auto bg-[#e2e8f0] border border-dashed border-[#0d9488]/40 rounded-lg px-2 py-1 text-center">
                          <span className="font-mono font-black text-[#0d9488] text-xs tracking-widest">{o.cod_cupon}</span>
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* ─── RECOMANDATE (potential castig: comision × cerere × oferta) ──── */}
      {recomandate.length > 0 && (
        <section className="bg-[#ffffff] border-b border-[#e2e8f0] py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-2">⭐ RECOMANDATE DE NOI</p>
                <h2 className="text-3xl font-black tracking-tight text-[#0f172a]">Magazine de incredere</h2>
                <p className="text-[#475569] text-sm mt-1.5">Magazine cu oferte active, verificate zilnic</p>
              </div>
              <Link href="/toate-magazinele" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#0d9488] hover:text-[#0f766e] border border-[#14b8a6]/30 hover:border-[#0d9488]/60 bg-[#14b8a6]/10 px-4 py-2 rounded-full whitespace-nowrap transition-colors">Toate magazinele →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {recomandate.map(r => (
                <a key={r.magazin} href={`/cod-reducere/${r.magazin}`}
                  className="group bg-[#F7F9FC] border border-[#e2e8f0] hover:border-[#14b8a6]/50 rounded-xl p-4 flex flex-col items-center text-center hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-2.5 overflow-hidden shrink-0">
                    {r.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.logo_url} alt={r.nume} className="w-9 h-9 object-contain" loading="lazy" />
                    ) : (
                      <span className="text-base font-black text-[#0d9488]">{r.nume.charAt(0)}</span>
                    )}
                  </div>
                  <p className="font-black text-[#0f172a] text-xs truncate w-full group-hover:text-[#0d9488] transition-colors">{r.nume}</p>
                  <p className="text-[#64748b] text-[10px] truncate w-full mb-2">{r.categorie}</p>
                  {r.are_cod ? (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">COD ACTIV</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#0d9488] bg-[#14b8a6]/10 border border-[#14b8a6]/20 px-2 py-0.5 rounded-full">OFERTA</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTIUNI SPECIALE ─── */}
      {/* ─── MAGAZINE POPULARE (pagini brand dedicate) ───────────────────── */}
      <section className="bg-[#F7F9FC] border-b border-[#e2e8f0] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-1">MAGAZINE POPULARE</p>
              <h2 className="text-xl font-black text-[#0f172a]">Ghiduri dedicate pentru cele mai cautate magazine</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {BRAND_PAGES.map(b => (
              <Link key={b.href} href={b.href}
                className="flex items-center gap-2 bg-[#ffffff] hover:bg-[#e2e8f0] border border-[#e2e8f0] hover:border-[#14b8a6]/40 text-[#334155] hover:text-[#0f172a] rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5">
                <span className="text-base">{b.emoji}</span>
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OFERTE ACTIVE CU COD — din output.json, diverse magazine ─── */}
      {!loading && (() => {
        const cuCod = magazine
          .filter(m => m.promotii?.some((p: {zile_ramase:number;cod_cupon:string}) => p.zile_ramase >= 0 && p.cod_cupon))
          .sort((a, b) => (b.scor_final || 0) - (a.scor_final || 0))
          .slice(0, 6);
        const faraCod = magazine
          .filter(m => !cuCod.find(x => x.magazin === m.magazin) && m.promotii?.some((p: {zile_ramase:number}) => p.zile_ramase >= 0))
          .sort((a, b) => (b.scor_final || 0) - (a.scor_final || 0))
          .slice(0, 6);
        const oferte = [...cuCod, ...faraCod].slice(0, 12);
        if (oferte.length === 0) return null;
        return (
          <section className="bg-[#F7F9FC] border-b border-[#e2e8f0] py-14 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-2">🔥 CODURI ACTIVE AZI</p>
                  <h2 className="text-3xl font-black tracking-tight text-[#0f172a]">Oferte cu reducere acum</h2>
                  <p className="text-[#475569] text-sm mt-1.5">Coduri verificate de la {oferte.length} magazine — actualizate zilnic</p>
                </div>
                <Link href="/toate-magazinele" className="hidden sm:flex items-center gap-1.5 bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                  Toate ofertele
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {oferte.map((m, i) => {
                  const promo = m.promotii?.find((p: {zile_ramase:number;cod_cupon:string}) => p.zile_ramase >= 0 && p.cod_cupon)
                             || m.promotii?.find((p: {zile_ramase:number}) => p.zile_ramase >= 0);
                  const cod = promo?.cod_cupon || '';
                  const link = promo?.landing_page || m.url_afiliat || m.url || '#';
                  const titlu = (promo?.nume || `Oferta ${m.magazin.split('.')[0]}`).slice(0, 55);
                  const zile = promo?.zile_ramase ?? 0;
                  const slug = m.magazin;
                  return (
                    <Link key={i} href={`/cod-reducere/${slug}`}
                      className="group bg-[#ffffff] border border-[#e2e8f0] hover:border-[#14b8a6] rounded-xl overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-300/60 hover:-translate-y-1 duration-200 flex flex-col">
                      {/* Logo */}
                      <div className="relative bg-[#e2e8f0] flex items-center justify-center p-4" style={{aspectRatio:"1"}}>
                        {m.logo_url
                          ? <img src={m.logo_url} alt={slug}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
                          : <div className="flex flex-col items-center justify-center gap-1.5 px-2">
                              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0f766e] flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                                {slug.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-bold text-[#334155] text-[11px] text-center leading-tight line-clamp-1">{slug.split('.')[0].replace(/-/g,' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                            </div>
                        }
                        {cod && (
                          <div className="absolute top-2 left-2 bg-[#0d9488] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                            COD
                          </div>
                        )}
                        {zile <= 3 && zile >= 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {zile}z
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="p-3 flex flex-col flex-1">
                        <p className="text-[11px] text-[#64748b] mb-0.5 truncate">{slug}</p>
                        <p className="text-xs font-semibold text-[#1e293b] line-clamp-2 flex-1 group-hover:text-[#0d9488] transition-colors leading-snug">{titlu}</p>
                        {cod ? (
                          <div className="mt-2 bg-[#e2e8f0] border border-dashed border-[#14b8a6]/60 rounded-lg px-2 py-1 text-center">
                            <span className="font-black text-[#0d9488] text-[11px] tracking-widest">{cod}</span>
                          </div>
                        ) : (
                          <div className="mt-2 text-[11px] font-bold text-emerald-500">Fara cod necesar</div>
                        )}
                        <span className="mt-2 text-[11px] font-bold text-[#0d9488] group-hover:text-[#0d9488] flex items-center gap-0.5">
                          Vezi oferta
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                          </svg>
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="text-center mt-6">
                <Link href="/toate-magazinele" className="inline-flex items-center gap-2 text-[#475569] hover:text-[#0d9488] text-sm font-semibold transition-colors">
                  Vezi toate magazinele cu oferte active →
                </Link>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ─── PROMOTII + MAGAZINE ─────────────────────────────────────────── */}
      <div ref={rezultateRef} className="max-w-7xl mx-auto px-4 py-10">

        {/* BANNER CAUTARE ACTIVA */}
        {!loading && cautare && (
          <div className="bg-[#14b8a6]/10 border border-[#14b8a6]/25 rounded-xl px-5 py-3 mb-6 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[#0d9488]">
              {filtrate.length > 0
                ? <>{filtrate.length === 1 ? "1 rezultat" : `${filtrate.length} rezultate`} pentru <strong>&quot;{cautare}&quot;</strong></>
                : <>Niciun rezultat pentru <strong>&quot;{cautare}&quot;</strong> — incearca alt nume</>
              }
            </span>
            <button onClick={() => setCautare("")}
              className="text-xs text-[#0d9488] hover:text-[#0f766e] font-bold border border-[#0f766e] rounded-lg px-3 py-1 transition-colors">
              Sterge cautarea
            </button>
          </div>
        )}

        {/* FILTRE RAPIDE */}
        {!loading && (
          <div className="flex flex-wrap gap-2 mb-8 items-center">
            {([
              { key: "toate",    label: "Toate" },
              { key: "cod",      label: `Cod cupon` },
              { key: "promotie", label: `Promotii active` },
              { key: "favorite", label: `Favorite${favorite.size > 0 ? ` (${favorite.size})` : ""}` },
            ] as { key: "toate"|"cod"|"promotie"|"favorite"; label: string }[]).map(f => (
              <button key={f.key} onClick={() => { setFiltruActiv(f.key); setStoreLimit(12); }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filtruActiv === f.key ? "bg-[#ffffff] text-[#0f172a] shadow-sm" : "bg-[#e2e8f0] border border-[#cbd5e1] text-[#334155] hover:border-[#94a3b8] hover:bg-[#cbd5e1]"}`}>
                {f.label}
              </button>
            ))}
            <Link href="/toate-magazinele" className="ml-auto text-sm text-[#0d9488] hover:text-[#0f766e] font-semibold transition-colors">
              Vezi toate ({magazine.length}) →
            </Link>
          </div>
        )}

        {/* SKELETON */}
        {loading && (
          <section className="mb-10">
            <div className="h-7 w-48 bg-[#1e293b] rounded-lg animate-pulse mb-6"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i}/>)}
            </div>
          </section>
        )}

        {/* EXPIRA AZI */}
        {!loading && expiraAzi.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full animate-pulse tracking-wider">EXPIRA AZI</span>
              <h2 className="text-xl font-black text-[#0f172a] tracking-tight">Oferte care se termina azi</h2>
              <span className="text-sm text-[#475569]">{expiraAzi.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {expiraAzi.map(m => (
                <Card key={m.magazin+"_azi"} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit}/>
              ))}
            </div>
          </section>
        )}

        {/* PROMOTII ACTIVE */}
        {!loading && cuPromotii.length > 0 && (
          <section id="promotii" className="mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"/>
                  {cautare || filtruActiv !== "toate" ? "FILTRAT" : "LIVE"}
                </p>
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">
                  {cautare ? `Rezultate pentru "${cautare}"` : "Promotii active"}
                </h2>
                <p className="text-[#475569] text-sm mt-0.5">{cuPromotii.length} oferte verificate</p>
              </div>
              {!cautare && filtruActiv === "toate" && (
                <Link href="/toate-magazinele" className="hidden sm:block text-sm font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors">
                  Toate magazinele →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(cautare || filtruActiv !== "toate" ? cuPromotii : cuPromotii.slice(0, 12)).map(m => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit}/>
              ))}
            </div>
          </section>
        )}

        {/* MAGAZINE PARTENERE */}
        {!loading && faraPromotii.length > 0 && (
          <section id="magazine">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#475569] uppercase tracking-widest mb-1.5">TOATE MAGAZINELE</p>
                <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Magazine partenere</h2>
                <p className="text-[#475569] text-sm mt-0.5">
                  {cautare || filtruActiv !== "toate"
                    ? <>{faraPromotii.length} din {magazine.length} magazine</>
                    : <>{magazine.length} magazine</>
                  }
                </p>
              </div>
              <Link href="/toate-magazinele" className="text-sm font-bold text-[#0d9488] hover:text-[#0f766e] transition-colors">
                Pagina completa →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.slice(0, storeLimit).map(m => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit}/>
              ))}
            </div>
            {faraPromotii.length > storeLimit && (
              <div className="text-center mt-10">
                <button onClick={() => setStoreLimit(l => l + 24)}
                  className="bg-[#e2e8f0] border-2 border-[#cbd5e1] hover:border-[#0d9488] text-[#334155] hover:text-[#0d9488] font-bold px-8 py-3 rounded-xl text-sm transition-all hover:shadow-md">
                  Incarca mai multe ({faraPromotii.length - storeLimit} magazine ramase)
                </button>
              </div>
            )}
          </section>
        )}

        {/* EMPTY STATE — niciun rezultat */}
        {!loading && cautare && filtrate.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-[#1e293b] mb-2">Niciun magazin gasit pentru &quot;{cautare}&quot;</h3>
            <p className="text-[#475569] text-sm mb-6">Incearca un alt nume sau cauta in toate magazinele.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setCautare("")}
                className="bg-[#0d9488] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#14b8a6] transition-colors">
                Sterge cautarea
              </button>
              <Link href="/toate-magazinele"
                className="bg-[#e2e8f0] border border-[#cbd5e1] text-[#1e293b] font-bold px-6 py-2.5 rounded-xl text-sm hover:border-[#0d9488] transition-colors">
                Toate magazinele
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── BLOG ─────────────────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section className="bg-[#F7F9FC] border-t border-[#e2e8f0] py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-2">BLOG</p>
                <h2 className="text-3xl font-black tracking-tight text-[#0f172a]">Ghiduri si sfaturi</h2>
                <p className="text-[#475569] text-sm mt-1.5">Cum sa economisesti mai mult la cumparaturile online</p>
              </div>
              <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#0d9488] hover:text-[#0d9488] transition-colors">
                Toate articolele
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <a key={post.slug} href={`/blog/${post.slug}`}
                  className={`group bg-[#ffffff] rounded-xl border border-[#cbd5e1] hover:border-[#14b8a6]/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col ${i === 0 ? "md:col-span-1" : ""}`}>
                  <div className="relative overflow-hidden h-44 bg-[#e2e8f0]">
                    <Image src={post.cover} alt={post.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 380px"/>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] font-black text-[#0d9488] uppercase tracking-widest">{post.category}</span>
                    <h3 className="font-black text-[#0f172a] text-base mt-2 mb-2 line-clamp-2 group-hover:text-[#0d9488] transition-colors leading-snug tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#475569] line-clamp-2 flex-1 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 pt-4 border-t border-[#cbd5e1] flex items-center justify-between">
                      <span className="text-xs text-[#64748b]">{post.date}</span>
                      <span className="text-xs font-bold text-[#0d9488] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Citeste
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── FAQ (intrebari frecvente + structured data) ──────────────────── */}
      <section className="bg-[#F7F9FC] border-t border-[#e2e8f0] py-14 px-4">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQ_ITEMS.map(item => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            }),
          }}
        />
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[#0d9488] uppercase tracking-widest mb-2">INTREBARI FRECVENTE</p>
            <h2 className="text-3xl font-black tracking-tight text-[#0f172a]">Tot ce vrei sa stii despre codurile de reducere</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group bg-[#ffffff] rounded-xl border border-[#cbd5e1] overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none hover:bg-[#e2e8f0]/50 transition-colors">
                  <h3 className="font-bold text-[#0f172a] text-sm sm:text-base leading-snug">{item.q}</h3>
                  <svg className="w-5 h-5 text-[#0d9488] shrink-0 transition-transform duration-200 group-open:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                  </svg>
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-[#475569] leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="relative bg-[#F7F9FC] py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-[#14b8a6]/8 blur-3xl"/>
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-[#14b8a6]/8 blur-3xl"/>
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#14b8a6]/15 border border-[#14b8a6]/25 rounded-full px-4 py-1.5 text-[#0d9488] text-xs font-bold mb-6">
            Newsletter zilnic gratuit
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#0f172a] mb-3">
            Nu rata nicio oferta buna
          </h2>
          <p className="text-[#475569] text-base mb-8 max-w-sm mx-auto leading-relaxed">
            Top 5 coduri de reducere verificate in fiecare dimineata. Fara spam.
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-xs text-[#334155] mb-8 font-medium">
            {["Gratuit", "Fara spam", "Dezabonare oricand", "0 reclame"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span> {t}
              </span>
            ))}
          </div>
          <NewsletterForm/>
        </div>

        {/* Card extensie Chrome — cauta automat coduri in locul tau */}
        <div className="relative max-w-3xl mx-auto mt-12">
          <Link href="/extensie"
            className="group flex flex-col sm:flex-row items-center gap-5 bg-white border border-slate-200 hover:border-[#14b8a6]/60 rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-lg hover:shadow-[#14b8a6]/10 transition-all">
            <span className="w-14 h-14 shrink-0 rounded-xl bg-[#14b8a6]/12 flex items-center justify-center text-3xl">🧩</span>
            <span className="flex-1 text-center sm:text-left">
              <span className="block font-black text-[#0f172a] text-lg mb-1">Extensia AmCupon pentru Chrome</span>
              <span className="block text-sm text-[#475569]">Cauta automat coduri de reducere in locul tau, direct la checkout. Gratuit.</span>
            </span>
            <span className="shrink-0 bg-[#0d9488] group-hover:bg-[#14b8a6] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
              Afla mai mult →
            </span>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#F7F9FC] text-[#64748b]">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#0d9488] text-white font-black text-sm px-2 py-0.5 rounded-md tracking-tighter">Am</div>
                <span className="font-black text-[#0f172a] text-xl tracking-tight">Cupon<span className="text-[#0d9488]">.ro</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                Coduri de reducere verificate zilnic. Cel mai rapid mod de a economisi la cumparaturile online din Romania.
              </p>
              <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 text-xs mb-5 w-fit">
                <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                SSL 256-bit · GDPR Conform
              </div>
              <div className="flex items-center gap-2">
                {[
                  { label: "Facebook",  href: "https://www.facebook.com/amcupon.ro", path: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
                  { label: "Instagram", href: "https://www.instagram.com/amcupon.ro", path: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z" },
                  { label: "TikTok",    href: "https://www.tiktok.com/@amcupon.ro",  path: "M9 12a4 4 0 104 4V4a5 5 0 005 5" },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-[#0d9488] flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.path}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Categorii */}
            <div>
              <h3 className="text-[#334155] font-bold text-xs mb-4 uppercase tracking-wider">Categorii</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/categorii/fashion",           label: "Fashion" },
                  { href: "/categorii/electronice",   label: "Electronice IT&C" },
                  { href: "/categorii/beauty",            label: "Frumusete" },
                  { href: "/categorii/casa-gradina",       label: "Casa & Gradina" },
                  { href: "/categorii/sport",   label: "Sport" },
                  { href: "/categorii/sanatate",            label: "Farmacie" },
                  { href: "/categorii",                   label: "Toate categoriile →" },
                ].map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-[#0d9488] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Cautari populare */}
            <div>
              <h3 className="text-[#334155] font-bold text-xs mb-4 uppercase tracking-wider">Cautari populare</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/cod-reducere/answear.ro",      label: "Cod Answear" },
                  { href: "/cod-reducere/fashiondays.ro",  label: "Cod Fashion Days" },
                  { href: "/cod-reducere/notino.ro",       label: "Cod Notino" },
                  { href: "/cod-reducere/emag.ro",         label: "Cod eMAG" },
                  { href: "/cod-reducere/farmec.ro",       label: "Cod Farmec" },
                  { href: "/cod-reducere/noriel.ro",       label: "Cod Noriel" },
                  { href: "/cod-reducere/elefant.ro",      label: "Cod Elefant" },
                ].map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-[#0d9488] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Pagini */}
            <div>
              <h3 className="text-[#334155] font-bold text-xs mb-4 uppercase tracking-wider">Pagini speciale</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/oferte-azi",        label: "Oferte de Azi" },
                  { href: "/sanatate",          label: "Sanatate & Naturiste" },
                  { href: "/animale",           label: "Animale de Companie" },
                  { href: "/fashion",          label: "Fashion & Haine" },
                  { href: "/casa",             label: "Casa & Gradina" },
                  { href: "/farmacie",         label: "Farmacie Online" },
                  { href: "/sport",            label: "Sport & Outdoor" },
                  { href: "/frumusete",        label: "Beauty" },
                  { href: "/calatorie",        label: "Vacante & Travel" },
                  { href: "/copii",            label: "Copii & Jucarii" },
                  { href: "/gadgets",          label: "Gadgets & Tech" },
                  { href: "/idei-cadouri",     label: "Idei Cadouri" },
                  { href: "/flori",            label: "Flori & Buchete" },
                  { href: "/produse",          label: "Produse cu reducere" },
                  { href: "/blog",             label: "Blog" },
                  { href: "/categorii",        label: "Toate categoriile" },
                  { href: "/toate-magazinele", label: "Toate magazinele" },
                ].map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-[#0d9488] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-[#334155] font-bold text-xs mb-4 uppercase tracking-wider">Legal & Info</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/termeni",            label: "Termeni si Conditii" },
                  { href: "/confidentialitate",  label: "Politica de Confidentialitate" },
                  { href: "mailto:contact@amcupon.ro", label: "Contact" },
                  { href: "https://anpc.ro",     label: "ANPC", ext: true },
                  { href: "https://ec.europa.eu/consumers/odr", label: "SAL-UE", ext: true },
                  { href: "https://2performant.com", label: "2Performant", ext: true },
                ].map(l => (
                  <li key={l.href}>
                    <a href={l.href} target={l.ext ? "_blank" : undefined} rel={l.ext ? "noopener noreferrer" : undefined}
                      className="hover:text-[#0d9488] transition-colors flex items-center gap-1">
                      {l.label}
                      {l.ext && (
                        <svg className="w-2.5 h-2.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 space-y-2">
            <p className="text-xs text-[#1e293b] leading-relaxed max-w-4xl">
              Linkurile de pe AmCupon.ro sunt linkuri afiliate generate prin 2Performant. Cand accesezi un magazin partener si efectuezi o achizitie, primim un comision de la magazin fara niciun cost suplimentar pentru tine.
            </p>
            <p className="text-xs text-[#64748b]">
              &copy; {new Date().getFullYear()} AmCupon.ro &mdash; Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


/* ─── GA4 AFFILIATE TRACKING ─────────────────────────────────────────────── */
function trackAfiliat(tip: string, magazin: string, cod?: string) {
  try {
    if (typeof window !== "undefined" && (window as unknown as {gtag?: (...a: unknown[]) => void}).gtag) {
      (window as unknown as {gtag: (...a: unknown[]) => void}).gtag("event", "affiliate_click", {
        event_category: "afiliere",
        event_label: magazin,
        affiliate_type: tip,
        coupon_code: cod || "",
        value: 1,
      });
    }
  } catch {}
}

/* ─── CASHBACK HELPER ────────────────────────────────────────────────────── */
/* ─── COUNTDOWN TIMER ─────────────────────────────────────────────────────── */
function CardCountdown({ zileRamase }: { zileRamase: number }) {
  const [timeLeft, setTimeLeft] = useState("");
  useEffect(() => {
    function calc() {
      const now = new Date();
      const target = new Date();
      target.setHours(23, 59, 59, 0);
      if (zileRamase === 1) target.setDate(target.getDate() + 1);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setTimeLeft("Expirat"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    }
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [zileRamase]);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-400 bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded-full animate-pulse">
      ⏱ {zileRamase === 0 ? "Azi" : "Mâine"} {timeLeft}
    </span>
  );
}

/* ─── CARD COMPONENT ──────────────────────────────────────────────────────── */
function Card({ m, revealed, copiat, onCopiere, isFavorit, onToggleFavorit }: {
  m: Magazin;
  revealed: boolean;
  copiat: boolean;
  onCopiere: (id: string, cod: string, link?: string) => void;
  isFavorit: boolean;
  onToggleFavorit: (slug: string, e: React.MouseEvent) => void;
}) {
  const promo          = m.promotii[0];
  const logoSrc        = m.logo_url || "";
  const badgeReducere  = m.promotii.length > 0 ? maxDiscount(m.promotii) : null;
  const numeMagazin    = numeAfisat(m.magazin);
  const initiala       = numeMagazin.charAt(0).toUpperCase();
  const link           = promo?.landing_page || m.url_afiliat || m.url;
  const nrCupoane      = m.promotii.filter(p => p.cod_cupon).length;
  const nrOferte       = m.promotii.length;
  const trustScore     = m.are_promotie ? 100 : 45;

  const [imgOk, setImgOk] = useState(true);
  const [rating, setRating] = useState<"ok"|"nok"|null>(() => {
    try { return localStorage.getItem(`rating_${m.magazin}`) as "ok"|"nok"|null; } catch { return null; }
  });

  function voteaza(v: "ok"|"nok", e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setRating(v);
    try { localStorage.setItem(`rating_${m.magazin}`, v); } catch {}
  }

  const logoBg = "bg-gradient-to-br from-[#14b8a6] to-[#0f766e]";

  const expiraAzi   = promo && promo.zile_ramase === 0;
  const expiraMaine = promo && promo.zile_ramase === 1;
  const expiraCurand= promo && promo.zile_ramase <= 3 && promo.zile_ramase > 0;
  const isHot       = m.trend > 2 || (m.sales_number || 0) > 100;

  return (
    <div className={`bg-[#ffffff] rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group ${expiraAzi ? "border-red-500/50 ring-1 ring-red-500/30" : "border-[#cbd5e1]"}`}>

      {/* Trust Score bar — rosu pentru expira azi, cyan maine, verde normal */}
      <div className="h-1 bg-[#e2e8f0] overflow-hidden">
        <div className={`h-full transition-all duration-700 rounded-r-full ${expiraAzi ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse" : expiraMaine ? "bg-gradient-to-r from-[#0d9488] to-[#14b8a6]" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`} style={{width:`${trustScore}%`}}/>
      </div>

      {/* Header: logo + info + buttons */}
      <a href={`/cod-reducere/${m.magazin}`} className="flex items-start gap-3 p-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl border border-[#cbd5e1] bg-white flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[#0f766e] transition-colors">
          {logoSrc && imgOk ? (
            <img src={logoSrc} alt={numeMagazin} className="w-10 h-10 object-contain" loading="lazy" decoding="async" onError={() => setImgOk(false)}/>
          ) : (
            <div className={`w-full h-full ${logoBg} flex items-center justify-center`}>
              <span className="text-white font-black text-xl">{initiala}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <div className="min-w-0">
              <h3 className="font-black text-[#0f172a] text-sm leading-tight group-hover:text-[#0f766e] transition-colors truncate">
                {numeMagazin}
              </h3>
              <p className="text-[11px] text-[#475569] mt-0.5 truncate">{m.categorie}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 -mt-0.5">
              {isHot && !m.exclusiv && (
                <span className="text-[9px] font-black bg-red-500/15 border border-red-500/25 text-red-400 px-1.5 py-0.5 rounded-full tracking-wide">🔥 HOT</span>
              )}
              {m.exclusiv && (
                <span className="text-[9px] font-black bg-[#14b8a6]/15 border border-[#14b8a6]/25 text-[#0f766e] px-1.5 py-0.5 rounded-full tracking-wide">EXCLUSIV</span>
              )}
              <button onClick={e => onToggleFavorit(m.magazin, e)}
                className="p-1.5 rounded-full hover:bg-[#e2e8f0] transition-colors z-10"
                title={isFavorit ? "Elimina din favorite" : "Adauga la favorite"}>
                <svg className={`w-3.5 h-3.5 transition-colors ${isFavorit ? "fill-red-500 stroke-red-500" : "fill-none stroke-[#334155] hover:stroke-red-400"}`} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {badgeReducere && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-1.5 py-0.5 rounded-full">
                {badgeReducere}
              </span>
            )}
            {!badgeReducere && m.are_promotie && (
              <span className="text-[10px] font-bold text-[#0d9488] bg-[#14b8a6]/15 border border-[#14b8a6]/25 px-1.5 py-0.5 rounded-full">
                Oferta activa
              </span>
            )}
            {m.cod_cupon && (
              <span className="text-[10px] font-semibold text-[#0d9488] bg-[#14b8a6]/15 border border-[#14b8a6]/25 px-1.5 py-0.5 rounded-full">
                Cod cupon
              </span>
            )}
            {m.trend > 0 && (
              <span className="text-[10px] font-semibold text-[#0f766e] bg-[#14b8a6]/10 px-1.5 py-0.5 rounded-full">
                Trending
              </span>
            )}
          </div>
        </div>
      </a>

      {/* Promo description */}
      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">{promo.nume}</p>
        ) : (
          <p className="text-xs text-[#475569] italic">Fara promotii active momentan</p>
        )}
      </div>

      {/* Trust indicators */}
      <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
        {m.are_promotie && (
          <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
            Verificat azi
          </div>
        )}
        {expiraAzi && <CardCountdown zileRamase={0} />}
        {expiraMaine && <CardCountdown zileRamase={1} />}
        {expiraCurand && !expiraAzi && !expiraMaine && (
          <span className="text-[10px] font-bold text-[#0f766e] bg-[#14b8a6]/15 border border-[#14b8a6]/25 px-1.5 py-0.5 rounded-full">
            ⏳ {promo!.zile_ramase}z ramase
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-[#0d9488] rounded-xl py-2.5 text-center bg-[#14b8a6]/10">
                <span className="font-mono font-black text-[#0d9488] tracking-widest text-sm">{promo.cod_cupon}</span>
              </div>
              <a href={link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {copiat ? "Copiat! Mergi la magazin" : "Mergi la magazin →"}
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-[#cbd5e1] rounded-xl py-2.5 text-center bg-[#e2e8f0]">
                <span className="font-mono text-[#475569] text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button onClick={() => onCopiere(m.magazin, promo.cod_cupon, link)}
                className="w-full bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Copiaza codul + mergi la magazin
              </button>
            </div>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-[#0d9488] hover:bg-[#14b8a6] text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
            Vezi oferta →
          </a>
        ) : (
          <a href={m.url_afiliat || m.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-full font-medium py-2.5 rounded-xl text-sm transition-colors border border-[#cbd5e1] hover:border-[#0d9488] text-[#475569] hover:text-[#0d9488]">
            Viziteaza magazinul
          </a>
        )}
      </div>

      {/* Voting */}
      {promo && (
        <div className="px-4 pb-4 border-t border-[#e2e8f0] pt-3">
          {rating ? (
            <p className="text-[11px] text-center font-semibold text-emerald-400">
              {rating === "ok" ? "Multumim pentru feedback!" : "Am notat, verificam!"}
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] text-[#475569]">A functionat codul?</span>
              <button onClick={e => voteaza("ok", e)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 font-semibold transition-colors border border-emerald-500/30">
                Da
              </button>
              <button onClick={e => voteaza("nok", e)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[#e2e8f0] text-[#475569] hover:bg-red-500/15 hover:text-red-400 font-semibold transition-colors border border-[#cbd5e1] hover:border-red-500/30">
                Nu
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── SKELETON ────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] animate-pulse overflow-hidden">
      <div className="h-1 bg-[#e2e8f0]"/>
      <div className="flex items-start gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-[#cbd5e1] shrink-0"/>
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 w-28 bg-[#cbd5e1] rounded"/>
          <div className="h-3 w-16 bg-[#e2e8f0] rounded"/>
          <div className="flex gap-1">
            <div className="h-4 w-20 bg-[#e2e8f0] rounded-full"/>
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-1.5">
        <div className="h-3 w-full bg-[#e2e8f0] rounded"/>
        <div className="h-3 w-3/4 bg-[#e2e8f0] rounded"/>
      </div>
      <div className="px-4 pb-4">
        <div className="h-10 w-full bg-[#cbd5e1] rounded-xl"/>
      </div>
    </div>
  );
}

/* ─── NEWSLETTER FORM ─────────────────────────────────────────────────────── */
function NewsletterForm() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setErrMsg("Adresa de email invalida.");
      setStatus("err");
      return;
    }
    setStatus("loading");
    setErrMsg("");
    try {
      const res  = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        // Mesaj clar in loc de generic
        setErrMsg(
          data.error ||
          (res.status === 503 ? "Newsletter in configurare — revino curand!" : "Eroare. Incearca din nou.")
        );
        setStatus("err");
      }
    } catch {
      setErrMsg("Eroare de retea. Verifica conexiunea.");
      setStatus("err");
    }
  }

  if (status === "ok") {
    return (
      <div className="bg-slate-100 backdrop-blur-sm rounded-xl px-8 py-6 text-[#0f172a] text-center border border-slate-200">
        <p className="font-black text-xl mb-1">Multumim!</p>
        <p className="text-sm text-[#475569]">Te-ai abonat cu succes. Vei primi ofertele zilei pe email.</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={trimite} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
          placeholder="adresa@email.ro" disabled={status === "loading"}
          className="flex-1 px-4 py-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[#0f172a] text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/50 focus:border-[#14b8a6]/40 disabled:opacity-60 transition-all"/>
        <button type="submit" disabled={status === "loading"}
          className="bg-[#0d9488] hover:bg-[#14b8a6] disabled:opacity-60 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors whitespace-nowrap shadow-lg shadow-[#14b8a6]/25">
          {status === "loading" ? "Se trimite..." : "Aboneaza-te"}
        </button>
      </form>
      {status === "err" && errMsg && (
        <p className="text-slate-500 text-xs mt-2 text-center">{errMsg}</p>
      )}
    </div>
  );
}
