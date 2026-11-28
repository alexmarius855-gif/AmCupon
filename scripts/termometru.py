"""
termometru.py — datele termometrului de pret pentru noul site (25.11.2026).

DE CE: noul site („Pretul adevarat”, docs/design/PROMPT-SITE-NOU.md) arata langa produse o bara cu minimul si
maximul din ultimele 30 de zile si pretul de azi. Istoricul (data/istoric-preturi.json) sta in afara folderului
frontend, iar tabelele Supabase de pret sunt goale (0 randuri pe 25.11), deci site-ul are nevoie de un fisier
public mic, facut aici, la fiecare rulare, din aceleasi definitii ca /reduceri-reale (`istoric_preturi.py`):
minimul = cel mai mic pret din cele 30 de zile dinaintea zilei de azi, inclusiv pretul valabil la inceputul
ferestrei; acoperirea = zile de la prima observatie.

VARIANTA: cheia istoricului taie parametrii adresei, deci variantele aceluiasi produs (15 ml si 50 ml, sac de
7 kg si de 12 kg, `?skuId=`) pot ajunge pe aceeasi cheie. Pe 24.11, doua din primele trei „scaderi” de pe
/reduceri-reale erau probabil asa: o mostra Kiehl's de 15 ml (200 -> 95 lei) si un sac Husse la exact jumatate.
Semnul `varianta` = adresa are parametri de varianta, imaginea sau adresa spun mostra/tester, sau ultimul salt
e exact jumatate/dublu ori peste de 3 ori. Cu el, site-ul arata bara, dar NU spune „reducere reala”.

ISTORICUL /alege (28.11.2026): produsele de pe /alege vin din cautarea in feed-urile 2Performant, nu din
products.json, deci istoricul general le avea pe 2 din 39 (24.11). Aici se pastreaza separat, in
data/istoric-alege.json, DOAR preturile confirmate pe pagina magazinului, cu ziua confirmarii (`verificat`), nu
ziua rularii: un pret confirmat acum doua zile nu e „pretul de azi". Cheia e adresa INTREAGA (cu `?skuId=`), ca
variantele sa nu se amestece. Fisier separat ca sa nu schimbe cifrele de ansamblu de pe /reduceri-reale si din
studiul Black Friday, care numara istoricul general.

INTRARE:  data/istoric-preturi.json, data/criterii-stare.json (toti candidatii /alege, pentru istoric),
          frontend/public/criterii.json (produsele publicate pe /alege),
          frontend/public/scaderi-pret.json (/reduceri-reale), frontend/public/products.json (adresa originala).
IESIRE:   frontend/public/termometru.json — {"produse": {<adresa exact ca in fisierul paginii>: {...}}}.
          Cheia e sirul din fisierul paginii (url_magazin la /alege, url la /reduceri-reale), ca site-ul sa nu
          refaca hash-ul (URL() din JavaScript codifica altfel caracterele ne-ASCII decat urlsplit din Python).
          data/istoric-alege.json — istoricul preturilor confirmate pe /alege (intrare si iesire).

Rulare:  python termometru.py          # scrie fisierul
         python termometru.py --test   # verificari care trebuie sa poata pica
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone
from urllib.parse import parse_qs, urlsplit

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from istoric_preturi import ACOPERIRE_MIN, FEREASTRA, ISTORIC, cheie  # noqa: E402  (aceleasi definitii)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "frontend", "public")
CRITERII = os.path.join(PUBLIC, "criterii.json")
SCADERI = os.path.join(PUBLIC, "scaderi-pret.json")
PRODUSE = os.path.join(PUBLIC, "products.json")
IESIRE = os.path.join(PUBLIC, "termometru.json")
STARE_ALEGE = os.path.join(ROOT, "data", "criterii-stare.json")
ISTORIC_ALEGE = os.path.join(ROOT, "data", "istoric-alege.json")
PASTRARE_ALEGE = 120  # zile fara nicio confirmare dupa care un produs iese din istoricul /alege

SERIE_ZILE = 45  # cat istoric trimitem pentru linia mica de pe bon (doar schimbarile)
RAPORT_ABSURD = 3.0
PARAM_VARIANTA = re.compile(r"^(dwvar_.*|size|sku|skuid|variant|variantid|variation|color|colour|culoare|marime|"
                            r"m[aă]rime|gramaj|greutate|volum|capacitate|ml|kg|weight|option.*|attribute.*)$", re.I)
SEMN_MOSTRA = re.compile(r"(?<![a-z])(sample|samples|mostra|mostr[aă]|tester|dlx-sample|travel-size|mini-size)(?![a-z])", re.I)


def azi_ro() -> str:
    return datetime.now(timezone.utc).astimezone().date().isoformat()


def adresa_originala(url: str, harta: dict[str, str]) -> str:
    """Adresa produsului la magazin: din products.json sau, la nevoie, din linkul de afiliere."""
    if not url:
        return ""
    if url in harta:
        return harta[url]
    q = parse_qs(urlsplit(url).query)
    for camp in ("redirect_to", "u", "url", "murl"):
        if q.get(camp):
            return q[camp][0]
    return url


def are_parametri_varianta(url_original: str) -> bool:
    q = parse_qs(urlsplit(url_original).query, keep_blank_values=True)
    return any(PARAM_VARIANTA.match(k) for k in q)


def salt_suspect(puncte: list) -> bool:
    """Ultima schimbare de pret: exact jumatate sau dublu (alta marime), ori peste x3 / sub /3."""
    if len(puncte) < 2:
        return False
    vechi, nou = float(puncte[-2][1]), float(puncte[-1][1])
    if vechi <= 0 or nou <= 0:
        return False
    r = nou / vechi
    return abs(r - 0.5) < 0.005 or abs(r - 2.0) < 0.01 or r > RAPORT_ABSURD or r < 1 / RAPORT_ABSURD


def fereastra(e: dict, azi: str) -> tuple[float | None, float | None, int, list]:
    """(min, max in cele 30 de zile dinainte de azi, acoperire in zile, seria pentru desen)."""
    zi_azi = date.fromisoformat(azi)
    start = (zi_azi - timedelta(days=FEREASTRA)).isoformat()
    start_serie = (zi_azi - timedelta(days=SERIE_ZILE)).isoformat()
    puncte = e.get("p") or []
    if not puncte:
        return None, None, 0, []
    acoperire = (zi_azi - date.fromisoformat(puncte[0][0])).days
    in_fereastra = [pr for zi, pr in puncte if start <= zi < azi]
    inainte = [pr for zi, pr in puncte if zi < start]
    candidati = in_fereastra + (inainte[-1:] if inainte else [])
    if not candidati:
        return None, None, acoperire, []
    serie_inainte = [p for p in puncte if p[0] < start_serie][-1:]
    serie = serie_inainte + [p for p in puncte if p[0] >= start_serie]
    return min(candidati), max(candidati), acoperire, [[zi, round(float(pr), 2)] for zi, pr in serie]


def cheie_alege(url: str) -> str:
    """Adresa intreaga, cu parametri (fara fragment): `?skuId=1` si `?skuId=2` raman produse diferite."""
    s = urlsplit((url or "").strip())
    if not s.netloc:
        return ""
    baza = f"{s.netloc.lower()}{s.path.rstrip('/')}" + (f"?{s.query}" if s.query else "")
    return hashlib.sha1(baza.encode("utf-8")).hexdigest()[:16]


def inregistreaza_alege(istoric: dict, stare: dict, azi: str) -> int:
    """Adauga preturile confirmate pe pagina magazinului, la ZIUA CONFIRMARII. Intoarce cate puncte noi au intrat."""
    noi = 0
    for c in stare.get("criterii") or []:
        for p in c.get("produse") or []:
            zi = (p.get("verificat") or "")[:10]
            k = cheie_alege(p.get("url_magazin") or "")
            try:
                v = round(float(p.get("pret")), 2)
            except (TypeError, ValueError):
                continue
            if not k or len(zi) != 10 or zi > azi or v <= 0:
                continue
            e = istoric.setdefault(k, {"p": [], "v": zi})
            e["v"] = max(e.get("v") or "", zi)
            puncte = e["p"]
            if puncte and zi < puncte[-1][0]:
                continue  # confirmare mai veche decat ultima pastrata: nu rescriem trecutul
            if puncte and puncte[-1][0] == zi:
                puncte[-1][1] = min(puncte[-1][1], v)  # acelasi produs pe doua pagini /alege, in aceeasi zi
                continue
            if not puncte or puncte[-1][1] != v:
                puncte.append([zi, v])
                noi += 1
    limita = (date.fromisoformat(azi) - timedelta(days=PASTRARE_ALEGE)).isoformat()
    for k in [k for k, e in istoric.items() if (e.get("v") or "") < limita]:
        del istoric[k]
    return noi


def din_inregistrare(rec: dict, url_original: str, azi: str, extra_text: str = "",
                     cheie_cu_parametri: bool = False) -> dict | None:
    """`cheie_cu_parametri`: istoricul /alege pastreaza adresa intreaga, deci acolo un `?skuId=` nu amesteca
    variante si nu e motiv de tacere; in istoricul general (cheia fara parametri) este."""
    mn, mx, acop, serie = fereastra(rec, azi)
    if mn is None:
        return None
    varianta = ((not cheie_cu_parametri and are_parametri_varianta(url_original)) or bool(SEMN_MOSTRA.search(url_original))
                or bool(SEMN_MOSTRA.search(extra_text or "")) or salt_suspect(rec.get("p") or []))
    return {"min": round(float(mn), 2), "max": round(float(mx), 2), "acop": acop, "serie": serie, "varianta": varianta}


def intrare(url_pagina: str, url_original: str, istoric: dict, azi: str, extra_text: str = "",
            istoric_alege: dict | None = None) -> dict | None:
    """Termometrul unui produs. Pe /alege, intai preturile confirmate la magazin (istoricul /alege), daca acopera
    destule zile: pretul de azi de pe pagina e tot unul confirmat, deci comparam aceeasi sursa. Altfel, istoricul
    general (preturile din feed), cu acoperirea cea mai lunga."""
    alege = None
    if istoric_alege is not None:
        rec = istoric_alege.get(cheie_alege(url_original))
        alege = din_inregistrare(rec, url_original, azi, extra_text, cheie_cu_parametri=True) if rec else None
        if alege and alege["acop"] >= ACOPERIRE_MIN:
            return alege
    k = cheie({"url_original": url_original})
    general = din_inregistrare(istoric[k], url_original, azi, extra_text) if k and k in istoric else None
    candidati = [x for x in (alege, general) if x]
    return max(candidati, key=lambda x: x["acop"]) if candidati else None


def construieste(istoric: dict, criterii: dict, scaderi: dict, produse: list, azi: str,
                 istoric_alege: dict | None = None) -> dict:
    harta = {p.get("url"): p.get("url_original") for p in produse if p.get("url") and p.get("url_original")}
    out: dict[str, dict] = {}
    for c in criterii.get("criterii") or []:
        for p in c.get("produse") or []:
            u = p.get("url_magazin") or ""
            if u and u not in out:
                e = intrare(u, u, istoric, azi, p.get("imagine") or "", istoric_alege or {})
                if e:
                    out[u] = e
    for s in scaderi.get("produse") or []:
        u = s.get("url") or ""
        if u and u not in out:
            e = intrare(u, adresa_originala(u, harta), istoric, azi, s.get("image") or "")
            if e:
                out[u] = e
    return {"actualizat": azi, "fereastra_zile": FEREASTRA, "acoperire_min_zile": ACOPERIRE_MIN, "produse": out}


def citeste(cale: str, implicit):
    try:
        with open(cale, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return implicit


def main() -> int:
    brut = citeste(ISTORIC, {}) or {}
    # Ziua de referinta e cea a istoricului, nu ceasul: altfel, pe datele de ieri, pretul de ieri ar intra in
    # „minimul din 30 de zile” si o scadere reala n-ar mai parea sub minim (gasit pe 25.11, pe datele din 24.11).
    azi = brut.get("actualizat") or azi_ro()
    istoric = brut.get("produse") or {}
    produse = (citeste(PRODUSE, {}) or {}).get("products") or []

    # Istoricul /alege: intrare si iesire. Fara fisierul de stare (rulare locala partiala) ramane neatins.
    alege_brut = citeste(ISTORIC_ALEGE, {}) or {}
    istoric_alege = alege_brut.get("produse") or {}
    stare = citeste(STARE_ALEGE, None)
    if stare:
        noi = inregistreaza_alege(istoric_alege, stare, azi)
        with open(ISTORIC_ALEGE, "w", encoding="utf-8") as f:
            json.dump({"actualizat": azi, "produse": istoric_alege}, f, ensure_ascii=False, separators=(",", ":"))
        print(f"Istoric /alege: {len(istoric_alege)} produse, {noi} preturi confirmate noi -> {os.path.relpath(ISTORIC_ALEGE, ROOT)}")

    rez = construieste(istoric, citeste(CRITERII, {}), citeste(SCADERI, {}), produse, azi, istoric_alege)
    with open(IESIRE, "w", encoding="utf-8") as f:
        json.dump(rez, f, ensure_ascii=False, separators=(",", ":"))
    n = len(rez["produse"])
    suspecte = sum(1 for e in rez["produse"].values() if e["varianta"])
    print(f"Termometru: {n} produse cu istoric (din care {suspecte} cu varianta neclara) -> {os.path.relpath(IESIRE, ROOT)}")
    return 0


def test() -> int:
    """Cazurile reale din 24.11.2026; fiecare verificare trebuie sa pice daca scoti regula ei."""
    gresite = 0

    def verifica(nume: str, cond: bool) -> None:
        nonlocal gresite
        print(("OK   " if cond else "PICA ") + nume)
        gresite += 0 if cond else 1

    azi = "2026-11-24"
    istoric = {}

    def adauga(url: str, puncte: list) -> None:
        istoric[cheie({"url_original": url})] = {"p": puncte, "v": azi}

    saltea = "https://somnart.ro/produs/saltea-cu-memorie-somnart-aloe-vera-140x200"
    adauga(saltea, [["2026-10-08", 947.65], ["2026-11-24", 771.18]])
    ser = "https://www.kiehls.ro/better-screen-uv-serum/WW0269KIE.html?dwvar_WW0269KIE_size=15%20ml"
    adauga(ser, [["2026-10-07", 200.0], ["2026-11-24", 95.0]])
    sac = "https://www.husse.ro/hypoallergenic-flexcare-puppy/81123411/"
    adauga(sac, [["2026-10-07", 569.5], ["2026-11-24", 284.75]])
    monitor = "https://www.dacris.net/gs27fc-gigabyte/p?skuId=222197"
    adauga(monitor, [["2026-10-20", 699.0], ["2026-11-10", 658.54]])
    nou = "https://exemplu.ro/produs-nou"
    adauga(nou, [["2026-11-20", 100.0]])

    e = intrare(saltea, saltea, istoric, azi)
    verifica("saltea: minimul din 30 de zile e 947,65 (pretul de la inceputul ferestrei)", e is not None and e["min"] == 947.65)
    verifica("saltea: ziua de azi NU intra in minim (altfel o scadere de azi n-ar fi niciodata sub minim)", e is not None and e["min"] > 771.18)
    verifica("saltea: acoperire 47 de zile", e is not None and e["acop"] == 47)
    verifica("saltea: varianta clara (fara parametri, salt de -18,6%)", e is not None and e["varianta"] is False)
    verifica("saltea: seria incepe cu pretul valabil la inceputul ei", e is not None and e["serie"][0] == ["2026-10-08", 947.65])

    e = intrare(ser, ser, istoric, azi, "kiehls-sun-2026-better-screen-uv-serum-spf50-15ml-dlx-sample-front.webp")
    verifica("ser 15 ml: varianta neclara (parametru dwvar_..._size)", e is not None and e["varianta"] is True)
    verifica("ser: mostra recunoscuta si fara parametru (doar din imagine)", SEMN_MOSTRA.search("kiehls-...-15ml-dlx-sample-front.webp") is not None)
    verifica("cuvant obisnuit care contine „sample” nu e mostra (samplers)", SEMN_MOSTRA.search("set-samplers-pentru-cafea") is None)

    e = intrare(sac, sac, istoric, azi)
    verifica("sac Husse: exact jumatate de pret = varianta neclara", e is not None and e["varianta"] is True)

    e = intrare(monitor, monitor, istoric, azi)
    verifica("monitor cu ?skuId=: varianta neclara (parametrul de varianta)", e is not None and e["varianta"] is True)

    verifica("produs urmarit de 4 zile: intrarea exista, dar acoperirea e sub prag", (intrare(nou, nou, istoric, azi) or {}).get("acop", 99) < ACOPERIRE_MIN)
    verifica("produs fara istoric: nicio intrare", intrare("https://exemplu.ro/necunoscut", "https://exemplu.ro/necunoscut", istoric, azi) is None)

    link_2p = "https://event.2performant.com/events/click?ad_type=quicklink&redirect_to=https%3A%2F%2Fsomnart.ro%2Fprodus%2Fsaltea-cu-memorie-somnart-aloe-vera-140x200"
    verifica("adresa originala scoasa din linkul 2Performant (redirect_to)", adresa_originala(link_2p, {}) == saltea)

    rez = construieste(istoric, {"criterii": [{"produse": [{"url_magazin": monitor, "imagine": ""}]}]},
                       {"produse": [{"url": link_2p, "image": ""}]}, [], azi)
    verifica("fisierul are cheile exact ca in paginile site-ului", set(rez["produse"]) == {monitor, link_2p})

    # Istoricul /alege (28.11.2026): preturi confirmate la magazin, la ziua confirmarii.
    gs1 = "https://www.dacris.net/gs27fc-gigabyte/p?skuId=1"
    gs2 = "https://www.dacris.net/gs27fc-gigabyte/p?skuId=2"
    ia: dict = {}
    stare = {"criterii": [
        {"produse": [{"url_magazin": gs1, "pret": "700", "verificat": "2026-10-20"},
                     {"url_magazin": gs2, "pret": "900", "verificat": "2026-10-20"}]},
    ]}
    inregistreaza_alege(ia, stare, "2026-10-22")
    verifica("/alege: pretul intra cu ziua confirmarii, nu cu ziua rularii", ia.get(cheie_alege(gs1), {}).get("p") == [["2026-10-20", 700.0]])
    verifica("/alege: ?skuId=1 si ?skuId=2 sunt chei diferite (variantele nu se amesteca)", cheie_alege(gs1) != cheie_alege(gs2) and len(ia) == 2)
    inregistreaza_alege(ia, {"criterii": [{"produse": [{"url_magazin": gs1, "pret": "650", "verificat": "2026-10-15"}]}]}, "2026-10-22")
    verifica("/alege: o confirmare mai veche decat ultima nu rescrie istoricul", ia[cheie_alege(gs1)]["p"] == [["2026-10-20", 700.0]])
    inregistreaza_alege(ia, {"criterii": [{"produse": [{"url_magazin": gs1, "pret": "600", "verificat": "2026-11-30"}]}]}, "2026-11-24")
    verifica("/alege: o confirmare datata dupa ziua datelor nu intra", ia[cheie_alege(gs1)]["p"] == [["2026-10-20", 700.0]])
    inregistreaza_alege(ia, {"criterii": [{"produse": [{"url_magazin": gs1, "pret": "560", "verificat": "2026-11-24"}]}]}, "2026-11-24")
    e = intrare(gs1, gs1, {}, azi, "", ia)
    verifica("/alege: termometrul vine din preturile confirmate (min 700, acoperire 35 de zile)", e is not None and e["min"] == 700.0 and e["acop"] == 35)
    verifica("/alege: ?skuId= nu e motiv de tacere cand cheia pastreaza parametrii", e is not None and e["varianta"] is False)
    gen = {cheie({"url_original": gs1}): {"p": [["2026-09-01", 300.0]], "v": azi}}
    e = intrare(gs1, gs1, gen, azi, "", ia)
    verifica("/alege: cu acoperire destula, istoricul confirmat bate feed-ul (alta sursa de pret)", e is not None and e["min"] == 700.0)
    vechi = {"x": {"p": [["2026-06-01", 10.0]], "v": "2026-06-01"}}
    inregistreaza_alege(vechi, {"criterii": []}, "2026-11-24")
    verifica("/alege: produsele neconfirmate de peste 120 de zile ies din istoric", "x" not in vechi)
    print(f"\n{gresite} verificari picate" if gresite else "\nToate verificarile au trecut")
    return 1 if gresite else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else main())
