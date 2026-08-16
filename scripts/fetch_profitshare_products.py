#!/usr/bin/env python3
"""
Produse din Profitshare — a doua sursa de continut propriu pentru paginile de magazin.

DE CE (masurat 16.08.2026): din 1.162 de pagini de magazin, doar **87** sunt
indexabile. O pagina merita indexare doar daca are continut propriu — promotie
activa sau produse. Restul sunt 77-89% identice intre ele (masurat direct pe HTML),
deci deschiderea lor ar reintroduce exact problema de thin content care a cauzat
criza de indexare din 10.08. Parghia nu e sa deschidem pagini, ci sa le facem sa
merite. Singura sursa de produse de pana acum era 2Performant (~20 magazine reale).

CE AM AFLAT SONDAND API-UL (`probe_profitshare_products.py`, doua runde):
  * endpoint-ul e `affiliate-products`, exista si raspunde;
  * catalogul e URIAS: 17.220 pagini x 20 = ~344.000 de produse;
  * campurile sunt mai bune decat la 2P — categorie in ROMANA, `affiliate_link`
    deja cu tracking, `free_shipping`, `price_discounted`;
  * **NU se poate filtra pe magazin.** Testate 6 nume de parametru (advertiser,
    advertiser_id, advertisers, id, filter[advertiser], advertiser_ids) — toate
    intorc acelasi prim bloc, ignorand cererea. Verificat in raspuns, nu presupus:
    am cerut eMAG (id 35) si am primit constant Anvelino (165505).
  * **produsele sunt GRUPATE pe magazin.** 40 de pagini consecutive au dat doar
    3 magazine distincte (741 FashionDays, 58 Anvelino, 1 Vexio).

STRATEGIA, care iese exact din constatarea de mai sus: gruparea face parcurgerea
secventiala inutila (ore intregi ca sa ajungi la al 60-lea magazin), dar face
esantionarea eficienta. Deci:
  Faza 1 — scanare rara, din PAS in PAS pagini, ca sa aflam ce magazin sta unde.
  Faza 2 — pentru fiecare magazin gasit, citim un bloc mic de pagini consecutive.

Costul: ~PROBE_MAX + (magazine x PAGINI_PER_MAGAZIN) cereri, marginit explicit,
in loc de 17.220.

LIMITA, declarata pentru ca cineva o va observa in date: un magazin al carui bloc
e mai mic decat pasul de esantionare poate fi ratat. E un compromis constient
intre acoperire si timp, nu o scapare. Se poate reduce PAS pe rularea de dimineata
daca vrem acoperire mai buna.

    python scripts/fetch_profitshare_products.py [--dry-run]
"""
import json
import re
import sys
import time
from pathlib import Path

try:
    from process_profitshare import ps_get
except ImportError:
    print("Ruleaza din scripts/ (process_profitshare.py trebuie sa fie langa).")
    sys.exit(1)

ENDPOINT = "affiliate-products"
IESIRE = Path(__file__).parent.parent / "data" / "profitshare_products.json"

PAS = 120                 # din cate in cate pagini esantionam in faza 1
PROBE_MAX = 150           # cereri maxime in faza 1
PAGINI_PER_MAGAZIN = 8    # cate pagini citim per magazin gasit (8 x 20 = 160 produse)
PAUZA = 0.25              # politete fata de API

# Magazine straine — AmCupon e pentru cumparatori din Romania (aceeasi regula ca
# in fetch_product_feeds.py, unde lipsa lui ".nl" a lasat liki24.nl sa intre)
TLD_STRAINE = (".hu", ".pl", ".bg", ".gr", ".cz", ".sk", ".ua", ".md", ".rs",
               ".hr", ".si", ".nl", ".be", ".de", ".fr", ".it", ".es", ".pt",
               ".at", ".ch", ".se", ".dk", ".fi", ".no", ".ie", ".tr")


def pagina(nr: int):
    r = ps_get(ENDPOINT, {"page": nr, "results_per_page": 20})
    if not isinstance(r, dict):
        return [], None
    rez = r.get("result", {}) or {}
    return rez.get("products", []) or [], rez.get("total_pages")


