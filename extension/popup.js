/**
 * Popup — AmCupon Extension (v1.1, rescrisa pe 24.09.2026).
 *
 * Datele vin din https://amcupon.ro/extensie.json (scripts/genereaza_extensie.py): doar magazinele
 * cu oferta activa, cu linkul calculat pe server. Regulile Chrome Web Store din 11.03.2025, aplicate:
 *   - linkul de afiliere se deschide DOAR la clicul omului, si DOAR pe o oferta reala;
 *   - la un magazin fara oferta nu exista niciun link de afiliere;
 *   - programul de afiliere e spus in popup, langa butoane.
 * Ce s-a scos din ciorna din 26.05: comisionul nostru afisat ca „Cashback pana la X%", stelele
 * „Magazin de incredere" calculate din scorul intern, potrivirea magazinului pe subsir de text si
 * `innerHTML` cu texte venite din retele.
 */

/* ── Utilitare (gazda si gasesteMagazin vin din potrivire.js) ─────────────── */

function azi() {
  return new Date().toISOString().slice(0, 10);
}

function el(tag, clasa, text) {
  const e = document.createElement(tag);
  if (clasa) e.className = clasa;
  if (text !== undefined) e.textContent = text;
  return e;
}

function link(href, clasa, text) {
  const a = el("a", clasa, text);
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  return a;
}

/* ── Stari ──────────────────────────────────────────────────────────────── */

const continut = document.getElementById("content");
const bara = document.getElementById("siteBar");

function stare(eticheta, sub, cuLinkSpreSite) {
  continut.replaceChildren();
  const box = el("div", "state-notfound");
  box.append(el("div", "label", eticheta));
  if (sub) box.append(el("div", "sub", sub));
  if (cuLinkSpreSite) box.append(link("https://amcupon.ro", "btn-primary btn-small", "Caută pe AmCupon.ro"));
  continut.append(box);
}

function afiseazaMagazin(m) {
  continut.replaceChildren();
  const ziua = azi();
  const oferte = (m.oferte || []).filter((o) => !o.expira || o.expira >= ziua);
  if (oferte.length === 0) {
    stare(`Nicio ofertă activă la ${m.nume} acum.`, "Ofertele se actualizează de trei ori pe zi.", true);
    return;
  }

  continut.append(el("div", "card-name", m.nume));
  continut.append(el("div", "section-title", oferte.length === 1 ? "O ofertă activă" : `${oferte.length} oferte active`));

  for (const o of oferte) {
    const box = el("div", "offer");
    box.append(el("div", "offer-title", o.titlu));
    if (o.expira) box.append(el("div", "offer-meta", `Expiră pe ${o.expira.split("-").reverse().join(".")}`));

    if (o.cod) {
      const cupon = el("div", "coupon-box");
      const cod = el("div", "coupon-code", o.cod);
      const copiaza = el("button", "btn-copy", "Copiază");
      copiaza.addEventListener("click", () => {
        navigator.clipboard.writeText(o.cod).then(() => {
          copiaza.textContent = "Copiat!";
          copiaza.classList.add("copied");
          setTimeout(() => { copiaza.textContent = "Copiază"; copiaza.classList.remove("copied"); }, 2000);
        });
      });
      cupon.append(cod, copiaza);
      box.append(cupon);
    }

    // Linkul (de afiliere, cand `afiliat`) se deschide doar la acest clic.
    const mergi = link(o.link, "btn-primary", o.cod ? "Mergi la magazin cu codul" : "Vezi oferta");
    if (o.afiliat) mergi.rel = "sponsored noopener noreferrer";
    box.append(mergi);
    continut.append(box);
  }

  continut.append(link(m.pagina, "more-link", `Toate ofertele ${m.nume} pe AmCupon.ro`));
  if (oferte.some((o) => o.afiliat)) {
    continut.append(el("p", "disclosure",
      "Butoanele de mai sus sunt linkuri de afiliere: dacă cumperi, AmCupon.ro primește un comision " +
      "de la magazin, fără niciun cost în plus pentru tine. Nu testăm fiecare cod în coș."));
  }
}

/* ── Init ───────────────────────────────────────────────────────────────── */

async function init(fortat) {
  stare("Se caută oferte...");

  let url = null;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    url = tab?.url || null;
  } catch (e) {
    console.warn("Nu pot citi tab-ul curent:", e);
  }
  const host = gazda(url || "");
  bara.replaceChildren();
  if (host) {
    bara.append("Site: ", el("span", "", host));
  } else {
    bara.append(el("span", "", "Niciun site detectat"));
  }

  let date = null;
  try {
    const raspuns = await chrome.runtime.sendMessage({ type: fortat ? "FORCE_REFRESH" : "GET_DATA" });
    date = raspuns?.data || null;
  } catch (e) {
    console.warn("Eroare de comunicare cu fundalul:", e);
  }

  if (!date || !date.magazine) {
    stare("Nu pot încărca ofertele.", "Verifică conexiunea la internet.", false);
    return;
  }
  if (!host) {
    stare("Deschide site-ul unui magazin.", null, true);
    return;
  }
  const m = gasesteMagazin(date.magazine, host);
  if (!m) {
    stare(`Nicio ofertă activă la ${host} acum.`, "Ofertele se actualizează de trei ori pe zi.", true);
    return;
  }
  afiseazaMagazin(m);
}

document.getElementById("btnRefresh").addEventListener("click", async (ev) => {
  const btn = ev.currentTarget;
  btn.disabled = true;
  try {
    await init(true);
  } finally {
    btn.disabled = false;
  }
});

init(false);
