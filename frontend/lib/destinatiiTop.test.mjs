/**
 * Test pentru lib/destinatiiTop.ts — ruleaza cu:  node lib/destinatiiTop.test.mjs   (din frontend/)
 *
 * Pe datele REALE (top-produse.json, output.json):
 *  - nicio intrare din tabel nu ramane agatata de un produs redenumit sau scos;
 *  - fiecare adresa e pe site-ul magazinului ei, iar linkul pastreaza tracking-ul;
 *  - niciun buton platit de pe /top nu duce la prima pagina a magazinului.
 * Iese cu cod 1 la prima asteptare incalcata.
 */
import { readFileSync } from "node:fs";
import { DESTINATII_TOP, LEGATURI_TEMA, destinatieTop, legaturiTema } from "./destinatiiTop.ts";
import { produseTema, sectiuneTema, REGULI_TEME } from "./topFeed.ts";
import { linkAfiliat, GAZDE_TRACKING } from "./linkMagazin.ts";

let esecuri = 0;
const verifica = (nume, primit, asteptat) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};

// ── Partea 1: transformarea ──────────────────────────────────────────────────
const LINK = "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=A1&unique=U1&redirect_to=https%3A%2F%2Fwww.notino.ro";
const d = destinatieTop(LINK, "notino.ro", "Dior Sauvage");
const u = new URL(d.url);
verifica("pastreaza contul de afiliat", u.searchParams.get("aff_code"), "A1");
verifica("pastreaza identificatorul", u.searchParams.get("unique"), "U1");
verifica("duce la cautarea produsului", u.searchParams.get("redirect_to"), "https://www.notino.ro/search.asp?exps=Dior+Sauvage");
verifica("produs exact: fara „modele”", d.modele, undefined);
verifica("magazin fara produs: fara buton", destinatieTop(LINK, "notino.ro", "Bleu de Chanel"), null);
verifica("produs necunoscut: linkul ramane", destinatieTop(LINK, "notino.ro", "Alt parfum"), { url: LINK });
verifica("magazin necunoscut: linkul ramane", destinatieTop(LINK, "alt.ro", "Dior Sauvage"), { url: LINK });
const IMPACT = "https://omfort.sjv.io/c/1/2/3";
verifica("link fara redirect_to: ramane neatins", destinatieTop(IMPACT, "notino.ro", "Dior Sauvage"), { url: IMPACT });
verifica("link invalid: ramane neatins", destinatieTop("nu-e-link", "notino.ro", "Dior Sauvage"), { url: "nu-e-link" });

// ── Partea 2: tabelul, pe datele reale ───────────────────────────────────────
const top = JSON.parse(readFileSync("public/top-produse.json", "utf-8"));
const magazine = JSON.parse(readFileSync("public/output.json", "utf-8"));
const linkuri = new Map();
for (const m of magazine) {
  const l = linkAfiliat(m);
  if (l) linkuri.set(m.magazin, l);
}

const existente = new Set();
for (const c of top.categorii) for (const p of c.produse) for (const m of p.magazine) existente.add(`${m.magazin_slug}|${p.nume}`);

const gazda = (s) => new URL(s).hostname.replace(/^www\./, "");
for (const [magazin, tabel] of Object.entries(DESTINATII_TOP)) {
  for (const [produs, intrare] of Object.entries(tabel)) {
    if (!existente.has(`${magazin}|${produs}`)) {
      esecuri++;
      console.log(`  PICA  intrare fara produs pe /top: ${magazin} / ${produs}`);
    }
    if (intrare && gazda(intrare.url) !== magazin) {
      esecuri++;
      console.log(`  PICA  adresa pe alt site: ${magazin} -> ${intrare.url}`);
    }
  }
}

let butoane = 0;
let laProdus = 0;
let scoase = 0;
for (const c of top.categorii) {
  for (const p of c.produse) {
    for (const m of p.magazine) {
      const link = linkuri.get(m.magazin_slug);
      if (!link) continue;
      const rez = destinatieTop(link, m.magazin_slug, p.nume);
      if (!rez) { scoase++; continue; }
      butoane++;
      const dest = new URL(rez.url).searchParams.get("redirect_to") || "";
      const dom = dest ? new URL(dest) : null;
      if (dom && (dom.pathname.replace(/\//g, "") || dom.search)) laProdus++;
      else {
        esecuri++;
        console.log(`  PICA  buton spre prima pagina: /top/${c.slug} / ${p.nume} / ${m.magazin_slug}`);
      }
      if (!/2performant\.com|sjv\.io|awin1\.com/.test(new URL(rez.url).hostname)) {
        esecuri++;
        console.log(`  PICA  link fara tracking: ${m.magazin_slug} / ${p.nume}`);
      }
    }
  }
}
console.log(`  /top: ${butoane} butoane platite, ${laProdus} la produs, ${scoase} scoase (magazinul nu are produsul)`);
verifica("mai exista butoane platite pe /top", butoane > 0, true);

// ── Partea 3: nicio pagina /top fara drum spre un magazin ────────────────────
const slugTeme = new Set(top.categorii.map((c) => c.slug));
// Aceeasi regula ca sectiunePentru din oferteTema.ts (care nu se poate importa direct: importuri fara extensie).
const feed = JSON.parse(readFileSync("public/products.json", "utf-8"));
const produseFeed = feed.products || feed;
const areSectiune = (tema) =>
  !!REGULI_TEME[tema] && sectiuneTema(produseTema(tema, produseFeed, (s) => linkuri.has(s), (x) => GAZDE_TRACKING.test(x)), 4) !== null;
for (const [tema, lista] of Object.entries(LEGATURI_TEMA)) {
  if (!slugTeme.has(tema)) {
    esecuri++;
    console.log(`  PICA  tema fara pagina /top: ${tema}`);
  }
  for (const l of lista) {
    if (gazda(l.url) !== l.magazin) {
      esecuri++;
      console.log(`  PICA  adresa pe alt site: ${tema} -> ${l.url}`);
    }
    if (!linkuri.has(l.magazin)) {
      esecuri++;
      console.log(`  PICA  partener fara link platit: ${tema} / ${l.magazin}`);
    }
  }
}
const fara = top.categorii
  .filter((c) => !areSectiune(c.slug) && legaturiTema(c.slug, linkuri).length === 0)
  .map((c) => c.slug);
verifica("fiecare pagina /top are oferte sau legaturi spre parteneri", fara, []);
const L = legaturiTema("televizoare", new Map([["evomag.ro", LINK]]));
verifica("legatura pastreaza contul de afiliat", new URL(L[0].url).searchParams.get("aff_code"), "A1");
verifica("legatura duce la cautare", new URL(L[0].url).searchParams.get("redirect_to"), "https://www.evomag.ro/?sn.q=televizor");
verifica("fara link platit, fara legatura", legaturiTema("televizoare", new Map()), []);

if (esecuri) {
  console.log(`\n${esecuri} ESECURI`);
  process.exit(1);
}
console.log("\nToate trec.");
