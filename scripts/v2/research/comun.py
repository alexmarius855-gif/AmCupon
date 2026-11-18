"""
Ce au in comun semintele, colectarea si studiul: normalizarea textului si ce stim deja despre magazine.

Cercetarea porneste de la sugestiile motoarelor de cautare (Google, Bing, DuckDuckGo, YouTube): ce
completeaza motorul cand cineva incepe sa scrie „cod reducere a..." sau „friteuza cu aer ...".
O sugestie arata ca o cautare e destul de frecventa cat s-o propuna motorul. NU arata cate cautari
sunt: ordinea din lista nu e volum, iar lipsa unei sugestii nu inseamna zero cautari.

Toate datele de aici sunt publice (fisierele site-ului) sau reguli de trafic ale programelor. Fara
comisioane: rezultatele ajung intr-un artefact de GitHub Actions, pe care il poate citi oricine.
"""
from __future__ import annotations

import csv
import json
import os
import re
import sys
import unicodedata

RADACINA = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
PUBLIC = os.path.join(RADACINA, "frontend", "public")
DATA = os.path.join(RADACINA, "data")
sys.path.insert(0, os.path.join(RADACINA, "scripts"))

from nume_magazin import nume_afisat  # noqa: E402  (sursa unica pentru numele magazinului)

# Domenii cu TLD din doua parti: radacina e ultimele 3 etichete, nu 2.
TLD_DUBLU = {"co.uk", "com.au", "com.sg", "co.nz", "com.br", "co.za", "com.tr", "co.il", "com.mx",
             "co.in", "com.ar", "co.kr", "com.tw", "com.co", "com.ro"}
# Etichete care nu sunt numele magazinului (ro.store.asus.com -> asus).
ETICHETE_NEUTRE = {"www", "m", "shop", "store", "ro", "us", "uk", "eu", "de", "fr", "it", "es", "en",
                   "pl", "hu", "bg", "nl", "at", "ch", "global", "intl", "int", "go", "app"}


