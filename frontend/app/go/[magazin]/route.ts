import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cuSubId } from "../../../lib/subId";

/**
 * `/go/[magazin]` — redirect de afiliere pe SERVER.
 *
 * ISTORIC, ca sa nu para o reintoarcere fara motiv: pe 08.08.2026 ruta asta a fost
 * respinsa explicit, dupa ce am aratat ca atribuirea pe pagina exista deja in
 * `AffiliateClickTracker` (client). Alex a cerut-o din nou pe 16.08 si a confirmat.
 *
 * CE ADAUGA FATA DE COMPONENTA CLIENT — si de ce nu se suprapun:
 *  * componenta rescrie linkurile la CLICK, deci functioneaza doar pe site, cu JS
 *    pornit. Ruta asta merge oriunde: newsletter, postari social, Telegram, un
 *    mesaj pe WhatsApp — locuri unde nu ruleaza niciun JS de-al nostru.
 *  * linkul e scurt si stabil (`amcupon.ro/go/drmax.ro`), deci nu expune URL-ul
 *    brut de retea si nu se rupe cand se schimba linkul de tracking.
 *
 * CE NU FACE, deliberat: NU rescrie linkurile existente de pe site. Acelea
 * functioneaza si aduc comision acum; a le muta pe toate ar adauga un hop de
 * redirect peste ceva ce merge, fara castig. `/go` e o a doua intrare, nu un
 * inlocuitor.
 *
 * Sub-id-ul vine din `lib/subId.ts`, aceeasi sursa ca la componenta client —
 * altfel ar fi doua harti de parametri care se desincronizeaza.
 */

export const runtime = "nodejs";       // citim output.json de pe disc

interface MagazinMin {
  magazin: string;
  url?: string;
  url_afiliat?: string;
}

let _cache: MagazinMin[] | null = null;
function magazine(): MagazinMin[] {
  if (_cache) return _cache;
  try {
    const p = path.join(process.cwd(), "public", "output.json");
    _cache = JSON.parse(fs.readFileSync(p, "utf-8")) as MagazinMin[];
  } catch {
    _cache = [];
  }
  return _cache;
}

/** Linkuri de tracking invalide cunoscute — `/NA6?` vine din generatoare vechi
 *  Profitshare si duce intr-o pagina de eroare, nu la magazin. */
function eValid(url: string): boolean {
  return !!url && !url.includes("/NA6?") && !url.includes("/NA6&");
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ magazin: string }> }
) {
  const { magazin } = await ctx.params;
  const slug = decodeURIComponent(magazin || "").toLowerCase().trim();

  const m =
    magazine().find((x) => x.magazin?.toLowerCase() === slug) ||
    // acelasi fallback ca pe pagina de magazin: URL-urile vechi nu trebuie sa cada
    magazine().find((x) => x.magazin?.toLowerCase().split(".")[0] === slug.split(".")[0]);

  // Magazin necunoscut -> pagina de cautare, nu 404 sec: vizitatorul a vrut ceva.
  if (!m) {
    return NextResponse.redirect(
      new URL(`/cautare?q=${encodeURIComponent(slug)}`, req.url),
      { status: 302 }
    );
  }

  const brut = eValid(m.url_afiliat || "") ? m.url_afiliat! : m.url || "";
  if (!brut) {
    return NextResponse.redirect(new URL(`/cod-reducere/${m.magazin}`, req.url), { status: 302 });
  }

  // Eticheta de atribuire: de unde a venit clicul. `?de=` permite etichetare
  // manuala in newsletter/social ("newsletter_august"), altfel marcam "go".
  const eticheta = req.nextUrl.searchParams.get("de") || "go";
  const destinatie = cuSubId(brut, eticheta);

  const res = NextResponse.redirect(destinatie, { status: 302 });
  // 302, nu 301: linkul de tracking se poate schimba, si un 301 ramane in cache-ul
  // browserului la infinit. Plus noindex — ruta nu trebuie sa ajunga in index.
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
