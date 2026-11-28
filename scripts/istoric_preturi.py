"""
istoric_preturi.py — istoricul prețurilor produselor din feed-urile partenerilor (date proprii).

DE CE (07.10.2026): afiliatul cu cele mai multe vânzări din 2Performant e un site de istoric de prețuri
(pricealert.ro), ca Keepa / camelcamelcamel. Avem deja ~20.000 de produse din feed-uri, actualizate de
câteva ori pe zi, dar nu le păstram prețul de ieri. Cu istoric, putem arăta REDUCERI REALE: preț sub
minimul ultimelor 30 de zile — reperul cerut și de directiva Omnibus (UE 2019/2161) — nu „prețul tăiat"
din feed, pe care magazinul îl poate umfla. Black Friday 2026 la eMAG e pe 6 noiembrie: colectarea
pornește acum ca să existe 30 de zile de date înainte.

CE PĂSTRĂM: pentru fiecare produs (cheie = hash al adresei produsului la magazin, vezi VARIANTE), doar
SCHIMBĂRILE de preț: [[zi, preț], ...], plus ziua în care l-am văzut ultima dată (`v`). Un produs nevăzut
90 de zile iese. Feed-urile se rotesc (60 de magazine pe rulare), deci absența de o zi nu înseamnă nimic.

VARIANTE (25-28.11.2026): primele două „reduceri reale" de pe 24.11 erau alt produs pe aceeași adresă:
Kiehl's Better Screen UV Serum, 50 ml la 200 lei pe 07.10 și mostra de 15 ml la 95 lei pe 24.11 („−52%";
adresa avea `dwvar_..._size=15 ml`), și Husse Flexcare Puppy, 569,50 -> 284,75 lei (exact jumătate; numele
imaginii are și [12kg], și [7kg]). Cheia veche tăia parametrii adresei, deci variantele aveau un singur
istoric, iar magazinele care țin produsul DOAR în parametri (`index.php?route=product/product&product_id=`)
și linkurile de afiliere (`event.2performant.com/events/click?...redirect_to=`, Impact `*.sjv.io/c/...?u=`)
puneau zeci de produse diferite pe aceeași cheie. Acum, la fiecare rulare:
  1. cheia = adresa reală (fără redirectul de afiliere) + parametrii care aleg produsul sau varianta
     (Shopify `variant=`, WooCommerce `attribute_*` / `variation_id`, Demandware `dwvar_*`, `product_id`...).
     Fără astfel de parametri cheia rămâne cea veche, deci istoricul continuă;
  2. amprenta de cantitate (volum, greutate, bucăți, dimensiuni din titlu, adresă și numele imaginii, `a`):
     dacă spune altă cantitate pe aceeași cheie, istoricul repornește (`s` = ziua) — prețul de până atunci
     era al altui produs;
  3. aceeași cheie cu două prețuri (sau două cantitați) în aceeași rulare: adresa vinde mai multe produse
     (mărimi de buchet, gramaje de parfum), iar istoricul ei nu se mai compară cu nimic (`x` = ziua);
  4. prudență: o scădere de peste 45% la un produs cu semne de variantă (`m`: două cantități diferite
     pentru aceeași unitate în titlu, adresă sau imagine, sau o adresă pe care feed-ul o vinde și în
     variante) nu se publică; la fel o scădere de peste 3 ori (eroare de feed). Se numără separat
     (`scaderi_excluse`, `statistici.excluse_varianta`).
Istoricul de dinainte s-a mutat pe cheile noi o singură dată, cu harta din data/istoric-preturi-migrare.json
(`--migrare-din-git`, din versiunile comise ale products.json): cheile curate doar s-au redenumit, iar cele
care amestecau produse s-au reconstruit din git, produs cu produs.

IEȘIRE: frontend/public/scaderi-pret.json — produsele văzute azi al căror preț e cu cel puțin 10% sub
minimul din cele 30 de zile dinainte, DOAR dacă istoricul lor acoperă cel puțin 14 zile (altfel
„minimul pe 30 de zile" ar fi o vorbă goală). La început lista e goală — e corect, nu o eroare.

Rulare:  python istoric_preturi.py                    # actualizează istoricul și lista
         python istoric_preturi.py --test             # verificări care trebuie să poată pica
         python istoric_preturi.py --migrare-din-git  # rescrie harta de migrare (cere istoricul git din 07.10)
"""
from __future__ import annotations

import hashlib
import html
import io
import json
import os
import re
import sys
import unicodedata
from datetime import date, datetime, timedelta, timezone
from functools import lru_cache
from urllib.parse import parse_qsl, unquote, urlsplit

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRODUSE = os.path.join(ROOT, "frontend", "public", "products.json")
ISTORIC = os.path.join(ROOT, "data", "istoric-preturi.json")
SCADERI = os.path.join(ROOT, "frontend", "public", "scaderi-pret.json")
MIGRARE = os.path.join(ROOT, "data", "istoric-preturi-migrare.json")

VERSIUNE = 2          # 2 = cheile cu varianta (28.11.2026); 1 = adresa fara parametri
PASTRARE_ZILE = 90
FEREASTRA = 30
ACOPERIRE_MIN = 14
SCADERE_MIN = 0.10
PRET_MIN = 20.0
PRAG_VARIANTA = 0.55  # scadere de peste 45%: cu semne de varianta, e mai probabil alt produs decat o reducere
RAPORT_ABSURD = 3.0   # x3 sau /3 intr-o luna: aproape sigur alta varianta de produs pe aceeasi adresa, nu un pret
VAZUT_RECENT = 3      # zile: un produs nevazut de 3 zile nu mai are un pret „de azi"


