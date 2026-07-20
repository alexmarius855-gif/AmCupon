/**
 * POST /api/newsletter — Aboneaza email la Brevo
 * Env vars Vercel: BREVO_API_KEY, BREVO_LIST_ID (default 2)
 *
 * Securitate:
 *  - Validare email stricta
 *  - Rate limit simplu pe IP (max 5 req / 60s pe edge) via header CF-Connecting-IP
 *  - CORS restrictionat la amcupon.ro (+ localhost dev)
 */
export const runtime = "edge";

const BREVO_API = "https://api.brevo.com/v3/contacts";
const LIST_ID   = parseInt(process.env.BREVO_LIST_ID || "2", 10);
// IMPORTANT: BREVO_API_KEY != BREVO_SMTP_PASS
// API key (xkeysib-...) se ia din brevo.com → Settings → API Keys
// SMTP pass (xsmtpsib-...) este ALTCEVA si NU functioneaza ca REST API key
const API_KEY   = process.env.BREVO_API_KEY || "";

const ALLOWED_ORIGINS = new Set([
  "https://amcupon.ro",
  "https://www.amcupon.ro",
  "http://localhost:3000",
]);

// Rate limit simplu in-memory (edge runtime — per-isolate, nu global, dar reduce abuzul)
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT   = 5;   // max cereri
const RATE_WINDOW  = 60;  // secunde

function checkRateLimit(ip: string): boolean {
  const now  = Math.floor(Date.now() / 1000);
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.reset < now) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function getCorsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://amcupon.ro";
  return {
    "Access-Control-Allow-Origin":  allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary":                          "Origin",
  };
}

// Validare email mai stricta
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

// ── ALERT_STORES (price alert per magazin) ──────────────────────────────────
// PriceAlert.tsx trimite tag="alert_{magazin}". Salvam magazinul ca atribut
// custom Brevo (CSV), citit ulterior de scripts/check_price_alerts.py.
// Atributul ALERT_STORES trebuie creat o singura data in Brevo:
// Contacts -> Settings -> Contact attributes -> Text -> ALERT_STORES
function magazinFromTag(tag: string): string | null {
  if (!tag.startsWith("alert_")) return null;
  const magazin = tag.slice("alert_".length).trim().toLowerCase();
  return magazin || null;
}

async function getExistingAlertStores(email: string, apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`${BREVO_API}/${encodeURIComponent(email)}`, {
      headers: { "api-key": apiKey, "Accept": "application/json" },
    });
    if (!res.ok) return []; // contact nou sau eroare — pornim de la lista goala
    const data = await res.json();
    const raw = (data?.attributes?.ALERT_STORES || "") as string;
    return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

// ── Oferte reale pt. welcome email ──────────────────────────────────────────
// Edge runtime nu are fs — luam output.json prin fetch (acelasi mecanism ca
// homepage-ul). Daca fetch-ul pica, blocul de oferte nu se randeaza deloc —
// NU cadem pe o lista hardcodata (lectie din auditul de onestitate 03.07.2026,
// vezi CLAUDE.md: nu afisam date fabricate/stale ca fiind reale).
type OfertaEmail = { slug: string; nume: string; cod: string; procent: string };

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function extrageProcentEmail(...texte: Array<string | undefined>): string {
  for (const t of texte) {
    if (!t) continue;
    const m = t.match(/(\d{1,2})\s*%/);
    if (m) return `-${m[1]}%`;
  }
  return "";
}

async function getTopOferte(limit = 6): Promise<OfertaEmail[]> {
  try {
    const res = await fetch("https://amcupon.ro/output.json", { cache: "no-store" });
    if (!res.ok) return [];
    const toate = (await res.json()) as Array<Record<string, unknown>>;
    const cuOferta = toate.filter(
      (m) => m?.are_promotie && Array.isArray(m?.promotii) && (m.promotii as unknown[]).length > 0
    );
    cuOferta.sort((a, b) => ((b.scor_final as number) || 0) - ((a.scor_final as number) || 0));
    return cuOferta.slice(0, limit).map((m) => {
      const slug = String(m.magazin || "");
      const numeBrut = String(m.magazin_display || slug.split(".")[0].replace(/-/g, " "));
      const nume = numeBrut.replace(/\b\w/g, (c) => c.toUpperCase());
      const promos = m.promotii as Array<Record<string, unknown>>;
      const promo = promos.find((p) => p?.cod_cupon) || promos[0] || {};
      const cod = String(promo.cod_cupon || "").trim();
      const titlu = String(promo.nume || promo.descriere || "");
      const procent = extrageProcentEmail(titlu, promo.descriere as string | undefined);
      return { slug, nume, cod, procent };
    }).filter((o) => o.slug);
  } catch {
    return [];
  }
}

