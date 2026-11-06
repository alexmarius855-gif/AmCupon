/* Intrebari frecvente pe /produse/<categorie> (text vizibil + FAQPage).
   06.11.2026: versiunea veche numea magazine care NU sunt partenerii nostri (FashionDays, Altex, PCGarage,
   eMAG, Douglas, Sephora, IKEA, Dedeman, Carrefour...), promitea „pana la 70%" si „magazine certificate".
   Regula: aici nu se scrie niciun nume de magazin (partenerii se schimba zilnic, lista reala e pe pagina)
   si nicio cifra care nu vine din date. */
const PRETURI = { q: "Cât de exacte sunt prețurile afișate?", a: "Prețurile vin din feed-urile magazinelor partenere și se actualizează zilnic, așa că pot rămâne în urmă față de site-ul magazinului. Prețul final e cel din coșul magazinului: apasă butonul Cumpără acum și verifică-l acolo înainte să comanzi." };
const WISHLIST = { q: "Pot urmări prețul unui produs?", a: "Da. Salvează produsul în wishlist (inima de pe card); în pagina Wishlist vezi dacă prețul a scăzut de când l-ai salvat. Lista rămâne doar în browserul tău." };

export const CAT_FAQ: Record<string, { q: string; a: string }[]> = {
  fashion: [
    { q: "De unde vin produsele de fashion de pe AmCupon.ro?", a: "Din feed-urile magazinelor de modă partenere AmCupon.ro, actualizate zilnic. Lista magazinelor e chiar pe pagină, în filtrul Magazin." },
    { q: "Cum găsesc haine la preț mai mic?", a: "Sortează după Preț crescător sau Discount maxim și folosește filtrele de reducere. Reducerea e cea declarată de magazin în feed; unele produse nu au preț vechi, deci nu au procent." },
    WISHLIST,
  ],
  electronice: [
    { q: "De unde vin laptopurile și telefoanele de pe pagină?", a: "Din feed-urile magazinelor de electronice partenere AmCupon.ro. Ce magazine sunt azi vezi în filtrul Magazin." },
    PRETURI,
    { q: "Pot filtra electronicele după brand?", a: "Da, filtrul Brand îți arată producătorii din produsele de pe pagină. Îl poți combina cu filtrul de preț maxim." },
  ],
  beauty: [
    { q: "De unde vin parfumurile și cosmeticele de pe pagină?", a: "Din feed-urile magazinelor de cosmetice partenere AmCupon.ro, actualizate zilnic. Lista lor e în filtrul Magazin." },
    { q: "Cum compar prețul unui parfum?", a: "Caută numele parfumului, apoi compară aceeași concentrație și același volum (EDT și EDP, 50 ml și 100 ml sunt produse diferite)." },
  ],
  sport: [
    { q: "De unde vin echipamentele sportive de pe pagină?", a: "Din feed-urile magazinelor de sport partenere AmCupon.ro. Filtrează după brand, magazin sau preț maxim ca să găsești ce cauți." },
    { q: "Când sunt reduceri la echipament sportiv?", a: "Des la final de sezon, când magazinele lichidează colecția. Sortează după Discount maxim ca să vezi produsele pe care magazinul le-a redus." },
  ],
  casa: [
    { q: "De unde vin produsele pentru casă de pe pagină?", a: "Din feed-urile magazinelor partenere AmCupon.ro de mobilă, decorațiuni, electrocasnice și unelte. Lista lor e în filtrul Magazin." },
    { q: "Cum găsesc produse în bugetul meu?", a: "Folosește glisorul de preț maxim și sortează după Preț crescător. Verifică pe site-ul magazinului costul livrării, mai ales la produsele mari." },
  ],
  copii: [
    { q: "De unde vin jucăriile de pe pagină?", a: "Din feed-urile magazinelor pentru copii partenere AmCupon.ro, actualizate zilnic. Lista lor e în filtrul Magazin." },
    { q: "Ce verific la o jucărie?", a: "Vârsta recomandată de pe ambalaj și marcajul CE. Jucăriile cu piese mici nu sunt pentru copiii sub 3 ani." },
  ],
  farmacie: [
    { q: "De unde vin suplimentele și produsele de farmacie de pe pagină?", a: "Din feed-urile farmaciilor și magazinelor de sănătate partenere AmCupon.ro. Pentru medicamente și suplimente întreabă medicul sau farmacistul înainte să cumperi." },
    PRETURI,
  ],
  carti: [
    { q: "De unde vin cărțile de pe pagină?", a: "Din feed-urile librăriilor partenere AmCupon.ro, actualizate zilnic. Lista lor e în filtrul Magazin." },
    { q: "Cum găsesc o carte anume?", a: "Caută după titlu sau autor, apoi sortează după Preț crescător. Aceeași carte poate avea ediții diferite (copertă, editură), deci compară ediția." },
  ],
  auto: [
    { q: "De unde vin piesele și accesoriile auto de pe pagină?", a: "Din feed-urile magazinelor auto partenere AmCupon.ro. Înainte să comanzi o piesă, verifică pe site-ul magazinului compatibilitatea cu modelul exact al mașinii." },
    PRETURI,
  ],
  animale: [
    { q: "De unde vin produsele pentru animale de pe pagină?", a: "Din feed-urile pet shop-urilor partenere AmCupon.ro, actualizate zilnic. Lista lor e în filtrul Magazin." },
    { q: "Cum economisesc la hrana pentru câine sau pisică?", a: "Compară prețul pe kilogram, nu prețul sacului: sacii mari ies de obicei mai ieftin pe kilogram." },
  ],
  alimente: [
    { q: "De unde vin produsele alimentare de pe pagină?", a: "Din feed-urile magazinelor de alimente partenere AmCupon.ro, actualizate zilnic. Lista lor e în filtrul Magazin." },
    { q: "Cum compar prețurile la alimente?", a: "Compară prețul pe kilogram sau pe litru, nu prețul pachetului, și verifică data de expirare pe site-ul magazinului." },
  ],
};
