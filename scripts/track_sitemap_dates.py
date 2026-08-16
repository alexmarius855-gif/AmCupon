#!/usr/bin/env python3
"""
Calculeaza `lastModified` REAL pentru fiecare URL din sitemap.

Problema (documentata din 10.08.2026, nereparata pana acum): `sitemap.ts` avea
`lastModified: new Date()` in 120 de locuri. Pipeline-ul ruleaza la 4h, deci
Google primea "toate cele ~425 de URL-uri s-au modificat acum", de 6 ori pe zi,
la infinit. Cand totul pare mereu proaspat, nimic nu mai pare proaspat: semnalul
devine zgomot si crawlerul il ignora — exact pe un domeniu cu autoritate mica,
unde bugetul de crawl e mic si conteaza sa-l cheltui pe paginile chiar schimbate.

De ce NU `ultima_verificare`: `merge_platforms.py` il seteaza la data de azi pe
TOATE magazinele, la fiecare rulare. E "sistemul a confirmat inregistrarea azi",
nu "continutul s-a schimbat" — ar fi acelasi `new Date()` cu alt nume.

Ce face in schimb:
  * pagini de DATE (magazin, categorie, top) — AMPRENTA de continut. Se retine
    amprenta + data la care s-a schimbat ultima oara (`data/sitemap_fingerprints.json`).
    Data se muta DOAR cand amprenta difera. O promotie noua la drmax.ro muta data
    lui drmax.ro; celelalte 1161 raman unde erau.
  * articole de blog — `date` din blog-posts.json (data reala de publicare).
  * pagini STATICE — data ultimului commit git pe fisierul sursa. E istoric real,
    disponibil din prima rulare, nu trebuie asteptata o schimbare viitoare.

Prima rulare: paginile de date primesc data de azi (nu stim cand s-au schimbat
inainte — a le inventa o data din trecut ar fi fabricatie). De la a doua rulare
incolo semnalul e real.

    python scripts/track_sitemap_dates.py
"""
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

RADACINA = Path(__file__).parent.parent
PUBLIC = RADACINA / "frontend" / "public"
APP = RADACINA / "frontend" / "app"
AMPRENTE = RADACINA / "data" / "sitemap_fingerprints.json"
IESIRE = PUBLIC / "sitemap-dates.json"

AZI = datetime.now(timezone.utc).strftime("%Y-%m-%d")


def _json(cale, implicit):
    try:
        return json.loads(Path(cale).read_text(encoding="utf-8"))
    except Exception:
        return implicit


def amprenta(*parti) -> str:
    return hashlib.md5("|".join(str(p) for p in parti).encode("utf-8")).hexdigest()[:16]


def repo_shallow() -> bool:
    """True daca istoricul git e trunchiat (clona de adancime 1).

    CONTEAZA: `actions/checkout` cloneaza implicit cu `fetch-depth: 1`, deci in CI
    `git log -1 -- <fisier>` intoarce mereu SINGURUL commit disponibil — adica data
    ultimei rulari de pipeline, identica pentru toate paginile. Adica exact bug-ul
    pe care scriptul asta il repara, reintrodus pe usa din dos si complet tacut.
    Cand istoricul lipseste, pastram datele calculate anterior (local, cu istoric
    complet) in loc sa le suprascriem cu o valoare inventata.
    """
    try:
        r = subprocess.run(["git", "rev-parse", "--is-shallow-repository"],
                           cwd=RADACINA, capture_output=True, text=True, timeout=20)
        return (r.stdout or "").strip() == "true"
    except Exception:
        return True   # in dubiu, nu strica datele bune


def data_git(fisier: Path):
    """Data ultimului commit care a atins fisierul (YYYY-MM-DD), sau None."""
    if not fisier.exists():
        return None
    try:
        r = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", str(fisier.relative_to(RADACINA))],
            cwd=RADACINA, capture_output=True, text=True, timeout=20,
        )
        d = (r.stdout or "").strip()
        return d if len(d) == 10 else None
    except Exception:
        return None


