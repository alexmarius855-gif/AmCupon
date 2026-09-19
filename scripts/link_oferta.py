"""
Clicul pe o OFERTA trece prin tracking, nu direct pe site-ul magazinului.

SURSA UNICA, folosita de `merge_platforms.py` si de `import_csv_promotii.py` (care
ruleaza DUPA merge si scrie promotii noi cu pagina de oferta bruta — de-aia nu ajungea
o singura trecere in merge).

Masurat 13.09.2026: din 309 promotii active, 210 aveau `landing_page` = pagina simpla a
magazinului (166 Impact, 44 2Performant). Toti consumatorii — site, newsletter, Telegram,
Facebook, alerte — fac `landing_page or url_afiliat`, deci exact clicul cu cea mai mare
intentie („vezi oferta") pleca fara comision. Reparat la sursa datelor, ca niciun
consumator sa nu mai trebuiasca atins.

Formatele, testate LIVE inainte de scriere, nu presupuse:
  · 2Performant — quicklink-ul are deja `redirect_to=`; il inlocuim cu pagina ofertei.
    In browser: nobilacasa.ro -> pagina ofertei, cu utm_source=2performant.
  · Impact — linkul de tracking + `u=<pagina>`. eufy.com, wegic.ai -> pagina ofertei.
    Pe un domeniu nepermis de campanie, Impact da 404. Capcana: adguard-vpn.com are pagina
    ofertei pe PROPRIUL domeniu, dar campania „AdGuard VPN" accepta deep-link doar pe
    adguard.com. Deci pentru Impact nu ghicim din domeniul magazinului: citim permisiunea
    oficiala (`AllowsDeeplinking` + `DeeplinkDomains`) scrisa de fetch_impact_api.py in
    data/impact_deeplink.json. Campanie necunoscuta, nepermisa sau cu lista goala = link simplu.
Garda de domeniu ramane pentru toate: deep-link doar pe domeniul magazinului; altfel oferta
primeste linkul afiliat simplu — ajunge pe prima pagina, dar clicul e platit.
Awin are si el deep-link (`ued=`), dar NETESTAT — primeste linkul simplu pana se verifica.

Si inversul: un `url_afiliat` FARA semnatura de tracking, pe domeniul magazinului
(„https://www.hostinger.ro/" langa url „https://hostinger.ro"), trecea drept afiliat,
fiindca site-ul compara doar egalitatea exacta cu `url`. 48 de magazine. Il aducem la
`url`, ca regula din `frontend/lib/linkMagazin.ts` sa-l vada drept ce e: neplatit.
"""

import json
import os
import re
from fnmatch import fnmatch
from urllib.parse import quote

from reconcile_impact_links import domain_from_url, etld1

DEEPLINK_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "impact_deeplink.json")
_deeplink_impact = None

TRACKING_RE = re.compile(
    r"pxf\.io|sjv\.io|impactradius|impact\.com|7401119|irclickid|prf\.hn|anrdoezrs\.net|"
    r"2performant\.com|awin1\.com|cread\.php|"
    r"/c/\d+/\d+/\d+",  # Impact pe domeniul propriu al brandului (discount.beachsim.com)
    re.I,
)
_IMPACT_LINK = re.compile(r"/c/\d+/\d+/\d+")


def are_tracking(url: str) -> bool:
    return bool(TRACKING_RE.search(url or ""))


def acelasi_domeniu(a: str, b: str) -> bool:
    da, db = etld1(domain_from_url(a)), etld1(domain_from_url(b))
    return bool(da) and da == db


def _contracte_impact() -> dict:
    """Campaniile Impact cu contract ACTIV (id -> permisiune deep-link). {} daca lipseste."""
    global _deeplink_impact
    if _deeplink_impact is None:
        try:
            with open(DEEPLINK_PATH, encoding="utf-8") as f:
                _deeplink_impact = json.load(f)
        except (OSError, ValueError):
            _deeplink_impact = {}
    return _deeplink_impact


def _campanie(url_afiliat: str) -> str:
    return _IMPACT_LINK.search(url_afiliat).group(0).rsplit("/", 1)[-1]


