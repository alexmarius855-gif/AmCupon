"""
generate_ai_guides.py — Articole ghid calitative cu Claude AI (claude-haiku-4-5)
================================================================================
Genereaza 3-5 articole noi per rulare, targeting long-tail keywords cu intentie
comerciala mare in Romania. Cost ~$0.04 pentru 30 articole.

Ruleaza DOAR o data pe zi (dimineata, in workflow-ul de 06:00 UTC).
"""

import json
import os
import re
import time
from datetime import datetime
from pathlib import Path

try:
    import anthropic
    CLAUDE_AVAILABLE = True
except ImportError:
    CLAUDE_AVAILABLE = False
    print("anthropic SDK nu e instalat — skip generate_ai_guides")

BLOG_JSON = Path(__file__).parent.parent / "frontend" / "public" / "blog-posts.json"
AN = datetime.now().year
LUNA = datetime.now().strftime("%B").capitalize()
ARTICLES_PER_RUN = 4

SYSTEM_PROMPT = f"""Esti un expert in cumparaturi online in Romania, scriind pentru AmCupon.ro — site de coduri de reducere.
Scrie articole in romana colocviala (dar corecta), directe, utile, fara AI fluff.
Nu folosi fraze goale ca "In concluzie" sau "Este important de mentionat".
Fii specific: preturi reale, magazine reale, sfaturi concrete.
Structura obligatorie (markdown):
- H1 ca titlu principal
- H2 pentru sectiuni mari, H3 pentru subsectiuni
- Minim o lista bullet cu sfaturi concrete
- Minim un tabel comparativ daca e relevant
- Sectiune FAQ cu 3-5 intrebari reale (nu generice)
- Internal links catre AmCupon.ro (ex: [Notino](/cod-reducere/notino.ro))
Lungime: 900-1300 cuvinte. Ton: prietenos dar expert. Nu exagera cu superlative."""


