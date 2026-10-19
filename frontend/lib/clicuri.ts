/**
 * Numararea CLICURILOR REALE pe linkuri afiliate — functii PURE (fara React, fara importuri),
 * ca sa se testeze direct cu Node: `node lib/clicuri.test.mjs`.
 *
 * DE CE EXISTA (19.10.2026): dupa ~4 luni, dashboard-ul Impact arata 627 de clicuri si 0 vanzari,
 * dar nu stiam CINE a facut clicurile: 220 + 87 veneau de la doua magazine straine pe care
 * romanii nu le cauta, multe magazine aveau exact 5 clicuri (probabil verificari automate), iar
 * GA4 numara doar cine acceptase cookie-urile. Fara o masuratoare proprie, orice decizie despre
 * „ce sa promovam" era o presupunere.
 *
 * CE NUMARAM, SI CE NU (promisiune facuta pe /confidentialitate): doar ziua, magazinul, pagina,
 * sursa, hostul de unde a venit omul si tipul de dispozitiv. Fara IP, fara cookie, fara user-agent
 * stocat, fara nicio valoare care sa identifice o persoana. User-agentul se foloseste O SINGURA
 * data, in server, ca sa decida mobil/desktop si bot/om — apoi se arunca.
 */

export type TipDispozitiv = "mobil" | "desktop" | "necunoscut";

/** Magazin minim din output.json, cat e nevoie ca sa recunoastem un link. */
export interface MagazinPentruClick {
  magazin: string;
  url_afiliat?: string | null;
  promotii?: Array<{ landing_page?: string | null }> | null;
}

export interface IndexLinkuri {
  /** `gazda/cale` (fara query) -> slug de magazin. Pentru linkurile de tip Impact (/c/<partener>/<reclama>/<campanie>). */
  dupaCale: Map<string, string[]>;
  /** brandul din domeniu (ex. „drmax") -> magazinele cu acel brand (mai multe cand exista variante de tara). */
  dupaBrand: Map<string, string[]>;
  /** toate slug-urile cunoscute — un magazin indicat de client conteaza doar daca exista aici. */
  slugs: Set<string>;
}

export interface Ajutoare {
  /** `brandDomeniu` din lib/numeMagazin.ts */
  brand: (domeniu: string) => string;
  /** `aceeasiTara` din lib/taraDomeniu.ts */
  aceeasiTara: (a: string, b: string) => boolean;
}

/** Roboti, crawlere si unelte de verificare de linkuri. Lista e la propriu: mai bine un om numarat ca robot
 *  (apare in coloana `bot`, nu dispare) decat un robot numarat ca om. */
const RE_BOT =
  /bot\b|crawl|spider|slurp|facebookexternalhit|headless|phantomjs|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|python-requests|curl\/|wget\/|go-http-client|java\/|okhttp|axios|node-fetch|httpclient|libwww|scrapy|preview|validator|checker/i;

export function esteBot(userAgent: string | null | undefined): boolean {
  const ua = (userAgent || "").trim();
  // Fara user-agent sau unul foarte scurt: nu e un browser real.
  if (ua.length < 20) return true;
  return RE_BOT.test(ua);
}

export function tipDispozitiv(userAgent: string | null | undefined): TipDispozitiv {
  const ua = userAgent || "";
  if (!ua) return "necunoscut";
  return /Mobi|Android|iPhone|iPad|iPod/i.test(ua) ? "mobil" : "desktop";
}

/** Doar hostul de unde a venit omul („google.com", „bing.com"); `null` pentru „direct". Niciodata calea sau query-ul. */
export function hostReferrer(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname.toLowerCase().replace(/^www\./, "");
    return h.slice(0, 80) || null;
  } catch {
    return null;
  }
}

function urlSigur(href: string): URL | null {
  try {
    return new URL(href);
  } catch {
    return null;
  }
}

/** `gazda/cale` fara query si fara slash final — cheia unui link de tip Impact. */
export function cheieCale(href: string): string | null {
  const u = urlSigur(href);
  if (!u) return null;
  const baza = `${u.hostname.toLowerCase()}${u.pathname.replace(/\/+$/, "")}`;
  // Awin: toate magazinele au aceeasi cale (/cread.php); magazinul e in `awinmid`.
  const awin = u.searchParams.get("awinmid");
  return awin ? `${baza}?awinmid=${awin}` : baza;
}

