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
from datetime import date, datetime, timedelta, timezone

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
    | (?<![\d.,])[1-9]\d?(?:[.,]\d+)?\s*%\s*comision     # „îți aduce 19% comision" (0% comision e pentru client)
    | \bcomision\w*\s+(?:de\s+)?[1-9]\d?(?:[.,]\d+)?\s*%  # „Comision 8%"
    | \bcomision\w*\s+(?:de\s+afiliere|acordat|majorat|m[aă]rit|crescut)
    | \bm[aă]rit\s+comision
    | ^\W*promov(?:ea|a)z[aă]\b                       # „Promovează Abonamentul Femi.Eko ca soluția..."
    | \byour\s+audience\b                            # „Your audience can save $300" (Impact)
    | \bq[1-4]\s+opportunity\b                        # „Q4 opportunity: Promovează ștergătoarele"
    | \bofer[aă]-le\s+clien                           # „Oferă-le clienților tăi"
    | \bspor\s+la\s+conversii                         # „Spor la conversii, echipa LIBRARIE.net"
    | \bpartenerii?\s+no[sș]tri\b                     # „Avem vești bune pentru partenerii noștri"
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


# ─── Promotii pentru ALTA piata (alta limba, moneda altei tari) ───────────────
# Masurat 18.10.2026 pe output.json: 7 promotii pe 3 magazine, toate trei cu articol de blog:
#   · vidaxl.bg   „Абонирайте се за нашия бюлетин днес & получавате отстъпка от 10 лв. при
#                 регистрация!", „10% намаление" — oferte pentru Bulgaria, in leva;
#   · ikier.com   „Ahorra $1,999 MXN en iKier K1 Pro Max 70W con código AFFK11999" (x4) —
#                 magazinul din Mexic (mx.ikier.com), in pesos;
#   · italki.com  „10 EUR Rabatt auf 20 EUR MBW" — pagina germana (italki.com/de).
# Retelele (2Performant e in RO, BG si HU; Impact e global) dau campania cu promotiile TUTUROR
# pietelor ei. Un cumparator din Romania nu poate folosi o oferta in leva sau in pesos.
# Se scoate PROMOTIA, nu magazinul: vidaxl.bg are in aceeasi campanie si promotii romanesti
# (codul OFERTE01, „25 Lei la inscriere"), ikier.com are coduri in engleza pentru EU.
# Engleza, EUR, USD si GBP raman: sunt limba si monedele magazinelor internationale cu livrare in
# Romania (programul lor acopera Romania — link_oferta.livreaza_in_romania), politica din 15.10.
# Cuvintele sunt alese sa NU existe in romana sau engleza: „rabatt" cu doi t (romana are „rabat"),
# „réduction"/„envío" doar cu accent (engleza are „reduction"), fara „gratis" (e si romanesc).
RE_ALFABET_STRAIN = re.compile(r"[\u0370-\u03FF\u0400-\u04FF]")  # grecesc, chirilic
_MONEDE_STRAINE = r"лв\.?|leva|BGN|HUF|forint|zł|PLN|Kč|CZK|MXN|CAD|AUD|INR|₹|CHF|R\$|BRL"
# Suma intreaga, nu o bucata dintr-un cod: „1,999 MXN", „10 лв.", „BGN 20" — dar nu „CAD10" sau
# „AFF10PLN" (coduri de cupon). Moneda in fata cere spatiu; simbolurile (₹, R$) pot sta lipite.
RE_MONEDA_STRAINA = re.compile(
    rf"(?<!\w)\d[\d.,]*\s?(?:{_MONEDE_STRAINE})(?!\w)"
    rf"|(?<!\w)(?:{_MONEDE_STRAINE})\s\d[\d.,]*|(?:₹|R\$)\d", re.I)
LIMBI_STRAINE = {
    "spaniola": r"ahorra|código|descuento|envío",
    "germana": r"rabatt|versand|kostenlos|gutschein|für",
    "franceza": r"réduction|livraison|jusqu'à|remise",
    "italiana": r"sconto|spedizione",
    "olandeza": r"korting|verzending",
    "maghiara": r"kedvezmény|ingyenes|szállítás|akció",
    "poloneza": r"zniżka|darmowa|rabatowy",
    "ceha": r"sleva|slevový|zdarma",
    "portugheza": r"desconto|grátis",
}
RE_LIMBI_STRAINE = {limba: re.compile(rf"(?<!\w)(?:{cuv})(?!\w)", re.I) for limba, cuv in LIMBI_STRAINE.items()}


