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
    """domeniu -> campanie, doar pentru contracte ACTIVE, DOAR dupa `CampaignUrl`.

    NU dupa `AdvertiserUrl`: e site-ul FIRMEI, nu al brandului. Campania „Holiday.com" are
    AdvertiserUrl expressvpn.com (acelasi proprietar) — asa a primit ExpressVPN linkul care duce
    pe holiday.com. Toate cele 535 de campanii active au CampaignUrl (masurat 14.09.2026)."""
    campaign_index = {}
    for c in campaigns:
        if c.get("ContractStatus") != "Active":
            continue
        domain = domain_from_url(c.get("CampaignUrl") or "")
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


# 14.09.2026 — linkuri „cu tracking" care duc pe site-ul ALTUI brand. Scriptul de mai sus
# repara doar magazinele FARA tracking, deci un link bun ca forma nu era verificat niciodata.
# Masurat live: 17 magazine — ExpressVPN -> holiday.com, WinZip si Corel -> wordperfect.com,
# Zolucky -> hardaddy.com, trei magazine de extensii -> vivienhair.com. Vin din importuri vechi
# care potriveau pe advertiser (grupuri cu mai multe branduri), nu pe brand.
# Regula: campania linkului trebuie sa fie a brandului magazinului. Altfel, in ordine:
#   1. campania ACTIVA proprie a magazinului (majoritatea au una: Nadula, Moresoo, WinZip...);
#   2. nimic — `url_afiliat = url`, deci neplatit si vizibil, nu vizitator trimis la altcineva.
# Linkurile catre campanii necunoscute contului nu se ating: nu le putem verifica.
# Deep-link pe campania GRUPULUI (DeeplinkDomains permite domeniul magazinului) a fost incercat
# si SCOS: funwhole.com, permis oficial, ajungea tot pe lumibricks.com (testat live 14.09).


from link_oferta import domeniu_permis  # noqa: E402


def _brand(url):
    return etld1(domain_from_url(url or "")).split(".")[0]


def campania_magazinului(c, url):
    """Campania apartine brandului magazinului — trei semnale EXACTE, niciun subsir:
    domeniul CampaignUrl; numele campaniei („Clean Email" = cleanemail.com, al carui
    CampaignUrl e clean.email); sau domeniul magazinului in DeeplinkDomains.
    Ultimele doua au salvat 2 din 3 linkuri corecte pe care regula doar-pe-domeniu le-ar fi
    sters (masurat live 14.09.2026, pe 45 de linkuri active semnalate)."""
    brand = _brand(url)
    if brand == _brand(c.get("CampaignUrl")):
        return True
    if brand == re.sub(r"[^a-z0-9]", "", (c.get("CampaignName") or "").lower()):
        return True
    return domeniu_permis(url, c.get("DeeplinkDomains"))


def verifica_brandul(merchants, campaigns_by_id, campaign_index, label):
    reparate, curatate = 0, 0
    for m in merchants:
        link = m.get("url_afiliat") or ""
        url = m.get("url") or ""
        potrivire = re.search(r"/c/\d+/\d+/(\d+)", link)
        if not potrivire or not url:
            continue
        c = campaigns_by_id.get(potrivire.group(1))
        if c is None:
            continue
        activa = c.get("ContractStatus") == "Active"
        if activa and campania_magazinului(c, url):
            continue
        proprie = find_campaign(campaign_index, url)
        if proprie and REAL_TRACKING_RE.search(proprie.get("TrackingLink") or ""):
            nou = proprie["TrackingLink"]
        else:
            nou = url
        if nou == link:
            continue  # deja corect (ex. deep-link pe campania grupului) — nu se renumara
        if nou == url:
            curatate += 1
        else:
            reparate += 1
        print(f"  BRAND [{label}] {m['magazin']:24s} {c['CampaignName'][:24]:24s} -> {nou[:60]}")
        m["url_afiliat"] = nou
    return reparate, curatate


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
    brand_reparate, brand_curatate = 0, 0
    campaigns_by_id = {str(c.get("CampaignId")): c for c in campaigns}

    for cale, label in ((EXTRA_PATH, "extra"), (OUTPUT_PATH, "output")):
        if not os.path.exists(cale):
            continue
        with open(cale, "r", encoding="utf-8") as f:
            merchants = json.load(f)
        impact = [m for m in merchants if m.get("platforma") == "impact"]
        r, c = verifica_brandul(impact, campaigns_by_id, campaign_index, label)
        brand_reparate += r
        brand_curatate += c
        targets = [m for m in impact if not REAL_TRACKING_RE.search(m.get("url_afiliat", "") or "")]
        if targets:
            u, nf = upgrade_merchants(targets, campaign_index, label)
            total_updated += u
            all_not_found += nf
        with open(cale, "w", encoding="utf-8") as f:
            json.dump(merchants, f, ensure_ascii=False, indent=2)

    print(f"\nBrand gresit: {brand_reparate} reparate (campania proprie a brandului), "
          f"{brand_curatate} fara campanie potrivita -> neplatite")

    print(f"\nGata! {total_updated} tracking links reale actualizate (live API).")
    if all_not_found:
        print(f"  Negasite in campanii ({len(all_not_found)}): {', '.join(all_not_found)}")

if __name__ == "__main__":
    main()
