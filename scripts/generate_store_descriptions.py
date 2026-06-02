"""
generate_store_descriptions.py
─────────────────────────────────────────────────────────────────────────────
Generează descriere editorială UNICĂ per magazin pentru paginile /cod-reducere/[magazin].
Scop: pagini „groase" (conținut unic) → Google le indexează (rezolvă „Descoperită – nu e indexată").

ARHITECTURĂ:
- Descrierile sunt EVERGREEN → se generează O DATĂ local cu Ollama (AI, text unic) + incremental.
- Rulează LOCAL (Ollama la localhost:11434). Rezultatul (store-descriptions.json) se comite în git.
- Incremental: sare peste magazinele deja generate (poți relua oricând).
- FALLBACK template dacă Ollama nu răspunde (ca să meargă și fără AI).
- FACTUAL: folosește DOAR numele + categoria reală. NU inventează coduri/prețuri.

UTILIZARE:
    python generate_store_descriptions.py            # toate magazinele lipsă
    python generate_store_descriptions.py --limit 10 # doar 10 (test)
    python generate_store_descriptions.py --force     # regenerează tot

OUTPUT: frontend/public/store-descriptions.json
    { "noriel.ro": {"titlu": "...", "paragrafe": ["...","..."], "sursa": "ollama"} }
"""

import json, os, sys, time, argparse, urllib.request

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try: sys.stdout.reconfigure(encoding="utf-8")
    except Exception: pass

HERE = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON = os.path.join(HERE, "..", "frontend", "public", "output.json")
DEST_JSON   = os.path.join(HERE, "..", "frontend", "public", "store-descriptions.json")
OLLAMA = "http://localhost:11434"

CATEGORIE_RO = {
    "fashion": "modă, haine și accesorii",
    "electronics-itc": "electronice, IT și gadgeturi",
    "beauty": "cosmetice și produse de îngrijire",
    "home-garden": "casă, mobilier și grădină",
    "sports-outdoors": "sport, fitness și echipamente outdoor",
    "pharma": "farmacie, suplimente și sănătate",
    "babies-kids-toys": "produse pentru copii, jucării și articole pentru bebeluși",
    "automotive": "piese auto, accesorii și produse pentru mașini",
    "books": "cărți, manuale și produse de papetărie",
    "hypermarket-groceries": "alimente și produse de hipermarket",
    "gifts-flowers": "cadouri și flori",
    "telecom": "telefoane, abonamente și produse telecom",
    "pet-supplies": "produse pentru animale de companie",
    "health-personal-care": "sănătate și îngrijire personală",
    "jewelry": "bijuterii și ceasuri",
    "games": "jocuri video și console",
    "online-mall": "produse variate din toate categoriile",
    "office-supplies": "rechizite și produse de birou",
}


def nume_afisat(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.split(".")[0].replace("-", " ").split())


# ─────────────────────────────────────────────────────────────────────────────
# MOTOR: descrieri din DATE REALE + română corectă + variante rotite determinist.
# NU folosim LLM mic (llama3.2) — produce română stricată care strică SEO.
# Unicitatea vine din: categorie reală + nume + oferte reale + rotație de fraze.
# ─────────────────────────────────────────────────────────────────────────────

# 4 variante pentru fiecare secțiune (corecte gramatical). Rotite după hash slug.
INTRO = [
    "{nume} este un magazin online din categoria {cat}, unde găsești o gamă variată de produse la prețuri competitive.",
    "Pe {nume} descoperi {cat}, cu o ofertă care se înnoiește frecvent de-a lungul anului.",
    "{nume} se numără printre magazinele de {cat} apreciate în România pentru raportul bun dintre calitate și preț.",
    "Dacă te interesează {cat}, {nume} este o opțiune solidă pentru cumpărăturile tale online.",
]