def main():
    magazine = _json(PUBLIC / "output.json", [])
    produse_raw = _json(PUBLIC / "products.json", {})
    produse = produse_raw.get("products", produse_raw) if isinstance(produse_raw, dict) else produse_raw
    articole = _json(PUBLIC / "blog-posts.json", [])

    # cate produse are fiecare magazin — intra in amprenta paginii de magazin,
    # pentru ca tab-ul de produse e continut vizibil, nu doar promotiile
    produse_pe_magazin = {}
    for p in produse or []:
        s = (p.get("merchant_slug") or p.get("magazin") or "").lower()
        if s:
            produse_pe_magazin[s] = produse_pe_magazin.get(s, 0) + 1

    amprente_noi = {}

    # ── pagini de magazin ────────────────────────────────────────────────────
    for m in magazine:
        slug = m.get("magazin")
        if not slug:
            continue
        promo = sorted(
            f"{p.get('nume','')}~{p.get('cod_cupon','')}~{p.get('landing_page','')}"
            for p in (m.get("promotii") or [])
        )
        amprente_noi[f"/cod-reducere/{slug}"] = amprenta(
            *promo, produse_pe_magazin.get(slug.lower(), 0), m.get("categorie_slug", "")
        )

    # ── pagini de categorie ──────────────────────────────────────────────────
    pe_categorie = {}
    for m in magazine:
        c = m.get("categorie_slug")
        if c:
            pe_categorie.setdefault(c, []).append(m.get("magazin", ""))
    for c, mm in pe_categorie.items():
        amprente_noi[f"/categorii/{c}"] = amprenta(*sorted(mm))

    # ── pagini "top produse" ─────────────────────────────────────────────────
    top = _json(PUBLIC / "top-produse.json", {})
    for cat in (top.get("categorii") or []):
        s = cat.get("slug")
        if not s:
            continue
        prod = sorted(f"{p.get('nume','')}~{p.get('pret','')}" for p in (cat.get("produse") or []))
        amprente_noi[f"/top/{s}"] = amprenta(*prod)

    # ── stare persistata: data se muta DOAR cand amprenta s-a schimbat ───────
    vechi = _json(AMPRENTE, {})
    stare, mutate = {}, 0
    for url, fp in amprente_noi.items():
        anterior = vechi.get(url)
        if isinstance(anterior, dict) and anterior.get("fp") == fp:
            stare[url] = anterior           # neschimbat -> pastreaza data veche
        else:
            stare[url] = {"fp": fp, "data": AZI}
            if anterior:
                mutate += 1
    AMPRENTE.parent.mkdir(parents=True, exist_ok=True)
    AMPRENTE.write_text(json.dumps(stare, ensure_ascii=False, indent=1), encoding="utf-8")

    date_url = {u: v["data"] for u, v in stare.items()}

    # ── articole de blog: data reala de publicare ────────────────────────────
    n_blog = 0
    for a in articole or []:
        s, d = a.get("slug"), (a.get("date") or "")[:10]
        if s and len(d) == 10:
            date_url[f"/blog/{s}"] = d
            n_blog += 1

    # ── pagini statice: data ultimului commit pe fisierul sursa ──────────────
    # Fara istoric complet (CI), pastram ce s-a calculat la o rulare anterioara.
    anterioare = _json(IESIRE, {})
    shallow = repo_shallow()
    n_static = n_pastrate = 0
    if shallow:
        for url, d in anterioare.items():
            if url not in date_url:
                date_url[url] = d
                n_pastrate += 1
    for pagina in ([] if shallow else APP.rglob("page.tsx")):
        rel = pagina.parent.relative_to(APP).as_posix()
        if "[" in rel or rel.startswith(("api", "admin")):
            continue                        # rute dinamice / private
        url = "/" if rel == "." else f"/{rel}"
        d = data_git(pagina)
        if d:
            date_url[url] = d
            n_static += 1

    IESIRE.write_text(json.dumps(date_url, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")

    print(f"sitemap-dates.json: {len(date_url)} URL-uri")
    print(f"  {len(amprente_noi):5d} pagini de date (amprenta)  — {mutate} cu continut schimbat la aceasta rulare")
    print(f"  {n_blog:5d} articole de blog (data reala de publicare)")
    if shallow:
        print(f"  {n_pastrate:5d} pagini statice — istoric git trunchiat (clona shallow), "
              f"pastrate datele de la rularea anterioara")
    else:
        print(f"  {n_static:5d} pagini statice (data ultimului commit git)")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
