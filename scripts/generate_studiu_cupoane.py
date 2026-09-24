#!/usr/bin/env python3
"""
Genereaza datele pentru studiul public despre codurile de reducere din Romania.

De ce: AmCupon urmareste automat promotiile din peste 1100 de magazine online
romanesti. Nimeni altcineva nu are seria asta de date. Un studiu pe ea e singurul
tip de continut care aduce link editorial real — vezi ce a functionat la
concurenta (un studiu pe date proprii preluat de retail.ro). Fara o pagina
publicabila si citabila, nu ai ce sa oferi unui jurnalist.

Rezultatul cel mai puternic e chiar cel care NE CONTRAZICE interesul comercial:
un site de cupoane care arata public cat de putine coduri reale exista. Exact de
aceea e credibil.

ONESTITATE — regulile respectate aici, pentru ca un studiu prins cu date umflate
distruge si articolul, si relatia cu publicatia:
  * se numara doar ce e MASURABIL in datele noastre: magazine accesibile prin
    retelele de afiliere partenere, si coduri publice vizibile acolo. Un magazin
    care trimite coduri doar pe newsletter sau in aplicatie NU intra la socoteala,
    si scriem asta explicit pe pagina.
  * procentele de reducere se extrag din textul REAL al promotiei, nu se estimeaza.
  * mediana se publica doar unde exista cel putin PRAG_ESANTION magazine. Sub
    atat, o "mediana" din 2 valori e zgomot prezentat ca fapt.
  * nu se publica comisionul nostru — e ce castigam noi, nu o masura a pietei.

Iesire: frontend/public/studiu-cupoane.json
Ruleaza in pipeline, deci pagina se actualizeaza singura.

    python scripts/generate_studiu_cupoane.py
"""
import json
import re
import statistics
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

RADACINA = Path(__file__).parent.parent
INTRARE = RADACINA / "frontend" / "public" / "output.json"
IESIRE = RADACINA / "frontend" / "public" / "studiu-cupoane.json"
ISTORIC = RADACINA / "frontend" / "public" / "istoric-promotii.json"

# Sub atatea magazine intr-o categorie nu publicam mediana — ar fi zgomot.
PRAG_ESANTION = 3

# ── Seria lunara (24.09.2026) ──────────────────────────────────────────────────
# Prima zi in care datele descriu PIATA, nu schimbarile din pipeline-ul nostru. Masurat pe
# istoricul git al lui output.json, inainte de ea seria are trepte facute de noi:
#   · 29.06: au intrat promotiile 2Performant (de la 8 la 103 intr-o zi);
#   · 08.09: au intrat ofertele Impact (de la 78 la 308);
#   · 19.09: au iesit 108 magazine care nu livreaza in Romania;
#   · pana pe 24.09, fetch_2p_api.py aducea doar primele 20 de promotii 2Performant (bug de
#     paginare), restul intrau in valuri, la importul manual de CSV.
# Ziua de dupa reparatie prinde restanta, deci seria incepe pe 26.09. Prima luna completa e
# octombrie: raportul ei apare singur pe 1 noiembrie. O luna se publica doar cu acoperire.
SERIE_CURATA_DE_LA = "2026-09-26"
ACOPERIRE_MINIMA = 0.9   # sub 90% din zilele lunii cu date bune, luna nu se publica
ZI_ANORMALA = 0.5        # o zi cu sub jumatate din mediana lunii = o sursa n-a raspuns (ex. 06.08)

NUME_CATEGORIE = {
    "fashion": "Fashion", "beauty": "Beauty & îngrijire", "bijuterii": "Bijuterii & ceasuri",
    "electronice": "Electronice & IT", "software": "Software & digital",
    "casa-gradina": "Casă & grădină", "animale": "Pet shop",
    "mancare-bauturi": "Mâncare & băuturi", "carti-educatie": "Cărți & educație",
    "copii": "Copii & familie", "cadouri-flori": "Cadouri & flori",
    "calatorii": "Călătorii", "sanatate": "Sănătate & farmacie",
    "financiar": "Financiar & asigurări", "sport": "Sport & fitness",
    "auto-moto": "Auto & moto", "marketplace": "Marketplace", "servicii": "Servicii",
}

