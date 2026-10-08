/**
 * „Unde gasesti azi" pe paginile /top/[slug] — produse REALE din feed-ul magazinelor
 * partenere, cu pretul de azi si linkul care plateste.
 *
 * De ce (05.10.2026), masurat, nu presupus:
 *   · Vercel Analytics, ultimele 31 de zile: paginile /top si articolele „cel mai bun X"
 *     sunt aproape singurele care primesc vizitatori din cautari (Bing, Google,
 *     DuckDuckGo). Paginile de cod de reducere — aproape deloc.
 *   · Pe toate cele 30 de pagini /top, butonul principal ducea la eMAG printr-un link
 *     Profitshare (cont respins si retea exclusa pe 19.08 — clicul nu mai plateste), iar
 *     12 butoane de magazin duceau la /cod-reducere/<magazin> pentru magazine care nu
 *     sunt in output.json: 404 (altex, flanco, pcgarage, douglas...).
 *   · In acelasi timp, feed-ul avea pentru 19 dintre teme produse reale cu link platit
 *     (34 de laptopuri din 3 magazine, 47 de smartwatch-uri din 5, 38 de espressoare).
 *
 * Functii PURE, fara React si FARA importuri (aceeasi conventie ca lib/oferteAcasa.ts):
 * linkul platit (lib/linkMagazin.ts) intra ca argument. Test:
 *   node lib/topFeed.test.mjs   (din frontend/)
 *
 * REGULA potrivirii, invatata pe titlurile reale (LECTII-TEHNICE, „potrivire pe subsir"):
 * acolo unde accesoriile contin tipul produsului mai tarziu in titlu („Husa laptop",
 * „Display laptop", „Pachet PC ... monitor"), tipul trebuie sa fie PRIMUL cuvant.
 * Prinse la calibrare, fiecare cu un caz in test: aparat foto Sony „pachet cu geanta"
 * la genti, detergent „cu Nano-Argint" la bijuterii, aspirator vertical CU fir la
 * „fara fir", purificatoare de APA (osmoza inversa) la purificatoare de aer,
 * „Test rapid Proteina C Reactiva" la suplimente.
 */

export interface ProdusFeed {
  title?: string;
  price?: number;
  url?: string;
  image?: string;
  merchant?: string;
  merchant_slug?: string;
  is_promo?: boolean;
}

export interface RegulaTema {
  /** Pe titlul normalizat (minuscule, fara diacritice) — vezi normTitlu(). */
  include: RegExp;
  exclude: RegExp;
  /** Sub acest pret, la tema asta, e accesoriu, mostra sau eroare de feed. */
  pretMin: number;
}

/** Ce nu e produs nou, intreg, vandut la bucata — la orice tema. */
export const EXCLUS_GLOBAL =
  /\b(resigilat\w*|second hand|refurbished|recondit\w*|sh|piese? de schimb|mostra|tester)\b/;

/**
 * O regula pe tema de top. Cheia = slug-ul din top-produse.json. O tema fara regula
 * (televizoare, scaune-gaming...) nu primeste sectiune — mai bine nimic decat o lista
 * potrivita pe ghicite.
 */