/** Hostul destinatiei, cand reteaua il pune in query (2Performant: `redirect_to`). */
export function gazdaDestinatie(href: string): string | null {
  const u = urlSigur(href);
  if (!u) return null;
  const dest = u.searchParams.get("redirect_to") || u.searchParams.get("url") || "";
  if (!dest) return null;
  const d = urlSigur(dest);
  return d ? d.hostname.toLowerCase().replace(/^www\./, "") : null;
}

export function construiesteIndex(magazine: MagazinPentruClick[], aj: Ajutoare): IndexLinkuri {
  const dupaCale = new Map<string, string[]>();
  const dupaBrand = new Map<string, string[]>();
  const slugs = new Set<string>();
  for (const m of magazine) {
    const slug = (m.magazin || "").toLowerCase();
    if (!slug) continue;
    slugs.add(slug);
    const brand = aj.brand(slug);
    if (brand) dupaBrand.set(brand, [...(dupaBrand.get(brand) || []), slug]);
    const linkuri = [m.url_afiliat, ...(m.promotii || []).map((p) => p?.landing_page)];
    for (const l of linkuri) {
      if (!l) continue;
      const k = cheieCale(l);
      // Doar caile cu ceva dupa gazda: „event.2performant.com/events/click" e COMUN tuturor magazinelor 2P
      // si ar atribui totul primului magazin. Acolo decide `redirect_to`, nu calea.
      // Awin fara `awinmid` ar avea aceeasi cheie pentru toate magazinele: se sare peste.
      const generic = /(^|\.)awin1\.com\/cread\.php$/.test(k || "");
      if (k && !k.startsWith("event.2performant.com") && !generic && k.includes("/")) {
        // Mai multe magazine pot imparti aceeasi campanie Impact (acelasi link: 13 din 953). Le tinem pe toate.
        const lista = dupaCale.get(k);
        if (!lista) dupaCale.set(k, [slug]);
        else if (!lista.includes(slug)) lista.push(slug);
      }
    }
  }
  return { dupaCale, dupaBrand, slugs };
}

/**
 * Magazinul unui click, in ordinea increderii:
 *   0. magazinul indicat de client (dezvaluirea unui cod il stie exact), DOAR daca exista in date —
 *      altfel oricine ar putea scrie orice nume in raport;
 *   1. destinatia din `redirect_to` (2Performant), potrivita pe brand + tara;
 *   2. calea linkului (Impact/Awin), cautata in linkurile cunoscute din output.json; daca mai multe magazine
 *      impart aceeasi campanie, castiga cel de pe pagina curenta;
 *   3. pagina `/cod-reducere/<slug>` pe care s-a dat clicul (cel mai probabil e vorba de acel magazin);
 *   4. „necunoscut" — niciodata ghicit.
 */
export function magazinDinLink(href: string, pagina: string, idx: IndexLinkuri, aj: Ajutoare, indiciu?: string | null): string {
  const ind = (indiciu || "").trim().toLowerCase();
  if (ind && idx.slugs.has(ind)) return ind;
  const dest = gazdaDestinatie(href);
  if (dest) {
    const candidati = idx.dupaBrand.get(aj.brand(dest)) || [];
    // Intai potrivirea exacta (vevor.com.au inaintea lui vevor.com), apoi brandul + tara.
    const potrivit = candidati.find((s) => s === dest) || candidati.find((s) => aj.aceeasiTara(dest, s)) || candidati[0];
    if (potrivit) return potrivit;
  }
  const k = cheieCale(href);
  const deLaCale = (k && idx.dupaCale.get(k)) || [];
  const m = /^\/cod-reducere\/([^/?#]+)/.exec(pagina || "");
  let slugPagina = "";
  if (m) {
    try { slugPagina = decodeURIComponent(m[1]).toLowerCase(); } catch { /* adresa murdara: ignorata */ }
  }
  // Linkul nu deosebeste magazinele care impart o campanie, pagina da: castiga cea pe care s-a dat clicul.
  if (deLaCale.length) return slugPagina && deLaCale.includes(slugPagina) ? slugPagina : deLaCale[0];
  if (slugPagina) return slugPagina;
  return "necunoscut";
}

/** Pagina curenta, normalizata: fara query, fara hash, max 200 de caractere, mereu cu `/` la inceput. */
export function paginaCurata(brut: unknown): string | null {
  if (typeof brut !== "string") return null;
  const p = brut.split(/[?#]/)[0].trim();
  if (!p.startsWith("/") || p.length > 200) return null;
  return p || "/";
}
