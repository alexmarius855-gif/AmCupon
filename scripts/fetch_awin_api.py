"""
fetch_awin_api.py — Descarca programele Awin la care esti alaturat prin API-ul oficial
si construieste linkuri de tracking reale (cread.php), fara export CSV manual.

Necesita (GitHub Secrets, la fel ca IMPACT_ACCOUNT_SID/IMPACT_AUTH_TOKEN):
  AWIN_API_TOKEN     — token Bearer generat din dashboard Awin: Tools -> API -> Create new token
  AWIN_PUBLISHER_ID  — ID-ul tau de publisher Awin (implicit 101829567, deja documentat in
                       CLAUDE.md ca account-ul Awin activ — schimba doar daca e alt cont)

Endpoint: GET https://api.awin.com/publishers/{publisherId}/programmes
Link de tracking (Awin nu returneaza intotdeauna un link gata facut per programme, se
construieste manual din ID-ul advertiser-ului + ID-ul tau de publisher):
  https://www.awin1.com/cread.php?awinmid={advertiserId}&awinaffid={publisherId}&clickref=&p={destinatie}

IMPORTANT — necunoscuta reala: nu am putut verifica live raspunsul exact al API-ului
(necesita tokenul tau, generat manual din dashboard, imposibil de obtinut fara tine).
Scriptul incearca mai multe denumiri plauzibile de campuri (id/advertiserId/mid,
url/website/advertiserUrl, status/relationshipStatus) si AFISEAZA json-ul brut al primului
program la fiecare rulare — daca extrage 0 programe valide, uita-te la acel print si spune-mi
exact cum se numesc campurile reale, ajustam doar acolo (nu tot scriptul).

Ruleaza (dupa ce ai adaugat AWIN_API_TOKEN in GitHub Secrets):
  python fetch_awin_api.py
"""

import json
import os
import re
from urllib.parse import quote, urlparse

import requests

AWIN_API_TOKEN    = os.environ.get("AWIN_API_TOKEN", "")
AWIN_PUBLISHER_ID = os.environ.get("AWIN_PUBLISHER_ID", "101829567")
BASE = "https://api.awin.com"

DATA_DIR    = os.path.join(os.path.dirname(__file__), "..", "data")
EXTRA_PATH  = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "output.json")

REAL_TRACKING_RE = re.compile(
    r"pxf\.io|sjv\.io|impactradius|impact\.com|7401119|irclickid|prf\.hn|anrdoezrs\.net|"
    r"2performant\.com|profitshare\.ro|awin1\.com|cread\.php",
    re.I,
)

# Aceeasi lista ca in reconcile_impact_links.py — TLD compuse unde eTLD+1 real e ultimele
# 3 segmente, nu 2 (altfel "co"/"com" false-matcheaza domenii total diferite).
MULTI_TLD = {
    "co.uk", "com.au", "com.sg", "co.nz", "com.br", "co.za",
    "com.tr", "co.il", "com.mx", "co.in", "com.ar", "co.kr", "com.tw", "com.co",
}


def domain_of(url: str) -> str:
    if not url:
        return ""
    u = url if url.startswith("http") else "https://" + url
    try:
        return re.sub(r"^www\.", "", urlparse(u).netloc.lower())
    except Exception:
        return ""


def etld1(domain: str) -> str:
    if not domain:
        return ""
    parts = domain.split(".")
    if len(parts) <= 2:
        return domain
    last_two = ".".join(parts[-2:])
    if last_two in MULTI_TLD and len(parts) >= 3:
        return ".".join(parts[-3:])
    return last_two


def _first(d: dict, *keys):
    for k in keys:
        v = d.get(k)
        if v:
            return v
    return None


def get_programmes() -> list:
    headers = {"Authorization": f"Bearer {AWIN_API_TOKEN}", "Accept": "application/json"}
    r = requests.get(
        f"{BASE}/publishers/{AWIN_PUBLISHER_ID}/programmes",
        headers=headers,
        params={"relationship": "joined"},
        timeout=30,
    )
    r.raise_for_status()
    data = r.json()
    if isinstance(data, dict):
        return data.get("data") or data.get("programmes") or data.get("results") or []
    return data or []


