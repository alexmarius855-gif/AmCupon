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
import sys
from datetime import datetime

LUNI_RO = {
    1: "Ianuarie", 2: "Februarie", 3: "Martie", 4: "Aprilie",
    5: "Mai", 6: "Iunie", 7: "Iulie", 8: "August",
    9: "Septembrie", 10: "Octombrie", 11: "Noiembrie", 12: "Decembrie",
}

MAX_POSTS = 500       # max total articole in blog-posts.json
POSTS_PER_RUN = 30   # articole noi per rulare (6 rulari/zi = 180/zi pana acoperim toti)

# Covere pe brand (generate cu generate_blog_covers.py) — NU folosi picsum/poze random
BLOG_COVERS_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "blog-covers")

def cover_categorie(cat_slug: str) -> str:
    """Cover pe brand pentru categorie; fallback default daca fisierul nu exista."""
    if os.path.exists(os.path.join(BLOG_COVERS_DIR, f"{cat_slug}.png")):
        return f"/blog-covers/{cat_slug}.png"
    return "/blog-covers/default.png"

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


# Numele magazinului: scripts/nume_magazin.py, acelasi rezultat ca numeAfisat() din frontend
# (06.10.2026 — copia naiva de aici scria „Cod Reducere Us" pentru us.lemorele.com).
from nume_magazin import nume_afisat  # noqa: E402
from promotii import fara_coduri, pare_cod, titlu_promotie  # noqa: E402


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


def masca_cod(cod: str) -> str:
    """Aceeasi masca ca maskCod() din frontend/lib/maskCod.ts: se vad doar ultimele 2 caractere.
    Primele 4, cat arata articolele pana pe 06.10.2026, ghiceau aproape orice cod scurt
    („TOAM****" = TOAMNA15) — iar codul intreg se vede pe pagina magazinului, unde clicul trece prin
    linkul afiliat."""
    if not cod:
        return cod
    coada = cod[-2:] if len(cod) > 3 else ""
    return "*" * max(3, min(len(cod) - len(coada), 6)) + coada


def cate(n: int, unu: str, multe: str) -> str:
    """„1 promoție activă", „7 promoții active", „20 de promoții active" (cu „de" de la 20 in sus)."""
    if n == 1:
        return f"1 {unu}"
    r = n % 100
    return f"{n}{' de' if n and (r == 0 or r >= 20) else ''} {multe}"


def text_expirare(zile) -> str:
    if not isinstance(zile, int) or zile > 7:
        return ""
    if zile <= 0:
        return "\n   ⚠️ Expiră **azi**"
    if zile == 1:
        return "\n   ⚠️ Expiră **mâine**"
    if zile <= 3:
        return f"\n   ⚠️ Expiră în **{zile} zile**"
    return f"\n   _(expiră în {zile} zile)_"


