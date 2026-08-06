"""
Fetch tracking links pentru toate brandurile Impact.com via API oficial.
Endpoint corect: /Mediapartners/{AccountSid}/Campaigns

Necesita:
  IMPACT_ACCOUNT_SID=IRwCVg5HgvQ87401119VZWoLrE29We7og1
  IMPACT_AUTH_TOKEN=hTy.pMbA6CsNkd_HtezJmgpLqK9gDfDt  (din GitHub Secrets)

UPDATE 06.08.2026: procesa DOAR extra_merchants.json — 45+ magazine cu campanie
Impact activa (verificat live, acelasi gol structural gasit in reconcile_impact_links.py)
traiau doar in data/output.json si nu erau verificate NICIODATA contra API-ului live.
Acum proceseaza ambele fisiere. Scanam in output.json DOAR magazinele deja marcate
platforma=="impact" fara tracking real (nu toate cele 1178) — API-ul e live/rate-limited,
n-are sens sa interogam magazine 2Performant/Profitshare/direct.
"""

import json, os, re, time, requests
from requests.auth import HTTPBasicAuth

ACCOUNT_SID = os.environ.get("IMPACT_ACCOUNT_SID", "")
AUTH_TOKEN  = os.environ.get("IMPACT_AUTH_TOKEN", "")
BASE        = "https://api.impact.com"
HEADERS     = {"Accept": "application/json"}

DATA_DIR    = os.path.join(os.path.dirname(__file__), "..", "data")
EXTRA_PATH  = os.path.join(DATA_DIR, "extra_merchants.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "output.json")

REAL_TRACKING_RE = re.compile(r"pxf\.io|sjv\.io|impactradius|impact\.com|7401119|irclickid|prf\.hn|anrdoezrs\.net", re.I)

AUTH = None

def api_get(path, params=None):
    r = requests.get(f"{BASE}{path}", auth=AUTH, headers=HEADERS, params=params or {})
    r.raise_for_status()
    return r.json()

def get_all_campaigns():
    """Fetch toate campaniile (toate paginile)."""
    campaigns = []
    page = 1
    while True:
        data = api_get(f"/Mediapartners/{ACCOUNT_SID}/Campaigns", {"PageSize": 100, "Page": page})
        batch = data.get("Campaigns", [])
        if not batch:
            break
        campaigns.extend(batch)
        total = int(data.get("@total", 0))
        if len(campaigns) >= total:
            break
        page += 1
        time.sleep(0.3)
    return campaigns

def get_ads_for_campaign(campaign_id):
    """Fetch text link ads pentru o campanie."""
    try:
        data = api_get(f"/Mediapartners/{ACCOUNT_SID}/Ads", {
            "CampaignId": campaign_id,
            "PageSize": 10,
            "Type": "TEXT_LINK",
        })
        return data.get("Ads", [])
    except Exception:
        return []

def find_best_tracking_link(ads):
    """Returneaza primul TrackingLink valid din lista de ads."""
    for ad in ads:
        tl = ad.get("TrackingLink", "")
        if tl and tl.startswith("http"):
            return tl
    return ""

def build_campaign_index(campaigns):
    campaign_index = {}
    for c in campaigns:
        name  = c.get("CampaignName", "").lower().strip()
        adv   = c.get("AdvertiserName", "").lower().strip()
        url   = c.get("CampaignUrl", c.get("AdvertiserUrl", "")).lower()
        cid   = str(c.get("CampaignId", ""))
        domain = url.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        for key in [name, adv, domain]:
            if key:
                campaign_index[key] = {"id": cid, "name": name, "url": url}
    return campaign_index


def find_campaign(campaign_index, merchant_name, merchant_url):
    mn = merchant_name.lower()
    mu = merchant_url.lower().replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
    for key in [mn, mu]:
        if key in campaign_index:
            return campaign_index[key]
    for key, cdata in campaign_index.items():
        if mn in key or key in mn or mu in key or key in mu:
            return cdata
        for word in mn.split():
            if len(word) > 4 and word in key:
                return cdata
    return None


def upgrade_merchants(merchants, campaign_index, label):
    """Proceseaza o lista de magazine, upgradeaza url_afiliat in-place cand gaseste
    o campanie Impact activa care se potriveste. Returneaza (updated, not_found)."""
    updated = 0
    not_found = []
    for m in merchants:
        c = find_campaign(campaign_index, m["magazin"], m.get("url", ""))
        if not c:
            not_found.append(m["magazin"])
            continue

        ads = get_ads_for_campaign(c["id"])
        link = find_best_tracking_link(ads)

        if link:
            m["url_afiliat"] = link
            m["platforma"] = "impact"
            updated += 1
            print(f"  OK [{label}] [{c['id']}] {m['magazin']:25s} -> {link[:60]}")
        else:
            camp_url = c.get("url") or m.get("url", "")
            if camp_url:
                m["url_afiliat"] = camp_url
                m["platforma"] = "impact"
            print(f"  NOADS [{label}] [{c['id']}] {m['magazin']} (folosit campaign url)")

        time.sleep(0.1)
    return updated, not_found


def main():
    global AUTH
    if not ACCOUNT_SID or not AUTH_TOKEN:
        print("EROARE: IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN lipsesc.")
        print("  set IMPACT_ACCOUNT_SID=... && set IMPACT_AUTH_TOKEN=...")
        return

    AUTH = HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN)

    print("Fetch campanii Impact.com...")
    campaigns = get_all_campaigns()
    print(f"  {len(campaigns)} campanii active gasit")
    campaign_index = build_campaign_index(campaigns)

    total_updated = 0
    all_not_found = []

    if os.path.exists(EXTRA_PATH):
        with open(EXTRA_PATH, "r", encoding="utf-8") as f:
            extra_merchants = json.load(f)
        targets = [m for m in extra_merchants if m.get("platforma") == "impact"
                   and not REAL_TRACKING_RE.search(m.get("url_afiliat", "") or "")]
        if targets:
            u, nf = upgrade_merchants(targets, campaign_index, "extra")
            total_updated += u
            all_not_found += nf
            with open(EXTRA_PATH, "w", encoding="utf-8") as f:
                json.dump(extra_merchants, f, ensure_ascii=False, indent=2)

    if os.path.exists(OUTPUT_PATH):
        with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
            output_merchants = json.load(f)
        targets = [m for m in output_merchants if m.get("platforma") == "impact"
                   and not REAL_TRACKING_RE.search(m.get("url_afiliat", "") or "")]
        if targets:
            u, nf = upgrade_merchants(targets, campaign_index, "output")
            total_updated += u
            all_not_found += nf
            with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
                json.dump(output_merchants, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {total_updated} tracking links reale actualizate (live API).")
    if all_not_found:
        print(f"  Negasite in campanii ({len(all_not_found)}): {', '.join(all_not_found)}")

if __name__ == "__main__":
    main()
