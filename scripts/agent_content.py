"""
agent_content.py — Agent AI pentru generare continut YouTube + Blog
Foloseste Claude API (Anthropic) pentru scripturi si idei.

Rulare:
  python agent_content.py [--type youtube|blog|social|all]

Env vars:
  ANTHROPIC_API_KEY   — cheie API Claude (obtine de la console.anthropic.com)
  CLAUDE_MODEL        — model de folosit (default: claude-3-5-haiku-20241022)

Output:
  ../data/agent-content-output.json
  ../frontend/public/agent-content-latest.json  (ultimul batch)
"""

import json
import os
import sys
import argparse
from datetime import date, datetime

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_DIR     = os.path.join(SCRIPT_DIR, "..", "data")
OUTPUT_JSON  = os.path.join(DATA_DIR, "agent-content-output.json")
PUBLIC_JSON  = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "agent-content-latest.json")
TOP_JSON     = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "top-produse.json")
OUTPUT_DATA  = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "output.json")

ANTHROPIC_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
MODEL         = os.environ.get("CLAUDE_MODEL", "claude-3-5-haiku-20241022")

# ─── Nisa site-ului ────────────────────────────────────────────────────────────
CONTEXT = """
Esti un expert in marketing afiliat si content creation pentru Romania.
Site-ul se numeste AmCupon.ro — portal de coduri reducere si oferte pentru consumatorii romani.
Nisa canalului YouTube: "AI + afaceri online in Romania" — cum sa faci bani online, automatizare,
afaceri digitale, site-uri afiliate, review-uri produse tech.
Publicul tinta: romani 20-40 ani, antreprenori si freelanceri curiosi de AI si online business.
Ton: prietenos, direct, fara jargon, cu exemple concrete din Romania.
"""


def call_claude(prompt: str, max_tokens: int = 1500) -> str:
    """Apeleaza Claude API. Returneaza textul generat."""
    if not ANTHROPIC_KEY:
        print("[WARN] ANTHROPIC_API_KEY nu e setat — returning mock response")
        return f"[MOCK RESPONSE — seteaza ANTHROPIC_API_KEY]\n\nPrompt: {prompt[:100]}..."

    try:
        import anthropic
        client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
        message = client.messages.create(
            model=MODEL,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )
        return message.content[0].text
    except ImportError:
        print("[ERROR] pip install anthropic")
        return "[ERROR: anthropic not installed]"
    except Exception as e:
        print(f"[ERROR] Claude API: {e}")
        return f"[ERROR: {e}]"


def generate_youtube_script() -> dict:
    """Genereaza un script complet pentru un video YouTube."""
    # Citeste datele site-ului pentru context real
    site_context = ""
    try:
        data = json.load(open(OUTPUT_DATA, encoding="utf-8"))
        total = len(data)
        cu_promo = sum(1 for m in data if m.get("are_promotie"))
        site_context = f"Site-ul are {total} magazine partenere, {cu_promo} cu promotii active azi."
    except Exception:
        pass

    prompt = f"""{CONTEXT}

{site_context}

Genereaza un script complet pentru un video YouTube de 8-12 minute.
Subiect recomandat: un aspect al afacerilor online/AI care e relevant si in trend in Romania.
Exemple de subiecte bune:
- "Cum am facut primul meu site afiliat si cat castig"
- "Claude AI vs ChatGPT pentru afaceri mici — care e mai bun"
- "Top 5 moduri de a castiga online cu AI in 2026"
- "Cum sa automatizezi un site de coduri reducere"

Alege cel mai bun subiect si scrie:

# TITLU VIDEO (clickbait dar onest, sub 60 caractere)
# HOOK (primele 30 secunde — de ce sa continue sa urmareasca)
# DESCRIERE SEO (pentru caseta YouTube, 200 cuvinte, cu keywords)
# SCRIPT COMPLET (sectiuni cu timestamps, scris natural ca si cum vorbesti la camera)
# THUMBNAIL IDEE (ce sa scrie/arate pe thumbnail)
# TAGS (20 taguri relevante pentru SEO YouTube)
# CTA (call to action pentru abonare + link site)

Scrie in romana, ton prietenos, ca si cum esti un creator real."""

    content = call_claude(prompt, max_tokens=2000)
    return {
        "type":    "youtube_script",
        "date":    date.today().isoformat(),
        "content": content,
    }


def generate_blog_ideas() -> dict:
    """Genereaza 10 idei de articole blog cu potential SEO mare."""
    top_data = {}
    try:
        top_data = json.load(open(TOP_JSON, encoding="utf-8"))
        categorii = [c["titlu_scurt"] for c in top_data.get("categorii", [])]
    except Exception:
        categorii = ["laptopuri", "telefoane", "casti", "televizoare"]

    prompt = f"""{CONTEXT}

Categorii de produse existente pe site: {", ".join(categorii)}

Genereaza 10 idei de articole de blog cu potential SEO mare pentru Romania.
Mix de tipuri:
- Articole "Cel mai bun X pentru Y in 2026"
- Ghiduri "Cum sa..."
- Comparatii "X vs Y"
- Liste "Top 10..."
- Articole news/trending

Pentru fiecare idee include:
1. Titlul exact (optimizat SEO)
2. Keyword principal (volum cautari estimat)
3. Dificultate SEO (scazuta/medie/ridicata)
4. Structura articolului (5-7 puncte)
5. Potentialul de conversie afiliat (1-10)

Sorteaza dupa potentialul de conversie (descrescator).
Format: JSON array."""

    content = call_claude(prompt, max_tokens=2000)
    return {
        "type":    "blog_ideas",
        "date":    date.today().isoformat(),
        "content": content,
    }


