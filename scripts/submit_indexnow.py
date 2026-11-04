"""
IndexNow — anunta motoarele de cautare instant cand apar pagini noi.
Trimite la api.indexnow.org — distribuit automat la Bing, Yandex, Naver, Seznam.

IMPORTANT (verificat 20.07.2026): Google NU participa la protocolul IndexNow
(testat de Google din 2021, niciodata adoptat oficial — vezi ppc.land/googles-absence-
from-indexnow-raises-questions-about-web-indexing-standards). Pentru Google specific,
singurele mecanisme reale raman: sitemap.xml (deja corect, vezi frontend/app/sitemap.ts)
+ Google Search Console "Request Indexing" manual per URL (doar Alex poate face asta,
cota ~10-12 URL-uri/zi). Acest script NU rezolva "1 pagina indexata din 2600" — rezolva
doar viteza de indexare pe Bing/Yandex, care raman surse secundare de trafic fata de Google.

Trimitem URL-uri NOI fata de rularea anterioara (diff vs data/indexnow_seen.json).
La prima rulare dupa reset: trimite TOATE paginile statice + cele cu promotii.

Din 04.11.2026 trimitem si paginile SCHIMBATE (data/indexnow_amprente.json): o pagina de magazin la care a
aparut o oferta sau un cod. Pana atunci o pagina se anunta o singura data in viata ei, deci Bing, sursa
noastra reala de trafic, nu afla cand porneste Black Friday la un magazin. Doar schimbari reale: titlul
ofertei si daca are cod, nu contorul de zile, care se schimba zilnic.

Ambele fisiere se salveaza in pasul „Memoria gardii” din update-data.yml, DUPA acest pas. Pana pe 04.11
jurnalul se scria dupa commit si se pierdea, deci din 16.08 fiecare rulare retrimitea aceleasi adrese.
"""

import hashlib
import json
import os
import sys
from datetime import datetime, timedelta, timezone

import requests

INDEXNOW_KEY = "25cbf8f168546247ae70c702384fe152"
BASE_URL = "https://amcupon.ro"
KEY_LOCATION = f"{BASE_URL}/{INDEXNOW_KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"

script_dir = os.path.dirname(os.path.abspath(__file__))
repo_root = os.path.dirname(script_dir)
SEEN_PATH = os.path.join(repo_root, "data", "indexnow_seen.json")
AMPRENTE_PATH = os.path.join(repo_root, "data", "indexnow_amprente.json")
BLOG_PATH = os.path.join(repo_root, "frontend", "public", "blog-posts.json")
OUTPUT_PATH = os.path.join(repo_root, "frontend", "public", "output.json")
COMPARISONS_PATH = os.path.join(repo_root, "frontend", "public", "comparisons.json")
BLACK_FRIDAY_PATH = os.path.join(repo_root, "frontend", "public", "black-friday-parteneri.json")

# Toate paginile statice importante — trimise o singura data (raman in seen dupa)
STATIC_PAGES = [
    "/", "/radar", "/oferte-azi", "/toate-magazinele", "/categorii", "/blog",
    "/produse", "/top", "/servicii", "/comparatii", "/asigurari",
    # Nise principale
    "/fashion", "/frumusete", "/electronice", "/gadgets", "/sport", "/copii",
    "/animale", "/casa", "/calatorie", "/carti", "/parfumuri", "/sanatate",
    "/farmacie", "/supermarket", "/jocuri", "/idei-cadouri", "/bijuterii",
    "/gaming", "/laptop", "/telefoane", "/antivirus", "/smart-home",
    "/instrumente-seo", "/trading", "/carduri-bancare", "/vpn", "/hosting",
    "/ai-tools", "/software-business", "/flori", "/pescuit",
    "/piese-auto", "/echipament-moto", "/rochii-mireasa", "/albire-dinti",
    "/studiu/coduri-reducere-romania",
    "/black-friday", "/reduceri-reale", "/craciun", "/moto",
    # Cadouri
    "/cadouri", "/cadouri/ea", "/cadouri/el", "/cadouri/copii", "/cadouri/mama",
    "/cadouri/tata", "/cadouri/botez", "/cadouri/nasi", "/cadouri/nastere",
    "/cadouri/valentine", "/cadouri/craciun", "/cadouri/absolvire", "/cadouri/pasti",
    "/cadouri/sub-100-lei", "/cadouri/sub-200-lei", "/cadouri/sub-500-lei", "/cadouri/peste-500-lei",
    # Brand pages internationale
    "/temu", "/trendyol", "/shein", "/answear", "/notino", "/amazon", "/asos",
    "/iherb", "/banggood",
    # Brand pages romanesti
    "/altex", "/emag", "/elefant", "/decathlon", "/libris", "/fashiondays",
    "/carturesti", "/drmax", "/noriel", "/petmart", "/brico", "/liki24",
    "/vidaxl", "/flanco", "/bookzone", "/vegis", "/petmax", "/sportdepot",
    "/automobilus", "/litera", "/pcmadd", "/otter", "/scule365", "/kitunghii", "/pfarma",
    # Unelte
    "/calculator", "/calculator-salariu", "/generator-proforma", "/top-reduceri",
    "/recomandari", "/extensie",
]


