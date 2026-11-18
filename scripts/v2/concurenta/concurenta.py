"""
Ce fac concurentii: sitemap-urile lor, comparate luna de luna si cu magazinele noastre.

Pentru fiecare site din SITE-URI: gaseste sitemap-urile (robots.txt, apoi /sitemap.xml), citeste adresele,
le grupeaza pe tipuri de pagina (primul segment din cale) si scoate lista de magazine (tipul cu cele mai
multe pagini pe doua niveluri, ex. /magazin/<slug>). Fata de instantaneul de data trecuta: magazine noi,
magazine scoase, tipuri de pagina noi. Fata de noi: magazinele lor pe care nu le avem.

Cuponescu are aproape o mie de pagini de magazin si doar 4 alte pagini (masurat 16.08.2026): ce adauga ei
e ce cauta oamenii lor. Preluam idei (ce magazine, ce tipuri de pagini), niciodata texte.

    python scripts/v2/concurenta/concurenta.py            # in Actions (din sesiunile Claude site-urile sunt blocate)
    python scripts/v2/concurenta/concurenta.py --test     # citirea sitemap-urilor si comparatia, fara retea
"""
from __future__ import annotations

import gzip
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone

AICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(AICI, "..", "research"))
from comun import DATA, Magazine, compact, nume_afisat  # noqa: E402

# Site-urile urmarite. Se adauga aici (domeniul, fara https).
SITE_URI = ["cuponescu.ro", "cuponeria.ro"]
AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
DIR = os.path.join(DATA, "research", "concurenta")
MAX_FISIERE, MAX_ADRESE = 60, 40000
RE_LOC = re.compile(r"<loc>\s*([^<\s]+)\s*</loc>", re.I)


