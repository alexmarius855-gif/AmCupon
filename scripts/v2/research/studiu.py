"""
Studiul de cerere: din sugestiile colectate (colectare.py) si din ce avem deja pe site scoate:
  1. magazinele pe care oamenii le cauta cu „cod reducere / voucher" si unde stam cu fiecare;
  2. cererea pentru magazinele noastre (cu oferta / fara oferta);
  3. ce adauga oamenii langa numele magazinului (cod, pareri, retur, Black Friday);
  4. produsele: ce completari cauta oamenii, la ce magazine se gandesc, ce avem la parteneri;
  5. Black Friday: ce magazine asociaza oamenii cu el;
  6. intrebarile reale (hook-uri pentru articole si video);
  7. ce facem cu asta, in ordine.

O sugestie = cautarea e destul de frecventa cat s-o propuna motorul. Nu e volum: raportul nu inventeaza
numere de cautari. Un magazin propus de 3 motoare e un semnal mai sigur decat unul propus de unul singur.

    python scripts/v2/research/studiu.py --sugestii research-out/sugestii.json --dir research-out
    python scripts/v2/research/studiu.py --test
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comun import STARI, Magazine, compact, nume_afisat, norm  # noqa: E402

LUNI = {"ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie",
        "octombrie", "noiembrie", "decembrie"}
# Cuvinte pe care oamenii le adauga langa numele magazinului; nu fac parte din nume.
CALIFICATIVE = LUNI | {
    "ro", "romania", "online", "prima", "comanda", "comenzi", "transport", "gratuit", "gratis", "livrare", "black",
    "friday", "cyber", "monday", "craciun", "student", "studenti", "aplicatie", "app", "nou", "noi", "client",
    "clienti", "valabil", "valabile", "activ", "active", "azi", "astazi", "reddit", "forum", "cod", "coduri",
    "reducere", "reduceri", "voucher", "vouchere", "cupon", "cupoane", "promo", "promotional", "promotionale",
    "discount", "lei", "ron", "off", "free", "shipping", "first", "order", "code", "codes", "new", "customer",
    "la", "de", "pe", "din", "pentru", "si", "cu", "fara", "cand", "incepe", "este", "data", "oferte", "oferta",
    "catalog", "pliant", "magazin", "magazine", "site", "www", "com", "anul", "acesta", "urmator", "2025",
    "2026", "2027", "septembrie", "influencer", "abonament", "abonare", "newsletter", "inregistrare",
}
PREPOZITII = {"la", "de", "pe", "din", "pentru", "si", "cu", "fara"}  # nu le numaram ca „ce adauga oamenii"
# „voucher" inseamna des altceva decat un cod de magazin: tichete de masa, de vacanta, programe de stat.
GENERICE = {"vacanta", "de vacanta", "cadou", "masa", "de masa", "edenred", "pluxee", "sodexo", "up", "rabla",
            "rabla plus", "electrocasnice", "energie", "turistic", "cultural", "culturale", "social", "sociale",
            "card", "carduri", "bilete", "bilet", "casa verde", "fotovoltaice", "carburant", "combustibil",
            "rovinieta", "carte", "carti", "haine", "pantofi", "telefon", "laptop", "zbor", "avion", "hotel",
            "mancare", "pizza", "taxi", "cinema", "spa", "masaj"}
INTREBARE = re.compile(r"^(cum|ce|care|cand|unde|de ce|cat|cate|cati|merita|exista|se poate|pot)\b|"
                       r"\b(vs|sau|pareri|parere|recenzii|review|reviews|forum|reddit|merita|e bun|este bun)\b")
INTENTII_NUME = [
    ("cupon", re.compile(r"\b(cod|coduri|voucher|vouchere|reducere|reduceri|cupon|promo|promotional|discount)\b")),
    ("black_friday", re.compile(r"\b(black friday|cyber monday|craciun|reduceri de iarna)\b")),
    ("incredere", re.compile(r"\b(pareri|parere|recenzii|review|reviews|reclamatii|reclamatie|forum|teapa|anpc|"
                             r"sigur|de incredere|legit|scam|reddit)\b")),
    ("livrare_retur", re.compile(r"\b(livrare|retur|returnare|awb|tracking|colet|curier|transport|ramburs|plata|"
                                 r"easybox|garantie|anulare comanda|comanda)\b")),
    ("contact_cont", re.compile(r"\b(contact|telefon|login|cont|adresa|showroom|sediu|angajari|cariere|job|"
                                r"program|locatii|magazin fizic)\b")),
]
ETICHETE_INTENTII = {"cupon": "cod / voucher / reducere", "black_friday": "Black Friday / Crăciun",
                     "incredere": "păreri / recenzii / reclamații", "livrare_retur": "livrare / retur / garanție",
                     "contact_cont": "contact / cont / program", "produse": "produse și altele"}
# Magazinele la care se gandesc oamenii cand cauta un produs (parteneri sau nu).
RETAILERI = ["emag", "altex", "flanco", "dedeman", "ikea", "lidl", "kaufland", "carrefour", "auchan", "decathlon",
             "jysk", "mobexpert", "sinsay", "pepco", "zara", "h&m", "fashion days", "about you", "answear",
             "notino", "sephora", "douglas", "dr max", "catena", "sensiblu", "help net", "elefant", "carturesti",
             "libris", "cel", "pcgarage", "evomag", "vexio", "media galaxy", "brico depot", "leroy merlin",
             "hornbach", "brico", "olx", "temu", "shein", "aliexpress", "amazon", "noriel", "smyk", "otter",
             "epantofi", "deichmann", "ccc", "vidaxl", "bonprix", "orange", "vodafone", "digi", "telekom"]
# Cum recunoastem produsul in titlurile din feed (mai precis decat prefixul cuvantului).
REGEX_PRODUS = {
    "carti": r"\b(carte|carti)\b", "lego": r"\blego\b", "puzzle": r"\bpuzzle\b", "saltea": r"\bsalte(a|le)\b",
    "rochii": r"\brochi(e|i)\b", "adidasi": r"\b(adidasi|sneakers)\b", "magneziu": r"\bmagneziu\b",
    "colagen": r"\bcolagen\b", "proteine": r"\bprotein(a|e)\b", "vitamina d": r"\bvitamin(a|e) d3?\b",
    "monitor": r"\bmonitor\b", "laptop": r"\blaptop(uri)?\b", "telefon": r"\b(telefon|smartphone)\b",
    "televizor": r"\b(televizor|televizoare|smart tv)\b", "espressor": r"\b(espressor|espressoare|cafetiera)\b",
    "tableta": r"\btablet(a|e)\b", "smartwatch": r"\b(smartwatch|ceas inteligent)\b",
    "imprimanta": r"\b(imprimanta|multifunctionala)\b", "parfum dama": r"\b(parfum|apa de parfum|apa de toaleta)\b.*\b(dama|femei|women|femme)\b",
    "parfum barbati": r"\b(parfum|apa de parfum|apa de toaleta)\b.*\b(barbati|men|homme)\b",
    "jucarii copii": r"\b(jucari(e|i)|papusa|masinuta)\b", "ceas barbati": r"\bceas\b.*\bbarbati\b",
    "geanta dama": r"\b(geanta|genti)\b", "bijuterii argint": r"\b(inel|colier|bratara|cercei|pandantiv)\b.*\bargint\b",
}
STOP_PRODUS = {"cu", "de", "pentru", "la", "si"}


def ok(r: dict) -> bool:
    return r.get("stare") == "ok"


def curata_nume(rest: str) -> tuple[str, list[str]]:
    """„prima comanda emag noiembrie 2026" -> („emag", [prima, comanda, noiembrie, 2026])."""
    tok = rest.split()
    calif = []
    este_calif = lambda t: t in CALIFICATIVE or re.fullmatch(r"\d+(%|lei)?|\d+[.,]\d+", t)  # noqa: E731
    while tok and este_calif(tok[0]):
        calif.append(tok.pop(0))
    while tok and este_calif(tok[-1]):
        calif.insert(0, tok.pop())
    return " ".join(tok), calif


def este_generic(nume: str) -> bool:
    return nume in GENERICE or (nume.split() or [""])[0] in GENERICE


def magazine_din_alfabet(rezultate: list[dict], mg: Magazine) -> tuple[list[dict], Counter, list[str]]:
    """Magazinele propuse de motoare pentru „cod reducere a...", „voucher b...", „black friday c..."."""
    branduri: dict[str, dict] = {}
    calificative: Counter = Counter()
    doar_calif: Counter = Counter()
    for r in rezultate:
        if r.get("grup") not in ("alfabet", "sezon") or not ok(r):
            continue
        prefixe = [r.get("prefix")] if r.get("prefix") else ["cod reducere", "voucher", "cod promotional", "black friday"]
        for poz, s in enumerate(r.get("sugestii") or [], 1):
            t = norm(s)
            p = next((p for p in prefixe if t.startswith(p + " ")), None)
            if not p:
                continue
            nume, calif = curata_nume(t[len(p) + 1:])
            calificative.update(c for c in calif if not re.fullmatch(r"\d+(%|lei)?", c) and c not in PREPOZITII)
            if not nume:
                doar_calif[t] += 1
                continue
            if len(compact(nume)) < 2 or INTREBARE.search(nume):
                continue
            cheie = compact(nume)
            b = branduri.setdefault(cheie, {"nume": nume, "motoare": set(), "prefixe": set(), "aparitii": 0,
                                            "rang_min": 99, "forme": Counter()})
            b["motoare"].add(r["motor"])
            b["prefixe"].add(p)
            b["aparitii"] += 1
            b["rang_min"] = min(b["rang_min"], poz)
            b["forme"][nume] += 1
    rez = []
    for cheie, b in branduri.items():
        nume = b["forme"].most_common(1)[0][0]
        stare = {"cod": "generic"} if este_generic(nume) else mg.stare(nume)
        rez.append({"nume": nume, "motoare": sorted(b["motoare"]), "prefixe": sorted(b["prefixe"]),
                    "aparitii": b["aparitii"], "rang_min": b["rang_min"], "stare": stare,
                    "scor": len(b["motoare"]) * 10 + len(b["prefixe"] - {"black friday"}) * 5 + b["aparitii"]})
    rez.sort(key=lambda x: (-x["scor"], x["rang_min"], x["nume"]))
    return rez, calificative, [t for t, _ in doar_calif.most_common(15)]


