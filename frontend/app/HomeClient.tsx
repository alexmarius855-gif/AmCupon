"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import CategoryIcon, { categoryVisual, TEXT_PE_CATEGORIE } from "./components/CategoryIcon";
import MagazinCard from "./components/MagazinCard";
import { REDUCERI } from "./components/Footer";
import FiltreRapide, { trecePrinFiltru, type CheieFiltru } from "./components/FiltreRapide";

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
  ultima_verificare?: string;
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
  { slug: "sanatate",        emoji: "💊", label: "Sănătate & Farmacie",desc: "Farmacie, suplimente, optică",   accent: "#ddf93c" },
  { slug: "software",        emoji: "🖥️", label: "Software & Digital",  desc: "VPN, hosting, AI, aplicații",    accent: "#6366f1" },
  { slug: "sport",           emoji: "🏃", label: "Sport & Fitness",    desc: "Echipament sportiv & fitness",   accent: "#4ade80" },
  { slug: "copii",           emoji: "👶", label: "Copii & Familie",    desc: "Jucării, bebe, îmbrăcăminte",    accent: "#c084fc" },
  { slug: "calatorii",       emoji: "✈️", label: "Călătorii",          desc: "Cazare, zboruri, eSIM",          accent: "#0ea5e9" },
  { slug: "auto-moto",       emoji: "🚗", label: "Auto & Moto",        desc: "Piese, anvelope, accesorii",     accent: "#e64343" },
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

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
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
  astazi: string;
}

