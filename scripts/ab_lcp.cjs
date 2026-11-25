/**
 * A/B de viteza intre doua build-uri pornite local (24.11.2026): telefon 390x844, procesor incetinit de 4 ori,
 * rulari intercalate (A, B, B, A...), mediane + test de permutare pe LCP, ca o serie norocoasa sa nu decida.
 *
 *   node scripts/ab_lcp.cjs --a http://localhost:3300 --b http://localhost:3301 --rulari 16 / /cod-reducere/libris.ro
 *
 * A = build-ul de verificat, B = main neatins (alt folder, alt port). Ruleaza in sesiunea cloud (Playwright e
 * preinstalat acolo). Inainte: portul liber (`fuser 3300/tcp`; `ss` nu exista in container) si serverul repornit
 * DUPA build. Garda: fiecare rulare verifica bannerul de cookie-uri `position: fixed`; o rulare fara CSS invalideaza
 * masuratoarea (24.11: un server vechi dadea CSS 500 si pagina fara stil iesea „mai rapida").
 * Fara clicuri false: tot ce iese din serverul local e blocat, /api/ la fel, sendBeacon oprit.
 */
let chromium;
try { ({ chromium } = require("playwright")); } catch {
  console.error("Lipseste Playwright. Scriptul e pentru sesiunea cloud (preinstalat acolo).");
  process.exit(2);
}

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const A = opt("--a", "http://localhost:3300");
const B = opt("--b", "http://localhost:3301");
const N = +opt("--rulari", "16");
const PAGINI = args.length ? args : ["/"];

async function rulare(b, baza, url) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route("**/*", (r) => { const u = r.request().url(); return u.startsWith(baza) && !u.includes("/api/") ? r.continue() : r.abort(); });
  await ctx.addInitScript(() => {
    navigator.sendBeacon = () => true;
    window.__lcp = 0; window.__cls = 0; window.__tbt = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__tbt += Math.max(0, e.duration - 50); }).observe({ type: "longtask", buffered: true });
  });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await p.goto(baza + url, { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({
    lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(4), tbt: Math.round(window.__tbt),
    css: (() => { const e = document.querySelector(".cookie-banner"); return !!e && getComputedStyle(e).position === "fixed"; })(),
  }));
  await ctx.close();
  return r;
}

const mediana = (x) => { const s = [...x].sort((a, b) => a - b); const n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
function pPermutare(x, y, t = 20000) {
  const d = Math.abs(mediana(y) - mediana(x));
  const toate = [...x, ...y];
  let extreme = 0;
  for (let i = 0; i < t; i++) {
    const s = [...toate].sort(() => Math.random() - 0.5);
    if (Math.abs(mediana(s.slice(x.length)) - mediana(s.slice(0, x.length))) >= d) extreme++;
  }
  return extreme / t;
}

(async () => {
  const b = await chromium.launch();
  let faraCss = 0;
  for (const url of PAGINI) {
    await rulare(b, A, url); await rulare(b, B, url); // incalzire
    const ra = [], rb = [];
    for (let i = 0; i < N; i++) {
      if (i % 2) { rb.push(await rulare(b, B, url)); ra.push(await rulare(b, A, url)); }
      else { ra.push(await rulare(b, A, url)); rb.push(await rulare(b, B, url)); }
    }
    faraCss += [...ra, ...rb].filter((r) => !r.css).length;
    const rand = (x) => `LCP ${mediana(x.map((r) => r.lcp))} ms  TBT ${mediana(x.map((r) => r.tbt))} ms  CLS max ${Math.max(...x.map((r) => r.cls))}`;
    console.log(url);
    console.log(`  A ${A}  ${rand(ra)}`);
    console.log(`  B ${B}  ${rand(rb)}`);
    console.log(`  diferenta LCP (A - B): ${mediana(ra.map((r) => r.lcp)) - mediana(rb.map((r) => r.lcp))} ms, p = ${pPermutare(rb.map((r) => r.lcp), ra.map((r) => r.lcp)).toFixed(2)}`);
  }
  console.log(faraCss ? `ATENTIE: ${faraCss} rulari fara CSS — masuratoarea NU e valida` : "CSS incarcat in toate rularile");
  await b.close();
  process.exit(faraCss ? 1 : 0);
})();
