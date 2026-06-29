"""
import_csv_promotii.py — Importa promotii din CSV 2Performant in output.json
=============================================================================
Citeste CSV-ul exportat din dashboard-ul 2Performant (Promotions > Export)
si adauga promotiile in output.json, potrivindu-le cu magazinele existente.

Rulare:
  python scripts/import_csv_promotii.py
  python scripts/import_csv_promotii.py --csv "C:/Users/alexm/Downloads/promotions (4).csv"
  python scripts/import_csv_promotii.py --dry-run   (nu salveaza, doar afiseaza)

CSV headers asteptate:
  Affiliate program, Promotion name, Start Date, End Date,
  Description (for affiliate), Description (for customer), Coupon code,
  Landing Page, Benefits & Tools
"""

import argparse
import csv
import json
import os
import re
import sys
import random
from datetime import datetime, timezone

# Fix encoding pentru terminal Windows (suport diacritice romane)
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf-8-sig"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


# ─── Config ──────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT  = os.path.dirname(SCRIPT_DIR)
OUTPUT_JSON = os.path.join(REPO_ROOT, "frontend", "public", "output.json")

# CSV persistent in repo (rulat de pipeline). Alex inlocuieste fisierul cand
# exporta o lista noua din 2Performant. Daca lipseste, --csv il poate suprascrie.
DEFAULT_CSV = os.path.join(REPO_ROOT, "data", "promotii_2p.csv")

# ─── Quicklink 2Performant (vezi CLAUDE.md) ──────────────────────────────────
# unique TREBUIE sa fie token-ul real al afiliatului, universal pt toate magazinele.
from urllib.parse import quote
AFF_CODE = "541547473"
QUICKLINK_UNIQUE = "bb3071a7d"


def build_quicklink(target_url: str) -> str:
    """Construieste link afiliat 2P care redirecteaza catre target_url."""
    if not target_url:
        return ""
    if not target_url.startswith("http"):
        target_url = "https://" + target_url
    return (
        "https://event.2performant.com/events/click?ad_type=quicklink"
        f"&aff_code={AFF_CODE}&unique={QUICKLINK_UNIQUE}"
        f"&redirect_to={quote(target_url, safe='')}"
    )


# ─── Ghicire categorie din slug/nume (pt magazine noi din CSV) ───────────────
_CAT_KEYWORDS = [
    ("fashion", ["incaltaminte", "sneaker", "moda", "fashion", "pantofi", "haine",
                 "imbracaminte", "rochii", "trendiva", "trendyup", "regata", "janta",
                 "geanta", "lenjerie", "femieko"]),
    ("beauty", ["farmec", "cosmetic", "beauty", "yves-rocher", "hairify", "par",
                "machiaj", "parfum", "pickndazzle", "manuka", "skincare", "frumusete"]),
    ("health-personal-care", ["optic", "optiblu", "grandeoptique", "ochelari",
                              "sanoverde", "sano", "niculescu", "farma", "vitamin"]),
    ("home-garden", ["mobila", "mobil", "laguna", "home", "casa", "gradina", "decor",
                     "prestigehome", "paa-home", "vidaxl", "vetro", "obio"]),
    ("electronics-itc", ["gsm", "telefon", "electro", "pc", "laptop", "tech",
                         "interlink", "ookee", "videt"]),
    ("babies-kids-toys", ["copii", "jucarii", "bebe", "kids", "giftdesign"]),
    ("sports-outdoors", ["sport", "sportera", "fitness", "outdoor"]),
    ("books", ["carte", "carti", "libr", "book"]),
]


def guess_category(slug: str, nume: str) -> tuple:
    """Returneaza (categorie_label, categorie_slug) ghicit din slug/nume."""
    text = f"{slug} {nume}".lower()
    labels = {
        "fashion": "Fashion", "beauty": "Beauty",
        "health-personal-care": "Sanatate & Ingrijire",
        "home-garden": "Casa & Gradina", "electronics-itc": "Electronice IT&C",
        "babies-kids-toys": "Copii & Jucarii", "sports-outdoors": "Sport",
        "books": "Carti", "online-mall": "Online Mall",
    }
    for cat_slug, kws in _CAT_KEYWORDS:
        if any(k in text for k in kws):
            return labels[cat_slug], cat_slug
    return labels["online-mall"], "online-mall"


# ─── Utilitare slug ──────────────────────────────────────────────────────────

