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
import re
from datetime import datetime

LUNI_RO = {
    1: "Ianuarie", 2: "Februarie", 3: "Martie", 4: "Aprilie",
    5: "Mai", 6: "Iunie", 7: "Iulie", 8: "August",
    9: "Septembrie", 10: "Octombrie", 11: "Noiembrie", 12: "Decembrie",
}

MAX_POSTS = 500       # max total articole in blog-posts.json
POSTS_PER_RUN = 30   # articole noi per rulare (6 rulari/zi = 180/zi pana acoperim toti)

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


CAT_LINKURI_INTERNE = {
    "fashion":              [("/fashion", "Reduceri Fashion"), ("/categorii/fashion", "Magazine Fashion")],
    "beauty":               [("/frumusete", "Reduceri Frumusete"), ("/categorii/beauty", "Magazine Beauty")],
    "electronics-itc":      [("/electronice", "Reduceri Electronice"), ("/top/laptopuri", "Top Laptopuri"), ("/top/telefoane", "Top Telefoane")],
    "pharma":               [("/farmacie", "Reduceri Farmacie"), ("/sanatate", "Produse Sanatate")],
    "sports-outdoors":      [("/sport", "Reduceri Sport"), ("/top/biciclete-electrice", "Top Biciclete Electrice")],
    "home-garden":          [("/casa", "Reduceri Casa"), ("/top/cafetiere", "Top Cafetiere"), ("/top/purificatoare-aer", "Top Purificatoare Aer"), ("/top/masini-de-spalat", "Top Masini de Spalat")],
    "babies-kids-toys":     [("/copii", "Reduceri Copii & Jucarii")],
    "automotive":           [("/moto", "Reduceri Auto-Moto")],
    "books":                [("/carti", "Reduceri Carti")],
    "health-personal-care": [("/sanatate", "Reduceri Sanatate"), ("/farmacie", "Farmacie Online")],
    "pet-supplies":         [("/animale", "Reduceri Animale")],
    "jewelry":              [("/bijuterii", "Reduceri Bijuterii")],
    "games":                [("/jocuri", "Reduceri Jocuri"), ("/top/scaune-gaming", "Top Scaune Gaming")],
    "hypermarket-groceries":[("/supermarket", "Reduceri Supermarket")],
    "gifts-flowers":        [("/idei-cadouri", "Idei Cadouri")],
}


def bloc_linkuri_interne(categorie_slug: str) -> str:
    linkuri = CAT_LINKURI_INTERNE.get(categorie_slug, [])
    if not linkuri:
        return ""
    items = " | ".join(f"[{label}]({url})" for url, label in linkuri)
    return f"\n\n**Vezi si:** {items}"


