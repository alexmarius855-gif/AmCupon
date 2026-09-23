# -*- coding: utf-8 -*-
"""Macheta AmCupon — un HTML static generat din datele REALE (output.json).

Nu e site-ul: e interfata propusa, ca Alex sa vada directia inainte sa rescriem
componentele. Trei pagini: acasa, magazin cu coduri, magazin fara oferta (86% din site).
"""
import collections, html, io, json, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
AICI = os.path.dirname(os.path.abspath(__file__))
RADACINA = os.path.abspath(os.path.join(AICI, "..", "..", ".."))
PUB = os.path.join(RADACINA, "frontend", "public")
OUT = os.path.join(AICI, "amcupon-macheta.html")
E = html.escape

mag = json.load(io.open(os.path.join(PUB, "output.json"), encoding="utf-8"))
try:
    desc = json.load(io.open(os.path.join(PUB, "store-descriptions.json"), encoding="utf-8"))
except Exception:
    desc = {}

PREF = {"store", "shop", "www", "m", "app", "go", "new", "my", "web", "online", "buy", "ai",
        "ro", "us", "uk", "de", "fr", "it", "es", "nl", "pl", "eu", "en", "hu", "bg", "cz", "sk"}


def nume(dom):
    p = [x for x in dom.lower().split(".") if x]
    i = 0
    while i < len(p) - 2 and p[i] in PREF:
        i += 1
    return (p[i] if i < len(p) else p[0]).replace("-", " ").title()


def logo(m):
    u = (m.get("logo_url") or "").strip()
    if "google.com/s2/favicons" in u:
        u = re.sub(r"([?&])sz=\d+", r"\g<1>sz=128", u)
        if "sz=" not in u:
            u += ("&" if "?" in u else "?") + "sz=128"
    return u


def eticheta(z):
    if z < 0:
        return None
    if z == 0:
        return ("Expiră azi", "urgent")
    if z == 1:
        return ("Expiră mâine", "urgent")
    if z <= 3:
        return ("Expiră în %d zile" % z, "urgent")
    if z < 99:
        return ("Mai sunt %d zile" % z, "normal")
    return ("Fără dată de expirare", "neutru")


def valoare(t):
    t = t.lower()
    m = re.search(r"(\d{1,2})\s*%", t)
    if m:
        return ("-%s%%" % m.group(1), "big")
    m = re.search(r"(\d{2,4})\s*(?:de\s*)?lei", t)
    if m:
        return ("-%s lei" % m.group(1), "mid")
    if re.search(r"transport gratuit|livrare gratuit", t):
        return ("Livrare gratuită", "small")
    return ("Ofertă", "small")


RO = re.compile(r"[ăâîșțşţ]|\b(reducere|livrare|transport|pentru|comenzi|produse|toate|la)\b", re.I)

pool = []
for m in mag:
    for p in (m.get("promotii") or []):
        z = p.get("zile_ramase") if isinstance(p.get("zile_ramase"), int) else 99
        et = eticheta(z)
        if et is None:
            continue
        cod = str(p.get("cod_cupon") or "").strip()
        if cod.lower() in ("true", "false"):
            cod = ""
        nm = nume(m["magazin"])
        t = str(p.get("nume") or "").strip()
        d = str(p.get("descriere") or "").strip()
        if not t or re.fullmatch(r"[A-Z0-9_\-]{4,}", t):
            t = d or ("Reducere la " + nm)
        # Titlul din retea contine uneori chiar codul („... – Cod LAMODA"), ceea ce
        # anuleaza butonul „Vezi codul". Il scoatem din titlu; codul ramane in buton.
        if cod:
            t = re.sub(r"\s*[–—-]?\s*(?:cu\s+)?(?:codul|cod)\s*:?\s*" + re.escape(cod) + r"", "", t, flags=re.I)
            t = re.sub(re.escape(cod), "", t, flags=re.I).strip(" –—-:")
        t = re.sub(r"\s+", " ", t)[:120]
        v, vs = valoare(t + " " + d)
        if cod and v == "Ofertă":
            v = "Reducere"
        pool.append(dict(m=m, cod=cod, nume=nm, titlu=t, val=v, vs=vs, et=et, z=z,
                         ro=bool(RO.search(t)), dro=m["magazin"].endswith(".ro")))