def norm_slug(s: str) -> str:
    """Normalizeaza un domain/slug: sterge www., trailing slash, spatii."""
    s = s.strip().lower()
    s = s.rstrip("/")
    s = re.sub(r"^https?://", "", s)
    s = re.sub(r"^www\.", "", s)
    return s


def slug_variants(slug: str) -> list:
    """Genereaza variante de matching pentru un slug."""
    s = norm_slug(slug)
    base = s.split(".")[0]  # "libris" din "libris.ro"
    variants = [s, base]
    # Cu / fara TLD
    if "." in s:
        variants.append(s.split(".")[0])
    # Fara spatii
    variants.append(s.replace(" ", ""))
    return list(dict.fromkeys(v for v in variants if v))


# ─── Parsare CSV ─────────────────────────────────────────────────────────────

def parse_csv(csv_path: str) -> list:
    """Citeste CSV-ul si returneaza lista de dict-uri normalizate."""
    if not os.path.exists(csv_path):
        print(f"  EROARE: Fisierul nu exista: {csv_path}")
        return []

    promotii = []
    now = datetime.now(timezone.utc)

    # Detecteaza encoding
    raw_bytes = open(csv_path, "rb").read(4096)
    encoding  = "utf-8-sig" if raw_bytes[:3] == b"\xef\xbb\xbf" else "utf-8"

    try:
        with open(csv_path, encoding=encoding, errors="replace", newline="") as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames or []
            print(f"  CSV headers: {headers}")

            for i, row in enumerate(reader):
                # Normalizeaza cheile (strip whitespace)
                row = {k.strip(): v.strip() for k, v in row.items() if k}

                affiliate = row.get("Affiliate program", "") or ""
                if not affiliate:
                    continue

                slug_magazin = norm_slug(affiliate)
                if not slug_magazin:
                    continue

                # Dati
                end_raw = row.get("End Date", "") or ""
                zile_ramase = 99
                expira_str  = ""
                if end_raw:
                    try:
                        # Format: "2026-06-10 20:45:00 UTC"
                        end_clean = end_raw.replace(" UTC", "+00:00").replace(" ", "T", 1)
                        end_dt    = datetime.fromisoformat(end_clean)
                        if end_dt.tzinfo is None:
                            end_dt = end_dt.replace(tzinfo=timezone.utc)
                        delta = (end_dt - now).days
                        if delta < 0:
                            # Promotia a expirat — skip
                            continue
                        zile_ramase = max(0, delta)
                        expira_str  = end_dt.strftime("%Y-%m-%d")
                    except Exception:
                        pass

                # Descriere: prefer "for customer", fallback "for affiliate" (mai scurta)
                desc_client   = row.get("Description (for customer)", "") or ""
                desc_afiliat  = row.get("Description (for affiliate)", "") or ""
                descriere = desc_client if desc_client else desc_afiliat
                # Curata descrierea — sterge newlines multiple, limiteaza la 500 chars
                descriere = re.sub(r"\n{3,}", "\n\n", descriere).strip()[:500]

                cod_cupon    = (row.get("Coupon code", "") or "").strip()
                landing_page = (row.get("Landing Page", "") or "").strip()
                nume_promo   = (row.get("Promotion name", "") or "").strip()

                if not nume_promo:
                    continue

                promotii.append({
                    "slug_magazin": slug_magazin,
                    "promotie": {
                        "nume":         nume_promo[:200],
                        "descriere":    descriere,
                        "cod_cupon":    cod_cupon,
                        "landing_page": landing_page,
                        "zile_ramase":  zile_ramase,
                        "expira":       expira_str,
                        "sursa":        "csv_import",
                    }
                })

    except Exception as e:
        print(f"  EROARE citire CSV: {e}")
        import traceback
        traceback.print_exc()

    return promotii


# ─── Matching & merge ─────────────────────────────────────────────────────────

def find_magazin(magazine: list, slug_target: str) -> int | None:
    """Gaseste indexul magazinului in lista, sau None."""
    variants = slug_variants(slug_target)
    for idx, mag in enumerate(magazine):
        mag_slug = norm_slug(mag.get("magazin", ""))
        mag_vars = slug_variants(mag_slug)
        # Verifica daca orice varianta se potriveste
        for v in variants:
            if v in mag_vars or any(v == mv for mv in mag_vars):
                return idx
    return None


