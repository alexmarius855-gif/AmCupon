"""Flyerul AmCupon de tiparit: doua variante A6, cate 4 pe o foaie A4 (taiere in cruce).

  oferte  — pentru clienti si restaurante: ce e site-ul + ofertele saptamanii + QR amcupon.ro/oferte
  curieri — pentru colegii curieri pe scuter: 3 reguli din ghid + QR amcupon.ro/curieri

Ofertele se aleg din frontend/public/output.json la fiecare rulare (o data pe saptamana):
magazin .ro cu link platit, promotie care mai e valabila cel putin ZILE_MINIM zile, una pe
magazin. Codul NU se tipareste — il vede pe site, prin linkul platit (altfel n-avem comision).
Titlul trece prin promotii.titlu_in_text (fara cod), ca in articole si newsletter.

QR-urile sunt matricele de mai jos, generate o singura data in browser cu qrcode-generator 1.4.4
(cdnjs, corectie Q) si citite inapoi cu un decodor independent (jsQR 1.4.0): ambele URL-uri ies
identice. Adresele scurte sunt redirecturi 307 cu UTM in frontend/lib/redirecturi.ts.

    python genereaza_flyer.py            # docs/flyer/flyer.html + flyer.pdf (Edge, fara antet)
"""
from __future__ import annotations

import html
import io
import json
import os
import re
import subprocess
import sys
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))
from nume_magazin import nume_afisat  # noqa: E402
from promotii import titlu_in_text  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IESIRE = os.path.join(ROOT, "docs", "flyer")
ZILE_MINIM = 10
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

QR = {
    "curieri": (
        "amcupon.ro/curieri",
        "11111110001111100111001111111/10000010011100101101001000001/10111010011011011100001011101/"
        "10111010110101010111001011101/10111010011001110100001011101/10000010101100000000101000001/"
        "11111110101010101010101111111/00000000100011011010100000000/01100010001011010110101101000/"
        "00110100111100100010001101111/00100010010100111101010100001/00010001110100001010001000000/"
        "11000111000111101000111001010/10000000111011011111101001001/10001010011001011001010001101/"
        "00100100100110001100010001001/11000010100010110101101000011/01010100000000100001101101101/"
        "11110011010110110111100010001/00100000001100100001011101001/11011110000101011001111111010/"
        "00000000101111110000100011011/11111110011001111110101011101/10000010010110011011100011001/"
        "10111010010111101111111110000/10111010010101101111100110010/10111010100010001000010010011/"
        "10000010110111111011110001000/11111110010101101000101110001",
    ),
    "oferte": (
        "amcupon.ro/oferte",
        "11111110000001101000001111111/10000010100100001000001000001/10111010111001000011001011101/"
        "10111010001001110100001011101/10111010010000001011001011101/10000010011011100111101000001/"
        "11111110101010101010101111111/00000000000001111000000000000/01110110001111101010000000110/"
        "10000100010110011010101111101/01010010111111010111101001010/10111001010010001010100101001/"
        "01110110101100111101010100111/01001100111010011111001101101/10000110010000001001101111011/"
        "10001101011100001000011011011/11010011111101000100110111000/01101101010000100011010100100/"
        "10001011100101000010101001100/00101001010001111100011001110/01101010110111111111111111100/"
        "00000000100110000110100011001/11111110010001000011101010110/10000010101111010100100010000/"
        "10111010000100001000111111101/10111010110111100001000011010/10111010100001000110100100101/"
        "10000010111101110000100011010/11111110001000100011100100010",
    ),
}

# Titluri care nu se tiparesc: superlative fara sursa, emoji, titluri goale de sens.
RE_TITLU_SLAB = re.compile(r"cele mai mici|cel mai mic|[!]|[\U0001F300-\U0001FAFF\u2600-\u27BF]", re.I)