# Numele afisabile ale retelelor. Cheile sunt valorile REALE din campul `platforma`.
NUME_RETEA = {
    "2performant": "2Performant",
    "impact": "Impact.com",
    "awin": "Awin",
    "tradetracker": "TradeTracker",
    "tradedoubler": "TradeDoubler",
    "cj": "CJ Affiliate",
}


def procent_din_promotii(magazin) -> int | None:
    """Cel mai mare procent de reducere scris EXPLICIT in textul promotiei.

    Nu estimam si nu deducem din pret — daca magazinul n-a scris un procent,
    magazinul nu intra in statistica de reduceri.
    """
    gasite = []
    for p in magazin.get("promotii") or []:
        text = f"{p.get('nume', '')} {p.get('descriere', '')}"
        for x in re.findall(r"(\d{1,2})\s*%", text):
            n = int(x)
            if 3 <= n <= 95:            # sub 3% si peste 95% sunt aproape sigur alte cifre
                gasite.append(n)
    return max(gasite) if gasite else None


def serie_lunara(istoric: dict, magazine: list, azi: str) -> list:
    """Cate promotii NOI au aparut in fiecare luna completa a seriei curate.

    „Noua" = vazuta prima data in luna respectiva (`prima` din istoric-promotii.json). Nu
    deducem cat a tinut o promotie: o vedem doar cand reteaua raspunde. O luna fara destule
    zile bune se intoarce marcata `incomplet`, fara cifre — pagina spune asta, nu ghiceste.
    """
    from datetime import date, timedelta
    from promotii import nume_afisabil

    zile = istoric.get("zile") or {}
    dupa_slug = {(m.get("magazin") or "").lower(): m for m in magazine}
    intrari = [(slug, e) for slug, lista in (istoric.get("magazine") or {}).items() for e in lista]

    luni, z = [], date.fromisoformat(SERIE_CURATA_DE_LA)
    z = z.replace(day=1) if z.day == 1 else (z.replace(day=28) + timedelta(days=4)).replace(day=1)
    while True:
        urm = (z.replace(day=28) + timedelta(days=4)).replace(day=1)
        if urm.isoformat() > azi:          # luna curenta nu e completa
            break
        luni.append((z, urm))
        z = urm

    rezultat = []
    for inceput, sfarsit in luni:
        eticheta = inceput.strftime("%Y-%m")
        toate = [(inceput + timedelta(days=i)).isoformat() for i in range((sfarsit - inceput).days)]
        cu_date = [d for d in toate if (zile.get(d) or {}).get("promotii", 0) > 0]
        mediana = statistics.median(zile[d]["promotii"] for d in cu_date) if cu_date else 0
        bune = [d for d in cu_date if zile[d]["promotii"] >= ZI_ANORMALA * mediana]
        acoperire = round(len(bune) / len(toate), 3)
        if acoperire < ACOPERIRE_MINIMA:
            rezultat.append({"luna": eticheta, "incomplet": True, "zile": len(toate), "zile_bune": len(bune)})
            continue

        noi = [(s, e) for s, e in intrari if e.get("prima", "")[:7] == eticheta]
        pe_magazin = defaultdict(lambda: {"promotii": 0, "cu_cod": 0})
        pe_categorie = defaultdict(int)
        for s, e in noi:
            pe_magazin[s]["promotii"] += 1
            pe_magazin[s]["cu_cod"] += int(bool(e.get("cod")))
            cat = (dupa_slug.get(s) or {}).get("categorie_slug")
            if cat:
                pe_categorie[cat] += 1
        ro = sorted(((s, v) for s, v in pe_magazin.items() if s.endswith(".ro")),
                    key=lambda sv: (-sv[1]["promotii"], sv[0]))[:5]
        rezultat.append({
            "luna": eticheta,
            "incomplet": False,
            "zile": len(toate),
            "zile_bune": len(bune),
            "promotii_noi": len(noi),
            "cu_cod": sum(1 for _, e in noi if e.get("cod")),
            "magazine": len(pe_magazin),
            "din_magazine_ro": sum(v["promotii"] for s, v in pe_magazin.items() if s.endswith(".ro")),
            "active_pe_zi": round(statistics.mean(zile[d]["promotii"] for d in bune)),
            "top_ro": [{"slug": s, "nume": nume_afisabil(dupa_slug.get(s) or {"magazin": s}),
                        "promotii": v["promotii"], "cu_cod": v["cu_cod"]} for s, v in ro],
            "categorii": [{"slug": c, "nume": NUME_CATEGORIE.get(c, c), "promotii": n}
                          for c, n in sorted(pe_categorie.items(), key=lambda cn: (-cn[1], cn[0]))[:8]],
        })
    return rezultat


