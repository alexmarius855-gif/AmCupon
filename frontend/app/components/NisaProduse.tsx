import fs from "fs";
import path from "path";
import { EXCLUS_GLOBAL, familie, imagineSigura, normTitlu, produseTema, titluAfisat } from "@/lib/topFeed";
import { linkuriPlatite } from "@/lib/oferteTema";
import { GAZDE_TRACKING } from "@/lib/linkMagazin";
import { numeAfisat } from "@/lib/numeMagazin";

interface Produs {
  id: string;
  title: string;
  url: string;
  image: string;
  price: number;
  old_price?: number;
  discount_pct: number;
  category: string;
  cat_slug?: string;
  brand: string;
  merchant: string;
  merchant_slug: string;
  is_promo?: boolean;
  cod_cupon?: string;
  zile_ramase?: number;
}

interface ProductsJson {
  products?: Produs[];
}

/** Produsele din feed n-au `id` (doar promo-produsele au) — identitatea e linkul. */
const cheie = (p: Produs) => p.url || p.id || p.title;

let _toate: Produs[] | null = null;
function loadAll(): Produs[] {
  if (_toate) return _toate;
  const filePath = path.join(process.cwd(), "public", "products.json");
  if (!fs.existsSync(filePath)) return (_toate = []);
  const raw: ProductsJson | Produs[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return (_toate = Array.isArray(raw) ? raw : (raw.products ?? []));
}

/**
 * Titlul de afisat. 07.10.2026: promotiile transformate in „produse" (enrich_products_from_promos.py)
 * aveau codul INTREG in titlu („… — Cod: VR70") — codul se vedea fara clic pe linkul platit, deci
 * fara comision (pe restul site-ului codul e mascat). Iar unele titluri erau doar codul („SAVE10").
 */
function titluCard(p: Produs): string {
  let t = titluAfisat(p.title).replace(/\s+—\s+Cod:\s*\S+\s*$/u, "");
  const cod = (p.cod_cupon || "").trim();
  if (cod.length >= 3) t = t.replace(new RegExp(cod.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "");
  return t.replace(/\s{2,}/g, " ").replace(/^[\s—–:|-]+|[\s—–:|-]+$/gu, "").trim();
}
const titluPublicabil = (p: Produs) => titluCard(p).includes(" ");

/** Reducerea reala intai, apoi ordinea primita; cel mult `max` produse de la acelasi magazin si
 *  un singur produs pe model (variantele de culoare/marime arata ca dubluri pe grila). */
function alege(lista: Produs[], limit: number, max: number): Produs[] {
  const cuDisc = lista.filter(p => p.discount_pct > 0 && p.old_price).sort((a, b) => b.discount_pct - a.discount_pct);
  const farDisc = lista.filter(p => !(p.discount_pct > 0 && p.old_price));
  const pe: Record<string, number> = {};
  const modele = new Set<string>();
  const out: Produs[] = [];
  for (const p of [...cuDisc, ...farDisc]) {
    if (out.length >= limit) break;
    const model = familie(p.title);
    if (model && modele.has(model)) continue;
    const k = p.merchant_slug || p.merchant;
    if ((pe[k] = (pe[k] || 0) + 1) > max) continue;
    if (model) modele.add(model);
    out.push(p);
  }
  return out;
}

function getProduse(
  merchantSlugs: string[], catSlug: string, limit: number,
  opt: { teme?: string[]; potrivire?: RegExp },
): Produs[] {
  const all = loadAll();

  // Cu teme (lib/topFeed.ts): exact regula de pe /top si de sub articolele „Cel mai bun X" —
  // tipul produsului, produs nou, pret credibil, magazin cu link platit. 07.10.2026: pe /laptop,
  // sub „Laptopuri de la magazinele partenere", erau casti, o roata de abdomene, placute de frana
  // si o friteuza — tot ce vindea evomag.ro. Fara cadere pe promotii: o promotie nu e un laptop.
  if (opt.teme?.length) {
    const linkuri = linkuriPlatite();
    const vazute = new Set<string>();
    const lista: Produs[] = [];
    for (const t of opt.teme) {
      for (const p of produseTema(t, all, s => linkuri.has(s), u => GAZDE_TRACKING.test(u)) as Produs[]) {
        if (vazute.has(cheie(p)) || !imagineSigura(p.image)) continue;
        vazute.add(cheie(p));
        lista.push(p);
      }
    }
    return alege(lista, limit, Math.ceil(limit / 3));
  }

  // Prioritate 1: produse reale (cu pret) de la merchantii specificati — sau, cu `potrivire` si
  // fara magazine date, de la orice magazin cu link platit.
  const platite = opt.potrivire && merchantSlugs.length === 0 ? linkuriPlatite() : null;
  const reale = all.filter(p =>
    (platite ? platite.has(p.merchant_slug) : merchantSlugs.some(s => p.merchant_slug === s || p.merchant === s))
    && p.price > 0
    && p.image
    && p.title
    && (!opt.potrivire || (opt.potrivire.test(normTitlu(p.title)) && !EXCLUS_GLOBAL.test(normTitlu(p.title))))
  );
  const sortate = alege(reale, limit, limit);

  // Cu `potrivire`, doar produsele care chiar sunt din nisa (fara promotii generice ale magazinelor).
  if (opt.potrivire || sortate.length >= limit) return sortate;

  // Prioritate 2: promo-produse (fara pret) de la merchantii specificati
  const promoMerchant = all.filter(p =>
    merchantSlugs.some(s => p.merchant_slug === s || p.merchant === s)
    && p.is_promo
    && p.image
    && p.title
    && titluPublicabil(p)
    && !sortate.some(e => cheie(e) === cheie(p))
  ).slice(0, limit - sortate.length);

  const combined = [...sortate, ...promoMerchant];
  if (combined.length >= limit) return combined;

  // Prioritate 3: promo-produse fallback pe cat_slug
  if (catSlug) {
    const promoCat = all.filter(p =>
      p.cat_slug === catSlug
      && p.is_promo
      && p.image
      && p.title
      && titluPublicabil(p)
      && !combined.some(e => cheie(e) === cheie(p))
    ).slice(0, limit - combined.length);
    return [...combined, ...promoCat];
  }

  return combined;
}

// Clase Tailwind complete si statice — Tailwind nu poate detecta clase construite
// dinamic prin interpolare (ex. `text-${culoareAccent}-600`), asa ca avem nevoie
// de un lookup cu fiecare combinatie scrisa literal. `textPe` = textul de PE fundalul
// accentului: pe lime (si pe verde/galben deschis) textul alb nu se citeste.
const ACCENT_CLASSES: Record<string, { text: string; bg: string; textPe: string; border: string; groupHoverText: string }> = {
  purple:  { text: "text-[#ddf93c]",  bg: "bg-[#ddf93c]",  textPe: "text-[#0c1000]", border: "hover:border-[#ddf93c]",  groupHoverText: "group-hover:text-[#ddf93c]" },
  green:   { text: "text-green-600",   bg: "bg-green-500",   textPe: "text-[#0c1000]", border: "hover:border-green-300",   groupHoverText: "group-hover:text-green-600" },
  blue:    { text: "text-[#ddf93c]",    bg: "bg-[#ddf93c]",    textPe: "text-[#0c1000]", border: "hover:border-[#ddf93c]",    groupHoverText: "group-hover:text-[#ddf93c]" },
  pink:    { text: "text-[#ddf93c]",    bg: "bg-[#ddf93c]",    textPe: "text-[#0c1000]", border: "hover:border-[#ddf93c]",    groupHoverText: "group-hover:text-[#ddf93c]" },
  emerald: { text: "text-emerald-600", bg: "bg-emerald-500", textPe: "text-[#0c1000]", border: "hover:border-emerald-300", groupHoverText: "group-hover:text-emerald-600" },
  yellow:  { text: "text-yellow-600",  bg: "bg-yellow-500",  textPe: "text-[#0c1000]", border: "hover:border-yellow-300",  groupHoverText: "group-hover:text-yellow-600" },
  indigo:  { text: "text-[#ddf93c]",  bg: "bg-[#ddf93c]",  textPe: "text-[#0c1000]", border: "hover:border-[#c3dd2c]",  groupHoverText: "group-hover:text-[#ddf93c]" },
  amber:   { text: "text-[#ddf93c]",   bg: "bg-[#ddf93c]",   textPe: "text-[#0c1000]", border: "hover:border-[#ddf93c]",   groupHoverText: "group-hover:text-[#ddf93c]" },
  rose:    { text: "text-[#ddf93c]",    bg: "bg-[#ddf93c]",    textPe: "text-[#0c1000]", border: "hover:border-[#ddf93c]",    groupHoverText: "group-hover:text-[#ddf93c]" },
  gray:    { text: "text-gray-600",    bg: "bg-gray-500",    textPe: "text-[#ffffff]", border: "hover:border-[#3a4048]",    groupHoverText: "group-hover:text-gray-600" },
  teal:    { text: "text-[#ddf93c]",    bg: "bg-[#ddf93c]",    textPe: "text-[#0c1000]", border: "hover:border-[#ddf93c]",    groupHoverText: "group-hover:text-[#ddf93c]" },
  violet:  { text: "text-[#ddf93c]",  bg: "bg-[#ddf93c]",  textPe: "text-[#0c1000]", border: "hover:border-[#ddf93c]",  groupHoverText: "group-hover:text-[#ddf93c]" },
  cyan:    { text: "text-[#ddf93c]",    bg: "bg-[#ddf93c]",    textPe: "text-[#0c1000]", border: "hover:border-[#c3dd2c]",    groupHoverText: "group-hover:text-[#ddf93c]" },
};

export default function NisaProduse({
  merchantSlugs,
  catSlug = "",
  titlu = "Produse populare",
  culoareAccent = "indigo",
  limit = 12,
  teme,
  potrivire,
}: {
  merchantSlugs: string[];
  catSlug?: string;
  titlu?: string;
  culoareAccent?: string;
  limit?: number;
  /** Teme din lib/topFeed.ts (REGULI_TEME): produsele vin din TOATE feed-urile partenerilor. */
  teme?: string[];
  /** Regex pe titlul normalizat (minuscule, fara diacritice): doar produsele din nisa. */
  potrivire?: RegExp;
}) {
  const produse = getProduse(merchantSlugs, catSlug, limit, { teme, potrivire });
  if (produse.length === 0) return null;

  const accent     = ACCENT_CLASSES[culoareAccent] || ACCENT_CLASSES.indigo;
  const textAccent = accent.text;
  const bgAccent   = accent.bg;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-12">
      <h2 className="text-xl font-black text-[#ffffff] mb-5">{titlu}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {produse.map((p) => {
          const hasPrice   = p.price > 0;
          const hasDiscount = hasPrice && p.discount_pct > 0 && p.old_price;
          const hasCod      = !!p.cod_cupon;
          const titluP      = titluCard(p);

          return (
            <a
              key={cheie(p)}
              href={p.url}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className={`group bg-[#14181c] border border-[#1f2329] ${accent.border} rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5 duration-200 flex flex-col`}
            >
              {/* Imagine — pe alb: pozele de produs si logo-urile sunt facute pentru fundal alb */}
              <div className="relative bg-[#ffffff] aspect-square overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={titluP}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {hasDiscount && (
                  <div className={`absolute top-2 left-2 ${bgAccent} ${accent.textPe} text-xs font-black px-2 py-0.5 rounded-full`}>
                    -{p.discount_pct}%
                  </div>
                )}
                {!hasDiscount && hasCod && (
                  <div className="absolute top-2 left-2 bg-emerald-700 text-white text-xs font-black px-2 py-0.5 rounded-full">
                    COD
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col flex-1">
                <p className="text-xs text-[#9399a0] mb-1 truncate">{p.is_promo ? numeAfisat(p.merchant_slug) : (p.brand || numeAfisat(p.merchant_slug))}</p>
                <p className={`text-sm font-semibold text-[#c9ced5] line-clamp-2 flex-1 ${accent.groupHoverText} transition-colors leading-snug`}>
                  {titluP}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {hasPrice ? (
                    <>
                      <span className={`font-black ${textAccent} text-base`}>
                        {p.price.toFixed(0)} lei
                      </span>
                      {hasDiscount && p.old_price && (
                        <span className="text-xs text-[#9399a0] line-through">
                          {p.old_price.toFixed(0)} lei
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Ofertă activă
                    </span>
                  )}
                </div>
                <div className={`mt-2 text-xs font-bold ${textAccent} flex items-center gap-1`}>
                  {hasPrice ? "Vezi produsul" : "Vezi oferta"}
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