pool.sort(key=lambda o: (not o["ro"], not o["cod"], not o["dro"], o["z"]))
per, home = collections.Counter(), []
for o in pool:
    if per[o["m"]["magazin"]] >= 2:
        continue
    per[o["m"]["magazin"]] += 1
    home.append(o)
    if len(home) == 12:
        break

st = dict(magazine=len(mag), oferte=len(pool), coduri=sum(1 for o in pool if o["cod"]),
          cu_oferta=len({o["m"]["magazin"] for o in pool}))
data_date = collections.Counter(m.get("ultima_verificare") for m in mag).most_common(1)[0][0] or ""
data_ro = ".".join(reversed(data_date.split("-"))) if data_date else "azi"


def n_of(m):
    return sum(1 for o in pool if o["m"] is m)


def n_cod(m):
    return sum(1 for o in pool if o["m"] is m and o["cod"])


def logo_html(m, cls=""):
    lg, ini = logo(m), E(nume(m["magazin"])[:2].upper())
    if not lg:
        return '<span class="ini %s">%s</span>' % (cls, ini)
    return ('<img src="%s" alt="" loading="lazy" onerror="imgFail(this)">'
            '<span class="ini %s" style="display:none">%s</span>') % (E(lg), cls, ini)


def card(o):
    kind = "code" if o["cod"] else "deal"
    txt, ton = o["et"]
    if o["cod"]:
        chip = '<span class="chip chip-code">Cod</span>'
        cta = ('<button class="reveal" type="button" data-code="%s"><span class="rv-l">Vezi codul</span>'
               '<span class="rv-t">···%s</span></button>') % (E(o["cod"]), E(o["cod"][-2:]))
    else:
        chip = '<span class="chip chip-deal">Ofertă</span>'
        cta = '<button class="go" type="button">Vezi oferta <span aria-hidden="true">→</span></button>'
    return ('<article class="cup" data-kind="%s" data-soon="%d">'
            '<div class="cup-val"><div class="cup-logo">%s</div><div class="cup-num %s">%s</div></div>'
            '<div class="cup-body"><div class="cup-top">%s<span class="cup-store">%s</span></div>'
            '<h3 class="cup-title">%s</h3><div class="cup-meta"><span class="exp %s">%s</span></div></div>'
            '<div class="cup-cta">%s</div></article>') % (
        kind, 1 if o["z"] <= 3 else 0, logo_html(o["m"]), o["vs"], E(o["val"]),
        chip, E(o["nume"]), E(o["titlu"]), ton, E(txt), cta)


# Sursa unica a site-ului: frontend/lib/magazinePopulare.ts (branduri pe care omul le
# recunoaste). Se completeaza dupa vanzari. depox.ro e EXCLUS de pe homepage in proiect
# (vinde spray paralizant si electrosocuri — MERCHANT_GRID_BLOCKLIST).
_ts = io.open(os.path.join(RADACINA, "frontend", "lib", "magazinePopulare.ts"), encoding="utf-8").read()
_lista = re.findall(r'"([a-z0-9.-]+\.(?:ro|com))"', _ts)
_idx = {m["magazin"]: m for m in mag}
EXCLUSE = {"depox.ro"}
pop = [_idx[s_] for s_ in _lista if s_ in _idx and logo(_idx[s_]) and s_ not in EXCLUSE]
pop += sorted([m for m in mag if logo(m) and m["magazin"].endswith(".ro") and m not in pop and m["magazin"] not in EXCLUSE],
              key=lambda m: -(m.get("sales_number") or 0))
pop = pop[:12]


def tile(m):
    c, o = n_cod(m), n_of(m)
    if c:
        b = '<span class="badge">%d %s</span>' % (c, "cod" if c == 1 else "coduri")
    elif o:
        b = '<span class="badge soft">%d %s</span>' % (o, "ofertă" if o == 1 else "oferte")
    else:
        b = ""
    return '<a class="st" href="#" title="%s">%s%s</a>' % (E(nume(m["magazin"])), b, logo_html(m, "big"))


cats = collections.Counter(o["m"].get("categorie") for o in pool if o["m"].get("categorie"))


