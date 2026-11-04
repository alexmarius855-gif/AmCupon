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
from promotii import (cod_din_titlu, coduri_in_text, coduri_listate, curata_promotii, fara_cod,  # noqa: E402
                      fara_coduri, fara_coduri_listate, scurteaza,  # noqa: E402
                      fara_markdown, pentru_alta_piata, repara_mojibake, text_pentru_afiliati, titlu_promotie,
                      valoare_zero)

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

# ── 07.10.2026: textul fara cod — aceleasi cazuri ca lib/oferta.test.mjs, plus articolul lunar ─────────
print("\nTextul fara cod:")
verifica("„Use Code: 30CVLIFE” -> „Use code”",
         fara_cod("Unlock Savings with 30% Off: Use Code: 30CVLIFE", "30CVLIFE"), "Unlock Savings with 30% Off: Use code")
verifica("„prin codul OFERTE01” -> „prin codul de reducere”",
         fara_cod("Reduceri de 10% prin codul OFERTE01", "OFERTE01"), "Reduceri de 10% prin codul de reducere")
verifica("„cu codul VARA20”, minusul din „-20%” ramane",
         fara_cod("-20% la tot, cu codul VARA20", "VARA20"), "-20% la tot, cu codul de reducere")
verifica("doua puncte late: „Code：OIAFF5”", fara_cod("OutIn Code：OIAFF5", "OIAFF5"), "OutIn")
verifica("codul nu se taie din mijlocul altui cuvant", fara_cod("SAVE10X si SAVE10", "SAVE10"), "SAVE10X si")
verifica("fara cod, textul ramane", fara_cod("  20% la tot  ", ""), "20% la tot")
verifica("fara_coduri: descrierea Klaiyi numeste doua coduri",
         fara_coduri("18% OFF Sitewide — Code: KLAIYI18 20% OFF Over $169 — Code: KLAIYI20",
                     P("Up To 20% OFF Sitewide With Code: KLAIYI20",
                       "18% OFF Sitewide — Code: KLAIYI18 20% OFF Over $169 — Code: KLAIYI20", cod="KLAIYI20")),
         "18% OFF Sitewide 20% OFF Over $169")
verifica("titlul care E codul -> descrierea", titlu_promotie(P("LumosFlex120", "120 off for lumos flex"), "Wecreat"),
         "120 off for lumos flex")
verifica("doar cod, fara descriere -> „Cod de reducere X”", titlu_promotie(P("SAVE10", "", cod="SAVE10"), "X"),
         "Cod de reducere X")
verifica("fara cod si fara text -> „Ofertă X”", titlu_promotie(P("", ""), "X"), "Ofertă X")

import generate_blog  # noqa: E402

art = generate_blog.genereaza_articol_magazin(M("kospet.com",
    P("[EU] Limited time sale-P10 Save 48% OFF! Use code DPR35", "Limited time sale-P10 Save 48% OFF! Use code DPR35",
      cod="DPR35"),
    P("LumosFlex120", "120 off for lumos flex")), "Octombrie", 2026)
verifica("articolul lunar nu scrie codul in clar (doar mascat)",
         ("DPR35" in art["content"], "LumosFlex120" in art["content"], "***35" in art["content"]), (False, False, True))

# ── 18.10.2026: promotii pentru ALTA piata — cazurile reale din output.json + capcanele ─────────────
print("\nPromotii pentru alta piata:")
for nume_caz, text in {
    "vidaxl.bg: bulgara, leva": "Абонирайте се за нашия бюлетин днес & получавате отстъпка от 10 лв. при регистрация!",
    "vidaxl.bg: „10% намаление”": "10% намаление",
    "ikier.com: pesos (mx.ikier.com)": "Ahorra $1,999 MXN en iKier K1 Pro Max 70W con código AFFK11999",
    "italki.com: germana (italki.com/de)": "10 EUR Rabatt auf 20 EUR MBW",
    "maghiara": "20% kedvezmény minden termékre",
    "forint fara cuvinte maghiare": "Reducere de 5000 HUF",
    "zloti": "Kod: 50 zł na pierwsze zamówienie",
}.items():
    verifica(f"prinsa — {nume_caz}", bool(pentru_alta_piata(text)), True)