def slug_din(produs) -> str:
    """Slug de domeniu din numele advertiserului, ca in merge_platforms.domain_slug."""
    nume = (produs.get("advertiser_name") or "").strip().lower().rstrip("/")
    return re.sub(r"[^a-z0-9.-]", "", nume)


def curata(p, slug):
    pret = p.get("price_vat") or p.get("price") or 0
    try:
        pret = float(pret)
    except (TypeError, ValueError):
        pret = 0.0
    redus = p.get("price_discounted")
    try:
        redus = float(redus) if redus not in ("", None) else None
    except (TypeError, ValueError):
        redus = None
    link = p.get("affiliate_link") or p.get("link") or ""
    if link.startswith("//"):
        link = "https:" + link          # API-ul intoarce link protocol-relative
    return {
        "title": (p.get("name") or "")[:120],
        "url": link,
        "url_original": p.get("link") or "",
        "image": p.get("image_original") or p.get("image") or "",
        "price": round(pret, 2),
        "old_price": round(redus, 2) if redus and redus > pret else None,
        "discount_pct": round((1 - pret / redus) * 100) if redus and redus > pret > 0 else 0,
        "category": (p.get("category_name") or "")[:60],
        "brand": (p.get("brand_name") or "")[:50],
        "merchant": p.get("advertiser_name") or "",
        "merchant_slug": slug,
        "sursa": "profitshare",
    }


def main():
    dry = "--dry-run" in sys.argv
    print("=" * 66)
    print("Produse Profitshare — esantionare + citire pe blocuri")
    print("=" * 66)

    prod, total = pagina(1)
    if not prod:
        print("Endpoint-ul nu raspunde. Nu s-a scris nimic.")
        return 1
    total = total or 1
    print(f"Catalog: {total} pagini (~{total * 20:,} produse)")

    # ── Faza 1: unde sta fiecare magazin ────────────────────────────────────
    harta = {}                       # slug -> prima pagina la care l-am vazut
    nume_real = {}
    probe = 0
    for nr in range(1, total + 1, PAS):
        if probe >= PROBE_MAX:
            break
        pp, _ = pagina(nr)
        probe += 1
        for p in pp:
            s = slug_din(p)
            if s and s not in harta:
                harta[s] = nr
                nume_real[s] = p.get("advertiser_name") or s
        time.sleep(PAUZA)
    print(f"Faza 1: {probe} cereri (din {PAS} in {PAS} pagini) -> {len(harta)} magazine gasite")

    straine = [s for s in harta if s.endswith(TLD_STRAINE)]
    for s in straine:
        del harta[s]
    if straine:
        print(f"  sarite ca magazine straine: {len(straine)} ({', '.join(straine[:5])})")

    # ── Faza 2: cate un bloc mic din fiecare ────────────────────────────────
    produse = []
    for s, start in sorted(harta.items(), key=lambda x: x[1]):
        luate = 0
        for k in range(PAGINI_PER_MAGAZIN):
            pp, _ = pagina(start + k)
            if not pp:
                break
            ale_lui = [p for p in pp if slug_din(p) == s]
            if not ale_lui:
                break                # am iesit din blocul magazinului
            produse.extend(curata(p, s) for p in ale_lui)
            luate += len(ale_lui)
            time.sleep(PAUZA)
        print(f"  {nume_real.get(s, s):28s} {luate:4d} produse")

    pe_magazin = {}
    for p in produse:
        pe_magazin[p["merchant_slug"]] = pe_magazin.get(p["merchant_slug"], 0) + 1

    print("")
    print(f"TOTAL: {len(produse):,} produse din {len(pe_magazin)} magazine Profitshare")

    if dry:
        print("(--dry-run: nu s-a scris nimic)")
        return 0

    IESIRE.parent.mkdir(parents=True, exist_ok=True)
    IESIRE.write_text(json.dumps({"produse": produse}, ensure_ascii=False), encoding="utf-8")
    print(f"Scris: {IESIRE}")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
