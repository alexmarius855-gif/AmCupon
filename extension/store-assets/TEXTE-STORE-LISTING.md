# Texte gata de lipit — Chrome Web Store listing (v1.1, rescrise pe 24.09.2026)

> Deschide https://chrome.google.com/webstore/devconsole → draftul „AmCupon.ro — Coduri de reducere"
> (șterge întâi draftul DUPLICAT — sunt 2 identice din 26.05) → încarcă pachetul nou → completează
> câmpurile de mai jos → Submit for review.

**De ce s-au rescris (24.09.2026).** Textele din iulie promiteau „coduri verificate zilnic” (nu testăm
codurile în coș), numeau eMAG și Fashion Days (n-au program de afiliere la noi) și nu spuneau nimic
despre afiliere. [Regula Chrome din 11.03.2025](https://developer.chrome.com/docs/webstore/program-policies/affiliate-ads)
cere ca programul de afiliere să fie descris vizibil în pagina extensiei, în interfața ei și înainte
de instalare. Extensia îl spune în popup; textele de mai jos îl spun în pagina din magazin.

---

## Descriere (câmpul „Description”)

```
AmCupon.ro îți arată ofertele și codurile de reducere active pentru magazinul pe care îl vizitezi.

Cum funcționează:
• Deschizi site-ul unui magazin și apeși pe iconița AmCupon.
• Vezi ofertele active în acel moment, din rețelele de afiliere în care AmCupon.ro e partener.
• Dacă oferta are cod, îl copiezi cu un clic; butonul te duce la oferta magazinului.

Ce trebuie să știi:
• Ofertele vin de la rețelele de afiliere și se actualizează de trei ori pe zi. Nu testăm fiecare cod în coș.
• Dacă magazinul nu are nicio ofertă activă, extensia îți spune asta și nu te trimite nicăieri.
• Programul de afiliere: butoanele către magazine sunt linkuri de afiliere. Dacă cumperi, AmCupon.ro
  primește un comision de la magazin, fără niciun cost în plus pentru tine. Linkul se deschide doar
  când apeși tu pe buton, și doar pentru o ofertă reală.
• Nu colectăm date personale și nu urmărim navigarea. Extensia citește adresa tab-ului curent doar
  când deschizi popup-ul și descarcă lista publică de oferte de la amcupon.ro.
```

## Single purpose (câmpul „Single purpose description”)

```
Afișează ofertele și codurile de reducere active pentru magazinul online deschis în tab-ul curent, din lista publică de la amcupon.ro.
```

## Justificări permisiuni (secțiunea „Privacy practices”)

**activeTab:**
```
Folosită doar pentru a citi domeniul tab-ului curent (de exemplu notino.ro) atunci când utilizatorul deschide popup-ul, ca să arătăm ofertele acelui magazin. Nu citim conținutul paginii și nu monitorizăm navigarea în fundal.
```

**storage:**
```
Păstrează local lista publică de oferte descărcată de la amcupon.ro, ca popup-ul să se deschidă instant. Nu stocăm date personale.
```

**alarms:**
```
Reîmprospătează lista de oferte de la amcupon.ro la câteva ore, ca ofertele afișate să fie actuale.
```

**Host permission (https://amcupon.ro/*):**
```
Singura comunicare externă a extensiei: descarcă lista publică de oferte (amcupon.ro/extensie.json). Nu se trimit date despre utilizator.
```

## Restul câmpurilor

| Câmp | Valoare |
|------|---------|
| Category | Shopping |
| Language | Română |
| Privacy policy URL | `https://amcupon.ro/confidentialitate` |
| Homepage URL | `https://amcupon.ro` |
| Support URL/email | `contact@amcupon.ro` |
| Screenshot | `store-assets/screenshot-1280x800.png` — refăcut pe 24.09.2026 cu un exemplu real (Jollymag, JOLLY10); cel din 03.07 promitea „automat, la checkout” și „verificat zilnic”, cu coduri inventate pe emag.ro |
| Icon 128px | se ia automat din pachet (`icons/icon128.png`) |

## Pachetul (v1.1.0)

1. Arhivează CONȚINUTUL folderului `extension/` (manifest.json trebuie să fie în rădăcina zip-ului).
   Scoate din arhivă: `store-assets/`, `generate_icons.py`, `generate_store_screenshot.py`, `test_potrivire.cjs`, `README.md`.
2. Dashboard → draft → Package → Upload new package → zip-ul nou.
3. Completezi listing-ul cu textele de mai sus → Submit for review.

**Înainte de upload, verifică o dată de mână** (Chrome → `chrome://extensions` → Developer mode →
Load unpacked → folderul `extension/`): pe notino.ro sau pe un magazin cu ofertă apar ofertele și
butoanele; pe un site fără ofertă apare „Nicio ofertă activă” și niciun buton spre magazin.