def contine_brand(sugestie: str, nume: str) -> bool:
    cb = compact(nume)
    if len(cb) >= 4:
        return cb in compact(sugestie)
    return re.search(rf"\b{re.escape(norm(nume))}\b", norm(sugestie)) is not None


def cerere_magazine(rezultate: list[dict], mg: Magazine) -> tuple[list[dict], Counter]:
    """Pentru fiecare magazin al nostru: pe cate motoare apare „cod reducere <magazin>"."""
    pe_magazin: dict[str, dict] = {}
    calificative: Counter = Counter()
    for r in rezultate:
        if r.get("grup") != "magazin" or not r.get("magazin"):
            continue
        dom = r["magazin"]
        nume = r["seed"][len("cod reducere "):]
        x = pe_magazin.setdefault(dom, {"magazin": dom, "nume": nume_afisat(dom), "motoare_cu_semnal": set(),
                                        "motoare_intrebate": set(), "completari": Counter()})
        if not ok(r):
            continue
        x["motoare_intrebate"].add(r["motor"])
        potrivite = [s for s in (r.get("sugestii") or []) if contine_brand(s, nume)]
        if potrivite:
            x["motoare_cu_semnal"].add(r["motor"])
        for s in potrivite:
            t = norm(s)
            i = t.find(norm(nume))
            rest = t[i + len(norm(nume)):].strip() if i >= 0 else ""
            if rest:
                x["completari"][rest] += 1
                calificative.update(w for w in rest.split() if w in CALIFICATIVE and w not in {"cod", "reducere"})
    rez = []
    for dom, x in pe_magazin.items():
        m = mg.site.get(dom, {})
        rez.append({"magazin": dom, "nume": x["nume"], "semnal": len(x["motoare_cu_semnal"]),
                    "intrebate": len(x["motoare_intrebate"]), "motoare": sorted(x["motoare_cu_semnal"]),
                    "are_oferta": bool(m.get("are_promotie")), "produse": mg.produse.get(dom, 0),
                    "black_friday": bool(mg.bf.get(dom)),
                    "completari": [c for c, _ in x["completari"].most_common(5)]})
    rez.sort(key=lambda x: (-x["semnal"], not x["are_oferta"], x["nume"]))
    return rez, calificative