def similare(m, k=4):
    s = [x for x in mag if x is not m and x.get("categorie_slug") == m.get("categorie_slug") and n_cod(x)]
    s += [x for x in mag if x is not m and x not in s and n_cod(x) and x["magazin"].endswith(".ro")]
    s += [x for x in mag if x is not m and x not in s and n_cod(x)]
    return s[:k]


def despre(m):
    d = desc.get(m["magazin"]) or {}
    par = [p for p in (d.get("paragrafe") or []) if not re.search(r"\d+\s+(oferte|coduri)", p)][:2]
    if par:
        return "".join("<p>%s</p>" % E(p) for p in par)
    return "<p>%s e un magazin online din categoria %s.</p>" % (E(nume(m["magazin"])), E(m.get("categorie") or ""))


def sim_html(m):
    out = []
    for x in similare(m):
        c = n_cod(x)
        out.append('<a href="#"><span class="l">%s</span><span><b>%s</b><small>%d %s</small></span>'
                   '<span class="arr">→</span></a>' % (logo_html(x), E(nume(x["magazin"])), c,
                                                        "cod activ" if c == 1 else "coduri active"))
    return "".join(out)


cands = [m for m in mag if n_cod(m) >= 1 and logo(m)]
sm = max(cands, key=lambda m: (m["magazin"].endswith(".ro"), n_cod(m), n_of(m), m["magazin"] in desc))
s_of = sorted([o for o in pool if o["m"] is sm], key=lambda o: (not o["cod"], o["z"]))

goale = [m for m in mag if m["magazin"].endswith(".ro") and not n_of(m) and logo(m) and m["magazin"] in desc]
gm = max(goale, key=lambda m: (len(similare(m)) >= 3, m.get("sales_number") or 0)) if goale else mag[-1]

top = next((o for o in home if o["cod"]), home[0])
cnt = dict(all=len(home), code=sum(1 for o in home if o["cod"]),
           deal=sum(1 for o in home if not o["cod"]), soon=sum(1 for o in home if o["z"] <= 3))

# ── fragmente precalculate (fara f-string-uri imbricate) ──────────────────────
chips = "".join('<a href="#">%s</a>' % E(nume(m["magazin"])) for m in pop[:5])
cups_home = "".join(card(o) for o in home)
tiles = "".join(tile(m) for m in pop)
cats_html = "".join('<a class="cat" href="#">%s<i>%d</i></a>' % (E(c), n) for c, n in cats.most_common(10))
sn, gn = nume(sm["magazin"]), nume(gm["magazin"])
cups_store = "".join(card(o) for o in s_of)
cups_gol = "".join(card(next(o for o in pool if o["m"] is x and o["cod"])) for x in similare(gm, 3))
cod_sm = n_cod(sm)
of_sm = n_of(sm)

CSS = io.open(os.path.join(AICI, "macheta.css"), encoding="utf-8").read()
JS = io.open(os.path.join(AICI, "macheta.js"), encoding="utf-8").read()


def alerta(titlu, text):
    return ('<section class="sec"><div class="wrap"><div class="alert"><div><h3>%s</h3><p>%s</p></div>'
            '<form onsubmit="return false"><input type="email" placeholder="adresa@email.ro">'
            '<button class="btn-accent" type="button">Anunță-mă</button></form></div></div></section>') % (E(titlu), E(text))


header = ('<header class="hd"><div class="wrap"><a class="logo" href="#"><b>Am</b>Cupon.ro</a>'
          '<label class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
          'stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
          '<input placeholder="Caută un magazin"></label>'
          '<nav class="nav"><a href="#">Coduri azi</a><a href="#">Magazine</a><a href="#">Categorii</a><a href="#">Blog</a></nav>'
          '<a class="alert-btn" href="#">🔔 Alerte</a></div></header>')

ann = '<div class="ann"><div class="wrap"><span>🔥 %s: %s</span>%s<a href="#">Vezi oferta →</a></div></div>' % (
    E(top["nume"]), E(top["val"]), ('<code>%s</code>' % E(top["cod"])) if top["cod"] else "")

