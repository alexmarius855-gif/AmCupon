"""Garda pe TEXT: citeste tot textul vizibil al fiecarei pagini construite si opreste publicarea la o greseala.

06.11.2026, cerinta lui Alex: „vreau fiecare litera a site-ului meu sa fie verificata, ce nu e in regula nu
publicam". verifica_site.py --html verifica structura (titluri, linkuri, promisiuni); garda asta citeste textul.
Prima trecere pe 2.569 de pagini a gasit: „Toate codurile sunt testate" (/radar), „farmaciile online au crescut 200%",
„Tom&nbsp;Ford", „sterilizate,, cu somon", „toppinguri., valabil", „6-9 noiembrie 2025" la Black Friday 2026.
Sursele sunt reparate (scripts/text_curat.py); garda prinde orice drum pe care ar reveni.

Regulile sunt alese sa prinda doar greseli: o garda care da alarme false nu mai e citita de nimeni.

    python verifica_text.py              # pe frontend/.next/server/app (dupa build)
    python verifica_text.py --test       # regulile prind ce trebuie si lasa ce e corect
"""
from __future__ import annotations

import html as H
import io
import os
import re
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from text_curat import AFIRMATIE_FALSA, LUNI, PRESCURTARI, acord_gresit  # noqa: E402


class _Acord:
    """„24 produse" (lipseste „de"), „cele 15 de produse" (e in plus), „1 oferte": aceeasi regula ca lib/acordNumeral.ts."""
    def search(self, linie: str):
        return acord_gresit(linie)

APP = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "frontend", ".next", "server", "app")
INLINE = r"a|span|strong|em|b|i|u|small|sup|sub|mark|abbr|time|code|label|q|s"
AN = datetime.now(timezone.utc).year
ANI_TRECUTI = "|".join(str(a) for a in range(AN - 5, AN))

REGULI = [
    ("valoare tehnica", re.compile(r"\b(undefined|NaN|null|\[object Object\])\b|\{\{|\}\}|\$\{")),
    ("entitate HTML afisata", re.compile(r"&(amp|nbsp|quot|lt|gt|apos|#\d+|#x[0-9a-f]+);", re.I)),
    ("caractere stricate", re.compile(r"Ã[\u0080-¿]|Ä[\u0080-¿]|Å[\u0080-¿]|â€|�|È™|È›")),
    ("punctuatie dubla", re.compile(r"(?<!\.)\.\.(?!\.)|,,|!!|\?\?|;;|" + PRESCURTARI + r"(?<!\.\.)\.,|,\.|: ?,")),
    ("spatiu inainte de punctuatie", re.compile(r"[a-zăâîșțA-ZĂÂÎȘȚ0-9)] +[,.;:!?](?= |$)")),
    # Fara re.I: „Redodopower DE de pe" e eticheta de tara langa „de", nu o greseala.
    ("cuvant de legatura dublat", re.compile(r"\b(de|la|și|si|în|in|pe|cu|al|ale|că|ca|să|sa|nu|un|din|pentru|este|sunt)\s+\1\b")),
    ("afirmatie falsa despre noi", AFIRMATIE_FALSA),
    # Doar unde procentul e o crestere, o scadere sau o reducere: „au crescut 200%" (statistica inventata), „-150%".
    # „800% volum" e numele oficial al unei mascara Lancome, „144% sRGB" o specificatie de ecran.
    ("procent peste 100", re.compile(r"(crescut|scazut|scăzut|mai ieftin\w*|mai scump\w*|reducere|discount|economis\w*|-)\s*(cu |de |de pana la |de până la )?(10[1-9]|1[1-9]\d|[2-9]\d\d|\d{4,})\s*%", re.I)),
    ("acord numeral", _Acord()),
    ("oferta cu an trecut", re.compile(
        rf"(?=[^\n]*\b(promoți|promoti|reducer|Black Friday|campani|discount))[^\n]*\b\d{{1,2}}(?:\s*[-–]\s*\d{{1,2}})?\s+(?:{LUNI})\s+(?:{ANI_TRECUTI})\b", re.I)),
]


def vizibil(h: str) -> str:
    h = re.sub(r"<head[\s\S]*?</head>", " ", h)
    h = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>|<noscript[\s\S]*?</noscript>|<svg[\s\S]*?</svg>|<template[\s\S]*?</template>", " ", h)
    h = re.sub(r"<!--[\s\S]*?-->", "", h)
    h = re.sub(rf"</?(?:{INLINE})\b[^>]*>", "", h)
    h = re.sub(r"<[^>]+>", "\n", h)
    t = H.unescape(h)
    return "\n".join(re.sub(r"[ \t ​]+", " ", l).strip() for l in t.splitlines() if l.strip())


def greseli(text: str) -> list:
    rez = []
    for linie in text.splitlines():
        for nume, rx in REGULI:
            m = rx.search(linie)
            if m:
                rez.append((nume, linie[max(0, m.start() - 60): m.end() + 60]))
    return rez