def intentii_dupa_nume(rezultate: list[dict]) -> tuple[dict, dict, int]:
    """Ce adauga oamenii dupa numele magazinului („regata pareri", „otter retur")."""
    magazine_cu: dict[str, set] = defaultdict(set)
    exemple: dict[str, Counter] = defaultdict(Counter)
    intrebate = set()
    for r in rezultate:
        if r.get("grup") != "magazin_sp" or not ok(r):
            continue
        dom = r.get("magazin") or r["seed"]
        intrebate.add(dom)
        baza = norm(r["seed"])
        for s in r.get("sugestii") or []:
            t = norm(s)
            if not t.startswith(baza + " "):
                continue
            rest = t[len(baza) + 1:]
            eticheta = next((et for et, rx in INTENTII_NUME if rx.search(rest)), "produse")
            magazine_cu[eticheta].add(dom)
            exemple[eticheta][t] += 1
    procente = {et: round(100 * len(doms) / max(1, len(intrebate))) for et, doms in magazine_cu.items()}
    return procente, {et: [t for t, _ in c.most_common(8)] for et, c in exemple.items()}, len(intrebate)


def produse_feed() -> list[str]:
    from comun import PUBLIC, citeste_json
    prod = citeste_json(os.path.join(PUBLIC, "products.json"), {}) or {}
    return [(norm(p.get("title") or ""), (p.get("merchant_slug") or "").lower())
            for p in prod.get("products") or [] if not p.get("is_promo")]