def genereaza_articol_magazin(store: dict, luna: str, an: int) -> dict:
    slug_mag  = store["magazin"]
    nume      = nume_afisat(slug_mag)
    promotii  = store.get("promotii", [])
    categorie = store.get("categorie", "Magazine")
    procent   = store.get("procent_succes", 80)
    folosit   = store.get("folosit_de", 0)
    comision  = store.get("comision", "")
    trend     = store.get("trend", 0)
    exclusiv  = store.get("exclusiv", False)

    # ── Bloc promotii detaliat ────────────────────────────────────────────────
    linii_promo = []
    for i, p in enumerate(promotii[:6]):
        linie = f"**{i+1}. {p['nume']}**"
        if p.get("descriere") and p["descriere"] != p["nume"]:
            linie += f"\n   _{p['descriere'][:120]}_"
        if p.get("cod_cupon"):
            linie += f"\n   Cod: `{p['cod_cupon'][:4]}****`"
        if p.get("zile_ramase", 999) <= 3:
            linie += f"\n   ⚠️ Expira in **{p['zile_ramase']} zile** — grabeste-te!"
        elif p.get("zile_ramase", 999) <= 7:
            linie += f"\n   _(expira in {p['zile_ramase']} zile)_"
        linii_promo.append(linie)

    bloc_promo = "\n\n".join(linii_promo) if linii_promo else "Verificati pagina magazinului pentru ofertele curente."

    # ── Texte statistici ──────────────────────────────────────────────────────
    folosit_text  = f"Codul a fost folosit de **{folosit:,} ori** de cumparatorii din Romania." if folosit > 0 else ""
    succes_text   = f"Rata de succes verificata: **{procent}%** — mult peste media de piata de 65%." if procent > 0 else ""
    comision_text = f"Cashback disponibil: **{comision}** din valoarea comenzii." if comision else ""
    trend_text    = f"Popularitate in crestere cu **{trend}%** fata de luna trecuta." if trend > 0 else (
                    f"Magazin stabil, cu comenzi consistente." if trend == 0 else "")
    exclusiv_text = "**Oferta exclusiva AmCupon.ro** — nu o gasesti in alta parte!\n\n" if exclusiv else ""

    # ── Sfaturi cumparaturi specifice lunii ───────────────────────────────────
    sfaturi_luna = {
        "Ianuarie": f"In {luna} {an} cautati reducerile post-sarbatori la {nume} — aceasta este perioada cand magazinele lichideaza stocurile din sezonul de iarna.",
        "Februarie": f"In {luna} {an} valentines Day aduce promotii speciale la {nume}. Cadourile se vand cu reduceri de 10-30%.",
        "Martie": f"In {luna} {an} {nume} lanseaza colectii de primavara. Incepeti sa urmariti ofertele din prima saptamana a lunii.",
        "Aprilie": f"In {luna} {an} reducerile de primavara la {nume} sunt in toi. Produsele de sezon au cele mai bune preturi.",
        "Mai": f"In {luna} {an} urmariti promotiile de 1 Mai si Paste la {nume}. Editii speciale si discounturi de 20-40%.",
        "Iunie": f"In {luna} {an} incep reducerile de vara la {nume}. Cel mai bun moment sa cumparati produse pentru vacanta.",
        "Iulie": f"In {luna} {an} reducerile de vara sunt la maxim la {nume}. Saptamana de reduceri de mijloc de vara aduce discounturi consistente.",
        "August": f"In {luna} {an} pregatiti-va pentru scoala — {nume} are promotii speciale pentru rechizite si electronice.",
        "Septembrie": f"In {luna} {an} sezonul scoala+back-to-work aduce promotii la {nume}. Gama de electronice si fashion este reimprospatata.",
        "Octombrie": f"In {luna} {an} incep pregatirile pentru iarna la {nume}. Acesta e momentul ideal sa cumparati produse de sezon inainte de varf.",
        "Noiembrie": f"In {luna} {an} BLACK FRIDAY este evenimentul anului la {nume}! Reducerile pot ajunge la 70-80%. Adaugati produsele in wishlist din timp.",
        "Decembrie": f"In {luna} {an} cumparaturile de Craciun la {nume} beneficiaza de promotii speciale. Comenzile facute pana pe 20 Decembrie ajung la timp.",
    }
    sfat_luna = sfaturi_luna.get(luna, f"In {luna} {an} {nume} are oferte atractive. Verificati zilnic paginile de promotii.")

    content = f"""Cauti un **cod de reducere {nume}** valid in {luna} {an}? Ai ajuns in locul potrivit. AmCupon.ro monitorizeaza zilnic toate promotiile active de la {nume} si actualizeaza automat codurile de reducere — asa ca tot ce gasesti pe aceasta pagina este **verificat si functional**.

> Ultima verificare automata: **{luna} {an}** | Magazin din categoria: **{categorie}**

{exclusiv_text}## Promotii active {nume} in {luna} {an}

{bloc_promo}

[Vezi codul complet si toate promotiile {nume} →](/cod-reducere/{slug_mag})

---

## Cum aplici codul de reducere la {nume}? (ghid pas cu pas)

Procesul dureaza mai putin de 2 minute si functioneaza la orice comanda:

**Pasul 1** — Mergi pe AmCupon.ro, cauta [{nume}](/cod-reducere/{slug_mag}) si apasa "Copiaza codul". Codul se salveaza automat in clipboard.

**Pasul 2** — Click pe "Acceseaza magazinul" — vei fi redirectionat catre site-ul oficial {nume} (link afiliat verificat).

**Pasul 3** — Adauga produsele dorite in cosul de cumparaturi ca de obicei.

**Pasul 4** — La finalizarea comenzii, cauta campul **"Cod promotional"**, **"Voucher"** sau **"Cupon de reducere"** in pagina de checkout.

**Pasul 5** — Lipieste codul (Ctrl+V sau tine apasat pe mobil) si apasa **"Aplica"**. Reducerea se aplica instantaneu.

> **Atentie:** Unele coduri sunt valabile doar pentru prima comanda, altele pentru produse din anumite categorii. Cititi termenii fiecarei promotii.

---

## De ce sa cumperi la {nume} prin AmCupon.ro?

{comision_text}

{folosit_text}

{succes_text}

{trend_text}

Spre deosebire de alte site-uri de cupoane, AmCupon.ro verifica **zilnic** validitatea fiecarui cod. Nu afisam niciodata coduri expirate sau inactive.

---

## {sfat_luna}

Cel mai simplu mod sa nu ratezi nicio promotie {nume} este sa **te abonezi la newsletter-ul AmCupon.ro** — trimitem zilnic Top 5 oferte din toate magazinele.

---

## Intrebari frecvente despre codurile de reducere {nume}

**Cat dureaza un cod de reducere {nume}?**
Codurile {nume} au valabilitate variabila — de la 24 de ore pentru flash deals pana la cateva saptamani pentru promotiile sezoniere. AmCupon.ro afiseaza zilele ramase pentru fiecare cod.

**Pot combina mai multe coduri de reducere la {nume}?**
In general, {nume} accepta un singur cod per comanda. Exceptie fac situatiile in care combinati un cod de reducere cu cashback-ul disponibil.

**Functioneaza codurile pe aplicatia mobila {nume}?**
Da, codurile de reducere {nume} functioneaza atat pe site cat si pe aplicatia mobila. Campul de voucher se gaseste la aceeasi locatie in checkout.

**Ce fac daca un cod nu functioneaza?**
Apasati "Raporteaza cod" pe AmCupon.ro si il vom verifica si actualiza in maxim 24h. Alternativ, incercati urmatoarea promotie din lista — avem de obicei mai multe optiuni active simultan.

**Exista reduceri fara cod la {nume}?**
Da! Unele promotii {nume} se aplica automat prin link-ul afiliat — fara sa fie nevoie sa introduceti un cod. Le puteti recunoaste dupa eticheta "Reducere automata" de pe AmCupon.ro.

**Cat de des actualizeaza AmCupon.ro codurile {nume}?**
Sistemul nostru verifica promotiile de la {nume} de **6 ori pe zi** (la fiecare 4 ore). Codul pe care il gasiti pe aceasta pagina este valid in momentul in care il accesati.

---

[**Vezi toate ofertele active {nume} pe AmCupon.ro →**](/cod-reducere/{slug_mag}){bloc_linkuri_interne(store.get("categorie_slug", ""))}"""

    return {
        "slug":    slug_articol_magazin(slug_mag, luna, an),
        "title":   f"Cod Reducere {nume} {luna} {an} | AmCupon.ro",
        "date":    datetime.now().strftime("%Y-%m-%d"),
        "excerpt": f"Coduri reducere {nume} verificate in {luna} {an}. {len(promotii)} promotii active, rata succes {procent}%. Ghid complet + FAQ pe AmCupon.ro.",
        "category": categorie,
        "magazin":  slug_mag,
        "cover":    store.get("logo_url") or f"https://picsum.photos/seed/{slug_mag}/800/400",
        "content":  content,
        "tip":      "magazin",
    }