ARTICOLE_TINTA = [
    {
        "slug": f"cum-alegi-laptop-gaming-ieftin-{AN}",
        "title": f"Cum alegi un laptop gaming ieftin in {AN} — Ghid complet pentru Romania",
        "category": "Electronice IT&C",
        "keywords": ["laptop gaming ieftin", "laptop gaming sub 4000 lei", "cel mai bun laptop gaming 2026"],
        "prompt": f"""Scrie un ghid complet pentru cumpararea unui laptop gaming ieftin in Romania in {AN}.
Include:
- Ce specificatii conteaza cu adevarat (GPU > CPU > RAM, explica de ce)
- Praguri de buget recomandate: sub 3000 lei, 3000-5000 lei, 5000-8000 lei
- Ce branduri sunt de incredere vs ce sa eviti (Asus, Lenovo, Acer, HP — avantaje/dezavantaje)
- Unde cumperi mai ieftin: [eMAG](/cod-reducere/emag.ro), [Altex](/cod-reducere/altex.ro), [PC Garage](/cod-reducere/pcgarage.ro)
- Top 3 modele concrete recomandate cu preturi aproximative
- Cand sa cumperi (Black Friday, sezoane de reduceri)
- FAQ: garantie, retururi, laptopuri reconditionat
Slug: {f"cum-alegi-laptop-gaming-ieftin-{AN}"}""",
    },
    {
        "slug": f"parfum-barbatesc-bun-si-ieftin-{AN}",
        "title": f"Parfum barbatesc bun si ieftin — Top recomandari {AN} din Romania",
        "category": "Beauty",
        "keywords": ["parfum barbatesc ieftin", "parfum barbatesc bun pret mic", "parfumuri barbatesti romania"],
        "prompt": f"""Scrie un ghid de cumparare parfumuri barbatesti ieftine pentru romani in {AN}.
Include:
- Diferenta intre EDT, EDP, Cologne — cat tine fiecare pe piele
- Familii olfactive explicate simplu (lemnoase, acvatice, orientale) cu exemple
- Top 5-7 parfumuri barbatesti sub 150 lei recomandate (cu note olfactive specifice)
- Top 3-5 parfumuri barbatesti 150-300 lei raport calitate-pret excelent
- Unde cumperi in Romania: [Notino](/cod-reducere/notino.ro), [Douglas](/cod-reducere/douglas.ro), [eMag](/cod-reducere/emag.ro)
- Cum testezi un parfum corect (nu pe cartonase)
- Cum aplici parfumul sa tina mai mult
- FAQ: parfumuri originale vs copii, conservare
Slug: {f"parfum-barbatesc-bun-si-ieftin-{AN}"}""",
    },
    {
        "slug": f"cum-alegi-masina-de-spalat-{AN}",
        "title": f"Cum alegi masina de spalat in {AN} — Ghid complet pentru Romania",
        "category": "Casa & Gradina",
        "keywords": ["masina de spalat care sa cumpar", "masina de spalat buna ieftina", "ghid masina spalat 2026"],
        "prompt": f"""Scrie un ghid practic pentru cumpararea unei masini de spalat in Romania {AN}.
Include:
- Ce specificatii conteaza: capacitate (6-8-10 kg), clasa energetica (D vs A), rpm la centrifugare
- Frontala vs verticala — cand alegi fiecare (avantaje concrete, nu pareri)
- Branduri de incredere: Bosch, Samsung, LG, Whirlpool, Beko — diferente reale
- Functii care merita banii vs functii de marketing inutil
- Bugete recomandate: sub 1500 lei, 1500-2500 lei, 2500-4000 lei
- Top 3 modele concrete din fiecare segment de pret
- Unde cumperi mai ieftin: [eMAG](/cod-reducere/emag.ro), [Altex](/cod-reducere/altex.ro), [Dedeman](/cod-reducere/dedeman.ro)
- Instalare si garantie — ce sa stii inainte sa cumperi
- FAQ: consum energy, programe spalare, probleme comune
Slug: {f"cum-alegi-masina-de-spalat-{AN}"}""",
    },
    {
        "slug": f"parfum-feminin-bun-ieftin-{AN}",
        "title": f"Parfum feminin bun si ieftin — Top recomandari {AN}",
        "category": "Beauty",
        "keywords": ["parfum feminin ieftin", "parfum dama pret mic", "parfumuri feminine bune ieftine"],
        "prompt": f"""Scrie un ghid complet pentru parfumuri feminine ieftine in Romania {AN}.
Include:
- Categorii de parfumuri feminine: florale, fructate, orientale, fresh/acvatice — explica cu exemple concrete
- Top 6-8 parfumuri feminine sub 120 lei (cu note specifice, ce ocazii se potrivesc)
- Top 4-5 parfumuri feminine 120-250 lei raport calitate-pret
- Parfumuri feminine de lux la pret mic (dupe-uri bune)
- Unde cumperi garantat original: [Notino](/cod-reducere/notino.ro), [Douglas](/cod-reducere/douglas.ro)
- Sezon si ocazii: ce parfum pentru birou, seara, vara, iarna
- Cum combini parfumuri (layering)
- FAQ: cum pastrez parfumul, valabilitate dupa deschidere
Slug: {f"parfum-feminin-bun-ieftin-{AN}"}""",
    },
    {
        "slug": f"aspirator-robot-bun-ieftin-{AN}",
        "title": f"Aspirator robot bun si ieftin — Top recomandari {AN} Romania",
        "category": "Casa & Gradina",
        "keywords": ["aspirator robot ieftin", "robot aspirator bun pret mic", "cel mai bun aspirator robot 2026"],
        "prompt": f"""Scrie un ghid practic pentru cumpararea unui aspirator robot in Romania {AN}.
Include:
- Ce specificatii conteaza: suctiune (Pa), baterie (minute autonomie), navigatie (random vs LIDAR vs camera)
- Bugete: sub 500 lei (ce obtii), 500-1000 lei (punct dulce), 1000-2000 lei (premium)
- Branduri de incredere: Dreame, Xiaomi, Ecovacs, iRobot — diferente reale
- Caracteristici utile vs marketing: mopare, autovidare, mapping multi-etaj
- Top 3-4 modele concrete recomandate cu preturi aproximative
- Unde cumperi: [eMAG](/cod-reducere/emag.ro), [Altex](/cod-reducere/altex.ro), [Flanco](/cod-reducere/flanco.ro)
- Intretinere si durata de viata
- FAQ: pardoseli, animale de companie, zgomot, curatare
Slug: {f"aspirator-robot-bun-ieftin-{AN}"}""",
    },
    {
        "slug": f"telefon-bun-sub-2000-lei-{AN}",
        "title": f"Cel mai bun telefon sub 2000 lei in {AN} — Top recomandari Romania",
        "category": "Electronice IT&C",
        "keywords": ["telefon bun sub 2000 lei", "smartphone ieftin bun romania 2026", "cel mai bun telefon pret mediu"],
        "prompt": f"""Scrie un ghid specific pentru alegerea unui smartphone sub 2000 lei in Romania {AN}.
Include:
- Ce conteaza cu adevarat la un telefon: procesor (Snapdragon vs MediaTek), RAM (minim recomandat), camera
- Segmente de buget: 800-1200 lei, 1200-1600 lei, 1600-2000 lei
- Branduri si ce ofera fiecare: Samsung (stabilitate), Xiaomi (raport calitate-pret), Motorola (baterie)
- Top 5-6 modele concrete cu preturi curente si puncte forte specifice
- Ce sa NU cumperi (capcanele comune la acest buget)
- iOS vs Android la buget mediu — cand merita un iPhone de mana a doua
- Unde cumperi in Romania: [eMAG](/cod-reducere/emag.ro), [Altex](/cod-reducere/altex.ro), operatori
- Garantie si service — ce sa verifici inainte
- FAQ: capacitate stocare, update-uri software, durata de viata
Slug: {f"telefon-bun-sub-2000-lei-{AN}"}""",
    },
    {
        "slug": f"ghid-cumparaturi-online-romania-{AN}",
        "title": f"Ghid complet cumparaturi online Romania {AN} — Cum economisesti 20-40%",
        "category": "Ghiduri",
        "keywords": ["cumparaturi online romania", "cum economisesti online", "coduri reducere romania"],
        "prompt": f"""Scrie un ghid practic si complet despre cumparaturile online inteligente in Romania {AN}.
Include:
- Top 5 site-uri romanese de incredere si pentru ce sunt bune fiecare
- Cum functioneaza codurile de reducere (de ce unele nu merg, cum le gasesti valide)
- Cashback explicat: ce e, cum functioneaza, cat castigi real
- Cand sa cumperi: Black Friday, Summer Sale, zile speciale pe fiecare platforma
- Cum compari preturile: comparatoare de preturi, istoric preturi
- Livrare si retururi: drepturi legale, ce garanteaza legea romana
- Plata in rate fara dobanda — cand e avantajos, ce sa verifici
- Newsletter-e si alerte de pret: cum setezi ca sa nu ratezi ofertele
- AmCupon.ro ca resursa: cum sa folosesti codurile de pe site
- FAQ: plata in siguranta, produse contrafacute, garantii
Slug: {f"ghid-cumparaturi-online-romania-{AN}"}""",
    },
    {
        "slug": f"cum-alegi-televizor-{AN}",
        "title": f"Cum alegi un televizor in {AN} — Ghid practic Romania",
        "category": "Electronice IT&C",
        "keywords": ["cum alegi televizor", "cel mai bun tv ieftin romania", "televizor care sa cumpar 2026"],
        "prompt": f"""Scrie un ghid practic pentru cumpararea unui televizor in Romania {AN}.
Include:
- Dimensiune recomandata in functie de distanta de vizionare (tabel concret)
- Rezolutie: Full HD vs 4K — cand merita 4K real
- Tipuri de panel: IPS, VA, OLED, QLED — diferente reale in imagini
- Smart TV OS: Android TV, Tizen, WebOS — care e mai bun si de ce
- HDR explicat simplu: HDR10, Dolby Vision, HLG
- Bugete: sub 1500 lei, 1500-3000 lei, 3000-5000 lei, 5000+ lei
- Top 3-4 modele concrete recomandate per segment buget
- Branduri: Samsung, LG, Sony, TCL, Hisense — ce ofera fiecare
- Unde cumperi: [eMAG](/cod-reducere/emag.ro), [Altex](/cod-reducere/altex.ro), [Flanco](/cod-reducere/flanco.ro)
- FAQ: garantie, montaj pe perete, soundbar necesar, gaming pe tv
Slug: {f"cum-alegi-televizor-{AN}"}""",
    },
    {
        "slug": f"creme-fata-antirid-ieftine-{AN}",
        "title": f"Creme de fata antirid ieftine si eficiente — Recomandari {AN}",
        "category": "Beauty",
        "keywords": ["crema fata antirid ieftina", "crema antirid buna pret mic", "ingrijire ten antirid ieftin"],
        "prompt": f"""Scrie un ghid practic despre cremele antirid ieftine si eficiente disponibile in Romania {AN}.
Include:
- Ingrediente active care chiar functioneaza: retinol, vitamina C, acid hialuronic, peptide — explicatii simple
- Ce nu merita sa platesti (ingrediente de marketing fara efect dovedit)
- Rutina de ingrijire simpla: curatare, ser, crema, SPF — ordinea corecta
- Top 6-8 creme antirid sub 100 lei disponibile in Romania (cu ingrediente active specifice)
- Top 3-4 optiuni 100-200 lei raport calitate-pret excelent
- Branduri farmaceutice vs cosmetice: Vichy, La Roche-Posay, Avene vs Nivea, Garnier
- Unde cumperi: [Notino](/cod-reducere/notino.ro), [Dr. Max](/cod-reducere/drmax.ro), [Vegis](/cod-reducere/vegis.ro)
- Cum citesti o eticheta INCI (top 5 ingrediente conteaza)
- FAQ: varsta la care incepi, zi vs noapte, SPF de ce e obligatoriu
Slug: {f"creme-fata-antirid-ieftine-{AN}"}""",
    },
    {
        "slug": f"ghid-haine-sport-fitness-ieftine-{AN}",
        "title": f"Haine sport si fitness ieftine in Romania {AN} — Ghid complet",
        "category": "Sport & Outdoor",
        "keywords": ["haine sport ieftine romania", "echipament fitness ieftin", "haine sala fitness pret mic"],
        "prompt": f"""Scrie un ghid practic pentru cumpararea de haine sport si echipament fitness ieftin in Romania {AN}.
Include:
- Ce materiale conteaza: poliester vs bumbac (de ce poliesterul e mai bun la sala), merino
- Greseli comune: sa cumperi ce e ieftin dar nu respira
- Tipuri de activitati si ce ai nevoie concret: sala, alergare, yoga, ciclism
- Top magazine de unde cumperi ieftin: [Decathlon](/cod-reducere/decathlon.ro), [SportDepot](/cod-reducere/sportdepot.ro), [Intersport](/cod-reducere/intersport.ro), [FashionDays](/cod-reducere/fashiondays.ro)
- Branduri Decathlon (Kalenji, Nyamba etc.) vs branduri premium (Nike, Adidas) — cand merita diferenta de pret
- Set de baza pentru sala sub 300 lei: ce cumperi concret
- Set de baza pentru alergare sub 400 lei: incaltaminte + haine
- Sezonuri de reduceri la haine sport
- FAQ: spalare echipament sport, durata de viata, marime
Slug: {f"ghid-haine-sport-fitness-ieftine-{AN}"}""",
    },
    {
        "slug": f"produse-ingrijire-copii-ieftine-{AN}",
        "title": f"Produse ingrijire bebelusi si copii ieftine — Ghid {AN} Romania",
        "category": "Copii & Jucarii",
        "keywords": ["produse bebelusi ieftine", "ingrijire copii pret mic romania", "ce sa cumperi pentru bebelus"],
        "prompt": f"""Scrie un ghid util pentru parintii romani care vor sa economiseasca la produsele pentru copii/bebelusi in {AN}.
Include:
- Lista esentiala de produse pentru primul an (ce ai nevoie vs ce e marketing)
- Branduri de incredere vs branduri scumpe inutil pentru ingrijire: scutece, creme, sampon
- Unde merita sa cumperi de firma vs generice (scutece, lenjerie pat)
- Top magazine cu raport calitate-pret: [Noriel](/cod-reducere/noriel.ro), [eMAG](/cod-reducere/emag.ro), [Bebe Tei](/cod-reducere/bebetei.ro)
- Carucioare si scaune auto: ce specificatii verifica, cum nu te lasi pacalit
- Cum economisesti: grupuri de parinti, cumparaturi second-hand (ce e ok vs ce nu)
- Jucarii educative sub 100 lei recomandate per grupa de varsta
- FAQ: securitate jucarii (CE marking), varstele recomandate, alergii
Slug: {f"produse-ingrijire-copii-ieftine-{AN}"}""",
    },
    {
        "slug": f"suplimente-alimentare-care-merita-{AN}",
        "title": f"Ce suplimente alimentare merita banii — Ghid bazat pe stiinta {AN}",
        "category": "Sanatate",
        "keywords": ["suplimente alimentare care merita", "suplimente dovedite stiintific", "ce vitamine sa iei"],
        "prompt": f"""Scrie un ghid bazat pe dovezi stiintifice despre suplimentele alimentare care chiar functioneaza, pentru romani in {AN}.
Include:
- Suplimente cu dovezi clare: Vitamina D3 (doza, de ce romanii sunt deficitari), Magneziu (forme: glicinat vs oxid), Omega-3, Zinc, Vitamina B12 (vegani)
- Ce e de evitat: suplimente exagerat de scumpe, formule complexe inutile
- Cand ai nevoie de suplimente vs cand e suficienta dieta
- Unde cumperi in Romania la pret corect: [Vegis](/cod-reducere/vegis.ro), [Dr. Max](/cod-reducere/drmax.ro), [Catena](/cod-reducere/catena.ro)
- Branduri de incredere vs branduri de marketing
- Cum citesti eticheta: biodisponibilitate, forma chemica, doze recomandate
- Suplimente pentru sportivi: ce merita (creatina, proteina) vs ce e scam
- FAQ: interactiuni medicamentoase, sarcina, copii, dozare
Slug: {f"suplimente-alimentare-care-merita-{AN}"}""",
    },
    {
        "slug": f"carti-best-seller-romania-{AN}",
        "title": f"Carti de citit in {AN} — Top recomandari si unde le cumperi mai ieftin",
        "category": "Carti & Edu",
        "keywords": ["carti de citit 2026", "carti bune romania 2026", "unde cumperi carti ieftine"],
        "prompt": f"""Scrie un ghid cu recomandari de carti si sfaturi pentru cumparaturi inteligente in {AN} pentru romani.
Include:
- Top 5-6 carti de non-fictiune care merita citite (cu motivatii specifice, nu clisei)
- Top 4-5 romane recomandate pentru {AN}
- Carti de dezvoltare personala care chiar au substanta vs bestseller-uri goale
- Unde cumperi carti mai ieftin in Romania: [Libris](/cod-reducere/libris.ro), [Elefant](/cod-reducere/elefant.ro), [Carturesti](/cod-reducere/carturesti.ro), [Bookzone](/cod-reducere/bookzone.ro)
- Comparatie preturi: cum gasesti acelasi titlu cu 30-40% mai ieftin
- E-books vs print — cand e mai ieftin fiecare
- Abonamente carti: Storytel, BookSummary — merita?
- Carti in engleza la pret mic (surse online)
- FAQ: carti in rate, termen livrare, carti scoase din tipar
Slug: {f"carti-best-seller-romania-{AN}"}""",
    },
]


