/**
 * POST /api/newsletter — Aboneaza email la Brevo
 * Env vars Vercel: BREVO_API_KEY, BREVO_LIST_ID (default 2)
 */
export const runtime = "edge";

const BREVO_API = "https://api.brevo.com/v3/contacts";
const LIST_ID   = parseInt(process.env.BREVO_LIST_ID || "2", 10);
const API_KEY   = process.env.BREVO_API_KEY || "";

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = (body.email || "").trim().toLowerCase();
  } catch {
    return Response.json({ error: "Body invalid" }, { status: 400 });
  }

  if (!email || !email.includes("@") || !email.includes(".")) {
    return Response.json({ error: "Email invalid" }, { status: 400 });
  }

  // Dev mode fara API key
  if (!API_KEY) {
    console.warn("BREVO_API_KEY nu este setat");
    return Response.json({ ok: true, dev: true });
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
      return Response.json({ ok: true });
    }
    const data = await res.json().catch(() => ({}));
    // Contact deja existent = success
    if (res.status === 400 && data?.code === "duplicate_parameter") {
      return Response.json({ ok: true, existing: true });
    }
    console.error("Brevo error:", res.status, data);
    return Response.json({ error: "Eroare server" }, { status: 500 });
  } catch (err) {
    console.error("Newsletter fetch error:", err);
    return Response.json({ error: "Eroare retea" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