# Sfatul lunii: generic, despre PERIOADA, nu despre magazin. Varianta de pana pe 06.10.2026 punea
# pe seama fiecarui magazin lucruri pe care nu le stiam („{nume} are promotii speciale pentru
# rechizite si electronice", „Reducerile pot ajunge la 70-80%", „Cadourile se vand cu reduceri de
# 10-30%") — pe 147 de articole, la librarii si farmacii la fel ca la magazinele de haine.
# 07.10.2026: cu diacritice — textul ajunge pe ~180 de pagini.
SFATURI_LUNA = {
    "Ianuarie":   "După sărbători, multe magazine online lichidează stocurile de iarnă. Compară prețul cu cel din decembrie, ca să vezi reducerea reală.",
    "Februarie":  "În februarie apar promoții de Valentine's Day la multe magazine online. Comandă din timp dacă e un cadou cu dată fixă.",
    "Martie":     "În martie multe magazine trec la produsele de primăvară, iar ce a rămas din stocul de iarnă iese adesea la reducere.",
    "Aprilie":    "Înainte de Paște, multe magazine online au promoții de sezon. Comandă din timp, ca să ajungă coletul înainte de sărbătoare.",
    "Mai":        "În mai apar promoții de 1 Mai și de început de vară. Verifică data de expirare a ofertei înainte să comanzi.",
    "Iunie":      "În iunie încep reducerile de vară la multe magazine online, mai ales la haine și la produsele de sezon.",
    "Iulie":      "În iulie reducerile de vară sunt în plin sezon. Compară prețul cu cel de la începutul verii, ca să vezi reducerea reală.",
    "August":     "În august apar ofertele pentru începutul școlii. La rechizite și electronice, compară prețurile din mai multe magazine.",
    "Septembrie": "În septembrie multe magazine trec la colecțiile de toamnă, iar produsele de vară ies la reducere.",
    "Octombrie":  "În octombrie multe magazine aduc produsele de toamnă-iarnă. Dacă vrei un produs anume, notează-i prețul de acum: la Black Friday, în noiembrie, vei ști dacă reducerea e reală.",
    "Noiembrie":  "Noiembrie e luna Black Friday. Pune produsele dorite în wishlist din timp și notează prețul de dinainte de campanie, ca să vezi reducerea reală.",
    "Decembrie":  "În decembrie comandă din timp: înainte de Crăciun, termenele de livrare se lungesc. Data limită de livrare pentru sărbători o afli de pe site-ul magazinului.",
}


