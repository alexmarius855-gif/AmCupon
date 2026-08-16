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

    # RUNDA 1 confirmata (16.08.2026): endpoint 'affiliate-products' cu param
    # 'advertiser' RASPUNDE, dar FILTRUL E IGNORAT — am cerut eMAG (id 35) si am
    # primit produse Anvelino (advertiser_id 165505). Raspunsul are 17.220 pagini
    # x 20 = ~344.400 de produse din TOATE magazinele, amestecate. Campurile sunt
    # mai bogate decat la 2P: categorie in ROMANA, affiliate_link deja cu tracking,
    # free_shipping, price_discounted.
    #
    # Intrebarea care decide arhitectura: se poate cere pe magazin, sau trebuie
    # parcurse 17.220 de pagini? Diferenta e intre ~60 de cereri si ~17.000.
    def desfa(raspuns):
        rez = raspuns.get("result", raspuns) if isinstance(raspuns, dict) else {}
        prod = rez.get("products", []) if isinstance(rez, dict) else []
        ids = {p.get("advertiser_id") for p in prod if isinstance(p, dict)}
        return ids, len(prod), (rez.get("total_pages") if isinstance(rez, dict) else None)

    print("")
    print("=" * 66)
    print("Se poate FILTRA pe magazin? (altfel: 17.220 de pagini de parcurs)")
    print("=" * 66)
    ep = "affiliate-products"
    tinta, nume_tinta = candidati[0]
    print(f"Cer produse pentru {nume_tinta} (id {tinta}) si verific ce advertiser_id vine inapoi.")
    for param in ["advertiser", "advertiser_id", "advertisers", "id",
                  "filter[advertiser]", "advertiser_ids"]:
        r = ps_get(ep, {param: tinta, "page": 1, "results_per_page": 20})
        if not r:
            print(f"  {param:18s} fara raspuns")
            continue
        ids, n, tp = desfa(r)
        if ids == {tinta}:
            print(f"  {param:18s} {n:2d} produse, doar advertiser {tinta} -> FILTREAZA")
            print("")
            print(f"  => se poate cere pe magazin cu '{param}'. Cateva cereri per magazin.")
            return 0
        print(f"  {param:18s} {n:2d} produse, id-uri primite {sorted(i for i in ids if i)[:3]}, "
              f"total_pages={tp} -> ignorat")

    print("")
    print("  => niciun parametru nu filtreaza. Verific cat de repede apar magazine")
    print("     noi la parcurgere secventiala, ca sa stiu daca strategia e fezabila:")
    vazute = {}
    pagini = 0
    for pagina in range(1, 41):
        r = ps_get(ep, {"page": pagina, "results_per_page": 20})
        if not r:
            break
        pagini += 1
        rez = r.get("result", {}) if isinstance(r, dict) else {}
        for p in rez.get("products", []):
            k = p.get("advertiser_name") or str(p.get("advertiser_id"))
            vazute[k] = vazute.get(k, 0) + 1
    print(f"     dupa {pagini} pagini ({pagini * 20} produse): {len(vazute)} magazine distincte")
    for k, v in sorted(vazute.items(), key=lambda x: -x[1])[:12]:
        print(f"       {v:4d}  {k}")
    print("")
    print("  NU s-a scris nimic.")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
