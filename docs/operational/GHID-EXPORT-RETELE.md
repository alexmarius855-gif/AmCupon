# Ghid export rețele de afiliere — ce fișier îmi trebuie, exact

> Creat 19.08.2026, după auditul concurenței: **2.193 branduri** pe care le au ei și nu le avem noi.
> Blocajul nu e în cod — motorul de import e gata pentru toate rețelele. Blocajul e că lipsesc
> exporturile.

## ⚠️ Regula care evită drumul degeaba

Fiecare rețea are **două tipuri de raport care se confundă ușor**:

| Raport | Conține | Ne folosește? |
|---|---|---|
| **Performanță / Rapoarte** | clicuri, vânzări, comision câștigat, pe zile | ❌ **NU** |
| **Programe / Parteneri / Advertiseri** | lista magazinelor + **linkul de tracking** | ✅ **DA** |

Îmi trebuie al doilea. Semnul distinctiv: **trebuie să existe o coloană cu un link** (`Click Through
Link`, `Tracking Link`, `Legătură`). Fără coloana aia, fișierul nu poate produce niciun magazin.

> S-a întâmplat deja de două ori: în iulie ai exportat din Awin „Advertiser Directory" (fără linkuri),
> iar pe 19.08 erai în CJ → Rapoarte → Performanță. Ambele sunt fișiere corecte — dar din alt raport.

**Nu-ți face griji dacă nimerești greșit.** Am făcut importul să spună singur ce coloane a găsit și
să te avertizeze dacă lipsesc cele esențiale — deci aflăm dintr-o rulare, nu ghicim.

---

## 1. CJ Affiliate — prioritatea #1

**De ce prima:** ai deja contul, n-ai trimis niciodată exportul, iar `notino` (unul dintre brandurile
pe care le au toți 4 competitorii) merge prin CJ. E cel mai ieftin câștig din tot planul.

Interfața ta e în română. Meniul de sus: `Acasă · Parteneri · Rapoarte · Campanii · Cont`

1. **Parteneri** (NU „Rapoarte")
2. filtrează după starea relației: **Alăturat / Joined**
3. jos-dreapta la tabel e o **iconiță de descărcare** (săgeată în jos) → CSV
4. salvează ca **`data/cj_export.csv`**

Dacă lista de parteneri nu conține linkuri, mai ia și:

5. **Campanii → Legături** (sau `Links`), filtrează pe advertiserii alăturați → export
6. salvează ca **`data/cj_links.csv`**

Trimite-mi ambele dacă le ai — le combin eu.

---

## 2. Awin — ai doar 16 magazine, ei au zeci

`douglas` merge prin Awin, deci mai sunt programe pe care nu le-ai importat.

1. **Publisher → Programmes → Joined Programmes** (nu „Advertiser Directory")
2. buton **Export / Download CSV**
3. verifică să existe coloana **`Click Through Link`** — fără ea, fișierul e inutil
4. salvează ca **`data/awin_export.csv`**

Alternativa, dacă exportul de la Joined Programmes nu are linkuri:
**Toolbox → Link Builder → export**, sau **Create-a-Feed** cu coloana de deep link inclusă.

---

## 3. 2Performant — două exporturi diferite, ambele utile

**a) Promoțiile** (coduri + oferte active — asta ține site-ul viu):
1. **Promotions → Export**
2. salvează peste **`data/promotii_2p.csv`**

**b) Programele la care NU ai aplicat** — pe astea le scot eu, nu tu:

```bash
gh workflow run programe-2p-neaplicate.yml
```

Cere catalogul complet și scade ce ai deja, ordonat după **la câți competitori apare brandul**.
Rezultatul e lista de aplicat, cu cele mai cerute primele.

---

## 4. Impact.com — doar dacă vrei refresh

Ai deja 483 de magazine cu tracking real. Merită reexportat doar dacă ai aplicat la programe noi.

1. **Brands / Contracts → Campaigns**
2. export CSV
3. salvează peste **`data/impact_campaigns.csv`**

---

## 5. TradeDoubler — cont nou, nu ai încă

`cuponescu.ro` (liderul) o folosește; noi n-o avem deloc. Cont de publisher pe
[tradedoubler.com](https://www.tradedoubler.com/), apoi aplici la programele românești.
După aprobare: export listă programe + linkuri → **`data/tradedoubler_export.csv`**.

*(Nu are încă preset în motor — îl adaug când vine primul fișier, e o intrare în `NETWORKS`.)*

---

## Ce fac eu după ce primesc fișierele

```bash
python scripts/import_generic_affiliate.py --network cj    --file data/cj_export.csv
python scripts/import_generic_affiliate.py --network awin  --file data/awin_export.csv
python scripts/merge_platforms.py
```

Apoi verific **live** un eșantion de linkuri (`check_affiliate_links.py`) — nu import nimic fără să
confirm că linkurile chiar răspund, exact ca la Impact pe 06.08.

**Politica de onestitate rămâne:** un magazin intră cu linkul REAL din export sau nu intră deloc.
Nu se ghicește niciodată „probabil linkul arată așa" — bug-ul ăla a ținut 208 magazine cu linkuri
false luni întregi.

---

## Rezumat: unde pui fișierele

| Rețea | Fișier | Status |
|---|---|---|
| CJ | `data/cj_export.csv` | ⬅ **prioritate 1** |
| Awin | `data/awin_export.csv` | ⬅ **prioritate 2** |
| 2Performant (promoții) | `data/promotii_2p.csv` | refresh util |
| Impact | `data/impact_campaigns.csv` | ai deja, opțional |
| TradeDoubler | `data/tradedoubler_export.csv` | după ce faci contul |

Le poți pune direct în `data/` sau mi le atașezi în chat — oricum e bine.
