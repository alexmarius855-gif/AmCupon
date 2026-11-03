# Harta site-ului AmCupon — „vrei să schimbi X → editezi Y”

Scrisă pe 14.10.2026, la cererea lui Alex: site-ul trebuie să fie ușor de modificat. Fiecare rând de mai jos
spune **un singur loc**. Dacă descoperi că un lucru trebuie schimbat în două locuri, e un bug de structură —
mută-l aici și actualizează harta.

## Aspect (culori, temă)

| Vrei să schimbi | Editezi |
|---|---|
| Culorile întregului site (tema închisă) | `frontend/app/globals.css` → blocul `:root` (variabilele `--background`, `--surface`, `--foreground`, `--accent`...) |
| Culorile temei luminoase | `frontend/app/globals.css` → blocul `.tema-luminoasa` |
| O pagină să fie luminoasă | adaugi clasa `tema-luminoasa` pe elementul exterior al paginii (exemplu: `MagazinClient.tsx`, primul `<div>`) |
| Culori scrise direct într-o pagină nouă | scrii `bg-[var(--surface)]`, `text-[var(--foreground)]`... nu `bg-[#14181c]`; pentru cod vechi rulezi `python scripts/tokenizeaza_culori.py fisier.tsx` |

Regula de contrast: lime (`--accent`) e fundal de buton cu text `#0c1000`; ca text pe alb se folosește
`--accent-text`. După o schimbare de temă, verifici contrastul pe pagină (vezi `CLAUDE.md`).

## Texte și linkuri

| Vrei să schimbi | Editezi |
|---|---|
| Meniul de sus, meniul de pe telefon | `frontend/lib/site.ts` → `MENIU_PRINCIPAL`, `MENIU_MOBIL` |
| Numele și descrierile categoriilor, paginile pe teme de pe /categorii | `frontend/lib/site.ts` → `CATEGORII_SITE`, `NISE_SITE` |
| Bara de sus cu Black Friday (apare și dispare singură) | `frontend/app/layout.tsx` → `anuntBF` |
| Coloanele din subsol (toate paginile, inclusiv prima) | `frontend/lib/site.ts` → `SUBSOL` |
| Email de contact, rețele sociale | `frontend/lib/site.ts` → `SITE` |
| Magazinele populare din subsol | `frontend/lib/magazinePopulare.ts` |
| Numele afișat al unui magazin | `frontend/lib/numeMagazin.ts` |
| Datele Black Friday | `frontend/public/black-friday.json` |
| O pagină mutată / ștearsă (redirect) | `frontend/lib/redirecturi.ts` — sitemap-ul se curăță singur |

## Magazine, oferte, produse

| Vrei să schimbi | Editezi |
|---|---|
| Un magazin adăugat de mână | `data/extra_merchants.json` (supraviețuiește actualizărilor automate) |
| Ce magazine apar pe o pagină de nișă | `frontend/lib/categoriiNisa.ts` |
| Categoriile paginilor de produse | `frontend/app/produse/categorie-meta.ts` |
| Ce produse apar sub un articol de blog | `frontend/lib/topFeed.ts` → `REGULI_TEME` + `ARTICOLE_TEME` (test: `node lib/topFeed.test.mjs`) |
| Cum se maschează codul | `frontend/lib/maskCod.ts` |
| Titlul afișat al unei promoții | `frontend/lib/oferta.ts` (oglinda Python: `scripts/promotii.py`) |
| Linkul de afiliere și sub-id-ul | `frontend/lib/linkMagazin.ts`, `frontend/lib/subId.ts` |
| Ce pagini de magazin se indexează în Google | `frontend/lib/seoIndexable.ts` |

## Conținut

| Vrei să schimbi | Editezi |
|---|---|
| Un ghid „Cel mai bun X” (scris pe surse) | `scripts/articole_verificate.py`, apoi `python articole_verificate.py --test` și `python articole_verificate.py` |
| Cum arată un articol de blog | `frontend/app/blog/[slug]/page.tsx` |
| Prima pagină | `frontend/app/page.tsx` (randată pe server; doar grila de oferte are JavaScript) |
| Temele cu produse de pe prima pagină | `frontend/app/page.tsx` → `TEME_ACASA` |
| Ce spune primul ecran în fiecare fază Black Friday | `frontend/app/page.tsx` → `carlig`, fazele în `frontend/lib/momentBF.ts` |
| Ordinea ofertelor, peste tot | `frontend/lib/oferteAcasa.ts` → `oferteAcasa` (test: `node lib/oferteAcasa.test.mjs`) |
| Grila de oferte (filtre, card, „Arată încă”) | `frontend/app/components/GrilaOferte.tsx`, datele în `frontend/lib/grilaOferte.ts` |
| Antetul și blocul de oferte ale paginilor pe teme (/fashion, /casa...) | `frontend/app/components/OferteNisa.tsx` |
| Pagina unei categorii | `frontend/app/categorii/[slug]/page.tsx` |
| Pagina de magazin | `frontend/app/cod-reducere/[magazin]/page.tsx` (date) + `MagazinClient.tsx` (aspect) |

## Automatizări și verificări

| Ce | Unde |
|---|---|
| Actualizarea automată (3 rulări pe zi) | `.github/workflows/update-data.yml` |
| Garda care oprește datele greșite | `scripts/verifica_site.py` |
| Capturi + scroll orizontal + contrast în browser real, la 1280 și 375 px | `node scripts/captura_pagini.mjs --baza http://localhost:3107 --iesire <folder> /pagina` (în Git Bash cu `MSYS_NO_PATHCONV=1`) |
| Raport de venit (doar local) | `python scripts/raport_venit.py` — cheile în `scripts/.env` |
| Raport Google Search Console (doar local) | `python scripts/raport_gsc.py` — cheia în `scripts/gsc-key.local.json` |

## Reguli care nu se schimbă

- Comisionul nostru nu se publică. Codul se vede doar după clic pe linkul plătit.
- Nicio afirmație fără sursă („verificat”, „testat”, statistici inventate).
- Fișierele `*.local.json` și `scripts/.env` nu ajung în git (repo-ul e public).
