"""
Generare automata posturi Facebook/Instagram cu Ollama (llama3.2 local).

Flow:
  1. Citeste output.json → top promotii active
  2. Trimite prompt catre Ollama → genereaza text creativ in romana
  3. Posteaza pe Facebook Page via Graph API

Rulare manuala:
  python generate_post_ollama.py             # genereaza + posteaza
  python generate_post_ollama.py --dry-run   # genereaza fara a posta
  python generate_post_ollama.py --tip sport # post pe o nisa specifica

Env vars:
  FACEBOOK_PAGE_ID     -- ID pagina (1080299791844588)
  FACEBOOK_PAGE_TOKEN  -- Page Access Token
  OLLAMA_URL           -- optional, default http://localhost:11434
  OLLAMA_MODEL         -- optional, default llama3.2
"""

import json
import os
import sys
import re
import argparse
import urllib.request
import urllib.parse
import urllib.error
from datetime import datetime, timezone, timedelta

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ── Config ────────────────────────────────────────────────────────────────────
OLLAMA_URL   = os.environ.get("OLLAMA_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
PAGE_ID      = os.environ.get("FACEBOOK_PAGE_ID", "1080299791844588")
PAGE_TOKEN   = os.environ.get("FACEBOOK_PAGE_TOKEN", "")
GRAPH_URL    = "https://graph.facebook.com/v19.0"
SITE_URL     = "https://amcupon.ro"

OUTPUT_JSON  = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")

LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie",
           "iulie","august","septembrie","octombrie","noiembrie","decembrie"]
ZILE_RO = ["luni","marti","miercuri","joi","vineri","sambata","duminica"]

OCAZII = {
    (6, 1):  ("Ziua Copilului", "babies-kids-toys"),
    (2, 14): ("Valentine's Day", "gifts-flowers"),
    (3, 8):  ("8 Martie", "beauty"),
    (12, 25):("Craciun", None),
    (11, 11):("Singles Day", None),
    (6, 5):  ("Ziua Mediului", None),
}

