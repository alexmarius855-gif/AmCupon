# -*- coding: utf-8 -*-
"""Macheta „clasic luminos" (09.10.2026) — directia ceruta de Alex: „mai clasic, mai simplu, mai colorat",
cu structura site-ului de cupoane care a adus cele mai mari venituri (RetailMeNot), fara textele lui.

Preluat ca STRUCTURA (tipare comune site-urilor de cupoane): fundal alb, antet colorat, cautare mare;
pe pagina de magazin coloana din stanga (logo, rezumat: oferte / coduri) si lista de oferte cu valoarea
mare in stanga, titlul la mijloc, butonul in dreapta. Textele, culorile si logo-ul sunt ale AmCupon.

Date REALE din frontend/public/output.json. Regulile site-ului raman: codul mascat pana la clic, fara
„verificat", fara comision afisat. Iesire: amcupon-clasic.html (deschis local in browser).
"""
import html, io, json, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
AICI = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.abspath(os.path.join(AICI, "..", "..", "..", "frontend", "public"))
OUT = os.path.join(AICI, "amcupon-clasic.html")
E = html.escape

mag = json.load(io.open(os.path.join(PUB, "output.json"), encoding="utf-8"))
CATEG = {  # culoare pe categorie: fundal pal + text inchis (contrast AA pe alb)
    "fashion": ("Modă", "#fde7f3", "#9d174d"), "beauty": ("Frumusețe", "#f3e8ff", "#6b21a8"),
    "sanatate": ("Sănătate", "#dcfce7", "#166534"), "electronice": ("Electronice", "#dbeafe", "#1e40af"),
    "casa-gradina": ("Casă & grădină", "#e0f2fe", "#075985"), "copii": ("Copii", "#fce7f3", "#9f1239"),
    "sport": ("Sport", "#d1fae5", "#065f46"), "animale": ("Animale", "#ecfccb", "#3f6212"),
    "calatorii": ("Călătorii", "#cffafe", "#155e75"), "software": ("Software", "#e0e7ff", "#3730a3"),
    "carti-educatie": ("Cărți", "#ede9fe", "#5b21b6"), "auto-moto": ("Auto-moto", "#e2e8f0", "#1e293b"),
    "bijuterii": ("Bijuterii", "#fae8ff", "#86198f"), "marketplace": ("Marketplace", "#f1f5f9", "#334155"),
}


def nume(m):
    n = (m.get("nume") or "").strip()
    if n:
        return n
    d = m["magazin"].split(".")
    return d[0].replace("-", " ").title()


def logo(m):
    return (m.get("logo_url") or "").strip()


def promotii(m):
    return [p for p in (m.get("promotii") or []) if (p.get("nume") or p.get("titlu"))]


def valoare(p):
    t = f"{p.get('nume') or ''} {p.get('descriere') or ''}".lower()
    x = re.search(r"(\d{1,2})\s*%", t)
    if x:
        return ("până la" if re.search(r"p[aâ]n[aă] la|up to|pana la", t) else "", f"-{x.group(1)}%")
    x = re.search(r"(\d{2,4})\s*(lei|ron)", t)
    if x:
        return ("", f"-{x.group(1)} lei")
    if re.search(r"transport gratuit|livrare gratuit|free shipping", t):
        return ("", "Livrare gratuită")
    return ("", "Ofertă")


def cod(p):
    c = (p.get("cod_cupon") or "").strip()
    return c if c and c.lower() not in ("true", "false") else ""


def masca(c):
    return "•" * max(len(c) - 2, 2) + c[-2:]


def ro(m):
    return m["magazin"].endswith(".ro")


cu_oferta = [m for m in mag if promotii(m) and (m.get("url_afiliat") or "") != (m.get("url") or "")]
cu_oferta.sort(key=lambda m: (not ro(m), -sum(1 for p in promotii(m) if cod(p)), -(m.get("scor_final") or 0)))
populare = cu_oferta[:12]
oferte_zi = [(m, p) for m in cu_oferta[:40] for p in promotii(m)[:1]][:9]
model = next((m for m in cu_oferta if ro(m) and sum(1 for p in promotii(m) if cod(p)) >= 1 and len(promotii(m)) >= 2),
             cu_oferta[0])
categorii = sorted({m.get("categorie_slug") for m in cu_oferta if m.get("categorie_slug") in CATEG},
                   key=lambda c: -sum(1 for m in cu_oferta if m.get("categorie_slug") == c))
nr_coduri = sum(1 for m in cu_oferta for p in promotii(m) if cod(p))
nr_oferte = sum(len(promotii(m)) for m in cu_oferta)


