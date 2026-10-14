"""
tokenizeaza_culori_2.py — a doua trecere (14.10.2026), dupa ce tema luminoasa s-a aplicat pe tot continutul:

1. Gradientele si fundalurile inchise ramase cu hex (from-[#14181c], to-[#06080b], bg-[#0b0e12]...) -> variabile.
   Pe tema inchisa valorile sunt aceleasi (sau foarte apropiate: #0b0e12/#0f1216 -> --background/--surface).
2. Insignele/butoanele COLORATE (bg-red-600, bg-[#1877F2] Facebook...) aveau text alb; prima trecere l-a facut
   text-[var(--foreground)], care pe tema luminoasa devine inchis. Pe fundal colorat textul ramane alb.

Rulare: python tokenizeaza_culori_2.py fisiere.tsx...
"""
import io
import re
import sys

GRAD = {
    "14181c": "surface", "06080b": "background", "1f2329": "surface-alt", "0f1317": "surface",
}
BG = {"0b0e12": "background", "0f1216": "surface", "070a0f": "background", "11100c": "surface",
      "19150e": "surface", "201c14": "surface-alt"}
RE_GRAD = re.compile(r"(?P<pre>(?:[a-z-]+:)*)(?P<u>from|via|to)-\[#(?P<h>[0-9a-fA-F]{6})\]")
RE_BG = re.compile(r"(?P<pre>(?:[a-z-]+:)*)bg-\[#(?P<h>[0-9a-fA-F]{6})\]")
COLORAT = re.compile(r"\bbg-(?:(?:red|rose|green|emerald|blue|sky|indigo|violet|purple|pink|teal|cyan|orange|amber)-[5-9]00"
                     r"|\[#(?:1877F2|166FE5|1565d8|229ED9|25D366|20BD5C)\])")


def unu(s: str) -> tuple[str, int]:
    n = 0

    def g(m):
        nonlocal n
        v = GRAD.get(m.group("h").lower())
        if not v:
            return m.group(0)
        n += 1
        return f"{m.group('pre')}{m.group('u')}-[var(--{v})]"

    def b(m):
        nonlocal n
        v = BG.get(m.group("h").lower())
        if not v:
            return m.group(0)
        n += 1
        return f"{m.group('pre')}bg-[var(--{v})]"

    s = RE_GRAD.sub(g, s)
    s = RE_BG.sub(b, s)

    # text alb pe fundal colorat: in acelasi sir de clase
    def clase(m):
        nonlocal n
        t = m.group(0)
        if COLORAT.search(t) and "text-[var(--foreground)]" in t:
            n += t.count("text-[var(--foreground)]")
            t = t.replace("hover:text-[var(--foreground)]", "hover:text-white").replace("text-[var(--foreground)]", "text-white")
        return t
    s = re.sub(r'className="[^"]*"|className=\{`[^`]*`\}', clase, s)
    return s, n


def main() -> int:
    tot = 0
    for f in sys.argv[1:]:
        s = io.open(f, encoding="utf-8", newline="").read()
        nou, n = unu(s)
        if n:
            io.open(f, "w", encoding="utf-8", newline="").write(nou)
            print(f"{f}: {n}")
            tot += n
    print(f"total: {tot}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
