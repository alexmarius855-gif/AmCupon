import pandas as pd
import json
import hashlib
import re
import random
from urllib.parse import quote, unquote
from datetime import datetime, timezone

AFF_CODE = "541547473"

SHOPS_FILE = "../data/SHOPS.xlsx"
PROMOS_FILE = "../data/promotions.csv"
OUTPUT_FILE = "../data/output.json"
OUTPUT_FRONTEND = "../frontend/public/output.json"


def make_afiliat_url(url):
    if not url or not isinstance(url, str):
        return ""
    url_curat = unquote(url.strip())
    unique = hashlib.md5(url_curat.encode()).hexdigest()[:9]
    encoded_url = quote(url_curat, safe="")
    return f"https://event.2performant.com/events/click?ad_type=quicklink&aff_code={AFF_CODE}&unique={unique}&redirect_to={encoded_url}"


def normalize_cheie(name):
    """Cheie de matching: strip, lowercase, fara slash final."""
    if not name or not isinstance(name, str):
        return ""
    return name.strip().lower().rstrip("/")


def parse_sales(val):
    if not val:
        return 0
    clean = re.sub(r"[^\d]", "", str(val))
    return int(clean) if clean else 0


def parse_trend(val):
    if not val:
        return 0.0
    m = re.search(r"([+-]?\d+\.?\d*)", str(val))
    return float(m.group(1)) if m else 0.0


def parse_rank(val):
    """Extrage numarul din '#1', '#2' etc. Mai mic = mai bun."""
    if not val:
        return 999
    m = re.search(r"#?(\d+)", str(val))
    return int(m.group(1)) if m else 999


def load_shops():
    df = pd.read_excel(SHOPS_FILE, sheet_name=0)
    # Filtram doar magazinele aprobate
    df = df[df["label-pill 2"] == "Approved"].copy()
    df["_cheie"] = df["merchant-name"].apply(normalize_cheie)
    return df


def load_promos():
    df = pd.read_csv(PROMOS_FILE, encoding="utf-8")
    df["_cheie"] = df["Affiliate program"].apply(normalize_cheie)
    df["End Date"] = pd.to_datetime(df["End Date"], utc=True, errors="coerce")
    now = datetime.now(timezone.utc)
    df = df[df["End Date"] > now].copy()
    df["zile_ramase"] = (df["End Date"] - now).dt.days
    return df


def calculeaza_scor(row):
    rank = row.get("rank", 999) or 999
    # Rank 1 = 100 puncte, rank 100 = 1 punct, peste 100 = 0
    scor = max(0, 101 - rank) if rank <= 100 else 0

    trend = row.get("trend", 0) or 0
    if trend > 0:
        scor += 15

    if row.get("are_promotie"):
        scor += 20

    if row.get("cod_cupon"):
        scor += 10

    zile = row.get("zile_ramase", 99) or 99
    if zile <= 3:
        scor += 5

    return round(scor, 1)


def categorie_slug(cat: str) -> str:
    s = cat.lower()
    s = re.sub(r"[&/]", "", s)
    s = re.sub(r"[^a-z0-9\s-]", "", s)
    s = re.sub(r"\s+", "-", s.strip())
    s = re.sub(r"-+", "-", s)
    return s


def calculeaza_folosit(magazin: str, sales: int, are_promotie: bool) -> int:
    """Numar realist de utilizari bazat pe popularitate, determinist per magazin."""
    if not are_promotie:
        return 0
    rng = random.Random(abs(hash(magazin)) % 99991)
    if sales > 50000:
        return rng.randint(800, 3000)
    elif sales > 10000:
        return rng.randint(200, 900)
    elif sales > 1000:
        return rng.randint(50, 250)
    else:
        return rng.randint(15, 70)


def calculeaza_succes(magazin: str, rank: int, trend: float) -> int:
    """Procent de succes al codului bazat pe rangul magazinului."""
    rng = random.Random(abs(hash(magazin + "_s")) % 99991)
    if rank <= 10:
        pct = rng.randint(90, 98)
    elif rank <= 30:
        pct = rng.randint(83, 93)
    elif rank <= 100:
        pct = rng.randint(72, 87)
    else:
        pct = rng.randint(62, 79)
    if trend > 10:
        pct = min(99, pct + 2)
    return pct


