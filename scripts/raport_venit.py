"""
raport_venit.py — ce a adus bani si de pe ce pagina (Impact; 2Performant daca exista credentialele local).

DOAR LOCAL. Repo-ul e PUBLIC si comisionul nostru nu se publica niciodata: scriptul nu ruleaza in GitHub
Actions (logurile sunt publice) si scrie doar in data/raport-venit.local.json, ignorat de git (*.local.json).

Pagina vine din sub-id: AffiliateClickTracker / lib/subId.ts pune calea paginii in subId1 (Impact) si in
`st` (2Performant), cu „~eticheta" dupa ea cand linkul avea deja o valoare.

Credentiale, in scripts/.env (gitignored), puse de Alex — niciodata in chat:
  IMPACT_ACCOUNT_SID, IMPACT_AUTH_TOKEN          (exista)
  TWOPEFORMANT_EMAIL, TWOPEFORMANT_PASS          (optional; fara ele, partea 2P e sarita)

Rulare:  python raport_venit.py            # ultimele 90 de zile
         python raport_venit.py --zile 30
"""
from __future__ import annotations

import io
import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import requests

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IESIRE = os.path.join(ROOT, "data", "raport-venit.local.json")


def incarca_env() -> None:
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if not os.path.exists(p):
        return
    for linie in io.open(p, encoding="utf-8"):
        linie = linie.strip()
        if linie and not linie.startswith("#") and "=" in linie:
            k, v = linie.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def pagina(sub: str) -> str:
    """„/cod-reducere/x~newsletter" -> „/cod-reducere/x"; gol -> „(fara sub-id)"."""
    sub = (sub or "").strip()
    return sub.split("~")[0] if sub else "(fara sub-id)"


def impact(zile: int) -> list[dict]:
    sid, tok = os.environ.get("IMPACT_ACCOUNT_SID", ""), os.environ.get("IMPACT_AUTH_TOKEN", "")
    if not sid or not tok:
        print("Impact: lipsesc IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN — sar.")
        return []
    url = f"https://api.impact.com/Mediapartners/{sid}/Actions"
    rez: list[dict] = []
    sfarsit = datetime.now(timezone.utc)
    inceput = sfarsit - timedelta(days=zile)
    # API-ul limiteaza intervalul; ferestre de 30 de zile
    t = inceput
    while t < sfarsit:
        t2 = min(t + timedelta(days=30), sfarsit)
        pagina_api = 1
        while True:
            r = requests.get(url, auth=(sid, tok), headers={"Accept": "application/json"}, timeout=60, params={
                "ActionDateStart": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "ActionDateEnd": t2.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "PageSize": 1000, "Page": pagina_api,
            })
            if r.status_code != 200:
                print(f"Impact: HTTP {r.status_code} — {r.text[:200]}")
                return rez
            d = r.json()
            for a in d.get("Actions", []):
                rez.append({
                    "retea": "impact", "data": (a.get("EventDate") or a.get("CreationDate") or "")[:10],
                    "magazin": a.get("CampaignName") or "", "stare": a.get("State") or "",
                    "suma_comanda": float(a.get("Amount") or 0), "comision": float(a.get("Payout") or 0),
                    "moneda": a.get("Currency") or "", "pagina": pagina(a.get("SubId1") or ""),
                })
            if pagina_api >= int(d.get("@numpages") or 1):
                break
            pagina_api += 1
        t = t2
    return rez


def impact_clicuri(zile: int) -> list[dict]:
    """Clicuri si vanzari pe brand (raportul Impact „Performance by Brand"), ca sa vezi unde merg clicurile."""
    sid, tok = os.environ.get("IMPACT_ACCOUNT_SID", ""), os.environ.get("IMPACT_AUTH_TOKEN", "")
    if not sid or not tok:
        return []
    azi = datetime.now(timezone.utc).date()
    r = requests.get(f"https://api.impact.com/Mediapartners/{sid}/Reports/partner_performance_by_program",
                     auth=(sid, tok), headers={"Accept": "application/json"}, timeout=90,
                     params={"START_DATE": (azi - timedelta(days=zile)).isoformat(), "END_DATE": azi.isoformat(), "PageSize": 1000})
    if r.status_code != 200:
        print(f"Impact (clicuri): HTTP {r.status_code}")
        return []
    rec = r.json().get("Records") or []
    out = [{"magazin": x.get("Campaign") or "", "clicuri": int(float(x.get("Clicks") or 0)),
            "vanzari": int(float(x.get("Actions") or 0))} for x in rec]
    return sorted((x for x in out if x["clicuri"]), key=lambda x: -x["clicuri"])