def pentru_alta_piata(text: str):
    """None = text care poate fi o oferta pentru un cumparator din Romania. Altfel motivul
    („alfabet chirilic", „moneda: 10 лв.", „limba spaniola: ahorra"). Folosita de curata_promotii
    (sursa), de istoric_promotii (tot istoricul) si de verifica_promotii (garda, si pe articole)."""
    text = text or ""
    if RE_ALFABET_STRAIN.search(text):
        return "alfabet chirilic/grecesc"
    mt = RE_MONEDA_STRAINA.search(text)
    if mt:
        return f"moneda altei tari: {mt.group(0)}"
    for limba, rx in RE_LIMBI_STRAINE.items():
        mt = rx.search(text)
        if mt:
            return f"limba {limba}: {mt.group(0)}"
    return None


def promotie_pentru_alta_piata(p: dict):
    return pentru_alta_piata(f"{p.get('nume') or ''} {p.get('descriere') or ''}")


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


# 07.10.2026: 59 de promotii Impact (DHgate & co.) aveau `cod_cupon` gol, iar codul era chiar TITLUL
# („DH2026OCTSAVE3"), repetat in descriere („using coupon DH2026OCTSAVE3"). Pe site, titlul arata codul
# intreg (fara clic pe linkul platit), iar oferta nu se numara ca „cu cod". Codul trece in `cod_cupon`
# DOAR cand descrierea il numeste langa „coupon/code/cod/codul" — semn sigur ca e un cod, nu un nume.
_RE_TITLU_COD = re.compile(r"[A-Z0-9][A-Z0-9_-]{2,}", re.I)


# 07.10.2026 (a doua trecere): codul scris IN text, cu `cod_cupon` gol — „Up To 20% OFF Sitewide With
# Code: KLAIYI20" (klaiyihair.com), „Use code DPR35" (kospet.com), „Coupon Code – AFFMASTER300"
# (ikier.com), „prin codul OFERTE01" (vidaxl.bg): 46 de promotii. Codul e cuvantul de DUPA
# „code/cod/codul" — cuvantul-cheie in orice forma, codul doar din MAJUSCULE si cifre, cu o cifra sau
# 4+ litere („with code: AFF20", nu „with code at checkout"). Titlul are prioritate (descrierea Klaiyi
# numeste doua coduri, titlul unul); doua coduri diferite in acelasi text = nu ghicim.
_RE_COD_IN_TEXT = re.compile(
    r"(?i:\b(?:(?:coupon|promo|discount|voucher)\s*)?(?:code|codul|cod))\s*[:：–—-]?\s*"
    r"([A-Za-z0-9][A-Za-z0-9_-]{2,})(?![\w-])")
_NU_SUNT_CODURI = {"NEEDED", "REQUIRED", "FREE", "SALE", "SHIPPING", "DEAL", "DEALS", "OFFER", "ONLY",
                   "APPLIED", "AUTO", "AUTOMATIC", "NONE", "BELOW", "ABOVE", "HERE", "LEI", "RON", "EUR", "USD"}


def coduri_in_text(text: str) -> list:
    """Codurile numite in text dupa „code/cod/codul", fara repetitii, in ordinea aparitiei."""
    gasite = []
    for m in _RE_COD_IN_TEXT.finditer(text or ""):
        c = m.group(1).rstrip("-_")
        if c.upper() in _NU_SUNT_CODURI or not re.search(r"\d|[A-Z]{4,}", c):
            continue
        if c not in gasite:
            gasite.append(c)
    return gasite


# 04.11.2026: codul scris FARA „code" in fata, ca lista de trepte. Flextail: „BF12 -- Extra 12% OFF on Any order
# BF15 -- Extra 15% OFF on Orders $90+"; Klaiyi: „17% OFF Sitewide: BF17; $30 OFF Orders Over $155: BF30";
# Valerion: „Screen discounts：AVACC88". Pe site se citeau intregi, fara clic pe linkul platit. Un cuvant cu
# majuscule si cifre nu ajunge („LABOR8 Signature", „RAY5 Laser", „- 26Q4" nu sunt coduri), deci se cere forma:
# cod + liniuta + Extra/Save/Get, sau reducere + doua puncte + cod la sfarsit de fraza.
_TOK_COD = r"(?=[A-Z0-9_-]*\d)(?=[A-Z0-9_-]*[A-Z])[A-Z0-9][A-Z0-9_-]{3,24}"
_RE_COD_TREAPTA = re.compile(rf"(?<![\w-])(?P<cod>{_TOK_COD})\s*(?:--+|[–—:：])\s*(?=(?i:extra|save|get)\b)")
_RE_COD_DUPA_REDUCERE = re.compile(
    r"(?P<inainte>(?i:\boff\b|\bdiscounts?\b|\breducere\b|\bsitewide\b)[^:：;.\n]{0,40})(?i:(?<!code)(?<!cod)(?<!codul)(?<!coupon)(?<!voucher))[:：]\s*"
    rf"(?P<cod>{_TOK_COD})(?=\s*(?:$|[;.]))")