for nume_caz, text in {
    "romana cu lei": "Abonează-te la newsletterul nostru az & beneficiază de o reducere de 25Lei la înscriere!",
    "romana: „rabat” cu un t": "Rabat comercial 10% la comenzi peste 300 RON",
    "romana: „gratis”": "2+1 GRATIS",
    "engleza cu $ (magazin international)": "Cozy Season Cooler Prices Sale Up To $70 Off With Code:Cool",
    "engleza cu € (magazin EU)": "Save 300€ on IKIER Master with Code AFFMASTER300",
    "engleza: „reduction” fara accent": "Price reduction on all hosting plans",
    "engleza cu USD": "USD $12 Off Coupon Code: LONGERR",
    "bilingv ro/en": "Halloween pe GiftDesign.ro: -13% + cadou la 200 lei! /13% OFF + FREE Gift!",
    "cod care contine o moneda": "Folosește codul CAD10 la casă",
    "„ft” = picioare, nu forinti": "10 ft HDMI cable 20% off",
}.items():
    verifica(f"ramane — {nume_caz}", pentru_alta_piata(text), None)
magp = [M("vidaxl.bg", P("10% намаление"), P("Deals Page: Reduceri de 10% prin codul OFERTE01")),
        M("italki.com", P("10 EUR Rabatt auf 20 EUR MBW", cod="IMPACT10"))]
stp = curata_promotii(magp, azi="2026-10-18")
verifica("curata_promotii scoate promotia, nu magazinul; flag-urile se recalculeaza",
         ([x["nume"] for x in magp[0]["promotii"]], magp[1]["promotii"], magp[1]["are_promotie"],
          len(stp["alta_piata"]), stp["magazine_golite"]),
         (["Deals Page: Reduceri de 10% prin codul OFERTE01"], [], False, 2, ["italki.com"]))


# ─── Calea API 2Performant (04.11.2026): oferte programate, ultima zi, text si cod pentru client ──
from promotii import (campuri_client, cod_din_camp, descriere_publica, fara_segmente_afiliati,  # noqa: E402
                      sfarsit_real)
from fetch_2p_api import parse_promotii  # noqa: E402

verifica("API: sfarsitul la 00:00 ora Romaniei inseamna toata ziua aceea",
         sfarsit_real("2026-11-07T22:00:00Z").strftime("%Y-%m-%d %H:%M"), "2026-11-08 23:59")
verifica("CSV: acelasi moment, acelasi rezultat",
         sfarsit_real("2026-11-07 22:00:00 UTC").strftime("%Y-%m-%d %H:%M"), "2026-11-08 23:59")
verifica("data care nu se poate citi = necunoscuta", sfarsit_real("mai incolo"), None)

for raw, asteptat in {"REGATA5": "REGATA5", " epotion10 ": "epotion10", "5MINUS": "5MINUS", "10": "",
                      "nu e necesar": "", "": "", None: "", True: ""}.items():
    verifica(f"cod din camp: {raw!r}", cod_din_camp(raw), asteptat)

UA = M("underarmour.ro")
for nume_caz, titlu, m_caz, asteptat in [
    ("bucata cu comision se scoate", "Voucher Black Friday 6-15 Noiembrie + comision HAVIT 10%", None,
     "Voucher Black Friday 6-15 Noiembrie"),
    ("mai multe bucati pentru afiliati", "Reduceri de iarna | Comision 8% | Coș mediu peste 1.000 lei", None, "Reduceri de iarna"),
    ("ramane doar numele magazinului", "Comision de afiliere majorat | Under Armour", UA, None),
    ("doar pentru afiliati", "Super challenge Otter in noiembrie", None, None),
    ("capcana: fara comision la banca ramane", "Card fără comision | Cont gratuit", None, "Card fără comision | Cont gratuit"),
    ("capcana: 0% comision ramane", "0% comision la schimb valutar", None, "0% comision la schimb valutar"),
    ("capcana: comision 0 ramane", "Comision 0 la transferuri", None, "Comision 0 la transferuri"),
    ("capcana: challenge cu reducere ramane", "Fitness Challenge -20%", None, "Fitness Challenge -20%"),
    ("capcana: 1 + 1 nu se rupe", "Oferta 1 + 1 gratis", None, "Oferta 1 + 1 gratis"),
    ("titlu obisnuit neatins", "Black Friday: -30% la tot", None, "Black Friday: -30% la tot"),
]:
    verifica(f"segmente — {nume_caz}", fara_segmente_afiliati(titlu, m_caz), asteptat)

