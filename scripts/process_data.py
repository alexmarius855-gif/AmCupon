import pandas as pd
import json
import hashlib
from urllib.parse import quote
from datetime import datetime, timezone

AFF_CODE = "541547473"

def make_afiliat_url(url):
    """Genereaza un quicklink de afiliat 2Performant pentru un URL dat."""
    if not url or not isinstance(url, str):
        return ""
    unique = hashlib.md5(url.encode()).hexdigest()[:9]
    encoded_url = quote(url, safe="")
    return f"https://event.2performant.com/events/click?ad_type=quicklink&aff_code={AFF_CODE}&unique={unique}&redirect_to={encoded_url}"

SHOPS_FILE = "../data/SHOPS.xlsx"
PROMOS_FILE = "../data/promotions.csv"
OUTPUT_FILE = "../data/output.json"
OUTPUT_FRONTEND = "../frontend/public/output.json"

def load_shops():
    df = pd.read_excel(SHOPS_FILE, sheet_name="Merchants")
    df = df[df["Status"] == "Approved"].copy()
    df["Merchant"] = df["Merchant"].str.strip().str.lower()
    return df

def load_promos():
    df = pd.read_csv(PROMOS_FILE, encoding="utf-8")
    df["Affiliate program"] = df["Affiliate program"].str.strip().str.lower()
    df["End Date"] = pd.to_datetime(df["End Date"], utc=True, errors="coerce")
    now = datetime.now(timezone.utc)
    df = df[df["End Date"] > now].copy()
    df["zile_ramase"] = (df["End Date"] - now).dt.days
    return df

def calculeaza_scor(row):
    scor = row.get("scor_afiliere", 0) or 0

    # Bonus pentru trend pozitiv
    trend = row.get("trend", 0) or 0
    if trend > 0:
        scor += 15

    # Bonus pentru prioritate
    prioritate = str(row.get("prioritate", ""))
    if "A -" in prioritate:
        scor += 10
    elif "D -" in prioritate:
        scor -= 30

    # Bonus pentru promotie activa
    if row.get("are_promotie"):
        scor += 20

    # Bonus pentru cod cupon
    if row.get("cod_cupon"):
        scor += 10

    # Urgenta: expira in mai putin de 3 zile
    zile = row.get("zile_ramase", 99) or 99
    if zile <= 3:
        scor += 5

    return round(scor, 1)

def main():
    print("Citesc magazinele...")
    shops = load_shops()
    print(f"  {len(shops)} magazine aprobate gasite")

    print("Citesc promotiile active...")
    promos = load_promos()
    print(f"  {len(promos)} promotii active gasite")

    # Legam promotiile de magazine
    promo_map = {}
    for _, row in promos.iterrows():
        cheie = row["Affiliate program"]
        if cheie not in promo_map:
            promo_map[cheie] = []
        descriere = row.get("Description (for customer)", "")
        promo_map[cheie].append({
            "nume": row["Promotion name"],
            "descriere": descriere if pd.notna(descriere) else "",
            "cod_cupon": row.get("Coupon code", "") if pd.notna(row.get("Coupon code")) else "",
            "landing_page": row.get("Landing Page", "") if pd.notna(row.get("Landing Page", "")) else "",
            "zile_ramase": int(row["zile_ramase"]) if pd.notna(row["zile_ramase"]) else 0
        })

    rezultate = []
    for _, shop in shops.iterrows():
        cheie = shop["Merchant"]
        promotii = promo_map.get(cheie, [])

        url_magazin = shop["URL"] if pd.notna(shop["URL"]) else ""
        intrare = {
            "magazin": shop["Merchant"],
            "url": url_magazin,
            "url_afiliat": make_afiliat_url(url_magazin),
            "categorie": shop["Category"],
            "comision": shop["Commission"],
            "scor_afiliere": shop["Affiliate Score"],
            "prioritate": shop["Priority"],
            "canal_recomandat": shop["Recommended Channel"],
            "sales_number": int(shop["Sales Number"]) if pd.notna(shop["Sales Number"]) else 0,
            "trend": float(shop["Trend"]) if pd.notna(shop["Trend"]) else 0,
            "are_promotie": len(promotii) > 0,
            "cod_cupon": any(p["cod_cupon"] for p in promotii),
            "zile_ramase": min((p["zile_ramase"] for p in promotii), default=99),
            "promotii": promotii
        }

        intrare["scor_final"] = calculeaza_scor(intrare)
        rezultate.append(intrare)

    rezultate.sort(key=lambda x: x["scor_final"], reverse=True)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(rezultate, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(rezultate, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {len(rezultate)} magazine procesate.")
    print(f"Fisier salvat: {OUTPUT_FILE}")
    print("\nTOP 5 magazine prioritizate:")
    for i, m in enumerate(rezultate[:5], 1):
        promo_text = f" + {len(m['promotii'])} promotii" if m["are_promotie"] else ""
        print(f"  {i}. {m['magazin']} — scor {m['scor_final']}{promo_text}")

if __name__ == "__main__":
    main()