NISE_ROTATIE = [
    ("fashion",          "👗 Fashion & Imbracaminte"),
    ("beauty",           "💄 Frumusete & Cosmetice"),
    ("sports-outdoors",  "🏋 Sport & Fitness"),
    ("pharma",           "💊 Farmacie & Sanatate"),
    ("electronics-itc",  "📱 Electronice & IT"),
    ("home-garden",      "🏠 Casa & Gradina"),
    ("babies-kids-toys", "🧸 Copii & Jucarii"),
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def get_best_promo(m: dict) -> dict:
    promotii = [p for p in m.get("promotii", []) if p.get("zile_ramase", -1) >= 0]
    if not promotii:
        return {}
    cu_cod = [p for p in promotii if p.get("cod_cupon")]
    return cu_cod[0] if cu_cod else promotii[0]


def pick_top(magazine: list[dict], n: int = 5, categorie: str = None) -> list[dict]:
    def are_promo(m):
        return any(p.get("zile_ramase", -1) >= 0 for p in m.get("promotii", []))
    def are_cod(m):
        return any(p.get("cod_cupon") and p.get("zile_ramase", -1) >= 0
                   for p in m.get("promotii", []))

    pool = [m for m in magazine if are_promo(m)]
    if categorie:
        pool_cat = [m for m in pool if m.get("categorie_slug") == categorie]
        if len(pool_cat) >= 2:
            pool = pool_cat

    cu_cod    = sorted([m for m in pool if are_cod(m)],    key=lambda x: -x.get("scor_final", 0))
    fara_cod  = sorted([m for m in pool if not are_cod(m)],key=lambda x: -x.get("scor_final", 0))
    return (cu_cod + fara_cod)[:n]


def build_context(top: list[dict]) -> str:
    """Construieste un bloc de context cu promotiile pentru prompt."""
    lines = []
    for m in top:
        name  = m["magazin"]
        promo = get_best_promo(m)
        cod   = promo.get("cod_cupon", "")
        disc  = promo.get("nume", "") or m.get("comision", "")
        cat   = m.get("categorie", "")
        url   = f"{SITE_URL}/cod-reducere/{name}"
        entry = f"- {name} ({cat}): {disc[:80]}"
        if cod:
            entry += f" | Cod: {cod}"
        entry += f" | Link: {url}"
        lines.append(entry)
    return "\n".join(lines)


# ── Ollama ────────────────────────────────────────────────────────────────────

def ask_ollama(prompt: str) -> str:
    """Trimite prompt catre Ollama si returneaza textul generat."""
    payload = json.dumps({
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.8,
            "num_predict": 400,
        }
    }).encode("utf-8")

    req = urllib.request.Request(
        f"{OLLAMA_URL}/api/generate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
        return result.get("response", "").strip()
    except Exception as e:
        print(f"  Eroare Ollama: {e}")
        return ""


def build_prompt(tip: str, context: str, zi: str, data_str: str,
                 ocazie: str = None, nisa_label: str = None) -> str:
    """Construieste promptul pentru Ollama in functie de tipul postarii."""

    exemple = """
Exemple de posturi BUNE (urmareste acest stil):

Exemplu 1 (general):
"🏷️ Coduri active AZI pe AmCupon.ro!

1. Sport Depot — MID SEASON SALE + 10% extra
   Cod: EXTRA10

2. Noriel.ro — voucher 50 lei la comenzi 249 lei+
   Cod: NORIEL50

3. Optiblu.ro — 30% la toti ochelarii
   Cod: MAI

Verificate manual, 100% gratuit.
👉 https://amcupon.ro/oferte-azi

#reduceri #codreducere #shoppingonline #romania #amcupon"

Exemplu 2 (engagement):
"🤔 La ce magazine online ai cumparat ultima data?

Scrie in comentarii si iti gasim codul de reducere!

Peste 291 magazine verificate zilnic pe amcupon.ro 🛍️

#shoppingRomania #reduceri #amcupon"
"""

    baza = f"""Esti un copywriter roman expert in social media pentru AmCupon.ro.
AmCupon.ro = site cu coduri de reducere de la magazine online din Romania.

REGULI OBLIGATORII:
1. Scrie EXCLUSIV in romana corecta gramatical
2. Foloseste cuvinte simple, directe, fara inventii
3. Maxim 200 de cuvinte total
4. Emoji-uri la inceput de rand, nu in mijlocul cuvintelor
5. Hashtag-uri la final, pe un rand separat (8-10 hashtag-uri)
6. Include INTOTDEAUNA link-ul: {SITE_URL}
7. Foloseste DOAR magazinele si codurile din lista de mai jos, NU inventa
8. Nu folosi cuvinte ca: "scumpioase", "bănuitor", "beneficeste", "rogesti" — scrie corect
9. Raspunde DIRECT cu postarea, fara introducere sau explicatii

{exemple}

OFERTE ACTIVE ACUM (foloseste-le):
{context}

Data: {data_str} ({zi})
"""

    if ocazie:
        baza += f"\nOcazie: {ocazie} — mentioneaza-o natural in post."
    if nisa_label:
        baza += f"\nCategorie: {nisa_label}"

    tipuri = {
        "general":    "Scrie un post cu top ofertele active. Structura: intro scurt → lista magazine cu cod → CTA → hashtag-uri.",
        "story":      "Scrie text SCURT pentru Story (max 4 randuri): 1 oferta principala + cod + link. Impact maxim, fara explicatii lungi.",
        "engagement": "Scrie un post cu o intrebare simpla pentru comentarii. Ex: 'La ce magazine cumperi?' sau 'Ce reducere cauti?'. Apoi 2-3 oferte scurte + link.",
        "produs":     "Prezinta ofertele ca un prieten care recomanda: 'Tocmai am gasit...' sau 'Stiai ca...'. Conversational, nu publicitar.",
    }
    baza += f"\n\nTIP POST: {tipuri.get(tip, tipuri['general'])}"
    baza += "\n\nSCRIE POSTAREA:"

    return baza


# ── Facebook Post ─────────────────────────────────────────────────────────────

def post_to_facebook(message: str, link: str = "") -> dict:
    if not PAGE_TOKEN:
        print("  FACEBOOK_PAGE_TOKEN nu e setat — skip postare")
        return {}

    endpoint = f"{GRAPH_URL}/{PAGE_ID}/feed"
    payload  = {"message": message, "access_token": PAGE_TOKEN}
    if link:
        payload["link"] = link

    data = urllib.parse.urlencode(payload).encode("utf-8")
    req  = urllib.request.Request(endpoint, data=data, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            result = json.loads(resp.read())
        print(f"  ✅ Postat! ID: {result.get('id', '?')}")
        return result
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  ❌ Eroare HTTP {e.code}: {body[:300]}")
        return {}
    except Exception as e:
        print(f"  ❌ Eroare: {e}")
        return {}


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Genereaza fara a posta")
    parser.add_argument("--tip", default="auto",
                        choices=["auto","general","story","engagement","produs"],
                        help="Tipul postarii")
    parser.add_argument("--nisa", default=None,
                        help="Nisa specifica: fashion, sport, pharma, books etc.")
    args = parser.parse_args()

    # Incarca date
    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    valide = [
        m for m in magazine
        if m.get("are_promotie") and m.get("promotii")
        and m.get("procent_succes", 0) >= 50
        and " " not in m.get("magazin", "")
    ]

    # Data si zi
    now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
    zi_idx   = now_ro.weekday()
    zi_name  = ZILE_RO[zi_idx]
    data_str = f"{now_ro.day} {LUNI_RO[now_ro.month - 1]} {now_ro.year}"
    luna_zi  = (now_ro.month, now_ro.day)

    # Detecteaza ocazie
    ocazie, ocazie_cat = OCAZII.get(luna_zi, (None, None))

    # Nisa rotativa sau specificata
    if args.nisa:
        nisa_slug  = args.nisa
        nisa_label = dict(NISE_ROTATIE).get(nisa_slug, nisa_slug.title())
    elif ocazie_cat:
        nisa_slug  = ocazie_cat
        nisa_label = None
    else:
        nisa_slug, nisa_label = NISE_ROTATIE[zi_idx % len(NISE_ROTATIE)]

    # Tip postare
    tip = args.tip
    if tip == "auto":
        if zi_idx in (5, 6):
            tip = "engagement"
        elif luna_zi in OCAZII:
            tip = "general"
        else:
            tip = "general"

    # Selecteaza magazine
    top = pick_top(valide, n=5, categorie=nisa_slug if nisa_slug else None)
    if not top:
        top = pick_top(valide, n=5)

    context = build_context(top)

    print(f"\n{'='*55}")
    print(f"  Data: {data_str} ({zi_name}) | Tip: {tip} | Nisa: {nisa_slug}")
    if ocazie:
        print(f"  Ocazie: {ocazie}")
    print(f"  Magazine selectate: {[m['magazin'] for m in top]}")
    print(f"{'='*55}\n")

    # Genereaza cu Ollama
    print(f"Generez post cu Ollama ({OLLAMA_MODEL})...")
    prompt   = build_prompt(tip, context, zi_name, data_str, ocazie, nisa_label)
    post_txt = ask_ollama(prompt)

    if not post_txt:
        print("Ollama nu a returnat text. Verifica ca ruleaza: ollama serve")
        sys.exit(1)

    print("\n" + "─"*55)
    print("POST GENERAT:")
    print("─"*55)
    print(post_txt)
    print("─"*55)

    # Salveaza in fisier log
    log_path = os.path.join(os.path.dirname(__file__), "../data/fb-posts-log.txt")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"\n\n{'='*55}\n")
        f.write(f"Data: {data_str} | Tip: {tip} | Nisa: {nisa_slug}\n")
        f.write("─"*55 + "\n")
        f.write(post_txt + "\n")

    # Posteaza
    if args.dry_run:
        print("\n[DRY RUN] Post NU a fost trimis pe Facebook.")
    else:
        link = f"{SITE_URL}/categorii/{nisa_slug}" if nisa_slug else f"{SITE_URL}/oferte-azi"
        print(f"\nPostez pe Facebook (link: {link})...")
        post_to_facebook(post_txt, link)

    print(f"\nPost salvat in: data/fb-posts-log.txt")


if __name__ == "__main__":
    main()
