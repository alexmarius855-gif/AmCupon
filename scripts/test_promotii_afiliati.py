"""
Test pentru regula „texte scrise pentru afiliati" din promotii.py (24.09.2026).

Ruleaza:  python scripts/test_promotii_afiliati.py      (iese cu 1 la prima asteptare incalcata)

Cazurile sunt REALE, din output.json-ul de pe 24.09.2026, plus capcanele de fals-pozitiv:
texte pentru CUMPARATOR care contin cuvinte din acelasi camp („fără comision", „editura",
„câștigă o vacanță", „eligible sale items"). Un filtru care le-ar scoate si pe ele ar sterge
oferte bune de pe site — de-aia sunt aici, nu doar cele care trebuie prinse.
"""
import copy
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from promotii import (cod_din_titlu, coduri_in_text, curata_promotii, fara_markdown,  # noqa: E402
                      repara_mojibake, text_pentru_afiliati, valoare_zero)

esecuri = 0


def verifica(nume, primit, asteptat):
    global esecuri
    if primit == asteptat:
        print(f"  ok    {nume}")
    else:
        esecuri += 1
        print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")


def M(slug, *promo):
    return {"magazin": slug, "url": f"https://{slug}", "promotii": [dict(p) for p in promo]}


def P(nume, descriere="", cod=""):
    return {"nume": nume, "descriere": descriere, "cod_cupon": cod, "expira": "2026-12-31", "sursa": "test"}


def verdict(slug, nume, descriere=""):
    r = text_pentru_afiliati(P(nume, descriere), M(slug))
    return r[0] if r else None


print("\n── scoase: texte pentru afiliati (reale, 24.09.2026) ──")
verifica("interlink.ro: titlul = numele magazinului, descrierea = programul de afiliere",
         verdict("interlink.ro", "Interlink",
                 "Promovează produsele Interlink și câștigă comisioane din fiecare vânzare validă. Interlink oferă "
                 "o gamă variată de laptopuri. Profită de campanii promoționale, materiale de marketing dedicate și "
                 "un portofoliu atractiv pentru a genera conversii."), "scoate")
verifica("femieko.ro: „Câștigă premii și comision de 19%!\"",
         verdict("femieko.ro", "Provocarea Femieko 2026 – Câștigă premii și comision de 19%!"), "scoate")
verifica("gl-inet.com: „Earn More with LWR01\" + „affiliates earn an increased commission\"",
         verdict("gl-inet.com", "Earn More with LWR01",
                 "Drive more conversions with our latest LWR01 promotion! Customers can save 40% using code "
                 "LWR40OFF, while affiliates earn an increased commission on every eligible sale. Update your "
                 "content and start promoting today."), "scoate")
verifica("fara diacritice: „castiga comision pentru fiecare vanzare\"",
         verdict("x.ro", "Castiga 19% comision pentru fiecare vanzare"), "scoate")

print("\n── raman: texte pentru cumparator (capcane) ──")
verifica("x-sense.com: „affiliate-exclusive code\" e un cod pentru cumparator",
         verdict("x-sense.com", "Q3 Exclusive Affiliate Discount: 12% Off Smart Home Safety",
                 "Use affiliate-exclusive code AFQ3XSENSE for an extra 12% off your entire order."), None)
verifica("herbagetica.ro: concurs pentru cumparatori („poți câștiga vouchere\")",
         verdict("herbagetica.ro", "Starea de bine cu Herbagetica vine! 3 vacanțe în Maldive + premii zilnice",
                 "Înscrie-te în campanie și poți câștiga unul din cele 120 de vouchere Herbagetica."), None)
verifica("titlu care incepe cu „Câștigă\", fara nimic pentru afiliati",
         verdict("x.ro", "Câștigă o vacanță în Grecia la orice comandă peste 200 lei"), None)
verifica("banca: „fără comision de administrare\"",
         verdict("banca.ro", "Card de debit fără comision de administrare primul an"), None)
verifica("librarie: „direct de la editură / from the publisher\"",
         verdict("carti.ro", "Noutăți direct de la editură", "Books shipped directly from the publisher."), None)