for nume_caz, text, asteptat in [
    ("fraza cu comision iese", "Reducere 30% la tot. Fiecare comandă generată îți aduce 19% comision.", "Reducere 30% la tot."),
    ("fara emoji si fara link", "👠 Reducere 20% >> https://exemplu.ro/oferta", "Reducere 20%"),
    ("textul care repeta titlul nu se mai afiseaza", "Oferta 1+1", ""),
    ("fraza care ii cere afiliatului sa promoveze iese", "Promovează Abonamentul ca soluția lunară. Livrare gratuită.", "Livrare gratuită."),
    ("semnatura catre afiliati iese", "Reducere 50%. Link promotie: Spor la conversii, echipa LIBRARIE.net", "Reducere 50%."),
    ("doar semnatura = fara text", "Echipa LIBRARIE.net", ""),
    ("semnatura lunga iese", "Reducere 20%. Echipa NUVIA *The Nature of True Beauty*", "Reducere 20%."),
    ("capcana: intervalul de date ramane intreg", "Intra pe site in perioada 2 - 8 noiembrie.", "Intra pe site in perioada 2 - 8 noiembrie."),
    ("capcana: liniuta intre cuvinte ramane fraza", "Reducere mare - toate produsele", "Reducere mare. toate produsele"),
    ("capcana: ... ramane", "Preturile... in umbra", "Preturile... in umbra"),
    ("spatiul ramas dupa emoji", "Imprimante 🖨️, cititoare", "Imprimante, cititoare"),
]:
    verifica(f"text client — {nume_caz}", descriere_publica(text, {"nume": "Oferta 1+1", "cod_cupon": ""}), asteptat)

verifica("codul scris in text se muta in camp si dispare din text",
         campuri_client("Reducere 10%", "Reducere la tot. Introdu codul Intim10 la finalizare.", None)[0], "Intim10")
verifica("fara cod in clar in descriere",
         "Intim10" in campuri_client("Reducere 10%", "Reducere la tot. Introdu codul Intim10 la finalizare.", None)[1], False)
verifica("ghilimelele ramase dupa cod dispar",
         campuri_client('Extra 15%', 'Extra 15% cu codul "SALE" la produsele reduse.', "SALE"),
         ("SALE", "Extra 15% la produsele reduse."))
verifica("capcana: fara cod ramane informatie",
         campuri_client("Reducere 45%", "Reduceri aplicate direct in pret, fără cod.", None),
         ("", "Reduceri aplicate direct in pret, fără cod."))

mprog = [M("programata.ro", dict(P("Black Friday"), incepe="2026-11-20T06:00:00Z", expira="2026-11-30"),
           dict(P("Reducere 10%"), incepe="2026-10-01T06:00:00Z", expira="2026-11-30"))]
stp = curata_promotii(mprog, azi="2026-11-04")
verifica("oferta programata nu se publica, cea inceputa ramane",
         ([x["nume"] for x in mprog[0]["promotii"]], stp["neincepute"]), (["Reducere 10%"], 1))
mprog = [M("programata.ro", dict(P("Black Friday"), incepe="2026-11-20T06:00:00Z", expira="2026-11-30"))]
curata_promotii(mprog, azi="2026-11-20")
verifica("oferta apare singura in ziua de start", [x["nume"] for x in mprog[0]["promotii"]], ["Black Friday"])

mnim = [M("underarmour.ro", dict(P("Under Armour"), expira="2026-11-30"),
          dict(P("Under Armour", cod="UA10"), expira="2026-11-30"),
          dict(P("Black Friday"), expira="2026-11-30"))]
stp = curata_promotii(mnim, azi="2026-11-04")
verifica("oferta care spune doar numele magazinului iese; cea cu cod ramane",
         ([(x["nume"], x.get("cod_cupon")) for x in mnim[0]["promotii"]], stp["fara_continut"]),
         ([("Under Armour", "UA10"), ("Black Friday", "")], 1))
from import_csv_promotii import is_duplicate  # noqa: E402
verifica("titlu scurt identic = dublura", is_duplicate([{"nume": "Flash Sale"}], {"nume": "FLASH sale"}), True)
verifica("capcana: titluri scurte diferite nu sunt dubluri", is_duplicate([{"nume": "Sale"}], {"nume": "Flash Sale"}), False)
verifica("text pentru afiliati in engleza iese",
         descriere_publica("Your audience can save $300 instantly. Free shipping.", {"nume": "X"}), "Free shipping.")

