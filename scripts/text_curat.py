"""Textul care ajunge pe site, curatat intr-un singur loc (06.11.2026, cerinta lui Alex: „fiecare litera verificata").

Prinse in textul construit al site-ului: „Tom&nbsp;Ford" si „Villeroy&amp;Boch" (entitati din feed, codate de doua ori),
„sterilizate,, cu somon", „Sencor Sencor, Cuptor..." (marca lipita de doua ori), „toppinguri., valabil" (dupa ce scoatem
codul din textul magazinului ramane punctuatia rupta), „fara cod de introdus.." si promotii care scriu alt an
(„intervalul 6-9 noiembrie 2025" la Black Friday 2026).

Folosit de feed-uri (titlu, marca), de /alege, de promotii si de garda `verifica_text.py`, care citeste aceleasi reguli.

    python text_curat.py --test
"""
from __future__ import annotations

import html
import io
import json
import os
import re
import sys
from datetime import datetime, timezone

LUNI = "ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie"
LITERA = "A-Za-zĂÂÎȘȚăâîșțŞŢşţ"
# Prescurtari dupa care „.," e corect: „HK BEIRUI TRADE CO., LIMITED", „Lebooko S.R.L., Bucuresti".
PRESCURTARI = r"(?<!\b[Cc][Oo])(?<!\bInc)(?<!\bLtd)(?<!\bLTD)(?<!\bINC)(?<!S\.R\.L)(?<!S\.A)(?<!\bnr)(?<!\bNr)(?<!\betc)(?<!\bstr)"
LEGATURI = r"de|la|și|si|în|in|pe|cu|din|pentru|cu|al|ale"


# Ce nu facem si deci nu scriem: nu testam codurile in cos si nu verificam ofertele una cate una. Folosita de garda
# (verifica_text.py) si de textele scrise de AI (generate_daily_digest.py), care cad pe textul sigur cand o contin.
AFIRMATIE_FALSA = re.compile(
    r"(toate )?codurile (sunt|au fost) (testate|verificate)(?![^.!?]*\?)|(verificat|testat)[ăae]* de (noi|echipa noastr)|"
    r"garantat[ăe]? (functional|funcțional|valabil)|100% (functional|funcțional|valabil)", re.I)


def fara_entitati(t: str) -> str:
    """Entitatile HTML decodate de oricate ori au fost codate („&amp;nbsp;" -> spatiu); diacriticele cu sedila corectate."""
    s = diacritice(t or "")
    for _ in range(3):
        nou = html.unescape(s)
        if nou == s:
            break
        s = nou
    return s.replace(" ", " ").replace("​", "")


def diacritice(t: str) -> str:
    """„ş/ţ" (cu sedila, codificarea veche) -> „ș/ț" (cu virgula, forma corecta in romana).
    „ţ" nu exista in alta limba de pe site; „ş" exista in turca, deci textul cu „ğ"/„ı"/„İ" ramane cum e."""
    s = (t or "").replace("ţ", "ț").replace("Ţ", "Ț")
    if not re.search(r"[ğıİĞ]", s):
        s = s.replace("ş", "ș").replace("Ş", "Ș")
    return s


def de_numar(n: int) -> str:
    """„ de" cand numeralul romanesc il cere (ultimele doua cifre 00 sau 20-99), altfel „". Oglinda lui
    frontend/lib/acordNumeral.ts::deNumar."""
    r = abs(int(n)) % 100
    return " de" if n and (r == 0 or r >= 20) else ""


def cu_numar(n: int, singular: str, plural: str) -> str:
    """„1 cod", „19 coduri", „20 de coduri", „18.817 produse" (oglinda lui acordNumeral.ts::cuNumar)."""
    if n == 1:
        return f"1 {singular}"
    return f"{n:,}".replace(",", ".") + de_numar(n) + f" {plural}"


# Substantivele pe care le numaram noi sau magazinele in oferte. „ore", „luni", „minute" lipsesc intentionat: apar in
# specificatii de produs („Autonomie 45 ore", „12-36 luni"), unde textul e al producatorului.
SUBSTANTIVE_NUMARATE = (r"produse|magazine|oferte|coduri|promoții|promotii|campanii|articole|categorii|zile|"
                        r"bucăți|bucati|modele|titluri|cărți|carti|branduri|mărci|marci")
NUMERAL = re.compile(r"(?<![\d.,\-–/])\b(\d{1,3}(?:\.\d{3})+|\d+)( de)? (" + SUBSTANTIVE_NUMARATE + r")\b")


def acord_gresit(text: str):
    """Primul numeral fara acord: „24 produse", „cele 15 de produse", „1 oferte". None daca nu e niciunul."""
    for m in NUMERAL.finditer(text or ""):
        n = int(m.group(1).replace(".", ""))
        r = n % 100
        cere = n != 0 and (r == 0 or r >= 20)
        if n == 1 or cere != bool(m.group(2)):
            return m
    return None


