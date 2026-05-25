"""
Integrare Profitshare.ro — AmCupon.ro
======================================
Descarca programele si promotiile de pe Profitshare API
si le converteste in acelasi format ca 2Performant.

SETUP (o singura data):
  1. Inregistreaza-te pe https://profitshare.ro ca Publisher
  2. Dupa aprobare, mergi la Cont > API si copiaza:
       - affiliate_username  (ex: "alexmarius855")
       - affiliate_key       (sirul lung de hex)
  3. Seteaza variabilele de mai jos SAU adauga secretele GitHub:
       PROFITSHARE_USER = "username-ul tau"
       PROFITSHARE_KEY  = "cheia ta API"

RULARE LOCALA:
  python process_profitshare.py

REZULTAT:
  ../data/profitshare_output.json  (pentru merge cu 2Performant)
"""

import os
import json
import re
import random
import hashlib
import requests
from datetime import datetime, timezone
from urllib.parse import quote

# ─── CREDENTIALE ──────────────────────────────────────────────────────────────
# Prioritate: variabile de mediu > hardcodat (nu pune cheia pe GitHub!)
AFFILIATE_USERNAME = os.environ.get("PROFITSHARE_USER", "")
AFFILIATE_KEY      = os.environ.get("PROFITSHARE_KEY", "")

OUTPUT_FILE = "../data/profitshare_output.json"

BASE_URL = "https://api.profitshare.ro"

# ─── MAPARE CATEGORII (Profitshare -> formatul nostru) ────────────────────────
CATEGORY_MAP = {
    "Fashion": "Fashion",
    "Imbracaminte": "Fashion",
    "Incaltaminte": "Fashion",
    "Electrocasnice": "Electronics IT&C",
    "Electronice": "Electronics IT&C",
    "IT": "Electronics IT&C",
    "IT&C": "Electronics IT&C",
    "Casa": "Home & Garden",
    "Casa si Gradina": "Home & Garden",
    "Gradina": "Home & Garden",
    "Mobila": "Home & Garden",
    "Cosmetice": "Beauty",
    "Frumusete": "Beauty",
    "Sanatate": "Health & Personal care",
    "Farmacie": "Pharma",
    "Carti": "Books",
    "Educatie": "Books",
    "Sport": "Sports & outdoors",
    "Outdoor": "Sports & outdoors",
    "Auto": "Automotive",
    "Copii": "Babies Kids & Toys",
    "Jucarii": "Babies Kids & Toys",
    "Animale": "Pet supplies",
    "Mall": "Online Mall",
    "Generalist": "Online Mall",
}


def normalize_category(cat: str) -> str:
    if not cat:
        return "Online Mall"
    for key, value in CATEGORY_MAP.items():
        if key.lower() in cat.lower():
            return value
    return "Online Mall"


def categorie_slug(cat: str) -> str:
    s = cat.lower()
    s = re.sub(r"[&/]", "", s)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    s = re.sub(r"-+", "-", s)
    return s


def make_tracking_url(username: str, program_id: int, store_slug: str) -> str:
    """Genereaza link de tracking Profitshare."""
    return f"https://l.profitshare.ro/l/{username}/{program_id}?sub_id={store_slug}"


def normalize_slug(name: str) -> str:
    """Transforma 'Dedeman' -> 'dedeman.ro' (format magazin intern)."""
    s = name.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"\s+", "-", s)
    # Daca nu are punct (nu e deja un domeniu), adauga .ro
    if "." not in s:
        s = f"{s}.ro"
    return s


def calculeaza_succes(slug: str, rank_approx: int) -> int:
    rng = random.Random(abs(hash(slug + "_ps")) % 99991)
    if rank_approx <= 10:
        return rng.randint(88, 97)
    elif rank_approx <= 30:
        return rng.randint(80, 91)
    elif rank_approx <= 100:
        return rng.randint(70, 85)
    return rng.randint(60, 78)


def calculeaza_folosit(slug: str, are_promotie: bool) -> int:
    if not are_promotie:
        return 0
    rng = random.Random(abs(hash(slug + "_pf")) % 99991)
    return rng.randint(20, 400)


