#!/usr/bin/env python3
"""
generate_daily_digest.py — "Radarul AmCupon", produsul editorial zilnic.

ROLUL site-ului nu e "un loc cu cupoane", ci REDACTIA care testeaza si alege
cele mai bune oferte reale din Romania. Acest script produce combustibilul cu
voce pentru toate canalele (homepage, newsletter, Telegram, social): nu un dump
de linkuri, ci o selectie editoriala — intro cu voce + un verdict scurt per
oferta. O singura sursa de adevar, consumata peste tot, cu aceeasi identitate.

Output:
  frontend/public/digest-today.json   — structurat, pentru homepage + pagina /radar
  data/digest-today.txt               — varianta text simpla (Telegram/newsletter)

Generare:
  - Daca ANTHROPIC_API_KEY e setat -> voce scrisa de Claude (claude-haiku-4-5).
  - Altfel -> fallback determinist din sabloane (testabil local, fara cost).

Selectia ofertelor e mereu determinista (nu o lasam pe seama AI): alegem din
output.json oferte reale, verificate, diverse pe categorii, cu urgenta.
"""

import io
import json
import os
import sys
from datetime import datetime
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "frontend" / "public"
DATA = ROOT / "data"

LUNI_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
           "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"]

RETELE = {"profitshare.ro", "2performant.com"}
N_PICKS = 6

# Branduri mari, recognoscibile — primesc un mic boost ca sa apara in Radar cand
# au oferte decente (un produs editorial castiga din nume pe care lumea le stie)
BRANDURI_MARI = {
    "emag.ro", "fashiondays.ro", "altex.ro", "notino.ro", "answear.ro",
    "elefant.ro", "libris.ro", "decathlon.ro", "sportisimo.ro", "dedeman.ro",
    "noriel.ro", "drmax.ro", "flanco.ro", "carturesti.ro", "vegis.ro",
    "temu.com", "shein.com", "aliexpress.com", "trendyol.com",
}

import re as _re
_UUID_RE = _re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}", _re.I)


def slug_valid(slug: str) -> bool:
    """Respinge slug-uri malformate (UUID-uri lipite, prea lungi, fara domeniu)."""
    if not slug or " " in slug or slug in RETELE:
        return False
    if slug.count("/") > 1 or len(slug) > 30:
        return False
    if _UUID_RE.search(slug) or slug.count("-") > 3:
        return False
    if "." not in slug:
        return False
    return True


def nume_afisat(magazin: str) -> str:
    baza = magazin.split(".")[0].replace("-", " ")
    return " ".join(w.capitalize() for w in baza.split())


def load_magazine() -> list:
    for p in (PUBLIC / "output.json", DATA / "output.json"):
        if p.exists():
            with io.open(p, encoding="utf-8") as f:
                return json.load(f)
    return []


# ─── Selectie editoriala (determinista) ──────────────────────────────────────
def select_deals(magazine: list) -> list:
    """Alege cele mai bune oferte reale, diverse pe categorii, cu urgenta."""
    candidati = []
    for m in magazine:
        slug = m.get("magazin", "")
        if not slug_valid(slug):
            continue
        promos = m.get("promotii") or []
        if not promos:
            continue
        # cea mai buna promotie a magazinului: prefera cu cod, apoi cea care expira mai repede
        promos_sorted = sorted(
            promos,
            key=lambda p: (0 if p.get("cod_cupon") else 1,
                           p.get("zile_ramase", 999) if p.get("zile_ramase", 0) > 0 else 999),
        )
        best = promos_sorted[0]
        zile = best.get("zile_ramase", 0) or 0
        scor = 0
        if best.get("cod_cupon"):
            scor += 50
        if m.get("are_promotie"):
            scor += 20
        if 0 < zile <= 7:
            scor += 30  # urgenta = valoare editoriala
        scor += min(m.get("procent_succes", 0), 100) / 5
        scor += min(m.get("folosit_de", 0), 200) / 20
        if slug in BRANDURI_MARI:
            scor += 25  # nume cunoscut = valoare editoriala
        candidati.append({
            "scor": scor,
            "magazin": slug,
            "nume_afisat": nume_afisat(slug),
            "categorie": m.get("categorie", "Diverse"),
            "categorie_slug": m.get("categorie_slug", ""),
            "logo_url": m.get("logo_url", ""),
            "titlu": best.get("nume", "").strip(),
            "descriere": (best.get("descriere", "") or "").strip(),
            "cod": (best.get("cod_cupon") or "").strip() if isinstance(best.get("cod_cupon"), str) else "",
            "url": f"https://amcupon.ro/cod-reducere/{slug}",
            "zile_ramase": zile,
            "procent_succes": m.get("procent_succes", 0),
        })

    candidati.sort(key=lambda c: -c["scor"])

    # Diversitate: max 1 per categorie pana umplem N_PICKS, apoi completam
    picks, vazute_cat = [], set()
    for c in candidati:
        cat = c["categorie"]
        if cat in vazute_cat:
            continue
        vazute_cat.add(cat)
        picks.append(c)
        if len(picks) >= N_PICKS:
            break
    if len(picks) < N_PICKS:
        for c in candidati:
            if c not in picks:
                picks.append(c)
            if len(picks) >= N_PICKS:
                break
    return picks