def acord_numeral(text: str) -> str:
    """Repara acordul („24 produse" -> „24 de produse", „15 de produse" -> „15 produse"); „1 oferte" ramane (nu stim
    singularul), deci il prinde garda."""
    def fix(m):
        n = int(m.group(1).replace(".", ""))
        if n == 1:
            return m.group(0)
        return f"{m.group(1)}{de_numar(n)} {m.group(3)}"
    return NUMERAL.sub(fix, text or "")


def punctuatie(t: str) -> str:
    """Spatii si semne de punctuatie, fara sa atinga zecimalele („1,5 kg") sau punctele de suspensie."""
    s = re.sub(r"[ \t]+", " ", t or "")
    s = re.sub(r" +,(?=\d)", ", ", s)  # „Android 15 ,6 GB RAM" -> „Android 15, 6 GB" (nu „15,6", care pare zecimala)
    s = re.sub(r" +([,;:!?])", r"\1", s)
    s = re.sub(r"(?<=\w) +\.(?=\s|$)", ".", s)
    s = re.sub(r",{2,}", ",", s)
    # „toppinguri., valabil" (cod scos din mijloc); „CO., LIMITED" si „tabără..., Vine" (puncte de suspensie) raman
    s = re.sub(PRESCURTARI + r"(?<!\.\.)\.,", ",", s)
    s = re.sub(r",\.", ".", s)
    s = re.sub(r"(?<!\.)\.\.(?!\.)", ".", s)
    s = re.sub(r"([!?])\1+", r"\1", s)
    s = re.sub(rf",(?=[{LITERA}])", ", ", s)  # „adulte,,sensibile" -> „adulte, sensibile"; „1,5" ramane
    return re.sub(r" {2,}", " ", s).strip()


def fara_marca_dubla(titlu: str, marca: str = "") -> str:
    """„Sencor Sencor, Cuptor" -> „Sencor, Cuptor"; „Ceas Seiko Seiko Presage" -> „Ceas Seiko Presage".
    Doar marca produsului sau primul cuvant: „Lama Lama" (serie de carti) si „Hubba Hubba" (cort MSR) raman."""
    t = titlu or ""
    m = (marca or "").strip()
    if m and len(m) >= 2:
        t = re.sub(rf"\b({re.escape(m)})(\s+{re.escape(m)})+\b", r"\1", t, flags=re.I)
    return t


def titlu_produs(titlu: str, marca: str = "") -> str:
    t = fara_marca_dubla(fara_entitati(titlu), fara_entitati(marca))
    t = re.sub(rf"\b({LEGATURI})\s+\1\b", r"\1", t)  # „Negre din din Piele", „Alba si si Ciocolata" (doar litere mici)
    return acord_numeral(punctuatie(t))


def an_trecut(propozitie: str, an_curent: int | None = None) -> bool:
    """O data cu an trecut („6-9 noiembrie 2025") intr-un text de oferta: magazinul a refolosit textul de anul trecut."""
    an = an_curent or datetime.now(timezone.utc).year
    for m in re.finditer(rf"\b(?:{LUNI})\s+((?:19|20)\d\d)\b", propozitie, re.I):
        if int(m.group(1)) < an:
            return True
    return False


def fara_date_vechi(text: str, an_curent: int | None = None) -> str:
    """Scoate propozitiile cu o data din alt an dintr-un text de oferta; restul ramane."""
    fraze = re.split(r"(?<=[.!?])\s+", text or "")
    return " ".join(f for f in fraze if not an_trecut(f, an_curent)).strip()


def text_oferta(text: str, an_curent: int | None = None) -> str:
    return acord_numeral(punctuatie(fara_date_vechi(fara_entitati(text), an_curent)))