# Coduri scrise ca lista de trepte (04.11.2026): pe site se citeau intregi, fara clic pe linkul platit.
FLEX = "BF12 -- Extra 12% OFF on Any order BF15 -- Extra 15% OFF on Orders $90+ BF20 -- Extra 20% OFF on Orders $120+"
KLAI = "17% OFF Sitewide: BF17; $30 OFF Orders Over $155: BF30; $60 OFF Orders Over $265: BF60. Nov 2–10, 2026."
pfx = {"nume": "BLACK FRIDAY -- UP TO 45% OFF", "descriere": FLEX, "cod_cupon": ""}
verifica("lista de trepte: primul cod trece in cod_cupon", (cod_din_titlu(pfx), pfx["cod_cupon"]), (True, "BF12"))
verifica("lista de trepte: ramane doar treapta codului", fara_coduri_listate(FLEX, "BF12"), "Extra 12% OFF on Any order")
verifica("lista de trepte: alta treapta, alt text", fara_coduri_listate(FLEX, "BF20"), "Extra 20% OFF on Orders $120+")
verifica("lista de trepte: cod strain de lista, toate treptele fara coduri", fara_coduri_listate(FLEX, "ALT9"),
         "Extra 12% OFF on Any order; Extra 15% OFF on Orders $90+; Extra 20% OFF on Orders $120+")
verifica("reducere: cod, codurile ies, restul textului ramane", fara_coduri_listate(KLAI, "BF60"),
         "17% OFF Sitewide; $30 OFF Orders Over $155; $60 OFF Orders Over $265. Nov 2–10, 2026.")
verifica("off Code：X ramane la regula veche, nu lasa cuvantul Code in text",
         (coduri_listate("enjoy 5% off Code：OIAFF5"), fara_coduri("enjoy 5% off Code：OIAFF5", {"cod_cupon": "OIAFF5"})),
         ([], "enjoy 5% off"))
verifica("cod dupa doua puncte in titlu", coduri_listate("Screen discounts：AVACC88"), ["AVACC88"])
for capcana in ("LABOR8 Signature Scent: parfum de nisa", "For LONGER RAY5 Laser Engraver Raiser Feet", "$20 off over $300 - 26Q4",
                "Kospet P10 - 30% off", "Model RTX4090 – 20% off", "Reducere 20% la modelele: RTX4090, RTX4080",
                "Black Friday: 20% off la tot", "Valabil 2 - 8 noiembrie, reducere 15%: toata gama"):
    verifica(f"capcana, nu e cod: {capcana}", (coduri_listate(capcana), fara_coduri_listate(capcana)), ([], capcana))
mfx = [M("flextail.com", dict(P("BLACK FRIDAY -- UP TO 45% OFF"), descriere=FLEX, expira="2026-12-10"))]
curata_promotii(mfx, azi="2026-11-04")
verifica("curata_promotii: cod mutat, text fara coduri", (mfx[0]["promotii"][0]["cod_cupon"], mfx[0]["promotii"][0]["descriere"]),
         ("BF12", "Extra 12% OFF on Any order"))
verifica("curata_promotii e idempotent pe lista", (curata_promotii(mfx, azi="2026-11-04") and mfx[0]["promotii"][0]["descriere"]),
         "Extra 12% OFF on Any order")
verifica("scurtat la cuvant, nu in mijlocul lui", scurteaza("unu doi trei patru", 10), "unu doi…")
verifica("scurtat la sfarsit de fraza", scurteaza("Prima fraza aici. A doua fraza lunga", 25), "Prima fraza aici.")
verifica("text scurt ramane intreg", scurteaza("scurt", 10), "scurt")

hrt = parse_promotii([{
    "name": "Reducere 10% la tot", "customer_description": "Reducere 10% la tot cosul, indiferent de valoare.",
    "affiliate_description": "Comision dublu pentru afiliati in noiembrie.", "affiliate_bonus": True,
    "affiliate_challenge": True, "coupon": "JOLLY10", "promotion_start": "2026-11-20T06:00:00Z",
    "promotion_end": "2099-11-07T22:00:00Z", "campaign_slug": "x", "program": {"slug": "exemplu.ro"},
    "landing_page_link": "",
}])
pa = list(hrt.values())[0][0]
verifica("API: se citesc textul pentru client si codul, nu campurile pentru afiliati",
         (pa["descriere"], pa["cod_cupon"], pa["incepe"], pa["expira"]),
         ("Reducere 10% la tot cosul, indiferent de valoare.", "JOLLY10", "2026-11-20T06:00:00Z", "2099-11-08"))

print(f"\n  {esecuri} ESECURI" if esecuri else "\n  Toate testele trec.")
sys.exit(1 if esecuri else 0)