# ─── Voce: AI (Claude) cu fallback determinist ───────────────────────────────
EDITORIAL_SYSTEM = (
    "Esti redactorul-sef al AmCupon.ro, locul unde se aleg si se verifica cele "
    "mai bune oferte de shopping din Romania. Scrii in romana, la persoana intai "
    "plural ('am verificat', 'alegem'), ca un prieten priceput care a trecut deja "
    "prin oferte si stie care merita. Ton: clar, taios, util, ZERO hype publicitar, "
    "fara superlative goale ('incredibil', 'senzational'). Esti onest si cand o "
    "oferta e doar 'ok'. Fara emoji in exces (max 1-2). Nu inventezi cifre."
)


def genereaza_voce_ai(picks: list, data_str: str) -> dict | None:
    try:
        import anthropic
    except ImportError:
        return None
    api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
    if not api_key:
        return None

    lista = "\n".join(
        f"{i+1}. {p['nume_afisat']} ({p['categorie']}) — \"{p['titlu']}\""
        f"{' [cod: ' + p['cod'] + ']' if p['cod'] else ''}"
        f"{' — expira in ' + str(p['zile_ramase']) + ' zile' if 0 < p['zile_ramase'] <= 14 else ''}"
        for i, p in enumerate(picks)
    )
    prompt = (
        f"Azi e {data_str}. Acestea sunt ofertele pe care le-am selectat pentru "
        f"Radarul AmCupon de azi:\n\n{lista}\n\n"
        "Scrie un JSON valid, fara text in plus, cu structura exacta:\n"
        '{\n'
        '  "intro": "2-3 fraze de deschidere cu voce, despre ce iese in evidenta azi (mentioneaza 1-2 oferte concrete pe nume)",\n'
        '  "takes": ["verdict scurt de o fraza pentru oferta 1", "... oferta 2", ...],\n'
        '  "outro": "o fraza scurta de incheiere + indemn discret sa revina maine la Radar"\n'
        '}\n'
        f"Trebuie sa fie exact {len(picks)} verdicte in 'takes', in ordinea ofertelor. "
        "Fiecare verdict spune pe scurt CINE ar trebui sa profite sau DE CE conteaza, nu repeta titlul."
    )
    try:
        client = anthropic.Anthropic(api_key=api_key)
        msg = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=1200,
            system=EDITORIAL_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = "".join(b.text for b in msg.content if getattr(b, "type", "") == "text").strip()
        # extrage primul bloc { ... }
        start, end = raw.find("{"), raw.rfind("}")
        if start == -1 or end == -1:
            return None
        parsed = json.loads(raw[start:end + 1])
        takes = parsed.get("takes") or []
        if not parsed.get("intro") or len(takes) < len(picks):
            return None
        return {"intro": parsed["intro"].strip(),
                "takes": [t.strip() for t in takes[:len(picks)]],
                "outro": (parsed.get("outro") or "").strip(),
                "sursa": "ai"}
    except Exception as e:
        print(f"  (AI voce esuata: {e} — folosesc fallback)")
        return None


