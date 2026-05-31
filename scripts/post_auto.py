"""
Post automat Facebook cu Ollama.
Pune tokenul tau in linia PAGE_TOKEN de mai jos, apoi ruleaza.
"""

import json, urllib.request, urllib.parse, urllib.error, sys

if sys.stdout.encoding != "utf-8":
    try: sys.stdout.reconfigure(encoding="utf-8")
    except: pass

# ═══ SETEAZA AICI ════════════════════════════════
PAGE_TOKEN = "PUNE_TOKENUL_TAU_AICI"
PAGE_ID    = "1080299791844588"
# ═════════════════════════════════════════════════

SITE = "https://amcupon.ro"
OLLAMA = "http://localhost:11434"

def get_promotii():
    with open("../frontend/public/output.json", encoding="utf-8") as f:
        data = json.load(f)
    result = []
    for m in data:
        if not m.get("are_promotie"): continue
        for p in m.get("promotii", []):
            if p.get("zile_ramase", -1) < 0: continue
            result.append({
                "magazin": m["magazin"],
                "oferta":  p.get("nume", "")[:70],
                "cod":     p.get("cod_cupon", ""),
                "url":     f"{SITE}/cod-reducere/{m['magazin']}"
            })
    return result[:6]

def genereaza_post(promotii):
    lista = ""
    for p in promotii:
        rand = f"- {p['magazin']}: {p['oferta']}"
        if p["cod"]: rand += f" | Cod: {p['cod']}"
        lista += rand + "\n"

    prompt = f"""Esti copywriter roman pentru AmCupon.ro (site coduri reducere).
Scrie un post Facebook scurt si atractiv in romana corecta.
Foloseste emoji-uri, include link-ul {SITE}/oferte-azi si 6-8 hashtag-uri la final.
Raspunde DOAR cu postarea, fara alte comentarii.

Oferte active:
{lista}"""

    body = json.dumps({"model":"llama3.2","prompt":prompt,"stream":False,"options":{"temperature":0.7,"num_predict":350}}).encode()
    req = urllib.request.Request(f"{OLLAMA}/api/generate", data=body, headers={"Content-Type":"application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())["response"].strip()

def posteaza(text):
    if PAGE_TOKEN == "PUNE_TOKENUL_TAU_AICI":
        print("\n⚠️  Pune tokenul in fisier la linia PAGE_TOKEN!\n")
        return
    payload = urllib.parse.urlencode({"message":text,"link":f"{SITE}/oferte-azi","access_token":PAGE_TOKEN}).encode()
    req = urllib.request.Request(f"https://graph.facebook.com/v19.0/{PAGE_ID}/feed", data=payload, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            res = json.loads(r.read())
        print(f"✅ Postat! ID: {res.get('id')}")
    except urllib.error.HTTPError as e:
        print(f"❌ Eroare: {e.read().decode()[:200]}")

# ── Run ───────────────────────────────────────────
print("📥 Citesc promotiile...")
promotii = get_promotii()
print(f"   {len(promotii)} oferte active\n")

print("🤖 Generez post cu Ollama...")
post = genereaza_post(promotii)
print("\n" + "─"*50)
print(post)
print("─"*50 + "\n")

confirm = input("Postezi pe Facebook? (da/nu): ").strip().lower()
if confirm == "da":
    posteaza(post)
else:
    print("Ok, post nesalvat.")
