import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre AmCupon.ro — Platforma de Coduri Reducere din Romania",
  description: "AmCupon.ro este platforma de coduri de reducere verificate din Romania. 600+ magazine partenere, actualizare zilnica automata, 100% gratuit pentru cumparatori.",
  keywords: ["despre amcupon","cum functioneaza coduri reducere","platforma reduceri romania","coduri verificate automat"],
  alternates: { canonical: "https://amcupon.ro/despre-noi" },
  openGraph: {
    title: "Despre AmCupon.ro — Cum functioneaza",
    description: "600+ magazine partenere, coduri verificate zilnic, 100% gratuit.",
    url: "https://amcupon.ro/despre-noi",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const PASI = [
  {
    nr: "1",
    titlu: "Colectare automată",
    desc: "Preluăm zilnic toate promoțiile active de la partenerii 2Performant — peste 600 de magazine din România.",
  },
  {
    nr: "2",
    titlu: "Verificare și filtrare",
    desc: "Eliminăm automat ofertele expirate și le afișăm doar pe cele cu dată de valabilitate activă.",
  },
  {
    nr: "3",
    titlu: "Statistici reale",
    desc: "Calculăm rata de succes și contorizăm de câte ori a fost folosit fiecare cod, direct din date.",
  },
  {
    nr: "4",
    titlu: "Actualizare zilnică",
    desc: "În fiecare dimineață, datele se reîmprospătează automat. Întotdeauna găsești ce e valabil azi.",
  },
  {
    nr: "5",
    titlu: "Afișare transparentă",
    desc: "Arătăm zilele rămase, rata de succes și marcăm ofertele care expiră curând — fără surprize.",
  },
];

const BENEFICII = [
  { emoji: "💰", titlu: "Economii reale", desc: "Coduri verificate cu reduceri de 5–50% la cele mai mari magazine online din România." },
  { emoji: "⚡", titlu: "Actualizat zilnic", desc: "Scriptul nostru rulează în fiecare dimineață și actualizează toate ofertele automat." },
  { emoji: "🎯", titlu: "Rată succes afișată", desc: "Știi dinainte cât de probabil e că un cod funcționează, fără să pierzi timp." },
  { emoji: "🔒", titlu: "Fără costuri ascunse", desc: "Folosirea codurilor este 100% gratuită. Noi câștigăm un comision mic de la magazine." },
  { emoji: "📱", titlu: "Mobile-friendly", desc: "Site-ul funcționează perfect pe orice dispozitiv — telefon, tabletă sau desktop." },
  { emoji: "🇷🇴", titlu: "Focus România", desc: "Ne concentrăm exclusiv pe magazine care livrează în România, cu prețuri în lei." },
];

export default function DespreNoiPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">Despre noi</span>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-4">Despre AmCupon.ro</h1>
          <p className="text-orange-100 text-base md:text-lg leading-relaxed">
            AmCupon.ro îți aduce cele mai bune coduri de reducere și oferte verificate
            de la peste <strong className="text-white">600 de magazine partenere</strong> din România,
            actualizate zilnic — complet gratuit.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        {/* CE FACEM */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Ce face AmCupon.ro?</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <p className="text-gray-700 leading-relaxed mb-4">
              AmCupon.ro este o platformă de agregare a ofertelor afiliate. Funcționăm ca intermediar
              între tine și magazinele online: colectăm zilnic toate promoțiile active de la partenerii
              noștri prin platforma <strong>2Performant</strong> și le afișăm centralizat, ușor de găsit.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Atunci când cumperi printr-un link de pe AmCupon.ro, magazinul ne plătește un comision mic
              din bugetul lor de marketing. <strong>Tu nu plătești nimic în plus</strong> — dimpotrivă,
              beneficiezi de codul de reducere care scade prețul final.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Misiunea noastră este simplă: să te ajutăm să economisești la fiecare cumpărătură online,
              fără să pierzi timp căutând pe zeci de site-uri.
            </p>
          </div>
        </section>

        {/* BENEFICII */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">De ce AmCupon.ro?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFICII.map((b) => (
              <div key={b.titlu} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{b.emoji}</div>
                <h3 className="font-black text-gray-900 text-base mb-2">{b.titlu}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CUM VERIFICAM */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Cum verificăm ofertele?</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Validitatea ofertelor este prioritatea noastră. Procesul nostru automat garantează că fiecare
            cod și promoție afișată este funcțională în momentul vizitei tale.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PASI.map((p) => (
              <div key={p.nr} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white font-black text-lg flex items-center justify-center shrink-0">
                  {p.nr}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{p.titlu}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CUM FOLOSESTI */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Cum folosești un cod de reducere?</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="space-y-4">
              {[
                { step: "01", text: "Găsește magazinul dorit pe AmCupon.ro și copiază codul de reducere activ." },
                { step: "02", text: "Deschide site-ul magazinului și adaugă produsele dorite în coșul de cumpărături." },
                { step: "03", text: `La finalizarea comenzii, caută câmpul „Cod promoțional", „Voucher" sau „Cupon".` },
                { step: "04", text: `Introdu codul copiat și apasă „Aplică". Reducerea se scade automat din total.` },
                { step: "05", text: "Finalizează comanda și bucură-te de economii!" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <span className="text-orange-500 font-black text-lg w-10 shrink-0">{s.step}</span>
                  <p className="text-gray-700 leading-relaxed pt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CIFRE */}
        <section className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-10 text-white text-center">
          <h2 className="text-2xl font-black mb-8">AmCupon.ro în cifre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { nr: "600+", label: "Magazine partenere" },
              { nr: "100%", label: "Gratuit pentru tine" },
              { nr: "24h", label: "Ciclu de actualizare" },
              { nr: "2026", label: "An de lansare" },
            ].map((c) => (
              <div key={c.label}>
                <div className="text-3xl md:text-4xl font-black mb-1">{c.nr}</div>
                <div className="text-orange-200 text-sm">{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">Contact</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <p className="text-gray-700 mb-4 leading-relaxed">
              Ai o întrebare despre un cod de reducere, o ofertă expirată sau dorești să colaborezi cu noi?
              Ne poți contacta oricând pe email.
            </p>
            <a href="mailto:contact@amcupon.ro"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@amcupon.ro
            </a>
          </div>
        </section>

      </div>

      <div className="max-w-5xl mx-auto px-4 pb-10 text-center">
        <a href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
          ← Înapoi la AmCupon.ro
        </a>
      </div>
    </div>
  );
}
