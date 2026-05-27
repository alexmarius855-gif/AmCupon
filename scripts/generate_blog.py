"""
Generare automata articole blog din datele 2Performant + Profitshare.
Ruleaza zilnic prin GitHub Actions dupa procesarea datelor.

Tipuri de articole generate:
  1. Per magazin  — "Cod Reducere {Magazin} — {Luna} {An}"
  2. Per categorie — "Top {N} magazine {Categorie} cu reduceri — {Luna} {An}"
  3. Roundup lunar — "Cele mai bune coduri reducere din {Luna} {An}"
"""

import json
import os
from datetime import datetime

LUNI_RO = {
    1: "Ianuarie", 2: "Februarie", 3: "Martie", 4: "Aprilie",
    5: "Mai", 6: "Iunie", 7: "Iulie", 8: "August",
    9: "Septembrie", 10: "Octombrie", 11: "Noiembrie", 12: "Decembrie",
}

MAX_POSTS = 120
POSTS_PER_RUN = 8  # articole noi per rulare

# Categorii pentru care generam articole roundup
CATEGORII_ROUNDUP = [
    ("fashion",          "Fashion",           "fashion"),
    ("beauty",           "Frumusete",         "frumusete"),
    ("electronics-itc",  "Electronice IT&C",  "electronics-itc"),
    ("pharma",           "Farmacie",          "farmacie"),
    ("sports-outdoors",  "Sport & Outdoor",   "sports-outdoors"),
    ("home-garden",      "Casa & Gradina",    "home-garden"),
    ("babies-kids-toys", "Copii & Jucarii",   "babies-kids-toys"),
    ("books",            "Carti",             "books"),
    ("automotive",       "Auto-Moto",         "automotive"),
    ("health-personal-care", "Sanatate",      "health-personal-care"),
]


def nume_afisat(magazin: str) -> str:
    return " ".join(
        w.capitalize() for w in magazin.split(".")[0].replace("-", " ").split()
    )


def slug_articol_magazin(magazin: str, luna: str, an: int) -> str:
    return f"cod-reducere-{magazin.split('.')[0]}-{luna.lower()}-{an}"


def slug_articol_categorie(cat_slug: str, luna: str, an: int) -> str:
    return f"top-reduceri-{cat_slug}-{luna.lower()}-{an}"


def slug_articol_roundup(luna: str, an: int) -> str:
    return f"cele-mai-bune-coduri-reducere-{luna.lower()}-{an}"


def genereaza_articol_magazin(store: dict, luna: str, an: int) -> dict:
    slug_mag = store["magazin"]
    nume = nume_afisat(slug_mag)
    promotii = store.get("promotii", [])
    categorie = store.get("categorie", "Magazine")
    procent = store.get("procent_succes", 80)
    folosit = store.get("folosit_de", 0)

    linii_promo = []
    for p in promotii[:5]:
        linie = f"- **{p['nume']}**"
        if p.get("cod_cupon"):
            linie += f" — Cod: `{p['cod_cupon'][:4]}****`"
        if p.get("zile_ramase", 999) <= 7:
            linie += f" _(expira in {p['zile_ramase']} zile)_"
        linii_promo.append(linie)

    bloc_promo = "\n".join(linii_promo) if linii_promo else "- Oferte disponibile pe pagina magazinului"
    folosit_text = f"Codul a fost folosit de **{folosit} ori** de utilizatorii AmCupon.ro." if folosit > 0 else ""
    succes_text = f"Rata de succes inregistrata: **{procent}%**." if procent > 0 else ""

    content = f"""## Promotii active {nume} — {luna} {an}

{bloc_promo}

## Cum folosesti codul de reducere la {nume}?

Procesul dureaza mai putin de un minut:

- Deschide pagina [{nume} pe AmCupon.ro](/cod-reducere/{slug_mag}) si copiaza codul
- Mergi pe site-ul {nume} si adauga produsele dorite in cos
- La finalizarea comenzii, cauta campul "Cod promotional" sau "Voucher"
- Introdu codul si apasa "Aplica" — reducerea se aplica automat

## Statistici cod de reducere {nume}

{folosit_text}
{succes_text}

AmCupon.ro verifica zilnic toate codurile de la {nume} si actualizeaza automat ofertele expirate.

## De ce sa cumperi prin AmCupon.ro?

- Coduri verificate zilnic — nu pierzi timp cu coduri expirate
- Afisam rata de succes reala pentru fiecare cod
- Peste 600 de magazine partenere din Romania
- Complet gratuit pentru cumparatori

[Vezi toate promotiile active {nume} →](/cod-reducere/{slug_mag})"""

    return {
        "slug": slug_articol_magazin(slug_mag, luna, an),
        "title": f"Cod Reducere {nume} — {luna} {an} | Oferte Verificate",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "excerpt": f"{len(promotii)} promotii active la {nume} in {luna} {an}. Coduri de reducere verificate zilnic pe AmCupon.ro. Rata succes: {procent}%.",
        "category": categorie,
        "magazin": slug_mag,
        "cover": f"https://picsum.photos/seed/{slug_mag}/800/400",
        "content": content,
        "tip": "magazin",
    }