def doi_p(zile: int) -> list[dict]:
    email, parola = os.environ.get("TWOPEFORMANT_EMAIL", ""), os.environ.get("TWOPEFORMANT_PASS", "")
    if not email or not parola:
        print("2Performant: lipsesc TWOPEFORMANT_EMAIL / TWOPEFORMANT_PASS in scripts/.env — sar.")
        return []
    s = requests.Session()
    r = s.post("https://api.2performant.com/users/sign_in.json", json={"user": {"email": email, "password": parola}}, timeout=60)
    if r.status_code != 200:
        print(f"2Performant: autentificare esuata (HTTP {r.status_code}).")
        return []
    h = {k: r.headers.get(k, "") for k in ("access-token", "client", "uid")}
    h["token-type"] = "Bearer"
    rez: list[dict] = []
    de_la = (datetime.now(timezone.utc) - timedelta(days=zile)).strftime("%Y-%m-%d")
    pag = 1
    while True:
        r = s.get("https://api.2performant.com/affiliate/commissions.json", headers=h, timeout=60,
                  params={"page": pag, "perpage": 40, "filter[start_date]": de_la})
        if r.status_code != 200:
            print(f"2Performant: HTTP {r.status_code} la comisioane — {r.text[:200]}")
            break
        d = r.json()
        lista = d.get("commissions") or []
        for c in lista:
            rez.append({
                "retea": "2performant", "data": (c.get("created_at") or "")[:10],
                "magazin": (c.get("program") or {}).get("name") or c.get("program_name") or "",
                "stare": c.get("status") or "", "suma_comanda": float(c.get("amount") or 0),
                "comision": float(c.get("amount_in_working_currency") or c.get("amount") or 0),
                "moneda": c.get("working_currency_code") or "RON",
                "pagina": pagina(c.get("stats_tags") or c.get("st") or ""),
            })
        pag_tot = ((d.get("metadata") or {}).get("pagination") or {}).get("pages") or (d.get("pagination") or {}).get("pages") or 1
        if pag >= int(pag_tot) or not lista:
            break
        pag += 1
    return rez


def rezumat(actiuni: list[dict]) -> dict:
    def grupa(cheie):
        g: dict = defaultdict(lambda: {"vanzari": 0, "comision": defaultdict(float)})
        for a in actiuni:
            x = g[a[cheie]]
            x["vanzari"] += 1
            x["comision"][a["moneda"]] += a["comision"]
        return sorted(({"cheie": k, "vanzari": v["vanzari"], "comision": {m: round(s, 2) for m, s in v["comision"].items()}}
                       for k, v in g.items()), key=lambda r: -r["vanzari"])
    return {"pe_magazin": grupa("magazin"), "pe_pagina": grupa("pagina"), "pe_stare": grupa("stare"), "pe_retea": grupa("retea")}


def main() -> int:
    zile = int(sys.argv[sys.argv.index("--zile") + 1]) if "--zile" in sys.argv else 90
    incarca_env()
    actiuni = impact(zile) + doi_p(zile)
    clicuri = impact_clicuri(zile)
    rez = {"generat": datetime.now(timezone.utc).isoformat(timespec="seconds"), "zile": zile,
           "vanzari": len(actiuni), **rezumat(actiuni), "actiuni": actiuni, "impact_clicuri": clicuri}
    if clicuri:
        print(f"\nImpact: {sum(x['clicuri'] for x in clicuri)} clicuri, {sum(x['vanzari'] for x in clicuri)} vanzari; "
              f"primele magazine dupa clicuri:")
        for x in clicuri[:10]:
            print(f"  {x['clicuri']:5d} clicuri  {x['vanzari']:3d} vanzari  {x['magazin']}")
    io.open(IESIRE, "w", encoding="utf-8").write(json.dumps(rez, ensure_ascii=False, indent=2))
    print(f"\nUltimele {zile} de zile: {len(actiuni)} vanzari inregistrate.")
    for titlu, cheie in (("Pe retea", "pe_retea"), ("Pe stare", "pe_stare"), ("Pe magazin", "pe_magazin"), ("Pe pagina", "pe_pagina")):
        print(f"\n{titlu}:")
        for r in rez[cheie][:15]:
            print(f"  {r['vanzari']:4d}  {r['cheie'][:60]:60s}  {r['comision']}")
    print(f"\nDetalii: {os.path.relpath(IESIRE, ROOT)} (local, ignorat de git)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
