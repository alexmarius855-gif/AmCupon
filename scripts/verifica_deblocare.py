#!/usr/bin/env python3
"""
Verifica starea reala a celor trei blocaje din docs/operational/DEBLOCARE-AMCUPON.md.

De ce exista: documentul de deblocare contine cifre (cate magazine n-au link
afiliat, cat de mare e procentul din studiu). Cifrele alea se schimba la fiecare
rulare de pipeline, iar un plan cu cifre vechi e mai rau decat niciun plan — te
face sa trimiti unui jurnalist un procent care nu mai e adevarat. Scriptul asta
citeste datele, nu textul, ca sa nu se bifeze nimic pe incredere.

Ce NU poate verifica: atributele din Brevo. Alea traiesc intr-un cont extern la
care codul n-are acces. Pentru ele scriptul arata doar CE anume le cere in cod,
ca sa stii exact ce se rupe cat timp lipsesc.

    python scripts/verifica_deblocare.py            # rezumatul celor trei
    python scripts/verifica_deblocare.py --leak     # lista completa de magazine fara link
"""
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RADACINA = Path(__file__).parent.parent
OUTPUT = RADACINA / "frontend" / "public" / "output.json"
STUDIU = RADACINA / "frontend" / "public" / "studiu-cupoane.json"

# Fisierele care cer atributele Brevo. Daca muti codul, muta si lista.
CERUT_DE = {
    "WELCOME_STEP": [
        "scripts/send_welcome_series.py",
        "frontend/app/api/newsletter/route.ts",
    ],
    "ALERT_STORES": [
        "scripts/check_price_alerts.py",
    ],
}


def incarca(cale):
    try:
        return json.loads(cale.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"  ! lipseste {cale.relative_to(RADACINA)}")
        return None


def fara_link_afiliat(magazin) -> bool:
    """Linkul dus utilizatorului e linkul normal al magazinului, deci comision zero."""
    afiliat = (magazin.get("url_afiliat") or "").strip()
    return not afiliat or afiliat == (magazin.get("url") or "").strip()


def are_cod_real(magazin) -> bool:
    """Un cod real e un STRING nevid intr-o promotie, nu flagul `cod_cupon` al magazinului.

    Flagul minte: temu/shein/trendyol il au True cu promotia fara cod. Studiul
    numara la fel (vezi generate_studiu_cupoane.py), deci ramanem consecventi.
    """
    return any(str(p.get("cod_cupon") or "").strip() for p in (magazin.get("promotii") or []))


def sectiunea_1(magazine, detaliat: bool) -> None:
    print("\n[1] Magazine care primesc clicuri si nu platesc nimic")
    pierdute = [m for m in magazine if fara_link_afiliat(m)]
    if not pierdute:
        print("    OK — fiecare magazin live are link afiliat propriu.")
        return

    cu_promotie = [m for m in pierdute if m.get("are_promotie")]
    pe_platforma = {}
    for m in pierdute:
        pe_platforma.setdefault(m.get("platforma") or "?", []).append(m)

    print(f"    {len(pierdute)} magazine live cu url_afiliat == url ({len(cu_promotie)} au si promotie)")
    for platforma, lista in sorted(pe_platforma.items(), key=lambda x: -len(x[1])):
        print(f"      {platforma:<14} {len(lista)}")

    # Semnalul fals: scrie ca are cod, promotia n-are niciun cod.
    minciuni = [m for m in magazine if m.get("cod_cupon") and not are_cod_real(m)]
    if minciuni:
        nume = ", ".join(str(m.get("magazin")) for m in minciuni[:5])
        print(f"    ! {len(minciuni)} magazine afiseaza semn de cod fara sa aiba cod: {nume}")

    if detaliat:
        print()
        for platforma, lista in sorted(pe_platforma.items(), key=lambda x: -len(x[1])):
            print(f"    --- {platforma} ---")
            for m in sorted(lista, key=lambda x: str(x.get("magazin") or "")):
                promo = " [are promotie]" if m.get("are_promotie") else ""
                print(f"      {m.get('magazin')}{promo}")
    else:
        print("    (lista completa: --leak)")


def sectiunea_2() -> None:
    print("\n[2] Atributele Brevo — NEVERIFICABIL din repo, deschide contul")
    for atribut, fisiere in CERUT_DE.items():
        print(f"    {atribut:<14} cerut de: {', '.join(fisiere)}")
    print("    Brevo > Contacts > Settings > Contact attributes, tip Text, nume identic.")


def sectiunea_3(magazine) -> None:
    print("\n[3] Studiul — cifra publicata vs. datele de azi")
    cu_cod = [m for m in magazine if are_cod_real(m)]
    procent_azi = len(cu_cod) / len(magazine) * 100 if magazine else 0
    print(f"    date ({OUTPUT.name}):  {len(cu_cod)} din {len(magazine)} magazine = {procent_azi:.1f}%")

    studiu = incarca(STUDIU)
    if not studiu:
        return
    publicat = studiu.get("cu_cod_real")
    print(f"    pagina ({studiu.get('generat')}):  {publicat} magazine = {studiu.get('procent_cu_cod')}%")

    if publicat != len(cu_cod):
        print("    ! PAGINA E IN URMA DATELOR. Nu trimite presei pana nu se potrivesc.")
        print("      Repara: python scripts/generate_studiu_cupoane.py")
    else:
        print("    OK — pagina publica si datele spun acelasi lucru.")


def main() -> int:
    detaliat = "--leak" in sys.argv
    magazine = incarca(OUTPUT)
    if magazine is None:
        return 1

    print(f"Deblocare AmCupon — verificare pe {len(magazine)} magazine live")
    print("Documentul: docs/operational/DEBLOCARE-AMCUPON.md")
    sectiunea_1(magazine, detaliat)
    sectiunea_2()
    sectiunea_3(magazine)
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