def ps_get(endpoint: str, params: dict = None) -> dict | list | None:
    """Apel API Profitshare cu autentificare."""
    if not AFFILIATE_USERNAME or not AFFILIATE_KEY:
        print("  EROARE: Lipsesc credentialele Profitshare!")
        print("  Seteaza PROFITSHARE_USER si PROFITSHARE_KEY ca variabile de mediu.")
        return None

    url = f"{BASE_URL}{endpoint}"
    p = {
        "affiliate_username": AFFILIATE_USERNAME,
        "affiliate_key": AFFILIATE_KEY,
        **(params or {}),
    }
    try:
        r = requests.get(url, params=p, timeout=30)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.RequestException as e:
        print(f"  Eroare retea {endpoint}: {e}")
        return None
    except ValueError as e:
        print(f"  Eroare JSON {endpoint}: {e}")
        return None


def load_programs() -> list[dict]:
    """Descarca toate programele (magazinele) active."""
    print("  Descarc programe Profitshare...")
    all_programs = []
    page = 1

    while True:
        data = ps_get("/affiliate-programs/", {"results_per_page": 100, "page": page})
        if not data:
            break
        programs = data if isinstance(data, list) else data.get("programs", data.get("result", []))
        if not programs:
            break
        all_programs.extend(programs)
        print(f"    Pagina {page}: {len(programs)} programe")
        if len(programs) < 100:
            break
        page += 1

    return all_programs


def load_promotions() -> list[dict]:
    """Descarca toate promotiile active."""
    print("  Descarc promotii Profitshare...")
    all_promos = []
    page = 1

    while True:
        data = ps_get("/affiliate-promotions/", {"results_per_page": 200, "page": page})
        if not data:
            break
        promos = data if isinstance(data, list) else data.get("promotions", data.get("result", []))
        if not promos:
            break

        now = datetime.now(timezone.utc)
        for promo in promos:
            end_raw = promo.get("end_date") or promo.get("end") or ""
            if end_raw:
                try:
                    end_dt = datetime.fromisoformat(end_raw.replace("Z", "+00:00"))
                    if end_dt.tzinfo is None:
                        end_dt = end_dt.replace(tzinfo=timezone.utc)
                    if end_dt > now:
                        promo["_zile_ramase"] = max(0, (end_dt - now).days)
                        all_promos.append(promo)
                except (ValueError, AttributeError):
                    all_promos.append(promo)
            else:
                promo["_zile_ramase"] = 30
                all_promos.append(promo)

        print(f"    Pagina {page}: {len(promos)} promotii")
        if len(promos) < 200:
            break
        page += 1

    return all_promos


def build_promo_map(promotions: list[dict]) -> dict[str, list]:
    """Indexeaza promotiile dupa program_id."""
    promo_map: dict[str, list] = {}
    for promo in promotions:
        pid = str(promo.get("program_id") or promo.get("affiliate_program_id") or "")
        if not pid:
            continue
        if pid not in promo_map:
            promo_map[pid] = []

        cod = promo.get("coupon_code") or promo.get("code") or ""
        landing = promo.get("url") or promo.get("landing_url") or ""
        descriere = promo.get("description") or promo.get("name") or ""
        name = promo.get("name") or promo.get("title") or "Promotie activa"

        promo_map[pid].append({
            "nume": name,
            "descriere": descriere,
            "cod_cupon": cod if cod else "",
            "landing_page": landing,
            "zile_ramase": promo.get("_zile_ramase", 30),
        })

    return promo_map


