"""
Merge date din toate platformele de afiliere.
Ruleaza dupa process_data.py si process_profitshare.py.

Output: ../data/output.json + ../frontend/public/output.json
"""

import json
import os
import re
from datetime import datetime, timezone
from urllib.parse import urlparse

# Semnatura unui link cu tracking real de afiliere (Impact/Awin/2P/Profitshare/generice
# cunoscute). Folosita ca prioritate in dedup: un link REAL castiga mereu in fata unuia
# fara tracking, indiferent de scor — altfel un merchant importat o data cu link placeholder
# (ex. vechiul add_impact_merchants.py, ?ref=amcupon ghicit, niciodata verificat) ramane
# blocat cu link-ul fals la infinit, pt ca merge-ul auto-referential (output.json e si input
# si output) nu-l mai ia in calcul dupa prima rulare. Gasit + reparat 06.08.2026.
_REAL_TRACKING_RE = re.compile(
    r"pxf\.io|sjv\.io|impactradius|impact\.com|7401119|irclickid|prf\.hn|anrdoezrs\.net|"
    r"2performant\.com|awin1\.com|cread\.php|"
    r"/c/\d+/\d+/\d+",  # Impact pe domeniul propriu al brandului (discount.beachsim.com)
    re.I,
)
# `profitshare.ro` a fost SCOS din lista de mai sus pe 19.08.2026 — contul a fost
# respins, deci un link Profitshare nu mai e "tracking real", e trafic dat gratis.
from retele_excluse import este_magazin_exclus  # noqa: E402


def _has_real_tracking(m: dict) -> bool:
    return bool(_REAL_TRACKING_RE.search(m.get("url_afiliat", "") or ""))

