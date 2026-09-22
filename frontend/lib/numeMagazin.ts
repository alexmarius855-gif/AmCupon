/**
 * Numele afisabil al unui magazin, dintr-un slug de domeniu. SURSA UNICA.
 *
 * DE CE EXISTA (22.09.2026). Functia era scrisa de mana in **15 fisiere** — tiparul #3
 * din docs/LECTII-TEHNICE.md, „liste duplicate care se desincronizeaza". Divergenta se
 * si produsese: `MagazinCard.tsx` capatase un `NUME_OVERRIDE` (Click & Grow, Air Serbia)
 * pe care celelalte paisprezece copii nu-l aveau, deci acelasi magazin se numea diferit
 * pe carduri fata de pagina lui.
 *
 * BUG-UL PE CARE IL REPARA. Toate copiile faceau `magazin.split(".")[0]`, adica luau
 * PRIMUL segment al domeniului. La un subdomeniu, acela nu e brandul — e prefixul:
 *   store.hiby.com      -> „Store"       de.eureka.com    -> „De"
 *   us.lemorele.com     -> „Us"          it.alpinestars.com -> „It"
 *   ro.roborock.com     -> „Ro"          en.nyxhotels.com -> „En"
 * Masurat pe output.json: **34 de magazine**. Efectul se vedea in `<title>` („Cod
 * Reducere si Voucher De septembrie 2026"), in `<h1>` si pe fiecare card — iar cinci
 * perechi de pagini ajunsesera cu titluri IDENTICE intre ele, deci continut duplicat
 * pentru Google.
 */

/** Nume care nu se pot deriva din domeniu (prescurtari lipite, simboluri). */
const NUME_OVERRIDE: Record<string, string> = {
  "clickandgrow.com": "Click & Grow",
  "trampolinepartsandsupply.com": "Trampoline Parts & Supply",
  "silverrushstyle.com": "Silver Rush Style",
  "airserbia.com": "Air Serbia",
  "carmellimo.com": "Carmel Limo",
};

/**
 * Prefixe de subdomeniu care nu sunt brandul: limbi, tari, si cuvinte de magazin.
 * Se sare peste ele DOAR daca mai exista un segment in fata TLD-ului — altfel
 * `pi.inc` ar ramane fara nume, iar „Pi" chiar e numele acelui magazin.
 */
const PREFIXE_NEUTRE = new Set([
  "store", "shop", "www", "m", "app", "go", "new", "my", "web", "online", "buy", "ai",
  "ro", "us", "uk", "de", "fr", "it", "es", "nl", "pl", "eu", "en", "hu", "bg",
  "cz", "sk", "gr", "pt", "se", "dk", "fi", "no", "ie", "at", "ch", "be", "ca", "au",
]);

function capitalizeaza(s: string): string {
  return s
    .replace(/-/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Tari marcate explicit in domeniu. `.ro` lipseste intentionat: e publicul nostru
 *  implicit, iar „Notino RO" pe un site romanesc e zgomot, nu informatie. */
const REGIUNI = new Set([
  "us", "uk", "de", "fr", "it", "es", "nl", "pl", "eu", "hu", "bg", "cz", "sk",
  "gr", "pt", "se", "dk", "fi", "no", "ie", "at", "ch", "be", "ca", "au", "asia",
]);

/**
 * Eticheta de regiune, cand domeniul o spune explicit — ca sub-domeniu
 * (`de.anthbot.com`) sau ca TLD (`vevor.com.au`, `12go.asia`).
 *
 * 22.09.2026: dupa ce `numeAfisat` a inceput sa scoata brandul corect din subdomenii,
 * zece branduri au ajuns cu titluri IDENTICE pe domenii diferite — „Cod Reducere
 * Anthbot" pe us.anthbot.com si pe de.anthbot.com, „Alpinestars" pe it. si eu.
 * Pentru Google inseamna continut duplicat; pentru cititor, doua rezultate la fel.
 */
export function etichetaRegiune(magazin: string): string | null {
  const parti = (magazin || "").toLowerCase().split(".").filter(Boolean);
  if (parti.length < 2) return null;
  if (REGIUNI.has(parti[0])) return parti[0].toUpperCase();     // de.anthbot.com
  const tld = parti[parti.length - 1];
  if (REGIUNI.has(tld)) return tld.toUpperCase();               // vevor.com.au
  return null;
}

/**
 * Segmentul de BRAND dintr-un domeniu, fara prefixele de subdomeniu.
 *
 * 22.09.2026: `gasesteMagazin` din pagina de magazin cauta pe `split(".")[0]`, adica pe
 * PRIMUL label. La un subdomeniu acela e prefixul, nu brandul — deci `de.fossibot.com`
 * si `de.store.tapo.com` se potriveau amandoua cu `de.eureka.com` (primul label „de")
 * si SERVEAU pagina lui Eureka: titlu, oferte si link de afiliere ale altui magazin.
 * Exact tiparul din 15.09 („linkuri cu tracking care duc pe site-ul ALTUI brand"),
 * reaparut prin potrivirea pe subsir — tiparul #1 din docs/LECTII-TEHNICE.md.
 */
export function brandDomeniu(magazin: string): string {
  const parti = (magazin || "").toLowerCase().split(".").filter(Boolean);
  if (parti.length === 0) return "";
  let i = 0;
  while (i < parti.length - 2 && PREFIXE_NEUTRE.has(parti[i])) i++;
  return parti[i] || parti[0];
}

export function numeAfisat(magazin: string): string {
  if (!magazin) return "";
  if (NUME_OVERRIDE[magazin]) return NUME_OVERRIDE[magazin];

  const parti = magazin.toLowerCase().split(".").filter(Boolean);
  if (parti.length === 0) return "";

  // Sari peste prefixele neutre cat timp ramane un segment inaintea TLD-ului.
  let i = 0;
  while (i < parti.length - 2 && PREFIXE_NEUTRE.has(parti[i])) i++;

  const baza = capitalizeaza(parti[i] || parti[0]);
  const reg = etichetaRegiune(magazin);
  return reg ? `${baza} ${reg}` : baza;
}
