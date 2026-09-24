"""
Test pentru seria lunara din generate_studiu_cupoane.py (24.09.2026).

Ruleaza:  python scripts/test_studiu_lunar.py      (iese cu 1 la prima asteptare incalcata)

Pagina de studiu e facuta ca sa fie citata. O luna cu goluri publicata ca si cum ar fi completa
ar ajunge intr-un articol drept „scaderea promotiilor", cand de fapt n-a raspuns o retea
(masurat: pe 06.08 si 19.08 numarul a cazut la jumatate peste noapte). De-aia cazul 2 e aici.
"""
import os
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import generate_studiu_cupoane as g  # noqa: E402

esecuri = 0


def verifica(nume, primit, asteptat):
    global esecuri
    if primit == asteptat:
        print(f"  ok    {nume}")
    else:
        esecuri += 1
        print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")


def zile(de_la, pana_la, valoare, exceptii=None):
    z, rez = date.fromisoformat(de_la), {}
    while z.isoformat() <= pana_la:
        rez[z.isoformat()] = {"promotii": (exceptii or {}).get(z.isoformat(), valoare), "magazine": 10}
        z += timedelta(days=1)
    return rez


def e(prima, cod=False):
    return {"titlu": "x y", "cod": cod, "prima": prima, "expira": "", "activa": False}


magazine = [{"magazin": "a.ro", "url": "https://a.ro", "categorie_slug": "fashion"},
            {"magazin": "b.ro", "url": "https://b.ro", "categorie_slug": "beauty"},
            {"magazin": "c.com", "url": "https://c.com", "categorie_slug": "fashion"}]

# 1. Octombrie complet: 4 promotii noi (2 la a.ro, una cu cod), plus una din septembrie care NU intra.
ist = {"zile": zile("2026-10-01", "2026-10-31", 100),
       "magazine": {"a.ro": [e("2026-10-03", cod=True), e("2026-10-20")],
                    "b.ro": [e("2026-10-05"), e("2026-09-28")],
                    "c.com": [e("2026-10-30")]}}
luni = g.serie_lunara(ist, magazine, "2026-11-01")
verifica("o singura luna completa, octombrie", [l["luna"] for l in luni], ["2026-10"])
o = luni[0]
verifica("promotiile noi sunt doar cele vazute prima data in octombrie", o["promotii_noi"], 4)
verifica("cu cod", o["cu_cod"], 1)
verifica("din magazine .ro", o["din_magazine_ro"], 3)
verifica("topul .ro, in ordine", [(x["slug"], x["promotii"]) for x in o["top_ro"]], [("a.ro", 2), ("b.ro", 1)])
verifica("categorii", [(c["slug"], c["promotii"]) for c in o["categorii"]], [("fashion", 3), ("beauty", 1)])

# 2. Octombrie cu goluri: 5 zile lipsa + 2 zile la sub jumatate din mediana = 24/31 < 90%.
ist2 = {"zile": {k: v for k, v in zile("2026-10-01", "2026-10-31", 100,
                                        {"2026-10-06": 40, "2026-10-19": 30}).items()
                 if not k.endswith(("-10", "-11", "-12", "-13", "-14"))},
        "magazine": ist["magazine"]}
o2 = g.serie_lunara(ist2, magazine, "2026-11-01")[0]
verifica("luna cu goluri e marcata incompleta", o2["incomplet"], True)
verifica("... si nu publica nicio cifra de promotii", "promotii_noi" in o2, False)
verifica("... iar zilele anormale nu se numara ca bune", o2["zile_bune"], 24)

# 3. Luna curenta nu apare: pe 24.10, octombrie nu e inca terminat.
verifica("luna curenta nu se publica", g.serie_lunara(ist, magazine, "2026-10-24"), [])

print()
if esecuri:
    print(f"{esecuri} verificari picate.")
    sys.exit(1)
print("Toate verificarile au trecut.")