def build_index(programmes: list) -> dict:
    """domeniu eTLD+1 -> {id, name} pt programe active/alaturate."""
    index = {}
    skipped_no_status = 0
    for p in programmes:
        status = str(_first(p, "status", "relationshipStatus", "programmeStatus") or "").lower()
        if status and status not in ("joined", "active", "approved", "confirmed"):
            continue
        if not status:
            skipped_no_status += 1

        adv_url = _first(p, "url", "website", "advertiserUrl", "primaryRegion")
        if isinstance(adv_url, dict):
            adv_url = _first(adv_url, "url", "website")
        adv_id = _first(p, "id", "advertiserId", "mid", "programmeId")
        name = _first(p, "name", "advertiserName", "programmeName") or ""

        d = domain_of(adv_url or "")
        if d and adv_id:
            index[etld1(d)] = {"id": str(adv_id), "name": name}

    if skipped_no_status:
        print(f"  ATENTIE: {skipped_no_status} programe fara camp de status recunoscut — "
              f"verifica raw JSON de mai sus, poate lipseste filtrarea pe 'joined'.")
    return index


def build_tracking_link(advertiser_id: str, destination_url: str) -> str:
    dest = destination_url or ""
    return (
        f"https://www.awin1.com/cread.php?awinmid={advertiser_id}"
        f"&awinaffid={AWIN_PUBLISHER_ID}&clickref=&p={quote(dest, safe='')}"
    )


def upgrade_merchants(merchants: list, index: dict, label: str) -> int:
    updated = 0
    for m in merchants:
        domain = m.get("magazin") or domain_of(m.get("url", ""))
        hit = index.get(etld1(domain))
        if not hit:
            continue
        link = build_tracking_link(hit["id"], m.get("url") or f"https://{domain}")
        m["url_afiliat"] = link
        m["platforma"] = "awin"
        updated += 1
        print(f"  OK [{label}] [{hit['id']}] {m['magazin']:25s} -> {link[:70]}")
    return updated


def main():
    if not AWIN_API_TOKEN:
        print("EROARE: AWIN_API_TOKEN nu e setat.")
        print("  1. Dashboard Awin -> Tools -> API -> Create new token")
        print("  2. Adauga-l ca GitHub Secret: AWIN_API_TOKEN")
        print("  3. (optional) AWIN_PUBLISHER_ID doar daca nu e 101829567")
        return

    print("Fetch programe Awin...")
    try:
        programmes = get_programmes()
    except requests.HTTPError as e:
        print(f"EROARE HTTP: {e}")
        print(f"  Raspuns: {e.response.text[:300] if e.response is not None else '(fara raspuns)'}")
        return

    print(f"  {len(programmes)} programe primite de la API")
    if programmes:
        print("  Raw primul program (verifica denumirile campurilor daca indexul e gol):")
        print(" ", json.dumps(programmes[0], ensure_ascii=False)[:500])

    index = build_index(programmes)
    print(f"  {len(index)} programe active indexate pe domeniu")
    if not index:
        print("  Niciun program indexat — verifica raw JSON de mai sus, campurile nu se")
        print("  potrivesc cu ce presupune scriptul. Trimite-mi acel print si ajustez.")
        return

    total_updated = 0

    if os.path.exists(EXTRA_PATH):
        with open(EXTRA_PATH, "r", encoding="utf-8") as f:
            extra_merchants = json.load(f)
        targets = [m for m in extra_merchants if not REAL_TRACKING_RE.search(m.get("url_afiliat", "") or "")]
        u = upgrade_merchants(targets, index, "extra")
        total_updated += u
        if u:
            with open(EXTRA_PATH, "w", encoding="utf-8") as f:
                json.dump(extra_merchants, f, ensure_ascii=False, indent=2)

    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            output_merchants = json.load(f)
        targets = [m for m in output_merchants if not REAL_TRACKING_RE.search(m.get("url_afiliat", "") or "")]
        u = upgrade_merchants(targets, index, "output")
        total_updated += u
        if u:
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump(output_merchants, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {total_updated} tracking links Awin reale atribuite.")
    print("Urmator pas: python merge_platforms.py")


if __name__ == "__main__":
    main()