def regex_produs(produs: str) -> re.Pattern:
    if produs in REGEX_PRODUS:
        return re.compile(REGEX_PRODUS[produs])
    cuvinte = [w for w in produs.split() if w not in STOP_PRODUS]
    parti = [rf"\b{re.escape(w[:max(4, len(w) - 2)] if len(w) > 4 else w)}" for w in cuvinte]
    return re.compile("".join(f"(?=.*{p})" for p in parti))


def analiza_produse(rezultate: list[dict], titluri: list[tuple[str, str]], mg: Magazine) -> list[dict]:
    pe_produs: dict[str, dict] = {}
    for r in rezultate:
        if r.get("grup") != "produs" or not r.get("produs"):
            continue
        p = r["produs"]
        x = pe_produs.setdefault(p, {"produs": p, "pagina": r.get("pagina"), "completari": defaultdict(set),
                                     "retaileri": Counter(), "retaileri_bf": Counter(), "motoare": set(),
                                     "intrebari": set()})
        if not ok(r):
            continue
        baza = norm(p)
        e_bf = "black friday" in r["seed"]
        for s in r.get("sugestii") or []:
            t = norm(s)
            x["motoare"].add(r["motor"])
            if INTREBARE.search(t):
                x["intrebari"].add(t)
            for ret in RETAILERI:
                if re.search(rf"\b{re.escape(ret)}\b", t):
                    (x["retaileri_bf"] if e_bf else x["retaileri"])[ret] += 1
            if t.startswith(baza + " ") and r["seed"] == baza:
                x["completari"][t[len(baza) + 1:]].add(r["motor"])
    rez = []
    for p, x in pe_produs.items():
        rx = regex_produs(p)
        potrivite = [dom for titlu, dom in titluri if rx.search(titlu)]
        parteneri = Counter(potrivite)
        completari = sorted(x["completari"].items(), key=lambda kv: (-len(kv[1]), kv[0]))
        rez.append({
            "produs": p, "pagina": x["pagina"], "motoare": sorted(x["motoare"]),
            "completari": [c for c, _ in completari[:8]],
            "completari_toate_motoarele": [c for c, m in completari if len(m) >= 3][:8],
            "retaileri": [r for r, _ in x["retaileri"].most_common(6)],
            "retaileri_bf": [r for r, _ in x["retaileri_bf"].most_common(6)],
            "retaileri_parteneri": [r for r, _ in (x["retaileri"] + x["retaileri_bf"]).most_common()
                                    if mg.gaseste(r)][:6],
            "produse_la_parteneri": len(potrivite), "parteneri_cu_produs": len(parteneri),
            "parteneri_top": [d for d, _ in parteneri.most_common(4)],
            "intrebari": sorted(x["intrebari"])[:6],
        })
    rez.sort(key=lambda x: (-len(x["completari"]), x["produs"]))
    return rez


def intrebari(rezultate: list[dict]) -> tuple[list[dict], list[dict]]:
    gasite: dict[str, dict] = {}
    video: dict[str, set] = defaultdict(set)
    for r in rezultate:
        if not ok(r):
            continue
        for s in r.get("sugestii") or []:
            t = norm(s)
            if r["motor"] == "youtube":
                video[t].add(r["seed"])
                continue
            if not INTREBARE.search(t):
                continue
            x = gasite.setdefault(t, {"text": s.strip(), "motoare": set(), "grup": r["grup"]})
            x["motoare"].add(r["motor"])
    lista = sorted(({"text": x["text"], "motoare": sorted(x["motoare"]), "grup": x["grup"]} for x in gasite.values()),
                   key=lambda x: (-len(x["motoare"]), x["text"]))
    vid = sorted(({"text": t, "seminte": sorted(s)} for t, s in video.items() if t not in {norm(x) for x in s}),
                 key=lambda x: (-len(x["seminte"]), x["text"]))
    return lista, vid