def test() -> int:
    asteptari = [
        ("entitate simpla", fara_entitati("Tom&nbsp;Ford"), "Tom Ford"),
        ("entitate dubla", fara_entitati("Villeroy&amp;amp;Boch"), "Villeroy&Boch"),
        ("apostrof", fara_entitati("L&apos;Oreal Paris"), "L'Oreal Paris"),
        ("doua virgule", punctuatie("pisici sterilizate,, cu somon"), "pisici sterilizate, cu somon"),
        ("doua virgule lipite", punctuatie("adulte,,sensibile, cu miel"), "adulte, sensibile, cu miel"),
        ("punct si virgula dupa cod scos", punctuatie("toppinguri., valabil intre 6 si 13 noiembrie"), "toppinguri, valabil intre 6 si 13 noiembrie"),
        ("doua puncte", punctuatie("fara cod de introdus.. Este valabila"), "fara cod de introdus. Este valabila"),
        ("puncte de suspensie raman", punctuatie("si multe altele..."), "si multe altele..."),
        ("spatiu inainte de virgula", punctuatie("EUROCOOL T-PRO , 12000 BTU"), "EUROCOOL T-PRO, 12000 BTU"),
        ("zecimala ramane", punctuatie("Saltea 1,5 kg, 160x200"), "Saltea 1,5 kg, 160x200"),
        ("spatiu inainte de doua puncte", punctuatie("dezvoltare personala : improvizatia"), "dezvoltare personala: improvizatia"),
        ("marca dubla la inceput", titlu_produs("Sencor Sencor, Cuptor cu microunde", "Sencor"), "Sencor, Cuptor cu microunde"),
        ("marca dubla in mijloc", titlu_produs("Ceas Seiko Seiko Presage SRE018J1", "Seiko"), "Ceas Seiko Presage SRE018J1"),
        ("marca dubla cu majuscule diferite", titlu_produs("NINJA Friteuza dubla Ninja Ninja Airfryer", "NINJA"), "NINJA Friteuza dubla Ninja Airfryer"),
        ("serie de carti ramane", titlu_produs("Pachet Lama Lama 5 vol.", "Editura Nemira"), "Pachet Lama Lama 5 vol."),
        ("prescurtare de firma ramane", punctuatie('("HK BEIRUI TRADE CO., LIMITED")'), '("HK BEIRUI TRADE CO., LIMITED")'),
        ("legatura dubla in titlu", titlu_produs("Ghete Dama Imblanite Negre din din Piele", ""), "Ghete Dama Imblanite Negre din Piele"),
        ("si si in titlu", titlu_produs("Ciocolata Alba si si Ciocolata cu Caramel", ""), "Ciocolata Alba si Ciocolata cu Caramel"),
        ("an trecut prins", an_trecut("Pe promotia Black Friday este in intervalul 6-9 noiembrie 2025.", 2026), True),
        ("an curent ramane", an_trecut("valabil intre 6 si 13 noiembrie 2026", 2026), False),
        ("an de model nu e data", an_trecut("Aer conditionat, model 2025", 2026), False),
        ("sedila devine virgula", fara_entitati("Să croşetăm una-alta; Ţeserea cu fâşii"), "Să croșetăm una-alta; Țeserea cu fâșii"),
        ("turca ramane", diacritice("Beşiktaş Kağıt"), "Beşiktaş Kağıt"),
        ("1", cu_numar(1, "produs", "produse"), "1 produs"),
        ("19", cu_numar(19, "produs", "produse"), "19 produse"),
        ("20", cu_numar(20, "produs", "produse"), "20 de produse"),
        ("105", cu_numar(105, "magazin", "magazine"), "105 magazine"),
        ("120", cu_numar(120, "magazin", "magazine"), "120 de magazine"),
        ("0", cu_numar(0, "oferta", "oferte"), "0 oferte"),
        ("18817", cu_numar(18817, "produs", "produse"), "18.817 produse"),
        ("1000", cu_numar(1000, "produs", "produse"), "1.000 de produse"),
        ("spatiu inainte de virgula si cifra", punctuatie("rezolutie 2K, Android 15 ,6 GB RAM"), "rezolutie 2K, Android 15, 6 GB RAM"),
        ("suspensie urmata de virgula ramane", punctuatie("(La revedere, tabără..., Vine vacanța..., 8 povestiri...)"), "(La revedere, tabără..., Vine vacanța..., 8 povestiri...)"),
        ("acord: lipseste de", acord_numeral("Reduceri la peste 200 produse, retur in 30 zile"), "Reduceri la peste 200 de produse, retur in 30 de zile"),
        ("acord: de in plus", acord_numeral("Calculat din cele 15 de produse"), "Calculat din cele 15 produse"),
        ("acord: 105 fara de", acord_numeral("105 produse"), "105 produse"),
        ("acord: mii", acord_numeral("Peste 1.000 produse"), "Peste 1.000 de produse"),
        ("acord: interval ramane", acord_numeral("livrare in 2-30 zile"), "livrare in 2-30 zile"),
        ("acord: zecimala ramane", acord_numeral("1,25 produse"), "1,25 produse"),
        ("acord: specificatie ramane", acord_numeral("Autonomie 45 ore"), "Autonomie 45 ore"),
        ("acord gresit: 1 + plural", bool(acord_gresit("1 produse")), True),
        ("acord corect", acord_gresit("20 de produse, 19 produse, 120 de magazine, 1.000 de oferte"), None),
        ("titlu de produs cu acord", titlu_produs("Calendar Advent 24 zile Lindt", "Lindt"), "Calendar Advent 24 de zile Lindt"),
        ("propozitia veche iese, restul ramane", text_oferta("Reduceri la carti. Pe promotia Black Friday este in intervalul 6-9 noiembrie 2025. Transport gratuit.", 2026), "Reduceri la carti. Transport gratuit."),
    ]
    rele = [(n, a, e) for n, a, e in asteptari if a != e]
    # Invariant pe datele reale: curatarea a doua oara nu mai schimba nimic. Prinsa pe 06.11.2026: „tabără..., Vine"
    # devenea „tabără., Vine" la prima trecere si „tabără, Vine" la a doua (punctele de suspensie luate drept greseala).
    cale = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", "public", "products.json")
    if os.path.exists(cale):
        d = json.load(io.open(cale, encoding="utf-8"))
        lista = d.get("products", []) if isinstance(d, dict) else d
        for p in lista:
            o = titlu_produs(p.get("title") or "", p.get("brand") or "")
            if titlu_produs(o, p.get("brand") or "") != o:
                rele.append(("idempotent pe products.json", titlu_produs(o, p.get("brand") or ""), o))
                break
    for n, a, e in rele:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rele else f"{len(rele)} asteptari incalcate")
    return 1 if rele else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else 0)
