"""
import_awin_links.py — Importa magazine din exportul Awin "Linkuri si produse"
(diferit de formatul "Joined Programmes" asteptat de import_generic_affiliate.py:
CSV-ul de aici are un rand per LINK/banner, nu un rand per program, si nu contine
URL-ul advertiser-ului — doar ADVERTISER, ADV_CID, RELATIONSHIP STATUS, CATEGORY).

In loc sa foloseasca un CLICK URL specific de banner (multe sunt sezoniere/expirate
— "Fall Sale 2023", "Scary Halloween deals" etc., risc de landing page mort), se
construieste link-ul universal Awin ("MasterTag" deeplink), valabil pt orice program
alaturat, care redirectioneaza catre pagina implicita configurata de advertiser:
    https://www.awin1.com/cread.php?awinmid={ADV_CID}&awinaffid={AFFID}&clickref=

Domeniile reale (campul "url") NU sunt in CSV — sunt mapate manual mai jos, DOAR
pentru advertiserii al caror domeniu e cunoscut cu siguranta. Restul (nume prea
generic sau domeniu incert: Diecast, GearUP, Tvrzenaskla/Momanio, Unizdrav,
Skytours US) sunt sarite explicit — nu se ghiceste un URL.

Usage: python scripts/import_awin_links.py [--file cale.csv]
Dupa import → python scripts/merge_platforms.py
"""
import csv
import json
import os
import sys
import argparse
sys.stdout.reconfigure(encoding="utf-8")

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
EXTRA_PATH = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "output.json")
DEFAULT_CSV = os.path.join(DATA_DIR, "awin_links.csv")

AWIN_AFFID = "101829567"

# ADVERTISER (din CSV) -> (domeniu confirmat, categorie AmCupon, slug categorie)
KNOWN_ADVERTISERS = {
    "Abelssoft Int":        ("abelssoft.de",     "Software & Aplicatii",  "software-business"),
    "Air Serbia":           ("airserbia.com",    "Calatorie",             "calatorie"),
    "CarmelLimo.com":       ("carmellimo.com",   "Calatorie",             "calatorie"),
    "Click & Grow":         ("clickandgrow.com", "Casa & Gradina",        "casa"),
    "Electrolux.ro":        ("electrolux.ro",    "Casa & Gradina",        "casa"),
    "GetResponse Inc.":     ("getresponse.com",  "Software & Aplicatii",  "software-business"),
    "HideMy.Name global":   ("hidemy.name",      "VPN & Securitate",      "vpn"),
    "NUTRACEUTICS RO/HU":   ("nutraceutics.ro",  "Sanatate",              "sanatate"),
    "NordPass":             ("nordpass.com",     "Software & Aplicatii",  "software-business"),
    "O&O Software":         ("oo-software.com",  "Software & Aplicatii",  "software-business"),
    "PandaHall":            ("pandahall.com",    "Bijuterii",             "bijuterii"),
    "Philips.ro":           ("philips.ro",       "Electronice & IT",      "electronice"),
    "SilverRushStyle":      ("silverrushstyle.com", "Bijuterii",          "bijuterii"),
    "Tenergy":              ("tenergy.com",      "Electronice & IT",      "electronice"),
    "Trampoline Parts and Supply": ("trampolinepartsandsupply.com", "Sport", "sport"),
    "zChocolat.com":        ("zchocolat.com",    "Cadouri",               "idei-cadouri"),
    # Domeniu cunoscut, dar deja prezente pe alta retea (verificat in output.json) -
    # ramase in dictionar doar ca sa cada pe ramura "skipped_existing", nu "unknown"
    "DHGate":                ("dhgate.com",       "Online Mall",           "online-mall"),
    "NordVPN":               ("nordvpn.com",      "VPN & Securitate",      "vpn"),
    "Jalbum":                ("jalbum.net",       "Software & Aplicatii",  "software-business"),
    "Brasty.ro":             ("brasty.ro",        "Fashion",               "fashion"),
}
# Sarite deliberat (domeniu incert, nu se ghiceste): Diecast, GearUP,
# Tvrzenaskla/Momanio Europe, Unizdrav cz/sk/hu, Skytours US.


