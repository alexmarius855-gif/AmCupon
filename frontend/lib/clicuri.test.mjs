/**
 * Test pentru lib/clicuri.ts — ruleaza cu:  node lib/clicuri.test.mjs   (din frontend/)
 *
 * Partea 1: cazuri precise (user-agent, referrer, recunoasterea magazinului din link).
 * Partea 2: trece prin TOATE magazinele din public/output.json si cere ca linkul afiliat al fiecaruia
 * sa fie atribuit chiar lui — daca indexul atribuie clicurile unui alt magazin, raportul de clicuri
 * ar minti exact acolo unde vrem sa luam decizii. Iese cu cod 1 la prima asteptare incalcata.
 */
import { readFileSync } from "node:fs";
import {
  esteBot, tipDispozitiv, hostReferrer, cheieCale, gazdaDestinatie,
  construiesteIndex, magazinDinLink, paginaCurata,
} from "./clicuri.ts";
import { brandDomeniu } from "./numeMagazin.ts";
import { aceeasiTara } from "./taraDomeniu.ts";

const aj = { brand: brandDomeniu, aceeasiTara };
let esecuri = 0;
const verifica = (nume, primit, asteptat) => {
  const ok = JSON.stringify(primit) === JSON.stringify(asteptat);
  if (!ok) { esecuri++; console.log(`  PICA  ${nume}\n        primit:   ${JSON.stringify(primit)}\n        asteptat: ${JSON.stringify(asteptat)}`); }
  else console.log(`  ok    ${nume}`);
};

const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

console.log("\n── robot sau om ──");
verifica("Chrome desktop = om", esteBot(CHROME), false);
verifica("iPhone = om", esteBot(IPHONE), false);
verifica("Googlebot = robot", esteBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), true);
verifica("python-requests = robot", esteBot("python-requests/2.31.0 (linux)"), true);
verifica("curl = robot", esteBot("curl/8.4.0 something-long-enough"), true);
verifica("fara user-agent = robot", esteBot(""), true);
verifica("user-agent minuscul = robot", esteBot("Mozilla"), true);
verifica("Chrome headless = robot", esteBot(CHROME.replace("Chrome/", "HeadlessChrome/")), true);
verifica("previzualizare de link (Facebook) = robot", esteBot("facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"), true);

console.log("\n── dispozitiv ──");
verifica("iPhone -> mobil", tipDispozitiv(IPHONE), "mobil");
verifica("Android -> mobil", tipDispozitiv("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36"), "mobil");
verifica("Windows -> desktop", tipDispozitiv(CHROME), "desktop");
verifica("gol -> necunoscut", tipDispozitiv(""), "necunoscut");

console.log("\n── referrer (doar hostul) ──");
verifica("Google fara www si fara cale", hostReferrer("https://www.google.com/search?q=cod+reducere+drmax"), "google.com");
verifica("Bing", hostReferrer("https://www.bing.com/"), "bing.com");
verifica("direct (gol) -> null", hostReferrer(""), null);
verifica("nu e URL -> null", hostReferrer("nu-e-url"), null);

console.log("\n── pagina curata ──");
verifica("scoate query-ul", paginaCurata("/cod-reducere/drmax.ro?utm_source=x#sus"), "/cod-reducere/drmax.ro");
verifica("fara slash la inceput -> null", paginaCurata("cod-reducere"), null);
verifica("nu e text -> null", paginaCurata(42), null);
verifica("prea lunga -> null", paginaCurata("/" + "a".repeat(250)), null);