def is_duplicate(existing_promotii: list, promotie_noua: dict) -> bool:
    """Verifica daca o promotie identica exista deja."""
    cod_nou = promotie_noua.get("cod_cupon", "").upper()
    nume_nou = promotie_noua.get("nume", "").lower()

    for p in existing_promotii:
        # Duplicate dupa cod
        cod_ex = (p.get("cod_cupon", "") or "").upper()
        if cod_nou and cod_ex and cod_nou == cod_ex:
            return True
        # Duplicate dupa nume (similaritate)
        nume_ex = (p.get("nume", "") or "").lower()
        if len(nume_nou) > 10 and len(nume_ex) > 10:
            # Daca 80% din cuvinte coincid, e duplicat
            w_nou = set(re.split(r"\W+", nume_nou))
            w_ex  = set(re.split(r"\W+", nume_ex))
            if len(w_nou & w_ex) / max(len(w_nou), 1) > 0.8:
                return True
    return False


def recalculeaza_flags(mag: dict) -> dict:
    """Recalculeaza are_promotie, cod_cupon, zile_ramase, scor_final."""
    promotii = mag.get("promotii", []) or []
    mag["are_promotie"] = len(promotii) > 0
    mag["cod_cupon"]    = any(p.get("cod_cupon") for p in promotii)
    mag["zile_ramase"]  = min(
        (p.get("zile_ramase", 99) for p in promotii), default=99
    )
    # Update folosit_de (pseudo-random stabil per magazin)
    if mag["are_promotie"] and mag.get("folosit_de", 0) == 0:
        slug = mag.get("magazin", "")
        rng  = random.Random(abs(hash(slug)) % 99991)
        mag["folosit_de"] = rng.randint(15, 800)
    # Scor final simplu
    scor = 0.0
    if mag["are_promotie"]:  scor += 30
    if mag["cod_cupon"]:     scor += 20
    if 0 < mag["zile_ramase"] <= 3: scor += 10
    mag["scor_final"] = scor
    return mag


