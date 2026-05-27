/**
 * Popup script — AmCupon Extension
 * Detecteaza domeniul curent, cauta in output.json, afiseaza ofertele.
 */

/* ── Utilitare ──────────────────────────────────────────────────────────── */

function getDomain(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host.toLowerCase();
  } catch {
    return null;
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/www\./g, "")
    .replace(/\/$/, "")
    .replace(/[^a-z0-9]/g, "");
}

function formatCashback(comision) {
  if (!comision) return null;
  const nums = [...comision.matchAll(/[\d.]+/g)].map((m) => parseFloat(m[0]));
  if (!nums.length) return null;
  const max = Math.max(...nums);
  if (max <= 0) return null;
  return nums.length > 1 ? `Cashback pana la ${max}%` : `Cashback ${max}%`;
}

/* ── Matching magazin ───────────────────────────────────────────────────── */

function findStore(data, currentDomain) {
  if (!data || !currentDomain) return null;
  const needle = slugify(currentDomain);

  return data.find((m) => {
    // Incearca slug-ul magazinului
    const slug = slugify(m.magazin || "");
    if (slug && needle.includes(slug)) return true;
    if (slug && slug.includes(needle)) return true;

    // Incearca URL-ul real al magazinului (nu afiliat)
    const urlReal = m.url_real || m.url || "";
    if (urlReal) {
      const d = slugify(getDomain(urlReal) || "");
      if (d && needle.includes(d)) return true;
      if (d && d.includes(needle)) return true;
    }

    // Display name normalizat
    const display = slugify(m.magazin_display || "");
    if (display && needle.includes(display)) return true;

    return false;
  }) || null;
}

/* ── Render stari ───────────────────────────────────────────────────────── */

const content  = document.getElementById("content");
const siteBar  = document.getElementById("siteBar");

function renderLoading() {
  content.innerHTML = `
    <div class="state-loading">
      <div class="spinner"></div>
      <div>Se cauta oferte...</div>
    </div>`;
}

function renderNoData() {
  content.innerHTML = `
    <div class="state-notfound">
      <div class="emoji">&#128262;</div>
      <div class="label">Nu pot incarca datele</div>
      <div class="sub">Verifica conexiunea la internet.</div>
    </div>`;
}

function renderNotFound(domain) {
  content.innerHTML = `
    <div class="state-notfound">
      <div class="emoji">&#128532;</div>
      <div class="label">Nicio oferta pentru acest site</div>
      <div class="sub"><strong>${domain}</strong> nu e in baza de date AmCupon.</div>
      <a class="btn-primary" href="https://amcupon.ro" target="_blank"
         style="margin-top:10px;font-size:12px;">
        Vezi toate magazinele &rarr;
      </a>
    </div>`;
}