def load_existing_blog() -> list:
    if not BLOG_JSON.exists():
        return []
    with open(BLOG_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def save_blog(posts: list):
    with open(BLOG_JSON, "w", encoding="utf-8") as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)


def extract_h1(content: str) -> str:
    m = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    return m.group(1).strip() if m else ""


def genereaza_articol(client, articol: dict) -> dict | None:
    try:
        print(f"  Generez: {articol['slug']}...")
        msg = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=2000,
            system=SYSTEM_PROMPT,
            messages=[
                {"role": "user", "content": articol["prompt"]}
            ],
        )
        content = msg.content[0].text
        h1 = extract_h1(content)
        title = h1 if h1 else articol["title"]

        excerpt_match = re.search(r'^(?:#[^\n]*\n+)?([^#\n][^\n]{50,})', content, re.MULTILINE)
        excerpt = excerpt_match.group(1)[:180].strip() + "..." if excerpt_match else articol["title"]

        return {
            "slug": articol["slug"],
            "title": title,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "excerpt": excerpt,
            "category": articol["category"],
            "cover": f"https://picsum.photos/seed/{articol['slug']}/800/400",
            "content": content,
            "tip": "ghid-ai",
            "keywords": articol.get("keywords", []),
        }
    except Exception as e:
        print(f"  EROARE la {articol['slug']}: {e}")
        return None


def main():
    if not CLAUDE_AVAILABLE:
        print("anthropic nu e instalat — skip")
        return

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        print("ANTHROPIC_API_KEY nu e setat — skip generate_ai_guides")
        return

    client = anthropic.Anthropic(api_key=api_key)
    posts = load_existing_blog()
    sluguri_existente = {p["slug"] for p in posts}

    de_generat = [
        a for a in ARTICOLE_TINTA
        if a["slug"] not in sluguri_existente
    ]

    if not de_generat:
        print("Toate articolele ghid sunt deja generate.")
        return

    to_process = de_generat[:ARTICLES_PER_RUN]
    print(f"Generez {len(to_process)} articole ghid AI (din {len(de_generat)} ramase)...")

    noi = []
    for articol in to_process:
        post = genereaza_articol(client, articol)
        if post:
            noi.append(post)
            print(f"  OK: {post['slug']}")
        time.sleep(1)

    if noi:
        posts = noi + posts
        save_blog(posts)
        print(f"Salvat {len(noi)} articole noi. Total: {len(posts)} articole.")
    else:
        print("Niciun articol nou generat.")


if __name__ == "__main__":
    main()