def load_json(path, default):
    if not os.path.exists(path):
        return default
    # utf-8-sig: tolereaza BOM-ul UTF-8 (altfel json.load crapa si rupe pasul din pipeline)
    with open(path, encoding="utf-8-sig") as f:
        return json.load(f)


def _hash(randuri) -> str:
    return hashlib.sha1("\n".join(sorted(randuri)).encode("utf-8")).hexdigest()[:12]


def amprenta(promotii: list) -> str:
    """Ce vede omul pe pagina: titlul fiecarei oferte si daca are cod. In orice ordine."""
    return _hash(f"{p.get('nume') or ''}|{bool((p.get('cod_cupon') or '').strip())}"
                 for p in promotii if isinstance(p, dict))


def pagini_schimbate(magazine: list, campanii: list, azi: str, vechi: dict) -> tuple:
    """(adrese de retrimis, amprente noi). O pagina fara oferte nu se anunta, iar amprenta ei dispare: cand
    oferta programata porneste, pagina se schimba din nou si se anunta din nou."""
    noi, adrese = {}, []
    cu_campanie = {c.get("magazin") for c in campanii}
    for m in magazine:
        slug = m.get("magazin") or ""
        promotii = m.get("promotii") or []
        if not promotii or " " in slug or len(slug.split("/")) > 2:
            continue
        noi[slug] = amprenta(promotii)
        if vechi.get(slug) != noi[slug]:
            adrese.append(f"{BASE_URL}/cod-reducere/{slug}")
            if slug in cu_campanie:
                adrese.append(f"{BASE_URL}/black-friday/{slug}")
    # Calendarul se schimba cand o campanie porneste sau se termina.
    active = [str(c.get("magazin")) for c in campanii if (c.get("start") or "") <= azi <= (c.get("final") or "")]
    noi["/black-friday"] = _hash(active)
    if vechi.get("/black-friday") != noi["/black-friday"]:
        adrese.append(f"{BASE_URL}/black-friday")
    return adrese, noi


def scrie_amprente(amprente: dict) -> None:
    os.makedirs(os.path.dirname(AMPRENTE_PATH), exist_ok=True)
    with open(AMPRENTE_PATH, "w", encoding="utf-8") as f:
        json.dump(amprente, f, ensure_ascii=False, indent=0, sort_keys=True)


def test() -> int:
    p1 = {"nume": "Black Friday", "cod_cupon": ""}
    p2 = {"nume": "Reducere 10%", "cod_cupon": ""}
    p3 = {"nume": "Reducere 10%", "cod_cupon": "JOLLY10"}
    m = lambda *ps: [{"magazin": "a.ro", "promotii": list(ps), "zile_ramase": 3}]  # noqa: E731
    c = [{"magazin": "a.ro", "start": "2026-11-06", "final": "2026-11-08"}]
    _, baza = pagini_schimbate(m(p1, p2), c, "2026-11-04", {})
    u = BASE_URL
    cazuri = [
        ("prima rulare anunta pagina", pagini_schimbate(m(p1, p2), c, "2026-11-04", {})[0],
         [f"{u}/cod-reducere/a.ro", f"{u}/black-friday/a.ro", f"{u}/black-friday"]),
        ("nimic schimbat = nimic trimis", pagini_schimbate(m(p1, p2), c, "2026-11-04", baza)[0], []),
        ("alta ordine = nimic trimis", pagini_schimbate(m(p2, p1), c, "2026-11-04", baza)[0], []),
        ("contorul de zile nu conteaza", pagini_schimbate(
            [{"magazin": "a.ro", "promotii": [dict(p1, zile_ramase=9), dict(p2, zile_ramase=1)]}], c, "2026-11-04", baza)[0], []),
        ("cod nou = pagina schimbata", pagini_schimbate(m(p1, p3), c, "2026-11-04", baza)[0],
         [f"{u}/cod-reducere/a.ro", f"{u}/black-friday/a.ro"]),
        ("campania porneste = calendarul se anunta", pagini_schimbate(m(p1, p2), c, "2026-11-06", baza)[0], [f"{u}/black-friday"]),
        ("magazin fara oferte nu se anunta", pagini_schimbate(m(), c, "2026-11-04", baza)[0], []),
        ("oferta care revine se anunta din nou", pagini_schimbate(m(p1, p2), c, "2026-11-04",
                                                                 pagini_schimbate(m(), c, "2026-11-04", baza)[1])[0],
         [f"{u}/cod-reducere/a.ro", f"{u}/black-friday/a.ro"]),
    ]
    esecuri = 0
    for nume, primit, asteptat in cazuri:
        ok = primit == asteptat
        esecuri += not ok
        print(f"  {'ok  ' if ok else 'PICA'}  {nume}" + ("" if ok else f"\n        primit: {primit}\n        asteptat: {asteptat}"))
    print(f"{esecuri} ESECURI" if esecuri else "TOATE TREC")
    return 1 if esecuri else 0


