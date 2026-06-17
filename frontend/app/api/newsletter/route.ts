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

// ── Welcome email ────────────────────────────────────────────────────────────
async function sendWelcomeEmail(email: string, apiKey: string) {
  const html = `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Bun venit la AmCupon.ro!</title></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);padding:40px 32px;text-align:center;">
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
        De acum înainte vei fi primul care află codurile de reducere active și ofertele exclusive de la peste <strong>288 magazine partenere</strong>.
      </p>
      <!-- CTA principal -->
      <div style="text-align:center;margin:32px 0;">
        <a href="https://amcupon.ro/#promotii" style="background:#4f46e5;color:#fff;font-weight:900;font-size:16px;padding:16px 40px;border-radius:12px;text-decoration:none;display:inline-block;">
          Vezi ofertele active acum →
        </a>
      </div>
      <!-- Categorii populare -->
      <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Categorii populare</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:24px;">
        ${[
          {emoji:"👗",label:"Fashion",href:"/categorii/fashion"},
          {emoji:"💻",label:"Electronice",href:"/categorii/electronics-itc"},
          {emoji:"💄",label:"Beauty",href:"/categorii/beauty"},
          {emoji:"💊",label:"Farmacie",href:"/farmacie"},
          {emoji:"🏡",label:"Casa & Gradina",href:"/categorii/home-garden"},
          {emoji:"🏃",label:"Sport",href:"/categorii/sports-outdoors"},
        ].map(c => `
        <a href="https://amcupon.ro${c.href}" style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px;text-decoration:none;color:#374151;font-size:13px;font-weight:600;">
          <span>${c.emoji}</span>${c.label}
        </a>`).join("")}
      </div>
      <!-- Magazine top -->
      <p style="color:#6b7280;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Magazine cu oferte active</p>
      <div style="margin-bottom:32px;">
        ${["emag.ro","fashiondays.ro","notino.ro","altex.ro","drmax.ro"].map(m => {
          const label = m.split(".")[0].charAt(0).toUpperCase() + m.split(".")[0].slice(1);
          return `<a href="https://amcupon.ro/cod-reducere/${m}" style="display:inline-block;margin:4px;padding:6px 14px;background:#eef2ff;border:1px solid #c7d2fe;border-radius:20px;text-decoration:none;color:#4338ca;font-size:13px;font-weight:700;">Cod ${label}</a>`;
        }).join("")}
      </div>
      <!-- Extensie -->
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;color:#0c4a6e;font-weight:700;font-size:14px;">🧩 Extensia Chrome — reduceri automate</p>
        <p style="margin:0 0 12px;color:#0369a1;font-size:13px;">Instalează extensia AmCupon și primești automat cele mai bune coduri când ești pe orice site partener.</p>
        <a href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb" style="background:#0ea5e9;color:#fff;font-weight:700;font-size:13px;padding:8px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Instalează gratuit</a>
      </div>
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">AmCupon.ro — Coduri de reducere verificate zilnic</p>
      <p style="color:#d1d5db;font-size:11px;margin:0;">
        Primești acest email deoarece te-ai abonat pe amcupon.ro.<br>
        Conținut afiliat — primim comision din bugetul de marketing al magazinelor.
      </p>
    </div>
  </div>
</body>
</html>`;

  await fetch("https://api.brevo.com/v3/smtp/email", {
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
  try {
    const body = await request.json();
    email = (body.email || "").trim().toLowerCase();
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

  try {
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
        attributes: {
          SOURCE:      "amcupon.ro",
          SIGNUP_DATE: new Date().toISOString().split("T")[0],
        },
      }),
    });

    if (res.status === 201 || res.status === 204) {
      // Trimite email de bun venit (fire-and-forget, nu blocam raspunsul)
      sendWelcomeEmail(email, API_KEY).catch(() => {});
      return Response.json({ ok: true }, { headers: corsHeaders });
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 400 && (data?.code === "duplicate_parameter" || data?.code === "contact_already_in_list")) {
      return Response.json({ ok: true, existing: true }, { headers: corsHeaders });
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
