"""
raport_gsc.py — ce cauta oamenii si unde apare AmCupon in Google (Search Console API, contul de serviciu).

DOAR LOCAL: cheia e in scripts/gsc-key.local.json (pusa de Alex, ignorata de git prin *.local.json), iar iesirea
in data/gsc.local.json. Proprietatea folosita e cea de DOMENIU (sc-domain:amcupon.ro) — vezi CLAUDE.md, 22.08:
rapoartele proprietatii de prefix sunt separate si nu se compara cu acestea.

Ce scoate:
  - totalurile (clicuri, afisari, CTR, pozitia medie) pe perioada;
  - cautarile si paginile cu cele mai multe afisari;
  - OPORTUNITATI: cautari cu afisari unde suntem pe pozitiile 5-20 (o pagina mai buna le poate urca);
  - MAGAZINE CAUTATE PE CARE NU LE AVEM: „cod reducere X" unde X nu e in output.json (lista pentru aplicari).

Rulare:  python raport_gsc.py              # ultimele 90 de zile
         python raport_gsc.py --zile 28
"""
from __future__ import annotations

import io
import json
import os
import re
import sys
import unicodedata
from datetime import date, timedelta

from google.auth.transport.requests import AuthorizedSession
from google.oauth2 import service_account

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHEIE = os.path.join(ROOT, "scripts", "gsc-key.local.json")
IESIRE = os.path.join(ROOT, "data", "gsc.local.json")
OUTPUT = os.path.join(ROOT, "frontend", "public", "output.json")
SITE = "sc-domain:amcupon.ro"
API = "https://www.googleapis.com/webmasters/v3/sites/{}/searchAnalytics/query"

RE_COD = re.compile(r"\b(?:cod(?:uri)?|voucher|cupon|reducere|reduceri|promo\w*)\b")
CUVINTE_GENERICE = {"cod", "coduri", "reducere", "reduceri", "voucher", "vouchere", "cupon", "promo", "promotie",
                    "promotional", "de", "la", "pentru", "si", "2026", "2025", "octombrie", "septembrie", "august",
                    "noiembrie", "ro", "www", "com", "transport", "gratuit", "gratis", "discount", "oferta", "oferte"}


def norm(s: str) -> str:
    return unicodedata.normalize("NFKD", (s or "").lower()).encode("ascii", "ignore").decode().strip()