export const REGULI_TEME: Record<string, RegulaTema> = {
  laptopuri: { include: /^laptop\b/, exclude: /\b(husa|geanta|rucsac|suport|stand|masa)\b/, pretMin: 400 },
  telefoane: { include: /^(telefon|smartphone)\b/, exclude: /\b(husa|folie|suport|incarcator|cablu|fix|fara fir|dect|statie)\b/, pretMin: 300 },
  monitoare: { include: /^monitor\b/, exclude: /\b(bebe\w*|ritm|cardiac|tensiune|glicemie|puls|presiune|suport|brat)\b/, pretMin: 300 },
  tablete: { include: /^tableta\b/, exclude: /\b(grafica|desen|scris|lcd|copii|educativa|magnetica|interactiva)\b/, pretMin: 300 },
  "smartwatch-uri": { include: /\b(smartwatch|ceas smart|ceas inteligent)\b/, exclude: /\b(curea|bratara de schimb|husa|folie|incarcator|cablu|protectie|suport)\b/, pretMin: 80 },
  "casti-wireless": { include: /^casti\b.*\b(wireless|bluetooth)\b|^casti true wireless\b/, exclude: /\b(perne|tampoane|carcasa|husa|cablu|adaptor)\b/, pretMin: 50 },
  cafetiere: { include: /^(espressor|expresor|cafetiera|aparat de cafea)\b/, exclude: /\b(decalcifiant|filtru|garnitura|capsule|cana|cani|furtun|tavita|recipient|pastile|detartrant|copii|jucarie)\b/, pretMin: 150 },
  imprimante: { include: /^(imprimanta|multifunctionala)\b/, exclude: /\b(cartus|toner|hartie|banda|etichete|cerneala|3d)\b/, pretMin: 200 },
  "masini-de-spalat": { include: /^masina de spalat\b/, exclude: /\b(vase|detergent|tablete|capsule|furtun|picioare|husa)\b/, pretMin: 700 },
  "aspiratoare-robot": { include: /^(aspirator robot|robot de aspirare|robot aspirator|robot de curatenie)\b/, exclude: /\b(filtru|perie|perii|mop de schimb|sac|saci|kit|set)\b/, pretMin: 300 },
  "aspiratoare-fara-fir": { include: /^aspirator\b.*\b(fara fir|cordless)\b/, exclude: /\b(cu fir|auto|masina|filtru|perie|sac|saci|acumulator|incarcator|statie)\b/, pretMin: 300 },
  friteuze: { include: /^(friteuza|air ?fryer)\b/, exclude: /\b(hartie|tava|cos de schimb|forme|silicon)\b/, pretMin: 150 },
  // „de aer" e obligatoriu: fara el, toate cele 7 potriviri erau purificatoare de APA.
  // „Filtru HEPA" ramane permis: filtrele de schimb incep cu „Filtru", deci nu trec de ^purificator.
  "purificatoare-aer": { include: /^purificator( de)? aer\b/, exclude: /\b(apa|osmoza)\b/, pretMin: 150 },
  "trotinete-electrice": { include: /^trotineta electrica\b/, exclude: /\b(anvelopa|camera|frana|aripa|copii)\b/, pretMin: 500 },
  "scaune-birou": { include: /^scaun\b[^,]*\b(birou|ergonomic)\b/, exclude: /\b(roti|piston|husa|perna|copii)\b/, pretMin: 150 },
  "parfumuri-femei": { include: /\b(apa de parfum|eau de parfum|eau de toilette|parfum)\b.*\b(femei|dama|women|pour femme)\b/, exclude: /\b(esenta|ulei|odorizant|lumanare|deodorant|lotiune|gel de dus|crema|feromon\w*|igiena|cleanser)\b/, pretMin: 40 },
  "parfumuri-barbati": { include: /\b(apa de parfum|eau de parfum|eau de toilette|parfum)\b.*\b(barbati|men|homme|pour homme)\b/, exclude: /\b(esenta|ulei|odorizant|lumanare|deodorant|lotiune|gel de dus|crema|after shave|feromon\w*)\b/, pretMin: 40 },
  "pantofi-sport": { include: /\b(pantofi sport|sneakers|adidasi)\b/, exclude: /\b(sireturi|branturi|spray|crema|ciorapi|sosete|copii|bebe)\b/, pretMin: 60 },
  "genti-dama": { include: /^(geanta|poseta|rucsac)\b/, exclude: /\b(laptop|frigorifica|termica|cosmetice|scutece|mamici|unelte|scule|bebe|voiaj|plaja|cumparaturi|telefon|tactica|militara|barbati|copii|foto)\b/, pretMin: 60 },
  "bijuterii-argint": { include: /^(inel|inele|cercei|colier|coliere|bratara|lantisor|pandantiv|talisman|brosa|set( de)? bijuterii|set)\b.*\bargint\b/, exclude: /\b(placat|culoare argintie|tava|tacamuri|detergent)\b/, pretMin: 40 },
  "jucarii-copii": { include: /^(jucarie|jucarii|set( de)? jucarii|papusa|papusi|puzzle|lego)\b/, exclude: /\b(caine|caini|pisica|pisici|animale de companie|adult\w*|erotic\w*)\b/, pretMin: 20 },
  "suplimente-fitness": { include: /\b(proteina|proteine|whey|creatina|bcaa|pre-?workout)\b/, exclude: /\b(shaker|bar|batoane|baton|caine|pisica|par|sampon|test)\b/, pretMin: 30 },

  // Teme folosite doar sub articolele de blog (ARTICOLE_TEME), calibrate pe feed pe 05.10.2026.
  // Prinse la calibrare: „Carucior de curte, remorca de bicicleta" si „tip vagon pentru gradina"
  // la carucioare; camera auto SPATE (accesoriu, nu dashcam) la camere auto.
  "ochelari-soare": { include: /^ochelari de soare\b/, exclude: /\b(husa|toc|curea|snur|copii|lentile de schimb)\b/, pretMin: 40 },
  carucioare: { include: /^carucior\b/, exclude: /\b(papusi|papusa|jucarie|husa|umbreluta de schimb|organizator|suport|cumparaturi|transport|piata|gradina|curte|remorca|vagon)\b/, pretMin: 300 },
  routere: { include: /^(router|sistem mesh)\b/, exclude: /\b(antena|cablu|suport|adaptor)\b/, pretMin: 100 },
  "seruri-fata": { include: /^ser\b.*\b(fata|ten|facial)\b/, exclude: /\b(par|corp|unghii|gene)\b/, pretMin: 20 },
  trolere: { include: /^(troler|troller|valiza|geamantan)\b/, exclude: /\b(husa|eticheta|curea|lacat|cantar|organizator|copii)\b/, pretMin: 100 },
  "scaune-auto-copii": { include: /^scaun auto\b/, exclude: /\b(husa|protectie|oglinda|organizator|perna|suport)\b/, pretMin: 200 },
  "camere-auto": { include: /^(camera auto|camera video auto|camera de bord|dashcam|camera bord)\b/, exclude: /\b(suport|cablu|card|spate)\b/, pretMin: 100 },
  tensiometre: { include: /^tensiometru\b/, exclude: /\b(manseta|baterii|husa)\b/, pretMin: 60 },
  // 07.10.2026: forma de prezentare e obligatorie (capsule, tablete...) — altfel „baterie lavoar, zinc",
  // „bratara, cupru cu zinc", serurile „cu vitamina C" si dropsurile cu miere intrau la suplimente.
  // 08.10.2026, calibrate pe feed: la husse.ro/fera.ro titlul incepe cu numele produsului („Adult Active Life |
  // hrana uscata completa ... pentru caini"), deci hrana nu e ancorata la inceput; „trusa de prim ajutor ... caini"
  // si accesoriile ies prin excluderi.
  saltele: { include: /^saltea\b/, exclude: /\b(gonflabila|plaja|camping|bebe|copii|patut|husa|protectie|yoga|fitness|apa|antiescara|topper)\b/, pretMin: 300 },
  "hrana-caini": { include: /\b(hrana|pate|conserve)\b.*\bcaini\b/, exclude: /\b(pisici|pisica|trusa|bol|castron|recipient|dozator|jucarie|lesa|zgarda)\b/, pretMin: 30 },
  "creme-antirid": { include: /^crema\b.*\b(antirid|anti-rid|anti riduri|antiaging|anti-aging|riduri)\b/, exclude: /\b(maini|picioare|corp)\b/, pretMin: 20 },
  "fond-de-ten": { include: /^fond de ten\b/, exclude: /\b(burete|pensula)\b/, pretMin: 20 },
  "vitamine-minerale": { include: /\b(vitamina [a-z0-9]+|vitamine|multivitamin\w*|zinc|magneziu|omega[ -]?3|seleniu)\b.*\b(capsule|tablete|comprimate|picaturi|plicuri|jeleuri|softgel\w*|gummies)\b/, exclude: /\b(ser|crema|masca|caine|caini|pisica|pisici|bomboane|dropsuri|sampon|par|unghii|bratara|baterie|copii|ursuleti|animale)\b/, pretMin: 15 },
};

