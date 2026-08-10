"""
fix_top_onestitate.py — curata semnalele FALSE din top-produse.json (paginile /top/[slug]).

── Ce s-a gasit (verificat live pe productie, 10.08.2026) ─────────────────────
1. **142 din 142 de produse aveau `imagine: https://picsum.photos/...`** — adica un
   generator de poze STOCK ALEATOARE. Pe /top/laptopuri erau 10 astfel de imagini
   live, prezentate ca fiind pozele produselor. Nu e o poza gresita — e o poza cu
   totul aleatoare, fara legatura cu produsul.
2. **14 din 30 de descrieri pretindeau testare reala**: "Am analizat 20+ modele",
   "testate in bucatarie", "testate si comparate". Nu exista nicio dovada de testare
   in cod, in date sau in repo — produsele n-au fost niciodata in mana nimanui.

Ambele incalca regula de onestitate deja stabilita in acest proiect (auditul din
03.07.2026 a scos exact acelasi tip de date fabricate: `procent_succes` random afisat
ca "rata de succes", comisionul afisat ca "cashback"). In plus, politica de spam
Google numeste explicit "thin affiliation" continutul afiliat fara valoare adaugata
reala, iar recenziile fabricate sunt cel mai clar exemplu.

── Ce face scriptul ───────────────────────────────────────────────────────────
- Sterge URL-urile picsum (`imagine` -> ""). Componenta afiseaza un placeholder
  neutru, care NU pretinde ca e poza produsului (vezi TopProduseClient.tsx).
- Rescrie pretentiile de testare in formularea REALA: selectie editoriala pe baza
  specificatiilor si preturilor publice.

Ce NU face (deliberat): nu sterge scorurile. Produsele si specificatiile sunt reale,
iar scorurile raman ca evaluare EDITORIALA — dar pagina spune acum clar ca sunt
editoriale, nu rezultate de laborator (vezi nota de metodologie din page.tsx).

Rulare:
  python fix_top_onestitate.py            # aplica
  python fix_top_onestitate.py --dry-run  # doar raport
"""

import argparse
import json
import os
import re
import sys

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

TOP_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        "..", "frontend", "public", "top-produse.json")

# Propozitii intregi care pretind un proces fizic care nu a avut loc — eliminate
# complet (nu se pot reformula onest: "testate in bucatarie" nu are echivalent real).
FRAZE_FALSE = [
    re.compile(r"Am analizat\s*\d+\+?\s*modele\.\s*", re.I),
    re.compile(r"\bTestate?\s+in\s+[^.]*\.\s*", re.I),
]

# Cuvinte care implica testare proprie -> formularea reala (comparatie pe date publice).
INLOCUIRI = [
    (re.compile(r"\btestate si comparate\b", re.I), "comparate pe specificatii si pret"),
    (re.compile(r"\btestate\b", re.I),              "comparate"),
    (re.compile(r"\btestati\b", re.I),              "comparati"),
    (re.compile(r"\btestat\b", re.I),               "comparat"),
    (re.compile(r"\bam analizat\b", re.I),          "am comparat"),
]


def _recapitalizeaza(text: str) -> str:
    """Prima litera dupa `.`/`!`/`?` (si la inceput) devine majuscula.

    Necesar pentru ca stergerea unei propozitii din mijloc lasa altfel constructii
    de tipul "...laser. comparate in conditii reale" (minuscula dupa punct).
    """
    def up(m: re.Match) -> str:
        return m.group(1) + m.group(2).upper()
    text = re.sub(r"(^|[.!?]\s+)([a-zăâîșț])", up, text)
    return text


def curata_descriere(text: str) -> str:
    if not text:
        return text
    nou = text
    for pat in FRAZE_FALSE:
        # Inlocuim cu ". " (nu cu ""): fraza stearsa era adesea finalul propozitiei,
        # iar textul dinaintea ei ramane fara punct — "…(air fryer) De la modele…".
        nou = pat.sub(". ", nou)
    for pat, repl in INLOCUIRI:
        nou = pat.sub(repl, nou)
    # Normalizare punctuatie dupa taieturi: ". ." / ".." / " ." -> "."
    nou = re.sub(r"\s*\.\s*(\.\s*)+", ". ", nou)
    nou = re.sub(r"\s+\.", ".", nou)
    nou = re.sub(r"\s{2,}", " ", nou).strip()
    nou = re.sub(r"^\.\s*", "", nou)   # nu incepe cu punct
    return _recapitalizeaza(nou)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    with open(TOP_JSON, encoding="utf-8") as f:
        data = json.load(f)

    imagini_sterse = 0
    descrieri_curatate = 0
    verdicte_curatate = 0

    for cat in data.get("categorii", []):
        veche = cat.get("descriere", "")
        noua = curata_descriere(veche)
        if noua != veche:
            descrieri_curatate += 1
            if args.dry_run:
                print(f"  [{cat['slug']}]")
                print(f"     INAINTE: {veche[:100]}")
                print(f"     DUPA:    {noua[:100]}")
            else:
                cat["descriere"] = noua

        for p in cat.get("produse", []):
            img = p.get("imagine") or ""
            if "picsum.photos" in img:
                imagini_sterse += 1
                if not args.dry_run:
                    p["imagine"] = ""
            for camp in ("verdict_scurt", "verdict_detaliat"):
                v = p.get(camp, "")
                nv = curata_descriere(v)
                if nv != v:
                    verdicte_curatate += 1
                    if not args.dry_run:
                        p[camp] = nv

    if not args.dry_run:
        with open(TOP_JSON, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    prefix = "[DRY-RUN] " if args.dry_run else ""
    print(f"\n{prefix}Imagini placeholder (picsum) eliminate: {imagini_sterse}")
    print(f"{prefix}Descrieri de categorie corectate:        {descrieri_curatate}")
    print(f"{prefix}Verdicte de produs corectate:            {verdicte_curatate}")
    if not args.dry_run:
        print(f"\nScris in {TOP_JSON}")


if __name__ == "__main__":
    main()
