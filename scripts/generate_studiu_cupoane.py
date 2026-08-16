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

# Sub atatea magazine intr-o categorie nu publicam mediana — ar fi zgomot.
PRAG_ESANTION = 3

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
        "retele": ["2Performant", "Profitshare", "Impact.com", "Awin"],
        "prag_esantion": PRAG_ESANTION,
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