// ── Welcome email ────────────────────────────────────────────────────────────
// IMPORTANT: pe Vercel Edge trebuie AWAITED inainte de a returna raspunsul,
// altfel isolate-ul se opreste si emailul nu se trimite. Returneaza succes.
async function sendWelcomeEmail(email: string, apiKey: string): Promise<boolean> {
  const oferte = await getTopOferte(6);
  const html = `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bun venit la AmCupon.ro!</title></head>
<body style="margin:0;padding:0;background:#F7F9FC;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0d9488 0%,#14b8a6 100%);padding:40px 32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
        <span style="background:rgba(255,255,255,0.2);color:#fff;font-weight:900;font-size:16px;padding:4px 10px;border-radius:8px;">Am</span>
        <span style="color:#fff;font-weight:900;font-size:24px;">Cupon.ro</span>
      </div>
      <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0 0 8px;">Bun venit! 🎉</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:15px;margin:0;">Ești abonat la cele mai bune oferte din România</p>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Salut! Îți mulțumim că te-ai abonat la <strong>AmCupon.ro</strong>.
        De acum înainte vei fi primul care află codurile de reducere active și ofertele exclusive de la peste <strong>1000 magazine partenere</strong>.
      </p>
      <!-- CTA principal -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://amcupon.ro/#promotii" style="background:#0d9488;color:#fff;font-weight:900;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;display:inline-block;">
          Vezi ofertele active acum →
        </a>
      </div>
      <!-- Categorii populare -->
      <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Categorii populare</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:24px;">
        ${[
          {emoji:"👗",label:"Fashion",href:"/categorii/fashion"},
          {emoji:"💻",label:"Electronice",href:"/categorii/electronice"},
          {emoji:"💄",label:"Beauty",href:"/categorii/beauty"},
          {emoji:"💊",label:"Sănătate",href:"/categorii/sanatate"},
          {emoji:"🏡",label:"Casă & Grădină",href:"/categorii/casa-gradina"},
          {emoji:"🏃",label:"Sport",href:"/categorii/sport"},
        ].map(c => `
        <a href="https://amcupon.ro${c.href}" style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#F7F9FC;border:1px solid #e5e7eb;border-radius:10px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">
          <span>${c.emoji}</span>${c.label}
        </a>`).join("")}
      </div>
      ${oferte.length ? `
      <!-- Oferte active chiar acum (reale, din output.json) -->
      <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Oferte active chiar acum</p>
      <div style="margin-bottom:32px;">
        ${oferte.map(o => {
          const tag = escHtml(o.procent || (o.cod ? "COD" : "OFERTĂ"));
          const detaliu = o.cod ? ` — cod <strong>${escHtml(o.cod)}</strong>` : "";
          return `<a href="https://amcupon.ro/cod-reducere/${encodeURIComponent(o.slug)}" style="display:flex;align-items:center;gap:10px;padding:12px 14px;margin-bottom:8px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;text-decoration:none;color:#0f766e;font-size:13px;font-weight:600;">
            <span style="background:#0d9488;color:#fff;font-weight:900;font-size:11px;padding:3px 8px;border-radius:6px;white-space:nowrap;">${tag}</span>
            <span>${escHtml(o.nume)}${detaliu}</span>
          </a>`;
        }).join("")}
      </div>` : ""}
      <!-- Extensie -->
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#0c4a6e;font-weight:700;font-size:14px;">🧩 Extensia Chrome — reduceri automate</p>
        <p style="margin:0 0 12px;color:#0369a1;font-size:13px;">Instalează extensia AmCupon și primești automat cele mai bune coduri când ești pe orice site partener.</p>
        <a href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb" style="background:#0d9488;color:#fff;font-weight:700;font-size:13px;padding:8px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Instalează gratuit</a>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#F7F9FC;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">AmCupon.ro — Coduri de reducere verificate zilnic</p>
      <p style="color:#d1d5db;font-size:11px;margin:0;">
        Primești acest email deoarece te-ai abonat pe amcupon.ro.<br>
        Conținut afiliat — primim comision din bugetul de marketing al magazinelor.
      </p>
    </div>
  </div>
</body>
</html>`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "AmCupon.ro", email: "newsletter@amcupon.ro" },
      to: [{ email }],
      subject: "Bun venit la AmCupon.ro! 🎁 Ofertele zilei te așteaptă",
      htmlContent: html,
      tags: ["welcome"],
    }),
  });
  if (!res.ok) {
    // Nu mai inghitim eroarea in tacere - daca expeditorul nu e verificat in
    // Brevo (cauza cunoscuta, vezi send_newsletter.py), vrem sa apara in logs.
    const body = await res.text().catch(() => "");
    console.error("[newsletter] Welcome email failed:", res.status, body);
    return false;
  }
  return true;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new Response(null, { headers: getCorsHeaders(origin) });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Rate limiting pe IP
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Prea multe cereri. Incearca din nou in cateva minute." },
      { status: 429, headers: { ...corsHeaders, "Retry-After": "60" } }
    );
  }

  // Parse body
  let email = "";
  let tag = "";
  let source = "";
  try {
    const body = await request.json();
    email  = (body.email  || "").trim().toLowerCase();
    tag    = (body.tag    || "").trim();
    source = (body.source || "").trim();
  } catch {
    return Response.json({ error: "Body invalid" }, { status: 400, headers: corsHeaders });
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "Adresa de email invalida." }, { status: 400, headers: corsHeaders });
  }

  // Fara API key — returneaza eroare clara (nu simula succes fals)
  if (!API_KEY) {
    console.warn("[newsletter] BREVO_API_KEY nu este setat in env vars");
    return Response.json(
      { error: "Serviciul de newsletter este momentan in configurare. Revino in curand!" },
      { status: 503, headers: corsHeaders }
    );
  }

  const magazin = magazinFromTag(tag);

  try {
    const attributes: Record<string, string> = {
      SOURCE:      source || "amcupon.ro",
      SIGNUP_DATE: new Date().toISOString().split("T")[0],
    };

    if (magazin) {
      const existing = await getExistingAlertStores(email, API_KEY);
      if (!existing.includes(magazin)) existing.push(magazin);
      attributes.ALERT_STORES = existing.join(",");
    }

    const res = await fetch(BREVO_API, {
      method: "POST",
      headers: {
        "api-key":      API_KEY,
        "Content-Type": "application/json",
        "Accept":       "application/json",
      },
      body: JSON.stringify({
        email,
        listIds:       [LIST_ID],
        updateEnabled: true,
        attributes,
      }),
    });

    if (res.status === 201) {
      // Contact NOU (Brevo intoarce 201 doar la prima creare). Email de bun
      // venit doar pt. abonarile generice — alertele de pret au deja
      // confirmare inline in PriceAlert.tsx, nu trimitem dublu.
      // AWAITED (nu fire-and-forget): pe Edge altfel nu apuca sa se trimita.
      const welcomeSent = magazin ? false : await sendWelcomeEmail(email, API_KEY);
      return Response.json({ ok: true, welcomeSent }, { headers: corsHeaders });
    }
    if (res.status === 204) {
      // Contact deja existent, actualizat (updateEnabled:true) — NU retrimitem
      // welcome. Bug fix 20.07.2026: site-ul are 5+ formulare de abonare pe
      // aceeasi pagina (popup, footer, homepage etc.) — daca cineva se
      // reaboneaza prin alt formular, primea un al 2-lea email de bun venit.
      return Response.json({ ok: true, existing: true, welcomeSent: false }, { headers: corsHeaders });
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 400 && (data?.code === "duplicate_parameter" || data?.code === "contact_already_in_list")) {
      // Contact deja existent — NU retrimitem welcome (vezi nota de mai sus).
      return Response.json({ ok: true, existing: true, welcomeSent: false }, { headers: corsHeaders });
    }
    console.error("[newsletter] Brevo API error:", res.status, JSON.stringify(data));
    // Returnam mesaj mai specific in functie de tipul erorii
    const msg = data?.message || "Eroare server. Incearca din nou.";
    return Response.json({ error: msg }, { status: 500, headers: corsHeaders });
  } catch (err) {
    console.error("Newsletter fetch error:", err);
    return Response.json({ error: "Eroare retea" }, { status: 500, headers: corsHeaders });
  }
}
