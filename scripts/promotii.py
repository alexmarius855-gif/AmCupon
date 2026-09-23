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


# ─── Texte scrise pentru AFILIATI, nu pentru cumparatori ──────────────────────
# Masurat 24.09.2026 pe output.json: retelele pun uneori in campul promotiei descrierea
# PROGRAMULUI, adresata noua. Pe site aparea, sub butonul „Vezi oferta":
#   · interlink.ro  „Promovează produsele Interlink și câștigă comisioane din fiecare vânzare
#                    validă ... materiale de marketing dedicate ... pentru a genera conversii"
#   · femieko.ro    „Provocarea Femieko 2026 – Câștigă premii și comision de 19%!"
#   · gl-inet.com   „Earn More with LWR01 ... affiliates earn an increased commission on every
#                    eligible sale. Update your content and start promoting today."
# Regula proiectului: comisionul nostru nu se publica — nici cand il scrie reteaua.
# Tiparele sunt CONTEXTUALE, nu cuvinte izolate: „fără comision" la un card bancar, „direct
# de la editură" la o librarie sau „20% off eligible sale items" sunt texte pentru cumparator.
RE_PENTRU_AFILIATI = re.compile(r"""
      c[aâ][sșş]tig\w*\b[^.!?]{0,40}\bcomision        # „câștigă (premii și) comision(ul)"
    | \bpromov(?:ea|a)z[aăe]\w*\s+(?:produsele|magazinul|oferta|ofertele|brandul|campania|campaniile)
    | \bv[aâ]nz[aă]r(?:e|ea|i|ile)\s+valid              # „din fiecare vânzare validă"
    | \bmateriale(?:le)?\s+(?:de\s+)?marketing
    | \bgener\w*\s+(?:de\s+)?conversii
    | \bprogram\w*\s+de\s+afiliere
    | \bearn\w*\b[^.!?]{0,60}\bcommission               # „affiliates earn an increased commission"
    | \bcommissions?\b[^.!?]{0,40}\b(?:per|on|for)\s+(?:every|each)\b
    | \baffiliates?\s+(?:can\s+|will\s+|now\s+)?(?:earn|receive|get)\b
    | \b(?:drive|boost)\s+(?:more\s+)?conversions\b
    | \bstart\s+promoting\b
    | \bupdate\s+your\s+(?:content|links|banners)\b
""", re.I | re.X)
# Titlu care incepe cu castigul („Earn More with LWR01") — conteaza DOAR daca promotia are deja
# un semnal de mai sus. Singur ar prinde si concursurile pentru cumparatori („Câștigă o vacanță").
RE_TITLU_CASTIG = re.compile(r"^\W*(?:earn|c[aâ][sșş]tig)", re.I)
RE_MARKDOWN = re.compile(r"(\*\*|__)(\S(?:.*?\S)?)\1", re.S)

# Text UTF-8 citit ca Latin-1 („rÃ©duction", „31/08/2026 â\x80\x93 15/10/2026"). Masurat 24.09.2026:
# insotelhotelgroup.com afisa „Jusqu'Ã 45 % de rÃ©duction" — si, fiindcă „jusqu'à" nu se mai
# recunostea, valoarea iesea „-45%" in loc de „până la 45%". Un caracter stricat = 2-3 caractere
# care, recodate Latin-1, formeaza UTF-8 valid.
RE_MOJIBAKE = re.compile("[Â-ß][\u0080-¿]|[à-ï][\u0080-¿]{2}")
# Semnul SIGUR ca un text e stricat: caractere de control C1 (U+0080-U+009F, nu apar niciodata in
# text real) sau „Ã" urmat de ©, ®, ¨... Fara el nu se atinge nimic: franceza corecta are des
# „É" + spatiu neintrerupt („ÉTÉ :"), pe care reparatia l-ar transforma in „ɠ". Aceeasi expresie
# in frontend/lib/oferteAcasa.ts (acolo doar ca sa nu clasifice textul stricat drept romanesc).
RE_MOJIBAKE_SIGUR = re.compile("[\u0080-\u009f]|Ã[ -¿]")


def repara_mojibake(text: str) -> str:
    """Secventa cu secventa, nu tot textul: la insotel sirul intreg nu se poate recoda, fiindca
    feed-ul a transformat si spatiul neintrerupt din „à" (C3 A0) in spatiu obisnuit. Ce nu
    formeaza UTF-8 valid ramane neatins — „Câștigă", „café", „MAÇÃ" trec neschimbate."""
    if not RE_MOJIBAKE_SIGUR.search(text):
        return text

    def unul(mt):
        try:
            return mt.group(0).encode("latin-1").decode("utf-8")
        except UnicodeError:
            return mt.group(0)

    reparat = RE_MOJIBAKE.sub(unul, text)
    # „Ã" + spatiu = „à" cu NBSP-ul pierdut. Doar in text care avea deja caractere stricate:
    # singur, „Ã " poate fi portugheza scrisa cu majuscule.
    return re.sub(r"Ã (?=\S)", "à ", reparat)


