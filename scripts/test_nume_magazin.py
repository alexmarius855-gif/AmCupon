"""
Test: numele magazinelor din Python (scripts/nume_magazin.py) == cele din TS (frontend/lib/numeMagazin.ts).

Ruleaza:  python scripts/test_nume_magazin.py      (iese cu 1 la prima diferenta)

Compara pe TOATE magazinele din frontend/public/output.json, plus cazurile care au stricat
titluri pe site (06.10.2026: „Cod Reducere Us Octombrie 2026" pentru us.lemorele.com).
Node ruleaza fisierul TS direct (Node 24 sterge tipurile).
"""
import json
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nume_magazin import nume_afisat  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONT = os.path.join(ROOT, "frontend")

esecuri = 0


def verifica(nume, primit, asteptat):
    global esecuri
    if primit == asteptat:
        print(f"  ok    {nume}")
    else:
        esecuri += 1
        print(f"  PICA  {nume}\n        primit:   {primit!r}\n        asteptat: {asteptat!r}")


cazuri = {
    "us.lemorele.com": "Lemorele US",
    "sg.descente.com": "Descente SG",
    "de.anthbot.com": "Anthbot DE",
    "ro.roborock.com": "Roborock",
    "store.hiby.com": "Hiby",
    "clickandgrow.com": "Click & Grow",
    "pi.inc": "Pi",
    "drmax.ro": "Dr. Max",          # din NUME_OVERRIDE (TS), citit de Python
    "lu.ro": "Lu",
    "nh-hotels.com": "Nh Hotels",
    "vevor.com.au": "Vevor AU",
}
for slug, asteptat in cazuri.items():
    verifica(f"nume_afisat({slug})", nume_afisat(slug), asteptat)

# Paritate cu TS pe toate magazinele reale.
sluguri = [m["magazin"] for m in json.load(open(os.path.join(FRONT, "public", "output.json"), encoding="utf-8"))]
sluguri += list(cazuri)
script = (
    "import { numeAfisat } from './lib/numeMagazin.ts';"
    "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{"
    "const s=JSON.parse(d);process.stdout.write(JSON.stringify(s.map(numeAfisat)));});"
)
r = subprocess.run(["node", "--input-type=module", "-e", script], input=json.dumps(sluguri),
                   capture_output=True, text=True, encoding="utf-8", cwd=FRONT)
if r.returncode != 0:
    esecuri += 1
    print(f"  PICA  node nu a rulat numeMagazin.ts:\n{r.stderr[-600:]}")
else:
    ts = json.loads(r.stdout)
    diferite = [(s, nume_afisat(s), t) for s, t in zip(sluguri, ts) if nume_afisat(s) != t]
    verifica(f"paritate Python == TS pe {len(sluguri)} de magazine", diferite[:5], [])

print("\nToate verificarile au trecut." if not esecuri else f"\n{esecuri} verificari picate.")
sys.exit(1 if esecuri else 0)