def coduri_listate(text: str) -> list:
    """Codurile din lista de trepte, in ordinea din text, fara repetitii."""
    gasite = sorted(list(_RE_COD_TREAPTA.finditer(text or "")) + list(_RE_COD_DUPA_REDUCERE.finditer(text or "")),
                    key=lambda m: m.start("cod"))
    return list(dict.fromkeys(m.group("cod") for m in gasite))


def fara_coduri_listate(text: str, cod: str = "") -> str:
    """Textul fara codurile din lista. La „cod -- Extra N%" ramane doar treapta codului din `cod_cupon`: omul
    primeste un singur cod, iar „Extra 20%" langa un cod de 12% ar promite ce nu da codul."""
    if not coduri_listate(text):
        return text or ""
    trepte = list(_RE_COD_TREAPTA.finditer(text))
    t = text
    if trepte:
        i = next((k for k, m in enumerate(trepte) if m.group("cod") == cod), 0 if not cod else None)
        if i is None:
            t = _RE_COD_TREAPTA.sub("; ", text)
        else:
            final = trepte[i + 1].start() if i + 1 < len(trepte) else len(text)
            t = text[:trepte[0].start()] + text[trepte[i].end():final]
    t = _RE_COD_DUPA_REDUCERE.sub(lambda m: m.group("inainte"), t)
    t = re.sub(r"\s+([;,.])", r"\1", " ".join(t.split()))
    return t.lstrip(" ;:–—").rstrip(" ;:–—-")


def scurteaza(text: str, maxim: int) -> str:
    """Scurtat la sfarsit de fraza sau de cuvant, nu in mijlocul lui („Sute de a", articolele din 04.11)."""
    if len(text) <= maxim:
        return text
    taiat = text[:maxim]
    capat = max(taiat.rfind(". "), taiat.rfind("! "), taiat.rfind("? "))
    if capat >= maxim // 2:
        return taiat[:capat + 1]
    return taiat.rsplit(" ", 1)[0].rstrip(" ,;:-–—") + "…"


def cod_din_titlu(p: dict) -> bool:
    """Muta codul din titlu sau din text in `cod_cupon` (in-place). Intoarce True daca a mutat ceva."""
    if (p.get("cod_cupon") or "").strip():
        return False
    nume = (p.get("nume") or "").strip()
    desc = p.get("descriere") or ""
    if (_RE_TITLU_COD.fullmatch(nume) and re.search(r"\d|[A-Z]{4,}", nume)
            and re.search(rf"\b(?:coupon|code|codul|cod)\s*:?\s*{re.escape(nume)}(?![\w-])", desc, re.I)):
        p["cod_cupon"] = nume
        return True
    coduri = coduri_in_text(nume) or coduri_in_text(desc)
    if len(coduri) == 1:
        p["cod_cupon"] = coduri[0]
        return True
    # Lista de trepte: primul cod, cel cu pragul cel mai mic. Textul ramane doar pentru el (fara_coduri_listate).
    listate = [] if coduri else (coduri_listate(nume) or coduri_listate(desc))
    if listate:
        p["cod_cupon"] = listate[0]
        return True
    return False


# 07.10.2026: „USD $0 Off Coupon Code: CHAU21" (geekbuying.com) — o reducere de zero nu e o oferta.
_RE_VALOARE_ZERO = re.compile(
    r"(?i)(?:\b(?:USD|EUR|RON)\s*)?[$€£]\s*0(?:[.,]0+)?\s+off\b"
    r"|(?<![\d.,])0(?:[.,]0+)?\s*(?:%|\$|€|lei|ron)\s+(?:off|reducere|discount)\b"
    r"|\breducere\s+de\s+0(?:[.,]0+)?\s*(?:lei|ron|%)")


def valoare_zero(p: dict) -> bool:
    return bool(_RE_VALOARE_ZERO.search(f"{p.get('nume') or ''} {p.get('descriere') or ''}"))


