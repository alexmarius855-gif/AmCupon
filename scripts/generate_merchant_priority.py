"""
generate_merchant_priority.py
─────────────────────────────────────────────────────────────────────────────
Prioritizeaza magazinele dupa POTENTIAL DE CASTIG real (nu doar comision).

Scor = comision% (plafonat) × popularitate (log vanzari) × multiplicator oferta.
- Comisionul mare singur INSEALA (ex: facturis 35% dar 0 vanzari = inutil).
- Banii reali = comision × cerere reala × ceva de impins (cod/oferta).

OUTPUT:
- frontend/public/recomandate.json   → top magazine cu oferta (pt sectiunea de pe site)
- data/RAPORT-TOP-CASTIG.md          → raport citibil (pt strategia ta: ce impingi)

Ruleaza in cron dupa merge_platforms.py (are nevoie de output.json final).
"""

import json, os, re, math, sys
from datetime import datetime, timezone, timedelta

if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try: sys.stdout.reconfigure(encoding="utf-8")
    except Exception: pass

HERE = os.path.dirname(os.path.abspath(__file__))
OUTPUT_JSON = os.path.join(HERE, "..", "frontend", "public", "output.json")
RECOM_JSON  = os.path.join(HERE, "..", "frontend", "public", "recomandate.json")
RAPORT_MD   = os.path.join(HERE, "..", "data", "RAPORT-TOP-CASTIG.md")

RETELE = {"profitshare.ro", "2performant.com"}


def comision_pct(c: str) -> float:
    nums = [float(x) for x in re.findall(r"[\d.]+", c or "")]
    return max(nums) if nums else 0.0


def nume_afisat(slug: str) -> str:
    return " ".join(w.capitalize() for w in slug.split(".")[0].replace("-", " ").split())


def scor_castig(m: dict) -> float:
    """Potential de castig: comision × cerere × ofertă. Plafonat ca sa evite capcanele."""
    com = min(comision_pct(m.get("comision", "")), 25.0)   # plafon 25% (evita nise 30-35% fara cerere)
    pop = math.log1p(m.get("sales_number", 0) or 0)         # popularitate log (0..~7)
    if m.get("cod_cupon"):       oferta = 2.0               # are COD = cel mai usor de impins
    elif m.get("are_promotie"):  oferta = 1.4               # are oferta
    else:                        oferta = 0.5               # nimic de impins = penalizat
    return round(com * (1 + pop) * oferta, 1)


def main():
    with open(OUTPUT_JSON, encoding="utf-8") as f:
        magazine = json.load(f)

    valide = [m for m in magazine if m.get("magazin") and m["magazin"] not in RETELE]
    for m in valide:
        m["_scor"] = scor_castig(m)
        m["_com"]  = comision_pct(m.get("comision", ""))

    # ── Sectiune site: DOAR magazine cu oferta activa (au ce impinge), top dupa scor ──
    cu_oferta = [m for m in valide if m.get("are_promotie")]
    cu_oferta.sort(key=lambda m: m["_scor"], reverse=True)
    top_site = cu_oferta[:12]

    recomandate = [{
        "magazin":   m["magazin"],
        "nume":      nume_afisat(m["magazin"]),
        "logo_url":  m.get("logo_url", ""),
        "categorie": m.get("categorie", ""),
        "comision":  round(m["_com"], 1),
        "are_cod":   bool(m.get("cod_cupon")),
        "oferta":    (m.get("promotii", [{}])[0].get("nume", "") if m.get("promotii") else "")[:70],
    } for m in top_site]

    with open(RECOM_JSON, "w", encoding="utf-8") as f:
        json.dump(recomandate, f, ensure_ascii=False, indent=1)

    # ── Raport strategic (pt Alex): top 30 dupa scor, indiferent de oferta ──
    top_all = sorted(valide, key=lambda m: m["_scor"], reverse=True)[:30]
    now = datetime.now(timezone.utc) + timedelta(hours=3)
    lines = [
        "# 💰 TOP MAGAZINE după POTENȚIAL DE CÂȘTIG",
        f"> Generat automat {now.strftime('%d.%m.%Y %H:%M')}. Pe astea să le împingi (articole, pin-uri, postări).",
        "",
        "**Scor = comision × popularitate × ofertă.** Comisionul mare singur înșală — astea-s banii REALI.",
        "",
        "| # | Magazin | Comision | Vânzări | Are ofertă? | Scor |",
        "|---|---------|----------|---------|-------------|------|",
    ]
    for i, m in enumerate(top_all, 1):
        oferta = "✅ COD" if m.get("cod_cupon") else ("🏷️ ofertă" if m.get("are_promotie") else "—")
        lines.append(f"| {i} | {nume_afisat(m['magazin'])} ({m['magazin']}) | {m['_com']:.0f}% | {m.get('sales_number',0)} | {oferta} | {m['_scor']} |")
    lines += [
        "",
        "## 🎯 Cum folosești raportul",
        "- **Top 10** = prioritate maximă pentru articole „cel mai bun X\" + pin-uri Pinterest",
        "- Magazinele **cu COD** convertesc cel mai ușor (ai ce oferi userului)",
        "- Comision mare + 0 vânzări = nișă moartă, NU pierde timp pe ele",
        "- Se actualizează automat la fiecare rulare cron (4h)",
    ]
    os.makedirs(os.path.dirname(RAPORT_MD), exist_ok=True)
    with open(RAPORT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"✅ {len(recomandate)} magazine în recomandate.json (sectiune site)")
    print(f"✅ Top 30 în RAPORT-TOP-CASTIG.md (strategie)")
    top5 = ", ".join(f"{nume_afisat(m['magazin'])}({m['_scor']})" for m in top_all[:5])
    print(f"   Top 5: {top5}")


if __name__ == "__main__":
    main()