verifica("„20% off eligible sale items\"", verdict("x.com", "20% off eligible sale items"), None)
verifica("„0 commission on your first trade\" (fintech, pentru client)",
         verdict("x.com", "0 commission on your first trade"), None)

print("\n── oferta reala cu o fraza pentru afiliati in descriere: se curata fraza, oferta ramane ──")
r = text_pentru_afiliati(P("Reducere 15% la toată colecția", "Folosește codul la checkout. Afiliații câștigă "
                           "comision dublu în septembrie."), M("x.ro"))
verifica("verdict", r[0] if r else None, "curata")
verifica("descrierea ramasa", r[1] if r else None, "Folosește codul la checkout.")
r = text_pentru_afiliati(P("", "Start promoting today and earn a higher commission."), M("x.com"))
verifica("fara titlu, fara cod, doar text pentru afiliati -> scoasa, nu oferta goala", r[0] if r else None, "scoate")
r = text_pentru_afiliati(P("SAVE10", "Affiliates earn 20% commission on every sale.", cod="SAVE10"), M("x.com"))
verifica("titlul e doar codul, dar codul e real -> ramane, fara fraza", r, ("curata", ""))

print("\n── markdown ──")
verifica("„**159,99 lei**\"", fara_markdown("de la doar **159,99 lei**."), "de la doar 159,99 lei.")
verifica("„__bold__\"", fara_markdown("__Nou__ in colectie"), "Nou in colectie")
verifica("un singur „_\" ramane („Geeta Hair_Mother's Day\")", fara_markdown("Geeta Hair_Mother's Day"),
         "Geeta Hair_Mother's Day")
verifica("un singur „*\" ramane („*Termeni\")", fara_markdown("-20% *se aplică termeni"), "-20% *se aplică termeni")

print("\n── caractere stricate (UTF-8 citit ca Latin-1) ──")
verifica("insotelhotelgroup.com (real, cu NBSP-ul din „à\" pierdut)",
         repara_mojibake("Jusqu'Ã 45 % de rÃ©duction â\x80\x93 SÃ©jour gratuit pour 2 enfants | Insotel Hotel"),
         "Jusqu'à 45 % de réduction – Séjour gratuit pour 2 enfants | Insotel Hotel")
verifica("cllix.com (real): liniuta dintre date", repara_mojibake("31/08/2026 â\x80\x93 15/10/2026"),
         "31/08/2026 – 15/10/2026")
verifica("romana corecta ramane", repara_mojibake("Câștigă o vacanță în România, până la 50%"),
         "Câștigă o vacanță în România, până la 50%")
verifica("franceza corecta cu spatiu neintrerupt („ÉTÉ :\") ramane",
         repara_mojibake("SOLDES D'ÉTÉ : jusqu'à -50 %"), "SOLDES D'ÉTÉ : jusqu'à -50 %")
verifica("portugheza cu majuscule („MAÇÃ VERDE\") ramane", repara_mojibake("MAÇÃ VERDE"), "MAÇÃ VERDE")

print("\n── curata_promotii: scoate, recalculeaza flag-urile, e idempotent ──")
mag = [
    M("interlink.ro", P("Interlink", "Promovează produsele Interlink și câștigă comisioane din fiecare vânzare validă.")),
    M("femieko.ro", P("Provocarea Femieko 2026 – Câștigă premii și comision de 19%!"),
      P("Economisește până la 25% cu Abonamentul Femi.Eko", "", "FEMI25")),
    M("arabescu.ro", P("Pachete cadou", "începând de la doar **159,99 lei**.")),
]
st = curata_promotii(mag, azi="2026-09-24")
verifica("interlink ramane fara promotii si fara flag", (mag[0]["promotii"], mag[0]["are_promotie"]), ([], False))
verifica("femieko pastreaza doar oferta reala, cu codul ei",
         ([p["nume"][:12] for p in mag[1]["promotii"]], mag[1]["cod_cupon"]), (["Economisește"], True))
verifica("arabescu fara asteriscuri", mag[2]["promotii"][0]["descriere"], "începând de la doar 159,99 lei.")
verifica("raport: 2 scoase, 1 markdown", (len(st["afiliati_scoase"]), st["markdown"]), (2, 1))
inainte = copy.deepcopy(mag)
st2 = curata_promotii(mag, azi="2026-09-24")
verifica("a doua trecere nu mai schimba nimic", (mag == inainte, st2["afiliati_scoase"], st2["markdown"]),
         (True, [], 0))

