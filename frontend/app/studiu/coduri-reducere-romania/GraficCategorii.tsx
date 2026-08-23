/**
 * Graficul medianelor pe categorie — SVG randat pe SERVER, fara JS.
 *
 * ── De ce exista ──────────────────────────────────────────────────────────
 * Pagina asta e activul pentru linkuri editoriale. Ce face un studiu sa fie
 * REPUBLICAT nu e tabelul, ci imaginea pe care un jurnalist o poate pune in
 * articol — iar cand o pune, crediteaza si linkuieste. Tabelul de dedesubt
 * ramane pentru precizie; graficul e pentru a fi luat.
 *
 * ── De ce SVG pe server, si nu o librerie de charts ───────────────────────
 * 1. Pagina TREBUIE sa ramana Server Component — tot rostul ei e ca textul si
 *    cifrele sa fie in HTML, nu adaugate dupa hidratare. Un chart client-side
 *    ar scoate exact continutul citabil din HTML.
 * 2. Nicio dependinta noua pentru un grafic cu 9 bare.
 * 3. SVG-ul se poate salva/screenshota direct de catre cineva care il citeaza.
 *
 * ── Deciziile de design, si de ce (nu sunt de gust) ───────────────────────
 * - O SINGURA serie -> o singura culoare pentru toate barele. A colora fiecare
 *   bara mai inchis unde e mai mare ar dubla-codifica lungimea in nuanta si ar
 *   arde singurul canal liber pe informatie pe care graficul o arata deja.
 * - Categoriile sunt NOMINALE (Fashion, Beauty...), fara ordine naturala, deci
 *   nicio rampa ordinala. Sortarea descrescatoare e doar pentru citit.
 * - TEXTUL NU POARTA CULOAREA DATELOR. Barele sunt lime; procentele de langa
 *   ele sunt albe. Un numar colorat ca bara devine parte din marcaj si se
 *   citeste mai greu.
 * - Fara axa X. Fiecare bara e etichetata direct, deci o axa ar repeta aceeasi
 *   informatie si ar adauga zgomot. Alegere coerenta: ori axa, ori etichete.
 * - Bare de 20px (sub plafonul de 24), capat rotunjit 4px doar la varf, drept
 *   la linia de baza. Spatiu intre bare mult peste minimul de 2px.
 * - Fara hover/tooltip, deliberat: toate cele 9 valori sunt deja vizibile, iar
 *   tabelul complet e imediat dedesubt. Un tooltip n-ar dezvalui nimic in plus
 *   si ar cere transformarea paginii in Client Component.
 */

export interface CategorieGrafic {
  slug: string;
  nume: string;
  reducere_mediana: number | null;
  cu_promotie: number;
}

// Paleta site-ului (CLAUDE.md — dark/lime).
const LIME = "#ddf93c";
const TEXT = "#ffffff";
const TEXT_SEC = "#c9ced5";

const LATIME = 640;
const GUTTER = 176;      // coloana cu numele categoriei
const MARJA_VAL = 54;    // loc pentru eticheta de procent, la dreapta barei
const PAS = 38;          // inaltimea unui rand (bara 20 + 18 aer)
const GROSIME = 20;

export default function GraficCategorii({ categorii }: { categorii: CategorieGrafic[] }) {
  const date = categorii
    .filter((c): c is CategorieGrafic & { reducere_mediana: number } => c.reducere_mediana !== null)
    .sort((a, b) => b.reducere_mediana - a.reducere_mediana);

  if (date.length < 2) return null;

  const maxVal = Math.max(...date.map((c) => c.reducere_mediana));
  // Rotunjim in sus la multiplu de 10, ca bara cea mai lunga sa nu atinga marginea.
  const scaraMax = Math.ceil(maxVal / 10) * 10;
  const latimeBara = LATIME - GUTTER - MARJA_VAL;
  const inaltime = date.length * PAS + 16;

  const rezumat = date
    .map((c) => `${c.nume} ${String(c.reducere_mediana).replace(".", ",")}%`)
    .join(", ");

  return (
    <figure className="my-6">
      <svg
        viewBox={`0 0 ${LATIME} ${inaltime}`}
        width="100%"
        height="auto"
        role="img"
        aria-label={`Reducerea mediana pe categorie: ${rezumat}.`}
        style={{ display: "block" }}
      >
        {date.map((c, i) => {
          const y = i * PAS + 8;
          const w = Math.max(2, (c.reducere_mediana / scaraMax) * latimeBara);
          const val = String(c.reducere_mediana).replace(".", ",");
          return (
            <g key={c.slug}>
              <text
                x={GUTTER - 12}
                y={y + GROSIME / 2 + 4}
                textAnchor="end"
                fontSize="12.5"
                fill={TEXT_SEC}
              >
                {c.nume}
              </text>

              {/* Capat rotunjit doar la varful barei; drept la linia de baza.
                  `rx` pe <rect> ar rotunji ambele capete, deci folosim o cale. */}
              <path
                d={`M ${GUTTER} ${y}
                    H ${GUTTER + w - 4}
                    a 4 4 0 0 1 4 4
                    V ${y + GROSIME - 4}
                    a 4 4 0 0 1 -4 4
                    H ${GUTTER}
                    Z`}
                fill={LIME}
              />

              <text
                x={GUTTER + w + 10}
                y={y + GROSIME / 2 + 4}
                fontSize="13"
                fontWeight="700"
                fill={TEXT}
              >
                {val}%
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="text-xs text-[#9399a0] leading-relaxed mt-3">
        Reducerea mediana declarata, pe categorie, din {date.length} categorii care trec pragul
        de esantion. Restul sunt listate mai jos ca date insuficiente &mdash; le aratam ca sa se
        vada ce NU stim, nu doar ce stim.
      </figcaption>
    </figure>
  );
}