def fara_markdown(text: str) -> str:
    """„de la doar **159,99 lei**" -> „de la doar 159,99 lei". Pe site asteriscurile se vedeau brute."""
    return RE_MARKDOWN.sub(r"\2", text)


def _fraze(text: str) -> list:
    return [f for f in re.split(r"(?<=[.!?])\s+", text.strip()) if f]


def _cheie(text: str) -> str:
    """Litere si cifre, fara diacritice: „Interlink.ro" / „INTERLINK" -> „interlinkro" / „interlink"."""
    import unicodedata
    fara = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]", "", fara.lower())


def _doar_numele_magazinului(titlu: str, m: dict) -> bool:
    t = _cheie(titlu)
    slug = (m.get("magazin") or "").lower()
    return bool(t) and t in {_cheie(slug), _cheie(slug.split(".")[0]), _cheie(nume_afisabil(m))}


def text_pentru_afiliati(p: dict, m: dict):
    """None = promotia e scrisa pentru cumparator. ("scoate", motiv) = nu e o oferta, e descrierea
    programului de afiliere. ("curata", descriere_noua) = oferta reala, cu fraze pentru afiliati
    in descriere, care se scot. Titlul nu se rescrie niciodata: n-avem de unde, fara sa inventam."""
    nume = p.get("nume") if isinstance(p.get("nume"), str) else ""
    desc = p.get("descriere") if isinstance(p.get("descriere"), str) else ""
    fraze = _fraze(desc)
    marcate = [f for f in fraze if RE_PENTRU_AFILIATI.search(f)]
    if not RE_PENTRU_AFILIATI.search(nume) and not marcate:
        return None
    if RE_PENTRU_AFILIATI.search(nume) or RE_TITLU_CASTIG.search(nume):
        return ("scoate", "titlul e pentru afiliati")
    if _doar_numele_magazinului(nume, m):
        return ("scoate", "titlul e doar numele magazinului, iar descrierea e pentru afiliati")
    rest = " ".join(f for f in fraze if f not in marcate)
    if not rest and not nume.strip() and not str(p.get("cod_cupon") or "").strip():
        return ("scoate", "fara titlu si fara cod, iar descrierea era doar pentru afiliati")
    return ("curata", rest)


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
    """In-place. Scoate promotiile expirate si pe cele scrise pentru afiliati, curata textul
    (markdown, fraze pentru afiliati), recalculeaza `zile_ramase` din `expira` si flag-urile de
    magazin. Idempotent. Intoarce ce a schimbat, ca sa se vada in log."""
    azi = azi or azi_utc()
    st = {"expirate": 0, "zile_recalculate": 0, "fara_data": 0, "data_absurda": 0, "flaguri": 0,
          "markdown": 0, "mojibake": 0, "afiliati_scoase": [], "afiliati_curatate": 0, "magazine_golite": []}
    for m in magazine:
        if not isinstance(m, dict):
            continue
        vechi = m.get("promotii") if isinstance(m.get("promotii"), list) else []
        pastrate = []
        for p in vechi:
            if not isinstance(p, dict):
                continue
            for k in ("nume", "descriere"):
                if not isinstance(p.get(k), str):
                    continue
                reparat = repara_mojibake(p[k])
                if reparat != p[k]:
                    p[k] = reparat
                    st["mojibake"] += 1
                if "**" in p[k] or "__" in p[k]:
                    curat = fara_markdown(p[k])
                    if curat != p[k]:
                        p[k] = curat
                        st["markdown"] += 1
            verdict = text_pentru_afiliati(p, m)
            if verdict and verdict[0] == "scoate":
                st["afiliati_scoase"].append(f"{m.get('magazin', '?')} ({verdict[1]})")
                continue
            if verdict:
                p["descriere"] = verdict[1]
                st["afiliati_curatate"] += 1
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
            f"fara data (fara contor): {st['fara_data']}, flaguri de magazin corectate: {st['flaguri']}, "
            f"markdown curatat: {st['markdown']}, texte cu caractere stricate reparate: {st['mojibake']}, "
            f"descrieri curatate de fraze pentru afiliati: {st['afiliati_curatate']}"
            + (f"\n  promotii scrise pentru afiliati, scoase: {len(st['afiliati_scoase'])} — "
               + "; ".join(st["afiliati_scoase"][:10]) if st["afiliati_scoase"] else "")
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