def verifica(app: str = APP) -> int:
    if not os.path.isdir(app):
        print(f"Lipseste build-ul: {app}")
        return 1
    pe_regula: dict = {}
    pagini = 0
    for d, _, fs in os.walk(app):
        for f in fs:
            if not f.endswith(".html"):
                continue
            rel = os.path.relpath(os.path.join(d, f), app).replace("\\", "/")[:-5]
            if rel.startswith(("_not-found", "_global-error")):
                continue
            pagini += 1
            text = vizibil(io.open(os.path.join(d, f), encoding="utf-8", errors="replace").read())
            for nume, ctx in greseli(text):
                pe_regula.setdefault(nume, []).append(("/" + ("" if rel == "index" else rel), ctx))
    print(f"Text verificat pe {pagini} de pagini.")
    if not pe_regula:
        print("Nicio greseala de text. Site-ul poate fi publicat.")
        return 0
    for nume, l in pe_regula.items():
        print(f"\n  [{nume}] {len(l)} aparitii pe {len({u for u, _ in l})} pagini")
        vazut = set()
        for u, ctx in l:
            if ctx in vazut:
                continue
            vazut.add(ctx)
            print(f"      {u}  |  {ctx}")
            if len(vazut) >= 6:
                break
    print("\n  NU publica pana nu sunt reparate la sursa (scripts/text_curat.py sau textul paginii).")
    return 1


def test() -> int:
    def prinde(t):
        return sorted({n for n, _ in greseli(t)})
    asteptari = [
        ("entitate", prinde("Tom&nbsp;Ford"), ["entitate HTML afisata"]),
        ("virgule duble", prinde("pisici sterilizate,, cu somon"), ["punctuatie dubla"]),
        ("punct si virgula", prinde("toppinguri., valabil intre"), ["punctuatie dubla"]),
        ("puncte de suspensie raman", prinde("si multe altele..."), []),
        ("spatiu inainte de virgula", prinde("EUROCOOL T-PRO , 12000 BTU"), ["spatiu inainte de punctuatie"]),
        ("cuvant dublat", prinde("reduceri de de pana la 50%"), ["cuvant de legatura dublat"]),
        ("nume de produs dublat ramane", prinde("Pachet Lama Lama 5 vol."), []),
        ("afirmatie falsa", prinde("Toate codurile sunt testate; cele cu termen scurt le-am marcat."), ["afirmatie falsa despre noi"]),
        ("intrebarea din FAQ ramane", prinde("Codurile sunt testate?"), []),
        ("raspunsul onest ramane", prinde("Nu le testăm în coș."), []),
        ("verificat de noi", prinde("selectia completa, verificata de noi."), ["afirmatie falsa despre noi"]),
        ("procent inventat", prinde("au crescut 200% in ultimii ani"), ["procent peste 100"]),
        ("specificatie de ecran ramane", prinde("144% sRGB, HDR 400"), []),
        ("100% ramane", prinde("100% online"), []),
        ("oferta cu an trecut", prinde(f"Promotia Black Friday este in intervalul 6-9 noiembrie {AN - 1}."), ["oferta cu an trecut"]),
        ("lege cu an trecut ramane", prinde(f"Din 1 noiembrie {AN - 1}, produsele noi din UE pot avea cel mult 0,3% vitamina A."), []),
        ("oferta anul curent ramane", prinde(f"valabil intre 6 si 13 noiembrie {AN}"), []),
        ("eticheta de tara langa de ramane", prinde("Pe pagina Redodopower DE de pe AmCupon.ro"), []),
        ("regula de bagaj cu an trecut ramane", prinde(f"La Wizz Air dimensiunea e valabilă din 1 noiembrie {AN - 1}, iar greutatea maximă e de 10 kg."), []),
        ("firma cu prescurtare ramane", prinde('Programul ("HK BEIRUI TRADE CO., LIMITED") functioneaza doar pentru SUA.'), []),
        ("numele unui produs cu procent ramane", prinde("Mascara Lash Idôle Curl Goddess | Până la 150% efect de curbare și 800% volum"), []),
        ("reducere imposibila", prinde("Reducere de 150% la toate produsele"), ["procent peste 100"]),
        ("lege despre oferta online ramane", prinde(f"Din 13 decembrie {AN - 2}, regulamentul european cere ca oferta online să arate clar producătorul."), []),
        ("valoare tehnica", prinde("Pret: undefined lei"), ["valoare tehnica"]),
        ("caractere stricate", prinde("Jusqu'Ã  45 % de rÃ©duction"), ["caractere stricate"]),
        ("eticheta fara cod", prinde("USD $224 Off Coupon Code: , For PULUMA PE86"), ["punctuatie dubla"]),
        ("suspensie urmata de virgula ramane", prinde("(La revedere, tabără..., Vine vacanța..., 8 povestiri...)"), []),
        ("lipseste de", prinde("24 produse · 55 zile rămase"), ["acord numeral"]),
        ("de in plus", prinde("Calculat din cele 15 de produse urmarite"), ["acord numeral"]),
        ("acord corect ramane", prinde("55 de zile rămase · 19 produse · 120 de magazine · 105 oferte"), []),
        ("specificatie de produs ramane", prinde("Autonomie 45 ore, varsta 12-36 luni"), []),
        ("text corect", prinde("Mașină de spălat Samsung, 8 kg, 1.299 lei. Livrare gratuită!"), []),
    ]
    rele = [(n, a, e) for n, a, e in asteptari if a != e]
    for n, a, e in rele:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rele else f"{len(rele)} asteptari incalcate")
    return 1 if rele else 0


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(test() if "--test" in sys.argv else verifica(sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else APP))
