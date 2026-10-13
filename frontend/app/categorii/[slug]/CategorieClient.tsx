"use client";

import { useState } from "react";
import Link from "next/link";

import MagazinCard, { numeAfisat, type CardMagazin } from "../../components/MagazinCard";
import FiltreRapide, { trecePrinFiltru, type CheieFiltru } from "../../components/FiltreRapide";
import NewsletterCTA from "../../components/NewsletterCTA";

interface Magazin extends CardMagazin {
  trend: number;
  zile_ramase: number;
  rank?: number;
}

/**
 * Descrieri SEO per categorie.
 *
 * REPARAT 22.08.2026 - al 5-lea val al aceluiasi tipar (docs/LECTII-TEHNICE.md).
 * Versiunea anterioara era cheiata pe slugurile de dinainte de migrarea taxonomiei:
 * din 13 descrieri, 11 nu s-au afisat NICIODATA (electronics-itc, pet-supplies,
 * home-garden...). Iar cele 2 care se afisau numeau magazine pe care nu le avem:
 * FashionDays (Profitshare, cont respins), Zara, H&M, Douglas, Sephora.
 *
 * Doua schimbari care fac imposibila repetarea:
 *   1. cheile sunt cele 18 sluguri REALE din output.json;
 *   2. textul NU mai numeste niciun magazin. Numele apar dintr-o propozitie
 *      generata din date (magazineMentionate mai jos), deci nu pot deveni false
 *      cand un program e respins sau adaugat. Ce e scris de mana se poate invechi;
 *      ce e citit din date, nu.
 */
const DESC_CATEG: Record<string, string> = {
  "marketplace":     "Coduri de reducere pentru marketplace-uri si magazine generaliste, unde gasesti de toate intr-un singur loc. Actualizam ofertele zilnic si pastram doar ce e activ.",
  "casa-gradina":    "Reduceri la mobila, decoratiuni, unelte si tot ce tine de casa si gradina. De la amenajari complete pana la obiecte mici care schimba o camera.",
  "electronice":     "Coduri reducere pentru laptopuri, telefoane, televizoare si electronice IT. Categoria cu cele mai frecvente campanii din an.",
  "fashion":         "Voucher si coduri de reducere pentru haine, incaltaminte si accesorii. Colectii noi, stocuri la final de sezon si reduceri care se schimba saptamanal.",
  "software":        "Reduceri la licente software, aplicatii si servicii digitale - de la antivirus si VPN pana la unelte de productivitate.",
  "calatorii":       "Coduri reducere pentru cazare, zboruri, eSIM si servicii de calatorie. Utile mai ales cand rezervi din timp.",
  "beauty":          "Voucher si coduri de reducere pentru parfumuri, cosmetice si produse de ingrijire. Una dintre cele mai active categorii ca numar de promotii.",
  "sanatate":        "Reduceri la farmacii online, suplimente, vitamine si produse de ingrijire personala.",
  "sport":           "Coduri reducere pentru echipament sportiv, imbracaminte de antrenament si articole outdoor.",
  "carti-educatie":  "Reduceri la carti, manuale, audiobook-uri si cursuri online. Campaniile cresc vizibil in perioada de inceput de scoala.",
  "copii":           "Coduri reducere la jucarii, haine si produse pentru copii si bebelusi.",
  "auto-moto":       "Reduceri la piese auto, anvelope, accesorii si echipament moto.",
  "servicii":        "Coduri reducere pentru servicii online: gazduire, unelte de business, abonamente si platforme digitale.",
  "bijuterii":       "Voucher si reduceri la bijuterii, ceasuri si accesorii - de la piese de zi cu zi pana la cadouri.",
  "animale":         "Coduri reducere pentru hrana, accesorii si produse de ingrijire pentru animale de companie.",
  "mancare-bauturi": "Reduceri la livrare de mancare, cafea, vin si bauturi. Categorie mica la noi deocamdata, dar in crestere.",
  "cadouri-flori":   "Coduri reducere pentru flori, cadouri personalizate si experiente. Cerere concentrata in jurul sarbatorilor.",
  "financiar":       "Reduceri si oferte la carduri, credite, asigurari si servicii financiare.",
};