export interface TemaArticol {
  tema: string;
  /** filtru suplimentar pe titlul normalizat (ex. doar Samsung, doar monitoare de gaming) */
  filtru?: RegExp;
  /** numele in fraza, cand filtrul restrange tema („telefoane Samsung") */
  nume?: string;
  /** sub articol, si un singur magazin partener e util (trolere: doar Mirano are) */
  minMagazine?: number;
}

/**
 * Articolele „Cel mai bun X" -> tema din feed (cheia = slug fara an). Fara intrare, articolul
 * nu primeste sectiune. Nu exista intrari pentru teme fara acoperire in feed (laptop gaming: 3
 * produse; saltele, corturi, drone: 0) — mai bine nimic decat o lista nepotrivita.
 */
export const ARTICOLE_TEME: Record<string, TemaArticol> = {
  "cea-mai-buna-friteuza-aer": { tema: "friteuze" },
  "cea-mai-buna-masina-de-cafea": { tema: "cafetiere" },
  "cel-mai-bun-monitor-gaming": { tema: "monitoare", filtru: /\bgaming\b/, nume: "monitoare de gaming" },
  "cele-mai-bune-casti-wireless": { tema: "casti-wireless" },
  "cel-mai-bun-smartwatch": { tema: "smartwatch-uri" },
  "cel-mai-bun-parfum-barbati": { tema: "parfumuri-barbati" },
  "cel-mai-bun-parfum-femei": { tema: "parfumuri-femei" },
  "cele-mai-bune-genti-dama": { tema: "genti-dama" },
  "cele-mai-bune-adidasi": { tema: "pantofi-sport" },
  "cel-mai-bun-laptop-business": { tema: "laptopuri" },
  "cum-alegi-un-laptop": { tema: "laptopuri" },
  "cel-mai-bun-telefon-samsung": { tema: "telefoane", filtru: /\bsamsung\b/, nume: "telefoane Samsung", minMagazine: 1 },
  "cel-mai-bun-telefon-pentru-poze": { tema: "telefoane" },
  "cel-mai-bun-aspirator-robot": { tema: "aspiratoare-robot" },
  "cel-mai-bun-aspirator": { tema: "aspiratoare-fara-fir" },
  "cele-mai-bune-jucarii-educative": { tema: "jucarii-copii" },
  "jucarii-online-romania": { tema: "jucarii-copii" },
  "cele-mai-bune-ochelari-soare": { tema: "ochelari-soare" },
  "cel-mai-bun-troller": { tema: "trolere", minMagazine: 1 },
  "cel-mai-bun-carucior-bebelus": { tema: "carucioare" },
  "cel-mai-bun-scaun-auto-copil": { tema: "scaune-auto-copii", minMagazine: 1 },
  "cel-mai-bun-router-wifi": { tema: "routere" },
  "cel-mai-bun-tensiometru": { tema: "tensiometre", minMagazine: 1 },
  "cel-mai-bun-ser-fata": { tema: "seruri-fata" },
  "cel-mai-bun-dashcam": { tema: "camere-auto", minMagazine: 1 },
  "cele-mai-bune-vitamine-suplimente": { tema: "vitamine-minerale" },
  "cele-mai-bune-suplimente-imunitate": { tema: "vitamine-minerale" },
  "cea-mai-buna-saltea-ortopedica": { tema: "saltele" },
  "cea-mai-buna-hrana-pentru-caini": { tema: "hrana-caini" },
  "cea-mai-buna-crema-antirid": { tema: "creme-antirid" },
  "cel-mai-bun-fond-de-ten": { tema: "fond-de-ten" },
};

