"""
Datele pentru extensia Chrome AmCupon: frontend/public/extensie.json.

DE CE (24.09.2026): ciorna extensiei din 26.05 descarca output.json (856 KB) la fiecare 6 ore
si isi calcula singura, in JavaScript, linkul si „reducerea":
  · afisa comisionul NOSTRU drept „Cashback pana la X%" — tiparul reparat de 4 ori pe site
    (docs/LECTII-TEHNICE.md #10);
  · trimitea pe linkul de afiliere si la magazinele fara nicio oferta — regula Chrome Web Store
    din 11.03.2025 interzice exact asta („Inserting affiliate links when no discount, cashback,
    or donation is provided");
  · lua `landing_page` inaintea linkului platit.
Aici intra DOAR magazinele cu oferta activa, iar linkul vine din link_oferta.link_iesire() — aceeasi
functie ca la newsletter si alerte: pagina ofertei cu tracking, altfel linkul afiliat, altfel pagina
noastra. Niciodata site-ul magazinului fara comision, niciodata comisionul.

Ruleaza in pipeline, dupa ultimul script care scrie output.json.
  python genereaza_extensie.py
  python genereaza_extensie.py --test
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from link_oferta import are_tracking, link_iesire
from promotii import nume_afisabil, titlu_afisabil

RADACINA = Path(__file__).resolve().parent.parent
OUTPUT = RADACINA / "frontend" / "public" / "output.json"
IESIRE = RADACINA / "frontend" / "public" / "extensie.json"
MAX_OFERTE = 5


def _cod(p: dict) -> str:
    c = p.get("cod_cupon")
    return c.strip() if isinstance(c, str) else ""


def construieste(magazine: list) -> dict:
    rez = {}
    for m in magazine:
        if not isinstance(m, dict):
            continue
        slug = (m.get("magazin") or "").strip().lower()
        promo = [p for p in (m.get("promotii") or []) if isinstance(p, dict)]
        if not slug or "/" in slug or " " in slug or not promo:
            continue
        # codurile intai, apoi ce expira mai curand: e ordinea in care sunt utile acum
        promo.sort(key=lambda p: (not _cod(p), p.get("zile_ramase") if isinstance(p.get("zile_ramase"), int) else 99))
        oferte = []
        for p in promo[:MAX_OFERTE]:
            titlu = titlu_afisabil(p)
            if not titlu:
                continue
            link = link_iesire(m, p)
            exp = p.get("expira")
            oferte.append({
                "titlu": titlu[:140],
                "cod": _cod(p),
                "expira": exp[:10] if isinstance(exp, str) else "",
                "link": link,
                "afiliat": are_tracking(link),
            })
        if oferte:
            rez[slug] = {"nume": nume_afisabil(m),
                         "pagina": f"https://amcupon.ro/cod-reducere/{m['magazin']}",
                         "oferte": oferte}
    return rez


def main() -> int:
    magazine = json.loads(OUTPUT.read_text(encoding="utf-8"))
    rez = construieste(magazine)
    IESIRE.write_text(json.dumps({"generat": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "magazine": rez},
                                 ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    oferte = sum(len(v["oferte"]) for v in rez.values())
    print(f"extensie.json: {len(rez)} magazine, {oferte} oferte, "
          f"{IESIRE.stat().st_size // 1024} KB (output.json: {OUTPUT.stat().st_size // 1024} KB)")
    return 0


def test() -> None:
    platit = "https://event.2performant.com/events/click?ad_type=quicklink&aff_code=x&unique=y&redirect_to=https%3A%2F%2Fa.ro"
    magazine = [
        {"magazin": "a.ro", "url": "https://a.ro", "url_afiliat": platit, "comision": "12%",
         "promotii": [{"nume": "Fara cod", "zile_ramase": 3, "landing_page": "https://a.ro/x"},
                      {"nume": "Cu cod", "cod_cupon": "VARA10", "zile_ramase": 9, "landing_page": "https://a.ro/y"}]},
        {"magazin": "b.ro", "url": "https://b.ro", "url_afiliat": "https://b.ro", "promotii": [
            {"nume": "Oferta fara contract", "landing_page": "https://b.ro/z"}]},
        {"magazin": "c.ro", "url": "https://c.ro", "url_afiliat": platit, "promotii": []},
        {"magazin": "advertisertest.eu/production/test944", "url_afiliat": platit, "promotii": [{"nume": "asd de test"}]},
    ]
    rez = construieste(magazine)
    assert set(rez) == {"a.ro", "b.ro"}, f"magazin fara oferta sau slug invalid a intrat: {set(rez)}"
    assert rez["a.ro"]["oferte"][0]["cod"] == "VARA10", "codul nu e primul"
    assert all("comision" not in o and "cashback" not in json.dumps(o).lower() for v in rez.values() for o in v["oferte"])
    b = rez["b.ro"]["oferte"][0]
    assert b["link"] == "https://amcupon.ro/cod-reducere/b.ro" and b["afiliat"] is False, \
        f"magazinul fara contract trimite pe site-ul lui, nu pe pagina noastra: {b}"
    assert rez["a.ro"]["oferte"][1]["afiliat"] is True
    print("test: toate verificarile au trecut")


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    if "--test" in sys.argv:
        test()
        sys.exit(0)
    sys.exit(main())
