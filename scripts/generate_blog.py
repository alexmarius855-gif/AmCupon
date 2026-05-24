"""
Generare automata articole blog din datele 2Performant.
Ruleaza zilnic prin GitHub Actions dupa procesarea datelor.
Genereaza articole pentru top magazine cu promotii active.
"""

import json
import os
from datetime import datetime

LUNI_RO = {
    1: "Ianuarie", 2: "Februarie", 3: "Martie", 4: "Aprilie",
    5: "Mai", 6: "Iunie", 7: "Iulie", 8: "August",
    9: "Septembrie", 10: "Octombrie", 11: "Noiembrie", 12: "Decembrie",
}

MAX_POSTS = 60
POSTS_PER_RUN = 5


def nume_afisat(magazin: str) -> str:
    return " ".join(
        w.capitalize() for w in magazin.split(".")[0].replace("-", " ").split()
    )


def slug_articol(magazin: str, luna: str, an: int) -> str:
    return f"cod-reducere-{magazin.split('.')[0]}-{luna.lower()}-{an}"


def genereaza_articol(store: dict, luna: str, an: int) -> dict:
    slug_mag = store["magazin"]
    nume = nume_afisat(slug_mag)
    promotii = store.get("promotii", [])
    categorie = store.get("categorie", "Magazine")
    procent = store.get("procent_succes", 80)
    folosit = store.get("folosit_de", 0)

    # Lista promotii pentru articol
    linii_promo = []
    for p in promotii[:5]:
        linie = f"- **{p['nume']}**"
        if p.get("cod_cupon"):
            linie += f" — Cod: `{p['cod_cupon'][:4]}****`"
        if p.get("zile_ramase", 999) <= 7:
            linie += f" _(expiră în {p['zile_ramase']} zile)_"
        linii_promo.append(linie)

    bloc_promo = "\n".join(linii_promo) if linii_promo else "- Oferte disponibile pe pagina magazinului"

    folosit_text = f"Codul a fost folosit de **{folosit} ori** de utilizatorii AmCupon.ro." if folosit > 0 else ""
    succes_text = f"Rata de succes înregistrată: **{procent}%**." if procent > 0 else ""

    content = f"""## Promoții active {nume} — {luna} {an}

{bloc_promo}

## Cum folosești codul de reducere la {nume}?

Procesul durează mai puțin de un minut:

- Deschide pagina [{nume} pe AmCupon.ro](/reduceri/{slug_mag}) și copiază codul
- Mergi pe site-ul {nume} și adaugă produsele dorite în coș
- La finalizarea comenzii, caută câmpul „Cod promoțional" sau „Voucher"
- Introdu codul și apasă „Aplică" — reducerea se aplică automat

## Statistici cod de reducere {nume}

{folosit_text}
{succes_text}

AmCupon.ro verifică zilnic toate codurile de la {nume} și actualizează automat ofertele expirate.

## De ce să cumperi prin AmCupon.ro?

- Coduri verificate zilnic — nu pierzi timp cu coduri expirate
- Afișăm rata de succes reală pentru fiecare cod
- Peste 600 de magazine partenere din România
- Complet gratuit pentru cumpărători

[Vezi toate promoțiile active {nume} →](/reduceri/{slug_mag})"""

    return {
        "slug": slug_articol(slug_mag, luna, an),
        "title": f"Cod Reducere {nume} — {luna} {an} | Oferte Verificate",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "excerpt": f"{len(promotii)} promoții active la {nume} în {luna} {an}. Coduri de reducere verificate zilnic pe AmCupon.ro. Rată succes: {procent}%.",
        "category": categorie,
        "magazin": slug_mag,
        "cover": f"https://picsum.photos/seed/{slug_mag}/800/400",
        "content": content,
    }


def main():
    now = datetime.now()
    luna = LUNI_RO[now.month]
    an = now.year

    # Caile fisierelor
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "frontend", "public", "output.json")
    blog_path = os.path.join(repo_root, "frontend", "public", "blog-posts.json")

    if not os.path.exists(output_path):
        print("output.json nu exista, skip.")
        return

    with open(output_path, encoding="utf-8") as f:
        magazine = json.load(f)

    # Incarca posturi existente
    posts = []
    if os.path.exists(blog_path):
        with open(blog_path, encoding="utf-8") as f:
            posts = json.load(f)

    sluguri_existente = {p["slug"] for p in posts}

    # Selecteaza top magazine cu promotii active (sortate dupa procent_succes)
    cu_promotii = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
    ]
    cu_promotii.sort(key=lambda x: x.get("procent_succes", 0), reverse=True)

    generate_count = 0
    for store in cu_promotii:
        if generate_count >= POSTS_PER_RUN:
            break

        slug = slug_articol(store["magazin"], luna, an)
        if slug in sluguri_existente:
            continue

        articol = genereaza_articol(store, luna, an)
        posts.insert(0, articol)
        sluguri_existente.add(slug)
        generate_count += 1
        print(f"Generat: {articol['title']}")

    # Limiteaza la MAX_POSTS (sterge cele mai vechi)
    posts = sorted(posts, key=lambda x: x["date"], reverse=True)[:MAX_POSTS]

    with open(blog_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)

    print(f"Blog actualizat: {generate_count} articole noi, {len(posts)} total.")


if __name__ == "__main__":
    main()