# ─── Datele din 2Performant: acelasi moment, oricare ar fi drumul ─────────────────
# API-ul scrie „2026-11-07T22:00:00Z", exportul CSV „2026-11-07 22:00:00 UTC". Pana pe 04.11.2026 doar
# CSV-ul trecea prin regulile de mai jos: 34 din cele 39 de oferte programate erau deja pe site prin API
# (Black Friday la DoctorShield, care incepe pe 20.11), iar ofertele API dispareau cu o zi inainte de final.
def data_csv(raw: str) -> datetime | None:
    """Oricare dintre cele doua formate -> datetime cu fus orar; None daca lipseste sau nu se poate citi."""
    if not isinstance(raw, str) or not raw.strip():
        return None
    text = raw.strip().replace(" UTC", "+00:00").replace("Z", "+00:00").replace(" ", "T", 1)
    try:
        d = datetime.fromisoformat(text)
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def ora_ro(d: datetime) -> datetime:
    """UTC -> ora Romaniei (EET/EEST, regula UE: ora de vara intre ultima duminica din martie si ultima
    duminica din octombrie, la 01:00 UTC). Fara tzdata, care lipseste pe Windows. 28.10 22:00 UTC = 29.10
    00:00 in Romania — data luata din UTC ar fi pus evoMAG cu o zi mai devreme decat anuntul lui."""
    def ultima_duminica(luna: int) -> datetime:
        z = datetime(d.year, luna, 31, 1, tzinfo=timezone.utc)
        return z.replace(day=31 - (z.weekday() + 1) % 7)
    vara = ultima_duminica(3) <= d.astimezone(timezone.utc) < ultima_duminica(10)
    return d.astimezone(timezone(timedelta(hours=3 if vara else 2)))


def sfarsit_real(raw: str) -> datetime | None:
    """Sfarsitul unei promotii, in ora Romaniei. Magazinele aleg doar ZIUA in 2Performant, care o scrie la
    00:00 ora Romaniei: la Otter, „pana pe 8 noiembrie, ora 23:59" are sfarsitul 2026-11-07 22:00 UTC, adica
    8.11 00:00. Luata ca atare, oferta disparea cu o zi inainte de final (masurat 04.11.2026 pe textele a 20
    de campanii: „6-8 noiembrie" -> 7, „2-15 noiembrie" -> 14). 00:00 = toata ziua aceea."""
    d = data_csv(raw)
    if d is None:
        return None
    ro = ora_ro(d)
    return ro.replace(hour=23, minute=59) if (ro.hour, ro.minute) == (0, 0) else ro


def inceput_in_viitor(start_raw: str, now: datetime) -> bool:
    """True cand promotia are data de start si ea e dupa `now`. Fara data = activa (ca pana acum)."""
    d = data_csv(start_raw)
    return d is not None and d > now


# ─── Campurile 2Performant pentru cumparator ──────────────────────────────────
# Masurat 04.11.2026: API-ul trimitea text pentru client la 167 din 171 de promotii si cod la 24, dar
# fetch_2p_api.py citea `description` (nu exista) si `affiliate_challenge` (e un da/nu, nu un cod). Rezultat:
# 146 de oferte pe site, 0 cu descriere, 0 cu cod. Garda: verifica_promotii.py::api_fara_text.
def cod_din_camp(raw) -> str:
    """Codul din campul retelei, daca arata a cod. „10" la pickndazzle.com sau o fraza nu sunt coduri pe care
    un om sa le poata folosi: fara ele, oferta ramane o oferta (regula „zero informatii eronate")."""
    if not isinstance(raw, str):
        return ""
    cod = raw.strip()
    return cod if re.fullmatch(r"[A-Za-z0-9_\-]{3,30}", cod) and re.search(r"[A-Za-z]", cod) else ""


RE_EMOJI = re.compile("[\U0001F000-\U0001FAFF☀-➿️]")


# Campul „pentru client" din 2P e scris des tot pentru noi: „Bună ziua, ... Clienții pe care îi aduceți",
# „Am mărit comisionul", „Avantaje care te ajută să convertești". Fraza respectivă nu se publică.
RE_CATRE_AFILIATI = re.compile(
    r"\b(bun[aă] ziua|bun[aă] tuturor|salutare|hi everyone|clien[tț]ii pe care|aduce[tț]i|comision\w*|"
    r"converte\w*|converti\w*|conversii?|link\s+promo[tț]ie|afilia\w*|bannere?|landing|dvs\.?|v[aă] rug[aă]m|colabor\w*|clientul|"
    r"dorim s[aă] v[aă]|pentru voi|oportunitate|de a genera|genera[tț]i|pentru promovare|[iî]n comunicare(?=,)|scaneaz[aă] codul|tot nu e destul|influencer\w*|ar[aă]t[aă] cum te ajut[aă]|include [iî]ntotdeauna)\b", re.I)
