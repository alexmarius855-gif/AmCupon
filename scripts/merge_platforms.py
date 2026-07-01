"""
Merge date din toate platformele de afiliere.
Ruleaza dupa process_data.py si process_profitshare.py.

Output: ../data/output.json + ../frontend/public/output.json
"""

import json
import os
import re
from urllib.parse import urlparse

FILES = [
    "../data/output.json",              # 2Performant
    "../data/profitshare_output.json",  # Profitshare
    "../data/tradetracker_output.json", # TradeTracker
    "../data/extra_merchants.json",     # Magazine adaugate manual (studioszel, sevensins, depox etc.)
]

OUTPUT_FILE    = "../data/output.json"
OUTPUT_FRONTEND = "../frontend/public/output.json"

# ─── Normalizare slug — TOATE slug-urile devin domeniu curat ─────────────────
# Slug-ul (`magazin`) e folosit ca segment de URL in /cod-reducere/[magazin] SI
# in canonical + sitemap. Slug-uri cu spatii ("Revolut Business"), majuscule
# ("Surfshark"), UUID-uri lipite ("bookzone-ro-9c9bce7e-...") sau liniute in loc
# de punct ("otter-ro") produc linkuri invalide. Solutie: derivam slug-ul din
# DOMENIUL url-ului (consistent cu restul site-ului: emag.ro, temu.com), cu
# fallback pe numele slugificat doar daca url-ul lipseste.
_UUID = re.compile(
    r"-?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", re.I)


def _slugify_name(s: str) -> str:
    s = _UUID.sub("", (s or "").lower().strip())
    s = re.sub(r"[^a-z0-9.]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-.")
    return s


def domain_slug(url: str, fallback: str) -> str:
    """Domeniu curat din url (fara www/protocol/path); fallback = nume slugificat."""
    host = ""
    if url:
        try:
            netloc = urlparse(url if "//" in url else "//" + url).netloc
            host = (netloc or "").lower().split(":")[0]
            if host.startswith("www."):
                host = host[4:]
        except Exception:
            host = ""
    if host and "." in host and " " not in host and not _UUID.search(host):
        return host
    return _slugify_name(fallback)


# ─── Branduri straine / B2B irelevante pentru public RO ──────────────────────
# Veneau prin Impact ca noise (hoteluri din Asia, plugin-uri WordPress, prop money
# pentru filme, CBD US etc.) — linkurile mergeau, dar pe un site de cupoane RO arata
# spam si nu converteau. Pastram doar branduri pe care un consumator/creator RO
# le-ar folosi real (VPN, antivirus, hosting, gadget-uri, cursuri, travel, fintech,
# unelte video). Editabil: adauga/scoate domenii dupa nevoie.
IRRELEVANT_FOREIGN = {
    "anantara.com", "arkuda.digital", "bdthemes.com", "britishcouncil.org",
    "cariloha.com", "clean.email", "cuyana.com", "debutify.com", "getmailbird.com",
    "hubspot.com", "justfit.app", "livelarq.com", "magoosh.com", "martinic.com",
    "maxbone.com", "metabox.io", "neliosoftware.com", "nuleafnaturals.com",
    "propmoney.com", "sorare.com", "sportsline.com", "tempo.fit",
    "terminalserviceplus.com", "termly.io", "ticketliquidator.com", "treezy.de",
    "tribesigns.com", "uperfectmonitor.com", "uphold.com", "vistasocial.com",
    "vivaia.com", "wildbird.com", "wyndhamhotels.com", "rumpl.com", "alamy.com",
    "oreilly.com", "esimx.com", "domain.com", "bluehost.com", "youngelectricbikes.com",
}

# ─── Programe de test/sandbox ale retelelor de afiliere ──────────────────────
# Ex: "advertisertest.eu/production/test944" cu promotie "testCampaign" —
# campanie sandbox 2Performant care s-a scurs in feed cu scor_final artificial
# maxim (100% succes fals), aparand pe locul 1-5 in Top Reduceri. NU e magazin real.
_TEST_PATTERN = re.compile(r"test\d*\.|/test|-test\.|^test\.|sandbox|\bdemo\.|example\.com", re.I)