export default function HomeClient({
  magazine: initMag,
  blogPosts: initBlog,
  recomandate: initRec,
  produseCategorii: initProd,
  astazi,
}: HomeClientProps) {
  const [magazine]                        = useState<Magazin[]>(initMag);
  const [blogPosts]                       = useState<BlogPost[]>(initBlog);
  const [loading]                         = useState(initMag.length === 0);
  const [cautare, setCautare]             = useState("");
  const [coduriReveal, setCoduriReveal]   = useState<Set<string>>(new Set());
  const [copiat, setCopiat]               = useState<string | null>(null);
  const [menuOpen, setMenuOpen]           = useState(false);
  // 24, nu 12: de cand magazinele fara promotie se randeaza ca placi compacte
  // (nu carduri mari), incap de doua ori mai multe in mai putin spatiu.
  const [storeLimit, setStoreLimit]       = useState(24);
  const [filtruActiv, setFiltruActiv]     = useState<CheieFiltru | "favorite">("toate");
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

  useEffect(() => {
    // Reveal la scroll — un singur observer pentru toate sectiunile .reveal,
    // manipulare directa de clasa DOM (nu re-render React) ca sa nu coste TBT.
    const els = document.querySelectorAll(".reveal");
    if (!els.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [loading]);

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
    if (filtruActiv === "favorite")  return favorite.has(m.magazin);
    // BUG REPARAT 16.08: filtrul "cod" folosea flagul `m.cod_cupon`, dar temu.com/
    // shein.com/trendyol.com au flagul true cu ZERO coduri reale (documentat in
    // CLAUDE.md). Filtrul promitea coduri si livra magazine fara. `trecePrinFiltru`
    // se uita in promotii, la codul efectiv.
    return trecePrinFiltru(m, filtruActiv as CheieFiltru);
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
    <div className="gold-home min-h-screen bg-[#06080b]">
      <style>{`
        .gold-home h1, .gold-home h2 { font-family: var(--font-display), Georgia, "Times New Roman", serif; letter-spacing: -0.015em; }
        @media (prefers-reduced-motion: no-preference) {
          .gold-home .reveal { opacity: 0; transform: translateY(18px); transition: opacity .6s ease, transform .6s ease; }
          .gold-home .reveal.is-visible { opacity: 1; transform: none; }
        }
      `}</style>
      {/* Fara JS (ad-blocker, eroare hidratare) -> IntersectionObserver nu mai adauga is-visible.
          Fara acest fallback continutul ar ramane opacity:0 permanent. */}
      <noscript><style>{`.gold-home .reveal { opacity: 1 !important; transform: none !important; }`}</style></noscript>
      {/* ─── BUTON FLOTANT PRODUSE (burtiera) ─────────────────────────────── */}
      <Link
        href="/produse"
        aria-label="Vezi produsele cu reducere"
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 bg-gradient-to-r from-[#ddf93c] to-[#c3dd2c] hover:from-[#ddf93c] hover:to-[#ddf93c] text-[#0c1000] font-black pl-4 pr-5 py-3 rounded-full shadow-2xl shadow-[#ddf93c]/50 ring-2 ring-[#c3dd2c]/40 transition-all duration-300 hover:scale-105 ${showFab ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}`}
      >
        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#1f2329] text-lg">
          🛍️
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-[#ddf93c] animate-pulse" />
        </span>
        <span className="text-sm leading-tight text-left">Produse cu<br/>reducere</span>
        <span className="bg-[#1f2329] text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide">HOT</span>
        <span className="text-lg">→</span>
      </Link>


      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <header className="bg-[#14181c]/95 backdrop-blur-sm border-b border-[#2a2f36] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center gap-3">

          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-[#ddf93c] text-[#0c1000] font-black text-sm px-2 py-0.5 rounded-lg tracking-tighter">Am</div>
            <span className="font-black text-[#ffffff] text-xl tracking-tight">Cupon<span className="text-[#ddf93c]">.ro</span></span>
          </Link>

          {/* Cautarea e elementul central al header-ului, ca in referinta: pilula
              lata, inalta, cu placeholder care spune CE poti cauta (magazine sau
              cupoane), nu doar exemple de branduri. */}
          <div className="flex-1 relative max-w-2xl hidden sm:block group/search">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6b7178] group-focus-within/search:text-[#ddf93c] transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Caută magazine sau cupoane..." value={cautare}
              onChange={e => { setCautare(e.target.value); setMenuOpen(false); }}
              className="w-full bg-[#1f2329] border border-[#2a2f36] hover:border-[#3a4048] text-[#ffffff] placeholder-[#6b7178] rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ddf93c] focus:ring-2 focus:ring-[#ddf93c]/25 transition-all" />
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-[#c9ced5] ml-auto">
            <Link href="/oferte-azi" className="flex items-center gap-1 text-[#ddf93c] hover:text-[#c3dd2c] transition-colors font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c] animate-pulse" />
              Oferte azi
            </Link>
            <Link href="/produse"  className="hover:text-[#ddf93c] transition-colors">Produse</Link>
            <Link href="/blog"     className="hover:text-[#ddf93c] transition-colors">Blog</Link>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-[#ddf93c] transition-colors py-1">
                Categorii
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 w-60">
                <div className="bg-[#14181c] border border-[#2a2f36] rounded-xl shadow-xl py-2">
                  {categoriiSortate.slice(0, 8).map(c => (
                    <a key={c.slug} href={`/categorii/${c.slug}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-[#c9ced5] hover:bg-[#ddf93c]/15 hover:text-[#ddf93c] transition-colors">
                      <CategoryIcon slug={c.slug} size="sm" />
                      <span className="font-medium">{c.label}</span>
                      {promoPerCateg[c.slug] > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-[#2a2f10] text-[#c3dd2c] px-1.5 py-0.5 rounded-full">{promoPerCateg[c.slug]}</span>
                      )}
                    </a>
                  ))}
                  <div className="border-t border-[#1f2329] mt-1 pt-1">
                    <Link href="/categorii" className="flex items-center px-4 py-2 text-sm font-bold text-[#ddf93c] hover:bg-[#ddf93c]/15 transition-colors">
                      Toate categoriile →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <button onClick={() => setMenuOpen(o => !o)}
            className="md:hidden ml-auto p-2 rounded-xl hover:bg-[#1f2329] transition-colors text-[#c9ced5]" aria-label="Meniu">
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
          <div className="md:hidden border-t border-[#1f2329] bg-[#14181c]">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              <div className="relative">
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-[#c9ced5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Cauta magazin..." value={cautare}
                  onChange={e => setCautare(e.target.value)}
                  className="w-full bg-[#1f2329] border border-[#2a2f36] text-[#ffffff] placeholder-[#9399a0] rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ddf93c]" />
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
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-[#c9ced5] hover:bg-[#1f2329] hover:text-[#ddf93c] transition-colors">
                    {l.label}
                  </a>
                ))}
              </nav>
              <div>
                <p className="text-xs font-bold text-[#c9ced5] uppercase tracking-wider px-1 mb-3">Categorii populare</p>
                <div className="grid grid-cols-4 gap-2">
                  {categoriiSortate.slice(0, 8).map(c => (
                    <a key={c.slug} href={`/categorii/${c.slug}`} onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-[#2a2f36] bg-[#1f2329] hover:border-[#ddf93c] transition-colors">
                      <CategoryIcon slug={c.slug} size="sm" />
                      <span className="text-[10px] font-semibold text-[#c9ced5] text-center leading-tight">{c.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#06080b] text-[#ffffff] overflow-hidden">
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
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-[#c9ced5] mb-8">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-[#ecff7a] opacity-60 animate-ping"/>
              <span className="relative inline-flex w-2 h-2 rounded-full bg-[#ddf93c]"/>
            </span>
            {cuPromotii.length > 0 ? `${cuPromotii.length} oferte verificate astazi` : "Sute de oferte verificate zilnic"}
          </div>

          {/* H1 */}
          <h1 className="text-[2.5rem] md:text-[3.75rem] font-black tracking-tight leading-[1.08] mb-6">
            <span className="text-[#ffffff]">Gaseste coduri de reducere</span><br/>
            <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #c3dd2c 0%, #10b981 100%)"}}>
              verificate inainte sa cumperi
            </span>
          </h1>

          <p className="text-[#c9ced5] text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            {magazine.length > 0 ? `Peste ${magazine.length}` : "Peste 1000"} magazine partenere, verificate zilnic. 100% gratuit.
          </p>

          {/* Cautare eliminata din hero (08.08.2026): scrollIntoView pe fiecare litera
              tastata facea pagina sa sara continuu cat timp scriai — se simtea ca un bug,
              nu era. Cautarea reala ramane in bara de sus (header) si in meniul mobil,
              legate de aceeasi stare `cautare`, fara acest defect. */}

          {/* Quick chips — magazine populare, un click distanta */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <span className="text-xs text-[#9399a0] font-medium mr-1">Populare:</span>
            {[
              { nume: "Notino",      slug: "notino.ro" },
              { nume: "Dr.Max",      slug: "drmax.ro" },
              { nume: "Noriel",      slug: "noriel.ro" },
            ].map(c => (
              <Link key={c.slug} href={`/cod-reducere/${c.slug}`}
                className="glass hover:border-[#ddf93c]/60 hover:text-[#ecff7a] text-[#c9ced5] text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all hover:-translate-y-0.5">
                {c.nume}
              </Link>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <a href="#promotii"
              className="bg-gradient-to-r from-[#ddf93c] to-[#ddf93c] hover:from-[#ecff7a] hover:to-[#ddf93c] text-[#0c1000] hover:text-[#0c1000] font-black px-7 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-[#ddf93c]/25 hover:shadow-[#ddf93c]/45 hover:-translate-y-0.5 duration-200">
              Coduri active acum →
            </a>
            <Link href="/newsletter"
              className="glass hover:border-[#ddf93c]/50 text-[#ffffff] font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 hover:-translate-y-0.5 inline-flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#ecff7a]" /> Top reduceri pe email
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-[#9399a0] font-medium">
            <span className="flex items-center gap-1.5"><span className="text-[#ddf93c]">✓</span> Gratuit, fara cont</span>
            <span className="flex items-center gap-1.5"><span className="text-[#ddf93c]">✓</span> {magazine.length > 0 ? `${magazine.length}+` : "380+"} magazine</span>
            <span className="flex items-center gap-1.5"><span className="text-[#ddf93c]">✓</span> Actualizat zilnic automat</span>
            <span className="flex items-center gap-1.5"><span className="text-[#ddf93c]">✓</span> 0 reclame invazive</span>
          </div>
        </div>
      </section>

      {/* ─── BARA CATEGORII (stil Kuplio — mereu vizibila, orizontala) ──────── */}
      <section className="relative z-20 bg-[#14181c] border-y border-[#1f2329] shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex items-center gap-1 overflow-x-auto py-2.5" style={{ scrollbarWidth: "none" }}>
            {CATEGORII.map(c => (
              <a key={c.slug} href={`/categorii/${c.slug}`}
                className="group shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-[#c9ced5] hover:text-[#F7F9FC] hover:bg-gradient-to-br hover:from-[#c3dd2c] hover:to-[#ddf93c] transition-all whitespace-nowrap">
                <CategoryIcon slug={c.slug} size="sm" />
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY GRID (colorat, printre primele — recunoastere instanta) ── */}
      <section id="categorii" className="reveal bg-[#14181c] border-b border-[#1f2329] py-14 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-2">CATEGORII</p>
              <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.08] font-black tracking-tight text-[#ffffff]">Exploreaza dupa categorie</h2>
              <p className="text-[#c9ced5] text-sm mt-1.5">Coduri verificate zilnic in fiecare categorie</p>
            </div>
            <Link href="/categorii" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c] transition-colors border border-[#ddf93c]/30 hover:border-[#ddf93c]/60 bg-[#ddf93c]/10 hover:bg-[#ddf93c]/20 px-4 py-2 rounded-full whitespace-nowrap">
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
              // Culoarea vine din cele 5 familii cromatice (CategoryIcon.tsx), NU din
              // vechiul `c.accent` — acela avea 16 nuante independente si producea
              // exact "curcubeul" pe care CLAUDE.md il declara eliminat pe 30.06.
              const accent = categoryVisual(c.slug).color;
              return (
                <a
                  key={c.slug}
                  href={`/categorii/${c.slug}`}
                  className="group relative rounded-xl overflow-hidden bg-[#14181c] border border-[#1f2329] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40"
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${accent}66`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
                >
                  {/* Tenta discreta — sugereaza familia, nu striga. Fara glow saturat. */}
                  <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(155deg, ${accent}12 0%, transparent 60%)` }} />

                  <div className="relative p-5 flex flex-col gap-3 min-h-[140px]">
                    {/* Badge oferte */}
                    {nrPromo > 0 ? (
                      <div className="inline-flex self-start items-center gap-1 px-2 py-0.5 rounded-full border" style={{ background: `${accent}1a`, borderColor: `${accent}44` }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
                        <span className="text-[10px] font-bold" style={{ color: accent }}>{nrPromo} {nrPromo === 1 ? "oferta" : "oferte"}</span>
                      </div>
                    ) : (
                      <div className="inline-flex self-start bg-[#1f2329] px-2 py-0.5 rounded-full">
                        <span className="text-[#c9ced5] text-[10px]">Vezi magazine</span>
                      </div>
                    )}

                    {/* Iconita vectoriala (Lucide), nu emoji — vezi CategoryIcon.tsx */}
                    <div className="group-hover:scale-105 transition-transform duration-300 origin-left">
                      <CategoryIcon slug={c.slug} size="lg" />
                    </div>

                    {/* Nume + descriere */}
                    <div>
                      <div className="text-[#ffffff] font-black text-sm leading-tight">{c.label}</div>
                      <div className="text-[#c9ced5] text-[10px] mt-0.5 leading-tight">{c.desc}</div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 text-[#9399a0] group-hover:text-[#ffffff] group-hover:gap-2 transition-all text-[10px] font-bold">
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
                  className="group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl overflow-hidden bg-[#14181c]/60 border border-[#1f2329] transition-all duration-200 hover:-translate-y-0.5"
                  onMouseEnter={e => (e.currentTarget.style.borderColor = `${categoryVisual(c.slug).color}66`)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">
                    <CategoryIcon slug={c.slug} size="md" />
                  </span>
                  <span className="text-[10px] font-bold text-[#c9ced5] text-center leading-tight">{c.label}</span>
                  {nrPromo > 0 && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm" style={{ background: categoryVisual(c.slug).color, color: TEXT_PE_CATEGORIE }}>
                      {nrPromo > 9 ? "9+" : nrPromo}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <Link href="/categorii" className="sm:hidden mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-[#ddf93c] border border-[#ddf93c]/30 bg-[#ddf93c]/10 py-2.5 rounded-xl">
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
          <section className="relative bg-[#06080b] border-b border-[#1f2329] py-8 overflow-hidden">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9399a0] mb-6">
              Coduri verificate pentru magazinele tale preferate
            </p>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none" style={{background:"linear-gradient(90deg, #06080b 10%, transparent)"}} />
              <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none" style={{background:"linear-gradient(270deg, #06080b 10%, transparent)"}} />
              <div className="marquee-track flex items-center gap-4 w-max">
                {row.map((m, i) => (
                  <a key={`${m.magazin}-${i}`} href={`/cod-reducere/${m.magazin}`} aria-hidden={i >= logos.length}
                    className="shrink-0 w-28 h-16 rounded-xl bg-[#ffffff] border border-[#1f2329] hover:border-[#ddf93c]/60 flex items-center justify-center p-3 transition-colors">
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
          <div className="bg-[#14181c]/80 border-b border-[#1f2329] py-4 px-4">
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
                    <span className="font-black text-[#ffffff] text-base">{s.val}</span>
                    <span className="text-[#9399a0] ml-1.5 text-xs">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* placeholder pentru a inchide sectiunea corecta daca loading */}
      {loading && <div className="h-[53px] bg-[#14181c]/80 border-b border-[#1f2329]" />}

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
          <section className="reveal bg-[#06080b] border-b border-[#1f2329] py-12 px-4">
            <div className="max-w-5xl mx-auto">
              {/* Un SINGUR spotlight de "oferta zilei". Pana pe 08.08.2026 existau doua
                  sectiuni separate — "Oferta zilei" (aici) si "Deal zilei" (~200 linii mai
                  jos) — care alegeau magazine DIFERITE si pretindeau amandoua ca sunt
                  oferta zilei. Mesaj incoerent pentru vizitator. Pastrata aceasta (selectia
                  ei prefera ofertele cu link de afiliat real, deci si monetizarea e mai
                  buna), absorbit de la cealalta doar semnalul de urgenta REALA. */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <p className="text-xs font-black text-[#ddf93c] uppercase tracking-widest">⭐ Oferta zilei</p>
                {expiraAzi.length > 0 && (
                  <Link href="/oferte-azi" className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors">
                    {expiraAzi.length === 1 ? "1 ofertă expiră azi" : `${expiraAzi.length} oferte expiră azi`} →
                  </Link>
                )}
              </div>
              <div className="relative overflow-hidden rounded-xl border border-[#ddf93c]/30 bg-gradient-to-br from-[#14181c]/60 via-[#14181c] to-[#14181c] p-6 sm:p-8">
                <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{background:"radial-gradient(circle, rgba(20,184,166,0.14), transparent 70%)"}} />
                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-28 h-28 rounded-xl bg-[#ffffff] flex items-center justify-center p-3 shrink-0 shadow-xl">
                    {best.logo_url
                      // eslint-disable-next-line @next/next/no-img-element -- domenii logo externe variate, nu merita config remotePatterns doar pt acest card
                      ? <img src={best.logo_url} alt={nume} className="max-w-full max-h-full object-contain" />
                      : <span className="text-4xl font-black text-[#ddf93c]">{nume.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 mb-2 flex-wrap">
                      <span className="font-black text-[#ffffff] text-2xl">{nume}</span>
                      {disc && <span className="text-xs font-black text-[#0c1000] bg-[#ddf93c] px-2.5 py-1 rounded-full">-{disc}</span>}
                      {(best.zile_ramase ?? 9) <= 2 && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full">expira curand</span>}
                    </div>
                    <p className="text-[#c9ced5] text-sm mb-5 max-w-md mx-auto sm:mx-0 line-clamp-2">{promo.nume}</p>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {cod && (
                        <button onClick={() => copiazaCod(best.magazin, cod, link)}
                          className="group flex items-center gap-2 bg-[#1f2329] border-2 border-dashed border-[#ddf93c]/50 hover:border-[#ddf93c] rounded-xl px-4 py-2.5 transition-colors">
                          <span className="font-mono font-black text-[#ddf93c] tracking-widest text-sm">{revealed ? cod : cod.slice(0, 3) + "•••"}</span>
                          <span className="text-[10px] text-[#9399a0] group-hover:text-[#ddf93c]">{copiat === best.magazin ? "✓ copiat" : "copiaza"}</span>
                        </button>
                      )}
                      <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                        onClick={() => trackAfiliat("spotlight_cta", best.magazin, cod)}
                        className="bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#ddf93c]/25 hover:-translate-y-0.5 duration-200">
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
        <section className="bg-[#14181c] border-b border-[#1f2329] py-14 px-4">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-2">PRODUSE CU REDUCERE</p>
                <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.08] font-black tracking-tight text-[#ffffff]">Produse pe categorii</h2>
                <p className="text-[#c9ced5] text-sm mt-1.5">Cele mai bune oferte, organizate pe nise</p>
              </div>
              <Link href="/produse" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c] border border-[#ddf93c]/30 hover:border-[#ddf93c]/60 bg-[#ddf93c]/10 hover:bg-[#ddf93c]/20 px-4 py-2 rounded-full whitespace-nowrap transition-all">
                Toate produsele →
              </Link>
            </div>

            {/* Tab pills — filtre categorie */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-9 -mx-4 px-4" style={{scrollbarWidth:"none"}}>
              <button
                onClick={() => setActiveCatTab("toate")}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeCatTab === "toate" ? "bg-[#ddf93c] text-[#0c1000] shadow-lg shadow-[#ddf93c]/30" : "bg-[#1f2329] text-[#c9ced5] hover:bg-[#2a2f36] border border-[#2a2f36]/80"}`}
              >
                🛍️ Toate
              </button>
              {produseCategorii.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCatTab(cat.slug)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${activeCatTab === cat.slug ? "bg-[#ddf93c] text-[#0c1000] shadow-lg shadow-[#ddf93c]/30" : "bg-[#1f2329] text-[#c9ced5] hover:bg-[#2a2f36] border border-[#2a2f36]/80"}`}
                >
                  <CategoryIcon slug={cat.slug} size="sm" /> {cat.label}
                </button>
              ))}
            </div>

            {/* Continut: randuri orizontale (mod Toate) sau grid (mod categorie).
                Doar primele 4 randuri in modul "Toate" (08.08.2026): sectiunea ocupa
                2584px = 3,6 ecrane, adica 23% din toata pagina, cu 6 randuri stivuite.
                Restul categoriilor raman accesibile prin taburile de deasupra si prin
                /produse — nu se pierde nimic, doar nu se descarca tot pe prima pagina. */}
            {activeCatTab === "toate" ? (
              <div className="space-y-10">
                {produseCategorii.slice(0, 4).map(cat => (
                  <div key={cat.slug}>
                    {/* Header rand */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon slug={cat.slug} size="md" />
                        <h3 className="text-lg font-black text-[#ffffff]">{cat.label}</h3>
                        <span className="text-xs text-[#9399a0] font-medium">{cat.products.length} produse</span>
                      </div>
                      <button
                        onClick={() => setActiveCatTab(cat.slug)}
                        className="text-xs font-bold text-[#ddf93c] hover:text-[#c3dd2c] transition-colors flex items-center gap-1 border border-[#ddf93c]/20 hover:border-[#ddf93c]/40 px-3 py-1 rounded-full bg-[#ddf93c]/5 hover:bg-[#ddf93c]/10"
                      >
                        Vezi toate →
                      </button>
                    </div>
                    {/* Scroll orizontal */}
                    <div className="overflow-x-auto -mx-4 px-4 pb-2" style={{scrollbarWidth:"none"}}>
                      <div className="flex gap-3" style={{minWidth:"max-content"}}>
                        {cat.products.map((p, i) => (
                          <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                            className="group flex-shrink-0 w-44 bg-[#1f2329] border border-[#2a2f36] hover:border-[#ddf93c]/50 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-200">
                            <div className="relative w-full aspect-square bg-[#2a2f36] overflow-hidden">
                              <Image src={p.image} alt={p.title} fill sizes="176px"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={e => { const el = (e.target as HTMLImageElement).closest("a"); if (el) el.style.display = "none"; }}
                              />
                              {p.discount_pct > 0 && (
                                <div className="absolute top-2 left-2 bg-gradient-to-br from-[#34d399] to-[#ddf93c] text-[#0c1000] text-[10px] font-black px-1.5 py-0.5 rounded-lg shadow-md">
                                  -{p.discount_pct}%
                                </div>
                              )}
                            </div>
                            <div className="p-2.5">
                              <p className="text-[9px] text-[#9399a0] mb-0.5 truncate font-medium">{p.merchant.replace(".ro","").replace(".com","")}</p>
                              <p className="text-xs font-semibold text-[#c9ced5] line-clamp-2 leading-snug group-hover:text-[#ddf93c] transition-colors mb-1.5">{p.title}</p>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-sm font-black text-[#ddf93c]">{p.price.toLocaleString("ro-RO")} lei</span>
                                {p.old_price && p.old_price > p.price && (
                                  <span className="text-[10px] text-[#9399a0] line-through">{p.old_price.toLocaleString("ro-RO")}</span>
                                )}
                              </div>
                            </div>
                          </a>
                        ))}
                        {/* Card "Toate" la finalul randului */}
                        <button
                          onClick={() => setActiveCatTab(cat.slug)}
                          className="flex-shrink-0 w-32 bg-[#1f2329]/60 border border-dashed border-[#2a2f36] hover:border-[#ddf93c]/40 rounded-xl flex flex-col items-center justify-center gap-2.5 hover:bg-[#1f2329] transition-all duration-200 group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#ddf93c]/15 flex items-center justify-center group-hover:bg-[#ddf93c]/25 transition-colors">
                            <svg className="w-5 h-5 text-[#ddf93c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                          </div>
                          <span className="text-xs font-bold text-[#c9ced5] group-hover:text-[#ddf93c] text-center px-2 leading-tight transition-colors">Toate {cat.label}</span>
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
                        className="group bg-[#1f2329] border border-[#2a2f36] hover:border-[#ddf93c]/50 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 transition-all duration-200">
                        <div className="relative aspect-square bg-[#2a2f36] overflow-hidden">
                          <Image src={p.image} alt={p.title} fill
                            sizes="(min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { const el = (e.target as HTMLImageElement).closest("a"); if (el) el.style.display = "none"; }}
                          />
                          {p.discount_pct > 0 && (
                            <div className="absolute top-2 left-2 bg-gradient-to-br from-[#34d399] to-[#ddf93c] text-[#0c1000] text-[11px] font-black px-2 py-0.5 rounded-lg shadow-md">
                              -{p.discount_pct}%
                            </div>
                          )}
                        </div>
                        <div className="p-3.5">
                          <p className="text-[10px] text-[#9399a0] mb-0.5 truncate font-medium">{p.merchant.replace(".ro","").replace(".com","")}</p>
                          <p className="text-sm font-semibold text-[#c9ced5] line-clamp-2 leading-snug group-hover:text-[#ddf93c] transition-colors mb-2">{p.title}</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-black text-[#ddf93c]">{p.price.toLocaleString("ro-RO")} lei</span>
                            {p.old_price && p.old_price > p.price && (
                              <span className="text-xs text-[#9399a0] line-through">{p.old_price.toLocaleString("ro-RO")}</span>
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
              <Link href="/produse" className="inline-flex items-center gap-2 text-sm font-bold text-[#c9ced5] hover:text-[#ddf93c] transition-colors">
                Toate produsele cu reducere →
              </Link>
            </div>
          </div>
        </section>
      )}

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
          <section className="reveal bg-gradient-to-b from-[#14181c] to-[#06080b] border-b border-[#1f2329] py-10 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">REDUCERI MARI</p>
                  <h2 className="text-xl font-black text-[#ffffff]">Cele mai mari reduceri active azi</h2>
                </div>
                <Link href="/oferte-azi" className="text-xs font-bold text-[#ddf93c] hover:text-[#c3dd2c] transition-colors hidden sm:block">
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
                      className="group bg-[#14181c] border border-[#1f2329] hover:border-red-500/40 rounded-xl p-4 flex flex-col gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-[#ffffff] flex items-center justify-center shrink-0">
                          {o.logo ? (
                            <img src={o.logo} alt={name1} className="w-7 h-7 object-contain" loading="lazy"/>
                          ) : (
                            <span className="text-sm font-black text-[#ddf93c]">{name1[0]}</span>
                          )}
                        </div>
                        <span className="bg-gradient-to-br from-[#34d399] to-[#ddf93c] text-[#0c1000] text-sm font-black px-2.5 py-1 rounded-lg">-{o.disc}%</span>
                      </div>
                      <p className="text-xs font-bold text-[#ffffff] mt-1">{name1}</p>
                      <p className="text-[11px] text-[#c9ced5] line-clamp-2 leading-tight">{o.nume}</p>
                      {o.cod_cupon && (
                        <div className="mt-auto bg-[#1f2329] border border-dashed border-[#ddf93c]/40 rounded-lg px-2 py-1 text-center">
                          <span className="font-mono font-black text-[#ddf93c] text-xs tracking-widest">{o.cod_cupon}</span>
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
        <section className="bg-[#14181c] border-b border-[#1f2329] py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-2">⭐ RECOMANDATE DE NOI</p>
                <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.08] font-black tracking-tight text-[#ffffff]">Magazine de incredere</h2>
                <p className="text-[#c9ced5] text-sm mt-1.5">Magazine cu oferte active, verificate zilnic</p>
              </div>
              <Link href="/toate-magazinele" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c] border border-[#ddf93c]/30 hover:border-[#ddf93c]/60 bg-[#ddf93c]/10 px-4 py-2 rounded-full whitespace-nowrap transition-colors">Toate magazinele →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {recomandate.map(r => (
                <a key={r.magazin} href={`/cod-reducere/${r.magazin}`}
                  className="group bg-[#06080b] border border-[#1f2329] hover:border-[#ddf93c]/50 rounded-xl p-4 flex flex-col items-center text-center hover:-translate-y-0.5 transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-[#ffffff] flex items-center justify-center mb-2.5 overflow-hidden shrink-0">
                    {r.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.logo_url} alt={r.nume} className="w-9 h-9 object-contain" loading="lazy" />
                    ) : (
                      <span className="text-base font-black text-[#ddf93c]">{r.nume.charAt(0)}</span>
                    )}
                  </div>
                  <p className="font-black text-[#ffffff] text-xs truncate w-full group-hover:text-[#ddf93c] transition-colors">{r.nume}</p>
                  <p className="text-[#9399a0] text-[10px] truncate w-full mb-2">{r.categorie}</p>
                  {r.are_cod ? (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full">COD ACTIV</span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#ddf93c] bg-[#ddf93c]/10 border border-[#ddf93c]/20 px-2 py-0.5 rounded-full">OFERTA</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTIUNI SPECIALE ─── */}
      {/* ─── MAGAZINE POPULARE (pagini brand dedicate) ───────────────────── */}
      <section className="bg-[#06080b] border-b border-[#1f2329] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-1">MAGAZINE POPULARE</p>
              <h2 className="text-xl font-black text-[#ffffff]">Ghiduri dedicate pentru cele mai cautate magazine</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {BRAND_PAGES.map(b => (
              <Link key={b.href} href={b.href}
                className="flex items-center gap-2 bg-[#14181c] hover:bg-[#1f2329] border border-[#1f2329] hover:border-[#ddf93c]/40 text-[#c9ced5] hover:text-[#ffffff] rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5">
                <span className="text-base">{b.emoji}</span>
                {b.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROMOTII + MAGAZINE ─────────────────────────────────────────── */}
      <div ref={rezultateRef} className="max-w-7xl mx-auto px-4 py-10">

        {/* BANNER CAUTARE ACTIVA */}
        {!loading && cautare && (
          <div className="bg-[#ddf93c]/10 border border-[#ddf93c]/25 rounded-xl px-5 py-3 mb-6 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-[#ddf93c]">
              {filtrate.length > 0
                ? <>{filtrate.length === 1 ? "1 rezultat" : `${filtrate.length} rezultate`} pentru <strong>&quot;{cautare}&quot;</strong></>
                : <>Niciun rezultat pentru <strong>&quot;{cautare}&quot;</strong> — incearca alt nume</>
              }
            </span>
            <button onClick={() => setCautare("")}
              className="text-xs text-[#ddf93c] hover:text-[#c3dd2c] font-bold border border-[#c3dd2c] rounded-lg px-3 py-1 transition-colors">
              Sterge cautarea
            </button>
          </div>
        )}

        {/* FILTRE RAPIDE */}
        {!loading && (
          <div className="flex flex-wrap gap-2 mb-8 items-center">
            {/* Filtrele se calculeaza pe magazinele cu promotie si SE ASCUND cand
                n-au niciun rezultat — vezi FiltreRapide. „Exclusive" din brief a
                fost scos: 0 magazine au campul, ar fi fost buton mort. */}
            <FiltreRapide
              magazine={magazine.filter(m => m.are_promotie)}
              activ={filtruActiv === "favorite" ? "toate" : (filtruActiv as CheieFiltru)}
              onSchimba={(f) => { setFiltruActiv(f); setStoreLimit(12); }}
            />
            {favorite.size > 0 && (
              <button onClick={() => { setFiltruActiv("favorite"); setStoreLimit(12); }}
                aria-pressed={filtruActiv === "favorite"}
                className={`inline-flex items-center gap-1.5 text-sm font-bold px-3.5 py-2 rounded-xl border transition-colors ${filtruActiv === "favorite" ? "bg-[#ddf93c] text-[#0c1000] border-[#ddf93c]" : "bg-[#14181c] text-[#c9ced5] border-[#1f2329] hover:border-[#c9ced5] hover:text-[#ffffff]"}`}>
                Favorite <span className="tabular-nums text-xs font-black">{favorite.size}</span>
              </button>
            )}
            <Link href="/toate-magazinele" className="ml-auto text-sm text-[#ddf93c] hover:text-[#c3dd2c] font-semibold transition-colors">
              Vezi toate ({magazine.length}) →
            </Link>
          </div>
        )}

        {/* SKELETON */}
        {loading && (
          <section className="mb-10">
            <div className="h-7 w-48 bg-[#1f2329] rounded-lg animate-pulse mb-6"/>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i}/>)}
            </div>
          </section>
        )}

        {/* Sectiunea "Oferte care se termina azi" a fost scoasa pe 08.08.2026: ocupa un
            header + grila proprie (327px) pentru 4 carduri, iar aceleasi magazine apar
            oricum mai jos in "Promotii active", cu badge rosu "Expiră azi" pe card.
            Urgenta se vede acum in CONTEXT (badge pe card + linkul "N oferte expiră azi"
            din headerul Ofertei zilei), nu ca sectiune subtire separata. */}

        {/* PROMOTII ACTIVE */}
        {!loading && cuPromotii.length > 0 && (
          <section id="promotii" className="mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"/>
                  {cautare || filtruActiv !== "toate" ? "FILTRAT" : "LIVE"}
                </p>
                <h2 className="text-[1.75rem] md:text-[2.25rem] leading-[1.1] font-black text-[#ffffff] tracking-tight">
                  {cautare ? `Rezultate pentru "${cautare}"` : "Promotii active"}
                </h2>
                <p className="text-[#c9ced5] text-sm mt-0.5">{cuPromotii.length} oferte verificate</p>
              </div>
              {!cautare && filtruActiv === "toate" && (
                <Link href="/toate-magazinele" className="hidden sm:block text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c] transition-colors">
                  Toate magazinele →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(cautare || filtruActiv !== "toate" ? cuPromotii : cuPromotii.slice(0, 12)).map(m => (
                <MagazinCard key={m.magazin} m={m} astazi={astazi} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit}/>
              ))}
            </div>
          </section>
        )}

        {/* MAGAZINE PARTENERE */}
        {!loading && faraPromotii.length > 0 && (
          <section id="magazine">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-[#c9ced5] uppercase tracking-widest mb-1.5">TOATE MAGAZINELE</p>
                <h2 className="text-[1.75rem] md:text-[2.25rem] leading-[1.1] font-black text-[#ffffff] tracking-tight">Magazine partenere</h2>
                <p className="text-[#c9ced5] text-sm mt-0.5">
                  {cautare || filtruActiv !== "toate"
                    ? <>{faraPromotii.length} din {magazine.length} magazine</>
                    : <>{magazine.length} magazine</>
                  }
                </p>
              </div>
              <Link href="/toate-magazinele" className="text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c] transition-colors">
                Pagina completa →
              </Link>
            </div>
            {/* Grila COMPACTA, nu carduri mari (08.08.2026).
                Astea sunt magazinele fara promotie activa. Randate ca `Card` complet,
                fiecare afisa "Fara promotii active momentan" — 12 carduri mari care
                anunta ca n-au nimic de oferit. Ocupau ~4 ecrane si transformau un
                atu real (1178 parteneri) intr-o dovada de gol.
                NU le scoatem — aduc comision pe orice achizitie si asta respecta
                regula "promoveaza tot". Doar le prezentam ca perete de logo-uri:
                aceleasi linkuri, aceeasi monetizare, o fractiune din spatiu. */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {faraPromotii.slice(0, storeLimit).map(m => {
                const nume = numeAfisat(m.magazin);
                return (
                  <Link key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                    className="group glass rounded-xl p-3 flex flex-col items-center gap-2 hover:border-[#ddf93c]/50 hover:-translate-y-0.5 transition-all">
                    <span className="w-11 h-11 rounded-lg bg-[#ffffff] p-1.5 flex items-center justify-center shrink-0 ring-1 ring-[#2a2f36]/50 group-hover:ring-[#ddf93c]/50 transition-all">
                      {m.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.logo_url} alt={nume} className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" />
                      ) : (
                        <span className="text-[#c3dd2c] font-black text-lg">{nume.charAt(0)}</span>
                      )}
                    </span>
                    <span className="text-[11px] font-semibold text-[#c9ced5] group-hover:text-[#ecff7a] text-center leading-tight line-clamp-2 transition-colors">
                      {nume}
                    </span>
                  </Link>
                );
              })}
            </div>
            {faraPromotii.length > storeLimit && (
              <div className="text-center mt-6">
                <button onClick={() => setStoreLimit(l => l + 36)}
                  className="glass hover:border-[#ddf93c]/50 text-[#c9ced5] hover:text-[#ecff7a] font-bold px-7 py-2.5 rounded-xl text-sm transition-all">
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
            <h3 className="text-xl font-black text-[#c9ced5] mb-2">Niciun magazin gasit pentru &quot;{cautare}&quot;</h3>
            <p className="text-[#c9ced5] text-sm mb-6">Incearca un alt nume sau cauta in toate magazinele.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setCautare("")}
                className="bg-[#ddf93c] text-[#0c1000] font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#ddf93c] transition-colors">
                Sterge cautarea
              </button>
              <Link href="/toate-magazinele"
                className="bg-[#1f2329] border border-[#2a2f36] text-[#c9ced5] font-bold px-6 py-2.5 rounded-xl text-sm hover:border-[#ddf93c] transition-colors">
                Toate magazinele
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── BLOG ─────────────────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section className="reveal bg-[#06080b] border-t border-[#1f2329] py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-2">BLOG</p>
                <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.08] font-black tracking-tight text-[#ffffff]">Ghiduri si sfaturi</h2>
                <p className="text-[#c9ced5] text-sm mt-1.5">Cum sa economisesti mai mult la cumparaturile online</p>
              </div>
              <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#ddf93c] hover:text-[#ddf93c] transition-colors">
                Toate articolele
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <a key={post.slug} href={`/blog/${post.slug}`}
                  className={`group bg-[#14181c] rounded-xl border border-[#2a2f36] hover:border-[#ddf93c]/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col ${i === 0 ? "md:col-span-1" : ""}`}>
                  <div className="relative overflow-hidden h-44 bg-[#1f2329]">
                    <Image src={post.cover} alt={post.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 380px"/>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] font-black text-[#ddf93c] uppercase tracking-widest">{post.category}</span>
                    <h3 className="font-black text-[#ffffff] text-base mt-2 mb-2 line-clamp-2 group-hover:text-[#ddf93c] transition-colors leading-snug tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#c9ced5] line-clamp-2 flex-1 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 pt-4 border-t border-[#2a2f36] flex items-center justify-between">
                      <span className="text-xs text-[#9399a0]">{post.date}</span>
                      <span className="text-xs font-bold text-[#ddf93c] flex items-center gap-1 group-hover:gap-1.5 transition-all">
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
      <section className="reveal bg-[#06080b] border-t border-[#1f2329] py-14 px-4">
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
            <p className="text-xs font-bold text-[#ddf93c] uppercase tracking-widest mb-2">INTREBARI FRECVENTE</p>
            <h2 className="text-[2rem] md:text-[2.5rem] leading-[1.08] font-black tracking-tight text-[#ffffff]">Tot ce vrei sa stii despre codurile de reducere</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group bg-[#14181c] rounded-xl border border-[#2a2f36] overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none hover:bg-[#1f2329]/50 transition-colors">
                  <h3 className="font-bold text-[#ffffff] text-sm sm:text-base leading-snug">{item.q}</h3>
                  <svg className="w-5 h-5 text-[#ddf93c] shrink-0 transition-transform duration-200 group-open:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                  </svg>
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-[#c9ced5] leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="relative bg-[#06080b] py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-[#ddf93c]/8 blur-3xl"/>
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-[#ddf93c]/8 blur-3xl"/>
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#ddf93c]/15 border border-[#ddf93c]/25 rounded-full px-4 py-1.5 text-[#ddf93c] text-xs font-bold mb-6">
            Newsletter zilnic gratuit
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#ffffff] mb-3">
            Nu rata nicio oferta buna
          </h2>
          <p className="text-[#c9ced5] text-base mb-8 max-w-sm mx-auto leading-relaxed">
            Top 5 coduri de reducere verificate in fiecare dimineata. Fara spam.
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-xs text-[#c9ced5] mb-8 font-medium">
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
            className="group flex flex-col sm:flex-row items-center gap-5 bg-[#14181c] border border-[#2a2f36] hover:border-[#ddf93c]/60 rounded-xl p-6 sm:p-7 shadow-sm hover:shadow-lg hover:shadow-[#ddf93c]/10 transition-all">
            <span className="w-14 h-14 shrink-0 rounded-xl bg-[#ddf93c]/12 flex items-center justify-center text-3xl">🧩</span>
            <span className="flex-1 text-center sm:text-left">
              <span className="block font-black text-[#ffffff] text-lg mb-1">Extensia AmCupon pentru Chrome</span>
              <span className="block text-sm text-[#c9ced5]">Cauta automat coduri de reducere in locul tau, direct la checkout. Gratuit.</span>
            </span>
            <span className="shrink-0 bg-[#ddf93c] group-hover:bg-[#ddf93c] text-[#0c1000] font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
              Afla mai mult →
            </span>
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#06080b] text-[#9399a0]">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-[#ddf93c] text-[#0c1000] font-black text-sm px-2 py-0.5 rounded-md tracking-tighter">Am</div>
                <span className="font-black text-[#ffffff] text-xl tracking-tight">Cupon<span className="text-[#ddf93c]">.ro</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                Coduri de reducere verificate zilnic. Cel mai rapid mod de a economisi la cumparaturile online din Romania.
              </p>
              <div className="flex items-center gap-2 bg-[#1f2329] rounded-xl px-3 py-2 text-xs mb-5 w-fit">
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
                    className="w-8 h-8 rounded-lg bg-[#1f2329] hover:bg-[#ddf93c] flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.path}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Categorii */}
            <div>
              <h3 className="text-[#c9ced5] font-bold text-xs mb-4 uppercase tracking-wider">Categorii</h3>
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
                  <li key={l.href}><a href={l.href} className="hover:text-[#ddf93c] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Nise & hub-uri — aceeasi lista ca in Footer-ul comun, importata, NU
                copiata: altfel homepage-ul (pagina cu cea mai multa autoritate) ramane
                singura fara linkurile noi, exact cum s-a intamplat pana acum. */}
            <div>
              <h3 className="text-[#c9ced5] font-bold text-xs mb-4 uppercase tracking-wider">Reduceri &amp; nise</h3>
              <ul className="space-y-2.5 text-sm">
                {REDUCERI.map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-[#ddf93c] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Cautari populare */}
            <div>
              <h3 className="text-[#c9ced5] font-bold text-xs mb-4 uppercase tracking-wider">Cautari populare</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/cod-reducere/answear.ro",      label: "Cod Answear" },
                  { href: "/cod-reducere/notino.ro",       label: "Cod Notino" },
                  { href: "/cod-reducere/farmec.ro",       label: "Cod Farmec" },
                  { href: "/cod-reducere/noriel.ro",       label: "Cod Noriel" },
                  // /elefant, nu /cod-reducere/elefant.ro — Elefant nu e in output.json
                  // (fara program de afiliere inca), deci pagina de magazin nu se
                  // genereaza si dadea 404. Pagina editoriala exista si e completa.
                  { href: "/elefant",                      label: "Cod Elefant" },
                ].map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-[#ddf93c] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Pagini */}
            <div>
              <h3 className="text-[#c9ced5] font-bold text-xs mb-4 uppercase tracking-wider">Pagini speciale</h3>
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
                  <li key={l.href}><a href={l.href} className="hover:text-[#ddf93c] transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-[#c9ced5] font-bold text-xs mb-4 uppercase tracking-wider">Legal & Info</h3>
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
                      className="hover:text-[#ddf93c] transition-colors flex items-center gap-1">
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

          <div className="border-t border-[#2a2f36] pt-6 space-y-2">
            <p className="text-xs text-[#c9ced5] leading-relaxed max-w-4xl">
              Linkurile de pe AmCupon.ro sunt linkuri afiliate generate prin 2Performant. Cand accesezi un magazin partener si efectuezi o achizitie, primim un comision de la magazin fara niciun cost suplimentar pentru tine.
            </p>
            <p className="text-xs text-[#9399a0]">
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

/* ─── SKELETON ────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-[#14181c] rounded-xl border border-[#1f2329] animate-pulse overflow-hidden">
      <div className="h-1 bg-[#1f2329]"/>
      <div className="flex items-start gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-[#2a2f36] shrink-0"/>
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 w-28 bg-[#2a2f36] rounded"/>
          <div className="h-3 w-16 bg-[#1f2329] rounded"/>
          <div className="flex gap-1">
            <div className="h-4 w-20 bg-[#1f2329] rounded-full"/>
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-1.5">
        <div className="h-3 w-full bg-[#1f2329] rounded"/>
        <div className="h-3 w-3/4 bg-[#1f2329] rounded"/>
      </div>
      <div className="px-4 pb-4">
        <div className="h-10 w-full bg-[#2a2f36] rounded-xl"/>
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
      <div className="bg-[#1f2329] backdrop-blur-sm rounded-xl px-8 py-6 text-[#ffffff] text-center border border-[#2a2f36]">
        <p className="font-black text-xl mb-1">Multumim!</p>
        <p className="text-sm text-[#c9ced5]">Te-ai abonat cu succes. Vei primi ofertele zilei pe email.</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={trimite} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
          placeholder="adresa@email.ro" disabled={status === "loading"}
          className="flex-1 px-4 py-3.5 rounded-xl bg-[#1f2329] border border-[#2a2f36] text-[#ffffff] text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ddf93c]/50 focus:border-[#ddf93c]/40 disabled:opacity-60 transition-all"/>
        <button type="submit" disabled={status === "loading"}
          className="bg-[#ddf93c] hover:bg-[#ddf93c] disabled:opacity-60 text-[#0c1000] font-black px-7 py-3.5 rounded-xl text-sm transition-colors whitespace-nowrap shadow-lg shadow-[#ddf93c]/25">
          {status === "loading" ? "Se trimite..." : "Aboneaza-te"}
        </button>
      </form>
      {status === "err" && errMsg && (
        <p className="text-slate-500 text-xs mt-2 text-center">{errMsg}</p>
      )}
    </div>
  );
}
