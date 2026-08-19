#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CURATA RETELELE EXCLUSE din toate fisierele de date.
====================================================

Sterge magazinele, produsele si articolele care apartin retelelor din
`retele_excluse.py` (azi: Profitshare — cont respins 19.08.2026).

E REUTILIZABIL si IDEMPOTENT: se poate rula oricand, iar a doua rulare nu mai
gaseste nimic de sters. Garda permanenta din `merge_platforms.py` impiedica
reaparitia lor la rularile viitoare ale pipeline-ului; scriptul asta curata ce
exista deja pe disc.

    python scripts/curata_retele_excluse.py            # curata
    python scripts/curata_retele_excluse.py --dry-run  # doar raporteaza
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from retele_excluse import este_magazin_exclus, este_produs_exclus, RE_LINK_EXCLUS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


def _citeste(cale: Path):
    try:
        return json.loads(cale.read_text(encoding="utf-8"))
    except Exception:
        return None


def _scrie(cale: Path, date, dry: bool) -> None:
    if dry:
        return
    cale.write_text(json.dumps(date, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description="Curata retelele excluse din date")
    ap.add_argument("--dry-run", action="store_true", help="doar raporteaza, nu scrie")
    args = ap.parse_args()

    print(f"\n{'=' * 62}\n  CURATARE RETELE EXCLUSE{'  [DRY-RUN]' if args.dry_run else ''}\n{'=' * 62}\n")

    # ── 1. Fisierele de magazine ─────────────────────────────────────────────
    sluguri_excluse: set[str] = set()
    for rel in ["frontend/public/output.json", "data/output.json", "data/extra_merchants.json"]:
        cale = ROOT / rel
        date = _citeste(cale)
        if not isinstance(date, list):
            print(f"  {rel:42} (lipsa sau alt format — skip)")
            continue
        pastrate = []
        for m in date:
            if isinstance(m, dict) and este_magazin_exclus(m):
                sluguri_excluse.add((m.get("magazin") or "").strip())
            else:
                pastrate.append(m)
        sterse = len(date) - len(pastrate)
        _scrie(cale, pastrate, args.dry_run)
        print(f"  {rel:42} {len(date):5} -> {len(pastrate):5}  (-{sterse})")

    sluguri_excluse.discard("")
    print(f"\n  Magazine excluse, distincte: {len(sluguri_excluse)}")
    if sluguri_excluse:
        prime = sorted(sluguri_excluse)[:8]
        print(f"    {', '.join(prime)}{' ...' if len(sluguri_excluse) > 8 else ''}\n")

    # ── 2. Produsele ─────────────────────────────────────────────────────────
    cale_p = ROOT / "frontend/public/products.json"
    date_p = _citeste(cale_p)
    if isinstance(date_p, dict) and isinstance(date_p.get("products"), list):
        vechi = date_p["products"]
        noi = [x for x in vechi if not este_produs_exclus(x, sluguri_excluse)]
        date_p["products"] = noi
        date_p["count"] = len(noi)
        _scrie(cale_p, date_p, args.dry_run)
        print(f"  {'frontend/public/products.json':42} {len(vechi):5} -> {len(noi):5}  (-{len(vechi) - len(noi)})")

    # ── 3. Fisiere derivate: liste de magazine sau de produse ────────────────
    # Se regenereaza oricum la urmatorul pipeline, dar le curatam ca site-ul sa
    # fie corect IMEDIAT, nu peste 4 ore.
    for rel in ["frontend/public/products-home.json", "frontend/public/recomandate.json",
                "frontend/public/nav-index.json", "frontend/public/digest-today.json",
                "frontend/public/blog-latest.json", "frontend/public/blog-posts.json",
                "frontend/public/studiu-cupoane.json", "data/price_alert_snapshot.json",
                "data/social-content.json"]:
        cale = ROOT / rel
        date = _citeste(cale)
        if date is None:
            continue

        def curata(valoare):
            """Elimina recursiv orice element care trimite catre o retea exclusa."""
            if isinstance(valoare, list):
                pastrate = []
                for el in valoare:
                    if isinstance(el, dict):
                        slug = (el.get("magazin") or el.get("merchant_slug")
                                or el.get("slug") or el.get("store") or "")
                        text = json.dumps(el, ensure_ascii=False)
                        if slug in sluguri_excluse or RE_LINK_EXCLUS.search(text):
                            continue
                        pastrate.append(curata(el))
                    else:
                        pastrate.append(curata(el))
                return pastrate
            if isinstance(valoare, dict):
                if set(valoare.keys()) & sluguri_excluse:
                    valoare = {k: v for k, v in valoare.items() if k not in sluguri_excluse}
                return {k: curata(v) for k, v in valoare.items()}
            return valoare

        inainte = json.dumps(date, ensure_ascii=False)
        curatat = curata(date)
        dupa = json.dumps(curatat, ensure_ascii=False)
        if inainte != dupa:
            _scrie(cale, curatat, args.dry_run)
            print(f"  {rel:42} curatat  (-{(len(inainte) - len(dupa)) // 1024} KB)")

    print(f"\n  {'Nimic scris (dry-run).' if args.dry_run else 'Gata.'} "
          f"Garda permanenta e in merge_platforms.py.\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