def qr_svg(randuri: str) -> str:
    rows = randuri.split("/")
    n = len(rows)
    assert all(len(r) == n for r in rows), "matrice QR nepatrata"
    # cele 3 modele de pozitionare (7x7) trebuie sa existe — o greseala de copiere le strica
    for r0, c0 in ((0, 0), (0, n - 7), (n - 7, 0)):
        assert rows[r0][c0:c0 + 7] == "1111111" and rows[r0 + 6][c0:c0 + 7] == "1111111"
    s = n + 8
    d = "".join(f"M{c + 4},{r + 4}h1v1h-1z" for r, row in enumerate(rows) for c, v in enumerate(row) if v == "1")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" shape-rendering="crispEdges">'
            f'<rect width="{s}" height="{s}" fill="#fff"/><path d="{d}" fill="#000"/></svg>')


def oferte_saptamana(azi: date, n: int = 4) -> list[dict]:
    magazine = json.load(io.open(os.path.join(ROOT, "frontend", "public", "output.json"), encoding="utf-8"))
    limita = (azi + timedelta(days=ZILE_MINIM)).isoformat()
    candidati = []
    for m in magazine:
        slug = m.get("magazin") or ""
        if not slug.endswith(".ro") or not m.get("url_afiliat") or m.get("url_afiliat") == m.get("url"):
            continue
        for p in m.get("promotii") or []:
            expira = p.get("expira") or ""
            if expira < limita:
                continue
            nume = nume_afisat(slug)
            titlu = titlu_in_text(p, nume)
            if len(titlu) < 18 or RE_TITLU_SLAB.search(titlu) or titlu.isupper():
                continue
            candidati.append({
                "magazin": nume, "titlu": titlu, "cod": bool((p.get("cod_cupon") or "").strip()),
                "scor": m.get("scor_final") or 0, "categorie": m.get("categorie_slug") or "",
                # peste un an e data de feed, nu o expirare reala — nu o tiparim
                "pana_la": expira if expira <= (azi + timedelta(days=365)).isoformat() else "",
            })
    # cod intai, apoi scorul, apoi oferta care tine cel mai mult (flyerul circula 1-2 saptamani);
    # un magazin si o categorie o singura data, ca foaia sa aiba de toate
    candidati.sort(key=lambda c: c["pana_la"] or "9999", reverse=True)
    candidati.sort(key=lambda c: (-c["cod"], -c["scor"]))
    ales, magazine_vazute, categorii = [], set(), set()
    for c in candidati:
        if c["magazin"] in magazine_vazute or c["categorie"] in categorii:
            continue
        ales.append(c)
        magazine_vazute.add(c["magazin"])
        categorii.add(c["categorie"])
        if len(ales) == n:
            break
    return ales


def data_ro(iso: str) -> str:
    a, l, z = iso.split("-")
    return f"{z}.{l}.{a}"


def card_oferte(oferte: list[dict], azi: date) -> str:
    rand = []
    for o in oferte:
        detaliu = "cod pe site" if o["cod"] else "fără cod"
        if o["pana_la"]:
            detaliu += f" · până pe {data_ro(o['pana_la'])[:5]}"
        rand.append(f'<li><b>{html.escape(o["magazin"])}</b> — {html.escape(o["titlu"])}'
                    f'<span class="d">{detaliu}</span></li>')
    url, randuri = QR["oferte"]
    return f"""<section class="card">
  <div class="logo"><span>Am</span>Cupon.ro</div>
  <p class="sub">Coduri de reducere și oferte de la magazine online din România, într-un singur loc.
  Actualizate de mai multe ori pe zi. Gratuit, fără cont.</p>
  <h2>Ofertele săptămânii</h2>
  <ul>{''.join(rand)}</ul>
  <div class="jos"><div class="qr">{qr_svg(randuri)}</div>
  <p>Scanează pentru toate ofertele de azi sau intră pe<br><b class="url">{url}</b></p></div>
  <p class="nota">Ofertele sunt ale magazinelor, la data tipăririi ({data_ro(azi.isoformat())}). Când cumperi prin
  AmCupon, magazinul ne poate plăti un comision; prețul pentru tine e același.</p>
</section>"""


