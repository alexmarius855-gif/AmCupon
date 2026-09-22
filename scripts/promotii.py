"""
Sursa UNICA pentru valabilitatea unei promotii si pentru felul in care o citeste un canal extern.

Folosita de `merge_platforms.py` si `import_csv_promotii.py` (ultimii care scriu output.json),
de `verifica_promotii.py` (garda din CI) si de scripturile de Telegram.

DE CE EXISTA — masurat 16.09.2026 pe amcupon.ro, nu presupus:
  · 58 din 336 de promotii erau expirate dupa propria lor data `expira`; 9 magazine aveau pe
    primul loc o oferta expirata. /cod-reducere/nadula.com scria „4 coduri active, expira in
    2 zile" — codurile altui brand (Klaiyi), expirate intre 9 si 14.09.
  · Cauza: `fetch_impact_deals.py` doar ADAUGA promotii, iar `zile_ramase` se calcula o singura
    data, la atasare. output.json si extra_merchants.json sunt si intrare si iesire
    (docs/LECTII-TEHNICE.md #5), deci o promotie ramanea pentru totdeauna, cu acelasi contor.
  · 9 promotii manuale din 12.06 aveau `zile_ramase` fix (7, 14, 30): un contor care nu scade.
  · temu.com, shein.com, trendyol.com aveau `cod_cupon: true` fara niciun cod.

REGULA: `zile_ramase` se DERIVA din `expira` la fiecare rulare, niciodata nu se pastreaza.
Fara `expira` nu avem ce numara: promotia primeste FARA_DATA, pe care frontend-ul o afiseaza
„Ofertă activă", fara contor (`PRAG_FARA_CIFRA` din frontend/lib/expirarePromo.ts). Flag-urile
de magazin se recalculeaza din promotiile ramase.
"""

import re
from datetime import date, datetime, timezone

from reconcile_impact_links import domain_from_url, etld1

# = PRAG_FARA_CIFRA din frontend/lib/expirarePromo.ts: de la 99 in sus nu se afiseaza nicio cifra.
FARA_DATA = 99

# Peste atat, `expira` nu mai e o data — e un artefact de feed. Masurat 22.09.2026:
# avidlove.com „3661 zile” (anul 2036), helloice.com 1468, in total 11 promotii.
# UI-ul le plafoneaza deja la afisare (etichetaExpirare), deci nu se vede nimic gresit
# pe site — dar valoarea ramane gresita in date, iar urmatorul consumator (newsletter,
# Telegram, un export viitor) nu are de unde sti sa plafoneze. Se repara unde s-a nascut:
# data absurda = data necunoscuta, exact ca lipsa ei.
PRAG_DATA_ABSURDA = 1095  # 3 ani


def azi_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


def zile_pana_la(expira, azi: str):
    """Zile de azi pana la `expira` (0 = expira azi, negativ = expirata). None fara data valida."""
    if not isinstance(expira, str) or len(expira) < 10:
        return None
    try:
        return (date.fromisoformat(expira[:10]) - date.fromisoformat(azi)).days
    except ValueError:
        return None


def curata_promotii(magazine: list, azi: str = None) -> dict:
    """In-place. Scoate promotiile expirate, recalculeaza `zile_ramase` din `expira` si
    flag-urile de magazin. Idempotent. Intoarce ce a schimbat, ca sa se vada in log."""
    azi = azi or azi_utc()
    st = {"expirate": 0, "zile_recalculate": 0, "fara_data": 0, "data_absurda": 0, "flaguri": 0, "magazine_golite": []}
    for m in magazine:
        if not isinstance(m, dict):
            continue
        vechi = m.get("promotii") if isinstance(m.get("promotii"), list) else []
        pastrate = []
        for p in vechi:
            if not isinstance(p, dict):
                continue
            zile = zile_pana_la(p.get("expira"), azi)
            if zile is not None and zile > PRAG_DATA_ABSURDA:
                st["data_absurda"] += 1
                zile = None
            if zile is None:
                if p.get("zile_ramase") != FARA_DATA:
                    st["fara_data"] += 1
                p["zile_ramase"] = FARA_DATA
            elif zile < 0:
                st["expirate"] += 1
                continue
            else:
                if p.get("zile_ramase") != zile:
                    st["zile_recalculate"] += 1
                p["zile_ramase"] = zile
            pastrate.append(p)
        if vechi and not pastrate:
            st["magazine_golite"].append(m.get("magazin", "?"))
        m["promotii"] = pastrate
        flaguri = (
            bool(pastrate),
            any((p.get("cod_cupon") or "").strip() for p in pastrate),
            min((p["zile_ramase"] for p in pastrate), default=FARA_DATA),
        )
        if (m.get("are_promotie"), m.get("cod_cupon"), m.get("zile_ramase")) != flaguri:
            st["flaguri"] += 1
        m["are_promotie"], m["cod_cupon"], m["zile_ramase"] = flaguri
    return st


def raport(st: dict) -> str:
    golite = st["magazine_golite"]
    return (f"promotii expirate scoase: {st['expirate']}, zile recalculate: {st['zile_recalculate']}, "
            f"date absurde (>3 ani) tratate ca necunoscute: {st['data_absurda']}, "
            f"fara data (fara contor): {st['fara_data']}, flaguri de magazin corectate: {st['flaguri']}"
            + (f"\n  magazine ramase fara promotii: {len(golite)} ({', '.join(golite[:10])}"
               f"{'...' if len(golite) > 10 else ''})" if golite else ""))


# ─── Afisare in canale externe (Telegram, postari) ────────────────────────────

def titlu_afisabil(p: dict) -> str:
    """Titlul unei promotii pentru un cititor. La Impact, `nume` e des doar codul
    („DH2026SEPSAVE3", „impact-ALL-20-honey"), iar oferta reala sta in `descriere`
    („Save $3 on orders over $29 ..."). Un titlu fara niciun spatiu e un cod, nu o fraza."""
    nume = (p.get("nume") or "").strip()
    descriere = re.sub(r"\s+", " ", (p.get("descriere") or "")).strip()
    if descriere and (not nume or " " not in nume):
        return descriere
    return nume or descriere


def nume_afisabil(m: dict) -> str:
    """„eur.vevor.com" -> „Vevor", nu „Eur"; „store.boyamic.com" -> „Boyamic"."""
    slug = m.get("magazin") or ""
    baza = etld1(domain_from_url(m.get("url") or "") or slug) or slug
    return baza.split(".")[0].replace("-", " ").title()
