"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";

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

const CATEGORII = [
  { slug: "fashion",               emoji: "👗", label: "Fashion",         desc: "Haine, pantofi & accesorii",    from: "#ec4899", to: "#f97316" },
  { slug: "electronics-itc",       emoji: "💻", label: "Electronice",     desc: "Laptopuri, telefoane, gadgeturi", from: "#3b82f6", to: "#6366f1" },
  { slug: "beauty",                emoji: "💄", label: "Frumusete",       desc: "Cosmetice, parfumuri, unghii",   from: "#f43f5e", to: "#a855f7" },
  { slug: "home-garden",           emoji: "🏡", label: "Casa & Gradina",  desc: "Mobila, deco, unelte",          from: "#10b981", to: "#3b82f6" },
  { slug: "sports-outdoors",       emoji: "🏃", label: "Sport & Outdoor", desc: "Echipament sportiv & fitness",  from: "#f97316", to: "#eab308" },
  { slug: "pharma",                emoji: "💊", label: "Farmacie",        desc: "Medicamente, suplimente",       from: "#ef4444", to: "#f97316" },
  { slug: "babies-kids-toys",      emoji: "👶", label: "Copii & Jucarii", desc: "Produse pentru cei mici",       from: "#a855f7", to: "#ec4899" },
  { slug: "automotive",            emoji: "🚗", label: "Auto-Moto",       desc: "Piese & accesorii auto",        from: "#475569", to: "#0f172a" },
  { slug: "books",                 emoji: "📚", label: "Carti & Edu",     desc: "Carti, e-books, cursuri",       from: "#eab308", to: "#f97316" },
  { slug: "hypermarket-groceries", emoji: "🛒", label: "Hypermarket",     desc: "Alimente & produse zilnice",    from: "#10b981", to: "#059669" },
  { slug: "gifts-flowers",         emoji: "🎁", label: "Cadouri & Flori", desc: "Cadouri pentru orice ocazie",   from: "#f43f5e", to: "#ec4899" },
  { slug: "telecom",               emoji: "📱", label: "Telecom",         desc: "Abonamente & servicii mobile",  from: "#06b6d4", to: "#3b82f6" },
  { slug: "pet-supplies",          emoji: "🐾", label: "Animale",         desc: "Hrana, jucarii, accesorii",     from: "#f59e0b", to: "#d97706" },
  { slug: "health-personal-care",  emoji: "🧴", label: "Sanatate",        desc: "Ingrijire personala & wellness",from: "#0ea5e9", to: "#10b981" },
  { slug: "jewelry",               emoji: "💎", label: "Bijuterii",       desc: "Bijuterii & ceasuri",           from: "#8b5cf6", to: "#6366f1" },
  { slug: "games",                 emoji: "🎮", label: "Jocuri & Gaming", desc: "Jocuri video & console",        from: "#6366f1", to: "#0f172a" },
];

const SECTIUNI_SPECIALE = [
  { href: "/top",          emoji: "🏆", label: "Top Produse",      desc: "Review-uri laptopuri, telefoane",   gradient: "from-slate-800 to-slate-900" },
  { href: "/gadgets",      emoji: "📡", label: "Gadgets & Tech",   desc: "Smartwatch, casti, drone",         gradient: "from-blue-500 to-indigo-600" },
  { href: "/fashion",      emoji: "👗", label: "Fashion & Haine",  desc: "FashionDays, Answear, H&M",        gradient: "from-purple-500 to-fuchsia-600" },
  { href: "/casa",         emoji: "🏡", label: "Casa & Gradina",   desc: "Dedeman, IKEA, Leroy Merlin",      gradient: "from-green-600 to-teal-600" },
  { href: "/moto",         emoji: "🏍️", label: "Auto-Moto",        desc: "Piese, accesorii, anvelope",        gradient: "from-slate-600 to-gray-800" },
  { href: "/idei-cadouri", emoji: "🎁", label: "Idei Cadouri",     desc: "Cadoul perfect la pret mic",        gradient: "from-pink-500 to-purple-600" },
  { href: "/farmacie",     emoji: "💊", label: "Farmacie Online",  desc: "Dr. Max, Vegis, Catena",            gradient: "from-green-500 to-teal-600" },
  { href: "/sport",        emoji: "🏃", label: "Sport & Outdoor",  desc: "Decathlon, Hervis, Intersport",     gradient: "from-orange-500 to-amber-600" },
  { href: "/copii",        emoji: "👶", label: "Copii & Jucarii",  desc: "Noriel, Bebetei, Smyths",           gradient: "from-yellow-400 to-orange-500" },
  { href: "/frumusete",    emoji: "💄", label: "Beauty",           desc: "Notino, Douglas, Sephora",          gradient: "from-pink-400 to-rose-600" },
  { href: "/sanatate",     emoji: "🌿", label: "Sanatate",         desc: "Vitamine, naturiste, suplimente",   gradient: "from-green-500 to-teal-600" },
  { href: "/animale",      emoji: "🐾", label: "Animale",          desc: "Petmart, Petmax, hrana animale",    gradient: "from-amber-500 to-orange-600" },
  { href: "/bijuterii",    emoji: "💍", label: "Bijuterii",        desc: "Teilor, Pandora, Glamira",          gradient: "from-rose-500 to-pink-600" },
  { href: "/jocuri",       emoji: "🎮", label: "Jocuri & Gaming",  desc: "Console, jocuri, accesorii PC",     gradient: "from-violet-600 to-indigo-700" },
  { href: "/supermarket",  emoji: "🛒", label: "Supermarket",      desc: "Carrefour, Bringo, Freshful",       gradient: "from-blue-500 to-cyan-600" },
  { href: "/calatorie",    emoji: "✈️", label: "Vacante & Travel", desc: "Booking, Airbnb, Trip.com",         gradient: "from-sky-500 to-blue-600" },
  { href: "/black-friday", emoji: "🖤", label: "Black Friday",     desc: "Cele mai mari reduceri",            gradient: "from-gray-900 to-black" },
  { href: "/craciun",      emoji: "🎄", label: "Craciun",          desc: "Oferte de sarbatori",               gradient: "from-red-600 to-green-700" },
  { href: "/categorii",    emoji: "📂", label: "Toate categoriile",desc: "Exploreaza tot",                    gradient: "from-orange-500 to-red-500" },
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
    a: "Verificam si actualizam codurile zilnic, automat, de la peste 290 de magazine partenere din Romania. Ofertele expirate sunt eliminate, iar cele noi adaugate in fiecare zi.",
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

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  cover: string;
}

