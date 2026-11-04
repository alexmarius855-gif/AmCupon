/**
 * ingest-2p.mts — duce magazinele, produsele si codurile in Supabase (04.11.2026).
 *
 * De ce ruleaza in GitHub Actions, nu ca functie Vercel: un feed are si 100.000 de produse, iar API-ul 2Performant
 * raspunde 429 dupa ~140 de cereri. O functie serverless ar expira la jumatate.
 *
 * Doua moduri:
 *   node ingest-2p.mts                              ia ce a ales criterii_produse.py + magazinele si codurile din output.json
 *   node ingest-2p.mts --feed 1096 --query "laptop" --pagini 5   citeste direct din API un feed, cu paginare
 * Oricare + `--proba`: nu scrie nimic, doar spune ce ar scrie.
 *
 * Istoricul de pret se scrie singur: declansatorul `products_noteaza_pret` din baza de date noteaza fiecare schimbare.
 * Produsele nevazute de ZILE_STOC zile devin `in_stock = false`, dar raman in baza, ca sa nu se piarda istoricul.
 *
 * Variabile: SUPABASE_SERVICE_ROLE_KEY (pentru scriere), TWOPEFORMANT_EMAIL, TWOPEFORMANT_PASS (doar la --feed).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RADACINA = join(dirname(fileURLToPath(import.meta.url)), "..");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://ktfoaqprezeqzoeuohnh.supabase.co";
const API_2P = "https://api.2performant.com";
const LOT = 500;
const ZILE_STOC = 7;
const PAUZA_MS = 250;
const PAUZE_429 = [30, 90, 180];
const ASTEPTARE_MAXIMA_S = 300;

// ── Curatare: functii pure, testate in ingest-2p.test.mts ─────────────────────
export function slugify(text: string): string {
  return (text || "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/, "");
}

/** Adresa pe site: titlul + o amprenta scurta, fiindca doua produse pot avea acelasi titlu. */
export function slugProdus(titlu: string, magazin: string, id: string): string {
  const amprenta = createHash("sha1").update(`${magazin}|${id}`).digest("hex").slice(0, 8);
  return `${slugify(titlu) || "produs"}-${amprenta}`;
}

const ENTITATI: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'", "&nbsp;": " " };

export function curataHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTITATI[e.toLowerCase()] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function pretDin(x: unknown): number {
  if (typeof x === "number") return x;
  let t = String(x ?? "").replace(/[^\d.,]/g, "");
  if (t.includes(",") && t.includes(".")) t = t.lastIndexOf(",") > t.lastIndexOf(".") ? t.replace(/\./g, "").replace(",", ".") : t.replace(/,/g, "");
  else if (t.includes(",")) t = t.replace(",", ".");
  const v = Number(t);
  return Number.isFinite(v) && v < 1_000_000 ? v : 0;
}

/** Pretul vechi doar daca e plauzibil: mai mare decat cel nou, dar nu de peste 3 ori (eroare din feed). */
export function pretVechiValid(pret: number, vechi: unknown): number | null {
  const v = pretDin(vechi);
  return v > pret && v <= pret * 3 ? v : null;
}

/** Comisionul e scris liber in date („10%", „10.5"); doar procentele plauzibile intra. */
export function comisionDin(x: unknown): number | null {
  const m = String(x ?? "").match(/\d+(?:[.,]\d+)?/);
  if (!m) return null;
  const v = Number(m[0].replace(",", "."));
  return v > 0 && v <= 90 ? v : null;
}

export function amprentaCod(magazin: string, nume: string, cod: string): string {
  return createHash("sha1").update(`${magazin}|${nume}|${cod}`).digest("hex").slice(0, 16);
}

// ── Scriere in Supabase, prin PostgREST ───────────────────────────────────────
interface Optiuni { proba: boolean; cheie: string }

async function supabase(cale: string, metoda: string, corp: unknown, opt: Optiuni, prefer = "return=minimal"): Promise<unknown> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${cale}`, {
    method: metoda,
    headers: { apikey: opt.cheie, Authorization: `Bearer ${opt.cheie}`, "Content-Type": "application/json", Prefer: prefer },
    body: corp === undefined ? undefined : JSON.stringify(corp),
  });
  if (!r.ok) throw new Error(`Supabase ${metoda} ${cale.split("?")[0]}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function upsert(tabel: string, cheieUnica: string, randuri: unknown[], opt: Optiuni): Promise<void> {
  for (let i = 0; i < randuri.length; i += LOT) {
    await supabase(`${tabel}?on_conflict=${cheieUnica}`, "POST", randuri.slice(i, i + LOT), opt, "resolution=merge-duplicates,return=minimal");
  }
}

// ── Citire din 2Performant: token rotit la fiecare raspuns, pauza intre cereri, oprire curata la 429 ──
class Client2P {
  private antete: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  private asteptat = 0;
  cereri = 0;

  private retine(r: Response) {
    for (const k of ["access-token", "client", "uid", "expiry", "token-type"]) {
      const v = r.headers.get(k);
      if (v) this.antete[k] = v;
    }
  }

