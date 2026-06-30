# 📣 Șablon postări AmCupon.ro — ghid de utilizare

Scopul fiecărei postări: **omul să dea click pe link.** Nimic altceva.
Nu vinde produsul — vinde *curiozitatea* + *urgența* + *o singură acțiune*.

---

## 🧠 Formula (împrumutată de la conturile de deal-uri care convertesc)

Orice postare are 4 părți, în ordinea asta:

| # | Parte | Rol | Exemplu |
|---|-------|-----|---------|
| 1 | **HOOK** | numărul reducerii în față, oprești scroll-ul | `🔥 -50% la Nike azi` |
| 2 | **OFERTA** | ce primește + codul | `Cod: VARA50` |
| 3 | **URGENȚĂ / DOVADĂ** | de ce ACUM, nu mâine | `⏳ Expiră în 2 zile · 📊 verificat azi` |
| 4 | **CTA** | o singură acțiune + link | `👉 Iei codul aici: amcupon.ro/...` |

**Reguli de aur (de la cei mai buni):**
- **Un singur link, un singur CTA.** Mai multe = confuzie = zero click.
- **Numărul mare în prima linie.** „-50%" oprește scroll-ul; „Reduceri la Nike" nu.
- **Urgență reală**, nu falsă. „Expiră în 2 zile" doar dacă chiar expiră.
- **Emoji ca ancore vizuale**, nu spam. Max 1 pe linie.
- **Linkul către pagina de pe site** (`amcupon.ro/cod-reducere/...`), NU direct afiliat —
  așa crești traficul site-ului, prinzi omul pt newsletter, iar linkul afiliat e pe pagină.

---

## ✍️ Skelet de completat manual (când postezi singur)

### 📱 STORY (Instagram / Facebook story — swipe rapid)
```
🔥 -[X]% la [MAGAZIN]!
Cod: [COD] 👇
amcupon.ro/cod-reducere/[slug]
```
> Story-ul se vede 2 secunde. Doar: numărul + cod + link. Atât.

### 📝 PERETE (postare normală Facebook)
```
🔥 -[X]% la [MAGAZIN] — activ acum

✅ [titlul ofertei]
🎟️ Cod verificat: [COD]
⏳ Expiră în [N] zile — prinde-l până nu zboară
📊 Funcționează (rată [Y]% azi)

👉 Iei codul + mergi la magazin aici:
amcupon.ro/cod-reducere/[slug]

#reduceri #[magazin] #coduri #romania
```

### 📧 EMAIL ZILNIC (pt când pornești newsletterul — stil Morning Brew)
Morning Brew convertește pentru că: **subiect cu curiozitate**, **scanabil**,
**un singur buton mare**, **ton de prieten, nu de corporație**.
```
SUBIECT:  🔥 Top 5 reduceri azi (una expiră diseară)
PREVIEW:  Nike -50%, eMAG Festival, +3 care merită...

Salut 👋

Astea-s ofertele zilei verificate de noi (nu pierdem timpul cu gunoaie):

1. 🔥 Nike — -50% cu codul VARA50  → [Vezi oferta]
2. 📱 eMAG — Săptămâna Festivalului → [Vezi oferta]
3. 💄 Sephora — -30% la parfumuri   → [Vezi oferta]
   (+2 mai jos)

⏳ Una expiră diseară — verifică înainte să zboare.

[ VEZI TOATE OFERTELE DE AZI ]   ← un singur buton mare

P.S. Forward la un prieten care cheltuie prea mult 😄
```
> Regula email: **un singur buton mare**, restul sunt linkuri text. Subiect cu
> curiozitate + un cârlig de urgență („una expiră diseară").

---

## 🤖 Postări gata de copiat (automat, fără să scrii nimic)

Nu trebuie să completezi manual de fiecare dată. Rulează:
```bash
python scripts/generate_postari_simple.py
```
→ produce `data/postari-zilnice.txt` cu **un bloc per magazin** (story + perete +
hashtag), sortate cu cele mai tari sus. Deschizi fișierul pe telefon, alegi un
magazin, copiezi blocul, postezi. Gata.

(Pe nișe, cu scripturi video TikTok/Reels: `generate_social_content.py`.)

---

## 📅 Rutina recomandată (5 min/zi)

1. Rulezi generatorul (sau îl pui pe cron — vezi `ACTIUNI-VENIT.md`).
2. Iei **2-3 magazine de sus** din `postari-zilnice.txt`.
3. Postezi **PERETE pe Facebook** (pagina + 1-2 grupuri de reduceri).
4. Copiezi **STORY** pe Instagram story + Facebook story.
5. (Opțional) același STORY pe Telegram.

> Consistența bate volumul. 3 postări/zi, în fiecare zi > 20 postări o dată pe lună.

---

## 🚀 Automatizare (când ai venit — deja schițat în pipeline)
- `post_facebook.py`, `post_instagram.py`, `post_telegram.py` — postare automată
- `send_newsletter.py` — trimitere email (după ce validezi sender-ul în Brevo)
- `telegram_daily.py` — digest zilnic automat pe Telegram

Astea există deja. Le activăm pe rând când zici tu.
