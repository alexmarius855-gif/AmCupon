#!/usr/bin/env python3
"""
Consolidare canonica a categoriilor: 40 etichete fragmentate (EN+RO) -> 16 canonice
in romana. Prinde TOATE sursele (2P/Profitshare/Impact/CSV). Reclasifica junk-ul
(Online Mall / Diverse) prin cuvinte-cheie din numele magazinului.

Poate rula standalone (pe output.json existent) SAU importat din merge_platforms.py:
    from canonicalize_categories import canonicalize
    canonicalize(magazine_list)   # muteaza in loc
"""
import sys, json, re
from pathlib import Path

# ── 16 categorii canonice: (eticheta RO, slug) ──────────────────────────────
CANON = {
    "fashion":      ("Fashion", "fashion"),
    "electronice":  ("Electronice & IT", "electronice"),
    "casa":         ("Casă & Grădină", "casa-gradina"),
    "beauty":       ("Beauty & Îngrijire", "beauty"),
    "sanatate":     ("Sănătate & Farmacie", "sanatate"),
    "sport":        ("Sport & Fitness", "sport"),
    "copii":        ("Copii & Familie", "copii"),
    "auto":         ("Auto & Moto", "auto-moto"),
    "carti":        ("Cărți & Educație", "carti-educatie"),
    "calatorii":    ("Călătorii", "calatorii"),
    "mancare":      ("Mâncare & Băuturi", "mancare-bauturi"),
    "animale":      ("Pet Shop", "animale"),
    "cadouri":      ("Cadouri & Flori", "cadouri-flori"),
    "bijuterii":    ("Bijuterii & Ceasuri", "bijuterii"),
    "software":     ("Software & Digital", "software"),
    "financiar":    ("Financiar & Asigurări", "financiar"),
    "servicii":     ("Servicii", "servicii"),
    "marketplace":  ("Marketplace", "marketplace"),
}

# ── Etichete/slug-uri existente -> cheie canonica ───────────────────────────
LABEL_TO_CANON = {
    "fashion": "fashion", "clothing": "fashion", "imbracaminte": "fashion", "incaltaminte": "fashion", "shoes": "fashion",
    "electronics": "electronice", "electronice": "electronice", "it&c": "electronice", "itc": "electronice", "gadget": "electronice", "appliances": "electronice", "electrocasnice": "electronice",
    "home": "casa", "garden": "casa", "casa": "casa", "gradina": "casa", "mobila": "casa",
    "beauty": "beauty", "frumusete": "beauty", "cosmetic": "beauty", "parfum": "beauty",
    "health": "sanatate", "pharma": "sanatate", "farmac": "sanatate", "sanatate": "sanatate", "personal care": "sanatate",
    "sport": "sport", "outdoor": "sport", "fitness": "sport",
    "kids": "copii", "babies": "copii", "copii": "copii", "jucarii": "copii", "toys": "copii",
    "auto": "auto", "moto": "auto", "automotive": "auto",
    "book": "carti", "carti": "carti", "curs": "carti", "educat": "carti",
    "travel": "calatorii", "calatori": "calatorii", "turism": "calatorii",
    "food": "mancare", "beverage": "mancare", "mancare": "mancare", "bauturi": "mancare",
    "pet": "animale", "animale": "animale",
    "flower": "cadouri", "flori": "cadouri", "gift": "cadouri", "cadou": "cadouri",
    "jewel": "bijuterii", "bijuterii": "bijuterii", "ceasuri": "bijuterii", "accessories": "bijuterii",
    "software": "software", "hosting": "software", "domenii": "software", "vpn": "software", "antivirus": "software", "ai tools": "software", "aplicat": "software",
    "financiar": "financiar", "card": "financiar", "asigurar": "financiar", "credit": "financiar", "bank": "financiar",
    "service": "servicii", "servicii": "servicii",
    "mall": "marketplace", "diverse": "marketplace", "marketplace": "marketplace",
}

# ── Cuvinte-cheie in numele magazinului pt reclasificarea junk-ului ─────────
NAME_KEYWORDS = [
    (["moda", "fashion", "haine", "incaltaminte", "pantofi", "rochii", "textil", "sneaker", "dress", "wear"], "fashion"),
    (["electro", "tech", "gadget", "telefon", "laptop", "pc", "gaming", "console", "digital", "smart", "foto"], "electronice"),
    (["casa", "home", "mobila", "deco", "gradina", "brico", "menaj", "bucatarie", "furniture"], "casa"),
    (["beauty", "cosmetic", "parfum", "machiaj", "unghii", "make", "skin", "hair", "frumus"], "beauty"),
    (["farmac", "pharma", "sanatate", "medical", "supliment", "vitamin", "pharm", "health", "optic"], "sanatate"),
    (["sport", "fitness", "outdoor", "bike", "bicicl", "camping", "gym"], "sport"),
    (["copil", "kids", "baby", "bebe", "jucar", "toy", "noriel"], "copii"),
    (["auto", "moto", "anvelop", "piese", "car-", "tuning"], "auto"),
    (["carte", "book", "carti", "curs", "elearn", "libr", "edu"], "carti"),
    (["travel", "calator", "turism", "hotel", "zbor", "vacan", "esim", "flight"], "calatorii"),
    (["food", "mancare", "cafea", "coffee", "wine", "vin", "bere", "restaurant", "delivery"], "mancare"),
    (["pet", "animal", "caine", "pisic", "dog", "cat", "zoo"], "animale"),
    (["flor", "flower", "cadou", "gift"], "cadouri"),
    (["bijuter", "jewel", "ceas", "watch", "aur", "argint"], "bijuterii"),
    (["software", "hosting", "vpn", "antivirus", "saas", "app", "cloud", "seo", "domeniu"], "software"),
    (["card", "bank", "asigur", "credit", "financ", "invest", "crypto"], "financiar"),
]


def _canon_from_label(cat: str):
    cl = (cat or "").lower()
    for key, canon in LABEL_TO_CANON.items():
        if key in cl:
            return canon
    return None


def _canon_from_name(magazin: str):
    ml = (magazin or "").lower()
    for kws, canon in NAME_KEYWORDS:
        if any(k in ml for k in kws):
            return canon
    return None


def canonicalize(mags: list) -> dict:
    """Muteaza fiecare magazin la categorie/categorie_slug canonice. Returneaza stats."""
    stats = {}
    for m in mags:
        canon = _canon_from_label(m.get("categorie", ""))
        # junk (mall/diverse/necunoscut) -> incearca dupa numele magazinului
        if canon in (None, "marketplace"):
            by_name = _canon_from_name(m.get("magazin", ""))
            if by_name:
                canon = by_name
        if canon is None:
            canon = "marketplace"
        label, slug = CANON[canon]
        m["categorie"] = label
        m["categorie_slug"] = slug
        stats[label] = stats.get(label, 0) + 1
    return stats


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    p = Path(__file__).parent.parent / "frontend" / "public" / "output.json"
    data = json.loads(p.read_text(encoding="utf-8"))
    mags = data if isinstance(data, list) else list(data.values())[0]
    stats = canonicalize(mags)
    if isinstance(data, list):
        p.write_text(json.dumps(mags, ensure_ascii=False, indent=2), encoding="utf-8")
    else:
        k = list(data.keys())[0]; data[k] = mags
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Canonicalizat {len(mags)} magazine in {len(stats)} categorii:")
    for lbl, n in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {n:4d}  {lbl}")