  async login(email: string, parola: string): Promise<void> {
    const r = await fetch(`${API_2P}/users/sign_in.json`, { method: "POST", headers: this.antete, body: JSON.stringify({ user: { email, password: parola } }) });
    if (!r.ok) throw new Error(`Login 2Performant: ${r.status}`);
    this.retine(r);
  }

  /** null = limita API atinsa si bugetul de asteptare consumat: ce s-a citit deja ramane valabil. */
  async get(cale: string): Promise<Record<string, unknown> | null> {
    for (let incercare = 0; ; incercare++) {
      await new Promise((ok) => setTimeout(ok, PAUZA_MS));
      this.cereri++;
      const r = await fetch(`${API_2P}/${cale}`, { headers: this.antete });
      this.retine(r);
      if (r.status === 429) {
        const dinAntet = Number(r.headers.get("retry-after"));
        const pauza = dinAntet > 0 ? dinAntet : PAUZE_429[Math.min(incercare, PAUZE_429.length - 1)];
        if (this.asteptat + pauza > ASTEPTARE_MAXIMA_S || incercare >= PAUZE_429.length) return null;
        console.log(`  429 dupa ${this.cereri} cereri: astept ${pauza} s`);
        this.asteptat += pauza;
        await new Promise((ok) => setTimeout(ok, pauza * 1000));
        continue;
      }
      if (!r.ok) throw new Error(`2Performant ${cale.split("?")[0]}: ${r.status}`);
      return (await r.json()) as Record<string, unknown>;
    }
  }
}

function linkAfiliat(url: string): string {
  const cod = process.env.TWOPEFORMANT_USER || "541547473";
  return `https://event.2performant.com/events/click?ad_type=quicklink&aff_code=${cod}&unique=bb3071a7d&redirect_to=${encodeURIComponent(url)}`;
}

interface ProdusBaza {
  p2_id: string; merchant_id: number; title: string; description: string | null; brand: string | null; price: number; old_price: number | null;
  category: string | null; image_url: string | null; affiliate_url: string; slug: string; in_stock: boolean; updated_at: string;
}

// ── Modul direct: un feed citit din API, cu paginare pana la --pagini ─────────
async function dinFeed(idFeed: string, interogare: string, pagini: number, slugMagazin: string, idMagazin: number): Promise<ProdusBaza[]> {
  const email = process.env.TWOPEFORMANT_EMAIL;
  const parola = process.env.TWOPEFORMANT_PASS;
  if (!email || !parola) throw new Error("TWOPEFORMANT_EMAIL si TWOPEFORMANT_PASS lipsesc");
  const c = new Client2P();
  await c.login(email, parola);
  const acum = new Date().toISOString();
  const rez: ProdusBaza[] = [];
  for (let p = 1; p <= pagini; p++) {
    const q = interogare ? `&filter[query]=${encodeURIComponent(interogare)}` : "";
    const d = await c.get(`affiliate/product_feeds/${idFeed}/products.json?page=${p}${q}`);
    if (!d) { console.log(`  limita API la pagina ${p}: pastrez ce am citit`); break; }
    const lista = (d.products as Record<string, unknown>[]) || [];
    if (lista.length === 0) break;
    for (const x of lista) {
      const pret = pretDin(x.price);
      const url = String(x.url || "");
      const id = String(x.unique_code || x.id || "");
      if (pret <= 0 || !url.startsWith("http") || !id) continue;
      const img = Array.isArray(x.structured_image_urls) ? (x.structured_image_urls as string[])[0] : null;
      const titlu = curataHtml(String(x.title || "")).slice(0, 200);
      rez.push({
        p2_id: id, merchant_id: idMagazin, title: titlu, description: curataHtml(String(x.description || "")).slice(0, 1000) || null,
        brand: String(x.brand || "").slice(0, 60) || null, price: pret, old_price: pretVechiValid(pret, x.old_price),
        category: String(x.category || "").slice(0, 120) || null, image_url: img, affiliate_url: linkAfiliat(url),
        slug: slugProdus(titlu, slugMagazin, id), in_stock: x.active !== false, updated_at: acum,
      });
    }
    const pg = (d.metadata as { pagination?: { pages?: number } })?.pagination?.pages ?? (d.pagination as { pages?: number })?.pages;
    if (pg && p >= pg) break;
  }
  console.log(`Feed ${idFeed}: ${rez.length} produse citite cu ${c.cereri} cereri.`);
  return rez;
}

// ── Modul obisnuit: din fisierele generate de pipeline ────────────────────────
function citeste<T>(cale: string, rezerva: T): T {
  try { return JSON.parse(readFileSync(join(RADACINA, cale), "utf-8")) as T; } catch { return rezerva; }
}

