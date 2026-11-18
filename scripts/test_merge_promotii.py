"""
Ofertele aceluiasi magazin venite din doua surse nu se mai pierd la merge, iar exportul de promotii se scrie
din API-ul 2Performant (fara export manual). Ruleaza: python scripts/test_merge_promotii.py

Cazul real din 18.11.2026: fera.ro venea din API-ul 2P cu 2 oferte valabile (scor 30) si din
data/extra_merchants.json cu scor 55 si nicio oferta. Dedup-ul pastra intrarea cu scor mare, iar ofertele din
API disparea; pe site ajungeau doar prin exportul CSV facut de mana. Testul ruleaza merge_platforms.main()
pe fisiere construite, intr-un director temporar, si pica pe codul de dinainte.
"""
from __future__ import annotations

import csv
import io
import json
import os
import shutil
import sys
import tempfile
from datetime import datetime, timedelta, timezone

AICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AICI)

erori: list[str] = []


def verifica(cond: bool, mesaj: str) -> None:
    if not cond:
        erori.append(mesaj)


def zi(delta: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=delta)).strftime("%Y-%m-%d")


def magazin(slug: str, scor: float, promotii: list[dict], sursa_link: str = "2p") -> dict:
    return {"magazin": slug, "url": f"https://{slug}",
            "url_afiliat": f"https://event.2performant.com/events/click?ad_type=quicklink&aff_code=541547473&unique=bb3071a7d&redirect_to=https%3A%2F%2F{slug}",
            "platforma": "2performant", "categorie": "Casa & Gradina", "categorie_slug": "casa-gradina",
            "scor_final": scor, "promotii": promotii, "are_promotie": bool(promotii), "cod_cupon": False}


def oferta(nume: str, sursa: str, expira: str, cod: str = "") -> dict:
    return {"nume": nume, "descriere": f"{nume}, la produsele din magazin.", "cod_cupon": cod,
            "landing_page": "", "zile_ramase": 10, "expira": expira, "sursa": sursa}


def ruleaza_merge(fisiere: dict[str, object]) -> list[dict]:
    """merge_platforms.main() intr-un director temporar cu structura repo-ului (scripts/, data/, frontend/public/)."""
    import merge_platforms
    tmp = tempfile.mkdtemp(prefix="merge-")
    try:
        os.makedirs(os.path.join(tmp, "scripts"))
        os.makedirs(os.path.join(tmp, "data"))
        os.makedirs(os.path.join(tmp, "frontend", "public"))
        for rel, continut in fisiere.items():
            with open(os.path.join(tmp, rel), "w", encoding="utf-8") as f:
                json.dump(continut, f, ensure_ascii=False)
        vechi = os.getcwd()
        os.chdir(os.path.join(tmp, "scripts"))
        try:
            iesire = io.StringIO()
            stdout, sys.stdout = sys.stdout, iesire
            try:
                merge_platforms.main()
            finally:
                sys.stdout = stdout
        finally:
            os.chdir(vechi)
        with open(os.path.join(tmp, "frontend", "public", "output.json"), encoding="utf-8") as f:
            return json.load(f)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def test_uneste() -> None:
    from merge_platforms import uneste_promotii
    a = {"promotii": [oferta("Reducere 10% la tot cosul", "2performant_api", zi(10))]}
    b = {"promotii": [oferta("Reducere 10% la tot  cosul!", "csv_import", zi(10)),
                      oferta("Transport gratuit", "csv_import", zi(5))]}
    n = uneste_promotii(a, b)
    verifica(n == 1 and len(a["promotii"]) == 2, f"uneste: aceeasi oferta scrisa altfel nu se dubleaza ({n}, {len(a['promotii'])})")
    c = {"promotii": [oferta("Cod 10%", "2performant_api", zi(3), cod="AAA")]}
    uneste_promotii(c, {"promotii": [oferta("Cod 10%", "csv_import", zi(3), cod="BBB")]})
    verifica(len(c["promotii"]) == 2, "uneste: acelasi titlu cu alt cod sunt doua oferte")
    d = {}
    uneste_promotii(d, {"promotii": None})
    verifica(d.get("promotii") == [], "uneste: fara promotii nu cade")
    # Aceeasi sursa in ambele: lista castigatorului ramane autoritatea (oferta retrasa azi nu revine).
    e = {"promotii": [oferta("Deal A", "impact_deals_api", zi(30))]}
    uneste_promotii(e, {"promotii": [oferta("Deal A", "impact_deals_api", zi(30)),
                                     oferta("Deal retras azi", "impact_deals_api", zi(60))]})
    verifica([p["nume"] for p in e["promotii"]] == ["Deal A"],
             f"uneste: aceeasi sursa nu readuce oferte retrase ({[p['nume'] for p in e['promotii']]})")