# ── Identitatea produsului ────────────────────────────────────────────────────────────────────────
# Linkurile de afiliere care poarta adresa produsului intr-un parametru: 2Performant (redirect_to), Impact (u=),
# Awin (ued=). Le recunoaste gazda sau calea (Impact foloseste zeci de domenii, cu calea /c/<partener>/<ad>/<camp>).
RE_GAZDA_REDIRECT = re.compile(r"(^|\.)(2performant\.com|awin1\.com|ojrq\.net|sjv\.io|pxf\.io)$", re.I)
RE_CALE_REDIRECT = re.compile(r"^/c/\d{6,}/\d+")
PARAM_REDIRECT = {"redirect_to", "u", "ued", "murl", "url"}
# Parametrii care ALEG produsul sau varianta; restul (utm_*, ref, country, channable...) sunt de urmarire.
# Doar ce apare in feed-uri (masurat pe 25.11.2026, toate versiunile din 07.10): Shopify variant=, WooCommerce
# attribute_* / variation_id, Demandware dwvar_*, OpenCart product_id, WordPress p=, skuId, variantId,
# v= (centini, kedoo, pescar-expert), combinatie-<id> (cartuseria). „ID" NU: la cauciucuridirect.ro e eticheta
# de afiliere (ID=aff_rd_ro_2performant), iar un parametru constant in cheie doar ar reseta istoricul.
PARAM_VARIANTA = {"variant", "variantid", "variant_id", "variation_id", "v", "sku", "skuid",
                  "product_id", "productid", "p"}
PREFIXE_VARIANTA = ("attribute_", "dwvar_", "combinatie")


def adresa_reala(u: str) -> str:
    """Adresa produsului la magazin. Pentru un link de afiliere, adresa din parametrul lui; altfel neschimbata."""
    u = (u or "").strip()
    for _ in range(3):
        try:
            s = urlsplit(u)
        except ValueError:
            return u
        if not (RE_GAZDA_REDIRECT.search(s.netloc.split(":")[0]) or RE_CALE_REDIRECT.match(s.path)):
            break
        tinta = next((v.strip() for k, v in parse_qsl(html.unescape(s.query))
                      if k.strip().lower() in PARAM_REDIRECT and v.strip().lower().startswith(("http://", "https://"))),
                     "")
        if not tinta:
            break
        u = tinta
    return u


def parametri_varianta(adresa: str) -> list[tuple[str, str]]:
    """Parametrii adresei care aleg produsul sau varianta, normalizati (fara spatii, litere mici), sortati."""
    try:
        query = urlsplit(adresa).query
    except ValueError:
        return []
    perechi = set()
    for k, v in parse_qsl(html.unescape(query), keep_blank_values=True):
        k = k.strip().lower()
        k = k[4:] if k.startswith("amp;") else k     # „&amp;" scris in feed: route=...&amp;product_id=...
        if k in PARAM_VARIANTA or k.startswith(PREFIXE_VARIANTA):
            # fara spatii si „+": prin linkul 2Performant „65cm+%2B+Blat" ajunge decodat de doua ori (fabricadegratare)
            perechi.add((k, re.sub(r"[\s+]+", "", v.lower())))
    return sorted(perechi)


def _baza(adresa: str) -> str:
    """Gazda + cale, cu calea decodata: linkul 2Performant aduce adresa decodata („pat-tapițat"), feed-ul o aduce
    codata („pat-tapi%C8%9Bat") — fara asta acelasi produs avea doua chei (369 de produse pe 28.11)."""
    s = urlsplit(adresa)
    return f"{s.netloc.lower()}{unquote(s.path).rstrip('/')}"


def _baza_veche(adresa: str) -> str:
    s = urlsplit(adresa)
    return f"{s.netloc.lower()}{s.path.rstrip('/')}"


@lru_cache(maxsize=None)
def _analiza(url_original: str) -> tuple[str, str, tuple]:
    """(adresa reala, gazda + cale, parametrii de varianta) — o singura trecere prin adresa."""
    adresa = adresa_reala(url_original)
    if not adresa:
        return "", "", ()
    try:
        return adresa, _baza(adresa), tuple(parametri_varianta(adresa))
    except ValueError:
        return "", "", ()


def cheie(p: dict) -> str:
    """Produsul la magazin: adresa reala, fara parametrii de urmarire, dar cu cei care aleg produsul sau varianta."""
    adresa, baza, par = _analiza((p.get("url_original") or "").strip())
    if not baza:
        return ""
    if par:
        baza += "?" + "&".join(f"{k}={v}" for k, v in par)
    return hashlib.sha1(baza.encode("utf-8")).hexdigest()[:16]


def cheie_veche(p: dict) -> str:
    """Cheia de pana pe 28.11.2026 (adresa din feed, fara niciun parametru). Doar pentru migrare si teste."""
    u = (p.get("url_original") or "").strip()
    if not u:
        return ""
    try:
        return hashlib.sha1(_baza_veche(u).encode("utf-8")).hexdigest()[:16]
    except ValueError:
        return ""


# ── Amprenta de cantitate ─────────────────────────────────────────────────────────────────────────
_NUM = r"(?<![a-wyz\d.])(\d+(?:\.\d+)?)"      # nu in mijlocul unui cod („spf50"); „6x400gr" ramane citibil
RE_VOLUM = re.compile(_NUM + r"\s*(ml|cl|l|litri|litru)(?![a-z])")
RE_GREUTATE = re.compile(_NUM + r"\s*(kg|g|gr|grame|mg)(?![a-z])")
RE_BUCATI = re.compile(_NUM + r"\s*(buc|bucati|pcs|tablete|capsule|comprimate|plicuri|doze)(?![a-z])")
RE_DIMENSIUNI = re.compile(_NUM + r"\s*x\s*(\d+(?:\.\d+)?)(?:\s*x\s*(\d+(?:\.\d+)?))?")
_ML = {"ml": 1, "cl": 10}
_G = {"kg": 1000, "mg": 0.001}


def _numar(x: float) -> str:
    return str(int(x)) if x == int(x) else f"{x:g}"


def _cantitati(text: str, cu_dimensiuni: bool = True) -> set[str]:
    """Cantitatile scrise in text, normalizate: ml:50, g:12000, buc:30, dim:140x200."""
    t = (text or "").replace("×", "x").replace("-", " ").replace("_", " ")
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode("ascii").lower()
    t = re.sub(r"(?<=\d),(?=\d)", ".", t)
    out = set()
    for n, u in RE_VOLUM.findall(t):
        out.add("ml:" + _numar(float(n) * _ML.get(u, 1000)))
    for n, u in RE_GREUTATE.findall(t):
        out.add("g:" + _numar(float(n) * _G.get(u, 1)))
    for n, _u in RE_BUCATI.findall(t):
        out.add("buc:" + _numar(float(n)))
    if cu_dimensiuni:
        for dim in RE_DIMENSIUNI.findall(t):
            out.add("dim:" + "x".join(_numar(float(x)) for x in dim if x))
    return out


