#!/usr/bin/env python3
"""
postari_zi.py — comanda LOCALA pentru postari sociale zilnice (rulata de Alex).

Idee: tu rulezi asta dimineata si seara, iti scuipa 2 postari gata de copy-paste
(dimineata = ofertele zilei, seara = alta abordare la ora 22). TU revizuiesti si
postezi. Nu consuma planul Claude Code — foloseste Ollama LOCAL (gratis).

Design anti-halucinatie: Python construieste scheletul corect (oferte, coduri,
linkuri, hashtag-uri — fapte garantate). Ollama doar REScrie hook-ul in stil care
prinde atentia. Asa un model mic nu poate strica datele, doar adauga atractie.
Daca Ollama nu raspunde -> fallback pe hook-uri din sablon (tot functional).

Uz:
  python postari_zi.py                # ambele (dimineata + seara)
  python postari_zi.py dimineata      # doar postarea de dimineata
  python postari_zi.py seara          # doar postarea de seara

Config (optional):
  OLLAMA_MODEL=qwen2.5:7b   # implicit: primul model instalat (recomand qwen2.5:7b)
  OLLAMA_HOST=http://localhost:11434
"""

import io
import json
import os
import sys
from datetime import datetime
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import requests

ROOT = Path(__file__).parent.parent
PUBLIC = ROOT / "frontend" / "public"
DATA = ROOT / "data"

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
LUNI_RO = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie",
           "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"]


# ─── Ollama ───────────────────────────────────────────────────────────────────
def ollama_model() -> str | None:
    """Modelul ales (env) sau primul instalat. None daca Ollama nu raspunde."""
    forced = os.environ.get("OLLAMA_MODEL", "").strip()
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=4)
        modele = [m["name"] for m in r.json().get("models", [])]
    except Exception:
        return None
    if not modele:
        return None
    if forced and forced in modele:
        return forced
    if forced:  # cerut dar neinstalat — anunta si cade pe ce exista
        print(f"  ⚠ {forced} nu e instalat (ai: {', '.join(modele)}). Folosesc {modele[0]}.")
    return modele[0]


def ollama_hook(model: str, tema: str, nume_oferte: str) -> str | None:
    """Cere DOAR un hook scurt de deschidere (1-2 fraze), nu fapte."""
    prompt = (
        f"Scrie DOAR un hook scurt de deschidere (1-2 fraze, maxim 25 de cuvinte) "
        f"pentru o postare pe social media in romana, despre {tema}. "
        f"Mentioneaza ca azi ies in evidenta: {nume_oferte}. "
        "Ton energic dar nu siropos, care face omul sa se opreasca din scroll. "
        "Fara hashtag-uri, fara linkuri, fara lista. Doar hook-ul, atat. "
        "Scrie in romana corecta, fara greseli."
    )
    try:
        r = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={"model": model, "prompt": prompt, "stream": False,
                  "options": {"temperature": 0.8, "num_predict": 80}},
            timeout=60,
        )
        txt = (r.json().get("response") or "").strip()
    except Exception as e:
        print(f"  (Ollama hook esuat: {e})")
        return None
    # curatare: scoate preambuluri tip "Iata:", ghilimele, salut generic
    txt = txt.strip().strip('"').strip()
    for junk in ("Bună ziua", "Buna ziua", "Salut!", "Iată", "Iata", "Hook:"):
        if txt.startswith(junk):
            txt = txt.split("\n", 1)[-1].strip() if "\n" in txt else txt[len(junk):].lstrip(" :,!-")
    txt = txt.split("\n")[0].strip()  # doar prima linie
    return txt or None


# ─── Date ─────────────────────────────────────────────────────────────────────
def load_picks() -> list:
    """Foloseste digest-today.json daca exista; altfel il genereaza inline."""
    p = PUBLIC / "digest-today.json"
    if p.exists():
        try:
            d = json.load(io.open(p, encoding="utf-8"))
            if d.get("picks"):
                return d["picks"]
        except Exception:
            pass
    # fallback: genereaza pe loc folosind selectia din generate_daily_digest
    try:
        import generate_daily_digest as gdd
        return gdd.select_deals(gdd.load_magazine())
    except Exception as e:
        print(f"Nu am putut incarca ofertele: {e}")
        return []


HASHTAGS = "#reduceri #coduireducere #oferte #shopping #romania #amcupon"


def skeleton(picks: list, n: int) -> tuple[str, str]:
    """Construieste lista de oferte (fapte garantate) + numele pt hook."""
    top = picks[:n]
    linii = []
    for p in top:
        cod = f" — cod: {p['cod']}" if p.get("cod") else ""
        linii.append(f"🔹 {p['nume_afisat']}{cod}\n   {p['url']}")
    nume = ", ".join(p["nume_afisat"] for p in top[:2])
    return "\n".join(linii), nume


def compune(model, picks, moment: str) -> str:
    now = datetime.now()
    data_str = f"{now.day} {LUNI_RO[now.month - 1]}"
    if moment == "dimineata":
        n, tema = 4, "ofertele verificate ale zilei"
        titlu = f"☀️ Ofertele zilei — {data_str}"
        cta = "👉 Toate codurile verificate pe amcupon.ro"
    else:
        n, tema = 3, "ultimele oferte bune ramase azi"
        titlu = f"🌙 Ultima șansă azi — {data_str}"
        cta = "👉 Prinde-le până la miezul nopții pe amcupon.ro"

    lista, nume = skeleton(picks, n)
    hook = (ollama_hook(model, tema, nume) if model else None) or \
        (f"Am verificat azi ofertele și am ales ce chiar merită — {nume} ies în față."
         if moment == "dimineata"
         else f"Se închide ziua, dar codurile astea încă merg — {nume} pe ultima sută.")

    return f"{titlu}\n\n{hook}\n\n{lista}\n\n{cta}\n\n{HASHTAGS}"


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    arg = (sys.argv[1].lower() if len(sys.argv) > 1 else "ambele")
    momente = [arg] if arg in ("dimineata", "seara") else ["dimineata", "seara"]

    picks = load_picks()
    if not picks:
        print("Nicio oferta disponibila — ruleaza intai generate_daily_digest.py sau pipeline-ul.")
        return

    model = ollama_model()
    print(f"{'='*56}")
    print(f"Postari sociale — voce: {'Ollama ' + model if model else 'sablon (Ollama oprit)'}")
    print(f"{'='*56}")

    out = []
    for m in momente:
        post = compune(model, picks, m)
        out.append(post)
        print(f"\n┌─ POSTARE {m.upper()} " + "─" * 30)
        print(post)
        print("└" + "─" * 48)

    DATA.mkdir(parents=True, exist_ok=True)
    with io.open(DATA / "postari-azi.txt", "w", encoding="utf-8") as f:
        f.write("\n\n" + ("\n\n" + "—" * 40 + "\n\n").join(out) + "\n")
    print(f"\n✅ Salvat si in: {DATA / 'postari-azi.txt'}  (copy-paste de aici)")
    if not model:
        print("💡 Porneste Ollama (sau trage qwen2.5:7b) pentru hook-uri mai bune.")


if __name__ == "__main__":
    main()
