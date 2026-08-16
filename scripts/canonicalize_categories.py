#!/usr/bin/env python3
"""
Consolidare canonica a categoriilor: 40 etichete fragmentate (EN+RO) -> 16 canonice
in romana. Prinde TOATE sursele (2P/Profitshare/Impact/CSV). Reclasifica junk-ul
(Online Mall / Diverse) prin cuvinte-cheie din numele magazinului.

Poate rula standalone (pe output.json existent) SAU importat din merge_platforms.py:
    from canonicalize_categories import canonicalize
    canonicalize(magazine_list)   # muteaza in loc
"""
import sys, json, re, unicodedata
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
    (["moda", "fashion", "haine", "incaltaminte", "pantofi", "rochii", "textil", "sneaker", "dress", "wear", "shoe", "boot", "stockx", "answear", "label", "regata", "outfit", "style", "zara", "bershka"], "fashion"),
    (["electro", "tech", "gadget", "telefon", "laptop", "pc", "gaming", "console", "digital", "foto", "lenovo", "razer", "oneplus", "eufy", "turtlebeach", "anker", "xiaomi", "samsung", "asus", "acer", "dell", "msi", "logitech", "corsair", "gopro", "dji", "oppo", "realme", "huawei", "nokia", "belkin", "ugreen", "aukey", "headphone", "speaker", "camera", "monitor"], "electronice"),
    (["casa", "home", "mobila", "deco", "gradina", "brico", "menaj", "bucatarie", "furniture", "mathaus", "expomob", "mobidea", "vidaxl", "daedalus", "interior", "lamp", "kitchen", "garden", "tool", "dedeman", "leroy"], "casa"),
    (["beauty", "cosmetic", "parfum", "machiaj", "unghii", "make", "skin", "hair", "frumus", "notino", "douglas", "sephora", "loreal", "nivea", "perfume", "nail", "spa"], "beauty"),
    (["farmac", "pharma", "sanatate", "medical", "supliment", "vitamin", "pharm", "health", "optic", "myprotein", "iherb", "catena", "drmax", "helcor", "wellness", "clinic", "dental", "dinti"], "sanatate"),
    (["sport", "fitness", "outdoor", "bike", "bicicl", "camping", "gym", "muc-off", "decathl", "running", "yoga", "protein", "cycl", "hiking", "ski"], "sport"),
    (["copil", "kids", "baby", "bebe", "jucar", "toy", "noriel", "maxicosi", "chicco", "lego", "carucior", "scoala"], "copii"),
    (["auto", "moto", "anvelop", "piese", "car-", "tuning", "vehicle", "tire", "oil"], "auto"),
    (["carte", "book", "carti", "curs", "elearn", "libr", "edu", "coursera", "udemy", "preply", "datacamp", "knowledgehut", "blinkist", "skillshare", "babbel", "busuu", "academy", "course", "learn", "teach", "lingchat", "study", "language"], "carti"),
    (["travel", "calator", "turism", "hotel", "zbor", "vacan", "esim", "flight", "12go", "kkday", "booking", "trip", "tour", "expedia", "agoda", "getyourguide", "airalo", "saily", "rental", "airbnb"], "calatorii"),
    (["food", "mancare", "cafea", "coffee", "wine", "vin", "bere", "restaurant", "delivery", "snack", "tea", "drink", "grocery", "bio"], "mancare"),
    (["pet", "animal", "caine", "pisic", "dog", "cat", "zoo", "petshop", "aqua", "veterinar"], "animale"),
    (["flor", "flower", "cadou", "gift", "bloom"], "cadouri"),
    (["bijuter", "jewel", "ceas", "watch", "aur", "argint", "diamond", "ring"], "bijuterii"),
    (["software", "hosting", "vpn", "antivirus", "saas", "cloud", "seo", "domeniu", "shopify", "envato", "helium", "upwork", "fiverr", "intego", "skylum", "canva", "adobe", "plugin", "wordpress", "api", "app", "soft", "host", "proxy", "server", "web", "digital", "tool", "ai", "gpt", "chat", "code", "dev", "tech-", "crm", "market.", "facturis", "invoice", "helpdesk"], "software"),
    (["card", "bank", "asigur", "credit", "financ", "invest", "crypto", "loan", "insurance", "trading", "broker", "forex"], "financiar"),
]


