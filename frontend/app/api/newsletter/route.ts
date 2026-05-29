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
      return Response.json({ ok: true }, { headers: corsHeaders });
    }
    const data = await res.json().catch(() => ({}));
    if (res.status === 400 && data?.code === "duplicate_parameter") {
      return Response.json({ ok: true, existing: true }, { headers: corsHeaders });
    }
    console.error("Brevo error:", res.status, data);
    return Response.json({ error: "Eroare server" }, { status: 500, headers: corsHeaders });
  } catch (err) {
    console.error("Newsletter fetch error:", err);
    return Response.json({ error: "Eroare retea" }, { status: 500, headers: corsHeaders });
  }
}