def genereaza_articol_categorie(cat_slug: str, cat_name: str, magazine: list, luna: str, an: int) -> dict:
    """Roundup lunar per categorie — 'Top 5 magazine Fashion cu reduceri active'."""
    mag_cat = [
        m for m in magazine
        if m.get("categorie_slug") == cat_slug and m.get("are_promotie") and m.get("promotii")
    ]
    mag_cat.sort(key=lambda x: (x.get("cod_cupon", False), x.get("procent_succes", 0)), reverse=True)
    top = mag_cat[:7]

    if not top:
        return None

    linii_mag = []
    for i, m in enumerate(top, 1):
        nume_m = nume_afisat(m["magazin"])
        promotii_m = m.get("promotii", [])
        promo_text = promotii_m[0]["nume"] if promotii_m else "Oferta activa"
        cod_text = f" — Cod: `{promotii_m[0]['cod_cupon'][:4]}****`" if promotii_m and promotii_m[0].get("cod_cupon") else ""
        procent_m = m.get("procent_succes", 80)
        linii_mag.append(
            f"### {i}. [{nume_m}](/cod-reducere/{m['magazin']})\n"
            f"**{promo_text}**{cod_text}  \n"
            f"Rata succes: {procent_m}% | [Vezi oferta →](/cod-reducere/{m['magazin']})"
        )

    bloc_magazine = "\n\n".join(linii_mag)
    nr_total = len(mag_cat)
    nr_coduri = sum(1 for m in mag_cat if m.get("cod_cupon"))

    content = f"""## Cele mai bune reduceri {cat_name} in {luna} {an}

In {luna} {an}, AmCupon.ro monitorizeaza **{nr_total} magazine** de {cat_name} cu promotii active, din care **{nr_coduri} au cod de reducere**. Mai jos gasesti selectia noastra pentru aceasta luna.

{bloc_magazine}

## Cum gasesti intotdeauna cele mai bune reduceri {cat_name}?

1. **Salveaza pagina** [/categorii/{cat_slug}](/categorii/{cat_slug}) la favorite — o actualizam zilnic
2. **Compara ofertele** — unele magazine ofera procent din total, altele transport gratuit
3. **Verifica conditiile** — unele coduri au cos minim sau categorii eligibile
4. **Revino la inceput de luna** — magazinele lanseaza promotii noi constant

## Despre AmCupon.ro

AmCupon.ro agrega zilnic ofertele de la peste 600 de magazine romanesti. Nu platesti nimic in plus — magazinele ne platesc un mic comision din bugetul lor de marketing.

[Vezi toate magazinele de {cat_name} →](/categorii/{cat_slug})"""

    return {
        "slug": slug_articol_categorie(cat_slug, luna, an),
        "title": f"Top Reduceri {cat_name} — {luna} {an} | Coduri Verificate AmCupon.ro",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "excerpt": f"{nr_total} magazine de {cat_name} cu promotii active in {luna} {an}. {nr_coduri} cu cod reducere. Oferte verificate zilnic pe AmCupon.ro.",
        "category": cat_name,
        "cover": f"https://picsum.photos/seed/{cat_slug}-{an}/800/400",
        "content": content,
        "tip": "categorie",
    }