function renderStore(magazin) {
  // Extrage campuri corecte din output.json
  const slug = magazin.magazin || "";
  const name = slug.split(".")[0].replace(/-/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const logo  = magazin.logo_url || magazin.logo || "";
  const promotii = magazin.promotii || [];

  // Gaseste prima promotie cu cod, altfel prima promotie
  const promoWithCode = promotii.find(p => p.cod_cupon) || null;
  const firstPromo    = promotii[0] || null;
  const cod   = promoWithCode?.cod_cupon || "";
  const url   = promoWithCode?.landing_page || firstPromo?.landing_page || magazin.url_afiliat || magazin.url || "https://amcupon.ro";
  const cash  = formatCashback(magazin.comision);
  const scor  = magazin.scor_final || 0;

  // Logo / initiale
  let logoHtml;
  if (logo) {
    logoHtml = `<img class="card-logo" src="${logo}" alt="${name}"
                     onerror="this.style.display='none';this.nextSibling.style.display='flex'">
                <div class="card-logo-fallback" style="display:none">${name[0] || "A"}</div>`;
  } else {
    logoHtml = `<div class="card-logo-fallback">${name[0] || "A"}</div>`;
  }

  // Scor vizual
  const trustStars = scor >= 80 ? "&#9733;&#9733;&#9733; Magazin de incredere"
                   : scor >= 50 ? "&#9733;&#9733; Recomandat"
                   : "&#9733; In baza de date";

  // Cod reducere
  let codHtml = "";
  if (cod) {
    codHtml = `
      <div class="section-title">Cod reducere</div>
      <div class="coupon-box">
        <div class="coupon-code" id="couponCode">${cod}</div>
        <button class="btn-copy" id="btnCopy" data-code="${cod}">Copiaza</button>
      </div>`;
  }

  // Promotii (toate, max 3)
  let promoHtml = "";
  const promoList = promotii.slice(0, 3);
  if (promoList.length > 0) {
    promoHtml = `<div class="section-title">${cod ? "Toate ofertele" : "Oferte active"} (${promotii.length})</div>`;
    promoList.forEach(p => {
      const txt = (p.nume || "").slice(0, 120) + ((p.nume || "").length > 120 ? "..." : "");
      const hasCod = p.cod_cupon && p.cod_cupon !== cod;
      promoHtml += `<div class="promo-text">${txt}${hasCod ? ` <span style="color:#16a34a;font-weight:700">[${p.cod_cupon}]</span>` : ""}</div>`;
    });
  }

  let cashHtml = "";
  if (cash && !cod) {
    cashHtml = `<div class="cashback-badge">&#8594; ${cash}</div><br>`;
  }

  const ctaText = cod
    ? "Mergi la magazin cu codul"
    : cash
    ? `Mergi la magazin (${cash})`
    : "Mergi la magazin";

  content.innerHTML = `
    <div class="card-top">
      ${logoHtml}
      <div>
        <div class="card-name">${name}</div>
        <div class="card-trust">${trustStars}</div>
      </div>
    </div>

    ${codHtml}
    ${cashHtml}
    ${promoHtml}

    <a class="btn-primary" href="${url}" target="_blank" id="btnVisit">
      ${ctaText} &rarr;
    </a>`;

  // Copy functionality
  const btnCopy = document.getElementById("btnCopy");
  if (btnCopy) {
    btnCopy.addEventListener("click", () => {
      navigator.clipboard.writeText(cod).then(() => {
        btnCopy.textContent = "Copiat!";
        btnCopy.classList.add("copied");
        setTimeout(() => { btnCopy.textContent = "Copiaza"; btnCopy.classList.remove("copied"); }, 2000);
      }).catch(() => {
        const el = document.getElementById("couponCode");
        const range = document.createRange();
        range.selectNode(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
        btnCopy.textContent = "Copiat!";
        btnCopy.classList.add("copied");
        setTimeout(() => { btnCopy.textContent = "Copiaza"; btnCopy.classList.remove("copied"); }, 2000);
      });
    });
  }

  // Track click
  document.getElementById("btnVisit")?.addEventListener("click", () => {
    chrome.storage.local.get("amcupon_clicks", (res) => {
      const clicks = res.amcupon_clicks || {};
      clicks[slug] = (clicks[slug] || 0) + 1;
      chrome.storage.local.set({ amcupon_clicks: clicks });
    });
  });
}

/* ── Init ───────────────────────────────────────────────────────────────── */

async function init() {
  renderLoading();

  // Obtine tab-ul curent
  let currentUrl = null;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentUrl = tab?.url || null;
  } catch (e) {
    console.warn("Nu pot obtine tab-ul curent:", e);
  }

  const domain = getDomain(currentUrl || "");
  if (domain) {
    siteBar.innerHTML = `Site detectat: <span>${domain}</span>`;
  } else {
    siteBar.innerHTML = `<span>Niciun site detectat</span>`;
  }

  // Solicita date de la background
  let data = null;
  try {
    const resp = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "GET_DATA" }, (res) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(res);
      });
    });
    data = resp?.data || null;
  } catch (err) {
    console.warn("Eroare comunicare background:", err);
  }

  if (!data) {
    renderNoData();
    return;
  }

  if (!domain) {
    renderNotFound("pagina curenta");
    return;
  }

  const magazin = findStore(data, domain);
  if (!magazin) {
    renderNotFound(domain);
    return;
  }

  renderStore(magazin);
}

// Refresh manual
document.getElementById("btnRefresh").addEventListener("click", async () => {
  const btn = document.getElementById("btnRefresh");
  btn.textContent = "...";
  btn.disabled = true;

  try {
    const resp = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "FORCE_REFRESH" }, resolve);
    });
    // Re-render cu date noi
    await init();
  } finally {
    btn.textContent = "↻ Refresh";
    btn.disabled = false;
  }
});

// Start
init();
