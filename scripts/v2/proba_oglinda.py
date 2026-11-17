"""
proba_oglinda.py — verifica puntea v2 (baza copiaza ce publica site-ul azi) si o compara cu fisierele.

Puntea ruleaza IN Supabase (ops.mirror_merchants / ops.mirror_products, chemate de pg_cron dupa ce
pg_net descarca fisierele publice). Scriptul cheama aceleasi functii pe un Postgres de proba, cu
fisierele din frontend/public, de doua ori, si verifica:
  1. paritatea: magazine, oferte, coduri, produse, pagini indexabile = ce calculeaza site-ul de azi;
  2. a doua rulare nu schimba nimic (nici date, nici cereri de reimprospatare, nici updated_at).

Tot el scrie SQL-ul pentru ce s-a pus de mana pe site (numele reale din NUME_OVERRIDE si magazinele cu
cerere masurata din BRANDURI_CU_CERERE): baza devine sursa lor.

Rulare:
  python scripts/v2/proba_oglinda.py --db "postgresql://postgres@/proba?host=/var/lib/postgresql/amc-proba&port=54329"
  python scripts/v2/proba_oglinda.py --db ... --descarcare   # plus descarcarea, cu pg_net simulat
  python scripts/v2/proba_oglinda.py --sql-manual        # doar SQL-ul pus de mana, pentru Supabase
Iese cu 1 daca paritatea sau a doua rulare nu ies cum trebuie.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys

RADACINA = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PUBLIC = os.path.join(RADACINA, "frontend", "public")
sys.path.insert(0, os.path.join(RADACINA, "scripts"))

SLUG = re.compile(r"^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$")
PARE_COD = re.compile(r"^[A-Z0-9][A-Z0-9_-]{3,29}$")


def citeste(nume: str):
    with open(os.path.join(PUBLIC, nume), encoding="utf-8") as f:
        return json.load(f)


def branduri_cu_cerere() -> list[str]:
    with open(os.path.join(RADACINA, "frontend", "lib", "seoIndexable.ts"), encoding="utf-8") as f:
        sursa = f.read()
    bloc = re.search(r"BRANDURI_CU_CERERE = new Set<string>\(\[(.*?)\]\);", sursa, re.S)
    if not bloc:
        raise RuntimeError("nu gasesc BRANDURI_CU_CERERE in lib/seoIndexable.ts")
    fara_comentarii = re.sub(r"//[^\n]*", "", bloc.group(1))
    return re.findall(r'"([a-z0-9.-]+)"', fara_comentarii)


def sql_manual() -> str:
    """Numele reale si magazinele cu cerere masurata: azi in TS, de acum in baza."""
    from nume_magazin import NUME_OVERRIDE  # citeste constantele din lib/numeMagazin.ts

    def q(s: str) -> str:
        return "'" + s.replace("'", "''") + "'"

    linii = ["-- Pus de mana pe site (lib/numeMagazin.ts, lib/seoIndexable.ts), mutat in baza."]
    for slug, nume in sorted(NUME_OVERRIDE.items()):
        linii.append(f"update core.merchants set name = {q(nume)}, name_source = 'manual' where slug = {q(slug)};")
    branduri = ", ".join(q(b) for b in branduri_cu_cerere())
    linii.append(f"update core.merchants set seo_force_index = true where slug in ({branduri});")
    return "\n".join(linii) + "\n"


def asteptari(output: list, fara_cupoane: list, fara_livrare: list, produse: list) -> dict:
    """Ce ar trebui sa iasa, calculat din fisiere cu regulile site-ului de azi (nu cu SQL-ul oglinzii)."""
    magazine = [m for m in output if SLUG.match(str(m.get("magazin", "")).lower())
                and m.get("platforma") in ("2performant", "impact", "awin", "cj", "direct")]
    slugs = {m["magazin"].lower() for m in magazine}
    oferte, coduri = set(), set()
    for m in magazine:
        for p in m.get("promotii") or []:
            nume = (p.get("nume") or "").strip() or None
            desc = (p.get("descriere") or "").strip() or None
            cod_brut = (p.get("cod_cupon") or "").strip()
            cod = cod_brut if 3 <= len(cod_brut) <= 30 and not re.search(r"\s", cod_brut) else None
            titlu = desc if desc and (nume is None or nume.upper() == cod_brut.upper() or PARE_COD.match(nume or "")) else nume
            titlu = (titlu or "")[:200]
            if len(titlu) < 3:
                continue
            cheie = hashlib.md5((re.sub(r"\s+", " ", titlu.lower()) + "|" + (cod or "")).encode()).hexdigest()
            oferte.add((m["magazin"].lower(), cheie))
            if cod:
                coduri.add((m["magazin"].lower(), cheie))
    toate_slugurile = slugs | {x["magazin"].lower() for x in fara_cupoane + fara_livrare if SLUG.match(x["magazin"].lower())}
    reale = [p for p in produse if not p.get("is_promo") and isinstance(p.get("price"), (int, float)) and p["price"] >= 1
             and str(p.get("url_original") or "").startswith("http") and len(p.get("title") or "") >= 3
             and str(p.get("merchant_slug", "")).lower() in toate_slugurile]
    produse_unice = {(p["merchant_slug"].lower(), hashlib.md5(p["url_original"].encode()).hexdigest()) for p in reale}
    cu_produse = {s for s, _ in produse_unice}
    cu_oferta = {s for s, _ in oferte}
    branduri = set(branduri_cu_cerere())
    # regula din lib/seoIndexable.ts::esteIndexabil (oferta SAU cerere masurata SAU produse in feed)
    indexabile = {s for s in slugs if s in cu_oferta or s in branduri or s in cu_produse}
    return {"magazine": len(slugs), "oferte": len(oferte), "coduri": len(coduri), "produse": len(produse_unice),
            "indexabile": indexabile, "magazine_cu_link": {m["magazin"].lower() for m in magazine
                                                           if m.get("url_afiliat") and m.get("url_afiliat") != m.get("url")}}


NET_SIMULAT = """
create schema if not exists net;
create table if not exists net._cereri (id bigserial primary key, url text, headers jsonb);
create table if not exists net._http_response (id bigint primary key, status_code integer, content text,
                                               headers jsonb, timed_out boolean, error_msg text);
