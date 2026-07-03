# 📋 Texte gata de lipit — Chrome Web Store listing

> Deschide https://chrome.google.com/webstore/devconsole → draftul "AmCupon.ro — Coduri de reducere"
> (șterge întâi draftul DUPLICAT — sunt 2 identice din 26.05) → completează câmpurile de mai jos → Submit.

---

## Descriere (câmpul "Description")

```
AmCupon găsește automat coduri de reducere pentru magazinul pe care îl vizitezi.

Cum funcționează:
• Navighezi normal pe magazinele tale preferate (eMAG, Fashion Days, Notino, Dr.Max și 1000+ altele)
• Extensia detectează magazinul și îți arată codurile de reducere active, verificate zilnic
• Un click — codul e copiat, îl lipești la checkout și economisești

De ce AmCupon:
✓ 1000+ magazine partenere din România
✓ Coduri verificate și actualizate automat, zilnic
✓ 100% gratuit, fără cont
✓ Zero colectare de date personale — extensia nu urmărește navigarea ta

Extensia sincronizează lista de coduri exclusiv de la amcupon.ro. Nu citește și nu transmite istoricul tău de navigare.
```

## Single purpose (câmpul "Single purpose description")

```
Afișează coduri de reducere verificate pentru magazinul online pe care utilizatorul îl vizitează, sincronizate de la amcupon.ro.
```

## Justificări permisiuni (secțiunea "Privacy practices")

**activeTab:**
```
Folosită exclusiv pentru a citi domeniul tab-ului curent (ex: emag.ro) atunci când utilizatorul deschide popup-ul, ca să afișăm codurile de reducere potrivite acelui magazin. Nu citim conținutul paginii și nu monitorizăm navigarea în fundal.
```

**storage:**
```
Stochează local lista de coduri de reducere descărcată de la amcupon.ro (cache), ca popup-ul să se deschidă instant și să funcționeze cu trafic minim. Nu stocăm date personale.
```

**alarms:**
```
Programează reîmprospătarea periodică (la câteva ore) a listei de coduri de la amcupon.ro, ca ofertele afișate să fie mereu actuale.
```

**Host permission (https://amcupon.ro/*):**
```
Singura comunicare externă a extensiei: descarcă lista publică de coduri de reducere de la amcupon.ro. Nu se trimit date despre utilizator.
```

## Restul câmpurilor

| Câmp | Valoare |
|------|---------|
| Category | Shopping |
| Language | Română |
| Privacy policy URL | `https://amcupon.ro/confidentialitate` |
| Homepage URL | `https://amcupon.ro` |
| Support URL/email | `contact@amcupon.ro` |
| Screenshot | `store-assets/screenshot-1280x800.png` (din acest folder) |
| Icon 128px | se ia automat din pachet (`icons/icon128.png`, deja indigo) |

## ⚠️ Înainte de Submit — RE-ÎMPACHETEAZĂ

Popup-ul a fost rebranduit azi (verde→indigo), deci pachetul vechi din draft e depășit:
1. Selectează folderul `extension/` → click dreapta → Send to → Compressed (zipped) folder
   (sau: selectezi CONȚINUTUL folderului — manifest.json trebuie să fie în rădăcina zip-ului)
2. În dashboard → draft → "Package" → Upload new package → zip-ul nou
3. Apoi completezi listing-ul cu textele de mai sus → Submit for review

Review-ul Google durează de obicei 1-3 zile lucrătoare.