def generate_social_content() -> dict:
    """Genereaza continut pentru social media (Instagram, TikTok, Facebook)."""
    # Ia top 3 magazine cu promotii din output.json
    top_promo = []
    try:
        data = json.load(open(OUTPUT_DATA, encoding="utf-8"))
        cu_promo = [m for m in data if m.get("are_promotie") and m.get("promotii")]
        cu_promo.sort(key=lambda x: x.get("scor_final", 0), reverse=True)
        top_promo = [
            {"magazin": m["magazin"], "promo": m["promotii"][0]["nume"]}
            for m in cu_promo[:5]
        ]
    except Exception:
        pass

    prompt = f"""{CONTEXT}

Top promotii active azi: {json.dumps(top_promo, ensure_ascii=False)}

Genereaza continut pentru social media pentru azi (28 Mai 2026):

## INSTAGRAM POST (caption + hashtags)
Tema: prezinta o oferta sau un tip despre cumparaturi online.
Include emoji, call-to-action, 20-25 hashtags relevante #romania.

## TIKTOK SCRIPT (video 30-60 secunde)
Hook tare in prima secunda. Text pe ecran + ce spui. Trend sound recomandat.

## FACEBOOK POST (mai lung, mai conversational)
Poate fi o poveste, un sfat sau o prezentare de oferta. 150-200 cuvinte.

## STORY IDEE (Instagram/Facebook Stories)
Ce sa postezi ca story azi — text + design sugestie.

Scrie totul in romana, ton prietenos si autentic."""

    content = call_claude(prompt, max_tokens=1500)
    return {
        "type":    "social_content",
        "date":    date.today().isoformat(),
        "content": content,
    }


def generate_business_ideas() -> dict:
    """Genereaza idei de afaceri si oportunitati bazate pe datele site-ului."""
    # Statistici site
    stats = {}
    try:
        data = json.load(open(OUTPUT_DATA, encoding="utf-8"))
        categorii = {}
        for m in data:
            cat = m.get("categorie_slug", "other")
            categorii[cat] = categorii.get(cat, 0) + 1
        top_cat = sorted(categorii.items(), key=lambda x: x[1], reverse=True)[:5]
        stats = {
            "total_magazine": len(data),
            "top_categorii": [{"categorie": c, "magazine": n} for c, n in top_cat],
        }
    except Exception:
        pass

    prompt = f"""{CONTEXT}

Date site AmCupon.ro: {json.dumps(stats, ensure_ascii=False)}

Analizeaza datele si genereaza 5 idei concrete de afaceri/expansiune pentru 2026:

Pentru fiecare idee:
1. **Titlu idee** (clar si actionabil)
2. **Oportunitatea** (de ce acum, de ce in Romania)
3. **Model de business** (cum face bani)
4. **Investitie necesara** (timp + bani estimat)
5. **Primii 3 pasi concreți** (ce faci azi/saptamana asta)
6. **Risc principal** (ce poate merge rau)
7. **Potential venit lunar** (estimat dupa 6-12 luni)

Include idei din zone diverse:
- Extensie site-ului existent (noi verticale)
- Produse digitale (cursuri, e-book-uri, tools)
- Servicii catre magazine partenere
- Noi canale de trafic
- Automatizari cu AI care pot fi monetizate

Fii specific si realist pentru piata romaneasca."""

    content = call_claude(prompt, max_tokens=2000)
    return {
        "type":    "business_ideas",
        "date":    date.today().isoformat(),
        "content": content,
    }


def save_output(results: list):
    """Salveaza rezultatele in fisiere JSON."""
    os.makedirs(DATA_DIR, exist_ok=True)

    # Incarca istoricul
    history = []
    if os.path.exists(OUTPUT_JSON):
        try:
            history = json.load(open(OUTPUT_JSON, encoding="utf-8"))
        except Exception:
            pass

    # Adauga la inceput
    batch = {
        "timestamp": datetime.now().isoformat(),
        "results":   results,
    }
    history.insert(0, batch)
    history = history[:30]  # Pastreaza ultimele 30 de batch-uri

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

    # Salveaza ultimul batch pentru dashboard
    with open(PUBLIC_JSON, "w", encoding="utf-8") as f:
        json.dump(batch, f, ensure_ascii=False, indent=2)

    print(f"[OK] Salvat in {OUTPUT_JSON}")
    print(f"[OK] Salvat in {PUBLIC_JSON}")


def main():
    parser = argparse.ArgumentParser(description="Agent AI pentru continut AmCupon.ro")
    parser.add_argument("--type", choices=["youtube", "blog", "social", "business", "all"],
                        default="all", help="Tipul de continut de generat")
    args = parser.parse_args()

    print(f"=== agent_content.py — {date.today()} ===")
    print(f"Model: {MODEL}")
    print(f"API Key: {'setat' if ANTHROPIC_KEY else 'LIPSA — output mock'}")
    print()

    results = []

    if args.type in ("youtube", "all"):
        print("[1/4] Generez script YouTube...")
        results.append(generate_youtube_script())
        print("      Done!")

    if args.type in ("blog", "all"):
        print("[2/4] Generez idei blog...")
        results.append(generate_blog_ideas())
        print("      Done!")

    if args.type in ("social", "all"):
        print("[3/4] Generez continut social media...")
        results.append(generate_social_content())
        print("      Done!")

    if args.type in ("business", "all"):
        print("[4/4] Generez idei de business...")
        results.append(generate_business_ideas())
        print("      Done!")

    save_output(results)
    print()
    print(f"=== Finalizat: {len(results)} tipuri de continut generate ===")


if __name__ == "__main__":
    main()
