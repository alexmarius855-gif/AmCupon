"""
Fetch tracking links pentru toate brandurile Impact.com via API oficial.
Endpoint corect: /Mediapartners/{AccountSid}/Campaigns

Necesita (ambele din GitHub Secrets, NU se scriu niciodata aici):
  IMPACT_ACCOUNT_SID
  IMPACT_AUTH_TOKEN

07.09.2026: aici erau VALORILE REALE ale ambelor, in clar, intr-un repo PUBLIC,
comise din 06.08. Sterse. Stergerea NU e suficienta — raman in istoricul git si
au fost expuse public ~o luna, deci tokenul TREBUIE regenerat din contul Impact.
Regula: un comentariu care 'documenteaza' o variabila de mediu ii scrie NUMELE,
niciodata valoarea. Daca ai nevoie de valoare ca sa testezi local, pune-o in .env
(care e in .gitignore), nu in docstring.

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
DEEPLINK_PATH = os.path.join(DATA_DIR, "impact_deeplink.json")

# `/c/<cont>/<ad>/<campanie>` prinde si linkurile Impact pe domeniu propriu (discount.beachsim.com).
REAL_TRACKING_RE = re.compile(r"pxf\.io|sjv\.io|impactradius|impact\.com|7401119|irclickid|prf\.hn|anrdoezrs\.net|/c/\d+/\d+/\d+", re.I)

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

# 13.09.2026 — trei bug-uri in functiile de mai jos, care tineau 52 de magazine cu
# contract ACTIV fara comision. Masurat pe API-ul contului, nu presupus:
#   1. Linkul se cauta DOAR in /Ads?Type=TEXT_LINK. Multe campanii n-au reclame text,
#      desi obiectul Campaign are campul `TrackingLink` completat — acela e linkul oficial.
#   2. Cand /Ads era gol, `url_afiliat` primea URL-ul CAMPANIEI, adica site-ul normal al
#      brandului. Clicul pleca fara tracking, dar magazinul arata „rezolvat" si nu mai
#      intra in niciun raport. Un link fara comision care pare bun e mai rau decat lipsa.
#   3. Potrivirea pe SUBSIR intre nume („mn in key or key in mn") — tiparul #1 din
#      docs/LECTII-TEHNICE.md. Putea lipi linkul altui magazin. Acum: domeniu exact, apoi eTLD+1.
# Plus: /Campaigns intoarce si contracte EXPIRATE (31 din 566); acelea nu platesc.
from reconcile_impact_links import domain_from_url, etld1  # noqa: E402


def build_campaign_index(campaigns):
    """domeniu -> campanie, doar pentru contracte ACTIVE."""
    campaign_index = {}
    for c in campaigns:
        if c.get("ContractStatus") != "Active":
            continue
        for camp_url in (c.get("CampaignUrl"), c.get("AdvertiserUrl")):
            domain = domain_from_url(camp_url or "")
            if domain:
                campaign_index.setdefault(domain, c)
    return campaign_index


def find_campaign(campaign_index, merchant_url):
    domain = domain_from_url(merchant_url)
    if not domain:
        return None
    if domain in campaign_index:
        return campaign_index[domain]
    baza = etld1(domain)
    for key, c in campaign_index.items():
        if etld1(key) == baza:
            return c
    return None


def upgrade_merchants(merchants, campaign_index, label):
    """Proceseaza o lista de magazine, upgradeaza url_afiliat in-place cand gaseste
    o campanie Impact ACTIVA pe acelasi domeniu. Returneaza (updated, not_found).
    Fara link real, magazinul ramane neatins — nu primeste niciodata un link simplu."""
    updated = 0
    not_found = []
    for m in merchants:
        c = find_campaign(campaign_index, m.get("url", "") or m["magazin"])
        if not c:
            not_found.append(m["magazin"])
            continue

        link = (c.get("TrackingLink") or "").strip()
        if not REAL_TRACKING_RE.search(link):
            link = find_best_tracking_link(get_ads_for_campaign(c["CampaignId"]))
            time.sleep(0.1)

        if link:
            m["url_afiliat"] = link
            m["platforma"] = "impact"
            updated += 1
            print(f"  OK [{label}] [{c['CampaignId']}] {m['magazin']:25s} -> {link[:60]}")
        else:
            not_found.append(m["magazin"])
            print(f"  FARA LINK [{label}] [{c['CampaignId']}] {m['magazin']} (neatins)")
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
    campaign_index = build_campaign_index(campaigns)
    print(f"  {len(campaigns)} campanii in cont, {len(campaign_index)} domenii cu contract activ")

    # Permisiunea de deep-link, per campanie, pentru scripts/link_oferta.py. Nu se ghiceste
    # din domeniul magazinului: AdGuard VPN (adguard-vpn.com) accepta deep-link DOAR pe
    # adguard.com — ghicit, linkul ofertei dadea 404. Fisierul se regenereaza la fiecare
    # rulare, inainte de merge; lipsa lui = fara deep-link (link afiliat simplu).
    deeplink = {str(c["CampaignId"]): {"permis": str(c.get("AllowsDeeplinking")).lower() == "true",  # vine ca TEXT: bool("false") e True
                                       "domenii": c.get("DeeplinkDomains") or []}
                for c in campaigns if c.get("ContractStatus") == "Active"}
    with open(DEEPLINK_PATH, "w", encoding="utf-8") as f:
        json.dump(deeplink, f, ensure_ascii=False, indent=1)
    print(f"  permisiuni deep-link scrise: {sum(v['permis'] for v in deeplink.values())} din {len(deeplink)}")

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