# Paragraf oferte — cu promoții active (folosește date reale)
PROMO_DA = [
    "Chiar acum, {nume} are {n} {ofcuv} {activ} pe AmCupon.ro, printre care „{promo}”. Verificăm zilnic codurile de reducere ca să prinzi cel mai bun preț înainte să finalizezi comanda.",
    "Momentan găsești {n} {ofcuv} {activ} pentru {nume}, inclusiv „{promo}”. Pe AmCupon.ro actualizăm aceste reduceri zilnic, ca informația să fie mereu corectă.",
    "{nume} are în acest moment {n} {ofcuv} {activ}, cum este „{promo}”. Toate sunt verificate și reîmprospătate zilnic pe AmCupon.ro.",
]
# Paragraf oferte — fără promoții active
PROMO_NU = [
    "Pe AmCupon.ro urmărim zilnic promoțiile {nume} și adăugăm codurile de reducere imediat ce devin active. Salvează pagina la favorite și revino des — ofertele de {cat} apar frecvent.",
    "În acest moment nu există un cod activ pentru {nume}, dar verificăm zilnic. Adaugă pagina la favorite ca să fii primul care prinde următoarea reducere de {cat}.",
    "Codurile {nume} se schimbă des. Pe AmCupon.ro monitorizăm zilnic ofertele de {cat} și le publicăm aici de îndată ce apar.",
]
# Paragraf „cum funcționează / gratuit"
CUM = [
    "Folosirea unui cod {nume} este simplă: îl copiezi de pe AmCupon.ro, îl aplici în coș la câmpul „Cod promoțional”, iar reducerea se scade automat. Serviciul este 100% gratuit pentru tine.",
    "Ca să economisești, copiază codul {nume} de aici, adaugă produsele în coș și introdu-l la finalizarea comenzii. Nu plătești nimic în plus — AmCupon.ro este gratuit.",
    "Codurile de pe AmCupon.ro sunt gratuite. Copiezi codul {nume}, îl introduci la „Voucher” în coș și prețul scade înainte de plată.",
]

OFCUV = {1: ("ofertă", "activă"), 2: ("oferte", "active")}


def _idx(slug: str, mod: int) -> int:
    return sum(ord(c) for c in slug) % mod


def construieste_descriere(slug: str, nume: str, cat_txt: str,
                           are_promo: bool, nr_promo: int, primul_promo: str) -> list[str]:
    """Returnează 3 paragrafe corecte, variate, din date reale."""
    p1 = INTRO[_idx(slug, 4)].format(nume=nume, cat=cat_txt)

    if are_promo and nr_promo > 0:
        ofcuv, activ = OFCUV.get(min(nr_promo, 2), ("oferte", "active"))
        promo_scurt = (primul_promo or "").strip()
        if len(promo_scurt) > 70:
            promo_scurt = promo_scurt[:67].rstrip() + "…"
        p2 = PROMO_DA[_idx(slug, 3)].format(
            nume=nume, n=nr_promo, ofcuv=ofcuv, activ=activ, promo=promo_scurt
        )
    else:
        p2 = PROMO_NU[_idx(slug, 3)].format(nume=nume, cat=cat_txt)

    p3 = CUM[_idx(slug + "x", 3)].format(nume=nume)
    return [p1, p2, p3]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="max magazine de procesat (0 = toate)")
    ap.add_argument("--force", action="store_true", help="regenerează chiar dacă există deja")
    args = ap.parse_args()

    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    existing = {}
    if os.path.exists(DEST_JSON) and not args.force:
        try:
            with open(DEST_JSON, encoding="utf-8") as f:
                existing = json.load(f)
        except Exception:
            existing = {}

    RETELE = {"profitshare.ro", "2performant.com"}
    todo = [
        m for m in magazine
        if m.get("magazin")
        and m["magazin"] not in RETELE
        and " " not in m["magazin"]
        and (args.force or m["magazin"] not in existing)
    ]
    if args.limit:
        todo = todo[:args.limit]

    print(f"📦 {len(magazine)} magazine | {len(existing)} deja generate | {len(todo)} de procesat")
    if not todo:
        print("✅ Nimic de făcut — toate au descriere.")
        return

    rezultat = dict(existing)
    for i, m in enumerate(todo, 1):
        slug = m["magazin"]
        nume = nume_afisat(slug)
        cat_slug = m.get("categorie_slug", "") or ""
        cat_txt = CATEGORIE_RO.get(cat_slug, "produse variate")
        are_promo = bool(m.get("are_promotie"))
        promotii = m.get("promotii", []) or []
        primul = promotii[0].get("nume", "") if promotii else ""

        rezultat[slug] = {
            "titlu": f"Despre codurile de reducere {nume}",
            "paragrafe": construieste_descriere(
                slug, nume, cat_txt, are_promo, len(promotii), primul
            ),
            "sursa": "data-template",
        }

    with open(DEST_JSON, "w", encoding="utf-8") as f:
        json.dump(rezultat, f, ensure_ascii=False, indent=1)

    print(f"✅ Generat {len(todo)} descrieri | total în fișier: {len(rezultat)}")
    print(f"   → {DEST_JSON}")


if __name__ == "__main__":
    main()