# Promisiuni pe care nu le putem susține, chiar dacă le scrie magazinul (regula „zero informații eronate").
RE_PROMISIUNE = re.compile(r"\b(garantat\w*|garan[tț]ia celui|cel mai mic pre[tț]|cele mai mici pre[tț]uri|"
                           r"cele? mai (mari?|bune)|celor mai mari|cel mai mare|cea mai (mare|a[sș]teptat[aă])|imbatabil\w*)\b", re.I)
# „folosind codul: " rămas fără cod, după ce codul a fost scos din text. NU „fără cod": acolo e o informație.
RE_COD_ORFAN = re.compile(r"\s*\b(?:folosind|cu|utilizând|aplic[aâ]nd)\s+(?:codul|cod)(?:\s+de\s+reducere)?\s*:?\s*(?=[.!,;]|[A-ZĂÂÎȘȚ]|$)")
RE_SALUT = re.compile(r"^(?:bun[aă]|salut|dragi \w+)\s*[,!]\s*", re.I)
RE_CUM_FUNCTIONEAZA = re.compile(r"^cum func[tț]ioneaz[aă]\s*:\s*-?\s*", re.I)
# Semnatura unui mesaj catre afiliati: „Echipa LIBRARIE.net", „Cu drag, Echipa Under Armour".
RE_SEMNATURA = re.compile(r"^\W*(?:cu drag\b|echipa(?:\s+\S+){1,8}\s*$)", re.I)
# Ce ramane cand codul scos statea intre ghilimele: „Extra 15% cu codul \"\" la produsele...".
RE_GHILIMELE_GOALE = re.compile(r"(?:\s*\b(?:cu\s+)?(?:codul|cod)\b)?\s*[\"„“”«»'’]\s*[\"„“”«»'’]")
RE_LINK_BRUT = re.compile(r"(?:>>+\s*)?(?:https?://|www\.)\S+", re.I)
MAX_DESCRIERE = 450


def descriere_publica(desc: str, promo: dict) -> str:
    """Textul magazinului despre campanie, doar ce e pentru cumpărător: fără coduri în clar (le vede pe
    pagina magazinului, după linkul plătit), fără fraze adresate afiliaților, fără promisiuni."""
    t = RE_EMOJI.sub("", fara_markdown(repara_mojibake(desc or "")))
    # Linkurile brute din text („>> https://noriel.ro/oferte") ar trimite omul la magazin fara comision.
    t = re.sub(r"\s+", " ", RE_LINK_BRUT.sub(" ", t)).strip()
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)  # „etichete , cititoare": spatiul ramas dupa emoji scos
    t = fara_coduri_listate(t, (promo.get("cod_cupon") or "").strip())
    if not t or pentru_alta_piata(t):
        return ""
    fraze = [f for f in re.split(r"(?<=[.!?])\s+", t)
             if not RE_PENTRU_AFILIATI.search(f) and not RE_CATRE_AFILIATI.search(f)
             and not RE_PROMISIUNE.search(f) and not RE_SEMNATURA.search(f)]
    t = RE_GHILIMELE_GOALE.sub("", fara_coduri(" ".join(fraze), promo))
    # dacă după codul scos urmează o frază nouă, punem punctul care lipsea
    t = RE_COD_ORFAN.sub(lambda m: ". " if m.end() < len(m.string) and m.string[m.end()].isupper() else "", t)
    t = RE_CUM_FUNCTIONEAZA.sub("", RE_SALUT.sub("", re.sub(r"(?<!\d)\s+-\s+(?!\d)", ". ", t).strip(" -–|:")))
    t = re.sub(r"\.\s+\.", ".", t).lstrip(" .")
    # Punctuatia ramasa dupa codul scos („toppinguri., valabil") si propozitiile cu alt an („6-9 noiembrie 2025").
    from text_curat import text_oferta
    t = text_oferta(t)
    if t[:1].islower():
        t = t[0].upper() + t[1:]
    if _cheie(t) == _cheie(promo.get("nume") or ""):
        return ""  # „Oferta 1+1" / „Oferta 1+1": textul doar repeta titlul
    if len(t) <= MAX_DESCRIERE:
        return t
    # tăiem la sfârșit de frază, nu la mijlocul unui cuvânt
    taiat = t[:MAX_DESCRIERE]
    capat = max(taiat.rfind(". "), taiat.rfind("! "), taiat.rfind("? "))
    return taiat[:capat + 1] if capat > 120 else ""


