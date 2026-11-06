"""
categorii_produse.py — in ce categorie intra un produs (04.11.2026).

`normalize_cat_slug` cauta bucati de cuvant in categoria din feed, deci „cat" se potrivea cu „Uncategorized" si
„CATEGORII PRODUSE" (corturi si globuri la Animale), „Game" de la Farmec (gama de produse) intra la Jocuri prin
potrivirea inversa cu „games", iar „Zenbook" la Carti prin „book". Masurat: 997 de produse la Animale, peste
jumatate din categorii care nu spun nimic.

Pasul ruleaza la gatuitura, dupa ce toti scriitorii au terminat, si recalculeaza TOATE produsele, inclusiv pe cele
pastrate din rularile trecute: potrivire pe CUVANT INTREG, iar cand feed-ul nu spune nimic, categoria magazinului.

Rulare: `python categorii_produse.py`, `--test`.
"""
from __future__ import annotations

import io
import json
import os
import re
import sys

import unicodedata

from continut_restrictionat import e_restrictionat
from text_curat import fara_entitati, punctuatie, titlu_produs
from fetch_product_feeds import CATEGORY_SLUG_MAP, MERCHANT_SLUG_FALLBACK

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PRODUSE = os.path.join(ROOT, "frontend", "public", "products.json")
OUTPUT = os.path.join(ROOT, "frontend", "public", "output.json")
INDENT = 2

# Categorii de feed care nu spun nimic despre produs.
RE_GENERICA = re.compile(r"uncategori[sz]ed|no ?category|default category|categorii produse|nealocat|toate produsele|all products|^game$|^general$|^diverse$|^altele$", re.I)
# Chei prea scurte sau ambigue: „cat" (pisica in engleza) apare in orice „category", „aur" si „bio" nu spun tipul produsului, „cd" nici atat.
CHEI_AMBIGUE = {"cat", "dog", "aur", "argint", "bio", "organic", "cd", "dvd", "pet", "moto", "auto"}
# Categoria magazinului (output.json) -> pagina /produse. Marketplace, servicii, software, calatorii: magazinul nu spune tipul produsului.
DIN_MAGAZIN = {
    "fashion": "fashion", "electronice": "electronice", "beauty": "beauty", "sport": "sport", "casa-gradina": "casa", "copii": "copii",
    "sanatate": "farmacie", "carti-educatie": "carti", "auto-moto": "auto", "animale": "animale", "mancare-bauturi": "alimente", "bijuterii": "bijuterii",
}
# Tipul din titlu bate orice categorie: „Laptop ASUS Zenbook" nu e carte, oricum ar scrie feed-ul.
TIP_DIN_TITLU = [
    (re.compile(r"^(?:\w+\s+){0,2}(laptop|telefon|televizor|monitor|tableta|imprimanta|placa video|ssd|router)\b", re.I), "electronice"),
    (re.compile(r"^(?:\w+\s+){0,2}(kit combo|masina de gaurit|bormasina)\b", re.I), "casa"),
    (re.compile(r"^(?:\w+\s+){0,1}(masuta|masute|masa|canapea|fotoliu|saltea|pat tapitat|cabina de dus|pahar\w*|set \d+ masute)\b", re.I), "casa"),
    (re.compile(r"\b(crema|lotiune|ser facial|sampon|parfum|apa de parfum|fond de ten|set cadou (?:femei|barbati))\b", re.I), "beauty"),
]
# Materiale pentru cabinete si laboratoare: nu sunt pentru cumparatorul de pe site, deci nu stau pe paginile de categorie.
RE_PROFESIONAL = re.compile(r"\b(reactivi\w*|sutura chirurgicala|fire de sutura|cort evenimente|garaj tip cort|cort tip pavilion)\b", re.I)