def main():
    by_slug: dict[str, dict] = {}  # slug curat -> magazin (pastram cel mai bun)

    for fpath in FILES:
        if not os.path.exists(fpath):
            print(f"  Fisier lipsa (skip): {fpath}")
            continue

        with open(fpath, encoding="utf-8") as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"  JSON invalid in {fpath}: {e}")
                continue

        if not isinstance(data, list):
            print(f"  Format neasteptat in {fpath} — skip")
            continue

        adaugate = 0
        duplicate = 0
        invalide = 0
        for magazin in data:
            raw = (magazin.get("magazin", "") or "").strip()
            if not raw:
                continue
            url_val = (magazin.get("url") or "").strip()
            if url_val and any(c.isspace() for c in url_val):
                # URL cu spatii = date corupte de la sursa -> aruncam
                invalide += 1
                continue
            # Slug curat, URL-safe, derivat din domeniu (consistent cu tot site-ul)
            slug = domain_slug(url_val, raw)
            if not slug or len(slug) < 2 or slug.strip("-.") == "":
                invalide += 1
                continue
            if slug in IRRELEVANT_FOREIGN:
                # brand strain/B2B irelevant pentru public RO — il scoatem
                invalide += 1
                continue
            if _TEST_PATTERN.search(slug) or _TEST_PATTERN.search(raw):
                # campanie sandbox/test scursa din API-ul retelei — nu e magazin real
                invalide += 1
                continue
            magazin["magazin"] = slug  # suprascriem cu forma curata

            prev = by_slug.get(slug)
            if prev is None:
                by_slug[slug] = magazin
                adaugate += 1
            else:
                # Dedup: pastram magazinul cu scor_final mai mare (sau cu promotii)
                duplicate += 1
                better = (
                    magazin.get("scor_final", 0) > prev.get("scor_final", 0)
                    or (len(magazin.get("promotii") or []) > len(prev.get("promotii") or []))
                )
                if better:
                    by_slug[slug] = magazin

        print(f"  {os.path.basename(fpath)}: +{adaugate} magazine "
              f"({duplicate} duplicate, {invalide} invalide sarite)")

    merged: list[dict] = list(by_slug.values())

    # ── Coercitie tipuri: garanteaza ca frontend-ul (care face .match() pe stringuri)
    # nu crapa la build daca o sursa trimite bool/numar in loc de string (ex: promo
    # descriere=False din unele surse). Bug de build prins 30.06.2026 ("a.match is not a function").
    for m in merged:
        if not isinstance(m.get("comision"), str):
            m["comision"] = "" if m.get("comision") is None else str(m["comision"])
        promos = m.get("promotii")
        if not isinstance(promos, list):
            m["promotii"] = []
            continue
        for pr in promos:
            for f in ("nume", "descriere", "cod_cupon", "landing_page"):
                v = pr.get(f)
                if v is not None and not isinstance(v, str):
                    pr[f] = "" if isinstance(v, bool) else str(v)

    # Sorteaza: promotii active primul, apoi scor final
    merged.sort(key=lambda x: (
        -int(x.get("are_promotie", False)),
        -x.get("scor_final", 0),
    ))

    cu_promotii = sum(1 for m in merged if m.get("are_promotie"))
    cu_cod = sum(1 for m in merged if m.get("cod_cupon"))

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    with open(OUTPUT_FRONTEND, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"\nTotal dupa merge: {len(merged)} magazine")
    print(f"  {cu_promotii} cu promotii active")
    print(f"  {cu_cod} cu cod cupon")

    # Breakdown per platforma
    by_platform: dict[str, int] = {}
    for m in merged:
        p = m.get("platforma", "2performant")
        by_platform[p] = by_platform.get(p, 0) + 1
    for plat, cnt in sorted(by_platform.items()):
        print(f"  {plat}: {cnt} magazine")


if __name__ == "__main__":
    main()
