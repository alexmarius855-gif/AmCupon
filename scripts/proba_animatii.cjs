/**
 * Proba animatiilor (24.11.2026), pe un build de productie pornit local (`next build` + `next start`).
 *
 *   node scripts/proba_animatii.cjs --baza http://localhost:3300 [--magazin libris.ro]
 *
 * Ruleaza in sesiunea cloud (Playwright e preinstalat acolo; in proiect nu e dependinta). Iese cu 1 la orice esec.
 * Verifica doua lucruri diferite, amandoua necesare:
 *  1. STARILE: nimic nu iese din ecran, ce se vede la incarcare nu se ascunde, ce e sub ecran apare la derulare si
 *     nimic nu ramane invizibil, la „miscare redusa" nu se ascunde nimic, confetti la dezvaluirea/copierea codului.
 *  2. MISCAREA: valorile se esantioneaza la JUMATATEA tranzitiei. Prima varianta trecea toate verificarile de stare,
 *     dar regula globala fara strat `*{transition-property:background-color,border-color,color}` din globals.css
 *     anula tranzitiile din @layer components: totul sarea instant. Dovedit: cu regula `.cc{transition}` stearsa din
 *     pagina, „hover: cardul urca treptat" pica (-3 px la 70 ms, fara pas intermediar).
 * Garda de CSS: bannerul de cookie-uri trebuie sa fie `position: fixed`. Un server `next start` ramas pe port dupa un
 * rebuild serveste HTML nou cu CSS 500 (pagina fara stil), iar masuratorile ies „mai bune" fals.
 * Fara clicuri false: tot ce iese din serverul local e blocat (linkuri de afiliere, analytics), /api/ la fel
 * (numaratoarea de clicuri scrie in Supabase-ul real), iar sendBeacon e oprit.
 */
let chromium;
try { ({ chromium } = require("playwright")); } catch {
  console.error("Lipseste Playwright. Scriptul e pentru sesiunea cloud (preinstalat acolo).");
  process.exit(2);
}

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i < 0 ? d : args[i + 1]; };
const BAZA = opt("--baza", "http://localhost:3300");
const MAGAZIN = opt("--magazin", "libris.ro");
const PAGINI = ["/", `/cod-reducere/${MAGAZIN}`, "/categorii/fashion"];
const TINTE = ".cc, .pop, .am-card, .am-tile, .am-produs, .am-h2";

const rez = [];
const verifica = (nume, ok, detalii) => { rez.push({ nume, ok: !!ok, detalii }); };
const intre = (x, a, b) => x > a && x < b;

async function context(b, opts = {}) {
  const ctx = await b.newContext(opts);
  await ctx.route("**/*", (r) => {
    const u = r.request().url();
    return u.startsWith(BAZA) && !u.includes("/api/") ? r.continue() : r.abort();
  });
  await ctx.addInitScript(() => { navigator.sendBeacon = () => true; });
  return ctx;
}

async function stari(b, url, { latime, inaltime, redus }) {
  const ctx = await context(b, { viewport: { width: latime, height: inaltime }, reducedMotion: redus ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  const erori = [];
  p.on("pageerror", (e) => erori.push(e.message));
  await p.goto(BAZA + url, { waitUntil: "load" });
  await p.waitForTimeout(1800);
  const r = await p.evaluate((tinte) => {
    const de = document.documentElement;
    const vh = innerHeight;
    // Cardurile dintr-un <details> inchis nu se vad oricum (Chrome le calculeaza totusi pozitia).
    const t = [...document.querySelectorAll(tinte)].filter((e) => !e.closest("details:not([open])"));
    const op = (e) => parseFloat(getComputedStyle(e).opacity);
    const sus = t.filter((e) => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.bottom <= vh; });
    const jos = t.filter((e) => e.getBoundingClientRect().top > vh + 50);
    const banner = document.querySelector(".cookie-banner");
    return {
      css: !!banner && getComputedStyle(banner).position === "fixed",
      lat: de.scrollWidth - de.clientWidth,
      sus: sus.length, susVizibile: sus.filter((e) => op(e) > 0.99).length,
      jos: jos.length, josAscunse: jos.filter((e) => op(e) < 0.5).length,
    };
  }, TINTE);
  for (let y = 0; y < 40000; y += Math.round(inaltime * 0.6)) {
    await p.evaluate((yy) => scrollTo(0, yy), y);
    await p.waitForTimeout(40);
    if (await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)) break;
  }
  await p.waitForTimeout(400);
  r.invizibileInEcran = await p.evaluate((tinte) => [...document.querySelectorAll(tinte)]
    .filter((e) => { const b = e.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight && b.height > 0; })
    .filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length, TINTE);
  await ctx.close();
  const eticheta = `${url} ${latime}px${redus ? " miscare-redusa" : ""}`;
  verifica(`${eticheta}: CSS incarcat`, r.css, r);
  verifica(`${eticheta}: fara scroll orizontal`, r.lat === 0, r);
  verifica(`${eticheta}: ce se vede la incarcare ramane vizibil`, r.susVizibile === r.sus, r);
  verifica(`${eticheta}: ${redus ? "nimic ascuns" : "ce e sub ecran asteapta derularea"}`, redus ? r.josAscunse === 0 : r.josAscunse === r.jos, r);
  verifica(`${eticheta}: dupa derulare nimic invizibil`, r.invizibileInEcran === 0, r);
  verifica(`${eticheta}: fara erori JavaScript`, erori.length === 0, { erori });
}