def fara_diacritice(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    return "".join(c for c in s if not unicodedata.combining(c))


def norm(s: str) -> str:
    """Litere mici, fara diacritice, un singur spatiu. Pastreaza cifrele, & si %."""
    s = fara_diacritice(s).lower()
    s = re.sub(r"[^a-z0-9&%\s.-]", " ", s)
    s = re.sub(r"(?<![a-z0-9])[.-]|[.-](?![a-z0-9])", " ", s)  # punct/cratima doar in interiorul cuvintelor
    return re.sub(r"\s+", " ", s).strip()


def compact(s: str) -> str:
    """Forma de comparat: doar litere si cifre („Fashion Days" = „fashiondays" = „fashion-days")."""
    return re.sub(r"[^a-z0-9]", "", norm(s))


def eticheta_brand(domeniu: str) -> str:
    """Numele din domeniu: fashiondays.ro -> fashiondays, ro.store.asus.com -> asus."""
    d = (domeniu or "").lower().strip().strip("/")
    d = re.sub(r"^https?://", "", d).split("/")[0]
    parti = [p for p in d.split(".") if p]
    if len(parti) < 2:
        return parti[0] if parti else ""
    if ".".join(parti[-2:]) in TLD_DUBLU and len(parti) >= 3:
        parti = parti[:-2]
    else:
        parti = parti[:-1]
    utile = [p for p in parti if p not in ETICHETE_NEUTRE]
    return (utile or parti)[-1]


def citeste_json(cale: str, implicit=None):
    try:
        with open(cale, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, ValueError):
        return implicit


def are_link_platit(m: dict) -> bool:
    """Acelasi criteriu ca site-ul: linkul afiliat exista si nu e adresa magazinului."""
    afiliat = (m.get("url_afiliat") or "").strip().rstrip("/").lower()
    simplu = (m.get("url") or "").strip().rstrip("/").lower()
    curat = lambda u: re.sub(r"^https?://(www\.)?", "", u)  # noqa: E731
    return bool(afiliat) and curat(afiliat) != curat(simplu)


class Magazine:
    """Tot ce stim despre un magazin, gasit dupa numele scris de oameni („dr max", „fashion days")."""

    def __init__(self, radacina_public: str = PUBLIC, radacina_data: str = DATA):
        self.site = {}            # domeniu -> magazin din output.json
        self.index = {}           # forma compacta -> domeniu de pe site
        self.fara_cupoane = {}    # domeniu -> destinatie (programul interzice cupoanele)
        self.fara_livrare = {}    # domeniu -> regiunile programului
        self.program_2p = {}      # forma compacta -> domeniu cu program 2P aprobat
        self.regula_2p = {}       # domeniu -> regula „Coupons/Vouchers" (yes/no/maybe)
        self.impact = {}          # forma compacta -> numele programului Impact cu contract activ
        self.bf = {}              # domeniu -> campania de Black Friday (start, final)
        self.produse = {}         # domeniu -> cate produse are in feed

        for m in citeste_json(os.path.join(radacina_public, "output.json"), []) or []:
            dom = (m.get("magazin") or "").lower()
            if not dom:
                continue
            self.site[dom] = m
            for cheie in self._chei(dom):
                self.index.setdefault(cheie, dom)
        for r in citeste_json(os.path.join(radacina_public, "magazine-fara-cupoane.json"), []) or []:
            self.fara_cupoane[(r.get("magazin") or "").lower()] = r.get("destinatie") or ""
        for r in citeste_json(os.path.join(radacina_public, "magazine-fara-livrare-ro.json"), []) or []:
            self.fara_livrare[(r.get("magazin") or "").lower()] = r.get("regiuni") or []
        reguli = (citeste_json(os.path.join(radacina_data, "2p-reguli.json"), {}) or {}).get("magazine") or {}
        for dom, regula in reguli.items():
            dom = dom.lower()
            self.regula_2p[dom] = (regula or {}).get("cupoane") or ""
            for cheie in self._chei(dom):
                self.program_2p.setdefault(cheie, dom)
        cale_impact = os.path.join(radacina_data, "impact_campaigns.csv")
        if os.path.exists(cale_impact):
            with open(cale_impact, encoding="utf-8-sig", newline="") as f:
                for rand in csv.DictReader(f):
                    if (rand.get("Contract Status") or "").strip() != "Active":
                        continue
                    nume = (rand.get("Program Name") or "").strip()
                    for cheie in {compact(nume), compact(eticheta_brand(rand.get("Advertiser URL") or ""))}:
                        if len(cheie) >= 3:
                            self.impact.setdefault(cheie, nume)
        bf = citeste_json(os.path.join(radacina_public, "black-friday-parteneri.json"), {}) or {}
        for c in bf.get("parteneri") or []:
            self.bf[(c.get("magazin") or "").lower()] = {"start": c.get("start"), "final": c.get("final")}
        prod = citeste_json(os.path.join(radacina_public, "products.json"), {}) or {}
        for p in prod.get("products") or []:
            dom = (p.get("merchant_slug") or "").lower()
            if dom and not p.get("is_promo"):
                self.produse[dom] = self.produse.get(dom, 0) + 1

    def _chei(self, dom: str) -> set:
        chei = {compact(eticheta_brand(dom)), compact(nume_afisat(dom)), compact(dom)}
        return {c for c in chei if len(c) >= 3}

    def gaseste(self, text: str) -> str | None:
        """Domeniul de pe site pentru un nume scris de om, sau None. Potrivire exacta pe forma compacta."""
        c = compact(text)
        for cand in (c, re.sub(r"(ro|com)$", "", c)):
            if len(cand) >= 3 and cand in self.index:
                return self.index[cand]
        return None

    def stare(self, text: str) -> dict:
        """Unde sta un magazin cautat de oameni fata de noi. `cod` = ce facem cu el."""
        c = compact(text)
        dom = self.gaseste(text)
        if dom:
            m = self.site[dom]
            return {"cod": "site_cu_oferta" if m.get("are_promotie") else "site_fara_oferta",
                    "magazin": dom, "nume": nume_afisat(dom), "link_platit": are_link_platit(m),
                    "produse": self.produse.get(dom, 0), "black_friday": self.bf.get(dom)}
        for cand in (c, re.sub(r"(ro|com)$", "", c)):
            if len(cand) < 3:
                continue
            dom_2p = self.program_2p.get(cand)
            if dom_2p:
                if dom_2p in self.fara_cupoane:
                    return {"cod": "program_interzice_cupoane", "magazin": dom_2p, "nume": nume_afisat(dom_2p)}
                if dom_2p in self.fara_livrare:
                    return {"cod": "program_fara_livrare_ro", "magazin": dom_2p, "nume": nume_afisat(dom_2p)}
                return {"cod": "program_2p_lipsa_de_pe_site", "magazin": dom_2p, "nume": nume_afisat(dom_2p),
                        "regula_cupoane": self.regula_2p.get(dom_2p, "")}
            if cand in self.impact:
                return {"cod": "impact_activ_lipsa_de_pe_site", "program": self.impact[cand]}
        return {"cod": "fara_program"}


# Ce inseamna fiecare stare, in cuvinte (pentru raport).
STARI = {
    "site_cu_oferta": "e pe site, are ofertă acum",
    "site_fara_oferta": "e pe site, fără ofertă acum",
    "program_interzice_cupoane": "program aprobat, dar regulile lui interzic site-urile de cupoane",
    "program_fara_livrare_ro": "program aprobat, dar nu livrează în România",
    "program_2p_lipsa_de_pe_site": "program 2Performant aprobat, dar lipsește de pe site",
    "impact_activ_lipsa_de_pe_site": "contract Impact activ, dar lipsește de pe site",
    "fara_program": "nu avem program: de căutat în rețele",
    "generic": "nu e un magazin (termen general)",
}


def test() -> int:
    erori = []

    def verifica(cond, mesaj):
        if not cond:
            erori.append(mesaj)

    verifica(norm("Cod reducere FASHION-DAYS ș ț ă î!") == "cod reducere fashion-days s t a i", norm("Cod reducere FASHION-DAYS ș ț ă î!"))
    verifica(compact("Fashion Days") == compact("fashion-days") == "fashiondays", "compact")
    verifica(norm("emag.ro.") == "emag.ro", norm("emag.ro."))
    verifica(eticheta_brand("ro.store.asus.com") == "asus", eticheta_brand("ro.store.asus.com"))
    verifica(eticheta_brand("https://www.fashiondays.ro/") == "fashiondays", "eticheta fashiondays")
    verifica(eticheta_brand("lrmgoods.co.uk") == "lrmgoods", eticheta_brand("lrmgoods.co.uk"))
    verifica(eticheta_brand("de.fossibot.com") == "fossibot", eticheta_brand("de.fossibot.com"))
    verifica(are_link_platit({"url": "https://a.ro", "url_afiliat": "https://event.2performant.com/x"}), "link platit")
    verifica(not are_link_platit({"url": "https://a.ro", "url_afiliat": "https://www.a.ro/"}), "link simplu")
    # Pe datele reale din repo: magazinele de pe site se gasesc dupa numele scris de oameni.
    mg = Magazine()
    if mg.site:
        un = next(iter(mg.site))
        verifica(mg.gaseste(nume_afisat(un)) == un, f"gaseste({nume_afisat(un)!r})")
        verifica(mg.gaseste(un) == un, f"gaseste({un!r})")
        verifica(mg.gaseste("zzzz magazin inexistent qq") is None, "inexistent")
        verifica(mg.stare("zzzz magazin inexistent qq")["cod"] == "fara_program", "stare inexistent")
    for e in erori:
        print("PICA:", e)
    print("comun.py:", "OK" if not erori else f"{len(erori)} erori")
    return 1 if erori else 0


if __name__ == "__main__":
    sys.exit(test() if "--test" in sys.argv else 0)