/** Tema unui articol dupa slug („cel-mai-bun-smartwatch-2026" -> smartwatch-uri), sau null. */
export function temaArticol(slug: string): TemaArticol | null {
  return ARTICOLE_TEME[slug.replace(/-\d{4}$/, "")] || null;
}

/**
 * Numele temei cum intra intr-o propozitie: plural, nearticulat, cu diacritice.
 * `titlu_scurt` din top-produse.json e eticheta de card („Casti Wireless", „Roboti
 * bucatarie") — pus in fraza dadea „Cat costa casti wireless" si „cel mai bun laptopuri".
 * „cafetiere" -> „aparate de cafea": in feed, tema e plina de espressoare.
 */
export const NUME_TEME: Record<string, string> = {
  laptopuri: "laptopuri",
  telefoane: "telefoane",
  "casti-wireless": "căști wireless",
  televizoare: "televizoare",
  "aspiratoare-robot": "aspiratoare robot",
  friteuze: "friteuze cu aer cald",
  "smartwatch-uri": "smartwatch-uri",
  monitoare: "monitoare",
  cafetiere: "aparate de cafea",
  "masini-de-spalat": "mașini de spălat",
  "roboti-de-bucatarie": "roboți de bucătărie",
  "purificatoare-aer": "purificatoare de aer",
  "scaune-gaming": "scaune de gaming",
  "biciclete-electrice": "biciclete electrice",
  "parfumuri-femei": "parfumuri de damă",
  "parfumuri-barbati": "parfumuri pentru bărbați",
  "pantofi-sport": "pantofi sport",
  "genti-dama": "genți de damă",
  "bijuterii-argint": "bijuterii din argint",
  "jucarii-copii": "jucării pentru copii",
  "suplimente-fitness": "suplimente pentru fitness",
  "scaune-birou": "scaune de birou",
  tablete: "tablete",
  "casti-gaming": "căști de gaming",
  imprimante: "imprimante",
  "camere-actiune": "camere de acțiune",
  "aer-conditionat": "aparate de aer condiționat",
  "aspiratoare-fara-fir": "aspiratoare fără fir",
  "boxe-bluetooth": "boxe Bluetooth",
  "trotinete-electrice": "trotinete electrice",
  "ochelari-soare": "ochelari de soare",
  carucioare: "cărucioare pentru copii",
  routere: "routere wireless",
  "seruri-fata": "seruri pentru față",
  trolere: "trolere",
  "scaune-auto-copii": "scaune auto pentru copii",
  "camere-auto": "camere auto",
  tensiometre: "tensiometre",
  "vitamine-minerale": "vitamine și minerale",
  saltele: "saltele",
  "hrana-caini": "hrană pentru câini",
  "creme-antirid": "creme antirid",
  "fond-de-ten": "fonduri de ten",
};

