import fs from "fs";
import path from "path";
import { PesteMagazine, reteleAfiliere } from "../../lib/cifreSite";
import { linkAfiliat } from "../../lib/linkMagazin";
import { numeAfisat } from "../../lib/numeMagazin";

/**
 * /llms.txt — fisa site-ului pentru motoarele AI (ChatGPT, Perplexity, Claude, Gemini):
 * ce e AmCupon, ce face si ce NU face, plus paginile de citit primele (llmstxt.org).
 *
 * De ce (17.10.2026): auditul GEO (GeoLook, 40 de pagini) a gasit ca robots.txt lasa toti
 * crawlerii AI sa intre, dar site-ul nu avea /llms.txt. Cifrele sunt calculate din
 * output.json la build, ca in rest (lib/cifreSite.ts) — una scrisa de mana devine falsa.
 */
export const dynamic = "force-static";

interface Promo {
  cod_cupon?: string | boolean;
}
interface Magazin {
  magazin: string;
  url?: string | null;
  url_afiliat?: string | null;
  scor_final?: number;
  promotii?: Promo[];
}

const BASE = "https://amcupon.ro";

export async function GET() {
  let mag: Magazin[] = [];
  try {
    mag = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8"));
  } catch {
    mag = [];
  }

  const cuOferta = mag.filter((m) => (m.promotii || []).length > 0 && linkAfiliat(m));
  const cuCod = cuOferta.filter((m) => (m.promotii || []).some((p) => typeof p.cod_cupon === "string" && p.cod_cupon));
  const top = [...cuOferta]
    .sort(
      (a, b) =>
        Number(b.magazin.endsWith(".ro")) - Number(a.magazin.endsWith(".ro")) ||
        (b.scor_final || 0) - (a.scor_final || 0),
    )
    .slice(0, 15);

  const randuri = [
    "# AmCupon.ro",
    "",
    `> Site românesc gratuit cu coduri de reducere și oferte active de la ${PesteMagazine().toLowerCase()} partenere, actualizate de mai multe ori pe zi.`,
    "",
    "## Fapte",
    "",
    `- Magazine pe site: ${mag.length}; cu cel puțin o ofertă activă azi: ${cuOferta.length}; cu un cod de reducere activ: ${cuCod.length}.`,
    `- Ofertele vin de la rețelele de afiliere ${reteleAfiliere()} și expiră la data dată de rețea.`,
    "- Codurile NU sunt testate în coșul de cumpărături; pagina fiecărui magazin arată data de expirare când rețeaua o dă.",
    "- AmCupon primește un comision de la magazin când cineva cumpără după un clic pe site; prețul pentru cumpărător nu se schimbă.",
    "- Fiecare pagină de magazin spune când nu există niciun cod activ și propune magazine similare.",
    "- Limba: română. Piața: România.",
    "",
    "## Pagini principale",
    "",
    `- [Ofertele de azi](${BASE}/oferte-azi): toate ofertele active, într-o singură listă`,
    `- [Toate magazinele](${BASE}/toate-magazinele): lista completă, pe categorii`,
    `- [Studiu: codurile de reducere în România](${BASE}/studiu/coduri-reducere-romania): câte magazine online românești au cod, pe categorii (date proprii, CC-BY)`,
    `- [Calculator de reduceri](${BASE}/calculatoare/reducere): două reduceri succesive (30% + 20% = 44%, nu 50%)`,
    `- [Blog](${BASE}/blog): ghiduri de cumpărare`,
    "",
    "## Magazine cu oferte active acum",
    "",
    ...top.map((m) => `- [Cod reducere ${numeAfisat(m.magazin)}](${BASE}/cod-reducere/${m.magazin})`),
    "",
    "## Date deschise",
    "",
    `- [studiu-cupoane.json](${BASE}/studiu-cupoane.json): datele studiului, CC-BY`,
    `- [sitemap.xml](${BASE}/sitemap.xml)`,
    "",
  ];

  return new Response(randuri.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
