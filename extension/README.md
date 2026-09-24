# AmCupon.ro — Extensie Chrome

**Extension ID:** `mahfankpalkgognhnllkgdkjncmmkllb`
**Chrome Web Store:** https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb

Extensie Chrome (Manifest V3) care detecteaza automat magazinul pe care il vizitezi
si afiseaza codurile de reducere + ofertele disponibile pe AmCupon.ro.

## Instalare in Chrome (modul developer)

1. Deschide Chrome → `chrome://extensions/`
2. Activeaza **Developer mode** (toggle dreapta-sus)
3. Click **Load unpacked**
4. Selecteaza folderul `extension/` din proiect
5. Gata! Iconita apare in bara Chrome.

## Structura fisiere

```
extension/
├── manifest.json        — configuratie Manifest V3
├── popup.html           — interfata vizuala popup
├── popup.js             — logica popup: detectie domeniu, render
├── background.js        — service worker: fetch + cache date (6h TTL)
├── generate_icons.py    — genereaza icons/ (ruleaza o singura data)
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Cum functioneaza

1. **La instalare**: service worker-ul descarca `https://amcupon.ro/extensie.json` (~43 KB: doar
   magazinele cu oferta activa, cu linkul calculat pe server de `scripts/genereaza_extensie.py`)
2. **Cache**: datele sunt stocate in `chrome.storage.local`, TTL = 6 ore
3. **La click pe iconica**: popup-ul citeste domeniul tab-ului activ
4. **Potrivire**: EXACTA pe domeniu sau subdomeniu (`potrivire.js`), niciodata pe subsir
5. **Afiseaza**: ofertele active, codul cu buton de copiere, butonul spre oferta (link de afiliere,
   doar la clic) si nota de afiliere. Fara oferta: niciun link spre magazin.

**v1.1 (24.09.2026)** a scos din ciorna din 26.05 comisionul afisat ca „Cashback”, stelele din scorul
intern, potrivirea pe subsir si linkul de afiliere la magazinele fara oferta (regula Chrome Web Store
din 11.03.2025). Test: `node extension/test_potrivire.cjs`.

## Chrome Web Store

**Status:** NEPUBLICATA. Draft in consola din 26.05, niciodata trimis. Linkul de mai jos nu arata
nicio extensie (verificat 24.09.2026: pagina nu contine „AmCupon”). Pasii de trimitere sunt in
`store-assets/TEXTE-STORE-LISTING.md`.
**Link (dupa publicare):** https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb
**Developer console:** https://chrome.google.com/webstore/devconsole

## Environment

Nu necesita variabile de mediu — datele vin public de pe `amcupon.ro/extensie.json`.