def main():
    magazine = json.loads(INTRARE.read_text(encoding="utf-8"))

    cu_promotie = [m for m in magazine if m.get("are_promotie") and m.get("promotii")]
    cu_cod = [m for m in cu_promotie
              if any((p.get("cod_cupon") or "").strip() for p in m["promotii"])]

    total = len(magazine)
    pe_categorie = defaultdict(lambda: {"magazine": 0, "cu_promotie": 0, "procente": []})
    for m in magazine:
        slug = (m.get("categorie_slug") or "").lower().strip()
        if not slug:
            continue
        c = pe_categorie[slug]
        c["magazine"] += 1
        if m.get("are_promotie") and m.get("promotii"):
            c["cu_promotie"] += 1
            pr = procent_din_promotii(m)
            if pr:
                c["procente"].append(pr)

    categorii = []
    for slug, c in pe_categorie.items():
        destule = len(c["procente"]) >= PRAG_ESANTION
        categorii.append({
            "slug": slug,
            "nume": NUME_CATEGORIE.get(slug, slug),
            "magazine": c["magazine"],
            "cu_promotie": c["cu_promotie"],
            # None (nu 0!) cand esantionul e prea mic — pagina afiseaza "date
            # insuficiente", nu o cifra care pare masuratoare
            "reducere_mediana": round(statistics.median(c["procente"]), 1) if destule else None,
            "reducere_max": max(c["procente"]) if destule else None,
            "esantion": len(c["procente"]),
        })
    categorii.sort(key=lambda x: (x["reducere_mediana"] is None, -(x["reducere_mediana"] or 0)))

    toate_procentele = [p for c in pe_categorie.values() for p in c["procente"]]

    studiu = {
        "generat": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "total_magazine": total,
        "cu_promotie": len(cu_promotie),
        "cu_cod_real": len(cu_cod),
        "doar_oferta": len(cu_promotie) - len(cu_cod),
        "procent_cu_promotie": round(len(cu_promotie) / total * 100, 1) if total else 0,
        "procent_cu_cod": round(len(cu_cod) / total * 100, 1) if total else 0,
        "reducere_mediana_generala": round(statistics.median(toate_procentele), 1) if toate_procentele else None,
        "magazine_cu_procent_declarat": len(toate_procentele),
        "categorii": categorii,
        # Derivat din DATE, nu scris de mana. Lista hardcodata a ramas cu
        # "Profitshare" dupa excluderea din 19.08.2026 si a publicat o afirmatie
        # falsa pe o pagina destinata sa fie citata de altii — exact pagina unde
        # o inexactitate costa cel mai mult.
        "retele": sorted({
            NUME_RETEA.get(p, p.title())
            for p in ((m.get("platforma") or "").strip().lower() for m in magazine)
            if p and p != "direct"
        }),
        "prag_esantion": PRAG_ESANTION,
        "serie_de_la": SERIE_CURATA_DE_LA,
        "lunar": serie_lunara(json.loads(ISTORIC.read_text(encoding="utf-8")) if ISTORIC.exists() else {},
                              magazine, datetime.now(timezone.utc).strftime("%Y-%m-%d")),
    }

    IESIRE.write_text(json.dumps(studiu, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"studiu-cupoane.json generat ({studiu['generat']})")
    print(f"  {total} magazine · {len(cu_promotie)} cu promotie "
          f"({studiu['procent_cu_promotie']}%) · {len(cu_cod)} cu cod real "
          f"({studiu['procent_cu_cod']}%)")
    print(f"  {sum(1 for c in categorii if c['reducere_mediana'] is not None)}/"
          f"{len(categorii)} categorii cu esantion suficient pentru mediana")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