console.log("\n── magazinul din link ──");
const MAG = [
  { magazin: "drmax.ro", url_afiliat: "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=1&unique=2&redirect_to=https%3A%2F%2Fwww.drmax.ro%2F" },
  { magazin: "vidaxl.bg", url_afiliat: "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=1&unique=2&redirect_to=https%3A%2F%2Fwww.vidaxl.bg%2F" },
  { magazin: "vidaxl.ro", url_afiliat: "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=1&unique=2&redirect_to=https%3A%2F%2Fwww.vidaxl.ro%2F" },
  { magazin: "surfshark.com", url_afiliat: "https://surfshark.pxf.io/c/7401119/1234/5678", promotii: [{ landing_page: "https://surfshark.pxf.io/c/7401119/1234/5678?u=https%3A%2F%2Fsurfshark.com%2Fdeal" }] },
  { magazin: "nordvpn.com", url_afiliat: "https://nordvpn.sjv.io/c/7401119/9999/1111" },
  { magazin: "ceva-awin.com", url_afiliat: "https://www.awin1.com/cread.php?awinmid=555&awinaffid=101&ued=https%3A%2F%2Fceva-awin.com" },
  { magazin: "alt-awin.com", url_afiliat: "https://www.awin1.com/cread.php?awinmid=666&awinaffid=101&ued=https%3A%2F%2Falt-awin.com" },
];
const idx = construiesteIndex(MAG, aj);
const cuSub = (u, p, v) => u + (u.includes("?") ? "&" : "?") + p + "=" + v;
verifica("2Performant: destinatia din redirect_to, cu sub-id adaugat de tracker", magazinDinLink(cuSub(MAG[0].url_afiliat, "st", "oferte-azi"), "/oferte-azi", idx, aj), "drmax.ro");
verifica("2Performant: varianta de tara .ro, nu .bg", magazinDinLink(MAG[2].url_afiliat, "/", idx, aj), "vidaxl.ro");
verifica("2Performant: varianta de tara .bg ramane .bg", magazinDinLink(MAG[1].url_afiliat, "/", idx, aj), "vidaxl.bg");
verifica("Impact: dupa cale, cu subId1", magazinDinLink(cuSub(MAG[3].url_afiliat, "subId1", "vpn"), "/vpn", idx, aj), "surfshark.com");
verifica("Impact: link de oferta (landing_page) tot pe cale", magazinDinLink(MAG[3].promotii[0].landing_page, "/", idx, aj), "surfshark.com");
verifica("Impact: alt magazin, aceeasi retea", magazinDinLink(MAG[4].url_afiliat, "/vpn", idx, aj), "nordvpn.com");
verifica("Awin: dupa awinmid, nu dupa cale comuna (1)", magazinDinLink(MAG[5].url_afiliat, "/", idx, aj), "ceva-awin.com");
verifica("Awin: dupa awinmid, nu dupa cale comuna (2)", magazinDinLink(MAG[6].url_afiliat, "/", idx, aj), "alt-awin.com");
verifica("link necunoscut pe pagina de magazin -> pagina", magazinDinLink("https://exemplu.pxf.io/c/1/2/3", "/cod-reducere/Noriel.ro", idx, aj), "noriel.ro");
verifica("link necunoscut in alta parte -> necunoscut, nu ghicit", magazinDinLink("https://exemplu.pxf.io/c/1/2/3", "/oferte-azi", idx, aj), "necunoscut");
verifica("2P generic fara magazin cunoscut NU ajunge la primul magazin", magazinDinLink("https://event.2performant.com/events/click?redirect_to=https%3A%2F%2Fnu-exista.ro%2F", "/blog", idx, aj), "necunoscut");
verifica("cheieCale scoate query-ul", cheieCale("https://a.pxf.io/c/1/2/3/?subId1=x"), "a.pxf.io/c/1/2/3");
verifica("gazdaDestinatie fara www", gazdaDestinatie(MAG[0].url_afiliat), "drmax.ro");
const FRATI = construiesteIndex([
  { magazin: "adguard.com", url_afiliat: "https://adguard.pxf.io/c/7401119/55/66" },
  { magazin: "adguard-vpn.com", url_afiliat: "https://adguard.pxf.io/c/7401119/55/66" },
], aj);
verifica("campanie comuna: pagina proprie = magazinul propriu (1)", magazinDinLink("https://adguard.pxf.io/c/7401119/55/66?subId1=x", "/cod-reducere/adguard-vpn.com", FRATI, aj), "adguard-vpn.com");
verifica("campanie comuna: pagina proprie = magazinul propriu (2)", magazinDinLink("https://adguard.pxf.io/c/7401119/55/66", "/cod-reducere/adguard.com", FRATI, aj), "adguard.com");
verifica("campanie comuna, din alta pagina -> primul din grup (nu se ghiceste mai departe)", magazinDinLink("https://adguard.pxf.io/c/7401119/55/66", "/vpn", FRATI, aj), "adguard.com");
verifica("pagina cu % murdar nu arunca", magazinDinLink("https://exemplu.pxf.io/c/1/2/3", "/cod-reducere/%E0%A4%A", idx, aj), "necunoscut");
verifica("indiciu de la client, magazin cunoscut -> folosit", magazinDinLink("https://exemplu.pxf.io/c/1/2/3", "/oferte-azi", idx, aj, "Nordvpn.com"), "nordvpn.com");
verifica("indiciu de la client, magazin INEXISTENT -> ignorat (nu se poate scrie orice in raport)", magazinDinLink("https://exemplu.pxf.io/c/1/2/3", "/oferte-azi", idx, aj, "<script>alert(1)</script>"), "necunoscut");
verifica("indiciu gol -> ignorat", magazinDinLink(MAG[0].url_afiliat, "/", idx, aj, ""), "drmax.ro");
verifica("href invalid nu arunca", magazinDinLink("nu e url", "/x", idx, aj), "necunoscut");

console.log("\n── pe toate magazinele din public/output.json ──");
const magazine = JSON.parse(readFileSync(new URL("../public/output.json", import.meta.url), "utf-8"));
const real = construiesteIndex(magazine, aj);
let cuLink = 0, gresite = [], necunoscute = 0;
for (const m of magazine) {
  const l = (m.url_afiliat || "").trim();
  if (!l || l === (m.url || "").trim()) continue;
  cuLink++;
  const r = magazinDinLink(l, `/cod-reducere/${m.magazin}`, real, aj);
  if (r === "necunoscut") necunoscute++;
  else if (r !== m.magazin.toLowerCase()) gresite.push(`${m.magazin} -> ${r}`);
}
console.log(`  magazine cu link afiliat: ${cuLink}`);
console.log(`  atribuite altui magazin: ${gresite.length}`); gresite.slice(0, 12).forEach((x) => console.log("    " + x));
console.log(`  neatribuite („necunoscut"): ${necunoscute}`);
// Pe pagina proprie, linkul propriu al fiecarui magazin trebuie sa-i fie atribuit EXACT lui: zero toleranta.
if (gresite.length) { esecuri++; console.log("  PICA  clic pe linkul propriu atribuit altui magazin"); }
if (necunoscute > cuLink * 0.02) { esecuri++; console.log("  PICA  prea multe linkuri fara atribuire"); }

console.log(esecuri ? `\n  ${esecuri} ESECURI` : "\n  Toate testele trec.");
process.exit(esecuri ? 1 : 0);
