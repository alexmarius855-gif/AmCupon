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

1. **La instalare**: service worker-ul descarca `https://amcupon.ro/output.json`
2. **Cache**: datele sunt stocate in `chrome.storage.local`, TTL = 6 ore
3. **La click pe iconica**: popup-ul detecteaza domeniul tab-ului activ
4. **Matching**: compara domeniul cu `magazin` + `url_real` din output.json
5. **Afiseaza**: cod cupon + promotie + cashback + link afiliat

## Chrome Web Store

**Status:** In review (1-3 zile lucratoare)
**Link public:** https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb
**Developer console:** https://chrome.google.com/webstore/devconsole

## Environment

Nu necesita variabile de mediu — datele vin public de pe `amcupon.ro/output.json`.
