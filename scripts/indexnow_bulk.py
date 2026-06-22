"""
Bootstrap IndexNow — trimite TOATE URL-urile din sitemap catre Bing/Yandex o data.

Scriptul din pipeline (submit_indexnow.py) trimite doar paginile NOI la fiecare
rulare. Acesta e pentru bootstrap: la pornirea pe un domeniu nou, anunta tot
site-ul (sute de pagini) dintr-o data, ca Bing/Yandex sa le indexeze rapid in
loc sa astepte crawl organic. Re-rulabil oricand manual.

Necesita ca fisierul-cheie public sa fie deja live pe domeniu (HTTP 200).
"""

import re
import sys
import requests

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

INDEXNOW_KEY = "25cbf8f168546247ae70c702384fe152"
BASE_URL = "https://amcupon.ro"
SITEMAP = f"{BASE_URL}/sitemap.xml"
ENDPOINT = "https://api.indexnow.org/indexnow"


def main():
    print(f"Descarc sitemap: {SITEMAP}")
    r = requests.get(SITEMAP, timeout=30)
    r.raise_for_status()
    urls = re.findall(r"<loc>(.*?)</loc>", r.text)
    urls = [u.strip() for u in urls if u.strip().startswith("http")]
    print(f"Gasit {len(urls)} URL-uri in sitemap.")

    if not urls:
        print("Niciun URL — opresc.")
        return

    # IndexNow accepta max 10.000 URL-uri per request
    payload = {
        "host": "amcupon.ro",
        "key": INDEXNOW_KEY,
        "keyLocation": f"{BASE_URL}/{INDEXNOW_KEY}.txt",
        "urlList": urls[:10000],
    }
    resp = requests.post(ENDPOINT, json=payload, timeout=60)
    print(f"IndexNow status: {resp.status_code}")
    if resp.status_code in (200, 202):
        print(f"OK - trimise {len(payload['urlList'])} URL-uri catre Bing/Yandex.")
    else:
        print(f"Raspuns: {resp.text[:400]}")


if __name__ == "__main__":
    main()
