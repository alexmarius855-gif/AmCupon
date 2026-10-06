"""
Teste pentru descarcarea feed-urilor 2Performant (06.10.2026).

Ruleaza:  python scripts/test_feeduri_2p.py      (iese cu 1 la prima asteptare incalcata)

Ce apara, si de ce — fiecare caz e o problema masurata in logul rularii 37386079043:
  · lista de feed-uri se oprea la 180 din ~600 (`MAX_FEEDS * 3`), deci springfarma, scule365
    si pfarma nu intrau niciodata in rotatie;
  · 1200 de produse descarcate pe magazin, din care raman ~130 in products.json — 61 de cereri
    arse pentru un singur magazin, din aceeasi limita 429 care hotaraste cate magazine intra;
  · pauzele de 5+10+20 s la 429 nu ridicau limita niciodata;
  · parametrul de marime a paginii se numeste `perpage` (clientul oficial 2Parale), nu `per_page`;
  · un feed descarcat cu 0 produse nu apare in products.json si ar reveni primul la fiecare rulare.
Fara retea: api_get si sesiunea HTTP sunt inlocuite cu raspunsuri construite aici.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_2p_api as f2p          # noqa: E402
import fetch_banners as fb          # noqa: E402
import fetch_product_feeds as fpf   # noqa: E402

# Sectiunile 1-2 inlocuiesc fpf.api_get cu un fals; sectiunea 4 testeaza functia ADEVARATA.
API_GET_REAL = fpf.api_get

esecuri = 0


def verifica(nume, primit, asteptat):
    global esecuri
    if primit == asteptat:
        print(f"  ok    {nume}")
    else:
        esecuri += 1
        print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")


# Fara pauze reale in teste; pauzele cerute se inregistreaza, ca sa le putem verifica.
# `time` e ACELASI modul in toate cele trei scripturi — o singura inlocuire le acopera pe toate
# (trei atribuiri separate se suprascriu una pe alta si ultima castiga).
pauze_cerute = []
fpf.time.sleep = lambda s: pauze_cerute.append(s)


def api_fals(pagini, cheie="product_feeds"):
    """api_get care serveste pagini dinainte construite si tine minte parametrii fiecarei cereri.
    O pagina `None` simuleaza o eroare (ex. 429 dupa toate reincercarile)."""
    cereri = []

    def api_get(endpoint, params=None):
        params = dict(params or {})
        cereri.append(params)
        p = params.get("page", 1)
        if p > len(pagini):
            return {cheie: []}
        return pagini[p - 1]
    return api_get, cereri


def pagina(n, cheie="product_feeds", total_pagini=None, start=0):
    d = {cheie: [{"id": start + i, "name": f"magazin{start + i}.ro", "products_count": 5} for i in range(n)]}
    if total_pagini is not None:
        d["metadata"] = {"pagination": {"pages": total_pagini}}
    return d


print("\n1. Lista de feed-uri: toate paginile, cu `perpage`")
pag = [pagina(20, total_pagini=30, start=i * 20) for i in range(30)]
fpf.api_get, cereri = api_fals(pag)
feeds = fpf.get_product_feeds()
verifica("toate cele 600 de feed-uri, nu primele 180", len(feeds), 600)
verifica("lista e marcata completa (altfel memoria nu scoate feed-urile disparute)",
         fpf.LISTA_FEEDURI_COMPLETA, True)
verifica("parametrul trimis e `perpage`, cu PE_PAGINA", cereri[0].get("perpage"), fpf.PE_PAGINA)
verifica("`per_page` (numele gresit) nu se mai trimite", "per_page" in cereri[0], False)

pag = [pagina(40), pagina(40, start=40), pagina(13, start=80)]
fpf.api_get, cereri = api_fals(pag)
feeds = fpf.get_product_feeds()
verifica("fara metadata, pagini de 40: se opreste la prima pagina incompleta", len(feeds), 93)
verifica("... dupa exact 3 cereri", [c["page"] for c in cereri], [1, 2, 3])
verifica("... si lista e completa", fpf.LISTA_FEEDURI_COMPLETA, True)

pag = [pagina(20, total_pagini=30), pagina(20, total_pagini=30, start=20), None]
fpf.api_get, cereri = api_fals(pag)
feeds = fpf.get_product_feeds()
verifica("eroare la pagina 3: intoarce ce avea", len(feeds), 40)
verifica("... dar lista NU e marcata completa", fpf.LISTA_FEEDURI_COMPLETA, False)


print("\n2. Produsele unui feed: cel mult MAX_PRODUSE_PER_FEED, nu 1200")
def pagina_produse(n, total_pagini=100):
    return {"products": [{"title": f"Produs {i}", "url": f"https://magazin.ro/p{i}", "price": "10",
                          "image_url": f"https://magazin.ro/i{i}.jpg"} for i in range(n)],
            "metadata": {"pagination": {"pages": total_pagini}}}

fpf.api_get, cereri = api_fals([pagina_produse(40) for _ in range(100)], cheie="products")
fpf.INCOMPLETE.clear()
prod = fpf.get_products_from_api(123, "magazin.ro")
verifica("200 de produse dintr-un feed de 4.000", len(prod), fpf.MAX_PRODUSE_PER_FEED)
verifica("MAX_PRODUSE_PER_FEED e 200 (1200 ardea 61 de cereri pe magazin)", fpf.MAX_PRODUSE_PER_FEED, 200)
verifica("... in 5 cereri de cate 40", len(cereri), 5)
verifica("... cu `perpage`", cereri[0].get("perpage"), fpf.PE_PAGINA)
verifica("oprit de plafon, nu de o eroare: magazinul NU e incomplet", "magazin.ro" in fpf.INCOMPLETE, False)

fpf.api_get, cereri = api_fals([pagina_produse(20, 3), None], cheie="products")
fpf.INCOMPLETE.clear()
prod = fpf.get_products_from_api(124, "Magazin2.ro ")
verifica("eroare la pagina 2 din 3: magazinul e incomplet (memoria ii tine produsele vechi)",
         "magazin2.ro" in fpf.INCOMPLETE, True)


print("\n3. Pauzele la 429")
P = fpf.PAUZE_429
verifica("prima pauza", fpf.pauza_429(0, None, 0), P[0])
verifica("a treia pauza", fpf.pauza_429(2, None, 0), P[2])
verifica("dupa ultima pauza: renuntam", fpf.pauza_429(len(P), None, 0), None)
verifica("pauzele urca pana la cel putin ~5 minute in total (5+10+20 s nu ridicau limita)",
         sum(P) >= 270, True)
verifica("Retry-After valid castiga", fpf.pauza_429(0, "45", 0), 45)
verifica("Retry-After urias e plafonat la cea mai lunga pauza", fpf.pauza_429(0, "9999", 0), max(P))
verifica("Retry-After negativ e ignorat", fpf.pauza_429(1, "-5", 0), P[1])
verifica("Retry-After nenumeric e ignorat", fpf.pauza_429(1, "abc", 0), P[1])
verifica("bugetul ramas taie pauza", fpf.pauza_429(0, None, 890, buget=900), 10)
verifica("buget terminat: nu mai asteptam deloc", fpf.pauza_429(0, None, 900, buget=900), None)


class Raspuns:
    def __init__(self, cod, corp=None, antete=None):
        self.status_code = cod
        self._corp = corp if corp is not None else {}
        self.headers = antete or {}
        self.text = str(self._corp)

    def json(self):
        return self._corp


def sesiune_falsa(raspunsuri):
    def get(url, headers=None, timeout=None):
        return raspunsuri.pop(0)
    return get


print("\n4. api_get: asteapta la 429, apoi reuseste; cu bugetul terminat, renunta imediat")
fpf._STARE_429.update({"cereri_ok": 0, "asteptat": 0.0, "in_limita": False, "logata": False, "epuizat": False})
pauze_cerute.clear()
fpf._session.get = sesiune_falsa([Raspuns(429), Raspuns(429), Raspuns(200, {"ok": 1})])
verifica("raspunsul vine dupa doua 429", API_GET_REAL("affiliate/product_feeds", {"page": 1}), {"ok": 1})
verifica("... cu pauzele din PAUZE_429", pauze_cerute, [P[0], P[1]])
verifica("... adunate in bugetul rularii", fpf._STARE_429["asteptat"], float(P[0] + P[1]))

fpf._STARE_429["asteptat"] = float(fpf.ASTEPTARE_MAXIMA_429)
pauze_cerute.clear()
fpf._session.get = sesiune_falsa([Raspuns(429), Raspuns(200, {"nu": "trebuia"})])
verifica("buget terminat: None la primul 429", API_GET_REAL("affiliate/product_feeds", {"page": 2}), None)
verifica("... fara nicio pauza", pauze_cerute, [])


print("\n5. Rotatia: marii vanzatori primii, iar un feed gol nu revine primul la fiecare rulare")
for mag, asteptat in [("springfarma.com", True), ("www.springfarma.com", True), ("libris.ro", True),
                      ("anticexlibris.ro", False), ("aronia-charlottenburg.ro", True),
                      ("librarie.net", True), ("pfarma.ro", True), ("superpfarma.ro", False),
                      ("drmaxim.ro", False), ("craftup.ro", False)]:
    verifica(f"e_prioritar({mag})", fpf.e_prioritar(mag), asteptat)

cand = [(None, "x", mn) for mn in
        ["craftup.ro", "zzz.ro", "springfarma.com", "feedgol.ro", "drmax.ro", "abc.ro", "vechi.ro"]]
ultima_preluare = {"zzz.ro": "2026-10-01", "drmax.ro": "2026-10-01", "vechi.ro": "2026-09-01"}
incercari = {"feedgol.ro": "2026-09-20", "vechi.ro": "2026-10-05"}
ordine = [c[2] for c in fpf.ordine_rotatie(cand, ultima_preluare, incercari)]
verifica("ordinea completa", ordine,
         ["springfarma.com", "abc.ro", "craftup.ro", "feedgol.ro", "drmax.ro", "zzz.ro", "vechi.ro"])
verifica("feed-ul gol, incercat pe 20.09, nu mai e printre neatinse",
         ordine.index("feedgol.ro") > ordine.index("craftup.ro"), True)
verifica("un mare vanzator deja descarcat NU trece inaintea unuia descarcat mai demult",
         ordine.index("feedgol.ro") < ordine.index("drmax.ro"), True)

feeduri = [
    {"id": 1, "program": {"name": "craftup.ro"}, "products_count": 1800},
    {"id": 2, "program": {"name": "liki24.pl"}, "products_count": 900},
    {"id": 3, "program": {"name": "magazin-gol.ro "}, "products_count": 0},
    {"id": 4, "program": {"name": "pfarma.ro"}, "products_count": 0},
    {"id": 5, "program": {"name": "fara-numar.ro/"}},
]
cand, straine, goale, stare = fpf.filtreaza_feeduri(feeduri)
verifica("feed-urile goale si cele straine nu consuma cereri",
         [c[2] for c in cand], ["craftup.ro", "fara-numar.ro"])
verifica("... numarate separat", (straine, goale), (1, 2))
verifica("un mare vanzator cu feed gol apare in log ca atare", stare, {"pfarma.ro": "feed gol"})

verifica("prioritari fara feed in My Feeds",
         fpf.prioritari_fara_feed(["springfarma.com", "anticexlibris.ro", "aronia-charlottenburg.ro"]),
         ["drmax", "libris", "librarie", "scule365", "pfarma"])


print("\n6. fetch_2p_api (programe, promotii) cere `perpage`, plafonat la 40")
f2p.api_get, cereri = api_fals([pagina(40, "programs", 1)], cheie="programs")
f2p.fetch_all_pages("affiliate/programs", per_page=100)
verifica("perpage = 40", cereri[0].get("perpage"), 40)
verifica("fara `per_page`", "per_page" in cereri[0], False)


print("\n7. Bannere: o lista taiata de 429 nu suprascrie banners.json")
def raspuns_bannere(n, pagini):
    return Raspuns(200, {"banners": [{"id": i, "img_path": f"https://img/{i}.jpg",
                                      "link": "https://event.2performant.com/x"} for i in range(n)],
                         "metadata": {"pagination": {"pages": pagini}}})

urluri = []
def get_bannere(raspunsuri):
    def get(url, headers=None, timeout=None):
        urluri.append(url)
        return raspunsuri.pop(0)
    return get

fb._session.get = get_bannere([raspuns_bannere(20, 3), Raspuns(429, {"errors": ["Too many requests"]})])
b = fb.fetch_banners()
verifica("429 la pagina 2: lista NU e completa", fb.BANNERE_COMPLETE, False)
verifica("cererea foloseste `perpage`", "perpage=40" in urluri[0], True)

fb._session.get = get_bannere([raspuns_bannere(20, 2), raspuns_bannere(5, 2)])
b = fb.fetch_banners()
verifica("ultima pagina atinsa: lista e completa", fb.BANNERE_COMPLETE, True)
verifica("... cu toate bannerele", len(b), 25)


print("\n8. Titluri curate la sursa (aceeasi regula ca titluAfisat din lib/topFeed.ts)")
for brut, curat in [
    ("Banca solida de exercitii, reglabila, cu 2 perne - Default Title", "Banca solida de exercitii, reglabila, cu 2 perne"),
    ("Osavi Colagen &amp; Electroliți, 390 g", "Osavi Colagen & Electroliți, 390 g"),
    ('Laptop DELL Precision 5570, 15.6&quot; FHD+', 'Laptop DELL Precision 5570, 15.6" FHD+'),
    ("🔥  BrainMax Zinc Complex® 1+1 GRATUIT", "🔥 BrainMax Zinc Complex® 1+1 GRATUIT"),
    ("Seminte de castraveti, fasole, tutun, par, cires, cais, piersic, prun,", "Seminte de castraveti, fasole, tutun, par, cires, cais, piersic, prun"),
    ("Vopsea pentru Pavaj si Beton, PAVECOAT - Vopsea pentru Pavaj si Beton, Protectie",
     "Vopsea pentru Pavaj si Beton, PAVECOAT"),
    ("Produs normal, fara probleme", "Produs normal, fara probleme"),
]:
    verifica(f"curata_titlu({brut[:38]}…)", fpf.curata_titlu(brut), curat)

print("\nToate verificarile au trecut." if not esecuri else f"\n{esecuri} verificari picate.")
sys.exit(1 if esecuri else 0)