def card_magazin(m):
    n = nume(m)
    c = CATEG.get(m.get("categorie_slug"), ("", "#f1f5f9", "#334155"))
    k = sum(1 for p in promotii(m) if cod(p))
    eticheta = f"{k} {'cod' if k == 1 else 'coduri'}" if k else f"{len(promotii(m))} {'ofertă' if len(promotii(m)) == 1 else 'oferte'}"
    return f'''<a class="mag" href="#magazin"><span class="logo"><img src="{E(logo(m))}" alt="" loading="lazy"
      onerror="this.replaceWith(Object.assign(document.createElement('b'),{{textContent:'{E(n[:1])}'}}))"></span>
      <span class="mag-n">{E(n)}</span><span class="pill" style="background:{c[1]};color:{c[2]}">{E(eticheta)}</span></a>'''


def rand_oferta(m, p, mare=False):
    pre, val = valoare(p)
    c = cod(p)
    t = p.get("nume") or p.get("titlu") or ""
    if c:  # aceeasi regula ca pe site (fara_coduri): codul nu apare in clar in titlu
        t = re.sub(r"\s*(?:[-–—,:]\s*)?(?:cu\s+)?(?:cod(?:ul)?|code)\s*:?\s*" + re.escape(c), "", t, flags=re.I)
        t = re.sub(re.escape(c), "", t, flags=re.I).strip(" -–—,:")
    titlu = E(t[:110])
    buton = (f'<button class="btn btn-cod" title="Se deschide magazinul și vezi codul">'
             f'<span>Vezi codul</span><em>{E(masca(c))}</em></button>') if c else '<button class="btn">Vezi oferta</button>'
    tip = '<span class="tag tag-cod">Cod</span>' if c else '<span class="tag">Ofertă</span>'
    z = p.get("zile_ramase")
    exp = ""
    if isinstance(z, int) and 0 <= z < 99:
        exp = f'<span class="exp{" urg" if z <= 3 else ""}">{"Expiră azi" if z == 0 else f"Mai sunt {z} zile"}</span>'
    dupa = f'<span class="mag-mic">{E(nume(m))}</span>' if not mare else ""
    return f'''<article class="of">
      <div class="val"><small>{E(pre)}</small><strong>{E(val)}</strong></div>
      <div class="of-txt">{tip}{dupa}<h3>{titlu}</h3>{exp}</div>
      <div class="of-act">{buton}</div></article>'''


chips = "".join(f'<a class="chip" style="background:{CATEG[c][1]};color:{CATEG[c][2]}" href="#">{E(CATEG[c][0])}</a>' for c in categorii[:10])

ACASA = f'''
<section class="hero"><div class="wrap">
  <h1>Coduri de reducere și oferte de la magazinele din România</h1>
  <p>{len(cu_oferta)} de magazine au acum oferte active, {nr_coduri} cu cod. Lista se actualizează automat de trei ori pe zi.</p>
  <div class="cauta"><input placeholder="Caută un magazin: Dr. Max, Noriel, Answear…"><button>Caută</button></div>
  <div class="chips">{chips}</div>
</div></section>
<section class="wrap"><div class="titlu"><h2>Magazine populare</h2><a href="#">Toate magazinele →</a></div>
  <div class="grila-mag">{"".join(card_magazin(m) for m in populare)}</div></section>
<section class="wrap"><div class="titlu"><h2>Ofertele zilei</h2><a href="#">Toate ofertele →</a></div>
  <div class="lista">{"".join(rand_oferta(m, p) for m, p in oferte_zi)}</div></section>
<section class="wrap banda"><div><h2>Black Friday 2026</h2><p>eMAG pe 6 noiembrie, valul internațional pe 27–30 noiembrie.
  Strângem aici ofertele magazinelor partenere.</p></div><a class="btn btn-alb" href="#">Vezi ofertele →</a></section>
'''

