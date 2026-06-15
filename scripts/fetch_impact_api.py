"""
Fetch tracking links pentru toate brandurile Impact.com via API oficial.
Publisher ID: 7761435 | Account ID: 7401119

Necesita in .env sau GitHub Secrets:
  IMPACT_ACCOUNT_SID=...   (din Impact.com Settings > API)
  IMPACT_AUTH_TOKEN=...    (din Impact.com Settings > API)

Dupa rulare updateaza url_afiliat in extra_merchants.json cu link-uri reale.
"""

import json, os, requests
from requests.auth import HTTPBasicAuth
from urllib.parse import quote

ACCOUNT_SID = os.environ.get("IMPACT_ACCOUNT_SID", "")
AUTH_TOKEN = os.environ.get("IMPACT_AUTH_TOKEN", "")
PUBLISHER_ID = "7761435"
BASE_URL = f"https://api.impact.com/Advertisers/{ACCOUNT_SID}"

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "extra_merchants.json")

def get_campaigns():
    """Returneaza toate campaniile active (branduri joined)."""
    url = f"https://api.impact.com/Publishers/{PUBLISHER_ID}/Programs"
    params = {"PageSize": 200, "Status": "Active"}
    r = requests.get(url, params=params, auth=HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN))
    r.raise_for_status()
    return r.json().get("Programs", {}).get("Program", [])

def get_tracking_link(campaign_id, destination_url):
    """Genereaza tracking link pentru o campanie si URL destinatie."""
    url = f"https://api.impact.com/Publishers/{PUBLISHER_ID}/TrackingLinks"
    payload = {
        "CampaignId": campaign_id,
        "DestinationURL": destination_url,
    }
    r = requests.post(url, json=payload, auth=HTTPBasicAuth(ACCOUNT_SID, AUTH_TOKEN))
    if r.status_code == 200:
        return r.json().get("TrackingURL", "")
    return ""

def main():
    if not ACCOUNT_SID or not AUTH_TOKEN:
        print("EROARE: IMPACT_ACCOUNT_SID si IMPACT_AUTH_TOKEN lipsesc din env vars.")
        print("Seteaza-le in GitHub Secrets sau local cu: set IMPACT_ACCOUNT_SID=...")
        return

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        merchants = json.load(f)

    print("Fetch campanii active Impact.com...")
    campaigns = get_campaigns()
    campaign_map = {}
    for c in campaigns:
        name = c.get("CampaignName", "").lower()
        cid = c.get("CampaignId", "")
        campaign_map[name] = cid
    print(f"  {len(campaign_map)} campanii active gasit")

    updated = 0
    for m in merchants:
        if m.get("platforma") != "impact":
            continue

        name = m["magazin"].lower()
        cid = None

        for cname, cid_val in campaign_map.items():
            if name in cname or cname in name:
                cid = cid_val
                break

        if not cid:
            print(f"  Nu gasit campanie pentru: {m['magazin']}")
            continue

        link = get_tracking_link(cid, m["url"])
        if link:
            m["url_afiliat"] = link
            updated += 1
            print(f"  OK: {m['magazin']} -> {link[:60]}...")
        else:
            print(f"  FAIL: {m['magazin']} (campanie {cid})")

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(merchants, f, ensure_ascii=False, indent=2)

    print(f"\nGata! {updated} tracking links actualizate in extra_merchants.json")

if __name__ == "__main__":
    main()