home_html = """
<section class="hero"><div class="wrap">
  <div>
    <span class="eyebrow"><span class="dot"></span>{oferte} de oferte active acum</span>
    <h1>Plătești mai puțin la <em>magazinele pe care le știi</em>.</h1>
    <p class="lead">Coduri de reducere și oferte de la {magazine} de magazine, strânse automat din rețelele de afiliere și actualizate de trei ori pe zi. Fără cont, fără extensie.</p>
    <label class="bigsearch"><input placeholder="Caută: Answear, Notino, Dr.Max…"><button class="btn-accent" type="button">Caută</button></label>
    <div class="chips">{chips}</div>
  </div>
  <aside class="live">
    <h4>Acum, pe AmCupon</h4>
    <div class="stats"><div class="stat"><b>{coduri}</b><span>coduri</span></div>
      <div class="stat"><b>{oferte}</b><span>oferte</span></div>
      <div class="stat"><b>{cu_oferta}</b><span>magazine</span></div></div>
    <p class="live-l">Codul zilei</p>
    {top_card}
  </aside>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-h"><div><h2>Codurile zilei</h2><p>Codurile întâi, apoi ofertele. Cele care expiră curând, sus.</p></div><a class="link" href="#">Toate ofertele →</a></div>
  <div class="filters">
    <button class="f on" data-f="all">Toate<i>{c_all}</i></button>
    <button class="f" data-f="code">Doar coduri<i>{c_code}</i></button>
    <button class="f" data-f="deal">Oferte<i>{c_deal}</i></button>
    {soon_btn}
  </div>
  <div class="cups" id="home-cups">{cups_home}</div>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-h"><div><h2>Magazine populare</h2><p>Branduri pe care le știi. Badge-ul arată unde e cod azi.</p></div><a class="link" href="#">Toate cele {magazine} →</a></div>
  <div class="stores">{tiles}</div>
</div></section>
<section class="sec"><div class="wrap">
  <div class="sec-h"><div><h2>Pe categorii</h2><p>Unde sunt ofertele acum.</p></div></div>
  <div class="cats">{cats_html}</div>
</div></section>""".format(
    oferte=st["oferte"], magazine=st["magazine"], coduri=st["coduri"], cu_oferta=st["cu_oferta"],
    chips=chips, top_card=card(top), c_all=cnt["all"], c_code=cnt["code"], c_deal=cnt["deal"],
    soon_btn=('<button class="f" data-f="soon">Expiră curând<i>%d</i></button>' % cnt["soon"]) if cnt["soon"] else "", cups_home=cups_home, tiles=tiles, cats_html=cats_html)

store_html = """
<div class="wrap"><div class="crumbs">Acasă / Magazine / {sn}</div>
<div class="shead"><div class="slogo">{slogo}</div>
  <div><h1>Cod reducere {sn}</h1><div class="facts"><span class="fact hot">{cod_txt}</span><span class="fact">{of_txt}</span><span class="fact">Actualizat {data}</span><span class="fact">{categ}</span></div></div>
  <div class="sactions"><a class="btn-accent big" href="#">Mergi la {sn} →</a><a class="btn-ghost" href="#">🔔 Alertă cod nou</a></div></div>
<div class="slayout"><main>
  <div class="list">{cups}</div>
  <div class="panel about"><h3>Despre {sn}</h3>{despre}</div>
  <div class="panel"><h3>Cum folosești un cod {sn}</h3><div class="steps">
    <div class="step"><span>Apasă <b>Vezi codul</b>. Se deschide {sn} într-un tab nou, iar codul rămâne aici.</span></div>
    <div class="step"><span>Copiază codul și pune produsele în coș.</span></div>
    <div class="step"><span>La finalizarea comenzii, lipește codul în câmpul pentru voucher.</span></div></div></div>
  <div class="panel faq"><h3>Întrebări</h3>
    <details open><summary>De unde sunt codurile?</summary><p>Din rețeaua de afiliere prin care colaborăm cu {sn}. Nu le testăm în coș — dacă unul nu merge, spune-ne și îl scoatem.</p></details>
    <details><summary>Cât timp e valabil un cod?</summary><p>Până la data scrisă în dreptul lui. Ofertele expirate dispar singure de pe pagină.</p></details>
    <details><summary>Se aplică la orice produs?</summary><p>Depinde de ofertă: unele merg doar la produse nereduse sau peste o anumită valoare a coșului.</p></details></div>
</main><aside>
  <div class="panel sim"><h3>Magazine similare</h3>{sim}</div>
</aside></div></div>""".format(
    sn=E(sn), slogo=logo_html(sm, "big"), cod_txt="%d %s" % (cod_sm, "cod activ" if cod_sm == 1 else "coduri active"),
    of_txt="%d %s" % (of_sm, "ofertă" if of_sm == 1 else "oferte"), data=data_ro, categ=E(sm.get("categorie") or ""),
    cups=cups_store, despre=despre(sm), sim=sim_html(sm)) + alerta(
    "Cod nou la %s? Îți scriem noi." % sn, "Un email când apare un cod nou la magazinele pe care le urmărești. Nimic altceva.")

