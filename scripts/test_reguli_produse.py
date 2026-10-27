"""
Test: un pret se afiseaza in lei doar cand magazinul vinde in lei (27.10.2026).

Ruleaza:  python scripts/test_reguli_produse.py      (iese cu 1 la prima asteptare incalcata)

De ce: pe /cod-reducere/cloud10beauty.com, „Shark FlexStyle 6 in 1 ... 319,99 lei" era in euro (linkurile
au `currency=eur`), iar puloverele iclothing.com (Irlanda) si sculele sklep.evolutionpowertools.com
(Polonia) aveau preturile lor afisate in lei. Regula: scripts/reguli_produse.py::moneda_magazin.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reguli_produse import moneda_magazin, preturi_in_alta_moneda  # noqa: E402

esecuri = 0


def verifica(nume, primit, asteptat):
    global esecuri
    if primit == asteptat:
        print(f"  ok    {nume}")
    else:
        esecuri += 1
        print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")


def p(magazin, titlu, pret=100.0, url="https://exemplu.com/products/x"):
    return {"merchant_slug": magazin, "title": titlu, "price": pret, "url": url, "url_original": url}


C10 = ("https://event.2performant.com/events/click?ad_type=quicklink&redirect_to=https%3A%2F%2Fwww.cloud10beauty.com"
       "%2Fproducts%2Fshark-flexstyle%3Fvariant%3D1%26currency%3Deur")

print("1. Valuta din link decide")
verifica("currency=eur in link (cloud10beauty.com) -> EUR",
         moneda_magazin("cloud10beauty.com", [p("cloud10beauty.com", "Shark FlexStyle 6 in 1", 319.99, C10)]), "EUR")
verifica("currency=eur bate si domeniul .ro",
         moneda_magazin("exemplu.ro", [p("exemplu.ro", "Rochie de seara", url="https://exemplu.ro/x?currency=EUR")]), "EUR")
verifica("currency=ron -> RON",
         moneda_magazin("detectiv.com", [p("detectiv.com", "Crima Virala", url="https://detectiv.com/x?currency=RON")]), "RON")

print("2. Fara valuta in link: dovada ca vinde in lei")
verifica("domeniu .ro -> RON", moneda_magazin("noriel.ro", [p("noriel.ro", "LEGO City")]), "RON")
verifica("marcaj de Romania in link (ro.store.asus.com) -> RON",
         moneda_magazin("asus.com", [p("asus.com", "ProArt P16 (H7606)", 17649, "https://ro.store.asus.com/proart")]), "RON")
verifica("marcaj /ro/ in link (benvenuti.com) -> RON",
         moneda_magazin("benvenuti.com", [p("benvenuti.com", "Boots", 384, "https://www.benvenuti.com/ro/boots")]), "RON")
verifica("titluri in romana -> RON",
         moneda_magazin("reelken.com", [p("reelken.com", "Masa rotunda extensibila din lemn masiv de stejar")]), "RON")
verifica("verificat de mana (112coffee.com) -> RON",
         moneda_magazin("112coffee.com", [p("112coffee.com", "CORTADO", 14), p("112coffee.com", "FLAT WHITE", 17)]), "RON")
verifica("doar promo-produse (pret 0) -> nimic de afisat in lei",
         moneda_magazin("geekbuying.com", [p("geekbuying.com", "8% off for 3D Printers", 0)]), "RON")

print("3. Fara dovada: moneda necunoscuta")
verifica("magazin irlandez, titluri in engleza (iclothing.com) -> necunoscuta",
         moneda_magazin("iclothing.com", [p("iclothing.com", "The Arctic Fleece Pullover - PNK - S", 49.99)]), None)
verifica("magazin polonez (sklep.evolutionpowertools.com) -> necunoscuta",
         moneda_magazin("sklep.evolutionpowertools.com",
                        [p("sklep.evolutionpowertools.com", "Przecinarka do metalu Evolution S355MCS 355 mm", 3799)]), None)
verifica("magazinul de test 2Performant ([DEMO]) -> necunoscuta",
         moneda_magazin("shopify-dev-1.2performant.com",
                        [p("shopify-dev-1.2performant.com", "Giant Tumbling Tower [DEMO]", 42.74,
                           "https://testingshop.demo.ro/cumpara/giant-tumbling-tower")]), None)

print("4. Lista pentru filtru si garda")
amestec = [p("cloud10beauty.com", "ghd Gold Gift Set", 229, C10), p("noriel.ro", "LEGO City"),
           p("iclothing.com", "Pullover", 49.99), p("iclothing.com", "Promo 10% off", 0)]
verifica("magazinele scoase si cate produse CU PRET au",
         preturi_in_alta_moneda(amestec), {"cloud10beauty.com": ("EUR", 1), "iclothing.com": (None, 1)})

print(f"\n{'PICAT' if esecuri else 'OK'}: {esecuri} asteptari incalcate")
sys.exit(1 if esecuri else 0)