def campuri_client(nume: str, text_client: str, coupon) -> tuple:
    """(cod, descriere) dintr-o promotie 2Performant, aceeasi regula pentru API si pentru CSV. Codul numit
    doar in text („Introdu codul Intim10") se muta in `cod_cupon` INAINTE sa fie scos din descriere."""
    promo = {"nume": nume or "", "descriere": text_client or "", "cod_cupon": cod_din_camp(coupon)}
    cod_din_titlu(promo)
    return promo["cod_cupon"], descriere_publica(promo["descriere"], promo)


# ─── Titluri scrise pe bucati, pentru afiliati si pentru cumparatori ──────────
# Masurat 04.11.2026, publicate pe site:
#   · kinderauto.ro    „... | Comision 8% | Coș mediu peste 1.000 ..."
#   · underarmour.ro   „Comision de afiliere majorat ... | Under Armour"
#   · printingmall.ro  „Voucher Black Friday 6-15 Noiembrie + comision HAVIT 10%"
#   · otter.ro         „Super challenge Otter in noiembrie"
# „Fără comision" la o banca e o informatie pentru client si ramane. O bucata cu reducere („Fitness Challenge
# -20%") tot pentru client e.
RE_SEGMENT_AFILIATI = re.compile(
    r"\bcomision\w*|\bco[sș]\w*\s+mediu\b|\bconversii\b|\bafilia\w*"
    r"|^(?!.*(?:\d\s*%|reducer|discount|\boff\b)).*\bchallenge\b", re.I)
RE_COMISION_CLIENT = re.compile(
    r"\bf[aă]r[aă]\s+comision|\b0\s*%\s*comision|\bcomision\w*\s+(?:de\s+)?0(?![\d.,])|\bzero\s+comision", re.I)


def titlu_fara_cod_lipit(t):
    """„BOYA15%off" e codul lipit de reducere: ramane „15% off". „Clearance sale50%off" are cuvinte, deci nu se atinge."""
    if not isinstance(t, str):
        return t
    g = re.match(r"^[A-Za-z]{2,}(\d{1,2})\s*%\s*off$", t.strip(), re.I)
    return f"{g.group(1)}% off" if g else t


def fara_segmente_afiliati(nume, m: dict = None):
    """Titlul fara bucatile scrise pentru afiliati. Neatins cand n-are niciuna. None cand nu ramane nimic
    (sau doar numele magazinului): atunci nu e o oferta, e un anunt pentru afiliati."""
    if not isinstance(nume, str):
        return nume

    def pentru_afiliati(s: str) -> bool:
        return bool(RE_SEGMENT_AFILIATI.search(s)) and not RE_COMISION_CLIENT.search(s)

    parti = [s for s in re.split(r"\s*\|\s*|\s+\+\s+", nume) if s.strip()]
    if not any(pentru_afiliati(s) for s in parti):
        return nume
    ramase = [s.strip() for s in parti if not pentru_afiliati(s)]
    if not ramase or (m and len(ramase) == 1 and _doar_numele_magazinului(ramase[0], m)):
        return None
    return " | ".join(ramase)


