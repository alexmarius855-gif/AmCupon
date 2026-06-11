import { Metadata } from "next";
import BrandPageTemplate from "../components/BrandPageTemplate";

export const metadata: Metadata = {
  title: "Cod Reducere Petmax — Produse Animale de Companie 2026 | AmCupon.ro",
  description: "Coduri de reducere Petmax actualizate zilnic. Reduceri la hrana, accesorii si produse pentru caini, pisici si alte animale. Promotii Petmax verificate.",
  keywords: ["cod reducere petmax", "petmax reduceri", "produse animale reduceri", "petmax promotii", "petmax discount"],
  alternates: { canonical: "https://amcupon.ro/petmax" },
  openGraph: { title: "Reduceri Petmax Animale 2026 | AmCupon.ro", url: "https://amcupon.ro/petmax", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

export default function PetmaxPage() {
  return (
    <BrandPageTemplate config={{
      slug: "petmax.ro",
      slugAlt: "petmax",
      name: "Petmax",
      tagline: "Hrana si accesorii pentru animale — totul pentru prietenul tau blanos",
      emoji: "🐕",
      desc: "Coduri de reducere Petmax verificate zilnic. Reduceri la hrana premium, accesorii si produse de ingrijire pentru caini, pisici si alte animale.",
      editorial: [
        "Petmax.ro este un magazin online specializat in produse pentru animale de companie, cu o gama larga de hrana uscata si umeda, accesorii, jucarii, produse de ingrijire si tratamente. Platforma ofera branduri premium ca Royal Canin, Hill's, Purina Pro Plan, Brit si multe altele.",
        "Pe AmCupon.ro monitorizam ofertele Petmax si publicam codurile de reducere active. Reducerile apar frecvent la hrana in cantitati mari (saci 10-15 kg), la lansari de produse noi si in perioadele de promotii sezoniere.",
        "Petmax are livare rapida si posibilitatea de comanda recurenta cu reducere suplimentara — ideal pentru hrana de care animalul tau are nevoie lunar. Consultantii veterinari din echipa Petmax pot oferi sfaturi de nutritie pentru animalul tau.",
      ],
      tips: [
        "Cumpara hrana in cantitati mari (saci 10+ kg) — pretul per gram e semnificativ mai mic.",
        "Foloseste abonamentul de livrare recurenta Petmax pentru reducere suplimentara de 5-10%.",
        "Compara hrana pe baza ingredientelor, nu doar a pretului — calitatea difera mult.",
        "Treci gradual la o hrana noua pe parcursul a 7-10 zile pentru a evita probleme digestive.",
        "Verifica sectiunea de produse in cantitati promotionale — pachete duble sau triple cu reducere.",
      ],
      faq: [
        { q: "Cum aplic un cod de reducere Petmax?", a: "La finalizarea comenzii, cauta campul 'Cod voucher' sau 'Cod promotional'. Introdu codul copiat de pe AmCupon.ro si apasa Aplica pentru a vedea reducerea aplicata." },
        { q: "Petmax ofera livrare gratuita?", a: "Da, Petmax ofera livrare gratuita la comenzi peste un anumit prag. Sacii de hrana mare ating usor pragul de livrare gratuita." },
        { q: "Hrana de la Petmax este autentica?", a: "Da, Petmax este distribitor autorizat pentru toate brandurile pe care le vinde. Produsele sunt originale, cu date de expirare corecte si depozitate in conditii optime." },
        { q: "Petmax are medicamente veterinare?", a: "Petmax vinde produse antiparazitare (tratamente purici, capuse), suplimente nutritive si produse de ingrijire, dar nu medicamente veterinare cu prescriptie. Pentru medicamente, mergi la o farmacie veterinara." },
      ],
      canonical: "/petmax",
    }} />
  );
}