# ── 07.10.2026: codul scris IN text, cu `cod_cupon` gol (cazuri reale din output.json) ───────────────
print("\nCodul din text:")


def cod_mutat(nume, descriere=""):
    p = P(nume, descriere)
    return p["cod_cupon"] if cod_din_titlu(p) else None


verifica("klaiyihair: „With Code: KLAIYI20” in titlu (descrierea numeste doua coduri)",
         cod_mutat("Up To 20% OFF Sitewide With Code: KLAIYI20",
                   "18% OFF Sitewide — Code: KLAIYI18 20% OFF Over $169 — Code: KLAIYI20"), "KLAIYI20")
verifica("ikier: „Coupon Code – AFFMASTER300” (cu linie de pauza)",
         cod_mutat("IKIER Master Exclusive $300 OFF Coupon Code – AFFMASTER300"), "AFFMASTER300")
verifica("outin: „Code：OIAFF5” (doua puncte late)", cod_mutat("OutIn Code：OIAFF5"), "OIAFF5")
verifica("vidaxl.bg: „prin codul OFERTE01”", cod_mutat("Deals Page: Reduceri de 10% prin codul OFERTE01"), "OFERTE01")
verifica("xmind: codul doar in descriere", cod_mutat("Xmind 10% Off | XMIND10OFF",
         "Save 10% on eligible Xmind subscriptions with code XMIND10OFF. Valid through June 1, 2027."), "XMIND10OFF")
verifica("dhgate: titlul E codul, descrierea il confirma (regula veche)",
         cod_mutat("DH2026OCTSAVE3", "Save $3 on orders over $29 using coupon DH2026OCTSAVE3"), "DH2026OCTSAVE3")
verifica("„with code at checkout” nu e un cod", cod_mutat("10% off", "Use the code at checkout"), None)
verifica("„NO CODE NEEDED” nu e un cod", cod_mutat("SUMMER SALE", "NO CODE NEEDED"), None)
verifica("„Use code FREE SHIPPING” nu e un cod", cod_mutat("Use code FREE SHIPPING"), None)
verifica("doua coduri diferite in acelasi text = nu ghicim",
         cod_mutat("Sale", "Code: AAA111 or Code: BBB222"), None)
verifica("titlul cu nume de produs nu devine cod", cod_mutat("SUMMER2026", "Summer sale on all items"), None)
p = P("Use code DPR35", "", cod="EXISTENT")
verifica("cod_cupon existent nu se schimba", (cod_din_titlu(p), p["cod_cupon"]), (False, "EXISTENT"))
verifica("coduri_in_text pastreaza ordinea, fara repetitii",
         coduri_in_text("Code: AB12 then Code: AB12 and code CD34"), ["AB12", "CD34"])

print("\nValoare zero:")
verifica("geekbuying: „USD $0 Off Coupon Code: CHAU21”",
         valoare_zero(P("CHAU21", "USD $0 Off Coupon Code: CHAU21, For PVY Turbo Electric Bike")), True)
verifica("„$10 Off” nu e zero", valoare_zero(P("$10 Off", "USD $10 Off Coupon Code: X10")), False)
verifica("„Livrare 0 lei” e transport gratuit, nu reducere zero", valoare_zero(P("Livrare 0 lei")), False)
verifica("„10% off” nu e zero", valoare_zero(P("10% off sitewide")), False)
mag0 = [M("geekbuying.com", P("CHAU21", "USD $0 Off Coupon Code: CHAU21"), P("LONGERR", "USD $12 Off Coupon Code: LONGERR"))]
st0 = curata_promotii(mag0, azi="2026-10-07")
verifica("curata_promotii scoate oferta de $0 si muta codul celeilalte",
         ([x["cod_cupon"] for x in mag0[0]["promotii"]], st0["valoare_zero"], st0["cod_din_titlu"]), (["LONGERR"], 1, 1))

print(f"\n  {esecuri} ESECURI" if esecuri else "\n  Toate testele trec.")
sys.exit(1 if esecuri else 0)