def analizeaza(date: dict, mg: Magazine | None = None, titluri=None) -> dict:
    mg = mg or Magazine()
    titluri = titluri if titluri is not None else produse_feed()
    rez = date.get("rezultate") or []
    cautate, calif_alfabet, doar_calif = magazine_din_alfabet(rez, mg)
    cerere, calif_magazine = cerere_magazine(rez, mg)
    intentii, exemple_intentii, n_sp = intentii_dupa_nume(rez)
    produse = analiza_produse(rez, titluri, mg)
    intr, video = intrebari(rez)
    bf = [b for b in cautate if "black friday" in b["prefixe"] and b["stare"]["cod"] != "generic"]
    return {"colectat_la": date.get("colectat_la"), "motoare": date.get("motoare"),
            "magazine_cautate": cautate, "calificative_alfabet": calif_alfabet.most_common(25),
            "cautari_fara_magazin": doar_calif, "cerere_magazine": cerere,
            "calificative_magazine": calif_magazine.most_common(20),
            "intentii_dupa_nume": intentii, "exemple_intentii": exemple_intentii, "magazine_cu_nume_intrebate": n_sp,
            "produse": produse, "black_friday": bf, "intrebari": intr[:150], "video": video[:120]}


# ── Raportul ────────────────────────────────────────────────────────────────────────────

def _motoare(lista: list[str]) -> str:
    sigle = {"google": "G", "bing": "B", "ddg": "D", "youtube": "Y"}
    return "".join(sigle.get(m, "?") for m in lista)