def genereaza_articol_categorie(cat_slug: str, cat_name: str, magazine: list, luna: str, an: int) -> dict:
    """Roundup lunar per categorie — 'Top 5 magazine Fashion cu reduceri active'."""
    mag_cat = [
        m for m in magazine
        if m.get("categorie_slug") == cat_slug and m.get("are_promotie") and m.get("promotii")
    ]
    mag_cat.sort(key=lambda x: (x.get("cod_cupon", False), x.get("procent_succes", 0)), reverse=True)
    top = mag_cat[:7]

    if len(top) < 3:
        # Sub 3 magazine inseamna un articol "Top Reduceri" fals — promite un roundup,
        # livreaza 1-2 intrari. Mai bine nu generam deloc decat sa publicam continut slab.
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
        "title": f"Top Reduceri {cat_name} {luna} {an} | AmCupon.ro",
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
    # ── 3a. Magazine cu promotii active ───────────────────────────────────────
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

    # ── 3b. Magazine TOP fara promotii — scop SEO (cashback + brand awareness) ─
    # Aceste magazine rankeaza pe "cod reducere [brand]" chiar fara promotii active
    top_fara_promo = [
        m for m in magazine
        if not m.get("are_promotie")
        and m.get("scor_final", 0) > 10
        and " " not in m.get("magazin", "")      # skip sluguri invalide
        and "/" not in m.get("magazin", "")       # skip sluguri cu path
        and len(m.get("magazin", "")) > 3         # skip sluguri goale/scurte
    ]
    top_fara_promo.sort(key=lambda x: x.get("scor_final", 0), reverse=True)

    for store in top_fara_promo:
        if generate_count >= POSTS_PER_RUN:
            break
        slug = slug_articol_magazin(store["magazin"], luna, an)
        if slug not in sluguri_existente:
            art = genereaza_articol_magazin(store, luna, an)
            noi.append(art)
            sluguri_existente.add(slug)
            generate_count += 1
            print(f"Generat magazin (SEO top): {art['title']}")

    # ── PRUNE articole lunare EXPIRATE (fix 05.06.2026) ────────────────────────
    # Articolele tip magazin/categorie/roundup se regenereaza lunar cu acelasi
    # continut dar slug nou (-mai-2026, -iunie-2026...), creand DUPLICATE CONTENT
    # care se canibalizeaza. Pastram doar luna curenta; stergem lunile vechi.
    # Best-of (cel-mai-bun-X-2026) si evergreen NU au luna in slug -> raman intacte.
    _luni_lower = [v.lower() for v in LUNI_RO.values()]
    _month_re = re.compile(r"-(" + "|".join(_luni_lower) + r")-(\d{4})$")
    _suffix_curent = f"-{luna.lower()}-{an}"

    def _este_lunar_expirat(slug: str) -> bool:
        if not _month_re.search(slug):
            return False  # nu e articol lunar -> pastreaza
        return not slug.endswith(_suffix_curent)

    inainte = len(posts)
    posts = [p for p in posts if not _este_lunar_expirat(p.get("slug", ""))]
    sterse = inainte - len(posts)
    if sterse:
        print(f"Prune: sterse {sterse} articole lunare expirate (duplicate).")

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