def make_magazin_nou(slug: str, promotie: dict) -> dict:
    """Creeaza o intrare de magazin cu LINK AFILIAT 2P real pentru unul nou."""
    domain = slug if "." in slug else f"{slug}.ro"
    home = f"https://{domain}"
    # Link afiliat 2P: redirect catre landing page-ul promotiei daca exista, altfel homepage
    target = promotie.get("landing_page") or home
    url_afiliat = build_quicklink(target)
    cat_label, cat_slug = guess_category(slug, promotie.get("nume", ""))
    rng = random.Random(abs(hash(slug)) % 99991)
    return {
        "magazin":          domain,
        "url":              home,
        "url_afiliat":      url_afiliat,
        "logo_url":         "",
        "categorie":        cat_label,
        "categorie_slug":   cat_slug,
        "comision":         "",
        "rank":             999,
        "scor_afiliere":    0,
        "prioritate":       "medium",
        "canal_recomandat": "Coupon, Content",
        "sales_number":     0,
        "trend":            0,
        "are_promotie":     True,
        "cod_cupon":        bool(promotie.get("cod_cupon")),
        "zile_ramase":      promotie.get("zile_ramase", 99),
        "promotii":         [promotie],
        "folosit_de":       rng.randint(15, 400),
        "procent_succes":   rng.randint(72, 92),
        "exclusiv":         bool(promotie.get("cod_cupon")),
        "platforma":        "2performant",
        "ultima_verificare": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "scor_final":       50.0 if promotie.get("cod_cupon") else 30.0,
        "program_id":       "",
        "unique_code":      "",
        "sursa_import":     "csv",
    }


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Import promotii din CSV in output.json")
    parser.add_argument("--csv",     default=DEFAULT_CSV, help="Calea catre fisierul CSV")
    parser.add_argument("--dry-run", action="store_true", help="Nu salveaza, doar afiseaza")
    args = parser.parse_args()

    print("=" * 60)
    print("import_csv_promotii.py")
    print("=" * 60)
    print(f"  CSV:    {args.csv}")
    print(f"  Output: {OUTPUT_JSON}")
    print(f"  Mode:   {'DRY RUN' if args.dry_run else 'LIVE'}")
    print()

    # ── 1. Citeste CSV ────────────────────────────────────────────────────────
    print("[1/4] Parsez CSV...")
    promotii_csv = parse_csv(args.csv)
    print(f"  {len(promotii_csv)} promotii gasite in CSV")

    if not promotii_csv:
        print("  Nicio promotie de importat. Iesire.")
        return

    # Statistici CSV
    cu_cod = sum(1 for p in promotii_csv if p["promotie"].get("cod_cupon"))
    slugs_unice = set(p["slug_magazin"] for p in promotii_csv)
    print(f"  Magazine unice: {len(slugs_unice)}")
    print(f"  Cu cod cupon:   {cu_cod}")
    print(f"  Sluguri: {sorted(slugs_unice)[:10]}...")

    # ── 2. Citeste output.json ────────────────────────────────────────────────
    print("\n[2/4] Incarc output.json...")
    if not os.path.exists(OUTPUT_JSON):
        print(f"  EROARE: {OUTPUT_JSON} nu exista!")
        sys.exit(1)

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)
    print(f"  {len(magazine)} magazine existente")

    # ── 3. Merge ──────────────────────────────────────────────────────────────
    print("\n[3/4] Merge promotii...")
    stats = {
        "adaugate":         0,
        "duplicate_skip":   0,
        "magazin_nou":      0,
        "magazin_existent": 0,
        "not_found_skip":   0,
    }
    not_found = []

    noi_by_slug: dict[str, int] = {}  # slug -> index in `magazine` pt magazine noi create

    for item in promotii_csv:
        slug     = item["slug_magazin"]
        promotie = item["promotie"]
        idx      = find_magazin(magazine, slug)

        if idx is not None:
            # Magazin gasit — adauga promotia
            mag = magazine[idx]
            if not is_duplicate(mag.get("promotii", []), promotie):
                if "promotii" not in mag or mag["promotii"] is None:
                    mag["promotii"] = []
                mag["promotii"].append(promotie)
                magazine[idx] = recalculeaza_flags(mag)
                stats["adaugate"] += 1
                stats["magazin_existent"] += 1
                if args.dry_run:
                    cod = promotie.get("cod_cupon", "")
                    print(f"  + {mag['magazin']}: '{promotie['nume'][:50]}'"
                          + (f" [COD: {cod}]" if cod else ""))
            else:
                stats["duplicate_skip"] += 1
        elif slug in noi_by_slug:
            # Magazin nou deja creat in aceasta rulare — adauga inca o promotie
            mag = magazine[noi_by_slug[slug]]
            if not is_duplicate(mag.get("promotii", []), promotie):
                mag["promotii"].append(promotie)
                magazine[noi_by_slug[slug]] = recalculeaza_flags(mag)
                stats["adaugate"] += 1
        else:
            # Magazin nou: il cream cu link afiliat 2P real (program acceptat in 2P)
            mag_nou = make_magazin_nou(slug, promotie)
            magazine.append(mag_nou)
            noi_by_slug[slug] = len(magazine) - 1
            stats["magazin_nou"] += 1
            stats["adaugate"] += 1
            not_found.append(mag_nou["magazin"])

    print(f"\n  Promotii adaugate:   {stats['adaugate']}")
    print(f"  Magazine noi create: {stats['magazin_nou']}")
    print(f"  Duplicate (skip):    {stats['duplicate_skip']}")

    if not_found:
        print(f"\n  Magazine NOI adaugate din CSV (cu link afiliat 2P):")
        for s in sorted(set(not_found)):
            print(f"    + {s}")

    # ── 4. Salveaza ──────────────────────────────────────────────────────────
    if args.dry_run:
        print("\n[4/4] DRY RUN — nu s-a salvat nimic.")
        return

    print("\n[4/4] Salvez output.json...")
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(magazine, f, ensure_ascii=False, indent=2)

    cu_promotii = sum(1 for m in magazine if m.get("are_promotie"))
    cu_cod_final = sum(1 for m in magazine if m.get("cod_cupon"))

    print(f"\n{'=' * 60}")
    print(f"GATA! output.json actualizat.")
    print(f"  Total magazine:       {len(magazine)}")
    print(f"  Cu promotii:          {cu_promotii}")
    print(f"  Cu cod cupon:         {cu_cod_final}")
    print(f"  Promotii adaugate:    {stats['adaugate']}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nIntrerupt de utilizator.")
    except Exception as e:
        import traceback
        print(f"\nFATAL: {e}")
        traceback.print_exc()
        sys.exit(1)