def genereaza_articol_magazin(store: dict, luna: str, an: int) -> dict:
    """Articolul lunar „Cod Reducere X <Luna> <An>".

    06.10.2026 — rescris pentru „zero informatii eronate" (Alex, 05.10). Varianta veche spunea, pe
    toate cele 147 de articole live: „AmCupon.ro verifica **zilnic** validitatea fiecarui cod. Nu
    afisam niciodata coduri expirate" (nu verificam coduri), „Apasati «Raporteaza cod» ... il vom
    verifica in maxim 24h" (butonul nu exista), eticheta „Reducere automata" (nu exista), „Codul ...
    este valid in momentul in care il accesati", „Oferta exclusiva AmCupon.ro — nu o gasesti in alta
    parte!" (pusa oricarui magazin cu cod; codurile din retea le primesc toti afiliatii), „Magazin
    stabil, cu comenzi consistente" (`trend` e 0 la toate magazinele — nicio data) si un comentariu
    HTML intern afisat ca TEXT in pagina. Regula: fiecare propozitie e fie adevarata pentru orice
    magazin, fie calculata din datele lui. Garda: verifica_site.py (REGULI_CORP) + curata_articole.py.
    07.10.2026: textul are diacritice (pana atunci, ca restul generatoarelor, fara).
    """
    slug_mag  = store["magazin"]
    nume      = nume_afisat(slug_mag)
    promotii  = store.get("promotii", [])
    categorie = store.get("categorie", "Magazine")

    # ── Bloc promotii detaliat ────────────────────────────────────────────────
    linii_promo = []
    for i, p in enumerate(promotii[:6]):
        # 07.10.2026: titlul si descrierea FARA cod (promotii.titlu_promotie / fara_cod, ca pe site).
        # „Use Code: 30CVLIFE", „Coupon Code: LONGERR" si titlurile Impact care SUNT codul
        # („LumosFlex120") il aratau intreg chiar deasupra liniei „Cod: `******FE`" mascate.
        titlu_p = fara_coduri(titlu_promotie(p, nume), p) or f"Ofertă {nume}"
        desc_p = fara_coduri(p.get("descriere") or "", p)
        linie = f"**{i+1}. {titlu_p}**"
        if desc_p and desc_p != titlu_p and not pare_cod(desc_p):
            linie += f"\n   _{desc_p[:120]}_"
        if p.get("cod_cupon"):
            linie += f"\n   Cod: `{masca_cod(p['cod_cupon'])}`"
        linie += text_expirare(p.get("zile_ramase"))
        linii_promo.append(linie)

    bloc_promo = ("\n\n".join(linii_promo) if linii_promo else
                  f"Acum nu e nicio promoție {nume} activă în rețeaua de afiliere. Când apare una, o găsești "
                  f"pe pagina magazinului de pe AmCupon.ro.")
    sfat_luna = SFATURI_LUNA.get(luna, "Ofertele se schimbă de mai multe ori pe zi: verifică pagina magazinului "
                                       "de pe AmCupon.ro înainte de fiecare comandă.")
    # Frecventa reala: update-data.yml are 3 rulari programate pe zi, dar GitHub le intarzie sau le
    # sare, deci „de mai multe ori pe zi", nu un numar. Daca schimbi cron-ul, verifica textul.

    content = f"""Cauți un **cod de reducere {nume}** valid în {luna} {an}? AmCupon.ro preia automat, de mai multe ori pe zi, promoțiile active de la {nume} din rețeaua de afiliere și le scoate pe cele expirate. Codurile nu le testăm în coș: dacă unul nu merge, încearcă altă ofertă activă.

> Actualizat automat: **{luna} {an}** | Categoria: **{categorie}**

## Promoții active {nume} în {luna} {an}

{bloc_promo}

[Vezi codul complet și toate promoțiile {nume} →](/cod-reducere/{slug_mag})

---

## Cum aplici codul de reducere la {nume}? (ghid pas cu pas)

**Pasul 1** — Pe pagina {nume} de pe AmCupon.ro, apasă pe codul care te interesează: se copiază automat.

**Pasul 2** — Mergi pe site-ul oficial {nume} prin linkul de pe AmCupon.ro (link afiliat).

**Pasul 3** — Adaugă produsele dorite în coșul de cumpărături ca de obicei.

**Pasul 4** — La finalizarea comenzii, caută câmpul **"Cod promoțional"**, **"Voucher"** sau **"Cupon de reducere"**.

**Pasul 5** — Lipește codul și apasă **"Aplică"**. Dacă e valid pentru coșul tău, reducerea apare în total înainte de plată.

> **Atenție:** Unele coduri sunt valabile doar pentru prima comandă, altele doar pentru anumite categorii sau peste o valoare minimă a coșului. Citește termenii fiecărei promoții.

---

## De ce să cumperi la {nume} prin AmCupon.ro?

Ofertele {nume} vin direct din rețeaua de afiliere a magazinului, iar cele cu data de expirare trecută dispar automat de pe AmCupon.ro. Prețul tău rămâne același: dacă cumperi prin linkul nostru, magazinul ne plătește un comision din bugetul lui de marketing.

---

## Sfatul lunii {luna}

{sfat_luna}

Ca să nu ratezi promoțiile {nume}, **abonează-te la newsletter-ul AmCupon.ro**: primești ofertele active pe email, o dată pe zi.

---

## Întrebări frecvente despre codurile de reducere {nume}

**Cât timp e valabil un cod de reducere {nume}?**
Fiecare promoție are perioada ei, stabilită de {nume}. Când rețeaua de afiliere ne dă data de expirare, AmCupon.ro o afișează lângă ofertă.

**Pot combina mai multe coduri de reducere la {nume}?**
Depinde de regulile {nume}. Multe magazine online acceptă un singur cod pe comandă; condițiile exacte sunt în termenii promoției, pe site-ul magazinului.

**Ce fac dacă un cod nu funcționează?**
Verifică condițiile promoției (valoarea minimă a coșului, produsele excluse, doar prima comandă) și încearcă altă ofertă activă {nume}. O promoție se poate epuiza și înainte de data de expirare.

**Există reduceri fără cod la {nume}?**
Unele promoții nu au cod: reducerea e aplicată direct pe site-ul magazinului. Pe AmCupon.ro le găsești la ofertele fără cod, cu link direct spre {nume}.

**Cât de des actualizează AmCupon.ro ofertele {nume}?**
De mai multe ori pe zi, automat, din rețeaua de afiliere. Valabilitatea finală a unui cod o confirmă coșul magazinului.

---

[**Vezi toate ofertele active {nume} pe AmCupon.ro →**](/cod-reducere/{slug_mag}){bloc_linkuri_interne(store.get("categorie_slug", ""))}"""

    # Fara promotii, descrierea o spune direct. Pagina articolului decide `noindex` din DATE
    # (output.json), nu din textul descrierii — vezi app/blog/[slug]/page.tsx.
    n = len(promotii)
    excerpt = (f"{cate(n, 'promoție activă', 'promoții active')} {nume} în {luna} {an}, din rețeaua de afiliere "
               f"a magazinului. Cum aplici codul și întrebări frecvente."
               if n else
               f"Acum nu e nicio promoție {nume} activă. Pagina se actualizează automat; cum aplici un cod și "
               f"întrebări frecvente.")
    return {
        "slug":    slug_articol_magazin(slug_mag, luna, an),
        "title":   f"Cod Reducere {nume} {luna} {an} | AmCupon.ro",
        "date":    datetime.now().strftime("%Y-%m-%d"),
        "excerpt": excerpt,
        "category": categorie,
        "magazin":  slug_mag,
        "cover":    store.get("logo_url") or "/blog-covers/default.png",
        "content":  content,
        "tip":      "magazin",
    }