# Pe categoriile mici, feed-ul si magazinul nu ajung: „Set 6 cesti" de la un magazin de bijuterii sau „Cutit utilitar" de la unul de
# alimente. Aici titlul trebuie sa spuna singur tipul produsului (cererea lui Alex: verificat inainte sa apara pe pagina).
VOCABULAR = {
    "animale": r"\b(hrana|conserv\w*|recompens\w*|pate|zgard\w*|ham|lesa|litier\w*|acvariu\w*|antiparazit\w*|caini|caine|catei|pisici|pisica|papagal\w*|peste|testoas\w*|tetra|juwel|friskies|royal canin|proplan|purina)\b",
    "alimente": r"\b(miere|ulei|cafea\w*|ceai\w*|sos|sosuri|condiment\w*|amestec|biscuit\w*|nuci|alune|migdale|ton|sardine|masline|vin|vinuri|gin|whisky|vodca|rom|bere|bautur\w*|limonad\w*|pudra|goji|faina|paste|orez|ciocolat\w*|bomboan\w*|jeleu|topping|piure|proteina|seminte|mustar|sare|merisoare|coacaze|sirop|gem|dulceata|caju|fleur de sel|sumac|espresso|capsule cafea|boabe)\b",
    "jocuri": r"\b(joc|jocul|jocuri|puzzle|sah|table|monopoly|dobble|risk|catan|consol\w*|joystick|gamepad|controller|tabla de)\b",
    "bijuterii": r"\b(inel|inele|bratara|bratari|colier\w*|cercei|cercel|pandantiv\w*|lant|lantisor|brosa|verighet\w*)\b",
    "sport": r"\b(bicicleta|biciclete|ghete|minge|mingi|gantere|gantera|haltere|discuri|banda de alergare|trotineta|cort|rucsac|bocanci|fitness|yoga|squat|home gym|fotbal|tenis|schi|casca|drumetie|alergare|antrenament|carlig\w*|lanseta|mulineta|wall ball|bare olimpice)\b",
    "fashion": r"\b(rochie|rochii|bluza|bluze|camasa|camasi|tricou|tricouri|pantaloni|blugi|fusta|fuste|sacou|palton|geaca|jacheta|pulover|cardigan|hanorac|compleu|costum|salopeta|colanti|dresuri|sosete|pantofi|cizme|ghete|botine|sandale|saboti|adidasi|sneakers|incaltaminte|papuci|espadrile|geanta|genti|portofel|curea|esarfa|sal|fular|manusi|caciula|sapca|palarie|ochelari de soare|cravata|ie|ceas|vesta|top|body)\b",
    "electronice": r"\b(laptop|telefon|televizor|monitor|tableta|imprimanta|multifunctionala|placa video|placa de baza|procesor|ssd|hdd|router|switch|camera (?:supraveghere|ip|foto|web)|aparat foto|casti|boxa|boxe|soundbar|smartwatch|incarcator|power bank|baterie externa|cablu|mouse|tastatura|consola|carcasa|memorie ram|stick usb|videoproiector|proiector|drona|kindle|husa)\b",
    "beauty": r"\b(crema|creme|ser|lotiune|sampon|balsam|masca|mask|parfum|apa de parfum|apa de toaleta|eau de|body mist|deodorant|fond de ten|ruj|rimel|mascara|creion de ochi|fard|oja|lac de unghii|gel de dus|sapun|exfoliant|scrub|ulei de par|ulei de corp|vopsea de par|spuma|after shave|machiaj|demachiant|tonic|rubber base|top coat|builder)\b",
    "casa": r"\b(pat|saltea|canapea|fotoliu|scaun|masa|masuta|birou|dulap|comoda|noptiera|biblioteca|raft|lenjerie|perna|perne|pilota|patura|cuvertura|prosop|perdea|draperie|covor|lustra|aplica|bec|veioza|oglinda|tigaie|oala|cratita|farfurii|pahar|tacamuri|cutit|aspirator|frigider|combina|cuptor|plita|masina de spalat|uscator|espressor|mixer|blender|fier de calcat|cabina de dus|bideu|lavoar|chiuveta|burghiu|bormasina|trusa scule|surubelnita|polizor|ferastrau|roaba|furtun|ghiveci|masina de tuns|motocultor|incalzitor|calorifer|aer conditionat|ventilator|dezumidificator|purificator|tablou|vaza)\b",
    "copii": r"\b(jucarie|jucarii|papusa|papusi|masinuta|lego|carucior|patut|scaun auto|ghiozdan|pentru copii|fetite|baieti|bebe|bebelus\w*|trusou|premergator|tricicleta|montessori|macheta|casuta de papusi|suzeta|biberon)\b",
    "farmacie": r"\b(vitamin\w*|magneziu|zinc|calciu|fier|omega|colagen|probiotic\w*|capsule|comprimate|tablete|sirop|unguent|picaturi|supliment\w*|ulei esential|tinctura|propolis|test de sarcina|tensiometru|termometru|plasturi|bandaj|pastile|extract|scutece adulti|spirulina)\b",
    "auto": r"\b(anvelop\w*|navigatie|filtru|ulei motor|camera dvr|camera auto|stop|far|bare transversale|redresor|jante|covorase|sonda lambda|motor complet|oglinda|bandou|demaror|dressing|cocpit|alcooltest|pistol pneumatic|podea caroserie|modul confort)\b|\b\d{3}/\d{2} ?z?r\d{2}\b",
}
VOCABULAR = {k: re.compile(v) for k, v in VOCABULAR.items()}
# Magazin din Ungaria cu feed in maghiara: un cumparator din Romania nu citeste „taktikai nadrag".
# Rucsacul „cu compartiment laptop" si boxa auto nu sunt electronice de vitrina.
TIP_MUTAT = [(re.compile(r"^rucsac\b"), "fashion"), (re.compile(r"^boxa auto\b"), "auto")]
# bsgmag.ro vinde produse reconditionate, dar titlul din feed nu spune asta (pe site: „4 stari estetice: Ca nou, Excelent...").
MAGAZINE_RECONDITIONATE = {"bsgmag.ro"}
ETICHETA_RECONDITIONAT = " (recondiționat)"
RE_NU_COPII = re.compile(r"\b(peru\w*|papagal\w*|caini|pisici|ferplast)\b")
RE_NU_CARTE = re.compile(r"\b(breloc|kit|puzzle|jucarie|pix|ghiozdan|joc|stampila|carte senzoriala)\b")
RE_MAGHIARA = re.compile(r"[\u0151\u0171\u0150\u0170]|\b(fekete|eredeti|taktikai|nadr\u00e1g|sapka|n\u00e9met|f\u00e9rfi|n\u0151i|kab\u00e1t|cip\u0151)\b", re.I)