def sesiune() -> AuthorizedSession:
    cr = service_account.Credentials.from_service_account_file(
        CHEIE, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    return AuthorizedSession(cr)


def interogare(s: AuthorizedSession, start: str, end: str, dimensiuni: list[str], limita: int = 25000) -> list[dict]:
    rez, rand = [], 0
    while True:
        r = s.post(API.format(SITE.replace(":", "%3A")), json={
            "startDate": start, "endDate": end, "dimensions": dimensiuni,
            "rowLimit": min(limita, 25000), "startRow": rand, "dataState": "final"})
        r.raise_for_status()
        randuri = r.json().get("rows", [])
        for x in randuri:
            rez.append({**{d: k for d, k in zip(dimensiuni, x.get("keys", []))},
                        "clicuri": x["clicks"], "afisari": x["impressions"],
                        "ctr": round(x["ctr"] * 100, 1), "pozitie": round(x["position"], 1)})
        if len(randuri) < 25000:
            return rez
        rand += 25000


def magazine_cunoscute() -> set[str]:
    try:
        mag = json.load(io.open(OUTPUT, encoding="utf-8"))
    except OSError:
        return set()
    nume = set()
    for m in mag:
        slug = norm(m.get("magazin", ""))
        nume.add(slug.split(".")[0])
        nume.add(re.sub(r"[^a-z0-9]", "", slug.split(".")[0]))
        n = norm(m.get("nume", ""))
        if n:
            nume.add(re.sub(r"[^a-z0-9]", "", n))
    return {x for x in nume if len(x) >= 3}


def magazin_din_cautare(q: str) -> str:
    """„cod reducere dalisticq" -> „dalisticq"; cautarile fara un nume ramas -> „"."""
    if not RE_COD.search(q):
        return ""
    rest = [w for w in re.split(r"[^a-z0-9.]+", norm(q)) if w and w not in CUVINTE_GENERICE and not w.isdigit()]
    return " ".join(rest)


def main() -> int:
    zile = int(sys.argv[sys.argv.index("--zile") + 1]) if "--zile" in sys.argv else 90
    if not os.path.exists(CHEIE):
        print(f"Lipseste {os.path.relpath(CHEIE, ROOT)}")
        return 1
    end = date.today() - timedelta(days=3)  # datele „final" vin cu 2-3 zile intarziere
    start = end - timedelta(days=zile - 1)
    s = sesiune()
    total = interogare(s, start.isoformat(), end.isoformat(), [])
    cautari = interogare(s, start.isoformat(), end.isoformat(), ["query"])
    pagini = interogare(s, start.isoformat(), end.isoformat(), ["page"])
    perechi = interogare(s, start.isoformat(), end.isoformat(), ["query", "page"])

    t = total[0] if total else {"clicuri": 0, "afisari": 0, "ctr": 0, "pozitie": 0}
    print(f"\nSearch Console, {start} - {end} ({zile} de zile): {t['clicuri']} clicuri, {t['afisari']} afisari, "
          f"CTR {t['ctr']}%, pozitia medie {t['pozitie']}")
    print(f"Cautari distincte: {len(cautari)}; pagini cu afisari: {len(pagini)}")

    def tabel(titlu, randuri, cheie, n=20):
        print(f"\n{titlu}")
        for r in randuri[:n]:
            print(f"  {r['afisari']:5d} afis.  {r['clicuri']:3d} clic.  poz. {r['pozitie']:5.1f}  {r[cheie][:90]}")

    tabel("Cautarile cu cele mai multe afisari:", sorted(cautari, key=lambda r: -r["afisari"]), "query")
    tabel("Paginile cu cele mai multe afisari:", sorted(pagini, key=lambda r: -r["afisari"]), "page")

    oportunitati = sorted((r for r in perechi if 4.5 <= r["pozitie"] <= 20 and r["afisari"] >= 5),
                          key=lambda r: -r["afisari"])
    print("\nOportunitati (pozitia 5-20, cel putin 5 afisari):")
    for r in oportunitati[:20]:
        print(f"  {r['afisari']:5d} afis.  poz. {r['pozitie']:5.1f}  „{r['query'][:50]}”  ->  {r['page'].replace('https://amcupon.ro', '')[:60]}")

    cunoscute = magazine_cunoscute()
    lipsa: dict[str, dict] = {}
    for r in cautari:
        m = magazin_din_cautare(r["query"])
        cheie = re.sub(r"[^a-z0-9]", "", m)
        if not m or len(cheie) < 3 or any(k in cheie or cheie in k for k in cunoscute if len(k) >= 4):
            continue
        x = lipsa.setdefault(m, {"magazin": m, "afisari": 0, "clicuri": 0, "cautari": []})
        x["afisari"] += r["afisari"]
        x["clicuri"] += r["clicuri"]
        x["cautari"].append(r["query"])
    lipsa_sort = sorted(lipsa.values(), key=lambda x: -x["afisari"])
    print("\nMagazine cautate cu „cod reducere” pe care NU le avem (de aplicat la program):")
    for x in lipsa_sort[:25]:
        print(f"  {x['afisari']:5d} afis.  {x['magazin']}")

    io.open(IESIRE, "w", encoding="utf-8").write(json.dumps({
        "site": SITE, "start": start.isoformat(), "end": end.isoformat(), "total": t,
        "cautari": cautari, "pagini": pagini, "perechi": perechi,
        "oportunitati": oportunitati, "magazine_lipsa": lipsa_sort,
    }, ensure_ascii=False, indent=1))
    print(f"\nDetalii: {os.path.relpath(IESIRE, ROOT)} (local, ignorat de git)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