def titlu_fara_cod(p: dict, nume_m: str) -> str:
    """Titlul promotiei pentru text, fara niciun cod in clar (07.10.2026; vezi articolul de magazin)."""
    return fara_coduri(titlu_promotie(p, nume_m), p) or f"Ofertă {nume_m}"


def genereaza_articol_categorie(cat_slug: str, cat_name: str, magazine: list, luna: str, an: int) -> dict:
    """Roundup lunar per categorie — 'Top 5 magazine Fashion cu reduceri active'."""
    mag_cat = [
        m for m in magazine
        if m.get("categorie_slug") == cat_slug and m.get("are_promotie") and m.get("promotii")
    ]
    # 07.09: al doilea criteriu era `procent_succes` = random.Random(hash(m)).randint(72,96).
    # Ordinea magazinelor din articolele generate era deci arbitrara. `scor_final` e real
    # (rule-based in calculeaza_scor: promotie + cod + urgenta).
    mag_cat.sort(key=lambda x: (x.get("cod_cupon", False), x.get("scor_final", 0)), reverse=True)
    top = mag_cat[:7]

    if len(top) < 3:
        # Sub 3 magazine inseamna un articol "Top Reduceri" fals — promite un roundup,
        # livreaza 1-2 intrari. Mai bine nu generam deloc decat sa publicam continut slab.
        return None

    linii_mag = []
    for i, m in enumerate(top, 1):
        nume_m = nume_afisat(m["magazin"])
        promotii_m = m.get("promotii", [])
        promo_text = titlu_fara_cod(promotii_m[0], nume_m) if promotii_m else "Oferta activa"
        cod_text = f" — Cod: `{masca_cod(promotii_m[0]['cod_cupon'])}`" if promotii_m and promotii_m[0].get("cod_cupon") else ""
        linii_mag.append(
            f"### {i}. [{nume_m}](/cod-reducere/{m['magazin']})\n"
            f"**{promo_text}**{cod_text}  \n"
            f"[Vezi oferta →](/cod-reducere/{m['magazin']})"
        )

    bloc_magazine = "\n\n".join(linii_mag)
    nr_total = len(mag_cat)
    nr_coduri = sum(1 for m in mag_cat if m.get("cod_cupon"))

    content = f"""## Cele mai bune reduceri {cat_name} in {luna} {an}

In {luna} {an}, AmCupon.ro monitorizeaza **{nr_total} magazine** de {cat_name} cu promotii active, din care **{nr_coduri} au cod de reducere**. Mai jos gasesti selectia noastra pentru aceasta luna.

{bloc_magazine}

## Cum gasesti intotdeauna cele mai bune reduceri {cat_name}?

1. **Salveaza pagina** [/categorii/{cat_slug}](/categorii/{cat_slug}) la favorite — se actualizeaza automat de mai multe ori pe zi
2. **Compara ofertele** — unele magazine ofera procent din total, altele transport gratuit
3. **Verifica conditiile** — unele coduri au cos minim sau categorii eligibile
4. **Revino la inceput de luna** — magazinele lanseaza promotii noi constant

## Despre AmCupon.ro

AmCupon.ro aduna automat, de mai multe ori pe zi, ofertele active de la magazinele partenere. Nu platesti nimic in plus — magazinele ne platesc un mic comision din bugetul lor de marketing.

[Vezi toate magazinele de {cat_name} →](/categorii/{cat_slug})"""

    return {
        "slug": slug_articol_categorie(cat_slug, luna, an),
        "title": f"Top Reduceri {cat_name} {luna} {an} | AmCupon.ro",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "excerpt": f"{nr_total} magazine de {cat_name} cu promotii active in {luna} {an}. {nr_coduri} cu cod reducere. Oferte actualizate zilnic pe AmCupon.ro.",
        "category": cat_name,
        "cover": cover_categorie(cat_slug),
        "content": content,
        "tip": "categorie",
    }