@lru_cache(maxsize=None)
def _amprenta(titlu: str, url_original: str, imagine: str) -> str:
    adresa, _b, par = _analiza(url_original)
    try:
        tok = _cantitati(titlu) | _cantitati(unquote(urlsplit(adresa).path))
        for _k, val in par:
            tok |= _cantitati(val)
        # Din numele imaginii doar volumul si greutatea („...-15ml-dlx-sample-...", „..._[12kg]_[7kg]_..."):
        # dimensiunile din imagini sunt de obicei rezolutia (300x300).
        nume = unquote(urlsplit(imagine).path.rsplit("/", 1)[-1])
        tok |= {x for x in _cantitati(nume, cu_dimensiuni=False) if x.startswith(("ml:", "g:"))}
    except ValueError:
        return ""
    return ",".join(sorted(tok))


def amprenta(p: dict) -> str:
    """Cantitatile produsului (titlu, adresa, parametrii de varianta, numele imaginii), ca text sortat."""
    return _amprenta(p.get("title") or "", (p.get("url_original") or "").strip(), (p.get("image") or "").strip())


def _pe_unitati(a: str) -> dict[str, set[str]]:
    d: dict[str, set[str]] = {}
    for x in (a or "").split(","):
        if ":" in x:
            u, val = x.split(":", 1)
            d.setdefault(u, set()).add(val)
    return d


def alta_cantitate(a: str, b: str) -> bool:
    """Doua amprente care spun alta cantitate pentru aceeasi unitate (ml:50 si ml:15). Fara unitate comuna nu stim."""
    da, db = _pe_unitati(a), _pe_unitati(b)
    return any(not (da[u] & db[u]) for u in set(da) & set(db))


def cantitati_multiple(a: str) -> bool:
    """Aceeasi unitate cu doua valori (g:12000 si g:7000): pagina vinde mai multe marimi."""
    return any(len(v) > 1 for v in _pe_unitati(a).values())


def baze_cu_variante(produse: list) -> frozenset:
    """Adresele (gazda + cale) pe care feed-ul le vinde si in variante, cu parametru. Acolo un produs FARA parametru
    poate avea pretul oricarei variante (tamos.ro: „Pat matrimonial ARONA" langa variantele lui cu variation_id)."""
    out = set()
    for p in produse:
        _a, baza, par = _analiza((p.get("url_original") or "").strip())
        if par:
            out.add(baza)
    return frozenset(out)


def semne_varianta(p: dict, baze: frozenset = frozenset()) -> bool:
    """Semne ca pretul poate fi al altei variante decat ieri, la o adresa FARA parametru de varianta: doua cantitati
    pentru aceeasi unitate (Husse: „[12kg]_[7kg]" in numele imaginii) sau o adresa pe care feed-ul o vinde si in
    variante. Cand adresa are parametrul (variant=, dwvar_...), cheia e deja a variantei: istoricul e al ei, iar o
    scadere mare e a ei (gorillasports, ganterele cu variant=: 279,90 -> 111,90 lei pe 06.11), nu alt produs."""
    _a, baza, par = _analiza((p.get("url_original") or "").strip())
    if not baza or par:
        return False
    return cantitati_multiple(amprenta(p)) or baza in baze


def mai_multe_produse(preturi: set, amprente: list) -> bool:
    """Aceeasi cheie in aceeasi rulare cu doua preturi sau doua cantitati: adresa vinde mai multe produse."""
    return len(preturi) > 1 or any(alta_cantitate(a, b) for i, a in enumerate(amprente) for b in amprente[i + 1:])


# ── Istoricul ─────────────────────────────────────────────────────────────────────────────────────

def pret(p: dict) -> float | None:
    try:
        v = float(p.get("price"))
    except (TypeError, ValueError):
        return None
    return round(v, 2) if v >= PRET_MIN else None


def actualizeaza(istoric: dict, produse: list, azi: str) -> int:
    """Adaugă observațiile de azi. Întoarce câte schimbări de preț noi au intrat."""
    grupe: dict[str, list] = {}
    for p in produse:
        if p.get("is_promo") in (True, "True"):
            continue
        k, v = cheie(p), pret(p)
        if k and v is not None:
            grupe.setdefault(k, []).append((v, p))
    baze = baze_cu_variante([p for obs in grupe.values() for _v, p in obs])
    noi = 0
    for k, obs in grupe.items():
        e = istoric.setdefault(k, {"p": [], "v": azi})
        e["v"] = azi
        if any(semne_varianta(p, baze) for _v, p in obs):
            e["m"] = 1
        preturi = {v for v, _p in obs}
        amprente = sorted({a for a in (amprenta(p) for _v, p in obs) if a})
        if mai_multe_produse(preturi, amprente):
            e["x"] = azi        # adresa vinde mai multe produse: nu mai comparam nimic pe ea
            continue
        v = min(preturi)
        a = ",".join(sorted({t for x in amprente for t in x.split(",")}))
        if a:
            if e.get("a") and alta_cantitate(e["a"], a):
                e["p"], e["s"] = [], azi    # alta cantitate pe aceeasi cheie: pretul de pana acum era al altui produs
            e["a"] = a
        if e["p"] and e["p"][-1][0] == azi:
            e["p"][-1][1] = min(e["p"][-1][1], v)   # mai multe rulări pe zi: cel mai mic preț al zilei
        elif not e["p"] or e["p"][-1][1] != v:
            e["p"].append([azi, v])
            noi += 1
    return noi


def curata(istoric: dict, azi: str) -> int:
    limita = (date.fromisoformat(azi) - timedelta(days=PASTRARE_ZILE)).isoformat()
    vechi = [k for k, e in istoric.items() if e.get("v", "") < limita]
    for k in vechi:
        del istoric[k]
    return len(vechi)


