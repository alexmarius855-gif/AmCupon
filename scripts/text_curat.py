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
import re
import sys
from datetime import datetime, timezone

LUNI = "ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie"
LITERA = "A-Za-zĂÂÎȘȚăâîșțŞŢşţ"
# Prescurtari dupa care „.," e corect: „HK BEIRUI TRADE CO., LIMITED", „Lebooko S.R.L., Bucuresti".
PRESCURTARI = r"(?<!\b[Cc][Oo])(?<!\bInc)(?<!\bLtd)(?<!\bLTD)(?<!\bINC)(?<!S\.R\.L)(?<!S\.A)(?<!\bnr)(?<!\bNr)(?<!\betc)(?<!\bstr)"
LEGATURI = r"de|la|și|si|în|in|pe|cu|din|pentru|cu|al|ale"


def fara_entitati(t: str) -> str:
    """Entitatile HTML decodate de oricate ori au fost codate („&amp;nbsp;" -> spatiu)."""
    s = t or ""
    for _ in range(3):
        nou = html.unescape(s)
        if nou == s:
            break
        s = nou
    return s.replace(" ", " ").replace("​", "")


def punctuatie(t: str) -> str:
    """Spatii si semne de punctuatie, fara sa atinga zecimalele („1,5 kg") sau punctele de suspensie."""
    s = re.sub(r"[ \t]+", " ", t or "")
    s = re.sub(r" +([,;:!?])", r"\1", s)
    s = re.sub(r"(?<=\w) +\.(?=\s|$)", ".", s)
    s = re.sub(r",{2,}", ",", s)
    s = re.sub(PRESCURTARI + r"\.,", ",", s)  # „toppinguri., valabil" (cod scos din mijloc); „CO., LIMITED" ramane
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
    return punctuatie(t)


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
    return punctuatie(fara_date_vechi(fara_entitati(text), an_curent))


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
        ("propozitia veche iese, restul ramane", text_oferta("Reduceri la carti. Pe promotia Black Friday este in intervalul 6-9 noiembrie 2025. Transport gratuit.", 2026), "Reduceri la carti. Transport gratuit."),
    ]
    rele = [(n, a, e) for n, a, e in asteptari if a != e]
    for n, a, e in rele:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rele else f"{len(rele)} asteptari incalcate")
    return 1 if rele else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else 0)
