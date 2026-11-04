import { NextRequest, NextResponse, after } from "next/server";
import { cuSubId, curataEticheta } from "../../../../lib/subId";
import { inregistreazaClick } from "../../../../lib/clicuriServer";
import { criterii } from "../../../../lib/criterii";

/**
 * `/go/p/<id>` — linkul scurt al unui produs, pentru Telegram si social (04.11.2026). Face ce face `/go/<magazin>`:
 * numara clicul, pune eticheta de atribuire si trimite prin linkul platit. Doar produse din public/criterii.json,
 * deci nu poate fi folosit ca redirect spre orice adresa.
 */
export const runtime = "nodejs";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cautat = decodeURIComponent(id || "");
  for (const c of criterii()) {
    const p = c.produse.find((x) => x.id === cautat);
    if (!p) continue;
    const eticheta = req.nextUrl.searchParams.get("de") || "go";
    if (req.method !== "HEAD") {
      after(() =>
        inregistreazaClick({
          sursa: "go",
          pagina: `/go/${eticheta === "go" ? "direct" : curataEticheta(eticheta)}`,
          magazin: p.magazin,
          userAgent: req.headers.get("user-agent"),
          referrer: req.headers.get("referer"),
        }),
      );
    }
    const res = NextResponse.redirect(cuSubId(p.url, eticheta), { status: 302 });
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
  // Produsul a iesit din lista: lista de produse, nu un 404 sec.
  return NextResponse.redirect(new URL("/alege", req.url), { status: 302 });
}