_TAKE_CAT = {
    "Fashion": "Bun de prins daca oricum voiai sa-ti reimprospatezi garderoba.",
    "Frumusete": "Merita daca esti deja pe lista de cumparaturi cosmetice luna asta.",
    "Electronice": "Verifica pretul si la concurenta, dar reducerea e reala.",
    "Carti": "Ocazie buna sa-ti faci stocul de lectura fara sa platesti plin.",
    "Sport": "Util daca tocmai ti-ai propus sa te apuci serios de miscare.",
    "Casa": "Practic pentru orice ai de bifat prin casa zilele astea.",
    "Copii": "De luat in calcul daca ai un eveniment sau o zi de nastere aproape.",
    "Farmacie": "Bun pentru reaprovizionare la lucrurile pe care le iei oricum.",
}


def genereaza_voce_fallback(picks: list, data_str: str) -> dict:
    top = picks[0]["nume_afisat"] if picks else "magazinele partenere"
    al2 = picks[1]["nume_afisat"] if len(picks) > 1 else ""
    intro = (
        f"Am trecut azi prin ofertele active si am pastrat doar ce merita. "
        f"Iese in evidenta {top}"
        + (f" si {al2}" if al2 else "")
        + ", dar mai jos ai selectia completa, verificata de noi. "
        "Toate codurile sunt testate; cele cu termen scurt le-am marcat."
    )
    takes = []
    for p in picks:
        t = _TAKE_CAT.get(p["categorie"], "Oferta verificata — buna daca te incadrezi in categorie.")
        zile = p["zile_ramase"]
        if 0 < zile <= 5:
            unit = "zi" if zile == 1 else "zile"
            t = f"Grabeste-te: expira in {zile} {unit}. " + t
        takes.append(t)
    outro = "Revino maine la Radar — alegem din nou ce merita, ca sa nu cauti tu prin sute de oferte."
    return {"intro": intro, "takes": takes, "outro": outro, "sursa": "fallback"}


# ─── Main ────────────────────────────────────────────────────────────────────
def main():
    magazine = load_magazine()
    if not magazine:
        print("output.json gol/lipsa — skip digest.")
        return

    picks = select_deals(magazine)
    if not picks:
        print("Nicio oferta valida pentru digest azi — skip.")
        return

    now = datetime.now()
    data_str = f"{now.day} {LUNI_RO[now.month - 1]} {now.year}"

    voce = genereaza_voce_ai(picks, data_str) or genereaza_voce_fallback(picks, data_str)
    takes = voce["takes"]
    for i, p in enumerate(picks):
        p["take"] = takes[i] if i < len(takes) else ""

    digest = {
        "data": now.strftime("%Y-%m-%d"),
        "data_afisata": data_str,
        "titlu": f"Radarul AmCupon — {data_str}",
        "intro": voce["intro"],
        "picks": picks,
        "outro": voce["outro"],
        "sursa_voce": voce["sursa"],
    }

    PUBLIC.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(parents=True, exist_ok=True)
    with io.open(PUBLIC / "digest-today.json", "w", encoding="utf-8") as f:
        json.dump(digest, f, ensure_ascii=False, indent=2)

    # Varianta text (Telegram/newsletter)
    linii = [f"📡 {digest['titlu']}", "", digest["intro"], ""]
    for i, p in enumerate(picks, 1):
        cod = f" — cod: {p['cod']}" if p["cod"] else ""
        linii.append(f"{i}. {p['nume_afisat']}{cod}")
        linii.append(f"   {p['take']}")
        linii.append(f"   {p['url']}")
        linii.append("")
    linii.append(digest["outro"])
    with io.open(DATA / "digest-today.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(linii))

    print(f"Digest scris: {len(picks)} oferte | voce: {voce['sursa']}")
    print(f"  {PUBLIC / 'digest-today.json'}")
    print(f"  {DATA / 'digest-today.txt'}")


if __name__ == "__main__":
    main()
