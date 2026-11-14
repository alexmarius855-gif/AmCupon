"""
brevo_atribute.py — se asigura ca atributele de contact de care depinde codul exista in Brevo.

De ce (14.11.2026): abonarea pe un magazin (PriceAlert.tsx -> api/newsletter) scrie atributul
ALERT_STORES pe contact, iar check_price_alerts.py il citeste. Brevo IGNORA TACIT un atribut
care nu exista, deci din 01.11 fiecare abonare pe magazin se pierdea fara nicio eroare.
Pasul cerea un om (Contacts -> Settings -> Contact attributes); acum pipeline-ul il creeaza
singur, o data, cu cheia API din GitHub Secrets.

WELCOME_STEP NU e in lista: crearea lui porneste seria de bun-venit (emailuri de ziua 3 si 7
catre abonatii noi) — decizia lui Alex, nu a pipeline-ului.

Utilizare:
  python brevo_atribute.py             # creeaza ce lipseste
  python brevo_atribute.py --verifica  # doar spune ce lipseste, nu creeaza nimic
"""

import json
import os
import sys
import urllib.error
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BREVO_BASE = "https://api.brevo.com/v3"
NECESARE = {"ALERT_STORES": "text"}


def cerere(metoda: str, cale: str, date: dict | None = None):
    cheie = os.environ.get("BREVO_API_KEY", "")
    corp = json.dumps(date).encode("utf-8") if date is not None else None
    req = urllib.request.Request(f"{BREVO_BASE}{cale}", data=corp, method=metoda,
                                 headers={"api-key": cheie, "Accept": "application/json",
                                          "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        text = r.read()
        return r.status, (json.loads(text) if text else {})


def atribute_existente() -> set[str]:
    _, date = cerere("GET", "/contacts/attributes")
    return {a.get("name", "").upper() for a in date.get("attributes", [])}


def main() -> int:
    if not os.environ.get("BREVO_API_KEY"):
        print("BREVO_API_KEY lipseste — nu pot verifica atributele.")
        return 0
    doar_verifica = "--verifica" in sys.argv
    try:
        existente = atribute_existente()
    except urllib.error.HTTPError as e:
        print(f"Brevo a raspuns {e.code} la lista de atribute.")
        return 1
    lipsa = [n for n in NECESARE if n not in existente]
    for nume in NECESARE:
        print(f"  {nume}: {'exista' if nume not in lipsa else 'LIPSESTE'}")
    if not lipsa or doar_verifica:
        return 0
    esecuri = 0
    for nume in lipsa:
        try:
            status, _ = cerere("POST", f"/contacts/attributes/normal/{nume}", {"type": NECESARE[nume]})
            print(f"  {nume}: creat (HTTP {status})")
        except urllib.error.HTTPError as e:
            esecuri += 1
            mesaj = e.read().decode("utf-8", "replace")[:200]
            print(f"  {nume}: NU s-a putut crea (HTTP {e.code}) {mesaj}")
    return 1 if esecuri else 0


if __name__ == "__main__":
    sys.exit(main())
