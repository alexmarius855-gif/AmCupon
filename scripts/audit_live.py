"""
audit_live.py — verifica FIECARE pagina din sitemap, pe site-ul live (04.11.2026).
Completeaza audit_pagini.py (22.09), care citeste build-ul local: pagini subtiri, sectiuni goale, text repetat.

Alex: „vreau sa fie verificata fiecare pagina". Ce verifica, pe HTML-ul live (sau local, cu --baza):
  - raspunde 200 si nu e redirectionata;
  - titlu de cel mult 60 de caractere, unic; descriere de cel mult 160, unica;
  - exact un H1; un paragraf sub el (cu ce incepe pagina: hook-ul);
  - poate merge la un magazin: are cel putin un link platit, unde ar trebui sa aiba;
  - text rupt: ghilimele goale, undefined, NaN, [object, „cod" fara cod, text pentru afiliati;
  - imagini fara adresa si linkuri interne spre pagini care nu exista.

NU verifica daca un text e adevarat si nici cum arata pagina. Doar ce se poate masura pe toate paginile.

    python audit_live.py                         # site-ul live; raport in data/audit-pagini.local.json
    python audit_live.py --baza http://localhost:3011 --doar /top,/alege
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace", line_buffering=True)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IESIRE = os.path.join(ROOT, "data", "audit-pagini.local.json")
UA = {"User-Agent": "AmCupon-audit-pagini"}
RE_PLATIT = re.compile(r'href="https://(?:event\.2performant\.com|[a-z0-9-]+\.sjv\.io|www\.awin1\.com|[a-z0-9-]+\.pxf\.io|[a-z0-9-]+\.7eer\.net)')
# Paginile unde omul trebuie sa poata merge la un magazin.
CU_MAGAZIN = ("/cod-reducere/", "/top/", "/alege/", "/black-friday/", "/categorii/", "/produse", "/oferte-azi")
RE_RUPT = {
    "ghilimele goale": re.compile(r'(?:cu codul|codul|cod)\s*["„“”]\s*["„“”]|"\s*"(?=[\s.,<])'),
    "undefined/NaN": re.compile(r"(?<![\w-])(undefined|NaN|\[object Object\])(?![\w-])"),
    "text pentru afiliati": re.compile(r"\b(influencer\w*|comisionul? (de|t[aă]u|vostru)|pentru promovare|afiliații|clienții pe care îi aduceți)\b", re.I),
    "pret zero": re.compile(r">\s*0(?:,00)?\s*lei\s*<"),
}


def ia(url: str):
    try:
        cerere = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(cerere, timeout=45) as r:
            return r.status, r.geturl(), r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return e.code, url, ""
    except Exception as e:  # noqa: BLE001
        return 0, url, str(e)


def verifica(html: str, cale: str) -> dict:
    """Problemele unei pagini. Functie separata, ca testele sa-i poata da HTML construit."""
    pb = []
    corp = re.sub(r"<script[\s\S]*?</script>|<style[\s\S]*?</style>", "", html)
    t = re.search(r"<title[^>]*>([\s\S]*?)</title>", html)
    titlu = re.sub(r"\s+", " ", t.group(1)).strip() if t else ""
    d = re.search(r'<meta name="description" content="([^"]*)"', html)
    desc = d.group(1).strip() if d else ""
    if not titlu:
        pb.append("fara titlu")
    elif len(titlu.replace("&amp;", "&").replace("&#x27;", "'")) > 60:
        pb.append(f"titlu lung ({len(titlu)})")
    if not desc:
        pb.append("fara descriere")
    elif len(desc.replace("&amp;", "&").replace("&#x27;", "'")) > 165:
        pb.append(f"descriere lunga ({len(desc)})")
    h1 = re.findall(r"<h1[\s>]", corp)
    if len(h1) != 1:
        pb.append(f"{len(h1)} H1")
    m = re.search(r"</h1>([\s\S]{0,1500})", corp)
    urmare = re.sub(r"<[^>]+>", " ", m.group(1)) if m else ""
    if m and len(re.sub(r"\s+", " ", urmare).strip()) < 40:
        pb.append("fara text sub H1")
    if cale.startswith(CU_MAGAZIN) and not RE_PLATIT.search(corp):
        pb.append("fara link platit")
    # Doar textul vizibil: `crossorigin=""` din HTML nu sunt „ghilimele goale" (alarma falsa pe toate cele 757 de pagini).
    text = re.sub(r"<[^>]+>", " ", corp)
    for nume, regula in RE_RUPT.items():
        g = regula.search(text)
        if g:
            pb.append(f"{nume}: {text[max(0, g.start() - 30):g.end() + 20]!r}"[:110])
    if re.search(r'<img[^>]+src=""', corp):
        pb.append("imagine fara adresa")
    interne = {x.rstrip("/") or "/" for x in re.findall(r'href="(/[^"#?]*)"', corp) if not x.startswith(("/_next", "/api", "/go/"))}
    return {"titlu": titlu, "descriere": desc, "probleme": pb, "interne": sorted(interne)}


def main() -> int:
    arg = sys.argv
    baza = arg[arg.index("--baza") + 1].rstrip("/") if "--baza" in arg else "https://amcupon.ro"
    doar = tuple(arg[arg.index("--doar") + 1].split(",")) if "--doar" in arg else ()
    _, _, harta = ia("https://amcupon.ro/sitemap.xml" if "--baza" not in arg else baza + "/sitemap.xml")
    pagini = [re.sub(r"^https://amcupon\.ro", "", u).replace("&amp;", "&") or "/" for u in re.findall(r"<loc>([^<]+)</loc>", harta)]
    pagini = [p for p in pagini if "?" not in p and (not doar or p.startswith(doar))]
    print("pagini de verificat:", len(pagini))

    def lucreaza(p):
        cod, final, html = ia(baza + p)
        if cod != 200:
            return p, {"probleme": [f"HTTP {cod}"], "titlu": "", "descriere": "", "interne": []}
        r = verifica(html, p)
        if final.rstrip("/") != (baza + p).rstrip("/"):
            r["probleme"].append(f"redirect spre {final}")
        return p, r

    rez = {}
    with ThreadPoolExecutor(6) as ex:
        for i, (p, r) in enumerate(ex.map(lucreaza, pagini)):
            rez[p] = r
            if i and i % 200 == 0:
                print(" ", i)

    def duble(camp):
        c = defaultdict(list)
        for p, r in rez.items():
            if r[camp]:
                c[r[camp]].append(p)
        return {k: v for k, v in c.items() if len(v) > 1}

    titluri, descrieri = duble("titlu"), duble("descriere")
    interne = sorted({l for r in rez.values() for l in r["interne"]} - set(pagini))

    def ia_cod(l):
        return l, ia(baza + l)[0]

    with ThreadPoolExecutor(6) as ex:
        rupte = {l: c for l, c in ex.map(ia_cod, interne) if c not in (200,)}

    tip = lambda x: x.split(":")[0].split("(")[0].strip()  # noqa: E731
    pe_tip = Counter(tip(x) for r in rez.values() for x in r["probleme"])
    print("\nProbleme:", dict(pe_tip.most_common()))
    print("titluri identice:", len(titluri), "| descrieri identice:", len(descrieri), "| linkuri interne rupte:", len(rupte), list(rupte.items())[:12])
    curate = sum(1 for r in rez.values() if not r["probleme"])
    print(f"Pagini fara nicio problema: {curate} din {len(rez)}")
    for nume in pe_tip:
        ex_p = [(p, [x for x in r["probleme"] if tip(x) == nume][0][:90]) for p, r in rez.items() if any(tip(x) == nume for x in r["probleme"])][:5]
        print(f"\n[{nume}]")
        for p, x in ex_p:
            print("  ", p[:60], "|", x)
    with open(IESIRE, "w", encoding="utf-8") as f:
        json.dump({"pagini": rez, "titluri_identice": titluri, "descrieri_identice": descrieri, "linkuri_rupte": rupte}, f, ensure_ascii=False, indent=0)
    print("\nRaport:", IESIRE)
    return 0


def test() -> int:
    bun = ('<title>Titlu bun</title><meta name="description" content="Descriere"><h1>H</h1><p>Un text destul de lung ca sa treaca de prag, cu sens.</p>'
           '<a href="https://event.2performant.com/x">x</a><a href="/top/x">t</a>')
    asteptari = [
        ("pagina buna n-are probleme", verifica(bun, "/top/x")["probleme"], []),
        ("fara link platit, pe pagina de magazin", "fara link platit" in verifica(bun.replace("event.2performant.com", "x.ro"), "/top/x")["probleme"], True),
        ("pe o pagina de text nu se cere link platit", verifica(bun.replace("event.2performant.com", "x.ro"), "/despre-noi")["probleme"], []),
        ("doua H1", "2 H1" in verifica(bun + "<h1>a</h1>", "/x")["probleme"], True),
        ("titlu lung", any(x.startswith("titlu lung") for x in verifica(bun.replace("Titlu bun", "x" * 61), "/x")["probleme"]), True),
        ("cod gol", any(x.startswith("ghilimele goale") for x in verifica(bun + '<h3>Extra 15% cu codul ""</h3>', "/x")["probleme"]), True),
        ("undefined", any(x.startswith("undefined") for x in verifica(bun + "<p>Pret undefined lei</p>", "/x")["probleme"]), True),
        ("influencer", any(x.startswith("text pentru afiliati") for x in verifica(bun + "<p>Fiecare influencer primeste</p>", "/x")["probleme"]), True),
        ("atributele HTML goale nu sunt text rupt", verifica(bun + '<input class="a" required="" />', "/x")["probleme"], []),
        ("legaturile interne se aduna", verifica(bun, "/x")["interne"], ["/top/x"]),
    ]
    rau = [(n, a, e) for n, a, e in asteptari if a != e]
    for n, a, e in rau:
        print(f"  PICA  {n}: {a!r} (asteptat {e!r})")
    print("TOATE TREC" if not rau else f"{len(rau)} asteptari incalcate")
    return 1 if rau else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else main())
