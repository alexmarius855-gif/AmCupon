"""
IndexNow — anunta motoarele de cautare instant cand apar pagini noi.
Trimite la api.indexnow.org (distribuit automat la Google, Bing, Yandex)
+ ping sitemap direct la Google.

Trimitem URL-uri NOI fata de rularea anterioara (diff vs data/indexnow_seen.json).
La prima rulare dupa reset: trimite TOATE paginile statice + cele cu promotii.
"""

import json
import os
import requests

INDEXNOW_KEY = "25cbf8f168546247ae70c702384fe152"
BASE_URL = "https://amcupon.ro"
KEY_LOCATION = f"{BASE_URL}/{INDEXNOW_KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"

script_dir = os.path.dirname(os.path.abspath(__file__))
repo_root = os.path.dirname(script_dir)
SEEN_PATH = os.path.join(repo_root, "data", "indexnow_seen.json")
BLOG_PATH = os.path.join(repo_root, "frontend", "public", "blog-posts.json")
OUTPUT_PATH = os.path.join(repo_root, "frontend", "public", "output.json")
COMPARISONS_PATH = os.path.join(repo_root, "frontend", "public", "comparisons.json")

# Toate paginile statice importante — trimise o singura data (raman in seen dupa)
STATIC_PAGES = [
    "/", "/radar", "/oferte-azi", "/toate-magazinele", "/categorii", "/blog",
    "/produse", "/top", "/servicii", "/comparatii",
    # Nise principale
    "/fashion", "/frumusete", "/electronice", "/gadgets", "/sport", "/copii",
    "/animale", "/casa", "/calatorie", "/carti", "/parfumuri", "/sanatate",
    "/farmacie", "/supermarket", "/jocuri", "/idei-cadouri", "/bijuterii",
    "/gaming", "/laptop", "/telefoane", "/antivirus", "/smart-home",
    "/instrumente-seo", "/trading", "/carduri-bancare", "/vpn", "/hosting",
    "/ai-tools", "/cursuri-online", "/software-business", "/flori", "/pescuit",
    "/piese-auto", "/echipament-moto", "/rochii-mireasa", "/albire-dinti",
    "/black-friday", "/craciun", "/moto",
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
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def ping_google_sitemap():
    sitemap_url = f"{BASE_URL}/sitemap.xml"
    try:
        resp = requests.get(
            f"https://www.google.com/ping?sitemap={sitemap_url}",
            timeout=15
        )
        print(f"Google sitemap ping: {resp.status_code}")
    except Exception as e:
        print(f"Google sitemap ping eroare: {e}")


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

    new_urls = sorted(candidate_urls - seen)

    if not new_urls:
        print("IndexNow: nimic nou de trimis.")
        ping_google_sitemap()
        return

    print(f"IndexNow: {len(new_urls)} URL-uri noi de trimis...")

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
            print(f"IndexNow: confirmat, {len(new_urls)} URL-uri inregistrate.")
        else:
            print(f"IndexNow: raspuns neasteptat — {resp.text[:300]}")
    except Exception as e:
        print(f"IndexNow: eroare la trimitere — {e}")

    ping_google_sitemap()


if __name__ == "__main__":
    main()