gol_html = """
<div class="wrap"><div class="crumbs">Acasă / Magazine / {gn}</div>
<div class="shead"><div class="slogo">{glogo}</div>
  <div><h1>Cod reducere {gn}</h1><div class="facts"><span class="fact">{categ}</span><span class="fact">Căutăm coduri noi de 3 ori pe zi</span></div></div>
  <div class="sactions"><a class="btn-accent big" href="#">Mergi la {gn} →</a></div></div>
<div class="slayout"><main>
  <div class="empty"><div class="empty-i">🔔</div><div><h3>Acum nu e niciun cod activ la {gn}.</h3>
    <p>Îți scriem pe email în ziua în care apare unul — sau vezi mai jos magazinele din aceeași categorie care au cod chiar acum.</p>
    <form onsubmit="return false"><input type="email" placeholder="adresa@email.ro"><button class="btn-accent" type="button">Anunță-mă</button></form></div></div>
  <div class="sec-h" style="margin-top:22px"><div><h2 style="font-size:19px">Au cod chiar acum</h2><p>Magazine din aceeași categorie cu {gn}.</p></div></div>
  <div class="list">{cups}</div>
  <div class="panel about"><h3>Despre {gn}</h3>{despre}</div>
</main><aside>
  <div class="panel sim"><h3>Alte magazine cu cod</h3>{sim}</div>
</aside></div></div>""".format(
    gn=E(gn), glogo=logo_html(gm, "big"), categ=E(gm.get("categorie") or ""),
    cups=cups_gol, despre=despre(gm), sim=sim_html(gm))

doc = """<!doctype html><html lang="ro" data-theme="light"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>AmCupon — machetă</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700;800&display=swap" rel="stylesheet">
<style>""" + CSS + """</style></head><body>
<div class="mk"><div class="wrap"><span><b>MACHETĂ</b> · date reale din """ + data_ro + """ · nu e site-ul live</span>
<div class="mk-tabs"><button class="on" data-pg="pg-home">Acasă</button><button data-pg="pg-store">Magazin cu coduri</button><button data-pg="pg-gol">Magazin fără ofertă</button></div>
<button id="theme" class="mk-theme" type="button">◐ Temă deschisă / închisă</button></div></div>
""" + ann + header + """
<div class="pg" id="pg-home">""" + home_html + alerta("Codurile noi, direct pe email.", "Fără spam. Te dezabonezi dintr-un click.") + """</div>
<div class="pg" id="pg-store" hidden>""" + store_html + """</div>
<div class="pg" id="pg-gol" hidden>""" + gol_html + """</div>
<footer class="ft"><div class="wrap"><a class="logo" href="#"><b>Am</b>Cupon.ro</a><p>Câștigăm un comision când cumperi printr-un link de pe site. Pe tine nu te costă nimic în plus.</p></div></footer>
<script>""" + JS + """</script></body></html>"""

io.open(OUT, "w", encoding="utf-8").write(doc)
print("oferte valide: %d | cu cod: %d | magazine cu oferta: %d / %d" % (st["oferte"], st["coduri"], st["cu_oferta"], st["magazine"]))
print("acasa: %d oferte (%d cu cod, %d in romana)" % (len(home), cnt["code"], sum(1 for o in home if o["ro"])))
print("magazin cu coduri: %s (%d coduri, %d oferte)" % (sm["magazin"], cod_sm, of_sm))
print("magazin fara oferta: %s | similare: %s" % (gm["magazin"], [x["magazin"] for x in similare(gm)]))
print("date din: %s | scris: %s (%d KB)" % (data_ro, OUT, len(doc) // 1024))