def genereaza_articol_roundup(magazine: list, luna: str, an: int) -> dict:
    """Articol general lunar — 'Cele mai bune coduri reducere din Mai 2026'."""
    cu_cod = [m for m in magazine if m.get("cod_cupon") and m.get("promotii")]
    cu_cod.sort(key=lambda x: x.get("scor_final", 0), reverse=True)  # 07.09: era random
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
            promo_text = titlu_fara_cod(promotii_m[0], nume_m) if promotii_m else "Oferta activa"
            linii.append(f"- **[{nume_m}](/cod-reducere/{m['magazin']})** — {promo_text}")
        sectiuni.append(f"### {cat}\n" + "\n".join(linii))

    bloc_sectiuni = "\n\n".join(sectiuni)
    total_magazine = len([m for m in magazine if m.get("are_promotie")])
    # 07.10.2026: numara CODURILE, nu magazinele cu cod — „38 coduri de reducere active” erau 38 de magazine
    # cu 99 de coduri intre ele.
    total_coduri   = sum(1 for m in cu_cod for p in m.get("promotii", []) if (p.get("cod_cupon") or "").strip())

    content = f"""## Rezumat reduceri {luna} {an}

In {luna} {an}, AmCupon.ro monitorizeaza **{total_magazine} magazine** cu promotii active si **{total_coduri} coduri de reducere** active. Iata cele mai bune oferte ale lunii:

{bloc_sectiuni}

## Cum sa economisesti mai mult in {luna} {an}

- **Combina coduri cu promotii** — unele magazine accepta cod + reducere de sezon simultan
- **Urmareste expirarea** — afisam zilele ramase cand reteaua de afiliere ne da data de expirare
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
        "excerpt": f"Selectia celor mai bune {total_coduri} coduri reducere active in {luna} {an} din {total_magazine} magazine. Actualizate zilnic pe AmCupon.ro.",
        "category": "General",
        "cover": "/blog-covers/roundup.png",
        "content": content,
        "tip": "roundup",
    }


def main():
    # `--doar-improspatare`: nu scrie articole noi, doar aduce la zi ofertele din cele existente.
    # Ruleaza la FIECARE rulare de pipeline (promotiile se schimba de 3 ori pe zi), pe cand
    # generarea de articole noi ramane o data pe zi.
    doar_improspatare = "--doar-improspatare" in sys.argv
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
    # In modul „doar improspatare" pornim de la plafon: niciun articol nou nu mai trece de garda.
    generate_count = POSTS_PER_RUN if doar_improspatare else 0
    noi = []

    # ── 1. Articol roundup lunar (1/luna) ──────────────────────────────────────
    slug_r = slug_articol_roundup(luna, an)
    if not doar_improspatare and slug_r not in sluguri_existente:
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
    cu_promotii.sort(key=lambda x: x.get("scor_final", 0), reverse=True)  # 07.09: era random

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

    # ── IMPROSPATARE: articolele de magazin ale lunii curente ──────────────────
    # 17.09.2026: „Cod Reducere Nadula Septembrie 2026" (generat pe 08.09) lista
    # „Klaiyi Hair 9th Anniversary Blowout 2026" — promotie expirata SI a altui brand — iar
    # articolul se afiseaza si pe pagina magazinului. 21 din 442 de articole de magazin aveau
    # promotii care nu mai exista: se generau o singura data si nu se mai atingeau niciodata
    # (acelasi tipar ca la promotii — docs/LECTII-TEHNICE.md #5). Continutul e determinist
    # din datele magazinului, deci se rescrie doar cand chiar s-a schimbat oferta.
    prin_slug = {m.get("magazin"): m for m in magazine}
    improspatate = 0
    for i, p in enumerate(posts):
        if p.get("tip") != "magazin":
            continue
        store = prin_slug.get(p.get("magazin"))
        if not store or p.get("slug") != slug_articol_magazin(store["magazin"], luna, an):
            continue
        nou = genereaza_articol_magazin(store, luna, an)
        if nou.get("content") == p.get("content"):
            continue
        # Data publicarii si coperta raman ale articolului: se schimba oferta, nu articolul.
        posts[i] = {**nou, "date": p.get("date", nou["date"]), "cover": p.get("cover", nou.get("cover"))}
        improspatate += 1
    # 07.10.2026: si articolele de categorie si rezumatul lunii curente. Se generau o data pe luna si nu
    # se mai atingeau: cifrele („26 de magazine cu promotii, 9 cu cod") ramaneau cele din ziua 1, iar
    # promotiile listate expirau — acelasi tipar ca mai sus (LECTII-TEHNICE #5). Tot determinist.
    cat_dupa_slug = {slug_articol_categorie(c, luna, an): (c, n) for c, n, _ in CATEGORII_ROUNDUP}
    for i, p in enumerate(posts):
        if p.get("tip") == "categorie" and p.get("slug") in cat_dupa_slug:
            nou = genereaza_articol_categorie(*cat_dupa_slug[p["slug"]], magazine, luna, an)
        elif p.get("tip") == "roundup" and p.get("slug") == slug_articol_roundup(luna, an):
            nou = genereaza_articol_roundup(magazine, luna, an)
        else:
            continue
        if not nou or nou.get("content") == p.get("content"):
            continue
        posts[i] = {**nou, "date": p.get("date", nou["date"]), "cover": p.get("cover", nou.get("cover"))}
        improspatate += 1
    if improspatate:
        print(f"Improspatate {improspatate} articole (oferta sau cifrele lunii s-au schimbat)")

    # Articolele magazinelor scoase pentru ca programul lor nu acopera Romania (merge_platforms.py,
    # 19.09.2026): 74 de articole ramaneau cu ofertele „Eufy NL" & co., iar improspatarea de mai sus
    # nu le mai atinge (magazinul nu mai e in output.json). Doar lista EXPLICITA — nu „orice magazin
    # care lipseste", pentru ca 3 articole au alt slug decat magazinul si ar fi sters degeaba.
    fara_ro_path = os.path.join(repo_root, "frontend", "public", "magazine-fara-livrare-ro.json")
    try:
        with open(fara_ro_path, encoding="utf-8") as f:
            fara_ro = {x["magazin"] for x in json.load(f)}
    except (OSError, ValueError, KeyError, TypeError):
        fara_ro = set()
    if 0 < len(fara_ro) <= 300:
        inainte = len(posts)
        posts = [p for p in posts if not (p.get("tip") == "magazin" and p.get("magazin") in fara_ro)]
        if len(posts) < inainte:
            print(f"Scoase {inainte - len(posts)} articole ale magazinelor fara livrare in Romania")

    # Articolele lunare ale magazinelor iesite din output.json (06.10.2026). „Cod Reducere Librex
    # Octombrie 2026" ramasese cu „0 promotii active", cu linkuri spre /cod-reducere/librex.ro (pagina
    # nu se mai genereaza: 404) si cu un ghid care trimitea la o pagina inexistenta; improspatarea de
    # mai sus nu-l atinge, pentru ca magazinul lipseste. Doar articolele LUNARE STANDARD (slug-ul
    # calculat din magazin) — cele cu alt slug decat magazinul raman, ca la regula de mai sus. Cand
    # magazinul revine cu promotii, articolul se genereaza din nou. Garda: daca lipsesc multe magazine
    # deodata, output.json e probabil trunchiat — nu stergem nimic, doar spunem.
    absente = [p for p in posts
               if p.get("tip") == "magazin" and p.get("magazin") and p["magazin"] not in prin_slug
               and p.get("slug") == slug_articol_magazin(p["magazin"], luna, an)]
    nr_lunare = sum(1 for p in posts if p.get("tip") == "magazin")
    if absente and len(absente) <= max(5, nr_lunare // 10):
        scoase = {p["slug"] for p in absente}
        posts = [p for p in posts if p.get("slug") not in scoase]
        print(f"Scoase {len(scoase)} articole lunare ale magazinelor iesite din output.json: "
              f"{', '.join(sorted(scoase)[:8])}")
    elif absente:
        print(f"!! {len(absente)} articole de magazin au magazinul lipsa din output.json — prea multe ca sa fie "
              f"real (output.json trunchiat?). Nu sterg nimic.")

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

    # ── Articole scrise de mana — supravietuiesc oricarei regenerari ──────────
    # Acelasi tipar ca `data/extra_merchants.json` pentru magazine: un fisier separat,
    # re-injectat la fiecare rulare, ca sa nu depinda de ce face generatorul automat.
    #
    # Fara asta, un articol manual ar fi pierdut in doua feluri, ambele tacute:
    #   1. pruning-ul de mai sus, daca slug-ul are luna in el;
    #   2. plafonul MAX_POSTS, cand articolele noi generate zilnic il impinge afara —
    #      si asta se intampla oricum, fiindca sortarea e pe data descrescator.
    # Injectia se face DUPA pruning si INAINTE de taierea la MAX_POSTS, iar articolele
    # manuale sunt scoase din numaratoarea plafonului: nu ele trebuie sa cedeze locul.
    manual_path = os.path.join(repo_root, "data", "articole_manuale.json")
    manuale = []
    if os.path.exists(manual_path):
        try:
            with open(manual_path, encoding="utf-8") as f:
                manuale = json.load(f)
            sluguri_manuale = {m["slug"] for m in manuale}
            posts = [p for p in posts if p.get("slug") not in sluguri_manuale]
            noi = [p for p in noi if p.get("slug") not in sluguri_manuale]
            print(f"Articole manuale reinjectate: {len(manuale)}")
        except (OSError, ValueError, KeyError) as e:
            # Un articol manual stricat nu are voie sa opreasca generarea blogului.
            print(f"AVERTISMENT: articole_manuale.json nu a putut fi citit ({e}) — continui fara.")
            manuale = []

    # Insereaza articolele noi la inceput si limiteaza la MAX_POSTS
    all_posts = noi + posts
    all_posts = sorted(all_posts, key=lambda x: x["date"], reverse=True)[:MAX_POSTS]
    all_posts = manuale + [p for p in all_posts if p.get("slug") not in
                           {m["slug"] for m in manuale}]
    all_posts = sorted(all_posts, key=lambda x: x["date"], reverse=True)

    with open(blog_path, "w", encoding="utf-8") as f:
        json.dump(all_posts, f, ensure_ascii=False, indent=2)

    print(f"\nBlog actualizat: {len(noi)} articole noi, {len(all_posts)} total.")
    tip_counts = {}
    for p in noi:
        t = p.get("tip", "?")
        tip_counts[t] = tip_counts.get(t, 0) + 1
    for tip, cnt in tip_counts.items():
        print(f"  {tip}: {cnt}")


if __name__ == "__main__":
    main()