interface Banner {
  id: string;
  image_url: string;
  landing_url: string;
  landing_raw: string;
  width: number;
  height: number;
  merchant: string;
  merchant_slug: string;
  name: string;
  category: string;
  b_type: string;
}

export default function Home() {
  const [magazine, setMagazine]           = useState<Magazin[]>([]);
  const [blogPosts, setBlogPosts]         = useState<BlogPost[]>([]);
  const [banners, setBanners]             = useState<Banner[]>([]);
  const [loading, setLoading]             = useState(true);
  const [cautare, setCautare]             = useState("");
  const [coduriReveal, setCoduriReveal]   = useState<Set<string>>(new Set());
  const [copiat, setCopiat]               = useState<string | null>(null);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [storeLimit, setStoreLimit]       = useState(12);
  const [filtruActiv, setFiltruActiv]     = useState<"toate"|"cod"|"promotie"|"favorite">("toate");
  const [favorite, setFavorite]           = useState<Set<string>>(new Set());
  const [produse, setProduse]             = useState<{title:string;url:string;image:string;price:number;old_price?:number;discount_pct:number;brand:string;merchant:string;merchant_slug:string}[]>([]);
  const bannersRef                         = useRef<HTMLDivElement>(null);
  const trendingRef                        = useRef<HTMLDivElement>(null);
  const rezultateRef                       = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/output.json").then(r => r.json()).then(data => { setMagazine(data); setLoading(false); });
    fetch("/blog-latest.json").then(r => r.json()).then((posts: BlogPost[]) => setBlogPosts(posts.slice(0, 3))).catch(() => {});
    fetch("/products-home.json").then(r => r.json()).then(data => {
      const all = data?.products || data || [];
      type P = {title:string;url:string;image:string;price:number;old_price?:number;discount_pct:number;brand:string;merchant:string;merchant_slug:string;category:string};
      const cuImagine = (all as P[]).filter(p => p.image && p.price > 0);
      if (cuImagine.length === 0) return;

      // Grupare per merchant
      const byMerchant: Record<string, P[]> = {};
      for (const p of cuImagine) {
        const m = p.merchant_slug || p.merchant || "alt";
        if (!byMerchant[m]) byMerchant[m] = [];
        byMerchant[m].push(p);
      }
      const merchants = Object.keys(byMerchant);
      // Cate produse per merchant: cel putin 1, max 12 daca e singur merchant
      const perMerchant = Math.max(1, Math.ceil(12 / merchants.length));

      // Ia primele perMerchant din fiecare merchant (sortate: discount > pret)
      const pool: P[] = [];
      for (const m of merchants) {
        const sorted = [...byMerchant[m]].sort((a, b) =>
          (b.discount_pct || 0) - (a.discount_pct || 0) || b.price - a.price
        );
        pool.push(...sorted.slice(0, perMerchant));
      }
      // Shuffle pentru varietate vizuala
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      setProduse(pool.slice(0, 12));
    }).catch(() => {});
    fetch("/banners.json").then(r => r.json()).then(data => {
      const list: Banner[] = data?.banners || data || [];
      const withImg = list.filter(b => b.image_url && (b.landing_url || b.landing_raw));
      withImg.sort((a, b) => {
        const rA = a.width / (a.height || 1), rB = b.width / (b.height || 1);
        const sA = rA >= 1.2 && rA <= 3 ? 2 : rA >= 0.8 ? 1 : 0;
        const sB = rB >= 1.2 && rB <= 3 ? 2 : rB >= 0.8 ? 1 : 0;
        return sB - sA;
      });
      setBanners(withImg.slice(0, 8));
    }).catch(() => {});
    try {
      const saved = JSON.parse(localStorage.getItem("favorite_magazine") || "[]");
      setFavorite(new Set(saved));
    } catch {}
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
    <div className="min-h-screen bg-white">

      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-[60px] flex items-center gap-3">

          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-sm px-2 py-0.5 rounded-lg tracking-tighter">Am</div>
            <span className="font-black text-slate-900 text-xl tracking-tight">Cupon<span className="text-orange-500">.ro</span></span>
          </a>

          <div className="flex-1 relative max-w-2xl hidden sm:block">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Answear, eMAG, Notino..." value={cautare}
              onChange={e => { setCautare(e.target.value); setMenuOpen(false); }}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white focus:border-orange-400 transition-all" />
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-600 ml-auto">
            <a href="/oferte-azi" className="flex items-center gap-1 text-orange-500 hover:text-orange-600 transition-colors font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Oferte azi
            </a>
            <a href="/produse"  className="hover:text-orange-500 transition-colors">Produse</a>
            <a href="/blog"     className="hover:text-orange-500 transition-colors">Blog</a>
            <div className="relative group">
              <button className="flex items-center gap-1 hover:text-orange-500 transition-colors py-1">
                Categorii
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block z-50 w-60">
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl py-2">
                  {categoriiSortate.slice(0, 8).map(c => (
                    <a key={c.slug} href={`/categorii/${c.slug}`}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                      <span className="text-base">{c.emoji}</span>
                      <span className="font-medium">{c.label}</span>
                      {promoPerCateg[c.slug] > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">{promoPerCateg[c.slug]}</span>
                      )}
                    </a>
                  ))}
                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <a href="/categorii" className="flex items-center px-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-50 transition-colors">
                      Toate categoriile →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <button onClick={() => setMenuOpen(o => !o)}
            className="md:hidden ml-auto p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-700" aria-label="Meniu">
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
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              <div className="relative">
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                <input type="text" placeholder="Cauta magazin..." value={cautare}
                  onChange={e => setCautare(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
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
                    className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                    {l.label}
                  </a>
                ))}
              </nav>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">Categorii populare</p>
                <div className="grid grid-cols-4 gap-2">
                  {categoriiSortate.slice(0, 8).map(c => (
                    <a key={c.slug} href={`/categorii/${c.slug}`} onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl border border-slate-700 bg-slate-800 hover:border-orange-500 transition-colors">
                      <span className="text-xl">{c.emoji}</span>
                      <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">{c.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 text-white overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 90% 70% at 50% -10%, rgba(249,115,22,0.18) 0%, transparent 70%)"}} />
          <div className="absolute inset-0 opacity-[0.025]" style={{backgroundImage:"linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize:"50px 50px"}} />
          <div className="absolute bottom-0 left-0 right-0 h-32" style={{background:"linear-gradient(to top, rgba(255,255,255,0.03), transparent)"}} />
        </div>

        {/* Floating deal badges — desktop only */}
        <div className="absolute left-8 top-16 hidden xl:flex flex-col gap-3 opacity-80">
          {[{e:"👗", t:"-60%"}, {e:"💊", t:"-40%"}, {e:"💻", t:"-35%"}].map((b,i) => (
            <div key={i} className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl px-3 py-2 text-xs font-bold">
              <span>{b.e}</span><span className="text-white/90">{b.t}</span>
            </div>
          ))}
        </div>
        <div className="absolute right-8 top-16 hidden xl:flex flex-col gap-3 opacity-80">
          {[{e:"🏃", t:"-50%"}, {e:"🎁", t:"-45%"}, {e:"🏡", t:"-30%"}].map((b,i) => (
            <div key={i} className="flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 rounded-2xl px-3 py-2 text-xs font-bold">
              <span>{b.e}</span><span className="text-white/90">{b.t}</span>
            </div>
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
          {/* Live pill */}
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
            {cuPromotii.length > 0 ? `${cuPromotii.length} oferte verificate acum` : "Sute de oferte verificate acum"}
          </div>

          {/* H1 */}
          <h1 className="text-[2.75rem] md:text-[4.5rem] font-black tracking-tight leading-[1.05] mb-6">
            <span className="text-white">Cele mai bune coduri</span><br/>
            <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #fb923c 0%, #fbbf24 100%)"}}>
              de reducere din Romania
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-md mx-auto leading-relaxed">
            Verificate zilnic. 100% gratuit.<br className="hidden sm:block"/>
            {magazine.length > 0 ? `Peste ${magazine.length}` : "Peste 610"} magazine partenere.
          </p>

          {/* Search hero */}
          <div className="max-w-xl mx-auto relative mb-10">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" placeholder="Cauta: eMAG, Answear, Noriel..." value={cautare}
              onChange={e => {
                setCautare(e.target.value);
                setTimeout(() => rezultateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
              }}
              onKeyDown={e => { if (e.key === "Enter") rezultateRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              className="w-full bg-white/10 border border-white/20 text-white rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-500/40 placeholder-white/35 transition-all" />
            {cautare && (
              <button onClick={() => setCautare("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors text-lg leading-none">
                &times;
              </button>
            )}
          </div>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            <a href="#promotii"
              className="bg-orange-500 hover:bg-orange-400 text-white font-black px-7 py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 duration-200">
              Coduri active acum →
            </a>
            <a href="#categorii"
              className="bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-2xl text-sm transition-all duration-200">
              Cauta dupa categorie
            </a>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-white/40 font-medium">
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Gratuit, fara cont</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> {magazine.length > 0 ? `${magazine.length}+` : "610+"} magazine</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Actualizat zilnic automat</span>
            <span className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 0 reclame invazive</span>
          </div>
        </div>
      </section>

      {/* ─── CATEGORY GRID ───────────────────────────────────────────────── */}
      <section id="categorii" className="bg-slate-900 border-b border-slate-800 py-14 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">CATEGORII</p>
              <h2 className="text-3xl font-black tracking-tight text-white">Exploreaza dupa categorie</h2>
              <p className="text-slate-400 text-sm mt-1.5">Coduri verificate zilnic in fiecare categorie</p>
            </div>
            <a href="/categorii" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors border border-orange-500/30 hover:border-orange-400/60 bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2 rounded-full whitespace-nowrap">
              Toate categoriile
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
              </svg>
            </a>
          </div>

          {/* Grid principal — top 8 categorii după vânzări */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categoriiSortate.slice(0, 8).map(c => {
              const nrPromo = promoPerCateg[c.slug] || 0;
              return (
                <a
                  key={c.slug}
                  href={`/categorii/${c.slug}`}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/40"
                  style={{ background: `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)` }}
                >
                  {/* Shimmer overlay la hover */}
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 pointer-events-none" />

                  <div className="relative p-5 flex flex-col gap-3 min-h-[140px]">
                    {/* Badge oferte */}
                    {nrPromo > 0 ? (
                      <div className="inline-flex self-start items-center gap-1 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-white text-[10px] font-bold">{nrPromo} {nrPromo === 1 ? "oferta" : "oferte"}</span>
                      </div>
                    ) : (
                      <div className="inline-flex self-start bg-black/15 px-2 py-0.5 rounded-full">
                        <span className="text-white/70 text-[10px]">Vezi magazine</span>
                      </div>
                    )}

                    {/* Emoji mare */}
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                      {c.emoji}
                    </span>

                    {/* Nume + descriere */}
                    <div>
                      <div className="text-white font-black text-sm leading-tight">{c.label}</div>
                      <div className="text-white/65 text-[10px] mt-0.5 leading-tight">{c.desc}</div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 text-white/50 group-hover:text-white group-hover:gap-2 transition-all text-[10px] font-bold">
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
                  className="group relative flex flex-col items-center gap-1.5 p-3 rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.05] hover:shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${c.from}33 0%, ${c.to}33 100%)`, border: `1px solid ${c.from}40` }}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">{c.emoji}</span>
                  <span className="text-[10px] font-bold text-white text-center leading-tight">{c.label}</span>
                  {nrPromo > 0 && (
                    <span className="absolute -top-1 -right-1 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-sm"
                      style={{ background: c.from }}>
                      {nrPromo > 9 ? "9+" : nrPromo}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <a href="/categorii" className="sm:hidden mt-4 flex items-center justify-center gap-1.5 text-sm font-bold text-orange-400 border border-orange-500/30 bg-orange-500/10 py-2.5 rounded-2xl">
            Toate categoriile →
          </a>
        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { icon: "🏪", value: magazine.length > 0 ? `${magazine.length}+` : "610+", label: "Magazine partenere" },
              { icon: "⚡", value: cuPromotii.length > 0 ? `${cuPromotii.length}` : "200+",  label: "Promotii active" },
              { icon: "✅", value: "100%",    label: "Coduri verificate" },
              { icon: "🆓", value: "Gratuit", label: "Fara abonament" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 px-4 py-5">
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="font-black text-slate-900 text-xl leading-none">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DEAL ZILEI ──────────────────────────────────────────────────── */}
      {!loading && cuPromotii.length > 0 && (() => {
        const deal  = cuPromotii.find(m => m.cod_cupon) || cuPromotii[0];
        const promo = deal.promotii[0];
        const discountText = maxDiscount(deal.promotii);
        const link  = promo?.landing_page || deal.url_afiliat || deal.url;
        return (
          <div className="bg-slate-900 py-6 px-4 border-b border-white/5">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wider">DEAL ZILEI</span>
                <span className="text-slate-500 text-xs">{new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}</span>
              </div>
              <a href={link} target="_blank" rel="sponsored noopener noreferrer"
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-orange-500/40 rounded-2xl p-5 transition-all duration-200">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg">
                  {deal.logo_url ? (
                    <img src={deal.logo_url} alt={numeAfisat(deal.magazin)} className="w-10 h-10 object-contain" loading="lazy"/>
                  ) : (
                    <span className="text-xl font-black text-orange-500">{numeAfisat(deal.magazin)[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-white font-black text-lg">{numeAfisat(deal.magazin)}</span>
                    <span className="text-slate-500 text-xs">{deal.categorie}</span>
                  </div>
                  <p className="text-slate-400 text-sm line-clamp-1">{promo?.nume || "Oferta speciala disponibila"}</p>
                  {discountText && (
                    <span className="inline-flex items-center mt-2 gap-1 bg-emerald-500/15 text-emerald-400 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                      {discountText}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {promo?.cod_cupon && (
                    <div className="hidden sm:block border-2 border-dashed border-orange-400/50 rounded-xl px-4 py-2 bg-orange-500/8">
                      <span className="font-mono font-black text-orange-400 text-sm tracking-widest">{promo.cod_cupon}</span>
                    </div>
                  )}
                  <span className="bg-orange-500 group-hover:bg-orange-400 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap">
                    Activeaza →
                  </span>
                </div>
              </a>
            </div>
          </div>
        );
      })()}

      {/* ─── TRENDING ─────────────────────────────────────────────────────── */}
      {!loading && cuPromotii.length >= 3 && (
        <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"/>
                  LIVE
                </p>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">Trending acum</h2>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => trendingRef.current?.scrollBy({ left: -520, behavior: "smooth" })}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button
                  onClick={() => trendingRef.current?.scrollBy({ left: 520, behavior: "smooth" })}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <a href="#promotii" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors ml-2">
                  Toate →
                </a>
              </div>
            </div>
            <div ref={trendingRef} className="overflow-x-auto -mx-4 px-4 pb-3" style={{scrollbarWidth:"none", scrollBehavior:"smooth"}}>
              <div className="flex gap-3" style={{minWidth:"max-content"}}>
                {cuPromotii.slice(0, 12).map(m => {
                  const promo    = m.promotii[0];
                  const discount = maxDiscount(m.promotii);
                  const link     = promo?.landing_page || m.url_afiliat || m.url;
                  return (
                    <a key={m.magazin} href={link} target="_blank" rel="sponsored noopener noreferrer"
                      className="group flex-shrink-0 w-48 bg-white border border-slate-200 hover:border-orange-300 rounded-2xl p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                      {/* Trust bar */}
                      <div className="h-0.5 w-full bg-slate-100 rounded-full mb-3 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{width:`${m.procent_succes || 75}%`}}/>
                      </div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {m.logo_url ? (
                            <img src={m.logo_url} alt={numeAfisat(m.magazin)} className="w-7 h-7 object-contain" loading="lazy"/>
                          ) : (
                            <span className="text-sm font-black text-orange-500">{numeAfisat(m.magazin)[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-xs truncate group-hover:text-orange-600 transition-colors">{numeAfisat(m.magazin)}</p>
                          <p className="text-slate-400 text-[10px] truncate">{m.categorie}</p>
                        </div>
                      </div>
                      {discount && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 mb-2.5 text-center">
                          <span className="text-emerald-700 font-black text-xs">{discount}</span>
                        </div>
                      )}
                      <p className="text-slate-500 text-[11px] line-clamp-2 mb-3">{promo?.nume || "Oferta activa"}</p>
                      <div className="bg-orange-500 group-hover:bg-orange-600 text-white text-[11px] font-black py-1.5 rounded-lg text-center transition-colors">
                        {m.cod_cupon ? "Cod disponibil" : "Vezi oferta"}
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── SECTIUNI SPECIALE ────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-b border-slate-100 py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">GHIDURI DEDICATE</p>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">Sectiuni speciale</h2>
            <p className="text-slate-500 text-sm mt-1.5">Curatate editorial cu cele mai bune oferte pe fiecare nisa</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {SECTIUNI_SPECIALE.map(s => (
              <a key={s.href} href={s.href}
                className={`group relative bg-gradient-to-br ${s.gradient} rounded-2xl p-5 text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 blur-xl transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-300 pointer-events-none"/>
                <div className="relative">
                  <div className="text-3xl mb-3">{s.emoji}</div>
                  <p className="font-black text-sm leading-tight">{s.label}</p>
                  <p className="text-white/60 text-xs mt-1 leading-tight">{s.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-white/70 text-xs font-semibold">
                    Descopera
                    <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BANNERE PARTENERE ────────────────────────────────────────────── */}
      {banners.length > 0 && (
        <div className="bg-slate-900 border-b border-slate-800 py-10">
          {/* Header */}
          <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔥</span>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Oferte vizuale ale zilei</h2>
                <p className="text-xs text-slate-400 mt-0.5">Campanii active de la partenerii nostri</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => bannersRef.current?.scrollBy({ left: -340, behavior: "smooth" })}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-orange-500 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <button
                onClick={() => bannersRef.current?.scrollBy({ left: 340, behavior: "smooth" })}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-orange-500 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Carousel orizontal cu scroll snap */}
          <div ref={bannersRef} className="px-4 overflow-x-auto"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth" }}>
            <div className="flex gap-3 pb-2"
              style={{ width: "max-content" }}>
              {banners.slice(0, 12).map((b, i) => {
                const aspectLandscape = b.width >= b.height;
                return (
                  <a
                    key={b.id || i}
                    href={b.landing_url || b.landing_raw}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="group relative overflow-hidden rounded-2xl flex-shrink-0 block"
                    style={{
                      width: aspectLandscape ? "320px" : "200px",
                      height: "200px",
                      scrollSnapAlign: "start",
                    }}
                    onError={() => {}}
                  >
                    {/* Imagine banner */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.image_url}
                      alt={b.name || b.merchant || "Oferta"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={e => {
                        const el = (e.target as HTMLImageElement).closest("a");
                        if (el) el.style.display = "none";
                      }}
                    />

                    {/* Gradient overlay permanent */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    {/* Continut overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider mb-0.5">
                        {(b.merchant || "").replace(".ro","").replace(".com","").trim()}
                      </p>
                      <p className="text-white font-black text-xs leading-tight line-clamp-2 mb-2">
                        {b.name || "Oferta activa"}
                      </p>
                      <span className="inline-flex items-center gap-1 bg-orange-500 group-hover:bg-orange-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors">
                        Vezi oferta
                        <svg className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </div>

                    {/* Ring la hover */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-orange-500/0 group-hover:ring-orange-500/60 transition-all duration-200 pointer-events-none" />
                  </a>
                );
              })}

              {/* Card final — "Vezi toate" */}
              <a href="/categorii" className="group relative overflow-hidden rounded-2xl flex-shrink-0 flex flex-col items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-orange-500/50 transition-all duration-200"
                style={{ width: "160px", height: "200px", scrollSnapAlign: "start" }}>
                <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-xs text-center px-4">Toate categoriile</span>
                <span className="text-orange-400 text-[10px] font-bold">Vezi →</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRODUSE HOT ─────────────────────────────────────────────────── */}
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
          <section className="bg-slate-950 border-b border-slate-800 py-14 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">🔥 CODURI ACTIVE AZI</p>
                  <h2 className="text-3xl font-black tracking-tight text-white">Oferte cu reducere acum</h2>
                  <p className="text-slate-400 text-sm mt-1.5">Coduri verificate de la {oferte.length} magazine — actualizate zilnic</p>
                </div>
                <a href="/toate-magazinele" className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                  Toate ofertele
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/></svg>
                </a>
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
                    <a key={i} href={link} target="_blank" rel="sponsored noopener noreferrer"
                      className="group bg-slate-900 border border-slate-800 hover:border-orange-500 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1 duration-200 flex flex-col">
                      {/* Logo */}
                      <div className="relative bg-slate-800 flex items-center justify-center p-4" style={{aspectRatio:"1"}}>
                        {m.logo_url
                          ? <img src={m.logo_url} alt={slug}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy" onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
                          : <span className="font-black text-orange-500 text-base">{slug.split('.')[0].toUpperCase()}</span>
                        }
                        {cod && (
                          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
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
                        <p className="text-[11px] text-slate-500 mb-0.5 truncate">{slug}</p>
                        <p className="text-xs font-semibold text-slate-200 line-clamp-2 flex-1 group-hover:text-orange-400 transition-colors leading-snug">{titlu}</p>
                        {cod ? (
                          <div className="mt-2 bg-slate-800 border border-dashed border-orange-500/60 rounded-lg px-2 py-1 text-center">
                            <span className="font-black text-orange-400 text-[11px] tracking-widest">{cod}</span>
                          </div>
                        ) : (
                          <div className="mt-2 text-[11px] font-bold text-emerald-500">Fara cod necesar</div>
                        )}
                        <a href={`/cod-reducere/${slug}`}
                          className="mt-2 text-[11px] font-bold text-orange-500 group-hover:text-orange-400 flex items-center gap-0.5"
                          onClick={e => e.stopPropagation()}>
                          Vezi oferta
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                          </svg>
                        </a>
                      </div>
                    </a>
                  );
                })}
              </div>
              <div className="text-center mt-6">
                <a href="/toate-magazinele" className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 text-sm font-semibold transition-colors">
                  Vezi toate magazinele cu oferte active →
                </a>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ─── PRODUSE POPULARE ─────────────────────────────────────────────── */}
      {produse.length > 0 && (
        <section className="bg-slate-900 border-b border-slate-800 py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">PRODUSE</p>
                <h2 className="text-2xl font-black tracking-tight text-white">Produse populare acum</h2>
                <p className="text-slate-400 text-sm mt-1">Cele mai cautate produse de la parteneri verificati</p>
              </div>
              <a href="/produse" className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors">
                Toate produsele
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {produse.map((p, i) => (
                <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                  className="group bg-slate-800 border border-slate-700 hover:border-orange-500/50 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="relative aspect-square bg-slate-700 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).closest("a")!.style.display = "none"; }}
                    />
                    {p.discount_pct > 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                        -{p.discount_pct}%
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] text-slate-500 mb-0.5 truncate">{p.merchant.replace(".ro","").replace(".com","")}</p>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors mb-1.5">{p.title}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-orange-400">{p.price.toLocaleString("ro-RO")} lei</span>
                      {p.old_price && p.old_price > p.price && (
                        <span className="text-[10px] text-slate-500 line-through">{p.old_price.toLocaleString("ro-RO")}</span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-6">
              <a href="/produse" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-orange-400 transition-colors">
                Vezi toate produsele cu reducere →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─── TOP PICKS ────────────────────────────────────────────────────── */}
      {!loading && cuPromotii.length >= 3 && (
        <section className="bg-slate-950 border-b border-slate-800 py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">SELECTIE EDITORIALA</p>
                <h2 className="text-3xl font-black tracking-tight text-white">Top picks saptamana asta</h2>
                <p className="text-slate-400 text-sm mt-1.5">Cele mai bune oferte verificate de echipa noastra</p>
              </div>
              <a href="#promotii" className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Toate ofertele
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {cuPromotii.slice(0, 3).map((m, i) => {
                const nume  = numeAfisat(m.magazin);
                const promo = m.promotii[0];
                const discountText = maxDiscount(m.promotii);
                const link  = promo?.landing_page || m.url_afiliat || m.url;
                const tops  = [
                  { label: "#1 Recomandat", bar: "from-orange-500 to-red-500",   badge: "bg-orange-500" },
                  { label: "Popular",       bar: "from-purple-500 to-pink-500",   badge: "bg-purple-600" },
                  { label: "Trending",      bar: "from-blue-500 to-indigo-500",   badge: "bg-blue-600" },
                ];
                return (
                  <a key={m.magazin} href={link} target="_blank" rel="sponsored noopener noreferrer"
                    className="group bg-slate-900 border-2 border-slate-700 hover:border-orange-500/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
                    <div className={`h-1.5 bg-gradient-to-r ${tops[i].bar}`}/>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <span className={`${tops[i].badge} text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide`}>
                          {tops[i].label}
                        </span>
                        {m.cod_cupon && (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                            Cod cupon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                          {m.logo_url ? (
                            <img src={m.logo_url} alt={`Logo ${nume}`} className="w-10 h-10 object-contain" loading="lazy"/>
                          ) : (
                            <span className="text-xl font-black text-orange-500">{nume[0]}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-lg group-hover:text-orange-400 transition-colors leading-tight tracking-tight">{nume}</h3>
                          <p className="text-slate-400 text-xs">{m.categorie}</p>
                          {discountText && (
                            <span className="inline-flex items-center gap-1 mt-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {discountText}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Trust Score bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-slate-400">Trust Score</span>
                          <span className="text-[10px] font-bold text-emerald-600">{m.procent_succes || 82}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{width:`${m.procent_succes || 82}%`}}/>
                        </div>
                      </div>
                      {promo && (
                        <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">{promo.nume}</p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"/>
                          Verificat azi
                          <span className="text-slate-600 mx-1">·</span>
                          <span className="text-slate-400">{m.promotii.length} {m.promotii.length === 1 ? "oferta" : "oferte"}</span>
                        </div>
                        <span className="bg-orange-500 group-hover:bg-orange-400 text-white font-black text-xs px-4 py-2 rounded-xl transition-colors">
                          Activeaza →
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── PROMOTII + MAGAZINE ─────────────────────────────────────────── */}
      <div ref={rezultateRef} className="max-w-7xl mx-auto px-4 py-10">

        {/* BANNER CAUTARE ACTIVA */}
        {!loading && cautare && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 mb-6 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-orange-700">
              {filtrate.length > 0
                ? <>{filtrate.length === 1 ? "1 rezultat" : `${filtrate.length} rezultate`} pentru <strong>&quot;{cautare}&quot;</strong></>
                : <>Niciun rezultat pentru <strong>&quot;{cautare}&quot;</strong> — incearca alt nume</>
              }
            </span>
            <button onClick={() => setCautare("")}
              className="text-xs text-orange-500 hover:text-orange-700 font-bold border border-orange-300 rounded-lg px-3 py-1 transition-colors">
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
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filtruActiv === f.key ? "bg-slate-900 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>
                {f.label}
              </button>
            ))}
            <a href="/toate-magazinele" className="ml-auto text-sm text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              Vezi toate ({magazine.length}) →
            </a>
          </div>
        )}

        {/* SKELETON */}
        {loading && (
          <section className="mb-10">
            <div className="h-7 w-48 bg-slate-200 rounded-lg animate-pulse mb-6"/>
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
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Oferte care se termina azi</h2>
              <span className="text-sm text-slate-400">{expiraAzi.length} oferte</span>
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
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse inline-block"/>
                  {cautare || filtruActiv !== "toate" ? "FILTRAT" : "LIVE"}
                </p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {cautare ? `Rezultate pentru "${cautare}"` : "Promotii active"}
                </h2>
                <p className="text-slate-400 text-sm mt-0.5">{cuPromotii.length} oferte verificate</p>
              </div>
              {!cautare && filtruActiv === "toate" && (
                <a href="/toate-magazinele" className="hidden sm:block text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                  Toate magazinele →
                </a>
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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">TOATE MAGAZINELE</p>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Magazine partenere</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  {cautare || filtruActiv !== "toate"
                    ? <>{faraPromotii.length} din {magazine.length} magazine</>
                    : <>{magazine.length} magazine</>
                  }
                </p>
              </div>
              <a href="/toate-magazinele" className="text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors">
                Pagina completa →
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.slice(0, storeLimit).map(m => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} isFavorit={favorite.has(m.magazin)} onToggleFavorit={toggleFavorit}/>
              ))}
            </div>
            {faraPromotii.length > storeLimit && (
              <div className="text-center mt-10">
                <button onClick={() => setStoreLimit(l => l + 24)}
                  className="bg-white border-2 border-slate-200 hover:border-orange-400 text-slate-600 hover:text-orange-500 font-bold px-8 py-3 rounded-2xl text-sm transition-all hover:shadow-md">
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
            <h3 className="text-xl font-black text-slate-800 mb-2">Niciun magazin gasit pentru &quot;{cautare}&quot;</h3>
            <p className="text-slate-400 text-sm mb-6">Incearca un alt nume sau cauta in toate magazinele.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={() => setCautare("")}
                className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-orange-600 transition-colors">
                Sterge cautarea
              </button>
              <a href="/toate-magazinele"
                className="bg-white border border-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-sm hover:border-orange-400 transition-colors">
                Toate magazinele
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ─── BLOG ─────────────────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section className="bg-slate-950 border-t border-slate-800 py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">BLOG</p>
                <h2 className="text-3xl font-black tracking-tight text-white">Ghiduri si sfaturi</h2>
                <p className="text-slate-400 text-sm mt-1.5">Cum sa economisesti mai mult la cumparaturile online</p>
              </div>
              <a href="/blog" className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-500 hover:text-orange-400 transition-colors">
                Toate articolele
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogPosts.map((post, i) => (
                <a key={post.slug} href={`/blog/${post.slug}`}
                  className={`group bg-slate-900 rounded-2xl border border-slate-700 hover:border-orange-500/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col ${i === 0 ? "md:col-span-1" : ""}`}>
                  <div className="relative overflow-hidden h-44 bg-slate-800">
                    <Image src={post.cover} alt={post.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 380px"/>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{post.category}</span>
                    <h3 className="font-black text-slate-100 text-base mt-2 mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors leading-snug tracking-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 flex-1 leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                      <span className="text-xs text-slate-500">{post.date}</span>
                      <span className="text-xs font-bold text-orange-500 flex items-center gap-1 group-hover:gap-1.5 transition-all">
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
      <section className="bg-slate-950 border-t border-slate-800 py-14 px-4">
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
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2">INTREBARI FRECVENTE</p>
            <h2 className="text-3xl font-black tracking-tight text-white">Tot ce vrei sa stii despre codurile de reducere</h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <details key={i} className="group bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none hover:bg-slate-800/50 transition-colors">
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug">{item.q}</h3>
                  <svg className="w-5 h-5 text-orange-500 shrink-0 transition-transform duration-200 group-open:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
                  </svg>
                </summary>
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────────────────────────── */}
      <section className="relative bg-slate-950 py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-orange-500/8 blur-3xl"/>
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-orange-500/8 blur-3xl"/>
        </div>
        <div className="relative max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 rounded-full px-4 py-1.5 text-orange-400 text-xs font-bold mb-6">
            Newsletter zilnic gratuit
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">
            Nu rata nicio oferta buna
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto leading-relaxed">
            Top 5 coduri de reducere verificate in fiecare dimineata. Fara spam.
          </p>
          <div className="flex flex-wrap justify-center gap-5 text-xs text-slate-600 mb-8 font-medium">
            {["Gratuit", "Fara spam", "Dezabonare oricand", "0 reclame"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <span className="text-emerald-500">✓</span> {t}
              </span>
            ))}
          </div>
          <NewsletterForm/>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#070a0f] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 pt-14 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-orange-500 text-white font-black text-sm px-2 py-0.5 rounded-md tracking-tighter">Am</div>
                <span className="font-black text-white text-xl tracking-tight">Cupon<span className="text-orange-500">.ro</span></span>
              </div>
              <p className="text-sm leading-relaxed mb-5">
                Coduri de reducere verificate zilnic. Cel mai rapid mod de a economisi la cumparaturile online din Romania.
              </p>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 text-xs mb-5 w-fit">
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
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500 flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.path}/>
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Categorii */}
            <div>
              <h3 className="text-slate-300 font-bold text-xs mb-4 uppercase tracking-wider">Categorii</h3>
              <ul className="space-y-2.5 text-sm">
                {[
                  { href: "/categorii/fashion",           label: "Fashion" },
                  { href: "/categorii/electronics-itc",   label: "Electronice IT&C" },
                  { href: "/categorii/beauty",            label: "Frumusete" },
                  { href: "/categorii/home-garden",       label: "Casa & Gradina" },
                  { href: "/categorii/sports-outdoors",   label: "Sport" },
                  { href: "/categorii/pharma",            label: "Farmacie" },
                  { href: "/categorii",                   label: "Toate categoriile →" },
                ].map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-orange-400 transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Cautari populare */}
            <div>
              <h3 className="text-slate-300 font-bold text-xs mb-4 uppercase tracking-wider">Cautari populare</h3>
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
                  <li key={l.href}><a href={l.href} className="hover:text-orange-400 transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Pagini */}
            <div>
              <h3 className="text-slate-300 font-bold text-xs mb-4 uppercase tracking-wider">Pagini speciale</h3>
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
                  { href: "/produse",          label: "Produse cu reducere" },
                  { href: "/blog",             label: "Blog" },
                  { href: "/categorii",        label: "Toate categoriile" },
                  { href: "/toate-magazinele", label: "Toate magazinele" },
                ].map(l => (
                  <li key={l.href}><a href={l.href} className="hover:text-orange-400 transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h3 className="text-slate-300 font-bold text-xs mb-4 uppercase tracking-wider">Legal & Info</h3>
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
                      className="hover:text-orange-400 transition-colors flex items-center gap-1">
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

          <div className="border-t border-white/5 pt-6 space-y-2">
            <p className="text-xs text-slate-700 leading-relaxed max-w-4xl">
              Linkurile de pe AmCupon.ro sunt linkuri afiliate generate prin 2Performant. Cand accesezi un magazin partener si efectuezi o achizitie, primim un comision de la magazin fara niciun cost suplimentar pentru tine.
            </p>
            <p className="text-xs text-slate-800">
              &copy; {new Date().getFullYear()} AmCupon.ro &mdash; Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── SOCIAL PROOF ───────────────────────────────────────────────────────── */
function socialProof(magazin: string): { vizualizari: number; activi: number } {
  const day = new Date().toISOString().slice(0, 10);
  const h1  = [...(magazin + day)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffff, 0);
  const h2  = [...magazin].reduce((a, c) => (a * 17 + c.charCodeAt(0)) & 0xff, 0);
  const base = 28 + (h1 % 84);
  const factor = [0.6, 0.75, 0.85, 0.95, 1.1, 1.45, 1.25][new Date().getDay()];
  return { vizualizari: Math.round(base * factor), activi: 2 + (h2 % 7) };
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
function formatCashback(comision: string): string | null {
  if (!comision) return null;
  // Extrage numere din string: "5%", "3-8%", "2% - 5%", "10", "0"
  const nums = comision.match(/[\d.]+/g)?.map(Number) ?? [];
  if (!nums.length) return null;
  const max = Math.max(...nums);
  if (max <= 0) return null;
  if (nums.length > 1) return `Cashback pana la ${max}%`;
  return `Cashback ${max}%`;
}

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
    <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full animate-pulse">
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
  const trustScore     = m.procent_succes || (m.are_promotie ? 78 : 50);
  const cashbackText   = formatCashback(m.comision);

  const proof = socialProof(m.magazin);
  const [imgOk, setImgOk] = useState(true);
  const [rating, setRating] = useState<"ok"|"nok"|null>(() => {
    try { return localStorage.getItem(`rating_${m.magazin}`) as "ok"|"nok"|null; } catch { return null; }
  });

  function voteaza(v: "ok"|"nok", e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setRating(v);
    try { localStorage.setItem(`rating_${m.magazin}`, v); } catch {}
  }

  const logoColors = ["bg-blue-500","bg-violet-500","bg-teal-500","bg-pink-500","bg-indigo-500","bg-emerald-600","bg-red-500","bg-amber-500"];
  const logoBg     = logoColors[initiala.charCodeAt(0) % logoColors.length];

  const expiraAzi   = promo && promo.zile_ramase === 0;
  const expiraMaine = promo && promo.zile_ramase === 1;
  const expiraCurand= promo && promo.zile_ramase <= 3 && promo.zile_ramase > 0;
  const isHot       = m.trend > 2 || (m.sales_number || 0) > 100;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group ${expiraAzi ? "border-red-300 ring-1 ring-red-200" : "border-slate-200 dark:border-slate-700"}`}>

      {/* Trust Score bar — rosu pentru expira azi, portocaliu maine, verde normal */}
      <div className="h-1 bg-slate-100 overflow-hidden">
        <div className={`h-full transition-all duration-700 rounded-r-full ${expiraAzi ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse" : expiraMaine ? "bg-gradient-to-r from-orange-400 to-amber-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`} style={{width:`${trustScore}%`}}/>
      </div>

      {/* Header: logo + info + buttons */}
      <a href={`/cod-reducere/${m.magazin}`} className="flex items-start gap-3 p-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden group-hover:border-orange-300 transition-colors">
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
              <h3 className="font-black text-slate-900 text-sm leading-tight group-hover:text-orange-600 transition-colors truncate">
                {numeMagazin}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{m.categorie}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0 -mt-0.5">
              {isHot && !m.exclusiv && (
                <span className="text-[9px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full tracking-wide">🔥 HOT</span>
              )}
              {m.exclusiv && (
                <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full tracking-wide">EXCLUSIV</span>
              )}
              <button onClick={e => onToggleFavorit(m.magazin, e)}
                className="p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
                title={isFavorit ? "Elimina din favorite" : "Adauga la favorite"}>
                <svg className={`w-3.5 h-3.5 transition-colors ${isFavorit ? "fill-red-500 stroke-red-500" : "fill-none stroke-slate-300 hover:stroke-red-400"}`} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {badgeReducere && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                {badgeReducere}
                {cashbackText && <span className="opacity-60 ml-0.5">+ CB</span>}
              </span>
            )}
            {!badgeReducere && m.are_promotie && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded-full">
                Oferta activa
              </span>
            )}
            {!m.are_promotie && cashbackText && (
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-full">
                {cashbackText}
              </span>
            )}
            {m.cod_cupon && (
              <span className="text-[10px] font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-full">
                Cod cupon
              </span>
            )}
            {m.trend > 0 && (
              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                Trending
              </span>
            )}
          </div>
        </div>
      </a>

      {/* Promo description */}
      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{promo.nume}</p>
        ) : cashbackText ? (
          <p className="text-xs text-teal-600 font-medium leading-relaxed">
            Cumpara prin AmCupon si primesti <strong>{cashbackText.toLowerCase()}</strong> automat
          </p>
        ) : (
          <p className="text-xs text-slate-400 italic">Fara promotii active momentan</p>
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
        {m.are_promotie && (
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-green-400 inline-block animate-pulse"/>
            {proof.activi} acum
          </span>
        )}
        {m.are_promotie && m.procent_succes > 0 && (
          <span className="text-[10px] text-slate-400">{m.procent_succes}% succes</span>
        )}
        {!m.are_promotie && m.folosit_de > 0 && (
          <span className="text-[10px] text-slate-400">{m.folosit_de}x folosit</span>
        )}
        {m.are_promotie && (
          <span className="text-[10px] text-slate-400">👁 {proof.vizualizari} azi</span>
        )}
        {expiraAzi && <CardCountdown zileRamase={0} />}
        {expiraMaine && <CardCountdown zileRamase={1} />}
        {expiraCurand && !expiraAzi && !expiraMaine && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
            ⏳ {promo!.zile_ramase}z ramase
          </span>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-4">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-orange-400 rounded-xl py-2.5 text-center bg-orange-50">
                <span className="font-mono font-black text-orange-600 tracking-widest text-sm">{promo.cod_cupon}</span>
              </div>
              <a href={link} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {copiat ? "Copiat! Mergi la magazin" : "Mergi la magazin →"}
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-slate-200 rounded-xl py-2.5 text-center bg-slate-50">
                <span className="font-mono text-slate-400 text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button onClick={() => onCopiere(m.magazin, promo.cod_cupon, link)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Copiaza codul + mergi la magazin
              </button>
            </div>
          )
        ) : promo ? (
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
            Vezi oferta →
          </a>
        ) : (
          <a href={m.url_afiliat || m.url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center justify-center w-full font-medium py-2.5 rounded-xl text-sm transition-colors ${
              cashbackText
                ? "bg-teal-500 hover:bg-teal-600 text-white"
                : "border border-slate-200 hover:border-orange-300 text-slate-500 hover:text-orange-500"
            }`}>
            {cashbackText ? `Viziteaza + ${cashbackText}` : "Viziteaza magazinul"}
          </a>
        )}
      </div>

      {/* Voting */}
      {promo && (
        <div className="px-4 pb-4 border-t border-slate-50 pt-3">
          {rating ? (
            <p className="text-[11px] text-center font-semibold text-emerald-600">
              {rating === "ok" ? "Multumim pentru feedback!" : "Am notat, verificam!"}
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400">A functionat codul?</span>
              <button onClick={e => voteaza("ok", e)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-semibold transition-colors border border-emerald-200">
                Da
              </button>
              <button onClick={e => voteaza("nok", e)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 font-semibold transition-colors border border-slate-200 hover:border-red-200">
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse overflow-hidden">
      <div className="h-1 bg-slate-100"/>
      <div className="flex items-start gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0"/>
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3.5 w-28 bg-slate-200 rounded"/>
          <div className="h-3 w-16 bg-slate-100 rounded"/>
          <div className="flex gap-1">
            <div className="h-4 w-20 bg-slate-100 rounded-full"/>
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 space-y-1.5">
        <div className="h-3 w-full bg-slate-100 rounded"/>
        <div className="h-3 w-3/4 bg-slate-100 rounded"/>
      </div>
      <div className="px-4 pb-4">
        <div className="h-10 w-full bg-slate-200 rounded-xl"/>
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
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 text-white text-center border border-white/15">
        <p className="font-black text-xl mb-1">Multumim!</p>
        <p className="text-sm text-slate-400">Te-ai abonat cu succes. Vei primi ofertele zilei pe email.</p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={trimite} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input type="email" value={email} onChange={e => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
          placeholder="adresa@email.ro" disabled={status === "loading"}
          className="flex-1 px-4 py-3.5 rounded-xl bg-white/10 border border-white/15 text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/40 disabled:opacity-60 transition-all"/>
        <button type="submit" disabled={status === "loading"}
          className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-black px-7 py-3.5 rounded-xl text-sm transition-colors whitespace-nowrap shadow-lg shadow-orange-500/25">
          {status === "loading" ? "Se trimite..." : "Aboneaza-te"}
        </button>
      </form>
      {status === "err" && errMsg && (
        <p className="text-white/60 text-xs mt-2 text-center">{errMsg}</p>
      )}
    </div>
  );
}