/** Numele in fraza; pentru o tema noua, fara intrare, eticheta cu prima litera mica. */
export function numeInFraza(slug: string, titluScurt: string): string {
  return NUME_TEME[slug] || titluScurt.charAt(0).toLowerCase() + titluScurt.slice(1);
}

/** Sub atatea produse, sau dintr-un singur magazin, sectiunea nu se publica. */
export const PRAG_PRODUSE = 6;
export const PRAG_MAGAZINE = 2;

/** Minuscule, fara diacritice (inclusiv ş/ţ cu sedila), spatii comprimate. */
export function normTitlu(s: string | undefined): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const ENTITATI: Record<string, string> = {
  "&quot;": '"', "&amp;": "&", "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " ",
};

/**
 * Titlul cum se afiseaza. Feed-urile vin cu: entitati HTML (`19&quot;`), sufixul
 * Shopify „ - Default Title", titlul repetat de doua ori (dacris.net: „Scaun birou
 * Buleco ... Scaun birou Buleco ...") si simboluri decorative la final („※").
 * NU se rescrie nimic altceva: titlul ramane al magazinului.
 */
export function titluAfisat(s: string | undefined): string {
  let t = (s || "").replace(/&(quot|amp|#39|apos|lt|gt|nbsp);/g, (m) => ENTITATI[m] ?? m);
  t = t.replace(/\s+/g, " ").trim();
  t = t.replace(/\s*-\s*Default Title\s*$/i, "");
  const cap = t.slice(0, 30);
  if (cap.length === 30) {
    const k = t.indexOf(cap, 20);
    if (k > 0) t = t.slice(0, k);
  }
  return t.replace(/[\s※*•·|,;-]+$/u, "").trim();
}

/**
 * Imaginea, pe https, sau null. 701 imagini din feed vin pe http (1cctv.ro, pcmadd.com —
 * verificat 05.10: ambele servesc aceleasi fisiere si pe https), iar unele campuri nici nu
 * sunt adrese („0" la gorgeaux.ro, un titlu de produs la bigiottos.com). Pe o pagina https,
 * o imagine http e continut mixt; una invalida e iconita de imagine rupta.
 */
export function imagineSigura(url: string | undefined): string | null {
  const u = (url || "").trim();
  if (!/^https?:\/\/[^/\s]+\.[a-z]{2,}(\/|$)/i.test(u)) return null;
  return u.replace(/^http:\/\//i, "https://");
}

/**
 * Cheia de „model": primele 6 cuvinte, fara varianta de dupa „ - " (culoare, marime).
 * „Espressor clasic, GAGGIA E24 - Rosu" si „... - INOX" sunt acelasi model.
 */
export function familie(s: string | undefined): string {
  const t = normTitlu(titluAfisat(s)).split(" - ")[0];
  return t.replace(/[^a-z0-9 ]+/g, " ").split(" ").filter(Boolean).slice(0, 6).join(" ");
}

/**
 * Produsele din feed care apartin temei: tip potrivit, produs nou, pret credibil,
 * magazin cu link platit si link care chiar face tracking. Sortate crescator dupa pret.
 */
export function produseTema(
  slug: string,
  produse: ProdusFeed[],
  eMagazinPlatit: (slug: string) => boolean,
  eLinkUrmarit: (url: string) => boolean,
): ProdusFeed[] {
  const r = REGULI_TEME[slug];
  if (!r) return [];
  return produse
    .filter((p) => {
      if (p.is_promo || typeof p.price !== "number" || p.price < r.pretMin) return false;
      if (!p.url || !eLinkUrmarit(p.url)) return false;
      if (!p.merchant_slug || !eMagazinPlatit(p.merchant_slug)) return false;
      const t = normTitlu(p.title);
      return r.include.test(t) && !r.exclude.test(t) && !EXCLUS_GLOBAL.test(t);
    })
    .sort((a, b) => (a.price as number) - (b.price as number));
}

export interface MagazinTema {
  slug: string;
  nr: number;
  min: number;
  max: number;
}

export interface GamaPret {
  eticheta: string;
  de_la: number;
  pana_la: number;
  /** cate modele distincte are gama (nu doar cate se afiseaza) */
  modele: number;
  produse: ProdusFeed[];
}

export interface SectiuneTema {
  /** produse potrivite (fiecare varianta e un produs separat in feed) */
  total: number;
  /** modele distincte, dupa familie() */
  modele: number;
  magazine: MagazinTema[];
  min: number;
  median: number;
  max: number;
  game: GamaPret[];
}

/** Alege k produse raspandite pe toata gama, cel mult `maxPeMagazin` de la acelasi magazin. */
function alege(gama: ProdusFeed[], k: number): ProdusFeed[] {
  const nrMag = new Set(gama.map((p) => p.merchant_slug)).size;
  const maxPeMagazin = Math.max(2, Math.ceil(k / Math.max(1, nrMag)));
  const pas = gama.length / k;
  const ordine: number[] = [];
  for (let i = 0; i < k; i++) ordine.push(Math.min(gama.length - 1, Math.floor(i * pas)));
  for (let i = 0; i < gama.length; i++) if (!ordine.includes(i)) ordine.push(i);
  const ales: ProdusFeed[] = [];
  const peMag = new Map<string, number>();
  for (const i of ordine) {
    if (ales.length >= k) break;
    const p = gama[i];
    const m = p.merchant_slug || "";
    if (ales.includes(p) || (peMag.get(m) || 0) >= maxPeMagazin) continue;
    ales.push(p);
    peMag.set(m, (peMag.get(m) || 0) + 1);
  }
  return ales.sort((a, b) => (a.price as number) - (b.price as number));
}

/**
 * Sectiunea gata de afisat, sau null sub prag. Gamele se taie pe TERTILE din modelele
 * distincte (nu pe praguri inventate de noi), iar eticheta fiecareia spune intervalul
 * ei real de pret.
 */
export function sectiuneTema(lista: ProdusFeed[], peGama = 4, minMagazine = PRAG_MAGAZINE): SectiuneTema | null {
  if (lista.length < PRAG_PRODUSE) return null;
  const peMag = new Map<string, MagazinTema>();
  for (const p of lista) {
    const s = p.merchant_slug as string;
    const pr = p.price as number;
    const m = peMag.get(s) || { slug: s, nr: 0, min: pr, max: pr };
    m.nr += 1;
    m.min = Math.min(m.min, pr);
    m.max = Math.max(m.max, pr);
    peMag.set(s, m);
  }
  if (peMag.size < minMagazine) return null;

  const preturi = lista.map((p) => p.price as number).sort((a, b) => a - b);
  const mij = Math.floor(preturi.length / 2);
  const median = preturi.length % 2 ? preturi[mij] : (preturi[mij - 1] + preturi[mij]) / 2;

  const vazute = new Set<string>();
  const unice: ProdusFeed[] = [];
  for (const p of lista) {
    const f = familie(p.title) + "|" + p.merchant_slug;
    if (vazute.has(f)) continue;
    vazute.add(f);
    unice.push(p);
  }

  const nrGame = unice.length >= 9 ? 3 : unice.length >= 4 ? 2 : 1;
  const etichete = nrGame === 3 ? ["Buget", "Mijlocul pieței", "Premium"] : nrGame === 2 ? ["Buget", "Premium"] : ["Toate"];
  const game: GamaPret[] = [];
  for (let g = 0; g < nrGame; g++) {
    const felie = unice.slice(Math.floor((g * unice.length) / nrGame), Math.floor(((g + 1) * unice.length) / nrGame));
    if (!felie.length) continue;
    game.push({
      eticheta: etichete[g],
      de_la: felie[0].price as number,
      pana_la: felie[felie.length - 1].price as number,
      modele: felie.length,
      produse: alege(felie, peGama),
    });
  }

  return {
    total: lista.length,
    modele: unice.length,
    magazine: [...peMag.values()].sort((a, b) => b.nr - a.nr || a.min - b.min),
    min: preturi[0],
    median,
    max: preturi[preturi.length - 1],
    game,
  };
}