def process_program(prog: dict, promo_map: dict, rank_counter: int) -> dict | None:
    """Converteste un program Profitshare in formatul nostru."""
    pid = str(prog.get("id") or prog.get("program_id") or "")
    if not pid:
        return None

    # Slug magazin
    name_raw = prog.get("name") or prog.get("program_name") or ""
    url_raw = prog.get("url") or prog.get("website") or prog.get("main_url") or ""

    if not name_raw and not url_raw:
        return None

    # Prefer domain-ul real ca slug (ex: dedeman.ro)
    if url_raw:
        # Extrage domeniu: "https://www.dedeman.ro/..." -> "dedeman.ro"
        domain_m = re.search(r"(?:https?://)?(?:www\.)?([^/\s]+\.[a-z]{2,})", url_raw)
        slug = domain_m.group(1) if domain_m else normalize_slug(name_raw)
    else:
        slug = normalize_slug(name_raw)

    # Logo
    logo_url = (
        prog.get("logo") or prog.get("logo_url") or prog.get("image") or ""
    )

    # Categorie
    cat_raw = prog.get("category") or prog.get("main_category") or ""
    categorie = normalize_category(cat_raw)

    # Comision
    comm_val = prog.get("commission_value") or prog.get("default_commission") or ""
    comm_type = prog.get("commission_type") or "sale commission"
    comision = f"{comm_val} {comm_type}".strip() if comm_val else ""

    # URL magazin curat
    url_magazin = url_raw or f"https://{slug}"
    if not url_magazin.startswith("http"):
        url_magazin = f"https://{url_magazin}"

    # Promotii
    promotii = promo_map.get(pid, [])
    are_promotie = len(promotii) > 0
    are_cod = any(p["cod_cupon"] for p in promotii)
    zile_ramase = min((p["zile_ramase"] for p in promotii), default=99)

    # Rank aproximat (bazat pe ordinea din API)
    rank = rank_counter + 100  # Incepem de la 100 ca sa nu conflicte cu 2Performant top

    return {
        "magazin": slug,
        "url": url_magazin,
        "url_afiliat": make_tracking_url(AFFILIATE_USERNAME, int(pid), slug),
        "logo_url": logo_url,
        "categorie": categorie,
        "comision": comision,
        "rank": rank,
        "scor_afiliere": max(0, 50 - rank_counter),
        "prioritate": f"#{rank}",
        "canal_recomandat": "Profitshare",
        "sales_number": 0,
        "trend": 0.0,
        "are_promotie": are_promotie,
        "cod_cupon": are_cod,
        "zile_ramase": zile_ramase,
        "promotii": promotii,
        "folosit_de": calculeaza_folosit(slug, are_promotie),
        "procent_succes": calculeaza_succes(slug, rank_counter),
        "exclusiv": are_cod,
        "categorie_slug": categorie_slug(categorie),
        "scor_final": max(0, 50 - rank_counter) + (20 if are_promotie else 0) + (10 if are_cod else 0),
        "platforma": "profitshare",
    }


def main():
    if not AFFILIATE_USERNAME or not AFFILIATE_KEY:
        print("=" * 60)
        print("PROFITSHARE: credentiale lipsa — skip")
        print("Seteaza PROFITSHARE_USER si PROFITSHARE_KEY")
        print("=" * 60)
        # Scrie JSON gol ca sa nu dea eroare la merge
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
        return

    print("=" * 60)
    print("Profitshare.ro — descarc date...")
    print("=" * 60)

    programs = load_programs()
    if not programs:
        print("  Niciun program gasit.")
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump([], f)
        return

    print(f"  Total programe: {len(programs)}")

    promotions = load_promotions()
    print(f"  Total promotii active: {len(promotions)}")

    promo_map = build_promo_map(promotions)

    rezultate = []
    for i, prog in enumerate(programs):
        intrare = process_program(prog, promo_map, i)
        if intrare:
            rezultate.append(intrare)

    cu_promotii = sum(1 for m in rezultate if m["are_promotie"])
    cu_cod = sum(1 for m in rezultate if m["cod_cupon"])

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(rezultate, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {len(rezultate)} magazine Profitshare procesate.")
    print(f"  {cu_promotii} cu promotii active")
    print(f"  {cu_cod} cu cod cupon")
    print(f"\nTOP 10 magazine:")
    for m in rezultate[:10]:
        flag = " [PROMO]" if m["are_promotie"] else ""
        print(f"  {m['magazin']}{flag}")
    print(f"\nSalvat: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