pm = promotii(model)
k = sum(1 for p in pm if cod(p))
MAGAZIN = f'''
<section class="wrap magazin" id="magazin">
  <aside class="lat">
    <div class="logo-mare"><img src="{E(logo(model))}" alt=""></div>
    <h3>{E(nume(model))}</h3>
    <a class="btn btn-plin" href="#">Mergi la {E(nume(model))} →</a>
    <dl><dt>Oferte active</dt><dd>{len(pm)}</dd><dt>Coduri</dt><dd>{k}</dd>
        <dt>Actualizat</dt><dd>azi</dd></dl>
    <p class="nota">Ofertele vin de la rețelele de afiliere. Dacă cumperi prin linkurile noastre, primim un comision;
       prețul pentru tine rămâne același.</p>
  </aside>
  <div class="princ">
    <h1>Cod de reducere {E(nume(model))} — octombrie 2026</h1>
    <p class="sub">{len(pm)} {'ofertă activă' if len(pm) == 1 else 'oferte active'} azi, {k} cu cod</p>
    <div class="lista">{"".join(rand_oferta(model, p, mare=True) for p in pm[:8])}</div>
    <h2 class="h2">Cum folosești un cod {E(nume(model))}</h2>
    <ol class="pasi"><li>Apasă „Vezi codul”: se deschide magazinul, iar codul apare aici.</li>
      <li>Adaugă produsele în coș.</li><li>Lipește codul la „Cod promoțional”, înainte de plată.</li></ol>
  </div>
</section>'''

CSS = """
:root{--ink:#14181c;--ink2:#475569;--lin:#e5e7eb;--bg:#f6f7fb;--brand:#ddf93c;--brand-ink:#0c1000;--verde:#3f6212;--violet:#5b21b6}
*{box-sizing:border-box}body{margin:0;font-family:Inter,"Segoe UI",system-ui,sans-serif;color:var(--ink);background:var(--bg)}
a{color:inherit;text-decoration:none}.wrap{max-width:1180px;margin:0 auto;padding:0 16px}
.top{background:var(--ink);color:#fff}.top .wrap{display:flex;align-items:center;gap:24px;height:64px}
.brand{font-weight:900;font-size:20px}.brand b{background:var(--brand);color:var(--brand-ink);border-radius:8px;padding:2px 7px;margin-right:2px}
.top nav{display:flex;gap:20px;font-size:14px;font-weight:600;opacity:.92}.top nav a:hover{color:var(--brand)}
.comuta{margin-left:auto;display:flex;gap:6px}.comuta button{border:1px solid #334155;background:transparent;color:#fff;border-radius:8px;padding:6px 10px;cursor:pointer}
.comuta button.on{background:var(--brand);color:var(--brand-ink);border-color:var(--brand)}
.hero{background:linear-gradient(135deg,#1e1b4b 0%,#14181c 60%);color:#fff;padding:48px 0 40px;margin-bottom:28px}
.hero h1{font-size:34px;line-height:1.15;margin:0 0 10px;max-width:760px}.hero p{color:#cbd5e1;margin:0 0 22px}
.cauta{display:flex;max-width:640px;background:#fff;border-radius:12px;padding:6px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
.cauta input{flex:1;border:0;font-size:16px;padding:10px 12px;outline:0}.cauta button{border:0;background:var(--brand);color:var(--brand-ink);font-weight:800;border-radius:9px;padding:0 22px;cursor:pointer}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.chip{border-radius:999px;padding:6px 12px;font-size:13px;font-weight:700}
.titlu{display:flex;justify-content:space-between;align-items:baseline;margin:8px 0 14px}.titlu h2{margin:0;font-size:22px}.titlu a{font-size:14px;font-weight:700;color:var(--violet)}
section{margin-bottom:34px}
.grila-mag{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.mag{background:#fff;border:1px solid var(--lin);border-radius:12px;padding:14px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;transition:.15s}
.mag:hover{border-color:#a5b4fc;box-shadow:0 6px 18px rgba(30,27,75,.08);transform:translateY(-2px)}
.logo{width:64px;height:64px;border-radius:12px;background:#fff;border:1px solid var(--lin);display:flex;align-items:center;justify-content:center;overflow:hidden}
.logo img{max-width:52px;max-height:52px}.logo b{font-size:24px;color:var(--violet)}
.mag-n{font-weight:700;font-size:14px}.pill{font-size:12px;font-weight:700;border-radius:999px;padding:3px 9px}
.lista{display:flex;flex-direction:column;gap:10px}
.of{display:grid;grid-template-columns:120px 1fr auto;gap:16px;align-items:center;background:#fff;border:1px solid var(--lin);border-radius:12px;padding:14px 16px}
.of:hover{border-color:#a5b4fc}
.val{text-align:center;border-right:1px dashed var(--lin);padding-right:12px}.val small{display:block;font-size:11px;color:var(--ink2);text-transform:uppercase;font-weight:700}
.val strong{font-size:24px;font-weight:900;color:var(--verde);line-height:1.1}
.of-txt h3{margin:4px 0;font-size:16px;line-height:1.35}.tag{display:inline-block;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;background:#f1f5f9;color:#334155;border-radius:6px;padding:2px 7px;margin-right:8px}
.tag-cod{background:#ede9fe;color:var(--violet)}.mag-mic{font-size:13px;color:var(--ink2);font-weight:600}
.exp{font-size:12px;color:var(--ink2)}.exp.urg{color:#b91c1c;font-weight:700}
.btn{border:0;cursor:pointer;font-weight:800;font-size:14px;border-radius:999px;padding:11px 18px;background:var(--ink);color:#fff;white-space:nowrap}
.btn-cod{display:flex;align-items:center;gap:0;padding:0;overflow:hidden;background:var(--violet)}
.btn-cod span{padding:11px 16px}.btn-cod em{font-style:normal;background:#ede9fe;color:var(--violet);padding:11px 12px;letter-spacing:.08em;border-left:2px dashed #a78bfa}
.btn-plin{display:block;text-align:center;background:var(--brand);color:var(--brand-ink);border-radius:12px;margin:12px 0}
.banda{display:flex;justify-content:space-between;align-items:center;gap:20px;background:linear-gradient(90deg,#5b21b6,#1e40af);color:#fff;border-radius:12px;padding:24px 28px}
.banda h2{margin:0 0 6px}.banda p{margin:0;color:#e0e7ff}.btn-alb{background:#fff;color:var(--violet)}
.magazin{display:grid;grid-template-columns:280px 1fr;gap:24px;align-items:start}
.lat{background:#fff;border:1px solid var(--lin);border-radius:12px;padding:20px;position:sticky;top:16px}
.logo-mare{width:120px;height:120px;margin:0 auto 10px;border:1px solid var(--lin);border-radius:12px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.logo-mare img{max-width:100px;max-height:100px}.lat h3{text-align:center;margin:6px 0}
.lat dl{display:grid;grid-template-columns:1fr auto;gap:6px 10px;font-size:14px;margin:14px 0}.lat dd{margin:0;font-weight:800}
.nota{font-size:12px;color:var(--ink2);line-height:1.5}
.princ h1{font-size:28px;margin:0 0 4px}.sub{color:var(--ink2);margin:0 0 16px}.h2{font-size:20px;margin:28px 0 8px}.pasi{line-height:1.8;color:#334155}
.foot{background:var(--ink);color:#cbd5e1;padding:28px 0;font-size:14px}
.pagina{display:none}.pagina.on{display:block}
@media (max-width:860px){.grila-mag{grid-template-columns:repeat(3,1fr)}.magazin{grid-template-columns:1fr}.lat{position:static}
 .of{grid-template-columns:84px 1fr;}.of-act{grid-column:1/-1}.of-act .btn{width:100%;justify-content:center}.hero h1{font-size:26px}.top nav{display:none}}
@media (max-width:420px){.grila-mag{grid-template-columns:repeat(2,1fr)}}
"""

