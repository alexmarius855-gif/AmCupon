"""
Test pentru paginarea din fetch_2p_api.py (24.09.2026).

Ruleaza:  python scripts/test_paginare_2p.py      (iese cu 1 la prima asteptare incalcata)

Forma raspunsurilor e cea REALA, din logul rularii 35988210154:
  · promotii: dict cu cheile ['facets', 'pagination', 'advertiser_promotions', 'shopping_events'],
    paginarea direct in `pagination`, 20 de elemente pe pagina orice `per_page` ai cere;
  · programe si feed-uri: paginarea in `metadata.pagination`.
Varianta veche citea doar `metadata.pagination`, deci la promotii se oprea dupa pagina 1
(20 din toate). Cazul 1 e exact bug-ul acela: pe codul vechi da 20, nu 45.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_2p_api as f2p  # noqa: E402

esecuri = 0


def verifica(nume, primit, asteptat):
    global esecuri
    if primit == asteptat:
        print(f"  ok    {nume}")
    else:
        esecuri += 1
        print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")


def api_fals(pagini):
    """api_get care serveste pagini dinainte construite; pagina peste ultima = raspuns gol."""
    cereri = []

    def api_get(endpoint, params=None):
        p = (params or {}).get("page", 1)
        cereri.append(p)
        return pagini[p - 1] if p <= len(pagini) else pagini[-1].__class__()
    return api_get, cereri


def elemente(n, prefix):
    return [{"id": f"{prefix}{i}"} for i in range(n)]


f2p.time.sleep = lambda s: None   # testul nu asteapta intre pagini

# 1. Promotiile: paginarea la nivelul de sus. Bug-ul din 24.09 — trebuie 45, nu 20.
pagini = [{"facets": {}, "pagination": {"pages": 3, "results": 45},
           "advertiser_promotions": elemente(n, f"p{k}"), "shopping_events": []}
          for k, n in enumerate((20, 20, 5))]
f2p.api_get, cereri = api_fals(pagini)
verifica("promotii: paginarea din `pagination` (bug-ul din 24.09)",
         len(f2p.fetch_all_pages("affiliate/advertiser_promotions", per_page=100)), 45)
verifica("promotii: exact 3 cereri, nu una in plus", cereri, [1, 2, 3])

# 2. Fara niciun numar de pagini: reperul e prima pagina (20), nu per_page (100).
pagini = [{"advertiser_promotions": elemente(n, f"q{k}")} for k, n in enumerate((20, 20, 7))]
f2p.api_get, _ = api_fals(pagini)
verifica("fara paginare in raspuns: continua cat vin pagini pline",
         len(f2p.fetch_all_pages("affiliate/advertiser_promotions", per_page=100)), 47)

# 3. Total multiplu de 20, fara paginare: pagina urmatoare vine goala si bucla se opreste.
pagini = [{"advertiser_promotions": elemente(20, f"r{k}")} for k in range(2)]
f2p.api_get, cereri = api_fals(pagini)
verifica("fara paginare, total multiplu de 20", len(f2p.fetch_all_pages("affiliate/advertiser_promotions")), 40)
verifica("... se opreste la prima pagina goala", cereri, [1, 2, 3])

# 4. Programe: paginarea in `metadata.pagination` merge ca inainte.
pagini = [{"programs": elemente(20, f"s{k}"), "metadata": {"pagination": {"pages": 2}}} for k in range(2)]
f2p.api_get, _ = api_fals(pagini)
verifica("programe: `metadata.pagination` merge ca inainte", len(f2p.fetch_all_pages("affiliate/programs")), 40)

# 5. O alta lista inaintea celei cautate nu trebuie luata drept promotii.
pagini = [{"shopping_events": elemente(3, "ev"), "pagination": {"pages": 1},
           "advertiser_promotions": elemente(5, "t")}]
f2p.api_get, _ = api_fals(pagini)
rez = f2p.fetch_all_pages("affiliate/advertiser_promotions")
verifica("cheia cu numele endpoint-ului castiga, nu prima lista din dict",
         [x["id"] for x in rez], [f"t{i}" for i in range(5)])

print()
if esecuri:
    print(f"{esecuri} verificari picate.")
    sys.exit(1)
print("Toate verificarile au trecut.")