def _fara_diacritice(t: str) -> str:
    """ă/â/î/ș/ț -> a/a/i/s/t. Vezi _canon_from_label pentru motiv."""
    return unicodedata.normalize("NFKD", t or "").encode("ascii", "ignore").decode("ascii")


def _canon_from_label(cat: str):
    """Eticheta -> categorie canonica.

    Normalizeaza diacriticele INAINTE de potrivire. Fara asta scriptul nu era
    IDEMPOTENT: cheile din LABEL_TO_CANON sunt ASCII («casa», «sanatate»,
    «calatori», «carti», «mancare»), dar CANON scrie etichete CU diacritice
    («Casă & Grădină», «Sănătate & Farmacie», «Călătorii»...). La a doua trecere
    peste propriul output, acele 5 categorii nu se mai recunosteau si cadeau in
    «marketplace» — masurat pe datele reale: casa-gradina 145 -> 35,
    calatorii 81 -> 51, carti-educatie 37 -> 19, mancare-bauturi 17 -> 6,
    marketplace 208 -> 365. Scriptul se poate rula standalone (vezi __main__),
    deci era o mina activa pentru oricine il rula a doua oara.
    """
    cl = _fara_diacritice((cat or "").lower())
    for key, canon in LABEL_TO_CANON.items():
        if _fara_diacritice(key) in cl:
            return canon
    return None


# ── Corectii explicite, verificate manual ───────────────────────────────────
# De ce exista lista asta (14.08.2026): output.json e SI intrare SI iesire pentru
# pipeline (documentat in CLAUDE.md), iar `_canon_from_label` citeste eticheta deja
# scrisa la rularea precedenta. Consecinta: o categorie gresita o data ramane
# gresita LA INFINIT — se auto-confirma la fiecare rulare de 4h si nicio ghicire
# dupa nume n-o mai poate corecta, pentru ca numele nici nu se mai consulta.
# Lista de mai jos are prioritate maxima (bate si eticheta, si numele), deci e
# singurul mod de a desface o clasificare blocata. Extinde-o cand gasesti altele.
OVERRIDE = {
    # nu erau magazine de animale — ajunsesera acolo prin potrivire pe subsir
    "aqua-mail.com":   "software",     # client de email Android («aqua»)
    "artemisads.com":  "software",     # platforma de reclame Amazon
    "zoombo.ai":       "software",     # produs AI («zoo»)
    "kospet.com":      "electronice",  # ceasuri smart («pet»)
    "vapetronic.ro":   "marketplace",  # magazin de vape («pet» in «vaPETronic»)
    # nu erau magazine de sport
    "omio.com":        "calatorii",    # rezervari transport/calatorii
    "geekbuying.com":  "electronice",
    "torraslife.com":  "electronice",  # accesorii telefoane
    "acebeam.com":     "electronice",  # lanterne
    "us.fossibot.com": "electronice",  # statii de energie
    "incerunmen.com":  "fashion",
    "nbatopshot.com":  "marketplace",  # colectibile digitale
    # diverse
    "greekmoving.com": "servicii",     # firma de mutari, nu financiar
    "ebrands.com":     "marketplace",  # agregator de branduri, nu copii
}


def _canon_from_name(magazin: str):
    """Ghiceste categoria din numele magazinului.

    Cuvintele-cheie de <=3 litere se cauta doar la GRANITA de cuvant. Un subsir de
    3 litere apare accidental in prea multe domenii: «pet» in vaPETronic/kosPET,
    «cat» in vivazCATaratas, «tea» in curTEAveche, «ai» in lAIcashop, «app» in
    frAPPerie. Cuvintele mai lungi raman pe subsir — domeniile concateneaza cuvinte
    («zenhotels», «savelectro»), iar o regula de granita aplicata peste tot ar rupe
    30+ hoteluri clasificate corect (masurat inainte de a schimba ceva).
    """
    ml = (magazin or "").lower()
    for kws, canon in NAME_KEYWORDS:
        for k in kws:
            gasit = re.search(r"(?<![a-z0-9])" + re.escape(k), ml) if len(k) <= 3 else (k in ml)
            if gasit:
                return canon
    return None


def canonicalize(mags: list) -> dict:
    """Muteaza fiecare magazin la categorie/categorie_slug canonice. Returneaza stats."""
    stats = {}
    for m in mags:
        canon = OVERRIDE.get((m.get("magazin") or "").lower())
        if canon is None:
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