PAGINA = f'''<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AmCupon — macheta clasic luminos</title><style>{CSS}</style></head><body>
<header class="top"><div class="wrap"><a class="brand" href="#"><b>Am</b>Cupon.ro</a>
<nav><a href="#">Oferte azi</a><a href="#">Magazine</a><a href="#">Categorii</a><a href="#">Black Friday</a><a href="#">Ghiduri</a></nav>
<div class="comuta"><button class="on" data-p="acasa">Prima pagină</button><button data-p="magazin">Pagina de magazin</button></div></div></header>
<main><div class="pagina on" id="p-acasa">{ACASA}</div><div class="pagina" id="p-magazin">{MAGAZIN}</div></main>
<footer class="foot"><div class="wrap">AmCupon.ro · coduri și oferte de la magazinele partenere · macheta, date reale din {E(str(len(mag)))} de magazine</div></footer>
<script>document.querySelectorAll('.comuta button').forEach(b=>b.onclick=()=>{{document.querySelectorAll('.comuta button').forEach(x=>x.classList.toggle('on',x===b));
document.querySelectorAll('.pagina').forEach(p=>p.classList.toggle('on',p.id==='p-'+b.dataset.p));scrollTo(0,0)}});
document.querySelectorAll('a[href="#magazin"]').forEach(a=>a.onclick=e=>{{e.preventDefault();document.querySelector('[data-p=magazin]').click()}});</script>
</body></html>'''

io.open(OUT, "w", encoding="utf-8").write(PAGINA)
print(f"scris {OUT}: {len(cu_oferta)} magazine cu oferta, {nr_coduri} coduri, magazin model: {model['magazin']} ({len(pm)} oferte)")