def domeniu_permis(url: str, domenii: list) -> bool:
    """`url` cade pe unul din tiparele DeeplinkDomains ale unei campanii Impact.
    „eufy.*" trebuie sa prinda si www.eufy.com: Impact accepta subdomeniile (testat live)."""
    gazda = domain_from_url(url)
    return bool(gazda) and any(
        fnmatch(gazda, d) or fnmatch(gazda, "*." + d.lstrip("*.")) or gazda == d.lstrip("*.")
        for d in domenii or [])


def _brand(url: str) -> str:
    return etld1(domain_from_url(url or "")).split(".")[0]


def campania_magazinului(camp: dict, url_magazin: str) -> bool:
    """Campania Impact apartine brandului magazinului — trei semnale EXACTE, niciun subsir:
    domeniul `CampaignUrl`; numele campaniei („Clean Email" = cleanemail.com); sau domeniul
    magazinului in `DeeplinkDomains`. NICIODATA `AdvertiserUrl`: e site-ul firmei, iar campania
    „Holiday.com" are AdvertiserUrl expressvpn.com — asa a primit ExpressVPN link spre holiday.com.
    Accepta atat obiectul din API, cat si intrarea din data/impact_deeplink.json."""
    brand = _brand(url_magazin)
    if not brand:
        return False
    if brand == _brand(camp.get("CampaignUrl")):
        return True
    if brand == re.sub(r"[^a-z0-9]", "", (camp.get("CampaignName") or "").lower()):
        return True
    return domeniu_permis(url_magazin, camp.get("DeeplinkDomains") or camp.get("domenii"))


def link_potrivit(url_afiliat: str, url_magazin: str) -> bool:
    """False cand stim sigur ca linkul Impact NU plateste pentru magazinul asta: campania nu mai
    are contract activ, sau e a altui brand. Fara harta contractelor nu putem sti — True.
    reconcile_impact_links.py punea la loc, la fiecare rulare, 8 contracte EXPIRATE din CSV-ul vechi."""
    if not _IMPACT_LINK.search(url_afiliat or ""):
        return True
    contracte = _contracte_impact()
    if not contracte:
        return True
    regula = contracte.get(_campanie(url_afiliat))
    if regula is None:
        return False
    if not regula.get("CampaignUrl"):
        return True  # harta veche, fara date de brand
    return campania_magazinului(regula, url_magazin)


def livreaza_in_romania(url_afiliat: str):
    """(True/False/None, regiuni, numele programului) pentru un link Impact. False DOAR cand
    programul are o lista de tari si Romania nu e in ea („Eufy NL" = [NETHERLANDS]). None = nu
    stim: link non-Impact, harta contractelor lipsa, sau programul nu declara tarile. Harta se
    scrie de fetch_impact_api.py la fiecare rulare, inainte de merge."""
    if not _IMPACT_LINK.search(url_afiliat or ""):
        return None, [], ""
    regula = _contracte_impact().get(_campanie(url_afiliat)) or {}
    regiuni = regula.get("regiuni") or []
    if not regiuni:
        return None, [], regula.get("CampaignName", "")
    return "ROMANIA" in regiuni, regiuni, regula.get("CampaignName", "")


def cu_deeplink_impact(tracking: str, destinatie: str) -> str:
    baza = re.sub(r"([?&])u=[^&]*&?", r"\1", tracking).rstrip("?&")
    return baza + ("&" if "?" in baza else "?") + "u=" + quote(destinatie, safe="")


def _impact_permite(url_afiliat: str, landing: str) -> bool:
    regula = _contracte_impact().get(_campanie(url_afiliat))
    if not regula or not regula.get("permis") or not regula.get("domenii"):
        return False
    return domeniu_permis(landing, regula["domenii"])


def link_oferta(url_afiliat: str, landing: str) -> str:
    """Linkul platit catre pagina ofertei. Presupune `url_afiliat` cu tracking si
    `landing` pe domeniul magazinului. Cand deep-link-ul nu e sigur, intoarce
    `url_afiliat` neschimbat."""
    if "event.2performant.com" in url_afiliat and "redirect_to=" in url_afiliat:
        return re.sub(r"redirect_to=[^&]*",
                      lambda _: "redirect_to=" + quote(landing, safe=""), url_afiliat)
    if _IMPACT_LINK.search(url_afiliat) and _impact_permite(url_afiliat, landing):
        return cu_deeplink_impact(url_afiliat, landing)
    return url_afiliat


