"""
Fetch tracking links pentru toate brandurile Impact.com via API oficial.
Endpoint corect: /Mediapartners/{AccountSid}/Campaigns

Necesita:
  IMPACT_ACCOUNT_SID=IRwCVg5HgvQ87401119VZWoLrE29We7og1
  IMPACT_AUTH_TOKEN=hTy.pMbA6CsNkd_HtezJmgpLqK9gDfDt  (din GitHub Secrets)
"""

import json, os, time, requests
from requests.auth import HTTPBasicAuth

ACCOUNT_SID = os.environ.get("IMPACT_ACCOUNT_SID", "")
AUTH_TOKEN  = os.environ.get("IMPACT_AUTH_TOKEN", "")
BASE        = "https://api.impact.com"
HEADERS     = {"Accept": "application/json"}

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "extra_merchants.json")

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

def main():
    global AUTH
    if not ACCOUNT_SID or not AUTH_TOKEN:
        print("EROARE: IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN lipsesc.")
        print("  set IMPACT_ACCOUNT_SID=... && set IMPACT_AUTH_TOKEN=...")
        return

    AUTH = HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN)

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        merchants = json.load(f)

    print("Fetch campanii Impact.com...")
    campaigns = get_all_campaigns()
    print(f"  {len(campaigns)} campanii active gasit")

    # Mapa: keyword-uri lowercase -> campanie
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

    def find_campaign(merchant_name, merchant_url):
        mn = merchant_name.lower()
        mu = merchant_url.lower().replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0]
        # Match exact
        for key in [mn, mu]:
            if key in campaign_index:
                return campaign_index[key]
        # Match partial
        for key, cdata in campaign_index.items():
            if mn in key or key in mn or mu in key or key in mu:
                return cdata
            # Word match pentru nume compuse
            for word in mn.split():
                if len(word) > 4 and word in key:
                    return cdata
        return None

    updated = 0
    not_found = []

    for m in merchants:
        if m.get("platforma") != "impact":
            continue

        c = find_campaign(m["magazin"], m["url"])
        if not c:
            not_found.append(m["magazin"])
            continue

        # Fetch ads pentru tracking link
        ads = get_ads_for_campaign(c["id"])
        link = find_best_tracking_link(ads)

        if link:
            m["url_afiliat"] = link
            updated += 1
            print(f"  OK [{c['id']}] {m['magazin']:25s} -> {link[:60]}")
        else:
            # Daca nu are ads, foloseste campaign URL direct (tracking via campaign redirect)
            camp_url = c.get("url", m["url"])
            m["url_afiliat"] = camp_url if camp_url else m["url"]
            print(f"  NOADS [{c['id']}] {m['magazin']} (folosit campaign url)")

        time.sleep(0.1)

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(merchants, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {updated} tracking links reale actualizate.")
    if not_found:
        print(f"  Negasite in campanii ({len(not_found)}): {', '.join(not_found)}")

if __name__ == "__main__":
    main()
