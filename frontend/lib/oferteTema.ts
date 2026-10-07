import fs from "fs";
import path from "path";
import { linkAfiliat, GAZDE_TRACKING } from "./linkMagazin";
import { produseTema, sectiuneTema, normTitlu, REGULI_TEME, type ProdusFeed, type SectiuneTema } from "./topFeed";

/**
 * Ofertele de azi pentru o tema (lib/topFeed.ts), citite din feed — DOAR pe server.
 * Folosit de /top/[slug] si de articolele de blog „Cel mai bun X", ca amandoua sa arate
 * aceleasi produse, cu aceeasi regula de link platit (lib/linkMagazin.ts).
 *
 * Feed-ul (~19 MB) si magazinele se citesc o singura data per proces de build, nu o data
 * pe pagina (30 de pagini /top + ~24 de articole).
 */

let _feed: { updated: string; products: ProdusFeed[] } | null = null;
function feed() {
  if (!_feed) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "products.json"), "utf-8"));
      _feed = { updated: typeof raw.updated === "string" ? raw.updated : "", products: raw.products || [] };
    } catch {
      _feed = { updated: "", products: [] };
    }
  }
  return _feed;
}

let _linkuri: Map<string, string> | null = null;
/** magazin -> linkul lui afiliat REAL; magazinele fara link nu apar in harta. */
export function linkuriPlatite(): Map<string, string> {
  if (!_linkuri) {
    _linkuri = new Map();
    try {
      const mag: { magazin: string; url?: string | null; url_afiliat?: string | null }[] =
        JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
      for (const m of mag) {
        const l = linkAfiliat(m);
        if (l) _linkuri.set(m.magazin, l);
      }
    } catch {
      /* fara output.json: nicio sectiune de oferte si niciun buton de magazin */
    }
  }
  return _linkuri;
}

/** Data feed-ului, ora Romaniei: „5 octombrie 2026, 15:56". */
export function dataFeed(): string {
  const d = new Date(feed().updated);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(d);
}

/** Sectiunea „Unde gasesti azi" pentru o tema, sau null (tema fara regula sau sub prag). */
export function sectiunePentru(tema: string, opt: { filtru?: RegExp; minMagazine?: number } = {}): SectiuneTema | null {
  if (!REGULI_TEME[tema]) return null;
  const linkuri = linkuriPlatite();
  const lista = produseTema(tema, feed().products, (s) => linkuri.has(s), (u) => GAZDE_TRACKING.test(u))
    .filter((p) => !opt.filtru || opt.filtru.test(normTitlu(p.title)));
  return sectiuneTema(lista, 4, opt.minMagazine);
}

/**
 * Un model recomandat intr-un articol, cautat in feed-ul partenerilor (scripts/articole_verificate.py
 * -> campul `oferte_modele`). 07.10.2026: ca la Wirecutter/RTINGS, sub fiecare model recomandat apare
 * oferta de azi, daca un partener cu link platit il are — nu doar o lista generica la finalul articolului.
 */
export interface ModelCautat {
  /** Inceputul titlului H3 din articol sub care apare oferta. */
  titlu: string;
  /** Toate trebuie sa apara in titlul produsului (normalizat). */
  cauta: string[];
  /** Tipul produsului, la inceputul titlului: „telefon|smartphone", „laptop|ultrabook|notebook"... */
  tip: string;
  /** Nu trebuie sa apara (ex. „max" ca iPhone 18 Pro sa nu prinda Pro Max). */
  fara?: string[];
}

export interface OfertaModel {
  titlu: string;
  magazin: string;
  pret: number;
  url: string;
  variante: number;
}

/** Cea mai ieftina oferta noua (nu resigilata) a modelului, la un partener cu link platit, sau null. */
export function ofertaModel(m: ModelCautat): OfertaModel | null {
  const linkuri = linkuriPlatite();
  const tip = new RegExp(`^(?:${m.tip})\\b`);
  const cauta = m.cauta.map((x) => normTitlu(x));
  const fara = (m.fara || []).map((x) => normTitlu(x));
  const gasite = feed().products.filter((p) => {
    const t = normTitlu(p.title);
    return !!p.merchant_slug && linkuri.has(p.merchant_slug) && !p.is_promo
      && !!p.url && GAZDE_TRACKING.test(p.url)
      && typeof p.price === "number" && p.price >= 50
      && tip.test(t) && cauta.every((x) => t.includes(x)) && !fara.some((x) => t.includes(x))
      && !/\b(resigilat|reconditionat|second hand|folosit|refurbished)\b/.test(t);
  });
  if (gasite.length === 0) return null;
  const p = gasite.reduce((a, b) => ((b.price as number) < (a.price as number) ? b : a));
  return { titlu: p.title || "", magazin: p.merchant_slug || "", pret: p.price as number, url: p.url as string, variante: gasite.length };
}