def main():
    seen = set(load_json(SEEN_PATH, []))

    candidate_urls = set()

    # 1. Pagini statice (trimise o singura data)
    for page in STATIC_PAGES:
        candidate_urls.add(f"{BASE_URL}{page}")

    # 2. Articole blog
    blog_posts = load_json(BLOG_PATH, [])
    for p in blog_posts:
        slug = p.get("slug")
        if slug:
            candidate_urls.add(f"{BASE_URL}/blog/{slug}")

    # 3. Pagini magazin cu promotii active
    magazine = load_json(OUTPUT_PATH, [])
    for m in magazine:
        slug = m.get("magazin", "")
        if not slug or " " in slug or len(slug.split("/")) > 2:
            continue
        if slug in ("profitshare.ro", "2performant.com"):
            continue
        candidate_urls.add(f"{BASE_URL}/cod-reducere/{slug}")

    # 4. Pagini comparatii
    comparisons = load_json(COMPARISONS_PATH, {})
    for slug in comparisons.keys():
        candidate_urls.add(f"{BASE_URL}/comparatii/{slug}")

    # 5. Paginile de Black Friday (04.11.2026): lipseau din lista, deci Bing nu le afla decat din sitemap.
    bf = load_json(BLACK_FRIDAY_PATH, {})
    dupa_slug = {m.get("magazin") for m in magazine}
    for c in bf.get("parteneri") or []:
        if c.get("magazin") in dupa_slug:
            candidate_urls.add(f"{BASE_URL}/black-friday/{c['magazin']}")
    for k in bf.get("categorii") or []:
        candidate_urls.add(f"{BASE_URL}/black-friday/categorie/{k['slug']}")

    # Ora Romaniei, ca in calendar: 2 ore sunt destule pentru granita de zi, indiferent de sezon.
    azi = (datetime.now(timezone.utc) + timedelta(hours=2)).strftime("%Y-%m-%d")
    schimbate, amprente = pagini_schimbate(magazine, bf.get("parteneri") or [], azi, load_json(AMPRENTE_PATH, {}))
    noi = candidate_urls - seen
    new_urls = sorted(noi | set(schimbate))

    if not new_urls:
        print("IndexNow: nimic nou de trimis.")
        scrie_amprente(amprente)
        return

    print(f"IndexNow: {len(noi)} URL-uri noi + {len(set(schimbate) - noi)} schimbate de trimis...")

    payload = {
        "host": "amcupon.ro",
        "key": INDEXNOW_KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": new_urls[:10000],
    }

    try:
        resp = requests.post(ENDPOINT, json=payload, timeout=30)
        print(f"IndexNow: status {resp.status_code}")
        if resp.status_code in (200, 202):
            seen |= candidate_urls
            os.makedirs(os.path.dirname(SEEN_PATH), exist_ok=True)
            with open(SEEN_PATH, "w", encoding="utf-8") as f:
                json.dump(sorted(seen), f, ensure_ascii=False, indent=2)
            scrie_amprente(amprente)
            print(f"IndexNow: confirmat, {len(new_urls)} URL-uri inregistrate.")
        else:
            print(f"IndexNow: raspuns neasteptat — {resp.text[:300]}")
    except Exception as e:
        print(f"IndexNow: eroare la trimitere — {e}")


if __name__ == "__main__":
    if "--test" in sys.argv:
        sys.exit(test())
    main()
