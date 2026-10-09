"""
tokenizeaza_culori.py — inlocuieste culorile scrise de mana (bg-[#14181c], text-[#ffffff]...) cu variabilele de tema
din app/globals.css (bg-[var(--surface)], text-[var(--foreground)]...). Pe tema inchisa aspectul ramane IDENTIC
(variabilele au aceleasi valori); o zona cu clasa `tema-luminoasa` redefineste variabilele si devine luminoasa.

De ce (09.10.2026): Alex a cerut aspect „clasic, simplu, colorat" (macheta docs/design/macheta/amcupon-clasic.html).
Retemele din trecut au rescris culori cu regex, pe tot site-ul, si au lasat bug-uri de contrast saptamani intregi;
aici schimbarea de tema devine o schimbare de VALORI intr-un singur loc, pagina cu pagina.

Nu se ating: bg-[#ffffff] (cutiile de logo raman albe — regula), butoanele lime (bg-[#ddf93c] cu text inchis
merge pe ambele teme), textul de pe lime (#0c1000), gradientele (from-/to-/via-).

Rulare:  python tokenizeaza_culori.py fisier1.tsx fisier2.tsx ...   (scrie pe loc, tipareste ce a schimbat)
"""
import io
import re
import sys

# (utilitar, culoare) -> variabila. Ce nu e aici ramane neschimbat.
HARTA = {
    "bg": {"06080b": "background", "14181c": "surface", "1f2329": "surface-alt", "2a2f36": "surface-high",
           "3a4048": "border-strong", "9399a0": "text-muted", "c9ced5": "text-soft"},
    "text": {"ffffff": "foreground", "c9ced5": "text-soft", "9399a0": "text-muted", "6b7178": "text-muted",
             "3a4048": "border-strong", "ddf93c": "accent-text", "c3dd2c": "accent-text", "ecff7a": "accent-text"},
    "border": {"1f2329": "border", "2a2f36": "border-strong", "3a4048": "border-strong", "14181c": "border",
               "ddf93c": "accent-text"},
    "divide": {"1f2329": "border", "2a2f36": "border-strong"},
    "placeholder": {"9399a0": "text-muted", "6b7178": "text-muted"},
}
RE = re.compile(r"(?P<pre>(?:[a-z-]+:)*)(?P<util>bg|text|border(?:-[trblxy])?|divide|placeholder)-\[#(?P<hex>[0-9a-fA-F]{6})\]")


def inlocuieste(m: re.Match) -> str:
    util = m.group("util")
    baza = "border" if util.startswith("border") else util
    var = HARTA.get(baza, {}).get(m.group("hex").lower())
    if not var:
        return m.group(0)
    return f"{m.group('pre')}{util}-[var(--{var})]"


def main() -> int:
    total = 0
    for f in sys.argv[1:]:
        s = io.open(f, encoding="utf-8", newline="").read()
        nou = RE.sub(inlocuieste, s)
        schimbate = sum(1 for m in RE.finditer(s) if inlocuieste(m) != m.group(0))
        if nou != s:
            io.open(f, "w", encoding="utf-8", newline="").write(nou)
        ramase = len(re.findall(r"\[#[0-9a-fA-F]{6}\]", nou))
        print(f"{f}: {schimbate} inlocuiri, {ramase} culori fixe ramase (logo alb, lime, gradiente)")
        total += schimbate
    print(f"total: {total}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