def card_curieri() -> str:
    url, randuri = QR["curieri"]
    return f"""<section class="card">
  <div class="logo"><span>Am</span>Cupon.ro</div>
  <h2 class="mare">Livrezi cu scuterul?<br>Iarna vine.</h2>
  <ul class="reguli">
    <li><b>Casca</b> — trebuie să fie omologată moto. Caută eticheta <b>ECE 22.05</b> sau <b>22.06</b>
    pe curelușa de sub bărbie.</li>
    <li><b>Geaca și mănușile</b> de protecție au standard pe etichetă: <b>EN 17092</b> (geacă),
    <b>EN 13594</b> (mănuși). O geacă de schi ține cald, dar nu protejează la cădere.</li>
    <li><b>Telefonul</b> — în suport cu amortizare a vibrațiilor. La frig, bateria scade și telefonul se
    poate opri: bateria externă ține-o la cald, în buzunarul interior.</li>
  </ul>
  <div class="jos"><div class="qr">{qr_svg(randuri)}</div>
  <p>Ghidul complet, cu legea și echipamentul de iarnă de la magazinele partenere:<br><b class="url">{url}</b></p></div>
  <p class="nota">Ghid scris pe surse: Codul rutier (OUG 195/2002), regulamentul UE al echipamentelor de protecție,
  recomandările Apple.</p>
</section>"""


CSS = """
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Segoe UI", Arial, sans-serif; background: #fff; }
.foaie { width: 210mm; height: 297mm; display: grid; grid-template-columns: 105mm 105mm;
  grid-template-rows: 148.5mm 148.5mm; page-break-after: always; }
.card { background: #14181c; color: #e8ecef; padding: 7mm 7mm 5mm; display: flex; flex-direction: column;
  border: 0.2mm dashed #6b7280; overflow: hidden; }
.logo { font-weight: 800; font-size: 6.2mm; letter-spacing: -0.2mm; color: #fff; }
.logo span { color: #ddf93c; }
.sub { font-size: 2.9mm; line-height: 1.35; color: #c4cad0; margin-top: 1.5mm; }
h2 { font-size: 4.2mm; color: #ddf93c; margin: 3.5mm 0 1.8mm; }
h2.mare { font-size: 6mm; line-height: 1.15; color: #fff; margin-top: 4mm; }
ul { list-style: none; display: flex; flex-direction: column; gap: 1.8mm; }
li { font-size: 3mm; line-height: 1.3; padding-left: 3mm; border-left: 0.8mm solid #ddf93c; }
li b { color: #fff; }
li .d { display: block; color: #9aa3ab; font-size: 2.5mm; margin-top: 0.4mm; }
.reguli li { font-size: 3.15mm; }
.jos { margin-top: auto; display: flex; gap: 3.5mm; align-items: center; padding-top: 3mm; }
.qr { width: 27mm; height: 27mm; flex: none; background: #fff; border-radius: 1.5mm; }
.qr svg { width: 100%; height: 100%; display: block; }
.jos p { font-size: 2.9mm; line-height: 1.35; color: #c4cad0; }
.url { color: #ddf93c; font-size: 3.6mm; }
.nota { font-size: 2.1mm; line-height: 1.3; color: #7d868e; margin-top: 2.5mm; }
"""


def main() -> int:
    azi = date.today()
    oferte = oferte_saptamana(azi)
    if len(oferte) < 3:
        print(f"Doar {len(oferte)} oferte potrivite — flyerul cu oferte nu se genereaza saptamana asta.")
        return 1
    o, c = card_oferte(oferte, azi), card_curieri()
    pagina = (f'<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Flyer AmCupon</title>'
              f'<style>{CSS}</style></head><body>'
              f'<div class="foaie">{o * 4}</div><div class="foaie">{c * 4}</div></body></html>')
    os.makedirs(IESIRE, exist_ok=True)
    f_html = os.path.join(IESIRE, "flyer.html")
    io.open(f_html, "w", encoding="utf-8").write(pagina)
    print("Ofertele saptamanii:")
    for x in oferte:
        print(f"  {x['magazin']}: {x['titlu']}  ({'cod' if x['cod'] else 'fara cod'}, {x['pana_la'] or 'fara data'})")
    if os.path.exists(EDGE):
        f_pdf = os.path.join(IESIRE, "flyer.pdf")
        subprocess.run([EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={f_pdf}", "file:///" + f_html.replace(os.sep, "/")],
                       check=False, capture_output=True, timeout=120)
        print(("PDF: " + f_pdf) if os.path.exists(f_pdf) else "PDF-ul nu s-a generat (deschide flyer.html si printeaza)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