def minim_inainte(e: dict, azi: str) -> tuple[float | None, int]:
    """(prețul minim în cele 30 de zile dinaintea zilei de azi, câte zile acoperă istoricul)."""
    zi_azi = date.fromisoformat(azi)
    start = (zi_azi - timedelta(days=FEREASTRA)).isoformat()
    puncte = e["p"]
    if not puncte:
        return None, 0
    acoperire = (zi_azi - date.fromisoformat(puncte[0][0])).days
    # prețul valabil la începutul ferestrei + toate schimbările din fereastră, fără ziua de azi
    in_fereastra = [pr for zi, pr in puncte if start <= zi < azi]
    inainte = [pr for zi, pr in puncte if zi < start]
    candidati = in_fereastra + (inainte[-1:] if inainte else [])
    return (min(candidati) if candidati else None), acoperire


def scaderi(istoric: dict, produse: list, azi: str, excluse: dict | None = None) -> list[dict]:
    """Produsele vazute azi cu pretul cu cel putin 10% sub minimul din cele 30 de zile dinainte. Ce ar trece regula,
    dar poate fi alta varianta sau o eroare de feed, nu se publica: se numara in `excluse` (varianta / peste_x3)."""
    out = []
    vazute = set()
    baze = baze_cu_variante(produse)
    for p in produse:
        if p.get("is_promo") in (True, "True"):
            continue
        k, v = cheie(p), pret(p)
        if not k or v is None or k in vazute or k not in istoric:
            continue
        vazute.add(k)
        e = istoric[k]
        mn, acoperire = minim_inainte(e, azi)
        if mn is None or acoperire < ACOPERIRE_MIN or v > mn * (1 - SCADERE_MIN):
            continue
        motiv = ""
        if e.get("x") or (v <= mn * PRAG_VARIANTA and (e.get("m") or semne_varianta(p, baze))):
            motiv = "varianta"
        elif v * RAPORT_ABSURD < mn:
            motiv = "peste_x3"
        if motiv:
            if excluse is not None:
                excluse[motiv] = excluse.get(motiv, 0) + 1
            continue
        out.append({
            "title": p.get("title"), "url": p.get("url"), "image": p.get("image"),
            "merchant_slug": p.get("merchant_slug"), "cat_slug": p.get("cat_slug"),
            "pret": v, "minim_30_zile": mn, "scadere_pct": round((1 - v / mn) * 100),
        })
    out.sort(key=lambda x: -x["scadere_pct"])
    return out


def statistici(istoric: dict, azi: str) -> dict:
    """Cifre AGREGATE pentru pagina /reduceri-reale (26.10.2026): cate produse s-au scumpit, cate s-au
    ieftinit si cat, fata de pretul de acum 30 de zile (sau de la prima observatie, daca e mai tarziu).
    Doar produse cu cel putin 14 zile de istoric, vazute in ultimele 3 zile. Variatiile de peste x3 se
    numara separat (`excluse`), nu intra in medii: pe aceeasi adresa apare uneori alta varianta (alt
    gramaj, alt set), iar un „+500%" ar fi o eroare de feed prezentata ca scumpire. Tot separat
    (`excluse_varianta`, 28.11.2026): adresele care vand mai multe produse (`x`), cele la care cantitatea s-a
    schimbat de curand (`s`) si saltul de peste 45% la un produs cu semne de varianta (`m`). Fara nume de
    magazine: pagina descrie piata, nu acuza pe nimeni."""
    zi_azi = date.fromisoformat(azi)
    start = (zi_azi - timedelta(days=FEREASTRA)).isoformat()
    recent = (zi_azi - timedelta(days=VAZUT_RECENT)).isoformat()
    sus, jos, egal, excluse, varianta = [], [], 0, 0, 0
    for e in istoric.values():
        p = e.get("p") or []
        if not p or e.get("v", "") < recent:
            continue
        if (date.fromisoformat(e["v"]) - date.fromisoformat(p[0][0])).days < ACOPERIRE_MIN:
            if e.get("s"):
                varianta += 1       # istoricul a repornit de curand: alta cantitate pe aceeasi adresa
            continue
        if e.get("x"):
            varianta += 1
            continue
        inainte = [pr for zi, pr in p if zi <= start]
        ref = inainte[-1] if inainte else p[0][1]
        acum = p[-1][1]
        if not ref or not acum:
            continue
        r = acum / ref
        if r > RAPORT_ABSURD or r < 1 / RAPORT_ABSURD:
            excluse += 1
        elif e.get("m") and (r <= PRAG_VARIANTA or r >= 1 / PRAG_VARIANTA):
            varianta += 1
        elif r > 1.005:
            sus.append((r - 1) * 100)
        elif r < 0.995:
            jos.append((1 - r) * 100)
        else:
            egal += 1

    def mediana(xs: list) -> float | None:
        if not xs:
            return None
        s = sorted(xs)
        m = len(s) // 2
        return round(s[m] if len(s) % 2 else (s[m - 1] + s[m]) / 2, 1)

    total = len(sus) + len(jos) + egal
    return {
        "produse": total, "scumpite": len(sus), "ieftinite": len(jos), "neschimbate": egal,
        "mediana_scumpire_pct": mediana(sus), "mediana_ieftinire_pct": mediana(jos),
        "excluse": excluse, "excluse_varianta": varianta,
        "fereastra_zile": FEREASTRA, "acoperire_min_zile": ACOPERIRE_MIN,
    }


# ── Migrarea pe cheile cu varianta (o singura data) ───────────────────────────────────────────────

