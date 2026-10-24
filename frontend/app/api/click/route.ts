import { NextRequest, NextResponse } from "next/server";
import { esteLinkAfiliat } from "../../../lib/subId";
import { paginaCurata } from "../../../lib/clicuri";
import { inregistreazaClick } from "../../../lib/clicuriServer";

/**
 * Primeste clicurile de pe linkurile afiliate (trimise de `AffiliateClickTracker` cu `sendBeacon`)
 * si le numara ANONIM, in propria baza — vezi `lib/clicuri.ts` pentru motiv si pentru ce NU stocam.
 *
 * Reguli:
 *  * raspunde MEREU 204, indiferent ce se intampla: un beacon nu are cine sa citeasca raspunsul, iar
 *    numaratoarea nu are voie sa produca erori vizibile sau sa incetineasca site-ul;
 *  * accepta DOAR linkuri afiliate (`esteLinkAfiliat`) — altfel oricine ar putea umple tabelul cu orice;
 *  * user-agentul se citeste in `inregistreazaClick`, decide `bot` + `dispozitiv`, apoi nu se mai
 *    pastreaza nicaieri;
 *  * `bot` se marcheaza, nu se arunca: un click de robot care apare in coloana `bot` poate fi explicat,
 *    unul disparut nu.
 */

export const runtime = "nodejs"; // citim output.json de pe disc

const DOAR_204 = () => new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    if (text.length > 4000) return DOAR_204();
    const b = JSON.parse(text) as { href?: unknown; pagina?: unknown; ref?: unknown; magazin?: unknown; loc?: unknown };

    const href = typeof b.href === "string" ? b.href.slice(0, 1500) : "";
    if (!esteLinkAfiliat(href)) return DOAR_204();
    const pagina = paginaCurata(b.pagina);
    if (!pagina) return DOAR_204();

    await inregistreazaClick({
      sursa: "site",
      pagina,
      href,
      magazin: typeof b.magazin === "string" ? b.magazin.slice(0, 120) : undefined,
      loc: typeof b.loc === "string" ? b.loc : undefined,
      userAgent: req.headers.get("user-agent"),
      referrer: typeof b.ref === "string" ? b.ref : null,
    });
  } catch {
    /* nimic: numaratoarea nu are voie sa strice nimic */
  }
  return DOAR_204();
}