interface Produs {
  title: string; url: string; image: string; price: number;
  old_price?: number | null; discount_pct: number; merchant?: string; merchant_slug?: string;
}

export default function CategorieClient({ magazine, numeCategorie, slug, produse = [] }: {
  magazine: Magazin[];
  numeCategorie: string;
  slug: string;
  produse?: Produs[];
}) {
  const [filtruActiv, setFiltruActiv] = useState<CheieFiltru>("toate");

  const cuPromotii = magazine.filter((m) => m.are_promotie);
  const faraPromotii = magazine.filter((m) => !m.are_promotie);
  const an = new Date().getFullYear();
  const descCateg = DESC_CATEG[slug];

  // Numele magazinelor vin din DATE, nu din text scris de mana - asa nu pot deveni
  // false. Doar cele cu promotie activa, ca propozitia sa fie utila, nu decorativa.
  const magazineMentionate = cuPromotii.slice(0, 5).map((m) => numeAfisat(m.magazin));
  const restulCuPromotii = cuPromotii.length - magazineMentionate.length;

  const cuPromotiiFiltrate = cuPromotii.filter((m) => trecePrinFiltru(m, filtruActiv));

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[var(--text-muted)] flex-wrap">
          <Link href="/" className="hover:text-[var(--accent-text)] transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Acasă
          </Link>
          <svg className="w-3 h-3 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/categorii" className="hover:text-[var(--accent-text)] transition-colors">Categorii</Link>
          <svg className="w-3 h-3 text-[var(--text-soft)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[var(--text-soft)] font-medium">{numeCategorie}</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative bg-[var(--background)] border-b border-[var(--border)] overflow-hidden py-10 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(13,148,136,0.15) 0%, transparent 65%)" }} />
        <div className="relative max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-black mb-1 text-[var(--foreground)]">
            Coduri reducere <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>{numeCategorie}</span> {an}
          </h1>
          <p className="text-[var(--text-soft)] text-sm">
            {cuPromotii.length} promoții active · {magazine.length} magazine · Actualizat zilnic
          </p>
          {descCateg && (
            <p className="text-[var(--text-soft)] text-sm mt-2 max-w-2xl opacity-90">{descCateg}</p>
          )}
          {magazineMentionate.length > 0 && (
            <p className="text-[var(--text-muted)] text-sm mt-1.5 max-w-2xl">
              Magazine cu oferte active acum: {magazineMentionate.join(", ")}
              {restulCuPromotii > 0 ? " si inca " + restulCuPromotii : ""}.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* CU PROMOTII */}
        {cuPromotii.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-black text-[var(--foreground)]">Promoții Active {an}</h2>
              <span className="text-sm text-[var(--text-muted)]">
                {filtruActiv === "toate"
                  ? cuPromotii.length + " oferte"
                  : cuPromotiiFiltrate.length + " din " + cuPromotii.length + " oferte"}
              </span>
            </div>

            {/* Aceleasi filtre ca pe homepage - component partajat, nu o copie.
                FiltreRapide ascunde singur filtrele fara rezultate, deci pe o
                categorie fara niciun cod nu apare un buton care nu face nimic. */}
            <div className="mb-5">
              <FiltreRapide magazine={cuPromotii} activ={filtruActiv} onSchimba={setFiltruActiv} />
            </div>

            {cuPromotiiFiltrate.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cuPromotiiFiltrate.map((m) => (
                  <MagazinCard key={m.magazin} m={m} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] py-6">
                Niciun magazin din {numeCategorie} nu are acest tip de ofertă acum.{" "}
                <button onClick={() => setFiltruActiv("toate")} className="text-[var(--accent-text)] font-bold hover:underline">
                  Vezi toate cele {cuPromotii.length}
                </button>
              </p>
            )}
          </section>
        )}

        {/* PRODUSE (din feed) — umple categoria cu dovada vizuala. Titlul spunea „la reducere”, dar
            produsele din feed au pretul de raft (06.10.2026: 133 din 20.264 au reducere). */}
        {produse.length >= 4 && (
          <section className="mb-10">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-[var(--foreground)]">Produse din {numeCategorie}</h2>
                <span className="text-sm text-[var(--text-muted)]">{produse.length} produse</span>
              </div>
              <Link href="/produse" className="hidden sm:inline text-xs font-bold text-[var(--accent-text)] hover:text-[var(--accent-text)] transition-colors">Toate produsele →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {produse.map((p, i) => {
                const hasOld = !!(p.old_price && p.old_price > p.price);
                return (
                  <a key={i} href={p.url} target="_blank" rel="sponsored noopener noreferrer"
                    className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/50 rounded-xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40">
                    <div className="relative bg-[var(--surface)] aspect-square overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.currentTarget.closest("a") as HTMLElement).style.display = "none"; }} />
                      {p.discount_pct > 0 && (
                        <span className="absolute top-2 left-2 bg-gradient-to-br from-[#34d399] to-[#ddf93c] text-[#0c1000] text-[11px] font-black px-2 py-0.5 rounded-lg shadow">-{p.discount_pct}%</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-semibold text-[var(--text-soft)] line-clamp-2 flex-1 group-hover:text-[var(--foreground)] transition-colors leading-snug">{p.title}</p>
                      <div className="mt-2 flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[var(--accent-text)]">{p.price.toLocaleString("ro-RO")} lei</span>
                        {hasOld && <span className="text-[10px] text-[var(--text-muted)] line-through">{p.old_price!.toLocaleString("ro-RO")}</span>}
                      </div>
                      {p.merchant && <span className="text-[10px] text-[var(--text-muted)] mt-1 truncate">{p.merchant}</span>}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* FARA PROMOTII */}
        {faraPromotii.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-black text-[var(--text-soft)]">Toate magazinele {numeCategorie}</h2>
              <span className="text-sm text-[var(--text-muted)]">{faraPromotii.length} magazine</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              Aceste magazine nu au promoții active momentan — butoanele duc direct la magazin prin linkul nostru afiliat.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {faraPromotii.map((m) => (
                <MagazinCard key={m.magazin} m={m} />
              ))}
            </div>
          </section>
        )}
      </div>

      <NewsletterCTA titlu={`Nu rata reducerile ${numeCategorie}`} />

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* SEO CONTENT */}
        <section className="mt-14 bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 md:p-8">
          <h2 className="text-lg font-black text-[var(--foreground)] mb-4">
            Cum găsești cele mai bune reduceri {numeCategorie}?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-[var(--text-soft)]">
            <div>
              <h3 className="font-bold text-[var(--foreground)] mb-2">✅ Coduri actualizate zilnic</h3>
              <p>
                Codurile de reducere {numeCategorie} de pe AmCupon.ro se actualizează automat; cele expirate dispar după data lor.
                Afișăm zilele rămase până la expirare pentru fiecare cod în parte.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--foreground)] mb-2">🔔 Cum folosești un cod</h3>
              <p>
                Copiază codul de pe această pagină, adaugă produsele în coș pe site-ul magazinului,
                iar la checkout introdu codul în câmpul „Cod promoțional&quot;. Reducerea se aplică automat.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-[var(--foreground)] mb-2">💡 Sfat de economii</h3>
              <p>
                Compară ofertele de la mai multe magazine înainte de cumpărare. Unele magazine oferă
                reduceri mai mari la prima comandă sau la comenzi peste o anumită valoare.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex items-center justify-between flex-wrap gap-3">
          <Link href="/categorii" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors">
            ← Toate categoriile
          </Link>
          <Link href="/toate-magazinele" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-text)] transition-colors">
            Toate magazinele →
          </Link>
        </div>
      </div>
    </div>
  );
}