async function miscare(b) {
  // Aparitia la derulare + linia de deasupra titlului (telefon, prima pagina).
  {
    const ctx = await context(b, { viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.goto(BAZA + "/", { waitUntil: "load" });
    await p.waitForTimeout(1800);
    const r = await p.evaluate(async () => {
      const el = document.querySelector(".am-ascuns:not(.am-vazut)");
      if (!el) return { lipsa: true };
      scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.5);
      const t0 = performance.now();
      while (!el.classList.contains("am-vazut") && performance.now() - t0 < 1500) await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 150));
      const op150 = parseFloat(getComputedStyle(el).opacity);
      await new Promise((r) => setTimeout(r, 900));
      return { op150, opFinal: parseFloat(getComputedStyle(el).opacity) };
    });
    verifica("aparitie: opacitatea trece prin valori intermediare", !r.lipsa && intre(r.op150, 0.02, 0.98) && r.opFinal > 0.99, r);
    const l = await p.evaluate(async () => {
      const h = document.querySelector(".am-h2.am-ascuns:not(.am-vazut)");
      if (!h) return { lipsa: true };
      scrollTo(0, h.getBoundingClientRect().top + scrollY - innerHeight * 0.5);
      const t0 = performance.now();
      while (!h.classList.contains("am-vazut") && performance.now() - t0 < 1500) await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => setTimeout(r, 450));
      const s450 = getComputedStyle(h, "::after").scale;
      await new Promise((r) => setTimeout(r, 900));
      return { s450, sFinal: getComputedStyle(h, "::after").scale };
    });
    const sx = (s) => (s === "none" ? 1 : parseFloat(String(s).split(" ")[0]));
    verifica("linia titlului: creste treptat", !l.lipsa && intre(sx(l.s450), 0.02, 0.98) && sx(l.sFinal) > 0.99, l);
    await ctx.close();
  }
  // Ridicarea la hover, luciul si coltul indoit (desktop, pagina de magazin).
  {
    const ctx = await context(b, { viewport: { width: 1366, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${BAZA}/cod-reducere/${MAGAZIN}`, { waitUntil: "load" });
    await p.waitForTimeout(1500);
    const card = p.locator(".cc").first();
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await p.waitForTimeout(300);
      const ty = () => card.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m42);
      const t0 = await ty();
      await card.hover({ position: { x: 20, y: 20 } });
      await p.waitForTimeout(70);
      const t70 = await ty();
      await p.waitForTimeout(500);
      const t570 = await ty();
      verifica("hover: cardul urca treptat", t0 === 0 && intre(t70, -2.99, -0.01) && t570 < -2.9, { t0, t70, t570 });
    } else verifica("hover: exista un card de cupon pe pagina magazinului", false, {});
    const rv = p.locator(".cc-reveal").first();
    if (await rv.count()) {
      await p.mouse.move(5, 5);
      await p.waitForTimeout(700);
      const et = p.locator(".cc-rv-l").first();
      const lat = await et.evaluate((e) => e.getBoundingClientRect().width);
      const pct = (s) => { const v = String(s).split(" ")[0]; return v.endsWith("%") ? parseFloat(v) : (parseFloat(v) / lat) * 100; };
      const tx = () => et.evaluate((e) => getComputedStyle(e, "::after").translate);
      const a0 = await tx();
      await rv.hover();
      await p.waitForTimeout(200);
      const a200 = await tx();
      await p.waitForTimeout(700);
      const a900 = await tx();
      verifica("luciu: trece peste buton treptat", pct(a0) < -100 && intre(pct(a200), -109, 109) && pct(a900) > 100, { a0, a200, a900 });
      const c = await et.evaluate((e) => { const t = getComputedStyle(e, "::before").transform; return { t, a: t === "none" ? 1 : new DOMMatrix(t).a }; });
      verifica("colt indoit: apare la hover", c.t !== "none" && c.a > 0.9, c);
    }
    await ctx.close();
  }
  // Lista „Încă N produse" (<details> inchis): se deschide lin, iar cardurile din ea apar.
  {
    const ctx = await context(b, { viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.goto(`${BAZA}/cod-reducere/${MAGAZIN}`, { waitUntil: "load" });
    await p.waitForTimeout(1800);
    const sum = p.locator("details > summary", { hasText: "Încă" }).first();
    if (await sum.count()) {
      await sum.scrollIntoViewIfNeeded();
      await p.waitForTimeout(800);
      await sum.click();
      await p.waitForTimeout(100);
      const lista = () => p.evaluate(() => {
        const d = [...document.querySelectorAll("details[open]")].find((x) => x.querySelector(".am-produs"));
        if (!d) return null;
        const c = [...d.querySelectorAll(".am-produs")].filter((e) => { const b = e.getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight; });
        return { h: Math.round(d.getBoundingClientRect().height), inEcran: c.length, invizibile: c.filter((e) => parseFloat(getComputedStyle(e).opacity) < 0.99).length };
      });
      const l100 = await lista();
      await p.waitForTimeout(1300);
      const lFinal = await lista();
      verifica("lista ascunsa: se deschide lin si cardurile apar", l100 && lFinal && l100.h > 0 && l100.h < lFinal.h && lFinal.inEcran > 0 && lFinal.invizibile === 0, { l100, lFinal });
    }
    await ctx.close();
  }
  // Confetti la dezvaluirea si la copierea codului (dupa revenirea din tabul magazinului).
  {
    const ctx = await context(b, { viewport: { width: 1366, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
    const p = await ctx.newPage();
    await p.goto(`${BAZA}/cod-reducere/${MAGAZIN}`, { waitUntil: "load" });
    const buton = p.locator(".cc-reveal").first();
    if (await buton.count()) {
      const [tab] = await Promise.all([ctx.waitForEvent("page", { timeout: 5000 }).catch(() => null), buton.click()]);
      if (tab) await tab.close();
      await p.bringToFront();
      await p.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
      await p.waitForTimeout(150);
      const laDezvaluire = await p.evaluate(() => document.querySelectorAll(".am-confetti i").length);
      await p.waitForTimeout(1300);
      const ramase = await p.evaluate(() => document.querySelectorAll(".am-confetti").length);
      await p.locator(".cc-copy").first().click();
      await p.waitForTimeout(120);
      const laCopiere = await p.evaluate(() => document.querySelectorAll(".am-confetti i").length);
      verifica("confetti: la dezvaluire si la copiere, apoi curatat", laDezvaluire > 0 && ramase === 0 && laCopiere > 0, { tabMagazin: !!tab, laDezvaluire, ramase, laCopiere });
    }
    await ctx.close();
  }
  // „Miscare redusa": fara ridicarea noua (ramane doar regula veche de 1 px a site-ului) si fara ascundere.
  {
    const ctx = await context(b, { viewport: { width: 1366, height: 900 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(`${BAZA}/cod-reducere/${MAGAZIN}`, { waitUntil: "load" });
    await p.waitForTimeout(1500);
    const card = p.locator(".cc").first();
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await card.hover({ position: { x: 20, y: 20 } });
      await p.waitForTimeout(60);
      const t = await card.evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).m42);
      const ascunse = await p.evaluate(() => document.querySelectorAll(".am-ascuns").length);
      verifica("miscare redusa: fara ridicare noua si fara ascundere", t >= -1.01 && ascunse === 0, { t, ascunse });
    }
    await ctx.close();
  }
}

(async () => {
  const b = await chromium.launch();
  for (const url of PAGINI) {
    for (const v of [{ latime: 390, inaltime: 844 }, { latime: 1366, inaltime: 900 }]) {
      await stari(b, url, v);
      await stari(b, url, { ...v, redus: true });
    }
  }
  await miscare(b);
  await b.close();
  const picate = rez.filter((x) => !x.ok);
  for (const x of rez) console.log(`${x.ok ? "OK  " : "PICA"} ${x.nume}${x.ok ? "" : "  " + JSON.stringify(x.detalii)}`);
  console.log(picate.length ? `\n${picate.length} din ${rez.length} verificari au picat` : `\nToate cele ${rez.length} verificari au trecut`);
  process.exit(picate.length ? 1 : 0);
})();
