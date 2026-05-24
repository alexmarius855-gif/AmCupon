"use client";

import { useEffect, useState } from "react";

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

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return ""; }
}

function maskCod(cod: string): string {
  if (!cod || cod.length <= 4) return cod;
  return cod.slice(0, 4) + "*".repeat(Math.min(cod.length - 4, 6));
}

function extractDiscount(text: string): string | null {
  const m = text?.match(/(\d+)\s*%/);
  return m ? m[1] + "%" : null;
}

function numeAfisat(magazin: string): string {
  return magazin.split(".")[0].replace(/-/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function Home() {
  const [magazine, setMagazine] = useState<Magazin[]>([]);
  const [filtru, setFiltru] = useState("toate");
  const [cautare, setCautare] = useState("");
  const [coduriReveal, setCoduriReveal] = useState<Set<string>>(new Set());
  const [copiat, setCopiat] = useState<string | null>(null);

  useEffect(() => {
    fetch("/output.json").then((r) => r.json()).then(setMagazine);
  }, []);

  const categorii = ["toate", ...Array.from(new Set(magazine.map((m) => m.categorie).filter(Boolean))).sort()];

  const filtrate = magazine.filter((m) => {
    const cat = filtru === "toate" || m.categorie === filtru;
    const search = cautare === "" || m.magazin.toLowerCase().includes(cautare.toLowerCase());
    return cat && search;
  });

  const expiraAzi = filtrate.filter((m) => m.are_promotie && m.zile_ramase <= 1);
  const cuPromotii = filtrate.filter((m) => m.are_promotie);
  const faraPromotii = filtrate.filter((m) => !m.are_promotie).slice(0, 60);

  function copiazaCod(id: string, cod: string) {
    setCoduriReveal((prev) => new Set(prev).add(id));
    navigator.clipboard.writeText(cod).catch(() => {});
    setCopiat(id);
    setTimeout(() => setCopiat(null), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <div className="flex-1 relative max-w-2xl">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Answear, Farmec, Noriel..."
              value={cautare}
              onChange={(e) => setCautare(e.target.value)}
              className="w-full border border-gray-300 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-600">
            <a href="#promotii" className="hover:text-orange-500 transition-colors">Promoții</a>
            <a href="#magazine" className="hover:text-orange-500 transition-colors">Magazine</a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black mb-1">
            Coduri de reducere verificate din România
          </h1>
          <p className="text-orange-100 text-sm mb-4">
            {cuPromotii.length} promoții active · {magazine.length} magazine partenere · Actualizat zilnic
          </p>
          <div className="flex flex-wrap gap-2">
            {categorii.slice(0, 12).map((c) => (
              <button
                key={c}
                onClick={() => setFiltru(c)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filtru === c ? "bg-white text-orange-600 shadow" : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {c === "toate" ? "Toate categoriile" : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* EXPIRA AZI — sectiune urgenta */}
        {expiraAzi.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">EXPIRĂ AZI</span>
              <h2 className="text-xl font-black text-gray-900">Oferte care se termină azi</h2>
              <span className="text-sm text-gray-400">{expiraAzi.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {expiraAzi.map((m) => (
                <Card key={m.magazin + "_azi"} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}

        {/* PROMOTII ACTIVE */}
        {cuPromotii.length > 0 && (
          <section id="promotii" className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
              <h2 className="text-xl font-black text-gray-900">Promoții Active</h2>
              <span className="text-sm text-gray-400">{cuPromotii.length} oferte</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cuPromotii.slice(0, 12).map((m) => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}

        {/* MAGAZINE */}
        {faraPromotii.length > 0 && (
          <section id="magazine">
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-xl font-black text-gray-900">Magazine Partenere</h2>
              <span className="text-sm text-gray-400">{filtrate.length} total</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.map((m) => (
                <Card key={m.magazin} m={m} revealed={coduriReveal.has(m.magazin)} copiat={copiat === m.magazin} onCopiere={copiazaCod} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* NEWSLETTER */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 py-12 px-4 mt-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-black text-white mb-2">
            🎁 Primește ofertele zilei pe email
          </h2>
          <p className="text-orange-100 text-sm mb-6">
            Abonează-te și fii primul care află codurile de reducere exclusive. Fără spam, dezabonare oricând.
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4 mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-orange-500 text-white font-black text-sm px-2 py-0.5 rounded">Am</div>
                <span className="font-black text-white text-lg">Cupon.ro</span>
              </div>
              <p className="text-sm leading-relaxed">
                Coduri de reducere verificate și oferte exclusive de la cele mai mari magazine online din România. Actualizat zilnic.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-3">Categorii populare</h3>
              <ul className="space-y-1.5 text-sm">
                <li><a href="/categorii/fashion" className="hover:text-orange-400 transition-colors">Fashion</a></li>
                <li><a href="/categorii/home-garden" className="hover:text-orange-400 transition-colors">Casă &amp; Grădină</a></li>
                <li><a href="/categorii/electronics-itc" className="hover:text-orange-400 transition-colors">Electronice</a></li>
                <li><a href="/categorii/books" className="hover:text-orange-400 transition-colors">Cărți</a></li>
                <li><a href="/categorii/pharma" className="hover:text-orange-400 transition-colors">Farmacie</a></li>
                <li><a href="/categorii/sports-outdoors" className="hover:text-orange-400 transition-colors">Sport</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-3">Informații</h3>
              <ul className="space-y-1.5 text-sm">
                <li><a href="/termeni" className="hover:text-orange-400 transition-colors">Termeni și Condiții</a></li>
                <li><a href="/termeni#gdpr" className="hover:text-orange-400 transition-colors">GDPR & Confidențialitate</a></li>
                <li><a href="/termeni#cookies" className="hover:text-orange-400 transition-colors">Politica Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-xs text-gray-600">
              © 2026 AmCupon.ro · Linkurile de pe site sunt linkuri de afiliat. Primim un comision când cumperi, fără costuri suplimentare pentru tine.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ m, revealed, copiat, onCopiere }: {
  m: Magazin;
  revealed: boolean;
  copiat: boolean;
  onCopiere: (id: string, cod: string) => void;
}) {
  const promo = m.promotii[0];
  const logoSrc = m.logo_url || "";
  const discount = promo ? (extractDiscount(promo.nume) || extractDiscount(promo.descriere || "")) : null;
  const numeMagazin = numeAfisat(m.magazin);
  const initiala = numeMagazin.charAt(0).toUpperCase();
  const link = promo?.landing_page || m.url_afiliat || m.url;
  const [imgOk, setImgOk] = useState(true);

  const culoriInitiala = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500",
    "bg-indigo-500", "bg-teal-500", "bg-red-500", "bg-yellow-500"
  ];
  const culoare = culoriInitiala[initiala.charCodeAt(0) % culoriInitiala.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden">

      {/* LOGO AREA */}
      <a href={`/reduceri/${m.magazin}`} className="flex flex-col items-center justify-center pt-5 pb-3 px-4 group relative">
        {m.exclusiv && (
          <span className="absolute top-3 right-3 text-xs font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">
            Exclusiv
          </span>
        )}
        <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mb-3 bg-white border border-gray-100 p-1 group-hover:border-orange-300 transition-colors">
          {logoSrc && imgOk ? (
            <img
              src={logoSrc}
              alt={numeMagazin}
              className="w-full h-full object-contain"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className={`w-full h-full rounded-xl ${culoare} flex items-center justify-center`}>
              <span className="text-white font-black text-3xl">{initiala}</span>
            </div>
          )}
        </div>
        <h3 className="font-black text-gray-900 text-base text-center group-hover:text-orange-500 transition-colors">{numeMagazin}</h3>
        <span className="text-xs text-gray-400 mt-0.5">{m.categorie}</span>
      </a>

      {/* LABEL */}
      <div className="px-4 pb-2 text-center min-h-[20px]">
        {(promo?.cod_cupon || promo) && (
          <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
            {promo?.cod_cupon ? "Cod Reducere" : "Ofertă Specială"}
            {discount && <span className="ml-1 text-orange-500">{discount}</span>}
          </span>
        )}
      </div>

      {/* DESCRIERE */}
      <div className="px-4 pb-3 flex-1">
        {promo ? (
          <p className="text-sm text-gray-600 text-center line-clamp-2">{promo.nume}</p>
        ) : (
          <p className="text-sm text-gray-400 text-center">Fără promoții active momentan</p>
        )}
      </div>

      {/* BADGES */}
      <div className="px-4 pb-2 flex flex-wrap justify-center gap-2">
        {promo && promo.zile_ramase <= 3 && (
          <span className="text-xs font-semibold text-red-500">
            Expiră în {promo.zile_ramase === 0 ? "azi" : `${promo.zile_ramase}z`}
          </span>
        )}
        {m.trend > 0 && (
          <span className="text-xs text-purple-500">Trending</span>
        )}
        {m.are_promotie && m.cod_cupon && (
          <span className="text-xs text-green-600 font-semibold">{m.procent_succes}% succes</span>
        )}
        {m.folosit_de > 0 && (
          <span className="text-xs text-gray-400">Folosit de {m.folosit_de}x</span>
        )}
      </div>

      {/* COD / BUTON */}
      <div className="px-4 pb-5">
        {promo?.cod_cupon ? (
          revealed ? (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-orange-400 rounded-xl py-2 text-center bg-orange-50">
                <span className="font-mono font-black text-orange-600 tracking-widest text-sm">
                  {promo.cod_cupon}
                </span>
              </div>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                {copiat ? "Copiat! Mergi la magazin" : "Mergi la magazin"}
              </a>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="border-2 border-dashed border-gray-300 rounded-xl py-2 text-center">
                <span className="font-mono text-gray-400 text-sm">{maskCod(promo.cod_cupon)}</span>
              </div>
              <button
                onClick={() => onCopiere(m.magazin, promo.cod_cupon)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
              >
                Copiază codul
              </button>
            </div>
          )
        ) : promo ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            Vezi oferta
          </a>
        ) : (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full border border-gray-200 hover:border-orange-300 text-gray-500 hover:text-orange-500 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Vizitează magazinul
          </a>
        )}
      </div>
    </div>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  function trimite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setStatus("err"); return; }
    // TODO: conecteaza la Brevo API
    setStatus("ok");
    setEmail("");
  }

  return (
    <form onSubmit={trimite} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="adresa@email.ro"
        className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white"
      />
      <button
        type="submit"
        className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors whitespace-nowrap"
      >
        {status === "ok" ? "✓ Abonat!" : "Abonează-te"}
      </button>
      {status === "err" && <p className="text-white text-xs mt-1">Introdu un email valid.</p>}
    </form>
  );
}
