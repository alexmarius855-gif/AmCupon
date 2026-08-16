import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabase } from "../../../lib/supabase";

/**
 * Vot comunitar pe cupoane — "a functionat codul?".
 *
 * CONTEXT care explica de ce e construit exact asa: pe 09.08.2026 a fost STERS
 * de pe site un widget de vot identic la aspect, pentru ca scria doar in
 * `localStorage` si nu ajungea nicaieri. Parea ca ascultam feedback, nu faceam
 * nimic cu el. Reconstructia e legitima doar cu voturile intr-o baza reala.
 *
 * De aici cele doua reguli pe care le impune codul asta:
 *  1. daca baza nu raspunde, raspundem cu eroare EXPLICITA, ca UI-ul sa spuna
 *     "n-a mers, incearca mai tarziu" — NU pretindem ca votul s-a inregistrat.
 *     Conteaza in practica: proiectul Supabase e pe free tier si s-a auto-pauzat
 *     de 4 ori pana acum (documentat in CLAUDE.md), deci cazul chiar apare.
 *  2. scorul se calculeaza DIN voturi reale; cu 0 voturi nu se afiseaza nimic
 *     (vezi componenta de UI).
 *
 * RATE LIMITING: nu prin cookie (se sterge din client in doua secunde), ci prin
 * constrangere UNIQUE pe (magazin, cupon_hash, ip_hash) in Postgres. IP-ul nu se
 * stocheaza in clar — doar un hash cu sare, ca sa nu tinem date personale.
 * Verificat pe baza reala: al doilea vot de pe acelasi IP nu se contorizeaza.
 */

export const runtime = "nodejs";       // avem nevoie de `crypto` pentru hash

/** Sare pentru hash-ul de IP. Nu e un secret criptografic — impiedica doar
 *  reconstituirea IP-ului dintr-un hash, daca baza ar ajunge vreodata expusa. */
const SARE = process.env.VOTE_IP_SALT ?? "amcupon-vot-2026";

function ipHash(req: NextRequest): string {
  const brut =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "necunoscut";
  return createHash("sha256").update(SARE + brut).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  let body: { magazin?: string; cuponHash?: string; pozitiv?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ eroare: "cerere invalida" }, { status: 400 });
  }

  const { magazin, cuponHash, pozitiv } = body;
  if (!magazin || !cuponHash || typeof pozitiv !== "boolean") {
    return NextResponse.json({ eroare: "parametri lipsa" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ eroare: "baza indisponibila" }, { status: 503 });
  }

  const { data, error } = await sb.rpc("voteaza_cupon", {
    p_magazin: magazin,
    p_cupon_hash: cuponHash,
    p_pozitiv: pozitiv,
    p_ip_hash: ipHash(req),
  });

  if (error) {
    // 503, nu 200 cu date inventate: UI-ul trebuie sa poata spune adevarul.
    console.error("[vote] RPC esuat:", error.message);
    return NextResponse.json({ eroare: "vot neinregistrat" }, { status: 503 });
  }

  const rand = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    da: Number(rand?.da ?? 0),
    nu: Number(rand?.nu ?? 0),
    dejaVotat: Boolean(rand?.deja_votat),
  });
}

/** Totalurile pentru toate cupoanele unui magazin: /api/vote?magazin=drmax.ro */
export async function GET(req: NextRequest) {
  const magazin = req.nextUrl.searchParams.get("magazin");
  if (!magazin) {
    return NextResponse.json({ eroare: "lipseste magazin" }, { status: 400 });
  }

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ totaluri: {} });

  const { data, error } = await sb.rpc("totaluri_voturi", { p_magazin: magazin });
  if (error) {
    console.error("[vote] citire esuata:", error.message);
    // La CITIRE degradam elegant: fara totaluri, UI-ul nu arata niciun scor.
    // E corect — absenta scorului e onesta, un scor inventat nu ar fi.
    return NextResponse.json({ totaluri: {} });
  }

  const totaluri: Record<string, { da: number; nu: number }> = {};
  for (const r of (data ?? []) as { cupon_hash: string; da: number; nu: number }[]) {
    totaluri[r.cupon_hash] = { da: Number(r.da), nu: Number(r.nu) };
  }
  return NextResponse.json({ totaluri });
}