def load_existing_domains():
    existing = set()
    for path in (EXTRA_PATH, OUTPUT_PATH):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                items = json.load(f)
            for m in items:
                url = (m.get("url") or "").lower()
                for prefix in ("https://www.", "http://www.", "https://", "http://"):
                    if url.startswith(prefix):
                        url = url[len(prefix):]
                        break
                existing.add(url.rstrip("/"))
    return existing


def build_merchant(advertiser, adv_cid, domain, cat_name, cat_slug):
    return {
        "magazin": domain,
        "url": f"https://{domain}",
        "url_afiliat": f"https://www.awin1.com/cread.php?awinmid={adv_cid}&awinaffid={AWIN_AFFID}&clickref=",
        "logo_url": f"https://logo.clearbit.com/{domain}",
        "categorie": cat_name,
        "categorie_slug": cat_slug,
        "comision": "Variabil",
        "rank": None,
        "scor_afiliere": 60,
        "scor_final": 60,
        "prioritate": "standard",
        "canal_recomandat": "Content, Social",
        "sales_number": 0,
        "trend": 0,
        "are_promotie": False,
        "cod_cupon": False,
        "zile_ramase": 0,
        "promotii": [],
        "folosit_de": 0,
        "procent_succes": 80,
        "exclusiv": False,
        "platforma": "awin",
        "program_name": advertiser,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", default=DEFAULT_CSV)
    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(f"CSV lipsa: {args.file}")
        return

    with open(args.file, "r", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    print(f"Randuri CSV: {len(rows)}")

    advertisers_active = {}
    for r in rows:
        if (r.get("RELATIONSHIP STATUS") or "").strip().lower() != "active":
            continue
        adv = (r.get("ADVERTISER") or "").strip()
        cid = (r.get("ADV_CID") or "").strip()
        if adv and cid and adv not in advertisers_active:
            advertisers_active[adv] = cid
    print(f"Advertiseri activi unici: {len(advertisers_active)}")

    existing = load_existing_domains()
    new_merchants = []
    skipped_unknown = []
    skipped_existing = []
    for adv, cid in advertisers_active.items():
        if adv not in KNOWN_ADVERTISERS:
            skipped_unknown.append(adv)
            continue
        domain, cat_name, cat_slug = KNOWN_ADVERTISERS[adv]
        if domain in existing:
            skipped_existing.append((adv, domain))
            continue
        new_merchants.append(build_merchant(adv, cid, domain, cat_name, cat_slug))
        existing.add(domain)

    print(f"\nMagazine noi de adaugat: {len(new_merchants)}")
    for m in new_merchants:
        print(f"  + {m['magazin']:30s} {m['categorie_slug']:20s} {m['program_name']}")
    if skipped_existing:
        print(f"\nSarite (deja exista pe alta retea): {len(skipped_existing)}")
        for adv, d in skipped_existing:
            print(f"  = {d} ({adv})")
    if skipped_unknown:
        print(f"\nSarite (domeniu necunoscut, de confirmat manual): {len(skipped_unknown)}")
        for adv in skipped_unknown:
            print(f"  ? {adv}")

    extras = []
    if os.path.exists(EXTRA_PATH):
        with open(EXTRA_PATH, "r", encoding="utf-8") as f:
            extras = json.load(f)
    old = len(extras)
    extras.extend(new_merchants)
    with open(EXTRA_PATH, "w", encoding="utf-8") as f:
        json.dump(extras, f, ensure_ascii=False, indent=2)
    print(f"\nextra_merchants: {old} -> {len(extras)} (+{len(new_merchants)})")
    print("\nUrmator pas: cd scripts && python merge_platforms.py")


if __name__ == "__main__":
    main()