def aplica_migrare(istoric: dict, m: dict) -> str:
    """Harta scrisa de --migrare-din-git: cheile vechi care amestecau produse ies, istoricul reconstruit din git intra
    pe cheile noi, cele curate doar se redenumesc (cu tot ce au strans, si din rularile necomise), iar adresele
    care au vandut mai multe produse primesc marcajul lor (`x`, `m`, `a`)."""
    sterse = sum(1 for k in m.get("sterse", []) if istoric.pop(k, None) is not None)
    redenumite = 0
    for vechi, nou in m.get("redenumite", {}).items():
        if vechi in istoric and nou not in istoric:
            istoric[nou] = istoric.pop(vechi)
            redenumite += 1
    for k, e in m.get("reconstruite", {}).items():
        istoric[k] = json.loads(json.dumps(e))
    marcate = 0
    for k, atr in m.get("atribute", {}).items():
        if k in istoric:
            istoric[k].update(atr)
            marcate += 1
    return (f"{sterse} chei vechi scoase, {redenumite} redenumite, {len(m.get('reconstruite', {}))} reconstruite "
            f"din git, {marcate} marcate")


def migrare_din_git(de_la: str = "2026-10-07T12:00:00Z") -> int:
    """Reia toate versiunile comise ale products.json cu regulile de azi si scrie data/istoric-preturi-migrare.json.
    Prima rulare cu regulile noi (istoric fara `versiune` 2) o aplica pe istoricul de atunci. Cere istoricul git
    din 07.10: git fetch --shallow-since=2026-10-05 origin main."""
    import subprocess

    def git(*a: str) -> bytes:
        return subprocess.run(["git", "-C", ROOT, *a], capture_output=True, check=True).stdout

    linii = git("log", "--format=%H %ct", f"--since={de_la}", "--", "frontend/public/products.json").decode().split()
    commits = sorted((int(linii[i + 1]), linii[i]) for i in range(0, len(linii), 2))
    zi_din = lambda ts: datetime.fromtimestamp(ts, timezone.utc).date().isoformat()   # noqa: E731
    if not commits or zi_din(commits[0][0]) > "2026-10-08":
        print("migrare: istoricul git nu ajunge la 07.10 — ruleaza intai: git fetch --shallow-since=2026-10-05 origin main")
        return 2
    harta: dict[str, set] = {}
    nou: dict = {}
    for i, (ts, h) in enumerate(commits):
        zi = zi_din(ts)
        try:
            raw = json.loads(git("show", f"{h}:frontend/public/products.json"))
        except (subprocess.CalledProcessError, ValueError):
            print(f"  sar {h[:8]} ({zi}): nu se citeste")
            continue
        produse = raw.get("products", raw) if isinstance(raw, dict) else raw
        for p in produse:
            if p.get("is_promo") in (True, "True") or pret(p) is None:
                continue
            kv, kn = cheie_veche(p), cheie(p)
            if kv and kn:
                harta.setdefault(kv, set()).add(kn)
        actualizeaza(nou, produse, zi)
        curata(nou, zi)
        if i % 20 == 0:
            print(f"  {i + 1}/{len(commits)} {zi}: {len(nou)} chei", flush=True)
    surse: dict[str, set] = {}
    for kv, kns in harta.items():
        for kn in kns:
            surse.setdefault(kn, set()).add(kv)
    sterse, redenumite, reconstruite, atribute = [], {}, {}, {}
    for kv, kns in sorted(harta.items()):
        kn = next(iter(kns)) if len(kns) == 1 else None
        e = nou.get(kn) if kn else None
        if kn and surse[kn] == {kv} and e is not None and not e.get("s"):
            if kn != kv:
                redenumite[kv] = kn
            atr = {c: e[c] for c in ("a", "m", "x") if e.get(c)}
            if atr:
                atribute[kn] = atr
            continue
        # Cheia veche amesteca produse (mai multe chei noi, alta cheie veche pentru acelasi produs, sau alta
        # cantitate in timp): iese, iar fiecare produs isi primeste istoricul reconstruit din versiunile comise.
        sterse.append(kv)
        for k in kns:
            if k in nou:
                reconstruite[k] = nou[k]
    doc = {"creat": datetime.now(timezone.utc).date().isoformat(), "pana_la": zi_din(commits[-1][0]),
           "versiuni_products_json": len(commits), "sterse": sterse, "redenumite": redenumite,
           "reconstruite": reconstruite, "atribute": atribute}
    io.open(MIGRARE, "w", encoding="utf-8", newline="\n").write(
        json.dumps(doc, ensure_ascii=False, separators=(",", ":")))
    print(f"migrare: {len(commits)} versiuni ({zi_din(commits[0][0])} - {doc['pana_la']}); chei vechi: {len(harta)}, "
          f"din care redenumite {len(redenumite)}, scoase {len(sterse)} (reconstruite {len(reconstruite)} chei noi); "
          f"marcate {len(atribute)} -> {os.path.relpath(MIGRARE, ROOT)}")
    return 0


def main() -> int:
    azi = datetime.now(timezone.utc).date().isoformat()
    raw = json.load(io.open(PRODUSE, encoding="utf-8"))
    produse = raw.get("products", raw) if isinstance(raw, dict) else raw
    doc = {}
    if os.path.exists(ISTORIC):
        doc = json.load(io.open(ISTORIC, encoding="utf-8"))
    istoric = doc.get("produse", {})
    if istoric and doc.get("versiune", 1) < VERSIUNE:
        if os.path.exists(MIGRARE):
            print("istoric preturi: migrare pe cheile cu varianta — "
                  + aplica_migrare(istoric, json.load(io.open(MIGRARE, encoding="utf-8"))))
        else:
            print("istoric preturi: ! lipseste data/istoric-preturi-migrare.json — produsele cu varianta in adresa "
                  "pornesc de la zero, iar cheile vechi ies singure in 90 de zile")
    noi = actualizeaza(istoric, produse, azi)
    scoase = curata(istoric, azi)
    excluse = {"varianta": 0, "peste_x3": 0}
    lista = scaderi(istoric, produse, azi, excluse)
    io.open(ISTORIC, "w", encoding="utf-8", newline="\n").write(
        json.dumps({"actualizat": azi, "versiune": VERSIUNE, "produse": istoric},
                   ensure_ascii=False, separators=(",", ":")))
    io.open(SCADERI, "w", encoding="utf-8", newline="\n").write(
        json.dumps({"actualizat": azi, "fereastra_zile": FEREASTRA, "statistici": statistici(istoric, azi),
                    "scaderi_excluse": excluse, "produse": lista[:300]},
                   ensure_ascii=False, separators=(",", ":")))
    print(f"istoric preturi: {len(istoric)} produse urmarite; schimbari noi: {noi}; scoase: {scoase}; "
          f"scaderi reale sub minimul pe {FEREASTRA} de zile: {len(lista)} (nepublicate: alta varianta "
          f"{excluse['varianta']}, peste x3 {excluse['peste_x3']})")
    return 0