def genereaza_articol_roundup(magazine: list, luna: str, an: int) -> dict:
    """Articol general lunar — 'Cele mai bune coduri reducere din Mai 2026'."""
    cu_cod = [m for m in magazine if m.get("cod_cupon") and m.get("promotii")]
    cu_cod.sort(key=lambda x: x.get("procent_succes", 0), reverse=True)
    top15 = cu_cod[:15]

    if not top15:
        return None

    # Grupam pe categorii pentru structura articolului
    pe_categorii: dict = {}
    for m in top15:
        cat = m.get("categorie", "Altele")
        pe_categorii.setdefault(cat, []).append(m)

    sectiuni = []
    for cat, mag_list in list(pe_categorii.items())[:6]:
        linii = []
        for m in mag_list[:3]:
            nume_m = nume_afisat(m["magazin"])
            promotii_m = m.get("promotii", [])
            promo_text = promotii_m[0]["nume"] if promotii_m else "Oferta activa"
            linii.append(f"- **[{nume_m}](/cod-reducere/{m['magazin']})** — {promo_text}")
        sectiuni.append(f"### {cat}\n" + "\n".join(linii))

    bloc_sectiuni = "\n\n".join(sectiuni)
    total_magazine = len([m for m in magazine if m.get("are_promotie")])
    total_coduri   = len(cu_cod)

    content = f"""## Rezumat reduceri {luna} {an}

In {luna} {an}, AmCupon.ro monitorizeaza **{total_magazine} magazine** cu promotii active si **{total_coduri} coduri de reducere** valabile. Iata cele mai bune oferte ale lunii:

{bloc_sectiuni}

## Cum sa economisesti mai mult in {luna} {an}

- **Combina coduri cu promotii** — unele magazine accepta cod + reducere de sezon simultan
- **Urmareste expirarea** — afisam zilele ramase pentru fiecare cod
- **Verifica cosul minim** — multe coduri necesita un prag de cumparare
- **Newsletter** — aboneaza-te la AmCupon.ro pentru alerte de coduri noi

## Categorii populare

- [Reduceri Fashion →](/categorii/fashion)
- [Reduceri Electronice →](/categorii/electronics-itc)
- [Reduceri Frumusete →](/categorii/beauty)
- [Reduceri Farmacie →](/categorii/pharma)
- [Reduceri Sport →](/categorii/sports-outdoors)

[Vezi toate magazinele cu reduceri →](/toate-magazinele)"""

    return {
        "slug": slug_articol_roundup(luna, an),
        "title": f"Cele Mai Bune Coduri Reducere — {luna} {an} | AmCupon.ro",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "excerpt": f"Selectia celor mai bune {total_coduri} coduri reducere active in {luna} {an} din {total_magazine} magazine romanesti. Verificate zilnic pe AmCupon.ro.",
        "category": "General",
        "cover": f"https://picsum.photos/seed/roundup-{luna.lower()}-{an}/800/400",
        "content": content,
        "tip": "roundup",
    }


def main():
    now = datetime.now()
    luna = LUNI_RO[now.month]
    an = now.year

    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_root  = os.path.dirname(script_dir)
    output_path = os.path.join(repo_root, "frontend", "public", "output.json")
    blog_path   = os.path.join(repo_root, "frontend", "public", "blog-posts.json")

    if not os.path.exists(output_path):
        print("output.json nu exista, skip.")
        return

    with open(output_path, encoding="utf-8") as f:
        magazine = json.load(f)

    posts = []
    if os.path.exists(blog_path):
        with open(blog_path, encoding="utf-8") as f:
            posts = json.load(f)

    sluguri_existente = {p["slug"] for p in posts}
    generate_count = 0
    noi = []

    # ── 1. Articol roundup lunar (1/luna) ──────────────────────────────────────
    slug_r = slug_articol_roundup(luna, an)
    if slug_r not in sluguri_existente:
        art = genereaza_articol_roundup(magazine, luna, an)
        if art:
            noi.append(art)
            sluguri_existente.add(slug_r)
            generate_count += 1
            print(f"Generat roundup: {art['title']}")

    # ── 2. Articole per categorie (1/categorie/luna) ───────────────────────────
    for cat_slug, cat_name, _ in CATEGORII_ROUNDUP:
        if generate_count >= POSTS_PER_RUN:
            break
        slug_c = slug_articol_categorie(cat_slug, luna, an)
        if slug_c not in sluguri_existente:
            art = genereaza_articol_categorie(cat_slug, cat_name, magazine, luna, an)
            if art:
                noi.append(art)
                sluguri_existente.add(slug_c)
                generate_count += 1
                print(f"Generat categorie: {art['title']}")

    # ── 3. Articole per magazin (top cu promotii) ──────────────────────────────
    cu_promotii = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
    ]
    cu_promotii.sort(key=lambda x: x.get("procent_succes", 0), reverse=True)

    for store in cu_promotii:
        if generate_count >= POSTS_PER_RUN:
            break
        slug = slug_articol_magazin(store["magazin"], luna, an)
        if slug not in sluguri_existente:
            art = genereaza_articol_magazin(store, luna, an)
            noi.append(art)
            sluguri_existente.add(slug)
            generate_count += 1
            print(f"Generat magazin: {art['title']}")

    # Insereaza articolele noi la inceput si limiteaza la MAX_POSTS
    all_posts = noi + posts
    all_posts = sorted(all_posts, key=lambda x: x["date"], reverse=True)[:MAX_POSTS]

    with open(blog_path, "w", encoding="utf-8") as f:
        json.dump(all_posts, f, ensure_ascii=False, indent=2)

    print(f"\nBlog actualizat: {generate_count} articole noi, {len(all_posts)} total.")
    tip_counts = {}
    for p in noi:
        t = p.get("tip", "?")
        tip_counts[t] = tip_counts.get(t, 0) + 1
    for tip, cnt in tip_counts.items():
        print(f"  {tip}: {cnt}")


if __name__ == "__main__":
    main()