def descarca(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(req, timeout=25) as r:
        corp = r.read()
    if url.endswith(".gz") or corp[:2] == b"\x1f\x8b":
        corp = gzip.decompress(corp)
    return corp.decode("utf-8", errors="replace")


def adrese_din_sitemap(text: str) -> tuple[list[str], list[str]]:
    """(sitemap-uri copil, pagini) dintr-un fisier sitemap sau sitemap index."""
    locuri = [u.replace("&amp;", "&") for u in RE_LOC.findall(text)]
    if "<sitemapindex" in text.lower():
        return locuri, []
    return [], locuri


def citeste_site(domeniu: str, descarca=descarca) -> list[str]:
    radacini = []
    try:
        robots = descarca(f"https://{domeniu}/robots.txt")
        radacini = [l.split(":", 1)[1].strip() for l in robots.splitlines() if l.lower().startswith("sitemap:")]
    except Exception:  # noqa: BLE001 - fara robots incercam adresele obisnuite
        pass
    radacini = radacini or [f"https://{domeniu}/sitemap.xml", f"https://{domeniu}/sitemap_index.xml"]
    de_citit, vazute, pagini = list(radacini), set(), []
    while de_citit and len(vazute) < MAX_FISIERE and len(pagini) < MAX_ADRESE:
        url = de_citit.pop(0)
        if url in vazute:
            continue
        vazute.add(url)
        try:
            copii, adrese = adrese_din_sitemap(descarca(url))
        except Exception:  # noqa: BLE001
            continue
        de_citit.extend(c for c in copii if c not in vazute)
        pagini.extend(adrese)
        time.sleep(0.5)
    return list(dict.fromkeys(pagini))[:MAX_ADRESE]


def instantaneu(domeniu: str, pagini: list[str]) -> dict:
    tipuri: Counter = Counter()
    pe_doua: Counter = Counter()
    for u in pagini:
        segmente = [s for s in urllib.parse.urlparse(u).path.split("/") if s]
        tipuri[segmente[0] if segmente else "/"] += 1
        if len(segmente) == 2:
            pe_doua[segmente[0]] += 1
    tip_magazin = pe_doua.most_common(1)[0][0] if pe_doua else None
    magazine = sorted({[s for s in urllib.parse.urlparse(u).path.split("/") if s][1] for u in pagini
                       if tip_magazin and [s for s in urllib.parse.urlparse(u).path.split("/") if s][:1] == [tip_magazin]
                       and len([s for s in urllib.parse.urlparse(u).path.split("/") if s]) == 2})
    if len(magazine) < 50:  # fara un tip clar de magazin: paginile de pe primul nivel sunt magazinele
        magazine = sorted({[s for s in urllib.parse.urlparse(u).path.split("/") if s][0] for u in pagini
                           if len([s for s in urllib.parse.urlparse(u).path.split("/") if s]) == 1})
        tip_magazin = None
    return {"site": domeniu, "data": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "pagini": len(pagini),
            "tip_magazin": tip_magazin, "tipuri": dict(tipuri.most_common(30)), "magazine": magazine}


def compara(vechi: dict | None, nou: dict) -> dict:
    if not vechi:
        return {"prima_masurare": True}
    v, n = set(vechi.get("magazine") or []), set(nou.get("magazine") or [])
    return {"magazine_noi": sorted(n - v), "magazine_scoase": sorted(v - n),
            "tipuri_noi": sorted(set(nou.get("tipuri") or {}) - set(vechi.get("tipuri") or {})),
            "pagini": [vechi.get("pagini"), nou.get("pagini")]}


def nume_din_slug(slug: str) -> str:
    return re.sub(r"[-_]+", " ", re.sub(r"-(ro|com|net)$", r".\1", slug)).strip()


def raport(rezultate: list[dict], mg: Magazine) -> tuple[str, dict]:
    acoperire: Counter = Counter()
    for r in rezultate:
        for s in r["instantaneu"]["magazine"]:
            acoperire[compact(nume_din_slug(s))] += 1
    lipsa = []
    for cheie, n in acoperire.most_common():
        if len(cheie) >= 3 and not mg.gaseste(cheie):
            lipsa.append({"magazin": cheie, "site_uri": n, "stare": mg.stare(cheie)["cod"]})
    zi = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    L = [f"# Concurența — {zi}\n", "Sitemap-urile site-urilor urmărite, față de luna trecută și față de magazinele noastre.\n"]
    for r in rezultate:
        ins, dif = r["instantaneu"], r["diferente"]
        L.append(f"## {ins['site']}\n")
        L.append(f"- pagini în sitemap: **{ins['pagini']}**; pagini de magazin: **{len(ins['magazine'])}**"
                 + (f" (sub `/{ins['tip_magazin']}/`)" if ins.get("tip_magazin") else ""))
        L.append("- tipuri de pagini: " + ", ".join(f"/{k} ({v})" for k, v in list(ins["tipuri"].items())[:12]))
        if dif.get("prima_masurare"):
            L.append("- prima măsurare: comparația cu luna trecută începe de la următoarea rulare")
        else:
            L.append(f"- magazine noi: {len(dif['magazine_noi'])} ({', '.join(dif['magazine_noi'][:25]) or '—'})")
            L.append(f"- magazine scoase: {len(dif['magazine_scoase'])}")
            if dif["tipuri_noi"]:
                L.append(f"- tipuri de pagini noi: {', '.join('/' + t for t in dif['tipuri_noi'])}")
        L.append("")
    L.append(f"## Magazinele lor pe care nu le avem ({len(lipsa)})\n")
    L.append(", ".join(f"{x['magazin']} ({x['site_uri']})" for x in lipsa[:80]) or "—")
    L.append("\n_Generat de `scripts/v2/concurenta/concurenta.py`. Preluăm idei, nu texte._")
    return "\n".join(L) + "\n", {"actualizat": zi, "lipsa": lipsa}


def main() -> int:
    os.makedirs(DIR, exist_ok=True)
    mg = Magazine()
    rezultate = []
    for dom in SITE_URI:
        pagini = citeste_site(dom)
        if not pagini:
            print(f"{dom}: niciun sitemap citit")
            continue
        ins = instantaneu(dom, pagini)
        cale = os.path.join(DIR, f"{dom}.json")
        vechi = json.load(open(cale, encoding="utf-8")) if os.path.exists(cale) else None
        dif = compara(vechi, ins)
        with open(cale, "w", encoding="utf-8") as f:
            json.dump(ins, f, ensure_ascii=False, separators=(",", ":"))
        rezultate.append({"instantaneu": ins, "diferente": dif})
        print(f"{dom}: {ins['pagini']} pagini, {len(ins['magazine'])} magazine, tipuri {list(ins['tipuri'])[:8]}"
              + ("" if dif.get("prima_masurare") else f"; noi {len(dif['magazine_noi'])}, scoase {len(dif['magazine_scoase'])}"))
    if not rezultate:
        return 1
    text, lipsa = raport(rezultate, mg)
    with open(os.path.join(DIR, "RAPORT.md"), "w", encoding="utf-8") as f:
        f.write(text)
    with open(os.path.join(DIR, "lipsa-la-noi.json"), "w", encoding="utf-8") as f:
        json.dump(lipsa, f, ensure_ascii=False, indent=1)
    print(f"magazinele lor pe care nu le avem: {len(lipsa['lipsa'])}")
    return 0


def test() -> int:
    erori = []
    index = ("<?xml version='1.0'?><sitemapindex><sitemap><loc>https://x.ro/s1.xml</loc></sitemap>"
             "<sitemap><loc>https://x.ro/s2.xml.gz</loc></sitemap></sitemapindex>")
    s1 = "<urlset>" + "".join(f"<url><loc>https://x.ro/magazin/m{i}-ro</loc></url>" for i in range(60)) + \
         "<url><loc>https://x.ro/blog/ceva</loc></url><url><loc>https://x.ro/despre</loc></url></urlset>"
    s2 = gzip.compress(b"<urlset><url><loc>https://x.ro/magazin/emag-ro</loc></url></urlset>")
    fisiere = {"https://x.ro/robots.txt": "User-agent: *\nSitemap: https://x.ro/index.xml\n",
               "https://x.ro/index.xml": index, "https://x.ro/s1.xml": s1, "https://x.ro/s2.xml.gz": s2}

    def fals(url: str) -> str:
        v = fisiere[url]
        return gzip.decompress(v).decode() if isinstance(v, bytes) else v

    pagini = citeste_site("x.ro", descarca=fals)
    if len(pagini) != 63:
        erori.append(f"sitemap index + gz: {len(pagini)} pagini, asteptat 63")
    ins = instantaneu("x.ro", pagini)
    if ins["tip_magazin"] != "magazin" or len(ins["magazine"]) != 61 or "emag-ro" not in ins["magazine"]:
        erori.append(f"magazinele: tip {ins['tip_magazin']}, {len(ins['magazine'])}")
    dif = compara({"magazine": ["m1-ro", "vechi-ro"], "tipuri": {"magazin": 1}}, ins)
    if "vechi-ro" not in dif["magazine_scoase"] or "emag-ro" not in dif["magazine_noi"] or dif["tipuri_noi"] != ["blog", "despre"]:
        erori.append(f"comparatia: {dif}")
    if nume_din_slug("dr-max-ro") != "dr max.ro":
        erori.append(nume_din_slug("dr-max-ro"))
    for e in erori:
        print("PICA:", e)
    print("concurenta.py:", "OK" if not erori else f"{len(erori)} erori")
    return 1 if erori else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else main())