def curata_promotii(magazine: list, azi: str = None) -> dict:
    """In-place. Scoate promotiile expirate, pe cele scrise pentru afiliati si pe cele pentru alta
    piata (alta limba / moneda altei tari — pentru_alta_piata), curata textul
    (markdown, fraze pentru afiliati), recalculeaza `zile_ramase` din `expira` si flag-urile de
    magazin. Idempotent. Intoarce ce a schimbat, ca sa se vada in log."""
    # Cu `azi` dat (teste, istoric): orice a inceput pana la sfarsitul acelei zile. Altfel, momentul rularii.
    acum = datetime.now(timezone.utc) if azi is None else datetime.fromisoformat(f"{azi}T23:59:59+00:00")
    azi = azi or azi_utc()
    st = {"expirate": 0, "zile_recalculate": 0, "fara_data": 0, "data_absurda": 0, "flaguri": 0,
          "markdown": 0, "mojibake": 0, "afiliati_scoase": [], "afiliati_curatate": 0, "magazine_golite": [],
          "cod_din_titlu": 0, "valoare_zero": 0, "alta_piata": [], "neincepute": 0, "fara_continut": 0}
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
            # Oferta programata nu se arata inca: omul ar ajunge pe un site fara reducere.
            if inceput_in_viitor(str(p.get("incepe") or ""), acum):
                st["neincepute"] += 1
                continue
            if isinstance(p.get("nume"), str) and RE_EMOJI.search(p["nume"]):
                p["nume"] = RE_EMOJI.sub("", p["nume"]).strip() or p["nume"]
            for camp in ("nume", "descriere"):
                p[camp] = titlu_fara_cod_lipit(p.get(camp)) if p.get(camp) else p.get(camp)
                # 06.11.2026: entitati, punctuatie rupta si propozitii cu alt an, aceeasi regula ca garda verifica_text.py.
                if isinstance(p.get(camp), str) and p[camp]:
                    from text_curat import text_oferta, punctuatie, fara_entitati
                    p[camp] = text_oferta(p[camp]) if camp == "descriere" else punctuatie(fara_entitati(p[camp]))
            nume_curat = fara_segmente_afiliati(p.get("nume"), m)
            if nume_curat is None:
                st["afiliati_scoase"].append(f"{m.get('magazin', '?')} (titlul e pentru afiliati)")
                continue
            if nume_curat != p.get("nume"):
                p["nume"] = nume_curat
                st["afiliati_curatate"] += 1
            # „Under Armour", fara text si fara cod: nu spune nimic, deci nu e o oferta.
            if (_doar_numele_magazinului(p.get("nume") or "", m) and not str(p.get("descriere") or "").strip()
                    and not str(p.get("cod_cupon") or "").strip()):
                st["fara_continut"] += 1
                continue
            if valoare_zero(p):
                st["valoare_zero"] += 1
                continue
            motiv = promotie_pentru_alta_piata(p)
            if motiv:
                st["alta_piata"].append(f"{m.get('magazin', '?')} ({motiv})")
                continue
            if cod_din_titlu(p):
                st["cod_din_titlu"] += 1
            if isinstance(p.get("descriere"), str):
                p["descriere"] = fara_coduri_listate(p["descriere"], (p.get("cod_cupon") or "").strip())
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
    return (f"promotii expirate scoase: {st['expirate']}, programate (nu au inceput), nepublicate inca: "
            f"{st.get('neincepute', 0)}, fara continut scoase: {st.get('fara_continut', 0)}, "
            f"zile recalculate: {st['zile_recalculate']}, "
            f"date absurde (>3 ani) tratate ca necunoscute: {st['data_absurda']}, "
            f"fara data (fara contor): {st['fara_data']}, flaguri de magazin corectate: {st['flaguri']}, "
            f"markdown curatat: {st['markdown']}, texte cu caractere stricate reparate: {st['mojibake']}, "
            f"descrieri curatate de fraze pentru afiliati: {st['afiliati_curatate']}"
            + (f"\n  promotii scrise pentru afiliati, scoase: {len(st['afiliati_scoase'])} — "
               + "; ".join(st["afiliati_scoase"][:10]) if st["afiliati_scoase"] else "")
            + (f"\n  promotii pentru alta piata (alta limba / moneda altei tari), scoase: {len(st['alta_piata'])} — "
               + "; ".join(st["alta_piata"][:10]) if st.get("alta_piata") else "")
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


def fara_cod(text: str, cod: str) -> str:
    """Textul fara cod — aceeasi regula ca `faraCod` din frontend/lib/oferta.ts (07.10.2026).
    „Use code DPR35" -> „Use code", „cu codul VARA20" -> „cu codul de reducere", „— Cod: X" dispare.
    Codul se arata doar dupa clicul pe linkul platit; in text s-ar citi intreg, fara comision."""
    if not text:
        return ""
    cod = (cod or "").strip()
    if not cod:
        return text.strip()
    tok = rf"(?<![^\W_]){re.escape(cod)}(?![^\W_])"
    t = re.sub(rf"(folosind|folose[sș]te|cu|prin|aplic[aă]|introdu)\s+(codul|cod)\s*[:：]?\s*{tok}",
               r"\1 codul de reducere", text, flags=re.I)
    t = re.sub(rf"(use|using|with|enter)\s+(the\s+)?code\s*[:：]?\s*{tok}", r"\1 code", t, flags=re.I)
    t = re.sub(rf"\s*[–—-]?\s*(?:codul|cod|code)\s*[:：]?\s*{tok}", "", t, flags=re.I)
    t = re.sub(tok, "", t)
    t = re.sub(r"\s{2,}", " ", t)
    t = re.sub(r"\s+([.,;:!?])", r"\1", t)
    # la inceput nu taiem cratima: e minusul din „-20%"
    t = re.sub(r"^[\s:：,–—]+|[\s:：,–—-]+$", "", t)
    return t.strip()


def pare_cod(x: str) -> bool:
    """Un singur „cuvant" de litere si cifre, cu o cifra sau 4+ majuscule — ca `pareCod` din lib/oferta.ts."""
    return bool(re.fullmatch(r"[A-Z0-9][A-Z0-9_-]{2,}", x or "", re.I) and re.search(r"\d|[A-Z]{4,}", x))


def fara_coduri(text: str, p: dict) -> str:
    """`fara_cod` pentru TOATE codurile promotiei: `cod_cupon`, titlul care e doar cod si cele numite
    in text — descrierea Klaiyi numeste doua („Code: KLAIYI18 ... Code: KLAIYI20")."""
    nume = (p.get("nume") or "").strip()
    coduri = [(p.get("cod_cupon") or "").strip(), nume if pare_cod(nume) else ""]
    coduri += coduri_in_text(nume) + coduri_in_text(p.get("descriere") or "")
    coduri += coduri_listate(nume) + coduri_listate(p.get("descriere") or "")
    for c in dict.fromkeys(x for x in coduri if x):
        text = fara_cod(text, c)
    return text


def fara_coduri_magazin(text: str, promotii: list) -> str:
    """`fara_coduri` pentru codurile TUTUROR promotiilor magazinului, nu doar ale uneia (26.10.2026).
    X-Sense avea aceeasi oferta in trei limbi: varianta franceza n-avea `cod_cupon`, dar descrierea
    scria „avec le code affilié XSENSEAF12" — „affilié" intre „code" si cod, deci nici
    `coduri_in_text` nu-l vedea. Codul era insa `cod_cupon` la variantele EN/DE ale aceluiasi magazin:
    orice cod activ al magazinului e scos din textul oricarei promotii a lui."""
    for p in promotii or []:
        if isinstance(p, dict):
            text = fara_coduri(text, p)
    return text


def titlu_promotie(p: dict, nume_magazin: str) -> str:
    """Titlul de afisat al unei promotii — ca `titluPromotie` din lib/oferta.ts: fara cod, iar cand
    titlul E doar codul, descrierea; daca nici ea nu ramane, „Cod de reducere X" / „Oferta X"."""
    cod = (p.get("cod_cupon") or "").strip()
    nume = (p.get("nume") or "").strip()
    if not cod and pare_cod(nume):
        cod = nume

    def curat(t):
        x = fara_cod(t or "", cod)
        return "" if pare_cod(x) else x

    titlu = curat(nume)
    if titlu:
        return titlu
    descriere = (p.get("descriere") or "").strip()
    desc = curat(descriere) if descriere and descriere != nume else ""
    if desc:
        return desc
    return f"Cod de reducere {nume_magazin}" if (p.get("cod_cupon") or "").strip() else f"Ofertă {nume_magazin}"


def titlu_in_text(p: dict, nume_magazin: str) -> str:
    """Titlul promotiei asa cum apare in articole si emailuri: fara niciun cod in clar.
    17.10.2026: sursa UNICA, folosita de generate_blog.py SI de verifica_promotii.py. Garda compara
    titlurile din articol cu `nume` brut, dar din 07.10 articolul scoate codul („… cu cod ATELIER49")
    — 43 de articole corecte erau raportate „vechi", iar pipeline-ul iesea rosu la fiecare rulare.
    Tot aici: separatorii ramasi dupa scoaterea codului („jucarii| | 19-25.10" -> „jucarii | 19-25.10")."""
    t = fara_coduri(titlu_promotie(p, nume_magazin), p) or f"Ofertă {nume_magazin}"
    t = re.sub(r"\s*\|(?:\s*\|)*\s*", " | ", t)
    t = re.sub(r"^[\s|]+|[\s|:–-]+$", "", t)
    return " ".join(t.split()) or f"Ofertă {nume_magazin}"


def nume_afisabil(m: dict) -> str:
    """„eur.vevor.com" -> „Vevor", nu „Eur"; „store.boyamic.com" -> „Boyamic"."""
    slug = m.get("magazin") or ""
    baza = etld1(domain_from_url(m.get("url") or "") or slug) or slug
    return baza.split(".")[0].replace("-", " ").title()