FILES = [
    "../data/output.json",              # 2Performant
    # "../data/profitshare_output.json",  # Profitshare — EXCLUS 19.08.2026 (cont respins)
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

        # O promotie fara `expira` SI fara `sursa` nu se publica (16.09.2026): nu stim nici de unde
        # vine, nici pana cand e valabila. Cele 9 scrise de mana pe 12.06 in extra_merchants.json
        # (Temu, SHEIN, JollyMag „JOLLY10", MedimFarm „SUMMER18"...) aveau un `zile_ramase` fix —
        # 7, 14, 30 — care n-a scazut trei luni: „7 zile ramase" la o reducere „de vara", in
        # septembrie. Toate importatoarele din pipeline scriu `sursa`. Regula e pe TOATE fisierele,
        # nu doar pe extra: data/output.json e si intrare si iesire (LECTII-TEHNICE #5), deci cand
        # fetch_2p_api.py pastreaza datele vechi, promotiile manuale s-ar intoarce pe acolo.
        _nesigure = []
        for _mg in data:
            _pr = _mg.get("promotii") if isinstance(_mg, dict) else None
            if isinstance(_pr, list):
                _ok = [p for p in _pr if isinstance(p, dict) and (p.get("expira") or p.get("sursa"))]
                if len(_ok) < len(_pr):
                    _nesigure.append(_mg.get("magazin", "?"))
                    _mg["promotii"] = _ok
        if _nesigure:
            print(f"  {os.path.basename(fpath)}: promotii fara sursa si fara data, nepublicate, la "
                  f"{len(_nesigure)} magazine ({', '.join(_nesigure[:10])})")

        adaugate = 0
        duplicate = 0
        invalide = 0
        excluse = 0
        for magazin in data:
            raw = (magazin.get("magazin", "") or "").strip()
            if not raw:
                continue
            # Garda permanenta pentru retelele excluse. Trebuie sa fie AICI, in
            # bucla de merge: `data/output.json` e si intrare si iesire, deci o
            # curatare facuta o singura data ar fi anulata de urmatoarea rulare.
            if este_magazin_exclus(magazin):
                excluse += 1
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
                # Dedup: un link cu tracking real castiga mereu in fata unuia fara
                # (indiferent de scor) — altfel un placeholder vechi ramane blocat la
                # infinit. Doar daca ambele sunt la fel (ambele au / ambele n-au link
                # real) decidem pe scor_final / nr. promotii, ca inainte.
                duplicate += 1
                new_real, prev_real = _has_real_tracking(magazin), _has_real_tracking(prev)
                if new_real and not prev_real:
                    better = True
                elif prev_real and not new_real:
                    better = False
                else:
                    better = (
                        magazin.get("scor_final", 0) > prev.get("scor_final", 0)
                        or (len(magazin.get("promotii") or []) > len(prev.get("promotii") or []))
                    )
                if better:
                    by_slug[slug] = magazin

        print(f"  {os.path.basename(fpath)}: +{adaugate} magazine "
              f"({duplicate} duplicate, {invalide} invalide, {excluse} retea exclusa)")

    merged: list[dict] = list(by_slug.values())

    # ── Varianta STRAINA a unui magazin care are si versiune .ro ────────────────
    # 16.09.2026: liki24.pl/.nl/.it/.be/.co.uk, gsmnet.de, fragranza.hu, underarmour.bg
    # aveau pagini proprii langa liki24.ro, gsmnet.ro etc. Un cumparator din Romania ajungea
    # pe farmacia poloneza sau pe magazinul german. Scoase doar cand exista varianta .ro —
    # un magazin strain fara echivalent romanesc (ex. software livrat oriunde) ramane.
    # Adresele vechi redirectioneaza spre varianta .ro (cod-reducere/[magazin]/page.tsx).
    _GENERICE = {"io", "ai", "co", "me", "tv", "gg", "ly", "to", "cc", "ws", "eu"}
    def _tara(slug: str):
        _p = slug.lower().split(".")
        return _p[-1] if len(_p) >= 2 and len(_p[-1]) == 2 and _p[-1] not in _GENERICE else None
    _baze_ro = {m["magazin"].split(".")[0] for m in merged if m["magazin"].endswith(".ro")}
    _straine = [m["magazin"] for m in merged
                if _tara(m["magazin"]) not in (None, "ro") and m["magazin"].split(".")[0] in _baze_ro]
    if _straine:
        merged = [m for m in merged if m["magazin"] not in set(_straine)]
        print(f"  variante straine ale unor magazine .ro scoase: {len(_straine)} ({', '.join(sorted(_straine))})")

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

    # ── Onestitate link-uri: sterge parametri falsi de tracking (?ref=amcupon, ──
    # REFERRALCODE=AMCUPON, /invite/amcupon, /promo/amcupon) ramasi din import-uri
    # vechi (add_impact_merchants.py ghicea "probabil au program pe Impact" fara sa
    # verifice, apoi merge-ul auto-referential ii perpetueaza la infinit — vezi
    # _has_real_tracking mai sus). Un link asa NU genereaza niciun comision, dar
    # arata ca si cum ar fi trackuit -> il curatam la un link simplu, onest, catre
    # magazin. Nu stergem magazinul (ramane vizibil ca recomandare fara comision).
    _FAKE_PARAM_RE = re.compile(r"[?&](ref|REFERRALCODE|utm_source)=amcupon", re.I)
    _FAKE_PATH_RE  = re.compile(r"/(invite|promo)/amcupon", re.I)
    _fake_cleaned = 0
    for _m in merged:
        _u = _m.get("url_afiliat", "") or ""
        if _u and not _has_real_tracking(_m) and (_FAKE_PARAM_RE.search(_u) or _FAKE_PATH_RE.search(_u)):
            _clean = _FAKE_PARAM_RE.sub("", _u)
            _clean = _FAKE_PATH_RE.sub("", _clean)
            _clean = re.sub(r"[?&]$", "", _clean)
            _m["url_afiliat"] = _clean or _m.get("url", "")
            _fake_cleaned += 1
    if _fake_cleaned:
        print(f"  link-uri false curatate (fara tracking real, aveau parametru fals): {_fake_cleaned}")

    # ── Clicul pe OFERTA trece prin tracking, nu direct pe site-ul magazinului ──
    # 210 din 309 promotii active plecau fara comision (13.09.2026). Motivul si formatele
    # testate live: scripts/link_oferta.py — sursa unica, folosita si de import_csv_promotii.py.
    from link_oferta import trece_prin_tracking  # noqa: E402
    _neplatite, _deep, _simplu = trece_prin_tracking(merged)
    print(f"  linkuri afiliate neplatite (fara tracking sau contract expirat) aduse la url: {_neplatite}")
    print(f"  oferte trecute prin tracking: {_deep} deep-link, {_simplu} pe linkul afiliat simplu")

    # ── Nicio promotie expirata; `zile_ramase` derivat din `expira` la FIECARE rulare ──
    # Inainte de sortare: ordinea de mai jos foloseste `are_promotie`. Motivul si masuratoarea:
    # scripts/promotii.py (58 din 336 de promotii expirate pe site, 16.09.2026).
    from promotii import curata_promotii, raport  # noqa: E402
    print("  " + raport(curata_promotii(merged)))

    # ── Campuri FABRICATE scoase la fiecare rulare ──────────────────────────────────────────
    # A cincea reaparitie a `procent_succes`/`folosit_de` (22.09.2026). Motivul complet si
    # masuratoarea (16 din 65 de magazine cu oferta reala erau excluse de la promovare
    # fiindca NU aveau campul fabricat): scripts/campuri_interzise.py
    from campuri_interzise import curata_campuri_fabricate  # noqa: E402
    from campuri_interzise import raport as raport_campuri  # noqa: E402
    print("  " + raport_campuri(curata_campuri_fabricate(merged)))

    # ── Programe care NU livreaza in Romania (ShippingRegions din Impact) ────────────────────────
    # 19.09.2026: 108 magazine aveau programe doar pentru alte tari — „Eufy NL", „Navimow US",
    # „Lenovo India", „JD Sports Indonesia". Pe un site de cupoane pentru Romania, un clic acolo
    # nu se poate transforma in comanda. Ies din output.json (deci din toate listele, topurile,
    # newsletterul si sitemap-ul) si intra intr-un fisier separat, din care pagina lor spune
    # onest de ce nu le promovam. Doar cand programul DECLARA tarile si Romania lipseste.
    from link_oferta import livreaza_in_romania, _contracte_impact  # noqa: E402
    _cale_fara_ro = os.path.join(os.path.dirname(OUTPUT_FRONTEND), "magazine-fara-livrare-ro.json")
    _fara_ro = []
    if _contracte_impact():
        for _m in merged:
            _ok, _regiuni, _program = livreaza_in_romania(_m.get("url_afiliat") or "")
            if _ok is False:
                _fara_ro.append({"magazin": _m["magazin"], "url": _m.get("url", ""),
                                 "categorie": _m.get("categorie", ""),
                                 "categorie_slug": _m.get("categorie_slug", ""),
                                 "program": _program, "regiuni": _regiuni[:12]})
    elif os.path.exists(_cale_fara_ro):
        # Fara harta Impact (API-ul a picat la rularea asta) pastram lista de data trecuta — altfel
        # cele 108 magazine ar reveni o rulare si ar pleca la urmatoarea.
        with open(_cale_fara_ro, encoding="utf-8") as _f:
            _fara_ro = json.load(_f)
        print(f"  (harta Impact lipseste — pastrez lista de magazine fara livrare in RO: {len(_fara_ro)})")
    if _fara_ro:
        _scoase = {x["magazin"] for x in _fara_ro}
        merged = [m for m in merged if m["magazin"] not in _scoase]
        print(f"  magazine cu program care nu livreaza in Romania, scoase din liste: {len(_fara_ro)} "
              f"({', '.join(sorted(_scoase)[:8])}...)")
    with open(_cale_fara_ro, "w", encoding="utf-8") as f:
        json.dump(sorted(_fara_ro, key=lambda x: x["magazin"]), f, ensure_ascii=False, indent=1)

    # ── ultima_verificare: stampila REALA de "pipeline-ul a confirmat azi acest record" ──
    # Inainte, campul se seta o singura data la creare (fetch_2p_api.py/import_csv_promotii.py/
    # process_data.py) si nu se mai actualiza niciodata dupa — deci "verificat" insemna de fapt
    # "creat candva", nu "verificat azi", pe TOATE magazinele, nu doar pe cele fara camp. Acum
    # merge_platforms.py (ruleaza de 3x/zi, re-valideaza fiecare record — vezi curatarea de mai
    # sus) seteaza data reala la fiecare rulare, pe toate cele 1178 magazine, nu doar 2Performant.
    _azi = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    for _m in merged:
        _m["ultima_verificare"] = _azi

    # ── Consolidare canonica a categoriilor (40 etichete fragmentate -> 18 RO) ──
    # Prinde toate sursele; reclasifica junk-ul (Online Mall/Diverse) dupa nume.
    try:
        from canonicalize_categories import canonicalize
        canonicalize(merged)
    except Exception as e:
        print(f"  (canonicalize skip: {e})")

    # ── Normalizare logo-uri: surse moarte -> favicon Google al domeniului ──
    # Clearbit (serviciu inchis 2023), wikimedia thumbs, SVG hotlink-blocat si gol
    # -> favicon domeniului (slug=domeniu, marca reala, nu da niciodata 404).
    # Pastreaza logo-urile reale de pe CDN 2Performant/Profitshare (functioneaza).
    def _needs_favicon(u: str) -> bool:
        if not u:
            return True
        if re.search(r"clearbit\.com|wikimedia\.org|wikipedia\.org", u, re.I):
            return True
        if re.search(r"\.svg(\?|$)", u, re.I):
            return True
        return False
    _logo_fixed = 0
    for _m in merged:
        _dm = re.search(r"[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?", _m.get("magazin", "") or "", re.I)
        if _dm and _needs_favicon(_m.get("logo_url", "")):
            _m["logo_url"] = f"https://www.google.com/s2/favicons?domain={_dm.group(0)}&sz=128"
            _logo_fixed += 1
    print(f"  logo-uri normalizate la favicon: {_logo_fixed}")

    # PRIORITATEA se normalizeaza AICI, la granita, nu in importatoare.
    #
    # Masurat 11.09.2026, inainte de reparatie: campul aduna patru vocabulare
    # incompatibile, pentru ca fiecare importator scria ce credea el —
    #   "standard" (649), "featured" (14), "high" (3)  ... si "#999" (491).
    # Ultimul venea din `f"#{rank}"` cu rank=999, adica santinela pentru „neclasat":
    # toate cele 491 erau identice cu "#" + rank, deci pura redundanta peste un camp
    # numeric care exista deja. Un camp in care 42% dintre randuri nu spun nimic, iar
    # restul vorbesc trei limbi, nu se poate sorta si nu se poate filtra.
    #
    # Vocabularul e acum inchis si derivat dintr-un singur numar real, `scor_afiliere`.
    # Orice valoare venita de la un importator se ignora — inclusiv una noua, inventata
    # maine de un importator nou.
    PRIORITATI = ("featured", "high", "standard", "neclasat")
    _prio = {k: 0 for k in PRIORITATI}
    for _m in merged:
        _s = _m.get("scor_afiliere")
        if not isinstance(_s, (int, float)) or _s <= 0:
            _v = "neclasat"
        elif _s >= 85:
            _v = "featured"
        elif _s >= 60:
            _v = "high"
        else:
            _v = "standard"
        _m["prioritate"] = _v
        _prio[_v] += 1
    assert set(_prio) == set(PRIORITATI)
    print("  prioritati normalizate: " + ", ".join(
        f"{k}={_prio[k]}" for k in PRIORITATI))
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