def test_merge_cap_coada() -> None:
    api = magazin("fera.ro", 30, [oferta("Până la 25% discount", "2performant_api", zi(11)),
                                  oferta("Reducere de iarna", "2performant_api", zi(70))])
    extra = magazin("fera.ro", 55, [])
    rez = ruleaza_merge({"data/output.json": [api], "data/extra_merchants.json": [extra]})
    fera = next((m for m in rez if m["magazin"] == "fera.ro"), None)
    nume = sorted(p["nume"] for p in (fera or {}).get("promotii") or [])
    verifica(fera is not None and len(nume) == 2, f"merge: ofertele din API raman pe magazin ({nume})")
    verifica(bool(fera and fera.get("are_promotie")), "merge: magazinul cu oferte are are_promotie")
    # Invers: intrarea din API castiga, iar oferta din extra (alta, valabila) ramane si ea.
    api2 = magazin("nobilacasa.ro", 60, [oferta("REDUCERI COMBO", "2performant_api", zi(40))])
    extra2 = magazin("nobilacasa.ro", 10, [oferta("Black Friday Nobila Casa", "csv_import", zi(9))])
    rez2 = ruleaza_merge({"data/output.json": [api2], "data/extra_merchants.json": [extra2]})
    nc = next((m for m in rez2 if m["magazin"] == "nobilacasa.ro"), {})
    verifica(len(nc.get("promotii") or []) == 2, f"merge: ofertele ambelor surse raman ({[p['nume'] for p in nc.get('promotii') or []]})")


def test_csv_din_api() -> None:
    from fetch_2p_api import COLOANE_CSV_PROMOTII, randuri_csv_promotii
    acum = datetime(2026, 11, 18, 12, tzinfo=timezone.utc)
    brute = [
        {"name": "Black Friday Sevensins 2026: -50%", "affrequest_status": "accepted", "status": "published",
         "promotion_start": "2026-10-31T00:00:00.000+02:00", "promotion_end": "2026-11-30T00:00:00.000+02:00",
         "customer_description": "Reduceri la toate produsele.", "coupon": "",
         "landing_page_link": "https://sevensins.ro/", "program": {"name": "sevensins.ro", "slug": "sevensins-ro"}},
        {"name": "Programata", "affrequest_status": "accepted", "status": "published",
         "promotion_start": "2026-11-20T06:00:00Z", "promotion_end": "2026-11-30T08:00:00Z",
         "customer_description": "", "coupon": "BF26", "landing_page_link": "https://doctorshield.ro/",
         "program": {"name": "doctorshield.ro/", "slug": "doctorshield-ro"}},
        {"name": "Terminata", "affrequest_status": "accepted", "status": "published",
         "promotion_start": "2026-10-01T00:00:00Z", "promotion_end": "2026-11-10T00:00:00Z",
         "program": {"name": "x.ro"}},
        {"name": "Program la care n-am aplicat", "affrequest_status": "not_applied", "status": "published",
         "promotion_start": "2026-11-01T00:00:00Z", "promotion_end": "2026-12-10T00:00:00Z",
         "program": {"name": "y.ro"}},
    ]
    r = randuri_csv_promotii(brute, acum)
    nume = [x["Promotion name"] for x in r]
    verifica(nume == ["Programata", "Black Friday Sevensins 2026: -50%"],
             f"csv din API: doar programele acceptate si ofertele neterminate, inclusiv programate ({nume})")
    verifica(all(list(x.keys()) == COLOANE_CSV_PROMOTII for x in r), "csv din API: coloanele exportului manual")
    prog = next(x for x in r if x["Promotion name"] == "Programata")
    verifica(prog["Start Date"] == "2026-11-20 06:00:00 UTC" and prog["Coupon code"] == "BF26",
             f"csv din API: data in formatul exportului ({prog['Start Date']})")
    sev = next(x for x in r if x["Promotion name"].startswith("Black Friday"))
    verifica(sev["End Date"] == "2026-11-29 22:00:00 UTC", f"csv din API: ora Romaniei -> UTC ({sev['End Date']})")
    # Ce scrie trebuie sa citeasca la fel importul existent (aceleasi functii de data).
    from promotii import sfarsit_real
    verifica(sfarsit_real(sev["End Date"]).strftime("%Y-%m-%d %H:%M") == "2026-11-30 23:59",
             "csv din API: ultima zi ramane 30.11, toata ziua")
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=COLOANE_CSV_PROMOTII, lineterminator="\n")
    w.writeheader()
    w.writerows(r)
    citit = list(csv.DictReader(io.StringIO(buf.getvalue())))
    verifica(len(citit) == 2 and citit[0]["Affiliate program"] == "doctorshield.ro/", "csv din API: se citeste inapoi")


if __name__ == "__main__":
    test_uneste()
    test_merge_cap_coada()
    test_csv_din_api()
    for e in erori:
        print("PICA:", e)
    print("test_merge_promotii:", "OK" if not erori else f"{len(erori)} erori")
    sys.exit(1 if erori else 0)