def test() -> int:
    esec = 0

    def v(nume, primit, asteptat):
        nonlocal esec
        ok = primit == asteptat
        esec += 0 if ok else 1
        print(f"  {'ok  ' if ok else 'PICA'}  {nume}" + ("" if ok else f"\n        primit {primit!r}, asteptat {asteptat!r}"))

    def fara_reguli(f):
        """Ruleaza f() ca inainte de 28.11.2026 (cheia fara parametri, fara amprenta, fara semne de varianta):
        dovada ca scenariul chiar arata greseala, deci testul de mai sus poate pica."""
        g = globals()
        pastrate = {n: g[n] for n in ("cheie", "alta_cantitate", "mai_multe_produse", "semne_varianta")}
        g.update(cheie=cheie_veche, alta_cantitate=lambda a, b: False, mai_multe_produse=lambda pr, am: False,
                 semne_varianta=lambda p, b=frozenset(): False)
        try:
            return f()
        finally:
            g.update(pastrate)

    P = lambda pr, u="https://magazin.ro/produs-x?utm=1": {"url_original": u, "price": pr, "title": "X", "url": "u"}
    v("cheia ignora parametrii", cheie(P(1)), cheie(P(1, "https://magazin.ro/produs-x/")))
    ist = {}
    actualizeaza(ist, [P(100)], "2026-09-01")
    actualizeaza(ist, [P(100)], "2026-09-05")
    v("acelasi pret nu adauga punct", len(ist[cheie(P(1))]["p"]), 1)
    actualizeaza(ist, [P(120)], "2026-09-20")
    actualizeaza(ist, [P(80)], "2026-10-01")
    actualizeaza(ist, [P(90)], "2026-10-01")
    v("doua rulari in aceeasi zi: minimul zilei", ist[cheie(P(1))]["p"][-1], ["2026-10-01", 80])
    # pe 10.10: minimul din 10.09-09.10 = 80 (01.10) -> 70 e cu 12,5% sub, scadere reala
    actualizeaza(ist, [P(70)], "2026-10-10")
    v("scadere reala sub minimul pe 30 de zile", [x["scadere_pct"] for x in scaderi(ist, [P(70)], "2026-10-10")], [12])
    v("75 nu e cu 10% sub 80", scaderi(ist, [P(75)], "2026-10-10"), [])
    ist2 = {}
    actualizeaza(ist2, [P(100)], "2026-10-01")
    actualizeaza(ist2, [P(50)], "2026-10-05")
    v("istoric de 4 zile: nicio scadere declarata", scaderi(ist2, [P(50)], "2026-10-05"), [])
    v("produs nevazut 90 de zile iese", curata({"a": {"p": [["2026-01-01", 1]], "v": "2026-01-01"}}, "2026-10-07"), 1)
    # statistici: referinta = pretul de acum 30 de zile; x3 = exclus; istoric scurt / nevazut recent = ignorat
    st = statistici({
        "sus": {"p": [["2026-09-20", 100], ["2026-10-20", 110]], "v": "2026-10-26"},     # +10%
        "jos": {"p": [["2026-10-01", 200], ["2026-10-15", 150]], "v": "2026-10-26"},     # -25%
        "egal": {"p": [["2026-10-01", 50]], "v": "2026-10-26"},
        "absurd": {"p": [["2026-10-01", 10], ["2026-10-20", 60]], "v": "2026-10-26"},  # x6 -> exclus
        "scurt": {"p": [["2026-10-20", 10], ["2026-10-25", 20]], "v": "2026-10-26"},   # 6 zile -> ignorat
        "vechi": {"p": [["2026-09-01", 10], ["2026-09-20", 20]], "v": "2026-10-01"},   # nevazut -> ignorat
    }, "2026-10-26")
    v("statistici: numara corect", (st["produse"], st["scumpite"], st["ieftinite"], st["neschimbate"], st["excluse"]),
      (3, 1, 1, 1, 1))
    v("statistici: referinta = pretul de la inceputul ferestrei", (st["mediana_scumpire_pct"], st["mediana_ieftinire_pct"]),
      (10.0, 25.0))

    print("  -- variante pe aceeasi adresa (28.11.2026): cazurile reale de pe 24.11, din istoricul git al products.json")
    KIEHLS = "https://www.kiehls.ro/better-screen-uv-serum-–-serum-cu-protectie-solara/WW0269KIE.html"
    IMG = ("https://www.kiehls.ro/dw/image/v2/AAQP_PRD/on/demandware.static/-/Sites-kie-master-catalog/default/"
           "{0}/packshots-2026/WW0269KIE/kiehls-sun-2026-better-screen-uv-serum-{1}-row.webp?sm=cut&sfrm=png&q=70")
    IMG50 = IMG.format("dwade60f68", "intl-50ml-packshot-3605972966025")
    IMG15 = IMG.format("dwb6f7e94a", "spf50-15ml-dlx-sample-front-3605973063792")

    def kiehls(pr, param, img):
        return {"url_original": KIEHLS + param, "price": pr, "title": "Better Screen™ UV Serum – serum cu protecție solară",
                "image": img, "url": "k", "merchant_slug": "kiehls.ro"}
    k50, k50f = kiehls(200.0, "?dwvar_WW0269KIE_size=50 ml", IMG50), kiehls(200.0, "", IMG50)
    k15, k15f = kiehls(95.0, "?dwvar_WW0269KIE_size=15 ml", IMG15), kiehls(95.0, "", IMG15)
    v("amprenta: 50 ml si 15 ml (parametru + numele imaginii)", (amprenta(k50), amprenta(k15), amprenta(k15f)),
      ("ml:50", "ml:15", "ml:15"))

    def ruleaza_kiehls():
        # ca in feed: 50 ml cu si fara parametru (07.10, 10.10, 16.10, 03.11), apoi mostra de 15 ml (24.11)
        ist = {}
        for zi, p in (("2026-10-07", k50), ("2026-10-10", k50f), ("2026-10-16", k50), ("2026-11-03", k50f),
                      ("2026-11-24", k15)):
            actualizeaza(ist, [p], zi)
        return [x["scadere_pct"] for x in scaderi(ist, [k15], "2026-11-24")]
    v("Kiehl's: mostra de 15 ml nu e o reducere la flaconul de 50 ml", ruleaza_kiehls(), [])
    v("  fara regula ar fi aparut −52% (ca pe 24.11)", fara_reguli(ruleaza_kiehls), [52])

    def ruleaza_kiehls_fara_parametru():
        # aceeasi mostra, dar feed-ul uita parametrul: o spune doar imaginea
        ist = {}
        for zi in ("2026-10-10", "2026-10-20", "2026-11-03"):
            actualizeaza(ist, [k50f], zi)
        actualizeaza(ist, [k15f], "2026-11-24")
        e = ist[cheie(k15f)]
        return [x["scadere_pct"] for x in scaderi(ist, [k15f], "2026-11-24")], e.get("s"), e["p"]
    v("Kiehl's fara parametru: alta cantitate pe aceeasi cheie -> istoricul reporneste",
      ruleaza_kiehls_fara_parametru(), ([], "2026-11-24", [["2026-11-24", 95.0]]))
    v("  fara regula: −52%", fara_reguli(ruleaza_kiehls_fara_parametru)[0], [52])

    HUSSE = ("https://www.husse.ro/hypoallergenic-flexcare-puppy-hrana-hipoalergenica-pentru-caini-juniori-cu-suport-"
             "pentru-sanatatea-articulara/81123411/")
    HIMG = ("https://media-eu.husse.com/media/60/f7/3e/1739961733/81123411_81123410_Selected_"
            "HypoallergenicFlexcare™Puppy_[12kg]_[7kg]_DOG_DRY_FOOD.jpg")

    def husse(pr):
        return {"url_original": HUSSE, "price": pr, "image": HIMG, "url": "h", "merchant_slug": "husse.ro",
                "title": "HYPOALLERGENIC FLEXCARE™ PUPPY | Hrană hipoalergenică pentru câini juniori, cu suport "
                         "pentru sănătatea articulară"}
    v("amprenta Husse: imaginea arata doua gramaje -> semne de varianta", (amprenta(husse(1)), semne_varianta(husse(1))),
      ("g:12000,g:7000", True))

    def ruleaza_husse():
        ist, exc = {}, {}
        for zi, pr in (("2026-10-07", 569.5), ("2026-11-20", 569.5), ("2026-11-24", 284.75)):
            actualizeaza(ist, [husse(pr)], zi)
        return [x["scadere_pct"] for x in scaderi(ist, [husse(284.75)], "2026-11-24", exc)], exc.get("varianta", 0)
    v("Husse: exact jumatate, cu semne de varianta -> nu se publica, se numara", ruleaza_husse(), ([], 1))
    v("  fara regula: −50%", fara_reguli(ruleaza_husse), ([50], 0))

    def gantera(pr):     # gorillasports.ro, 06.11: varianta e in adresa, deci istoricul e al ei
        return {"url_original": "https://gorillasports.ro/products/gantera-cauciucata-neagra-45-lbs?variant=58243707240831",
                "price": pr, "title": "Gantera din cauciuc, rotunda, neagră 25-45 lb (11,3-20,4 kg)", "url": "g"}
    ist = {}
    for zi, pr in (("2026-10-08", 279.9), ("2026-10-20", 279.9), ("2026-11-06", 111.9)):
        actualizeaza(ist, [gantera(pr)], zi)
    v("varianta in adresa: scaderea mare e a variantei si ramane", (semne_varianta(gantera(1)),
      [x["scadere_pct"] for x in scaderi(ist, [gantera(111.9)], "2026-11-06")]), (False, [60]))

    def somnart(pr, adresa, titlu, img):
        return {"url_original": "https://somnart.ro/produs/" + adresa, "price": pr, "title": titlu,
                "image": "https://somnart.ro/wp-content/uploads/" + img, "url": "s", "merchant_slug": "somnart.ro"}
    s140 = lambda pr: somnart(pr, "saltea-cu-memorie-somnart-aloe-vera-140x200-inaltime-20-cm-husa-cu-aloe-vera-"  # noqa: E731
                              "fermitate-medie", "Saltea cu memorie Somnart Aloe Vera 140×200, înălțime 20 cm, husă cu "
                              "Aloe Vera, fermitate medie", "2026/05/ChatGPT-Image-Apr-3-2025-08_58_57-AM.webp")
    s200 = lambda pr: somnart(pr, "saltea-cu-memorie-somnart-memory-ultimate-200x200-inaltime-24-cm-husa-cu-aloe-vera-"  # noqa: E731
                              "cu-manere-fermitate-mare-copiaza", "Saltea cu memorie Somnart Memory Ultimate 200x200, "
                              "înălțime 24 cm, husă cu Aloe Vera, cu mânere, fermitate medie",
                              "2017/06/Ultimate-Aloe-Vera-2.jpg")
    ist = {}
    for zi in ("2026-10-08", "2026-11-01", "2026-11-23"):
        actualizeaza(ist, [s140(947.65), s200(1896.68)], zi)
    actualizeaza(ist, [s140(771.18), s200(1657.18)], "2026-11-24")
    v("Somnart: aceeasi adresa, pret constant 47 de zile -> reducerile reale raman",
      sorted(x["scadere_pct"] for x in scaderi(ist, [s140(771.18), s200(1657.18)], "2026-11-24")), [13, 19])

    def floria(pr):
        return {"url_original": "https://www.floria.ro/buchet-alb-rosu/p", "price": pr, "title": "Buchet Alb Rosu",
                "image": "https://www.floria.ro/files/4.jpg?v=638762621392300000", "url": "f"}

    def ruleaza_floria():
        ist = {}
        actualizeaza(ist, [floria(395.0), floria(339.0)], "2026-10-07")   # doua marimi pe aceeasi adresa, aceeasi rulare
        for zi in ("2026-10-15", "2026-10-25", "2026-11-05"):
            actualizeaza(ist, [floria(395.0)], zi)                         # in unele zile feed-ul o da doar pe una
        actualizeaza(ist, [floria(339.0)], "2026-11-24")
        return [x["scadere_pct"] for x in scaderi(ist, [floria(339.0)], "2026-11-24")]
    v("floria: doua preturi pe aceeasi adresa in aceeasi rulare -> adresa nu se mai compara", ruleaza_floria(), [])
    v("  fara regula: −14%", fara_reguli(ruleaza_floria), [14])

    ql = ("https://event.2performant.com/events/click?ad_type=quicklink&aff_code=541547473&unique=bb3071a7d"
          "&redirect_to=https%3A%2F%2Fwww.librarie.net%2Fp%2F{0}%2Fcarte")
    ql1, ql2 = {"url_original": ql.format(1)}, {"url_original": ql.format(2)}
    v("linkul 2Performant: cheia e a produsului, nu a linkului",
      (cheie(ql1) != cheie(ql2), cheie(ql1) == cheie({"url_original": "https://www.librarie.net/p/1/carte"}),
       cheie_veche(ql1) == cheie_veche(ql2)), (True, True, True))
    imp = {"url_original": "https://dhgate.sjv.io/c/7401119/1234567/12345?u=https%3A%2F%2Fwww.dhgate.com%2Fproduct%2Fa.html"}
    v("linkul Impact: cheia e a produsului", cheie(imp), cheie({"url_original": "https://www.dhgate.com/product/a.html"}))
    codat = "https://www.prestigehome.ro/products/pat-tapi%C8%9Bat-bumble?variant=56410852294996"
    ql_codat = ("https://event.2performant.com/events/click?ad_type=quicklink&redirect_to="
                "https%3A%2F%2Fwww.prestigehome.ro%2Fproducts%2Fpat-tapi%25C8%259Bat-bumble%3Fvariant%3D56410852294996")
    v("calea codata (%C8%9B) si cea decodata din linkul 2Performant: aceeasi cheie",
      cheie({"url_original": ql_codat}) == cheie({"url_original": codat}) == cheie(
          {"url_original": "https://www.prestigehome.ro/products/pat-tapițat-bumble?variant=56410852294996"}), True)
    oc = lambda i: {"url_original": f"https://www.shop4pet.ro/index.php?route=product/product&amp;product_id={i}"}  # noqa: E731
    v("OpenCart: produsul e in product_id (si cu &amp; scris in feed)", cheie(oc(1)) != cheie(oc(2)), True)
    sh = lambda i: {"url_original": f"https://ro.onesleep.com/products/protectie-saltea?variant={i}&utm_source=2p"}  # noqa: E731
    v("Shopify: fiecare varianta are istoricul ei", cheie(sh(1)) != cheie(sh(2)), True)
    v("fara parametri de varianta cheia ramane cea veche (istoricul continua)",
      [cheie(x) == cheie_veche(x) for x in (P(1), {"url_original": "https://x.ro/p-1?utm_source=a&ID=aff_rd_ro_2p"})],
      [True, True])
    v("alta cantitate doar la aceeasi unitate",
      (alta_cantitate("ml:50", "ml:15"), alta_cantitate("g:12000,g:7000", "g:12000"), alta_cantitate("ml:50", "dim:2x3")),
      (True, False, False))

    st2 = statistici({
        "normal": {"p": [["2026-09-20", 100], ["2026-10-20", 90]], "v": "2026-10-26"},                  # -10%
        "semne_mic": {"p": [["2026-09-20", 100], ["2026-10-20", 80]], "v": "2026-10-26", "m": 1},       # -20%: ramane
        "ambiguu": {"p": [["2026-09-20", 100], ["2026-10-20", 60]], "v": "2026-10-26", "x": "2026-10-01"},
        "varianta": {"p": [["2026-09-20", 100], ["2026-10-20", 50]], "v": "2026-10-26", "m": 1},        # -50% cu semne
        "taiat": {"p": [["2026-10-20", 95]], "v": "2026-10-26", "s": "2026-10-20", "a": "ml:15"},     # repornit de curand
    }, "2026-10-26")
    v("statistici: alta varianta pe aceeasi adresa nu e ieftinire, se numara separat",
      (st2["produse"], st2["ieftinite"], st2["excluse_varianta"]), (2, 2, 3))

    ist_m = {"amestecat": {"p": [["2026-10-01", 200.0], ["2026-11-24", 95.0]], "v": "2026-11-24"},
             "curat": {"p": [["2026-10-01", 50.0], ["2026-11-21", 45.0]], "v": "2026-11-26"},
             "neatins": {"p": [["2026-10-01", 10.0]], "v": "2026-11-24"}}
    r = aplica_migrare(ist_m, {"sterse": ["amestecat"], "redenumite": {"curat": "curat_nou"},
                               "reconstruite": {"k50": {"p": [["2026-10-01", 200.0]], "v": "2026-11-03"},
                                                "k15": {"p": [["2026-11-24", 95.0]], "v": "2026-11-24"}},
                               "atribute": {"neatins": {"x": "2026-10-05"}}})
    v("migrarea: scoate, redenumeste, reconstruieste, marcheaza",
      (sorted(ist_m), ist_m["curat_nou"]["p"], ist_m["neatins"].get("x")),
      (["curat_nou", "k15", "k50", "neatins"], [["2026-10-01", 50.0], ["2026-11-21", 45.0]], "2026-10-05"))
    v("  raportul migrarii", r, "1 chei vechi scoase, 1 redenumite, 2 reconstruite din git, 1 marcate")

    print(f"\n{esec} ESECURI" if esec else "TOATE TREC")
    return 1 if esec else 0


if __name__ == "__main__":
    if "--migrare-din-git" in sys.argv:
        sys.exit(migrare_din_git())
    sys.exit(test() if "--test" in sys.argv else main())
