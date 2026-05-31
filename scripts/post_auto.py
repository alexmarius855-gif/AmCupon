"""
Generare 3 posturi Facebook/zi cu Ollama — selectie + editare inainte de postare.
Pune tokenul tau la PAGE_TOKEN si ruleaza cu POSTEAZA-FB.bat
"""

import json, urllib.request, urllib.parse, urllib.error, sys, os, textwrap
from datetime import datetime, timezone, timedelta

if sys.stdout.encoding != "utf-8":
    try: sys.stdout.reconfigure(encoding="utf-8")
    except: pass

# ═══ SETEAZA AICI ════════════════════════════════
PAGE_TOKEN = "PUNE_TOKENUL_TAU_AICI"
PAGE_ID    = "1080299791844588"
# ═════════════════════════════════════════════════

SITE   = "https://amcupon.ro"
OLLAMA = "http://localhost:11434"
LUNI   = ["ianuarie","februarie","martie","aprilie","mai","iunie",
          "iulie","august","septembrie","octombrie","noiembrie","decembrie"]

TIPURI = [
    {
        "id": "urgenta",
        "emoji": "🔥",
        "label": "URGENTA — pret taiat",
        "ora":   "12:00-14:00",
        "instructiune": """Scrie un post Facebook TIP URGENTA cu formula:
- Prima linie: "🔥 [PRODUS/CATEGORIE] — DOAR AZI!" sau "-X% REDUCERE LA [MAGAZIN]!"
- A doua linie: pretul original taiat: ~~LEI~~ → pret nou LEI (daca ai datele)
- Lista scurta: 2-3 magazine cu cod si link direct
- CTA puternic: "Apasa ACUM" / "Stocuri limitate" / "Expira maine"
- Hashtag-uri: MAXIM 4 (#reduceri #[magazin] #oferte #amcupon)
Fii direct, agresiv, cu urgenta reala. Fara introduceri lungi."""
    },
    {
        "id": "prietenos",
        "emoji": "💬",
        "label": "CONVERSATIONAL — sfat de cumparaturi",
        "ora":   "19:00-21:00",
        "instructiune": """Scrie un post Facebook CONVERSATIONAL, ca un prieten care da un sfat:
- Incepe cu o intrebare sau observatie: "Stiai ca...?" / "Daca cumperi [categorie] aceasta saptamana..."
- Prezinta 2-3 oferte ca recomandari personale, nu reclama
- Ton cald, nu agresiv, de genul: "Am gasit asta si mi s-a parut super"
- Termina cu intrebare pentru engagement: "Voi de la ce magazine cumparati?"
- Hashtag-uri: MAXIM 4"""
    },
    {
        "id": "nisa",
        "emoji": "🎯",
        "label": "NISA — categoria zilei",
        "ora":   "19:00-21:00",
        "instructiune": """Scrie un post Facebook SPECIALIZAT pe O SINGURA categorie (fashion / sport / farmacie / copii / carti — alege cea mai relevanta din ofertele de mai jos):
- Titlu clar cu categoria: "👗 FASHION AZI" sau "💊 FARMACIE ONLINE"
- 3-4 magazine din acea categorie cu ofertele lor
- Link catre pagina de categorie de pe amcupon.ro
- Hashtag-uri: categoria + #reduceri #amcupon (4 total)"""
    },
]


def get_promotii(n=8):
    path = os.path.join(os.path.dirname(__file__), "../frontend/public/output.json")
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    result = []
    for m in data:
        if not m.get("are_promotie"): continue
        for p in m.get("promotii", []):
            if p.get("zile_ramase", -1) < 0: continue
            result.append({
                "magazin":  m["magazin"],
                "categorie": m.get("categorie_slug", ""),
                "oferta":   p.get("nume", "")[:70],
                "cod":      p.get("cod_cupon", ""),
                "zile":     p.get("zile_ramase", 99),
                "url":      f"{SITE}/cod-reducere/{m['magazin']}"
            })
    result.sort(key=lambda x: x["zile"])
    return result[:n]


def build_context(promotii):
    lines = []
    for p in promotii:
        r = f"- {p['magazin']} ({p['categorie']}): {p['oferta']}"
        if p["cod"]: r += f" | Cod: {p['cod']}"
        r += f" | {p['url']}"
        lines.append(r)
    return "\n".join(lines)


def genereaza(instructiune, context, data_str):
    prompt = f"""Esti copywriter roman expert pentru AmCupon.ro (site coduri reducere Romania).
REGULI STRICTE:
- Scrie EXCLUSIV in romana corecta
- Raspunde DIRECT cu postarea, fara explicatii
- Maxim 180 de cuvinte
- Include INTOTDEAUNA linkul {SITE}/oferte-azi sau link specific din lista
- Foloseste DOAR magazinele si codurile din lista — NU inventa

Data: {data_str}
Oferte active:
{context}

{instructiune}

POSTAREA:"""

    body = json.dumps({
        "model": "llama3.2",
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.75, "num_predict": 300}
    }).encode()
    req = urllib.request.Request(
        f"{OLLAMA}/api/generate",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())["response"].strip()


def copiaza_clipboard(text):
    """Copiaza textul in clipboard pe Windows."""
    try:
        import subprocess
        proc = subprocess.Popen(['clip'], stdin=subprocess.PIPE, close_fds=True)
        proc.communicate(input=text.encode('utf-8'))
        return True
    except Exception as e:
        print(f"  ⚠️  Clipboard error: {e}")
        return False


def deschide_facebook():
    """Deschide pagina Facebook in browser."""
    import webbrowser
    webbrowser.open("https://www.facebook.com/people/AmCuponro/61590235029734")


