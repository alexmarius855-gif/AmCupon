#!/usr/bin/env python3
"""
Sonda: are Profitshare un feed de produse pe care nu-l folosim?

DE CE CONTEAZA (masurat 16.08.2026): din 1.162 de pagini de magazin, doar **87**
sunt indexabile. Regula (`frontend/lib/seoIndexable.ts`) cere continut propriu:
promotie activa SAU produse in feed. Restul de 1.075 sunt acelasi sablon cu numele
schimbat — masurat direct, doua astfel de pagini sunt **77-89% identice**, deci
indexarea lor ar reintroduce exact problema de thin content care a cauzat criza
din 10.08. Nu paginile trebuie deschise, ci trebuie sa devina merituoase.

Sursa de produse de azi e DOAR 2Performant ("My Feeds", ~20 surse) — asta da doar
20 de magazine cu produse reale. Profitshare are 60 de magazine partenere ACTIVE,
inclusiv eMAG (exclusiv acolo, cel mai cautat brand din Romania), si API-ul lui
expune `getProducts(Advertiser, Pagina)` (documentatia oficiala la care trimite
chiar `process_profitshare.py`). Nu l-am cerut niciodata.

Daca merge, fiecare magazin PS cu produse devine o pagina indexabila cu continut
real — potential ~87 -> ~140 de pagini, pe brandurile cele mai cautate.

CE FACE SCRIPTUL: doar sondeaza. Incearca numele plauzibile de endpoint si de
parametru, afiseaza JSON-ul BRUT al primului raspuns bun si se opreste. NU scrie
niciun fisier si NU modifica products.json. Parserul se scrie DUPA ce vedem forma
reala a raspunsului — acelasi tipar defensiv ca `fetch_awin_api.py` si
`fetch_impact_deals.py`, tocmai ca sa nu inventam o schema si sa scriem date
gresite in productie.

Credentialele sunt doar in GitHub Secrets, deci se ruleaza din
`.github/workflows/test-profitshare-products.yml` (manual), nu local.

    python scripts/probe_profitshare_products.py
"""
import json
import sys

try:
    from process_profitshare import ps_get, load_programs
except ImportError:
    print("Ruleaza din directorul scripts/ (process_profitshare.py trebuie sa fie langa).")
    sys.exit(1)

# Convention observata in process_profitshare.py: "affiliate-<lucru>".
ENDPOINTURI = [
    "affiliate-products",
    "products",
    "affiliate-advertisers-products",
    "affiliate-product-feeds",
]
# getProducts(Advertiser, Pagina) — numele exact al parametrului nu e documentat.
NUME_PARAM_ADVERTISER = ["advertiser", "advertiser_id", "advertisers", "id"]


def main():
    print("=" * 66)
    print("Sonda Profitshare — exista feed de produse?")
    print("=" * 66)

    programe = load_programs()
    if not programe:
        print("\nNu s-au putut lua programele — verifica PROFITSHARE_USER / PROFITSHARE_KEY.")
        return 1

    # Cateva advertisere reale pe care sa testam (id-urile difera de la cont la cont)
    candidati = []
    for p in programe[:40]:
        pid = p.get("id") or p.get("advertiser_id") or p.get("program_id")
        nume = p.get("name") or p.get("title") or "?"
        if pid is not None:
            candidati.append((pid, nume))
        if len(candidati) >= 5:
            break

    if not candidati:
        print("\nProgramele nu au camp de id recunoscut. Primul program, brut:")
        print(json.dumps(programe[0], ensure_ascii=False, indent=2)[:1500])
        return 1

    print(f"\n{len(programe)} programe. Testez pe: "
          + ", ".join(f"{n} (id {i})" for i, n in candidati))

    for endpoint in ENDPOINTURI:
        for param in NUME_PARAM_ADVERTISER:
            for pid, nume in candidati:
                raspuns = ps_get(endpoint, {param: pid, "page": 1, "results_per_page": 5})
                # ps_get intoarce None la eroare si [] la 500 (cont fara acces)
                if not raspuns:
                    continue

                print("\n" + "=" * 66)
                print(f"RASPUNS BUN: endpoint='{endpoint}'  parametru='{param}'  advertiser={pid} ({nume})")
                print("=" * 66)
                brut = json.dumps(raspuns, ensure_ascii=False, indent=2)
                print(brut[:4000])
                if len(brut) > 4000:
                    print(f"\n... ({len(brut)} caractere in total, trunchiat)")
                print("\n" + "=" * 66)
                print("NU s-a scris nimic. Cu forma asta a raspunsului se poate scrie")
                print("acum parserul si integrarea in fetch_product_feeds.py.")
                return 0

    print("\n" + "=" * 66)
    print("Niciun endpoint de produse nu a raspuns.")
    print("Inseamna sau ca planul contului nu are acces la produse, sau ca")
    print("endpoint-ul se numeste altfel. Nu e o eroare de cod si NU s-a scris nimic.")
    print("Pas urmator: intreaba suportul Profitshare care e ruta pentru getProducts.")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
