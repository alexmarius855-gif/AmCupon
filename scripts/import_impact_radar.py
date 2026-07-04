#!/usr/bin/env python3
# Foloseste radarul (affiliate_network_radar.xlsx) ca sa:
# 1. Reclasifice magazinele Impact din output.json dupa categoria REALA Impact
#    (nu dupa nume) -> goleste bucketul "Marketplace".
# 2. Importe cele ~28 advertiseri noi (nu-s inca in site).
# 3. Garanteze url_afiliat = tracking link Impact (variety, comision fara cupon).
import openpyxl, json, re
from pathlib import Path

RADAR = Path(r"C:\Users\alexm\Desktop\affiliate_network_radar.xlsx")
ROOT = Path(r"C:\Users\alexm\Projects\afiliere-site")
OUT = ROOT / "frontend" / "public" / "output.json"
EXTRA = ROOT / "data" / "extra_merchants.json"

# Impact category -> cheie canonica (aliniata cu canonicalize_categories.CANON)
IMPACT_TO_CANON = {
    "apps": "software", "software": "software", "website hosting": "software",
    "internet service provider": "software", "b2b": "software", "web services": "software",
    "learning": "carti", "education": "carti", "books": "carti",
    "accommodations": "calatorii", "transportation": "calatorii", "travel": "calatorii",
    "tours": "calatorii", "car rental": "calatorii",
    "women's apparel": "fashion", "men's apparel": "fashion", "apparel": "fashion",
    "shoes": "fashion", "bags & accessories": "fashion", "sports apparel & accessories": "sport",
    "jewelry": "bijuterii", "watches": "bijuterii",
    "consumer electronics": "electronice", "computers": "electronice", "electronics": "electronice",
    "cell phones": "electronice",
    "outdoors & recreation": "sport", "sports & exercise equipment": "sport", "sports": "sport",
    "parts & accessories": "auto", "automotive": "auto",
    "cosmetics & skin care": "beauty", "spa & personal grooming": "beauty", "beauty": "beauty",
    "health & wellness": "sanatate", "vitamins & supplements": "sanatate",
    "loans & financial services": "financiar", "financial services": "financiar", "insurance": "financiar",
    "home & garden": "casa", "furniture": "casa", "tools & hardware": "casa",
    "food & beverage": "mancare", "food & drink": "mancare",
    "pet supplies": "animale", "pets": "animale",
    "toys & games": "copii", "baby & toddler": "copii",
    "gifts & flowers": "cadouri", "flowers": "cadouri",
    "collectibles & hobbies": "cadouri",
}

CANON = {
    "fashion": ("Fashion", "fashion"), "electronice": ("Electronice & IT", "electronice"),
    "casa": ("Casă & Grădină", "casa-gradina"), "beauty": ("Beauty & Îngrijire", "beauty"),
    "sanatate": ("Sănătate & Farmacie", "sanatate"), "sport": ("Sport & Fitness", "sport"),
    "copii": ("Copii & Familie", "copii"), "auto": ("Auto & Moto", "auto-moto"),
    "carti": ("Cărți & Educație", "carti-educatie"), "calatorii": ("Călătorii", "calatorii"),
    "mancare": ("Mâncare & Băuturi", "mancare-bauturi"), "animale": ("Pet Shop", "animale"),
    "cadouri": ("Cadouri & Flori", "cadouri-flori"), "bijuterii": ("Bijuterii & Ceasuri", "bijuterii"),
    "software": ("Software & Digital", "software"), "financiar": ("Financiar & Asigurări", "financiar"),
}


def dom(u: str) -> str:
    u = re.sub(r"^https?://", "", (u or "").strip().lower())
    if u.startswith("www."):
        u = u[4:]
    return u.split("/")[0].strip()


# ── 1. Citeste radarul Impact ──
wb = openpyxl.load_workbook(RADAR, data_only=True)
ws = wb["impact.com"]
rows = list(ws.iter_rows(values_only=True))[1:]  # Score,Program,Category,Status,Payout,Payout%,Fixed,Deep,Tracking,AdvURL,Why
radar = {}  # domain -> {cat, canon, track, score, payout}
for r in rows:
    if not r or str(r[3]).strip().lower() != "active":
        continue
    adv, track = dom(r[9]), (r[8] or "").strip()
    if not adv or not track:
        continue
    cat = (r[2] or "").strip().lower()
    canon = IMPACT_TO_CANON.get(cat)
    radar[adv] = {"canon": canon, "track": track, "score": int(r[0] or 50),
                  "payout": (r[4] or "Variabil"), "cat_raw": r[2], "advurl": r[9]}

print(f"radar Impact active: {len(radar)} advertiseri")

# ── 2. Reclasifica + fixeaza tracking pe magazinele existente ──
data = json.loads(OUT.read_text(encoding="utf-8"))
mags = data if isinstance(data, list) else list(data.values())[0]
existing = {m["magazin"].lower(): m for m in mags}

recat, retrack = 0, 0
for m in mags:
    info = radar.get(m["magazin"].lower())
    if not info:
        continue
    if info["canon"] and CANON.get(info["canon"]):
        lbl, slug = CANON[info["canon"]]
        if m.get("categorie_slug") != slug:
            m["categorie"], m["categorie_slug"] = lbl, slug
            recat += 1
    if info["track"] and m.get("url_afiliat") in (None, "", m.get("url")):
        m["url_afiliat"] = info["track"]
        retrack += 1

# ── 3. Importa advertiserii noi ──
def make_entry(adv, info):
    lbl, slug = CANON.get(info["canon"] or "software", CANON["software"])
    return {
        "magazin": adv, "url": info["advurl"], "url_afiliat": info["track"],
        "logo_url": "", "categorie": lbl, "categorie_slug": slug,
        "comision": str(info["payout"])[:40], "rank": None,
        "scor_afiliere": info["score"], "scor_final": info["score"],
        "prioritate": "featured" if info["score"] >= 85 else "standard",
        "canal_recomandat": "Content, SEO, Social", "sales_number": 0, "trend": 0,
        "are_promotie": False, "cod_cupon": False, "zile_ramase": 0, "promotii": [],
        "folosit_de": 0, "procent_succes": 0, "exclusiv": False, "platforma": "impact",
    }

noi = 0
extra = json.loads(EXTRA.read_text(encoding="utf-8")) if EXTRA.exists() else []
extra_names = {e["magazin"].lower() for e in extra}
for adv, info in radar.items():
    if adv not in existing:
        e = make_entry(adv, info)
        mags.append(e)
        if adv not in extra_names:
            extra.append(e); extra_names.add(adv)
        noi += 1

# ── Salveaza ──
if isinstance(data, list):
    OUT.write_text(json.dumps(mags, ensure_ascii=False, indent=2), encoding="utf-8")
else:
    k = list(data.keys())[0]; data[k] = mags
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
EXTRA.write_text(json.dumps(extra, ensure_ascii=False, indent=2), encoding="utf-8")

print(f"reclasificate: {recat} | tracking adaugat: {retrack} | importate noi: {noi}")
from collections import Counter
c = Counter(m.get("categorie") for m in mags)
print("distributie dupa:")
for k, v in c.most_common(): print(f"  {v:4d}  {k}")
