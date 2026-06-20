"""
IndexNow — anunta Bing/Yandex instant cand apar pagini noi/actualizate,
in loc sa astepti crawl organic (poate dura saptamani pe un domeniu nou).

Nu necesita cont/login — autentificarea e cheia publica gazduita la
https://amcupon.ro/{key}.txt. Trimitem doar URL-urile NOI fata de
rularea anterioara (diff salvat in data/indexnow_seen.json), ca sa nu
spammam API-ul cu acelasi sitemap intreg de 6 ori/zi.

Surse de URL-uri noi:
  - articole de blog noi (blog-posts.json)
  - pagini de magazin care tocmai au capatat o promotie activa (output.json)
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


def load_json(path, default):
    if not os.path.exists(path):
        return default
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    seen = set(load_json(SEEN_PATH, []))

    candidate_urls = set()

    blog_posts = load_json(BLOG_PATH, [])
    for p in blog_posts:
        slug = p.get("slug")
        if slug:
            candidate_urls.add(f"{BASE_URL}/blog/{slug}")

    magazine = load_json(OUTPUT_PATH, [])
    for m in magazine:
        slug = m.get("magazin", "")
        if not slug or " " in slug or slug.split("/").__len__() > 2:
            continue
        if slug in ("profitshare.ro", "2performant.com"):
            continue
        if m.get("are_promotie"):
            candidate_urls.add(f"{BASE_URL}/cod-reducere/{slug}")

    new_urls = sorted(candidate_urls - seen)

    if not new_urls:
        print("IndexNow: nimic nou de trimis.")
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
            print("IndexNow: confirmat, stare salvata.")
        else:
            print(f"IndexNow: raspuns neasteptat — {resp.text[:300]}")
    except Exception as e:
        print(f"IndexNow: eroare la trimitere — {e}")


if __name__ == "__main__":
    main()
