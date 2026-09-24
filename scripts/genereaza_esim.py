"""
Comparatorul eSIM pe destinatii: data/esim-preturi.csv -> frontend/public/esim-destinatii.json.

DE CE (cercetarea din 15.09.2026, locul 3, produse-digitale/CERCETARE-OPORTUNITATI-2026-09-15.md):
  · singura cerere comerciala dovedita in Romania: furnizorii de eSIM platesc advertoriale in 2026
    (Mediafax, 08.09.2026), fiecare cu UN brand si fara tabel intre furnizori;
  · 13 programe eSIM cu link platit prin Impact (Airalo, Saily, Maya, Amigo, Orbit, ChillSim...),
    comisioane de 10-20%, deja active.

REGULILE, toate din aceeasi cercetare:
  · preturile se aduna DE MANA din paginile publice ale furnizorilor, cu sursa si data pe fiecare rand.
    Fara scraping. Un pret mai vechi de VALABIL_ZILE nu se afiseaza: pretul de acum doua luni e un pret
    fals, iar pagina asta traieste din increderea ca cifra e adevarata azi;
  · nu scriem „cel mai ieftin" si nu afisam comisioanele;
  · Turcia doar cu avertismentul BTK (decizia din 10.07.2025, 8 furnizori blocati; starea in 2026 e
    necunoscuta);
  · o destinatie se INDEXEAZA doar cu `publicat` = da in DESTINATII si cu minim MIN_FURNIZORI furnizori
    cu pret proaspat. `publicat` il pune Alex, dupa ce citeste in Impact termenii programelor (marca,
    SEO, comparatii de pret) — pana atunci pagina exista, dar `noindex`.

Rulare (din scripts/):
  python genereaza_esim.py            # scrie JSON-ul; randurile respinse doar se afiseaza (pipeline)
  python genereaza_esim.py --strict   # iese cu 1 daca vreun rand e respins (dupa ce editezi CSV-ul)
  python genereaza_esim.py --test     # verificarile care trebuie sa poata pica

In pipeline ruleaza zilnic: un pret care trece de VALABIL_ZILE dispare singur de pe pagina, iar
destinatia care coboara sub MIN_FURNIZORI redevine `noindex`. Nu se asteapta pe nimeni.
"""
import csv
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

RADACINA = Path(__file__).resolve().parent.parent
CSV_PRETURI = RADACINA / "data" / "esim-preturi.csv"
OUTPUT = RADACINA / "frontend" / "public" / "output.json"
IESIRE = RADACINA / "frontend" / "public" / "esim-destinatii.json"

VALABIL_ZILE = 45
MIN_FURNIZORI = 4
COLOANE = ["destinatie", "furnizor", "plan", "gb", "zile", "pret", "moneda", "sursa", "verificat"]
MONEDE = {"EUR", "USD", "RON", "GBP"}

# Destinatiile, alese dupa advertorialele din 2026 (Egipt, EAU, Maroc, SUA, Turcia).
# `publicat` ramane False pana confirma Alex termenii programelor.
DESTINATII = {
    "egipt": {"nume": "Egipt", "publicat": False},
    "emiratele-arabe-unite": {"nume": "Emiratele Arabe Unite", "publicat": False},
    "maroc": {"nume": "Maroc", "publicat": False},
    "sua": {"nume": "SUA", "publicat": False},
    "turcia": {"nume": "Turcia", "publicat": False,
               "avertisment": ("Pe 10 iulie 2025, autoritatea turcă BTK a blocat opt furnizori de eSIM: Airalo, Saily, "
                               "Holafly, Nomad, Instabridge, Mobimatter, Alosim și BNESIM (decizia E-98966759-450.08-36681). "
                               "N-am găsit o sursă independentă despre situația din 2026. Verifică la furnizor înainte "
                               "să cumperi.")},
}

RE_DATA = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def citeste_randuri(cale: Path, azi: str):
    """Randurile valide si motivele pentru care celelalte au fost respinse (Regula 6: la granita)."""
    if not cale.exists():
        return [], []
    bune, respinse = [], []
    with cale.open(encoding="utf-8-sig", newline="") as f:
        cititor = csv.DictReader(f)
        lipsa = [c for c in COLOANE if c not in (cititor.fieldnames or [])]
        if lipsa:
            return [], [f"antet: lipsesc coloanele {lipsa}"]
        for nr, r in enumerate(cititor, start=2):
            r = {k: (v or "").strip() for k, v in r.items() if k}
            if not any(r.values()):
                continue
            motiv = None
            try:
                pret = float(r["pret"].replace(",", "."))
                zile = int(r["zile"])
                gb = None if r["gb"].lower() in ("nelimitat", "unlimited") else float(r["gb"].replace(",", "."))
            except ValueError:
                pret, zile, gb = None, None, None
                motiv = "pret, zile sau gb nu sunt numere"
            if motiv is None:
                if r["destinatie"] not in DESTINATII:
                    motiv = f"destinatie necunoscuta „{r['destinatie']}”"
                elif not (0 < pret < 1000) or not (0 < zile <= 365) or (gb is not None and not (0 < gb <= 1000)):
                    motiv = "valoare in afara intervalului"
                elif r["moneda"].upper() not in MONEDE:
                    motiv = f"moneda necunoscuta „{r['moneda']}”"
                elif not r["sursa"].startswith("https://"):
                    motiv = "fara sursa https"
                elif not RE_DATA.match(r["verificat"]) or r["verificat"] > azi:
                    motiv = "data verificarii lipsa, gresita sau in viitor"
                elif (date.fromisoformat(azi) - date.fromisoformat(r["verificat"])).days > VALABIL_ZILE:
                    motiv = f"pret mai vechi de {VALABIL_ZILE} de zile — reverifica-l"
                elif not r["plan"] or not r["furnizor"]:
                    motiv = "plan sau furnizor gol"
            if motiv:
                respinse.append(f"randul {nr} ({r.get('furnizor') or '?'}, {r.get('destinatie') or '?'}): {motiv}")
                continue
            bune.append({"destinatie": r["destinatie"], "furnizor": r["furnizor"].lower(), "plan": r["plan"],
                         "gb": gb, "zile": zile, "pret": round(pret, 2), "moneda": r["moneda"].upper(),
                         "sursa": r["sursa"], "verificat": r["verificat"]})
    return bune, respinse