def link_iesire(m: dict, promo: dict = None, site_url: str = "https://amcupon.ro") -> str:
    """Linkul pe care il PUBLICA un canal din afara site-ului (newsletter, Telegram,
    Facebook, alerte). Pagina ofertei daca are tracking, altfel linkul afiliat, altfel
    pagina NOASTRA de magazin — niciodata site-ul magazinului fara comision.

    Inlocuieste `landing_page or url_afiliat or url`, repetat in patru scripturi: dupa
    13.09.2026, la un magazin fara contract `landing_page` si `url_afiliat` sunt `url`,
    deci lantul `or` ar fi publicat exact clicul gratis pe care site-ul il ascunde."""
    for candidat in ((promo or {}).get("landing_page"), m.get("url_afiliat")):
        if are_tracking(candidat or ""):
            return candidat
    return f"{site_url}/cod-reducere/{m.get('magazin', '')}"


def trece_prin_tracking(magazine: list) -> tuple:
    """In-place pe lista de magazine. Idempotent: ce are deja tracking nu se atinge.
    Intoarce (afiliate_neplatite_aduse_la_url, oferte_deep_link, oferte_pe_link_simplu)."""
    neplatite = deep = simplu = 0
    contracte = _contracte_impact()
    for m in magazine:
        url = (m.get("url") or "").strip()
        af = (m.get("url_afiliat") or "").strip()
        # `subId` salvat in date e mereu gresit: eticheta de atribuire o pune frontend-ul LA
        # CLIC (lib/subId.ts), pastrand valoarea existenta si adaugand pagina dupa „~". InVideo
        # avea `subId1=neelansh-test`, ramas dintr-un import vechi — fiecare vanzare ar fi fost
        # raportata ca „neelansh-test~/ai-tools" (gasit de cercetarea din 15.09.2026).
        if _IMPACT_LINK.search(af) and re.search(r"[?&]subId\d=", af, re.I):
            af = re.sub(r"([?&])subId\d=[^&]*&?", r"\1", af, flags=re.I).rstrip("?&")
            m["url_afiliat"] = af
        if af and af != url and not are_tracking(af) and acelasi_domeniu(af, url):
            m["url_afiliat"] = af = url
            neplatite += 1
        # Link Impact bun ca forma, dar pe un contract EXPIRAT: nu mai plateste.
        # 8 magazine pe 13.09.2026. Doar cand harta contractelor exista — fara ea nu stim.
        if contracte and url and _IMPACT_LINK.search(af) and _campanie(af) not in contracte:
            m["url_afiliat"] = af = url
            neplatite += 1
        # Link pe campania ALTUI brand (ExpressVPN -> holiday.com). Garda sta AICI, la merge,
        # nu doar in fetch_impact_api.py: pe 15.09 reparatia de acolo era anulata la acelasi pas
        # de pipeline de reconcile_impact_links.py, care citea un CSV cu doar „Advertiser URL".
        # Orice importator, prezent sau viitor, trece prin merge.
        if url and not link_potrivit(af, url):
            m["url_afiliat"] = af = url
            neplatite += 1
        for p in m.get("promotii") or []:
            if not isinstance(p, dict):
                continue
            lp = (p.get("landing_page") or "").strip()
            if not lp or are_tracking(lp):
                continue
            if not are_tracking(af):
                # Magazin fara comision: pagina ofertei devine `url`, ca `linkPromotie()` din
                # frontend sa ascunda butonul, la fel ca pe restul paginii — nu clic gratis.
                # Si cand oferta duce pe ALT site (awolvision.eu -> valerion.com): pe pagina unui
                # magazin, o oferta spre alt brand e inselatoare, nu doar neplatita.
                p["landing_page"] = url
                continue
            nou = link_oferta(af, lp) if acelasi_domeniu(lp, url) else af
            p["landing_page"] = nou
            if nou == af:
                simplu += 1
            else:
                deep += 1
    return neplatite, deep, simplu