def posteaza(text, link):
    # Incearca API daca token e setat
    if PAGE_TOKEN != "PUNE_TOKENUL_TAU_AICI":
        payload = urllib.parse.urlencode({
            "message": text,
            "link": link,
            "access_token": PAGE_TOKEN
        }).encode()
        req = urllib.request.Request(
            f"https://graph.facebook.com/v19.0/{PAGE_ID}/feed",
            data=payload,
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as r:
                res = json.loads(r.read())
            print(f"  ✅ POSTAT AUTOMAT! ID: {res.get('id')}")
            return True
        except urllib.error.HTTPError as e:
            print(f"  ❌ API Error: {e.read().decode()[:200]}")

    # Fallback: clipboard + deschide browser
    print("\n  📋 Copiez postarea in clipboard...")
    copiaza_clipboard(text + f"\n\n{link}")
    print("  ✅ Copiat in clipboard!")
    print("  🌐 Deschid Facebook in browser...")
    deschide_facebook()
    print("\n  👉 Click pe 'La ce te gandesti?' si apasa CTRL+V")
    print("  👉 Apoi click PUBLICA\n")
    return True


def salveaza_log(tip, text):
    log = os.path.join(os.path.dirname(__file__), "../data/fb-posts-log.txt")
    now = datetime.now(timezone.utc) + timedelta(hours=3)
    with open(log, "a", encoding="utf-8") as f:
        f.write(f"\n{'='*55}\n")
        f.write(f"[{now.strftime('%d.%m.%Y %H:%M')}] TIP: {tip}\n")
        f.write("─"*55 + "\n")
        f.write(text + "\n")


def separator(titlu=""):
    w = 55
    if titlu:
        pad = (w - len(titlu) - 2) // 2
        print("\n" + "─"*pad + f" {titlu} " + "─"*pad)
    else:
        print("─"*w)


# ── MAIN ──────────────────────────────────────────────────
print("\n" + "═"*55)
print("  🤖 AMCUPON — GENERATOR POSTURI FACEBOOK")
print("═"*55)

now_ro   = datetime.now(timezone.utc) + timedelta(hours=3)
data_str = f"{now_ro.day} {LUNI[now_ro.month-1]} {now_ro.year}"

print(f"\n📅 Data: {data_str}")
print("📥 Citesc promotiile...")
promotii = get_promotii(8)
print(f"   {len(promotii)} oferte active\n")

context = build_context(promotii)
posturi = []

# Genereaza 3 posturi
for i, tip in enumerate(TIPURI, 1):
    print(f"🔄 Generez postarea {i}/3: {tip['emoji']} {tip['label']}...", end=" ", flush=True)
    try:
        text = genereaza(tip["instructiune"], context, data_str)
        posturi.append({"tip": tip, "text": text})
        print("✓")
    except Exception as e:
        print(f"❌ ({e})")
        posturi.append({"tip": tip, "text": None})

# Afiseaza cele 3 posturi
print("\n" + "═"*55)
print("  📋 CELE 3 POSTURI GENERATE")
print("═"*55)

for i, p in enumerate(posturi, 1):
    if not p["text"]: continue
    separator(f"{p['tip']['emoji']} POST {i} — {p['tip']['label']}")
    print(f"  ⏰ Ora recomandata: {p['tip']['ora']}")
    separator()
    # Wrap text frumos
    for linie in p["text"].split("\n"):
        if len(linie) > 70:
            print(textwrap.fill(linie, width=70, subsequent_indent="  "))
        else:
            print(linie)

# Selectie
print("\n" + "═"*55)
print("Ce vrei sa faci?\n")
print("  1 → Posteaza postarea 1 (Urgenta)")
print("  2 → Posteaza postarea 2 (Conversational)")
print("  3 → Posteaza postarea 3 (Nisa)")
print("  e1/e2/e3 → Editeaza postarea inainte de a o posta")
print("  t → Posteaza TOATE 3 (pentru ziua de azi)")
print("  n → Nu posta nimic, iesire")
print()

alegere = input("Alegerea ta: ").strip().lower()

if alegere == "n":
    print("\nOk, nicio postare.")
    sys.exit(0)

if alegere == "t":
    # Posteaza toate 3
    for i, p in enumerate(posturi, 1):
        if p["text"]:
            link = f"{SITE}/oferte-azi"
            print(f"\nPostez postarea {i}...")
            posteaza(p["text"], link)
            salveaza_log(p["tip"]["label"], p["text"])
    print("\n✅ Toate 3 posturi trimise!")
    sys.exit(0)

# Editare
idx = None
if alegere.startswith("e") and alegere[1:] in ("1","2","3"):
    idx = int(alegere[1:]) - 1
    p = posturi[idx]
    print(f"\n✏️  Editeaza postarea {idx+1} (scrie noul text, termina cu o linie goala + ENTER):\n")
    linii = []
    while True:
        linie = input()
        if linie == "" and linii and linii[-1] == "":
            break
        linii.append(linie)
    text_editat = "\n".join(linii).strip()
    if text_editat:
        posturi[idx]["text"] = text_editat
        print("\n✓ Text actualizat!")
    alegere = str(idx + 1)  # continua cu postarea

if alegere in ("1","2","3"):
    idx = int(alegere) - 1
    p   = posturi[idx]
    if p["text"]:
        link = f"{SITE}/oferte-azi"
        salveaza_log(p["tip"]["label"], p["text"])
        print(f"\nPostez postarea {idx+1} ({p['tip']['label']})...")
        posteaza(p["text"], link)
    else:
        print("Aceasta postare nu a putut fi generata.")
else:
    print("Alegere invalida.")

input("\nApasa ENTER pentru a inchide...")