def construieste(randuri: list, magazine: list) -> dict:
    """Pe destinatie: furnizorii cu planurile lor. Doar furnizorii care exista in output.json cu
    link — butonul duce acolo; un furnizor fara magazin nu are unde duce si nu intra."""
    dupa_slug = {(m.get("magazin") or "").lower(): m for m in magazine}
    rez = {}
    for slug, meta in DESTINATII.items():
        furnizori = {}
        for r in (x for x in randuri if x["destinatie"] == slug):
            if r["furnizor"] not in dupa_slug:
                continue
            f = furnizori.setdefault(r["furnizor"], {"furnizor": r["furnizor"], "planuri": []})
            f["planuri"].append({k: r[k] for k in ("plan", "gb", "zile", "pret", "moneda", "sursa", "verificat")})
        for f in furnizori.values():
            f["planuri"].sort(key=lambda p: (p["zile"], p["gb"] is None, p["gb"] or 0, p["pret"]))
        if not furnizori:
            continue
        lista = sorted(furnizori.values(), key=lambda f: f["furnizor"])   # alfabetic: nu clasam
        rez[slug] = {
            "nume": meta["nume"],
            "avertisment": meta.get("avertisment", ""),
            "indexabil": bool(meta["publicat"]) and len(lista) >= MIN_FURNIZORI,
            "furnizori": lista,
        }
    return rez


def main() -> int:
    azi = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    randuri, respinse = citeste_randuri(CSV_PRETURI, azi)
    magazine = json.loads(OUTPUT.read_text(encoding="utf-8"))
    destinatii = construieste(randuri, magazine)
    IESIRE.write_text(json.dumps({"generat": azi, "valabil_zile": VALABIL_ZILE, "destinatii": destinatii},
                                 ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"esim-destinatii.json: {len(destinatii)} destinatii, {len(randuri)} preturi valide, "
          f"{sum(1 for d in destinatii.values() if d['indexabil'])} indexabile")
    for r in respinse:
        print(f"  RESPINS {r}")
    return 1 if respinse and "--strict" in sys.argv else 0


def test() -> None:
    import tempfile
    azi = "2026-10-01"
    antet = ",".join(COLOANE)
    randuri = [
        "egipt,airalo.com,Nelimitat 7 zile,nelimitat,7,29.00,EUR,https://www.airalo.com/egypt-esim,2026-09-30",
        "egipt,saily.com,5 GB 30 zile,5,30,\"12,99\",USD,https://saily.com/esim-egypt/,2026-09-20",
        "egipt,airalo.com,vechi,3,7,9,EUR,https://www.airalo.com/egypt-esim,2026-07-01",     # prea vechi
        "egipt,airalo.com,fara sursa,3,7,9,EUR,,2026-09-30",                                  # fara sursa
        "egipt,airalo.com,viitor,3,7,9,EUR,https://x.ro,2026-12-01",                          # data in viitor
        "atlantida,airalo.com,x,3,7,9,EUR,https://x.ro,2026-09-30",                           # destinatie
        "egipt,airalo.com,zero,3,7,0,EUR,https://x.ro,2026-09-30",                            # pret 0
        "egipt,necunoscut.com,x,3,7,9,EUR,https://x.ro,2026-09-30",                           # fara magazin
    ]
    with tempfile.TemporaryDirectory() as d:
        cale = Path(d) / "p.csv"
        cale.write_text(antet + "\n" + "\n".join(randuri) + "\n", encoding="utf-8")
        bune, respinse = citeste_randuri(cale, azi)
    assert len(bune) == 3 and len(respinse) == 5, (bune, respinse)
    assert bune[1]["pret"] == 12.99 and bune[0]["gb"] is None, bune
    magazine = [{"magazin": "airalo.com"}, {"magazin": "saily.com"}]
    rez = construieste(bune, magazine)
    furn = [f["furnizor"] for f in rez["egipt"]["furnizori"]]
    assert furn == ["airalo.com", "saily.com"], f"furnizorul fara magazin a intrat sau ordinea nu e alfabetica: {furn}"
    assert rez["egipt"]["indexabil"] is False, "o destinatie nepublicata sau cu 2 furnizori a iesit indexabila"
    DESTINATII["egipt"]["publicat"] = True
    try:
        assert construieste(bune, magazine)["egipt"]["indexabil"] is False, "indexabila sub MIN_FURNIZORI"
    finally:
        DESTINATII["egipt"]["publicat"] = False
    print("test: toate verificarile au trecut")


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if "--test" in sys.argv:
        test()
        sys.exit(0)
    sys.exit(main())