def raport(a: dict) -> str:
    zi = (a.get("colectat_la") or "")[:10]
    L: list[str] = []
    w = L.append
    w(f"# Studiu de cerere din căutări — {zi}\n")
    w("Sursa: sugestiile de completare de la Google, Bing, DuckDuckGo și YouTube, pentru Română (România), "
      "comparate cu datele site-ului (magazine, oferte, produse) și cu programele aprobate în 2Performant și Impact.\n")
    w("**Cum se citește.** O sugestie arată că o căutare e destul de frecventă cât s-o propună motorul. "
      "Nu e un volum de căutări: ordinea din listă nu înseamnă „de câte ori”, iar lipsa unei sugestii nu "
      "înseamnă zero. Semnalul cel mai sigur e același rezultat pe mai multe motoare (G = Google, B = Bing, "
      "D = DuckDuckGo, Y = YouTube). Volumele lunare vin doar din Semrush sau Search Console.\n")
    st = a.get("motoare") or {}
    w("| Motor | Răspunsuri | Goale | Erori | Nefăcute | Oprit |")
    w("|---|---|---|---|---|---|")
    for g, s in st.items():
        w(f"| {g} | {s.get('ok', 0)} | {s.get('goale', 0)} | {s.get('erori', 0)} | {s.get('nefacute', 0)} | "
          f"{s.get('oprit') or '—'} |")
    w("")

    cautate = [b for b in a["magazine_cautate"] if b["stare"]["cod"] != "generic"]
    w("## 1. Magazinele pe care oamenii le caută cu „cod reducere”, „voucher” sau „cod promoțional”\n")
    w("Din completările pentru „cod reducere a…z”, „voucher a…z”, „cod promoțional a…z” și „black friday a…z”.\n")
    pe_stare = Counter(b["stare"]["cod"] for b in cautate)
    for cod, n in pe_stare.most_common():
        w(f"- {STARI.get(cod, cod)}: **{n}**")
    w("")
    w("| Magazin (cum îl scriu oamenii) | Motoare | Căutat cu | Unde stăm |")
    w("|---|---|---|---|")
    for b in cautate[:60]:
        stare = b["stare"]
        detaliu = STARI.get(stare["cod"], stare["cod"])
        if stare.get("magazin") and stare["cod"] != "fara_program":
            detaliu += f" ({stare['magazin']})"
        if stare.get("program"):
            detaliu += f" ({stare['program']})"
        w(f"| {b['nume']} | {_motoare(b['motoare'])} | {', '.join(b['prefixe'])} | {detaliu} |")
    w("")
    if a.get("calificative_alfabet"):
        w("Ce adaugă oamenii lângă „cod reducere / voucher”: " +
          ", ".join(f"{c} ({n})" for c, n in a["calificative_alfabet"][:15]) + ".\n")
    if a.get("cautari_fara_magazin"):
        w("Căutări fără nume de magazin (intenție generală): " + "; ".join(a["cautari_fara_magazin"][:10]) + ".\n")

    cerere = a["cerere_magazine"]
    w("## 2. Cererea pentru magazinele noastre\n")
    w(f"Am întrebat „cod reducere <magazin>” pentru {len(cerere)} magazine cu link plătit (întâi cele .ro și cele cu ofertă).\n")
    for n_mot in (3, 2, 1, 0):
        n = sum(1 for c in cerere if c["semnal"] == n_mot)
        w(f"- propus de {n_mot} motoare: **{n}** magazine")
    w("")
    cu = [c for c in cerere if c["semnal"] >= 2 and c["are_oferta"]]
    fara = [c for c in cerere if c["semnal"] >= 2 and not c["are_oferta"]]
    w(f"**Căutate și cu ofertă acum ({len(cu)})** — de împins (newsletter, social, Black Friday):\n")
    w(", ".join(f"{c['nume']} [{_motoare(c['motoare'])}]" for c in cu[:40]) or "—")
    w("")
    w(f"**Căutate, dar fără ofertă acum ({len(fara)})** — pagina e goală exact unde vine omul: "
      "de cerut un cod (exclusiv, dacă se poate) sau de adus produsele:\n")
    w("| Magazin | Motoare | Produse în feed | Ce mai caută oamenii |")
    w("|---|---|---|---|")
    for c in fara[:30]:
        w(f"| {c['nume']} | {_motoare(c['motoare'])} | {c['produse']} | {'; '.join(c['completari'][:3]) or '—'} |")
    w("")
    if a.get("calificative_magazine"):
        w("Cuvinte puse după „cod reducere <magazin>”: " +
          ", ".join(f"{c} ({n})" for c, n in a["calificative_magazine"][:12]) + ".\n")

    w("## 3. Ce caută oamenii lângă numele magazinului\n")
    w(f"Din „<magazin> ” (cu spațiu) pentru {a['magazine_cu_nume_intrebate']} magazine: în câte procente "
      "dintre ele apare fiecare tip de completare.\n")
    w("| Ce caută | Magazine | Exemple |")
    w("|---|---|---|")
    for et, proc in sorted(a["intentii_dupa_nume"].items(), key=lambda kv: -kv[1]):
        w(f"| {ETICHETE_INTENTII.get(et, et)} | {proc}% | {'; '.join(a['exemple_intentii'].get(et, [])[:4])} |")
    w("")

    w("## 4. Produse: ce se caută și ce avem la parteneri\n")
    w("„Completări” = ce adaugă oamenii după produs (pe primul loc cele propuse de toate trei motoarele). "
      "„La parteneri” = produse din feed-urile partenerilor al căror titlu se potrivește (aproximativ).\n")
    w("| Produs | Completări frecvente | Magazine la care se gândesc | La parteneri | Pagina noastră |")
    w("|---|---|---|---|---|")
    for p in a["produse"]:
        compl = p["completari_toate_motoarele"] or p["completari"]
        ret = ", ".join(p["retaileri"][:4] + [f"BF: {r}" for r in p["retaileri_bf"][:2]]) or "—"
        w(f"| {p['produs']} | {'; '.join(compl[:5]) or '—'} | {ret} | {p['produse_la_parteneri']} "
          f"({p['parteneri_cu_produs']} magazine) | {p['pagina'] or '—'} |")
    w("")
    fara_pagina = [p for p in a["produse"] if not p["pagina"] and p["produse_la_parteneri"] >= 20 and p["completari"]]
    if fara_pagina:
        w("**Cerere + produse la parteneri, fără pagină la noi:** " +
          ", ".join(f"{p['produs']} ({p['produse_la_parteneri']})" for p in fara_pagina) + ".\n")
    fara_marfa = [p for p in a["produse"] if p["pagina"] and p["produse_la_parteneri"] < 5]
    if fara_marfa:
        w("**Pagini /top fără produse la parteneri** (cererea există, dar nu avem ce vinde: nu le împingem): " +
          ", ".join(p["produs"] for p in fara_marfa) + ".\n")

    w("## 5. Black Friday: magazinele la care se gândesc oamenii\n")
    bf = a["black_friday"]
    w(f"Din „black friday a…z”: {len(bf)} magazine.\n")
    w(", ".join(f"{b['nume']} ({STARI.get(b['stare']['cod'], '')})" for b in bf[:30]) or "—")
    w("")

    w("## 6. Întrebări reale = hook-uri pentru articole, postări și video\n")
    w("Formulări luate exact cum le scriu oamenii. Un titlu sau primul rând dintr-un clip care repetă întrebarea "
      "omului e „hook-ul” cel mai sigur. Răspunsul trebuie să fie adevărat și verificabil: fără „testat”, fără cifre "
      "inventate.\n")
    for q in a["intrebari"][:40]:
        w(f"- {q['text']} [{_motoare(q['motoare'])}]")
    w("")
    if a.get("video"):
        w("**YouTube** (ce caută oamenii în clipuri, pentru TikTok, Reels și Shorts):\n")
        for v in a["video"][:25]:
            w(f"- {v['text']}")
        w("")

    w("## 7. Ce facem cu asta\n")
    lipsa = [b for b in cautate if b["stare"]["cod"] in ("program_2p_lipsa_de_pe_site", "impact_activ_lipsa_de_pe_site")]
    de_aplicat = [b for b in cautate if b["stare"]["cod"] == "fara_program" and len(b["motoare"]) >= 2]
    interzise = [b for b in cautate if b["stare"]["cod"] == "program_interzice_cupoane"]
    pasi = []
    if lipsa:
        pasi.append(f"**Program aprobat, dar magazinul lipsește de pe site ({len(lipsa)}):** "
                    + ", ".join(b["nume"] for b in lipsa[:15]) + ". De aflat de ce (fără link plătit, regulă, filtru) — "
                    "e cel mai ieftin câștig: programul e deja aprobat.")
    if fara:
        pasi.append(f"**Magazine căutate, fără ofertă azi ({len(fara)}):** cerem un cod direct de la magazin "
                    "(prin rețea sau pe email) și aducem produsele din feed, ca pagina să nu fie goală.")
    if de_aplicat:
        pasi.append(f"**Căutate pe cel puțin două motoare, fără program la noi ({len(de_aplicat)}):** "
                    + ", ".join(b["nume"] for b in de_aplicat[:20]) + ". De verificat în 2Performant, Impact și Awin "
                    "dacă au program, apoi aplicat.")
    if interzise:
        pasi.append(f"**Căutate, dar programul interzice site-urile de cupoane ({len(interzise)}):** "
                    + ", ".join(b["nume"] for b in interzise[:10]) + ". Nu le facem pagini de cod; regula rămâne.")
    if fara_pagina:
        pasi.append("**Pagini noi de produs (după aprobare, ca la /alege):** "
                    + ", ".join(p["produs"] for p in fara_pagina[:8]) + ".")
    pasi.append("**Hook-uri:** întrebările de la secțiunea 6 devin titluri de ghid și primul rând din postări; "
                "lista YouTube e pentru clipuri.")
    for i, p in enumerate(pasi, 1):
        w(f"{i}. {p}")
    w("")
    w("_Generat de `scripts/v2/research/studiu.py`. Datele brute: artefactul rulării `research.yml` "
      "(sugestii.json); rezumatul: `data/research/`._")
    return "\n".join(L) + "\n"


