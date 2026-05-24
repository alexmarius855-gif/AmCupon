import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalid" }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Configurație lipsă" }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        listIds: [2],       // lista default Brevo
        updateEnabled: true, // nu da eroare daca exista deja
      }),
    });

    if (res.ok || res.status === 204) {
      return NextResponse.json({ ok: true });
    }

    const err = await res.json();
    // 400 cu "Contact already exist" = tot ok pentru user
    if (err?.code === "duplicate_parameter") {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Eroare server" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "Eroare conexiune" }, { status: 500 });
  }
}