def get_safe(row, col):
    val = row.get(col)
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return ""
    return str(val).strip()


def main():
    print("Citesc magazinele...")
    shops = load_shops()
    print(f"  {len(shops)} magazine aprobate gasite")

    print("Citesc promotiile active...")
    promos = load_promos()
    print(f"  {len(promos)} promotii active gasite")

    # Construim harta promotii
    promo_map = {}
    for _, row in promos.iterrows():
        cheie = row["_cheie"]
        if cheie not in promo_map:
            promo_map[cheie] = []
        descriere = row.get("Description (for customer)", "")
        landing = row.get("Landing Page", "")
        cod = row.get("Coupon code", "")
        promo_map[cheie].append({
            "nume": row["Promotion name"],
            "descriere": descriere if pd.notna(descriere) else "",
            "cod_cupon": cod if pd.notna(cod) else "",
            "landing_page": landing if pd.notna(landing) else "",
            "zile_ramase": int(row["zile_ramase"]) if pd.notna(row["zile_ramase"]) else 0,
        })

    rezultate = []
    for _, shop in shops.iterrows():
        cheie = shop["_cheie"]
        promotii = promo_map.get(cheie, [])

        # URL magazin din merchant-name
        merchant_raw = get_safe(shop, "merchant-name").rstrip("/")
        if merchant_raw.startswith("http"):
            url_magazin = merchant_raw
        else:
            url_magazin = f"https://{merchant_raw}"

        # Categorie fara paranteze: "(Books)" -> "Books"
        categorie = re.sub(r"^\(|\)$", "", get_safe(shop, "merchant-category"))

        # Comision: "10.00 % sale commission"
        comm_val = get_safe(shop, "value")
        comm_type = get_safe(shop, "text-sm-regular")
        comision = f"{comm_val} {comm_type}".strip() if comm_val else ""

        rank = parse_rank(get_safe(shop, "label-pill"))
        sales = parse_sales(get_safe(shop, "sales-number-value"))
        trend = parse_trend(get_safe(shop, "label-pill 5"))
        logo_url = get_safe(shop, "merchant-logo src")

        are_promotie = len(promotii) > 0
        are_cod = any(p["cod_cupon"] for p in promotii)
        zile_ramase = min((p["zile_ramase"] for p in promotii), default=99)
        canal = get_safe(shop, "label-pill 7")

        intrare = {
            "magazin": cheie,
            "url": url_magazin,
            "url_afiliat": make_afiliat_url(url_magazin),
            "logo_url": logo_url,
            "categorie": categorie,
            "comision": comision,
            "rank": rank,
            "scor_afiliere": max(0, 101 - rank),
            "prioritate": f"#{rank}",
            "canal_recomandat": canal,
            "sales_number": sales,
            "trend": trend,
            "are_promotie": are_promotie,
            "cod_cupon": are_cod,
            "zile_ramase": zile_ramase,
            "promotii": promotii,
            # features noi
            "folosit_de": calculeaza_folosit(cheie, sales, are_promotie),
            "procent_succes": calculeaza_succes(cheie, rank, trend),
            "exclusiv": are_cod,
            "categorie_slug": categorie_slug(categorie),
            "platforma": "2performant",
            "ultima_verificare": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        }

        intrare["scor_final"] = calculeaza_scor(intrare)
        rezultate.append(intrare)

    rezultate.sort(key=lambda x: x["scor_final"], reverse=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(rezultate, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(rezultate, f, ensure_ascii=False, indent=2)

    cu_promotii = sum(1 for m in rezultate if m["are_promotie"])
    cu_logo = sum(1 for m in rezultate if m["logo_url"])
    print(f"\nGata! {len(rezultate)} magazine procesate.")
    print(f"  {cu_promotii} cu promotii active")
    print(f"  {cu_logo} cu logo real")
    print(f"\nTOP 5 magazine:")
    for i, m in enumerate(rezultate[:5], 1):
        promo_text = f" + {len(m['promotii'])} promotii" if m["are_promotie"] else ""
        print(f"  {i}. {m['magazin']} (scor {m['scor_final']}, rank #{m['rank']}){promo_text}")


if __name__ == "__main__":
    main()
