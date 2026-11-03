/**
 * Capturi + verificari in browser real, pe mai multe latimi (03.11.2026, remodelarea site-ului).
 *
 *   node scripts/captura_pagini.mjs --baza http://localhost:3107 --iesire <folder> [--fara-capturi] / /oferte-azi /categorii
 *
 * Porneste Edge headless si il conduce prin CDP (WebSocket-ul din Node), fara dependinte noi. Pentru fiecare pagina,
 * la 1280 si 375 px: captura (primul ecran + toata pagina), inaltimea, scroll-ul orizontal, elementele care ies din
 * ecran si textul cu contrast sub 4,5:1 (3:1 la text mare), calculat pe fundalul efectiv, ca pe tema inchisa culorile
 * din variabile sa nu scape (tiparul „contrast pe culori din variabile"). Iese cu 1 daca gaseste scroll orizontal.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const flag = (n) => { const i = args.indexOf(n); if (i < 0) return false; args.splice(i, 1); return true; };
const BAZA = opt("--baza", "http://localhost:3107");
const IESIRE = opt("--iesire", join(tmpdir(), "capturi"));
const FARA_CAPTURI = flag("--fara-capturi");
const LATIMI = [{ w: 1280, h: 800, mob: false }, { w: 375, h: 812, mob: true }];
const pagini = args.length ? args : ["/"];
mkdirSync(IESIRE, { recursive: true });

const EDGE = ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe"].find(existsSync);
const PORT = 9300 + Math.floor(Math.random() * 400);
const proc = spawn(EDGE, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "edge-"))}`, "--no-first-run", "--disable-gpu", "about:blank"], { stdio: "ignore" });

async function asteapta(url) {
  for (let i = 0; i < 60; i++) {
    try { return await (await fetch(url)).json(); } catch { await new Promise((r) => setTimeout(r, 300)); }
  }
  throw new Error("Edge nu a pornit");
}

const lista = await asteapta(`http://127.0.0.1:${PORT}/json/list`);
const ws = new WebSocket(lista.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let nr = 0;
const raspunsuri = new Map();
const evenimente = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && raspunsuri.has(m.id)) { raspunsuri.get(m.id)(m); raspunsuri.delete(m.id); }
  if (m.method && evenimente.has(m.method)) { evenimente.get(m.method)(m.params); evenimente.delete(m.method); }
};
const cdp = (method, params = {}) => new Promise((r) => { const id = ++nr; raspunsuri.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const eveniment = (method, ms = 60000) => new Promise((r) => { evenimente.set(method, r); setTimeout(r, ms); });

await cdp("Page.enable");
await cdp("Runtime.enable");
await cdp("Page.addScriptToEvaluateOnNewDocument", { source: "try{localStorage.setItem('cookie_consent','refuz');localStorage.setItem('nl_subscribed','1')}catch(e){}" });

const MASOARA = `(() => {
  const cx = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true });
  const rgb = (s) => { cx.clearRect(0,0,1,1); cx.fillStyle = s; cx.fillRect(0,0,1,1); const d = cx.getImageData(0,0,1,1).data; return [d[0],d[1],d[2],d[3]/255]; };
  const lum = ([r,g,b]) => { const f = (c) => { c/=255; return c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4); }; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const peste = (a, f) => { const al = a[3] ?? 1; return [0,1,2].map((i) => a[i]*al + f[i]*(1-al)); };
  const fundal = (el) => { const st = []; for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e); if (c.backgroundImage !== 'none') { const g = c.backgroundImage.match(/(?:rgba?|oklch|oklab|color)\\([^)]*\\)/); if (!g) return null; let r = rgb(g[0]); r = peste(r, [13,15,18]); for (const b of st.reverse()) r = peste(b, r); return r; } const b = rgb(c.backgroundColor); const a = b[3] ?? 1; if (a > 0) { st.push(b); if (a >= 1) break; } } let r = [13,15,18]; for (const b of st.reverse()) r = peste(b, r); return r; };
  const w = document.documentElement.clientWidth;
  const contrast = []; const iesite = []; const vazute = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const c = getComputedStyle(el);
    if (c.visibility === 'hidden' || c.display === 'none') continue;
    if (r.right > w + 1 && !el.closest('[class*="overflow-x"], [style*="overflow-x"], .sr-only')) iesite.push(el.tagName + '.' + String(el.className).slice(0,50) + ' dreapta=' + Math.round(r.right));
    const txt = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').trim();
    if (!txt || el.closest('a,button,span,p,li,h1,h2,h3,h4,div,dt,dd,summary,td,th,label') === null) continue;
    const f = fundal(el); if (!f) continue;
    const fg = peste(rgb(c.color), f);
    const a = lum(fg), b = lum(f); const rap = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const mare = parseFloat(c.fontSize) >= 24 || (parseFloat(c.fontSize) >= 18.66 && Number(c.fontWeight) >= 700);
    if (rap < (mare ? 3 : 4.5)) { const k = c.color + '|' + txt.slice(0,20); if (!vazute.has(k)) { vazute.add(k); contrast.push(rap.toFixed(2) + ' ' + c.color + ' "' + txt.slice(0,40) + '"'); } }
  }
  const secs = [...document.querySelectorAll('h1,h2')].map((h) => Math.round(h.getBoundingClientRect().top + scrollY) + ' ' + h.innerText.slice(0,40));
  return JSON.stringify({ inaltime: document.documentElement.scrollHeight, scrollOrizontal: document.documentElement.scrollWidth - w, dom: document.querySelectorAll('*').length, iesite: iesite.slice(0,6), contrast: contrast.slice(0,14), titlu: document.title.slice(0,70), sectiuni: secs });
})()`;

let rau = 0;
const rezultat = {};
for (const p of pagini) {
  rezultat[p] = {};
  for (const l of LATIMI) {
    await cdp("Emulation.setDeviceMetricsOverride", { width: l.w, height: l.h, deviceScaleFactor: 1, mobile: l.mob });
    const gata = eveniment("Page.loadEventFired");
    await cdp("Page.navigate", { url: BAZA + p });
    await gata;
    await new Promise((r) => setTimeout(r, 1500));
    // Imaginile cu loading="lazy" se incarca doar cand ajung pe ecran; fara asta, captura intreaga le arata goale.
    await cdp("Runtime.evaluate", { awaitPromise: true, expression: `(async()=>{const h=document.documentElement.scrollHeight;for(let y=0;y<h;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,120))}scrollTo(0,0);await new Promise(r=>setTimeout(r,500))})()` });
    const v = await cdp("Runtime.evaluate", { expression: MASOARA, returnByValue: true });
    if (!v.result?.result?.value) { console.log(`${p} @${l.w}: NU S-A PUTUT MASURA`); rau++; continue; }
    const d = JSON.parse(v.result.result.value);
    if (d.dom < 60) { console.log(`${p} @${l.w}: pagina n-a raspuns (dom ${d.dom})`); rau++; continue; }
    rezultat[p][l.w] = d;
    if (d.scrollOrizontal > 0) rau++;
    console.log(`${p} @${l.w}: ${d.inaltime}px, dom ${d.dom}, scroll orizontal ${d.scrollOrizontal}${d.iesite.length ? ", iesite: " + d.iesite.join("; ") : ""}${d.contrast.length ? "\n   contrast: " + d.contrast.join("\n             ") : ""}`);
    if (!FARA_CAPTURI) {
      const nume = (p === "/" ? "acasa" : p.replace(/^\//, "").replace(/[^a-z0-9.-]+/gi, "_")) + `-${l.w}`;
      const sus = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 80 });
      writeFileSync(join(IESIRE, `${nume}-ecran.jpg`), Buffer.from(sus.result.data, "base64"));
      const tot = await cdp("Page.captureScreenshot", { format: "jpeg", quality: 70, captureBeyondViewport: true, clip: { x: 0, y: 0, width: l.w, height: Math.min(d.inaltime, 12000), scale: 1 } });
      writeFileSync(join(IESIRE, `${nume}-tot.jpg`), Buffer.from(tot.result.data, "base64"));
    }
  }
}
writeFileSync(join(IESIRE, "masuratori.json"), JSON.stringify(rezultat, null, 1));
ws.close();
proc.kill();
process.exit(rau ? 1 : 0);
