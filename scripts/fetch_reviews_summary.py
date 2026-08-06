"""
fetch_reviews_summary.py — agrega recenziile REALE (Supabase) per magazin, pt AggregateRating onest.

De ce exista: pagina de magazin (cod-reducere/[magazin]/page.tsx) emitea un AggregateRating
in JSON-LD calculat din procent_succes/folosit_de — campuri FABRICATE (random.Random(hash(...))
in fetch_2p_api.py), eliminate din UI pe 03.07.2026 dar niciodata din acest JSON-LD. Fix real
(06.08.2026): rating-ul afisat catre Google trebuie sa vina din recenzii REALE, moderate manual,
sau sa nu existe deloc.

Sursa: tabela `reviews` din Supabase (ktfoaqprezeqzoeuohnh), RLS: citire publica doar aprobat=true.
Acelasi URL/key ca frontend/lib/supabase.ts (cheia anon e publica prin design).

Output: frontend/public/reviews-summary.json — {updated, magazine: {slug: {count, medie}}}

Guard anti-regresie: daca requestul pica (proiect Supabase pauzat — recurent, vezi CLAUDE.md),
NU suprascrie fisierul existent cu date goale. Ruleaza in pipeline, continue-on-error: true.
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime, timezone

SUPABASE_URL = "https://ktfoaqprezeqzoeuohnh.supabase.co"
SUPABASE_KEY = ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
                "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Zm9hcXByZXplcXpvZXVvaG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MTA2MjgsImV4cCI6MjA5NTQ4NjYyOH0."
                "yLIxtP-1HPCYsQ1-RoLUpDhzkFqZDpu5CJywisjTh0c")

OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "reviews-summary.json")


def fetch_reviews():
    url = f"{SUPABASE_URL}/rest/v1/reviews?select=magazin,stele&aprobat=eq.true"
    req = urllib.request.Request(url, headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    try:
        rows = fetch_reviews()
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as e:
        print(f"[WARN] Supabase inaccesibil ({e}) — pastrez reviews-summary.json existent, nu suprascriu cu gol")
        return
    except Exception as e:
        print(f"[WARN] Eroare neasteptata ({e}) — pastrez fisierul existent")
        return

    by_magazin = {}
    for r in rows:
        slug = (r.get("magazin") or "").strip().lower()
        stele = r.get("stele")
        if not slug or not isinstance(stele, (int, float)):
            continue
        by_magazin.setdefault(slug, []).append(stele)

    summary = {
        slug: {"count": len(stele_list), "medie": round(sum(stele_list) / len(stele_list), 1)}
        for slug, stele_list in by_magazin.items()
    }

    out = {
        "updated": datetime.now(timezone.utc).isoformat(),
        "magazine": summary,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"reviews-summary.json: {len(summary)} magazine cu recenzii reale (din {len(rows)} recenzii aprobate)")


if __name__ == "__main__":
    main()