create or replace function net.http_get(url text, params jsonb default '{}', headers jsonb default '{}',
                                        timeout_milliseconds integer default 5000) returns bigint
  language sql as $$ insert into net._cereri (url, headers) values (url, headers) returning id $$;
"""
FISIER = {"merchants": "output.json", "no_coupons": "magazine-fara-cupoane.json",
          "no_delivery": "magazine-fara-livrare-ro.json", "products": "products.json"}


def proba_descarcare(con) -> list[str]:
    """Traseul pg_net -> mirror_apply, cu un `net` simulat (Postgres-ul de proba nu are pg_net).
    Serverul simulat raspunde ca Vercel: 200 + ETag, 304 la If-None-Match potrivit."""
    probleme = []
    con.execute(NET_SIMULAT)

    def tura(rasp_special: dict | None = None, etag_nou: dict | None = None) -> tuple[dict, dict]:
        con.execute("select ops.mirror_fetch()")
        cereri = con.execute("""select c.id, c.url, c.headers, q.kind from net._cereri c
                                  join ops.mirror_requests q on q.request_id = c.id
                                 where not exists (select 1 from net._http_response r where r.id = c.id)""").fetchall()
        for cid, _url, headers, kind in cereri:
            corp = open(os.path.join(PUBLIC, FISIER[kind]), "rb").read().decode("utf-8")
            etag = (etag_nou or {}).get(kind) or '"' + hashlib.md5(corp.encode()).hexdigest() + '"'
            if rasp_special and kind in rasp_special:
                stare, corp = rasp_special[kind], "<html>eroare</html>"
            elif (headers or {}).get("If-None-Match") == etag:
                stare, corp = 304, ""
            else:
                stare = 200
            con.execute("insert into net._http_response (id, status_code, content, headers) values (%s, %s, %s, %s)",
                        (cid, stare, corp, json.dumps({"etag": etag})))
        rez = con.execute("select ops.mirror_apply()").fetchone()[0]
        stari = dict(con.execute("""select kind, coalesce(status_code::text, '-') || ' ' || outcome from ops.mirror_requests
                                     where id in (select max(id) from ops.mirror_requests group by kind)""").fetchall())
        return rez, stari

    rez, stari = tura()
    print("  tura 1 (prima descarcare):", stari)
    if not (isinstance(rez.get("magazine"), dict) and isinstance(rez.get("produse"), dict)):
        probleme.append(f"tura 1 nu a aplicat: {rez}")
    rez, stari = tura()
    print("  tura 2 (nimic nou pe site):", stari)
    if rez or stari.get("merchants") != "304 neschimbat" or stari.get("products") != "304 neschimbat":
        probleme.append(f"tura 2 trebuia sa fie 304 fara aplicare: {rez} {stari}")
    rez, stari = tura(rasp_special={"no_coupons": 500}, etag_nou={"merchants": '"altul"'})
    print("  tura 3 (output.json nou, lista fara cupoane cazuta):", stari, rez)
    if "neaplicate" not in str(rez.get("magazine")):
        probleme.append(f"tura 3 a aplicat magazinele fara lista de excluderi: {rez}")
    rez, stari = tura(etag_nou={"merchants": '"altul"'})       # pe server e tot fisierul nou din tura 3
    print("  tura 4 (dupa caderea listei, output.json se descarca din nou):", stari)
    if stari.get("merchants") != "200 aplicat":
        probleme.append(f"tura 4 trebuia sa reaplice magazinele: {stari}")
    return probleme


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", help="Postgres de proba, cu schema v2 aplicata")
    ap.add_argument("--sql-manual", action="store_true")
    ap.add_argument("--descarcare", action="store_true",
                    help="si traseul pg_net -> mirror_apply, cu un schema `net` simulat (doar pe Postgres de proba!)")
    a = ap.parse_args()
    if a.sql_manual:
        sys.stdout.write(sql_manual())
        return 0
    if not a.db:
        ap.error("--db lipseste")

    import psycopg
    from psycopg.types.json import Jsonb

    output = citeste("output.json")
    fara_cupoane = citeste("magazine-fara-cupoane.json")
    fara_livrare = citeste("magazine-fara-livrare-ro.json")
    produse_fisier = citeste("products.json")
    asteptat = asteptari(output, fara_cupoane, fara_livrare, produse_fisier["products"])

    probleme: list[str] = []
    with psycopg.connect(a.db, autocommit=True) as con:
        def rul():
            s1 = con.execute("select ops.mirror_merchants(%s, %s, %s)",
                             (Jsonb(output), Jsonb(fara_cupoane), Jsonb(fara_livrare))).fetchone()[0]
            s2 = con.execute("select ops.mirror_products(%s)", (Jsonb(produse_fisier),)).fetchone()[0]
            return s1, s2

        print("Prima rulare:")
        s1, s2 = rul()
        print("  magazine:", json.dumps(s1, ensure_ascii=False))
        print("  produse: ", json.dumps(s2, ensure_ascii=False))
        con.execute(sql_manual())

        r = con.execute("""select (select count(*) from core.merchants m where m.slug = any(%s)),
                                  (select count(*) from site.offers_live),
                                  (select count(*) from site.offers_live where kind = 'code'),
                                  (select count(*) from site.products_published),
                                  (select array_agg(slug order by slug) from site.merchants where indexable)""",
                        (list({m['magazin'].lower() for m in output}),)).fetchone()
        baza = {"magazine": r[0], "oferte": r[1], "coduri": r[2], "produse": r[3], "indexabile": set(r[4] or [])}
        print("\nParitate (fisierele site-ului -> baza):")
        for k in ("magazine", "oferte", "coduri", "produse"):
            ok = asteptat[k] == baza[k]
            print(f"  {k:<11} asteptat {asteptat[k]:>6}  in baza {baza[k]:>6}  {'ok' if ok else 'DIFERIT'}")
            if not ok:
                probleme.append(f"{k}: {asteptat[k]} fata de {baza[k]}")
        lipsa = sorted(asteptat["indexabile"] - baza["indexabile"])
        in_plus = sorted(baza["indexabile"] - asteptat["indexabile"])
        print(f"  indexabile asteptat {len(asteptat['indexabile']):>6}  in baza {len(baza['indexabile']):>6}")
        # Diferenta asteptata: magazinele fara link platit nu au pagina completa in v2 (fara program).
        fara_link = [s for s in lipsa if s not in asteptat["magazine_cu_link"]]
        alte = [s for s in lipsa if s in asteptat["magazine_cu_link"]]
        if fara_link:
            print(f"    {len(fara_link)} indexabile azi, dar fara link platit (v2: pagina informativa): {fara_link[:8]}")
        if alte or in_plus:
            probleme.append(f"indexabile diferite: lipsa {alte[:10]}, in plus {in_plus[:10]}")
            print(f"    DIFERIT: lipsa {alte[:10]}  in plus {in_plus[:10]}")

        # Diferente cunoscute fata de site, scrise pe nume (nu probleme de oglinda):
        oferte_carantina = con.execute("""select merchant_slug, rule, sample from ops.quarantine
                                           where resolved_at is null and entity = 'offer' order by 1""").fetchall()
        for slug, regula, mostra in oferte_carantina:
            print(f"    oferta in carantina: {slug} [{regula}] {mostra[:70]!r}")
        fara_program = con.execute("""select count(*), count(distinct merchant_slug) from ops.quarantine
                                       where resolved_at is null and rule = 'magazin_fara_program'""").fetchone()
        print(f"    produse ale magazinelor fara program aprobat (pe site azi, in v2 nu): "
              f"{fara_program[0]} de la {fara_program[1]} magazine")
        fara_pret = con.execute("""select count(*) from ops.quarantine
                                    where resolved_at is null and rule = 'pret_lipsa'""").fetchone()[0]
        print(f"    produse fara pret (pe site azi cu „Vezi pretul”, in v2 nu): {fara_pret}")

        print("\nA doua rulare, aceleasi fisiere (nu trebuie sa schimbe nimic):")
        carantina_inainte = con.execute("select count(*) from ops.quarantine").fetchone()[0]
        con.execute("update ops.revalidation_queue set processed_at = now() where processed_at is null")
        inainte = con.execute("select max(updated_at) from core.offers").fetchone()[0], \
            con.execute("select max(updated_at) from core.products").fetchone()[0], \
            con.execute("select count(*) from core.price_points").fetchone()[0]
        rul()
        dupa = con.execute("select max(updated_at) from core.offers").fetchone()[0], \
            con.execute("select max(updated_at) from core.products").fetchone()[0], \
            con.execute("select count(*) from core.price_points").fetchone()[0]
        cereri = con.execute("select count(*) from ops.revalidation_queue where processed_at is null").fetchone()[0]
        carantina_dupa = con.execute("select count(*) from ops.quarantine").fetchone()[0]
        print(f"  cereri noi de reimprospatare: {cereri}; updated_at schimbat: {inainte[:2] != dupa[:2]}; "
              f"puncte noi de pret: {dupa[2] - inainte[2]}; randuri noi in carantina: {carantina_dupa - carantina_inainte}")
        if cereri or inainte != dupa or carantina_dupa != carantina_inainte:
            probleme.append("a doua rulare a schimbat ceva")

        carantina = con.execute("select rule, count(*) from ops.quarantine group by 1 order by 2 desc").fetchall()
        print("\nCarantina:", ", ".join(f"{r} {n}" for r, n in carantina) or "nimic")

        if a.descarcare:
            print("\nDescarcarea (pg_net simulat):")
            probleme += proba_descarcare(con)

    print("\n" + ("OK: paritate si idempotenta." if not probleme else "PROBLEME:\n  " + "\n  ".join(probleme)))
    return 1 if probleme else 0


if __name__ == "__main__":
    sys.exit(main())