def test() -> int:
    mg = Magazine()
    un_magazin = next((d for d, m in mg.site.items() if m.get("are_promotie")), None)
    nume_un = norm(nume_afisat(un_magazin)) if un_magazin else "answear"
    date = {"colectat_la": "2026-11-18T10:00:00Z", "motoare": {}, "rezultate": [
        {"seed": "cod reducere a", "grup": "alfabet", "motor": "google", "stare": "ok", "prefix": "cod reducere",
         "sugestii": [f"cod reducere {nume_un}", "cod reducere emag noiembrie 2026", "cod reducere prima comanda",
                      "cod reducere zzqq magazin inventat"]},
        {"seed": "cod reducere a", "grup": "alfabet", "motor": "bing", "stare": "ok", "prefix": "cod reducere",
         "sugestii": [f"Cod Reducere {nume_un.title()} 2026", "cod reducere emag"]},
        {"seed": "voucher e", "grup": "alfabet", "motor": "ddg", "stare": "ok", "prefix": "voucher",
         "sugestii": ["voucher edenred", "voucher de vacanta 2026", "voucher emag"]},
        {"seed": "cod reducere b", "grup": "alfabet", "motor": "ddg", "stare": "eroare: http 403", "prefix": "cod reducere"},
        {"seed": f"cod reducere {nume_un}", "grup": "magazin", "motor": "google", "stare": "ok", "magazin": un_magazin,
         "sugestii": [f"cod reducere {nume_un} transport gratuit", f"cod reducere {nume_un}"]},
        {"seed": f"cod reducere {nume_un}", "grup": "magazin", "motor": "bing", "stare": "ok", "magazin": un_magazin,
         "sugestii": ["cod reducere altceva"]},
        {"seed": f"{nume_un} ", "grup": "magazin_sp", "motor": "google", "stare": "ok", "magazin": un_magazin,
         "sugestii": [f"{nume_un} pareri", f"{nume_un} retur", f"{nume_un} cod reducere"]},
        {"seed": "laptop", "grup": "produs", "motor": "google", "stare": "ok", "produs": "laptop", "pagina": "/top/laptopuri",
         "sugestii": ["laptop gaming", "laptop emag", "cum aleg un laptop", "laptop lenovo"]},
        {"seed": "laptop", "grup": "produs", "motor": "bing", "stare": "ok", "produs": "laptop", "pagina": "/top/laptopuri",
         "sugestii": ["laptop gaming", "laptop ieftin"]},
        {"seed": "laptop", "grup": "produs", "motor": "ddg", "stare": "ok", "produs": "laptop", "pagina": "/top/laptopuri",
         "sugestii": ["laptop gaming"]},
        {"seed": "laptop", "grup": "produs", "motor": "youtube", "stare": "ok", "produs": "laptop", "pagina": "/top/laptopuri",
         "sugestii": ["laptop gaming sub 3000 lei", "laptop"]},
    ]}
    titluri = [("laptop asus vivobook 15", "x.ro"), ("husa laptop", "y.ro"), ("telefon samsung", "x.ro")]
    a = analizeaza(date, mg, titluri)
    erori = []

    def verifica(cond, mesaj):
        if not cond:
            erori.append(mesaj)

    pe_nume = {b["nume"]: b for b in a["magazine_cautate"]}
    verifica("emag" in pe_nume and set(pe_nume["emag"]["motoare"]) == {"google", "bing", "ddg"},
             f"emag din trei motoare: {pe_nume.get('emag')}")
    verifica(pe_nume.get("edenred", {}).get("stare", {}).get("cod") == "generic", "edenred e tichet, nu magazin")
    verifica(pe_nume.get("de vacanta", {"stare": {"cod": "generic"}})["stare"]["cod"] == "generic", "voucher de vacanta")
    verifica("cod reducere prima comanda" in a["cautari_fara_magazin"], "cautarea fara magazin")
    verifica(un_magazin is None or pe_nume.get(nume_un, {}).get("stare", {}).get("cod") == "site_cu_oferta",
             f"magazinul nostru cu oferta: {pe_nume.get(nume_un)}")
    verifica(pe_nume.get("zzqq magazin inventat", {}).get("stare", {}).get("cod") == "fara_program", "magazin inventat")
    verifica(dict(a["calificative_alfabet"]).get("noiembrie") == 1, f"calificative: {a['calificative_alfabet']}")
    c = next((x for x in a["cerere_magazine"] if x["magazin"] == un_magazin), None)
    verifica(c is not None and c["semnal"] == 1 and c["motoare"] == ["google"], f"cerere magazin: {c}")
    verifica(c is not None and "transport gratuit" in c["completari"], f"completari: {c}")
    verifica(a["intentii_dupa_nume"].get("incredere") == 100 and a["intentii_dupa_nume"].get("livrare_retur") == 100,
             f"intentii: {a['intentii_dupa_nume']}")
    lp = next(p for p in a["produse"] if p["produs"] == "laptop")
    verifica(lp["completari_toate_motoarele"] == ["gaming"], f"completari laptop: {lp['completari_toate_motoarele']}")
    verifica(lp["produse_la_parteneri"] == 2 and lp["parteneri_cu_produs"] == 2, f"oferta laptop: {lp}")
    verifica("emag" in lp["retaileri"], "retailer emag langa laptop")
    verifica(any(q["text"] == "cum aleg un laptop" for q in a["intrebari"]), "intrebarea reala")
    verifica(any(v["text"] == "laptop gaming sub 3000 lei" for v in a["video"]), "sugestia YouTube")
    verifica(not any(v["text"] == "laptop" for v in a["video"]), "saminta repetata nu e sugestie video")
    text = raport(a)
    verifica("## 7. Ce facem cu asta" in text and "edenred" not in text.split("## 2.")[0].split("| Magazin")[1],
             "raportul nu trebuie sa listeze tichetele ca magazine")
    for e in erori:
        print("PICA:", e)
    print("studiu.py:", "OK" if not erori else f"{len(erori)} erori")
    return 1 if erori else 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sugestii", default="research-out/sugestii.json")
    ap.add_argument("--dir", default="research-out")
    ap.add_argument("--test", action="store_true")
    a = ap.parse_args()
    if a.test:
        return test()
    with open(a.sugestii, encoding="utf-8") as f:
        date = json.load(f)
    rez = analizeaza(date)
    zi = (rez.get("colectat_la") or "")[:10] or "necunoscut"
    os.makedirs(a.dir, exist_ok=True)
    cale_md = os.path.join(a.dir, f"STUDIU-CERERE-{zi}.md")
    with open(cale_md, "w", encoding="utf-8") as f:
        f.write(raport(rez))
    cale_json = os.path.join(a.dir, f"cerere-{zi}.json")
    with open(cale_json, "w", encoding="utf-8") as f:
        json.dump(rez, f, ensure_ascii=False, indent=1, default=sorted)
    cautate = [b for b in rez["magazine_cautate"] if b["stare"]["cod"] != "generic"]
    print(f"{len(cautate)} magazine cautate, {len(rez['cerere_magazine'])} magazine ale noastre intrebate, "
          f"{len(rez['produse'])} produse, {len(rez['intrebari'])} intrebari, {len(rez['video'])} sugestii video")
    print("Pe stari:", dict(Counter(b["stare"]["cod"] for b in cautate)))
    print("Scris:", cale_md, cale_json)
    return 0


if __name__ == "__main__":
    sys.exit(main())