async function main(): Promise<number> {
  const arg = process.argv.slice(2);
  const val = (n: string) => (arg.includes(n) ? arg[arg.indexOf(n) + 1] : "");
  const proba = arg.includes("--proba");
  const cheie = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!cheie && !proba) {
    console.log("SUPABASE_SERVICE_ROLE_KEY lipseste (GitHub -> Settings -> Secrets): baza ramane cum e, site-ul merge in continuare.");
    return 0;
  }
  const opt: Optiuni = { proba, cheie };
  const acum = new Date().toISOString();

  const magazine = citeste<Record<string, any>[]>("frontend/public/output.json", []);
  const platite = magazine.filter((m) => m.url_afiliat && m.url_afiliat !== m.url);
  const randuriM = platite.map((m) => ({
    slug: m.magazin, name: m.magazin_display || m.magazin, logo: m.logo_url || null, default_commission: comisionDin(m.comision),
    status: "active", category: m.categorie || null, affiliate_url: m.url_afiliat, updated_at: acum,
  }));
  if (!proba) await upsert("merchants", "slug", randuriM, opt);
  const harta = new Map<string, number>();
  if (!proba) {
    for (let de = 0; ; de += 1000) {
      const lista = (await supabase(`merchants?select=id,slug&order=id&limit=1000&offset=${de}`, "GET", undefined, opt, "return=representation")) as { id: number; slug: string }[];
      for (const m of lista) harta.set(m.slug, m.id);
      if (lista.length < 1000) break;
    }
  } else {
    platite.forEach((m, i) => harta.set(m.magazin, i + 1));
  }

  if (val("--feed")) {
    const slug = val("--magazin");
    const idM = harta.get(slug);
    if (!idM) throw new Error(`--magazin ${slug || "(lipsa)"} nu e in merchants`);
    const lista = await dinFeed(val("--feed"), val("--query"), Number(val("--pagini") || 1), slug, idM);
    if (proba) { console.log("Exemplu:", JSON.stringify(lista[0] ?? null).slice(0, 400)); return 0; }
    await upsert("products", "merchant_id,p2_id", lista, opt);
    return 0;
  }

  // Produsele alese de criterii_produse.py: un produs poate fi in mai multe criterii, intra o data.
  const criterii = citeste<{ criterii?: { tema: string; actualizat: string; produse: Record<string, any>[] }[] }>("frontend/public/criterii.json", {}).criterii || [];
  const unice = new Map<string, ProdusBaza>();
  for (const c of criterii) {
    for (const p of c.produse || []) {
      const idM = harta.get(p.magazin);
      if (!idM || !p.id) continue;
      unice.set(`${idM}|${p.id}`, {
        p2_id: p.id, merchant_id: idM, title: curataHtml(p.titlu), description: null, brand: p.brand || null, price: p.pret, old_price: pretVechiValid(p.pret, p.pret_vechi),
        category: c.tema, image_url: p.imagine || null, affiliate_url: p.url, slug: slugProdus(p.titlu, p.magazin, p.id), in_stock: true, updated_at: acum,
      });
    }
  }
  const produse = [...unice.values()];

  const coduri: Record<string, unknown>[] = [];
  for (const m of platite) {
    const idM = harta.get(m.magazin);
    if (!idM) continue;
    for (const p of m.promotii || []) {
      if (!p.cod_cupon) continue;
      const proc = String(p.nume || p.descriere || "").match(/\d{1,2}(?:[.,]\d)?\s*%/);
      coduri.push({
        p2_id: amprentaCod(m.magazin, p.nume || "", p.cod_cupon), merchant_id: idM, code: p.cod_cupon, title: curataHtml(p.nume).slice(0, 200) || `Cod ${m.magazin}`,
        discount_value: proc ? proc[0].replace(/\s/g, "") : null, start_date: p.incepe || null, expiration_date: p.expira || null,
        affiliate_url: p.landing_page || m.url_afiliat, is_exclusive: Boolean(m.exclusiv), updated_at: acum,
      });
    }
  }
  console.log(`De scris: ${randuriM.length} magazine, ${produse.length} produse, ${coduri.length} coduri.`);
  if (proba) {
    console.log("Exemplu produs:", JSON.stringify(produse[0] ?? null).slice(0, 420).replace(/(aff_code|unique)=[^&]+/g, "$1=..."));
    console.log("Exemplu cod (fara cod):", JSON.stringify({ ...(coduri[0] ?? {}), code: "***" }).slice(0, 260));
    return 0;
  }
  await upsert("products", "merchant_id,p2_id", produse, opt);
  await upsert("coupons", "merchant_id,p2_id", coduri, opt);

  const limitaStoc = new Date(Date.now() - ZILE_STOC * 864e5).toISOString();
  await supabase(`products?updated_at=lt.${limitaStoc}&in_stock=eq.true`, "PATCH", { in_stock: false }, opt);
  const limitaCod = new Date(Date.now() - 30 * 864e5).toISOString();
  await supabase(`coupons?expiration_date=lt.${limitaCod}`, "DELETE", undefined, opt);
  console.log("Gata.");
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  // O eroare aici nu opreste pipeline-ul: site-ul nu depinde de baza de date.
  main().then((c) => process.exit(c)).catch((e) => { console.error(`EROARE ingest: ${e.message}`); process.exit(0); });
}