def _simplu(t: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFKD", t or "") if not unicodedata.combining(c)).lower()


def _cuvant(cheie: str, text: str) -> bool:
    return bool(re.search(rf"(?<![^\W\d_]){re.escape(cheie)}(?![^\W\d_])", text))


CHEI = sorted((k for k in CATEGORY_SLUG_MAP if k not in CHEI_AMBIGUE), key=len, reverse=True)


def din_feed(brut: str) -> str:
    """Pagina dupa categoria din feed, doar pe cuvant intreg. Gol daca feed-ul nu spune nimic."""
    c = re.sub(r"\s+", " ", (brut or "").replace("\xa0", " ")).strip().lower()
    if not c or RE_GENERICA.search(c):
        return ""
    if c in CATEGORY_SLUG_MAP:
        return CATEGORY_SLUG_MAP[c]
    for k in CHEI:
        if _cuvant(k, c):
            return CATEGORY_SLUG_MAP[k]
    return ""


def categorie(p: dict, magazine: dict) -> str:
    titlu = p.get("title") or ""
    if RE_PROFESIONAL.search(titlu) or RE_MAGHIARA.search(titlu) or RE_MAGHIARA.search(p.get("category") or ""):
        return "altele"
    for tipar, slug in TIP_DIN_TITLU:
        if tipar.search(titlu):
            return slug
    magazin = (p.get("merchant_slug") or "").lower()
    gasit = din_feed(p.get("category") or "")
    if not gasit and magazin in magazine:
        gasit = DIN_MAGAZIN.get(magazine[magazin], "")
    if not gasit:
        gasit = next((slug for k, slug in MERCHANT_SLUG_FALLBACK.items() if k in magazin), "")
    simplu = _simplu(titlu)
    for tipar, slug in TIP_MUTAT:
        if tipar.search(simplu):
            return slug
    if gasit in VOCABULAR and not VOCABULAR[gasit].search(simplu):
        return "altele"
    # Pe paginile mari, cuvantul potrivit poate sta intr-un titlu pentru altceva.
    if (gasit == "copii" and RE_NU_COPII.search(simplu)) or (gasit == "carti" and RE_NU_CARTE.search(simplu)):
        return "altele"
    return gasit or "altele"


def ruleaza() -> int:
    with io.open(PRODUSE, encoding="utf-8") as h:
        d = json.load(h)
    lista = d.get("products", d) if isinstance(d, dict) else d
    with io.open(OUTPUT, encoding="utf-8") as h:
        magazine = {(m.get("magazin") or "").lower(): m.get("categorie_slug") or "" for m in json.load(h)}
    schimbate = 0
    # Produsele pentru adulti nu stau in listarile generale, nici cand titlul nu spune nimic.
    adulti = [p for p in lista if e_restrictionat(p)]
    if adulti:
        lista[:] = [p for p in lista if not e_restrictionat(p)]
        print(f"  produse pentru adulti scoase din listari: {len(adulti)}")
        if isinstance(d, dict) and "count" in d:
            d["count"] = len(lista)
    # Magazinele care interzic in 2Performant site-urile de cupoane (06.11.2026): nici produsele lor nu se listeaza,
    # fiindca linkul platit ar pleca tot de pe AmCupon. Lista o scrie merge_platforms.py.
    try:
        with io.open(os.path.join(os.path.dirname(OUTPUT), "magazine-fara-cupoane.json"), encoding="utf-8") as h:
            fara_cupoane = {(x.get("magazin") or "").lower() for x in json.load(h)}
    except (OSError, ValueError):
        fara_cupoane = set()
    interzise = [p for p in lista if (p.get("merchant_slug") or "").lower() in fara_cupoane]
    if interzise:
        lista[:] = [p for p in lista if (p.get("merchant_slug") or "").lower() not in fara_cupoane]
        print(f"  produse ale magazinelor care interzic site-urile de cupoane, scoase: {len(interzise)}")
        if isinstance(d, dict) and "count" in d:
            d["count"] = len(lista)
    for p in lista:
        titlu = re.sub(r"^descriere\s+", "", p.get("title") or "", flags=re.I)
        if (p.get("merchant_slug") or "").lower() in MAGAZINE_RECONDITIONATE and "recondi" not in titlu.lower():
            titlu += ETICHETA_RECONDITIONAT
        # 06.11.2026: entitati („Tom&nbsp;Ford"), punctuatie („sterilizate,, cu somon") si marca dubla („Seiko Seiko").
        if p.get("brand"):
            p["brand"] = punctuatie(fara_entitati(p["brand"]))
        if isinstance(p.get("category"), str) and p["category"]:
            p["category"] = fara_entitati(p["category"])  # „Health &amp; Beauty > ..."
        p["title"] = titlu_produs(titlu, p.get("brand") or "")
        nou = categorie(p, magazine)
        if nou != p.get("cat_slug"):
            p["cat_slug"] = nou
            schimbate += 1
    with io.open(PRODUSE, "w", encoding="utf-8", newline="") as h:
        json.dump(d, h, ensure_ascii=False, indent=INDENT)
    print(f"Categorii de produse: {schimbate} corectate din {len(lista)}.")
    # Produsele restrictionate (doar pe pagina magazinului lor) primesc aceeasi curatare de text.
    cale_r = os.path.join(os.path.dirname(PRODUSE), "products-restrictionate.json")
    if os.path.exists(cale_r):
        with io.open(cale_r, encoding="utf-8") as h:
            dr = json.load(h)
        lr = dr.get("products", []) if isinstance(dr, dict) else dr
        for p in lr:
            if p.get("brand"):
                p["brand"] = punctuatie(fara_entitati(p["brand"]))
            if isinstance(p.get("category"), str):
                p["category"] = fara_entitati(p["category"])
            p["title"] = titlu_produs(p.get("title") or "", p.get("brand") or "")
        with io.open(cale_r, "w", encoding="utf-8", newline="") as h:
            json.dump(dr, h, ensure_ascii=False, indent=INDENT)
    return 0


def test() -> int:
    mag = {"petmax.ro": "animale", "farmec.ro": "beauty", "x.ro": "marketplace", "topline.ro": "casa-gradina"}
    ok = [
        ("Uncategorized nu inseamna animale", din_feed("Uncategorized"), ""),
        ("CATEGORII PRODUSE nu inseamna animale", din_feed("CATEGORII PRODUSE"), ""),
        ("Zenbook nu e carte", din_feed("Zenbook"), ""),
        ("Caini ramane la animale", din_feed("Caini"), "animale"),
        ("Jocuri de societate ramane la jocuri", din_feed("Jocuri de societate"), "jocuri"),
        ("carte ramane la carti", din_feed("Carte"), "carti"),
        ("Game de la Farmec e cosmetica", categorie({"title": "Masca Nufar Universal", "category": "Game", "merchant_slug": "farmec.ro"}, mag), "beauty"),
        ("fara categorie, se ia a magazinului", categorie({"title": "Hrana uscata", "category": "Uncategorized", "merchant_slug": "petmax.ro"}, mag), "animale"),
        ("marketplace nu spune tipul", categorie({"title": "Glob pamantesc", "category": "Uncategorized", "merchant_slug": "x.ro"}, mag), "altele"),
        ("laptopul nu e carte", categorie({"title": "Laptop ASUS Zenbook S16", "category": "Carte", "merchant_slug": "x.ro"}, mag), "electronice"),
        ("masuta de cafea nu e aliment", categorie({"title": "Set 4 masute cafea GRS 2223", "category": "Cafea", "merchant_slug": "x.ro"}, mag), "casa"),
        ("crema nu e joc", categorie({"title": "Crema CC SPF 20", "category": "Game", "merchant_slug": "farmec.ro"}, mag), "beauty"),
        ("cortul de evenimente nu e pentru animale", categorie({"title": "6x10 m Cort Evenimente PROFESSIONAL", "category": "CATEGORII PRODUSE", "merchant_slug": "topline.ro"}, mag), "altele"),
        ("reactivii de laborator nu sunt pentru cumparator", categorie({"title": "REACTIVI HEMATO BC-2800VET", "category": "Farmacie", "merchant_slug": "x.ro"}, mag), "altele"),
        ("cestile nu sunt bijuterii, oricum s-ar numi magazinul", categorie({"title": "Set 6 cesti cu farfurioare din ceramica", "category": "Ceramica", "merchant_slug": "b.ro"}, {"b.ro": "bijuterii"}), "altele"),
        ("inelul ramane la bijuterii", categorie({"title": "Inel argint cu chihlimbar", "category": "Inele", "merchant_slug": "b.ro"}, {"b.ro": "bijuterii"}), "bijuterii"),
        ("cutitul nu e aliment", categorie({"title": "Cutit utilitar La Sebi Acasa", "category": "Oferte speciale", "merchant_slug": "a.ro"}, {"a.ro": "mancare-bauturi"}), "altele"),
        ("mierea ramane la alimente", categorie({"title": "Miere Manuka MGO 100+ - 1kg", "category": "Default", "merchant_slug": "a.ro"}, {"a.ro": "mancare-bauturi"}), "alimente"),
        ("lotiunea nu e aliment", categorie({"title": "Lotiune de corp Happiness", "category": "Default", "merchant_slug": "a.ro"}, {"a.ro": "mancare-bauturi"}), "beauty"),
        ("titlul in maghiara nu sta pe o pagina romaneasca", categorie({"title": "BW polar sapka fekete", "category": "Ruhazat", "merchant_slug": "w.ro"}, {"w.ro": "sport"}), "altele"),
        ("creioanele de par nu sunt joc", categorie({"title": "Set 6 creioane colorate pentru par", "category": "Jocuri pentru copii", "merchant_slug": "c.ro"}, {}), "altele"),
        ("produsul din categoria de adulti e restrictionat", e_restrictionat({"title": "Curea din silicon colorat Dream Toys", "category": "Mature > Erotic > Sex Toys & Erotic Game", "merchant_slug": "o.ro"}), True),
        ("snusul e restrictionat", e_restrictionat({"title": "Pouch Garant Snus (Grant) Prime Colle", "category": "Sanatate", "merchant_slug": "f.ro"}), True),
        ("lichidul de vape e restrictionat", e_restrictionat({"title": "Longfill Dinner Lady Hyper Blueberry", "category": "Electronice", "merchant_slug": "f.ro"}), True),
        ("luneta nu e electronica", categorie({"title": "Luneta de arma pentru vanatoare Leupold", "category": "Electronice", "merchant_slug": "f.ro"}, {}), "altele"),
        ("protocolul de sanatate nu e la farmacie", categorie({"title": "PROTOCOL ALZHEIMER", "category": "Farmacie", "merchant_slug": "f.ro"}, {}), "altele"),
        ("vitamina ramane la farmacie", categorie({"title": "Biolectra Magneziu 300 mg", "category": "Farmacie", "merchant_slug": "f.ro"}, {}), "farmacie"),
        ("ramele nu sunt cosmetice", categorie({"title": "Rame de ochelari Burberry BE2471U", "category": "", "merchant_slug": "b.ro"}, {"b.ro": "beauty"}), "altele"),
        ("sina de aluminiu nu e moda", categorie({"title": "Sina aluminiu prindere laterala panou", "category": "", "merchant_slug": "b.ro"}, {"b.ro": "fashion"}), "altele"),
        ("jucaria pentru perus nu e pentru copii", categorie({"title": "Ferplast Jucarie Leagan Lemn Perus 40", "category": "", "merchant_slug": "b.ro"}, {"b.ro": "copii"}), "altele"),
        ("rochia ramane la moda", categorie({"title": "Rochie de zi midi in clos", "category": "", "merchant_slug": "b.ro"}, {"b.ro": "fashion"}), "fashion"),
        ("cortul de evenimente nu e sport", categorie({"title": "5x5 m Cort Evenimente ECONOMY", "category": "Sport", "merchant_slug": "b.ro"}, {}), "altele"),
        ("jocul nu e carte", categorie({"title": "so chic - joc creativ", "category": "Carti educative", "merchant_slug": "c.ro"}, {}), "altele"),
        ("rucsacul nu e electronica", categorie({"title": "Rucsac urban cu compartiment laptop", "category": "Electronice", "merchant_slug": "b.ro"}, {}), "fashion"),
        ("cartea despre jocuri ramane unde spune feed-ul", categorie({"title": "Carte Go: Speed Baduk", "category": "Carti De Sah", "merchant_slug": "x.ro"}, mag), "carti"),
    ]
    rele = [(n, a, e) for n, a, e in ok if a != e]
    for n, a, e in rele:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rele else f"{len(rele)} asteptari incalcate")
    return 1 if rele else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else ruleaza())
