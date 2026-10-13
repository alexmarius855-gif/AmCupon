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
| Coloanele din subsol | `frontend/lib/site.ts` → `SUBSOL` |
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
| Prima pagină | `frontend/app/page.tsx` (date) + `frontend/app/HomeClient.tsx` (aspect) |
| Pagina de magazin | `frontend/app/cod-reducere/[magazin]/page.tsx` (date) + `MagazinClient.tsx` (aspect) |

## Automatizări și verificări

| Ce | Unde |
|---|---|
| Actualizarea automată (3 rulări pe zi) | `.github/workflows/update-data.yml` |
| Garda care oprește datele greșite | `scripts/verifica_site.py` |
| Raport de venit (doar local) | `python scripts/raport_venit.py` — cheile în `scripts/.env` |
| Raport Google Search Console (doar local) | `python scripts/raport_gsc.py` — cheia în `scripts/gsc-key.local.json` |

## Reguli care nu se schimbă

- Comisionul nostru nu se publică. Codul se vede doar după clic pe linkul plătit.
- Nicio afirmație fără sursă („verificat”, „testat”, statistici inventate).
- Fișierele `*.local.json` și `scripts/.env` nu ajung în git (repo-ul e public).
