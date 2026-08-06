"""
check_affiliate_links.py — verifica LIVE daca linkurile de afiliere raspund.

De ce: un link de afiliere poate fi "prezent si bine format" dar mort in realitate
(program inchis, magazin disparut, redirect rupt). Singurul mod de a sti e sa-l ceri
efectiv. Scriptul urmareste redirectul complet si raporteaza statusul FINAL.

Rulare:
  python check_affiliate_links.py --platform profitshare
  python check_affiliate_links.py --platform profitshare --delete-dead
  python check_affiliate_links.py --all

Fara --delete-dead NU modifica nimic — doar raporteaza (mod implicit, sigur).
Cu --delete-dead sterge din data/output.json + data/extra_merchants.json doar
magazinele confirmate MOARTE (status >=400 sau eroare de retea repetata).
Rezultatul complet se scrie mereu in data/link_check_report.json.
"""

import argparse
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE = os.path.join(os.path.dirname(__file__), "..")
FRONTEND_OUTPUT = os.path.join(BASE, "frontend", "public", "output.json")
DATA_OUTPUT = os.path.join(BASE, "data", "output.json")
EXTRA_PATH = os.path.join(BASE, "data", "extra_merchants.json")
REPORT_PATH = os.path.join(BASE, "data", "link_check_report.json")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
TIMEOUT = 20
WORKERS = 8


def check_one(m):
    """Returneaza (magazin, status, final_url, nota). status: int HTTP sau 0 la eroare."""
    url = (m.get("url_afiliat") or "").strip()
    slug = m.get("magazin", "")
    if not url:
        return {"magazin": slug, "status": None, "final_url": "", "nota": "fara url_afiliat"}

    headers = {"User-Agent": UA, "Accept": "text/html,application/xhtml+xml"}
    for attempt in (1, 2):
        try:
            # GET (nu HEAD) — multe redirecte de afiliere ignora/refuza HEAD
            r = requests.get(url, headers=headers, timeout=TIMEOUT,
                             allow_redirects=True, stream=True)
            r.close()
            return {
                "magazin": slug,
                "status": r.status_code,
                "final_url": r.url,
                "nota": "ok" if r.status_code < 400 else "status de eroare",
            }
        except requests.RequestException as e:
            if attempt == 2:
                return {"magazin": slug, "status": 0, "final_url": "",
                        "nota": f"eroare retea: {type(e).__name__}"}
    return {"magazin": slug, "status": 0, "final_url": "", "nota": "necunoscut"}


def load(path):
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--platform", help="Filtreaza pe platforma (ex. profitshare)")
    ap.add_argument("--all", action="store_true", help="Verifica toate magazinele")
    ap.add_argument("--delete-dead", action="store_true",
                    help="Sterge magazinele confirmate moarte (implicit: doar raport)")
    args = ap.parse_args()

    magazine = load(FRONTEND_OUTPUT)
    if not magazine:
        print("[EROARE] nu pot citi frontend/public/output.json")
        return

    if args.platform:
        targets = [m for m in magazine if m.get("platforma") == args.platform]
    elif args.all:
        targets = magazine
    else:
        print("Specifica --platform <nume> sau --all")
        return

    print(f"Verific {len(targets)} linkuri (timeout {TIMEOUT}s, {WORKERS} in paralel)...\n")

    results = []
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(check_one, m): m for m in targets}
        for i, fut in enumerate(as_completed(futures), 1):
            res = fut.result()
            results.append(res)
            mark = "OK " if (res["status"] or 0) and res["status"] < 400 else "MORT"
            print(f"  [{i}/{len(targets)}] {mark} {res['magazin']:28s} {res['status']} {res['nota']}")

    vii = [r for r in results if (r["status"] or 0) and r["status"] < 400]
    morti = [r for r in results if r not in vii]

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump({"verificate": len(results), "vii": len(vii), "morti": len(morti),
                   "rezultate": results}, f, ensure_ascii=False, indent=2)

    print(f"\n=== REZULTAT ===")
    print(f"  Vii  : {len(vii)}")
    print(f"  Morti: {len(morti)}")
    if morti:
        print("  Lista moarte:", ", ".join(r["magazin"] for r in morti))
    print(f"  Raport complet: data/link_check_report.json")

    if not args.delete_dead:
        print("\n(mod raport — nu s-a sters nimic. Adauga --delete-dead ca sa stergi mortii)")
        return

    if not morti:
        print("\nNimic de sters.")
        return

    dead_slugs = {r["magazin"] for r in morti}
    for path in (FRONTEND_OUTPUT, DATA_OUTPUT, EXTRA_PATH):
        data = load(path)
        if not data:
            continue
        before = len(data)
        data = [m for m in data if m.get("magazin") not in dead_slugs]
        if len(data) != before:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  {os.path.relpath(path, BASE)}: {before} -> {len(data)}")

    print(f"\nSters: {len(dead_slugs)} magazine cu link mort.")


if __name__ == "__main__":
    main()
