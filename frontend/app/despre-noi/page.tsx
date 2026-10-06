import Link from "next/link";
import { Metadata } from "next";
import { pesteMagazine, PesteMagazine, reteleAfiliere, numarMagazine } from "@/lib/cifreSite";

export const metadata: Metadata = {
  title: "Despre AmCupon.ro — Platforma de Coduri Reducere din Romania",
  description: `AmCupon.ro aduna codurile de reducere si ofertele active de la ${pesteMagazine()} partenere, actualizate automat de mai multe ori pe zi. 100% gratuit pentru cumparatori.`,
  keywords: ["despre amcupon","cum functioneaza coduri reducere","platforma reduceri romania","coduri reducere actualizate"],
  alternates: { canonical: "https://amcupon.ro/despre-noi" },
  openGraph: {
    title: "Despre AmCupon.ro — Cum functioneaza",
    description: `${PesteMagazine()} partenere, coduri actualizate zilnic, 100% gratuit.`,
    url: "https://amcupon.ro/despre-noi",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
      images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

const PASI = [
  {
    nr: "1",
    titlu: "Colectare automată",
    desc: `De trei ori pe zi preluăm automat promoțiile active din rețelele de afiliere (${reteleAfiliere()}), de la ${pesteMagazine()} partenere.`,
  },
  {
    nr: "2",
    titlu: "Filtrare automată",
    desc: "Eliminăm automat ofertele expirate și le afișăm doar pe cele cu dată de valabilitate activă.",
  },
  {
    nr: "3",
    titlu: "Statistici reale",
    desc: "Calculăm un Deal Score din reducerea reală, prospețimea datelor și exclusivitate — niciun semnal inventat.",
  },
  {
    nr: "4",
    titlu: "Actualizare zilnică",
    desc: "Datele se reîmprospătează automat de trei ori pe zi. Ofertele expirate dispar după data lor."
  },
  {
    nr: "5",
    titlu: "Afișare transparentă",
    desc: "Arătăm zilele rămase și marcăm ofertele care expiră curând — fără surprize.",
  },
];

const BENEFICII = [
  { emoji: "💰", titlu: "Oferte reale", desc: "Doar ofertele pe care rețelele de afiliere le dau ca active azi — fără coduri inventate, fără cifre fabricate." },
  { emoji: "⚡", titlu: "Actualizat automat", desc: "Scriptul nostru rulează de trei ori pe zi și actualizează ofertele automat." },
  { emoji: "🎯", titlu: "Spunem ce nu știm", desc: "Nu testăm codurile în coș. Arătăm de unde vine fiecare ofertă și până când e valabilă, ca să știi la ce să te aștepți." },
  { emoji: "🔒", titlu: "Fără costuri ascunse", desc: "Folosirea codurilor este 100% gratuită. Noi câștigăm un comision mic de la magazine." },
  { emoji: "📱", titlu: "Mobile-friendly", desc: "Site-ul funcționează perfect pe orice dispozitiv — telefon, tabletă sau desktop." },
  { emoji: "🇷🇴", titlu: "Focus România", desc: "Scoatem automat programele de afiliere care nu acoperă România." },
];

export default function DespreNoiPage() {
  return (
    <div className="min-h-screen bg-[#06080b]">
      <header className="bg-[#06080b] border-b border-[#1f2329]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-[#ddf93c] text-[#0c1000] font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-[#ffffff] text-xl">Cupon</span>
            <span className="text-[#ddf93c] font-black text-xl">.ro</span>
          </Link>
          <span className="text-[#9399a0]">/</span>
          <span className="text-sm font-semibold text-[#c9ced5]">Despre noi</span>
        </div>
      </header>

      {/* HERO */}
      <div className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden py-16 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(13,148,136,0.15) 0%, transparent 65%)" }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-4 text-[#ffffff]">
            Despre <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>AmCupon.ro</span>
          </h1>
          <p className="text-[#c9ced5] text-base md:text-lg leading-relaxed">
            AmCupon.ro adună codurile de reducere și ofertele active de la{" "}
            <strong className="text-[#ffffff]">{pesteMagazine()} partenere</strong>, actualizate automat
            de mai multe ori pe zi — complet gratuit.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        {/* CE FACEM */}
        <section>
          <h2 className="text-2xl font-black text-[#ffffff] mb-4">Ce face AmCupon.ro?</h2>
          <div className="bg-[#14181c] rounded-xl border border-[#1f2329] p-8 shadow-sm">
            <p className="text-[#c9ced5] leading-relaxed mb-4">
              AmCupon.ro este o platformă de agregare a ofertelor afiliate. Funcționăm ca intermediar
              între tine și magazinele online: preluăm automat, de trei ori pe zi, promoțiile active de la
              partenerii noștri din rețelele <strong>{reteleAfiliere()}</strong> și le afișăm centralizat, ușor de găsit.
            </p>
            <p className="text-[#c9ced5] leading-relaxed mb-4">
              Atunci când cumperi printr-un link de pe AmCupon.ro, magazinul ne plătește un comision mic
              din bugetul lor de marketing. <strong>Tu nu plătești nimic în plus</strong> — dimpotrivă,
              beneficiezi de codul de reducere care scade prețul final.
            </p>
            <p className="text-[#c9ced5] leading-relaxed">
              Misiunea noastră este simplă: să te ajutăm să economisești la fiecare cumpărătură online,
              fără să pierzi timp căutând pe zeci de site-uri.
            </p>
          </div>
        </section>

        {/* BENEFICII */}
        <section>
          <h2 className="text-2xl font-black text-[#ffffff] mb-6">De ce AmCupon.ro?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFICII.map((b) => (
              <div key={b.titlu} className="bg-[#14181c] rounded-xl border border-[#1f2329] p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{b.emoji}</div>
                <h3 className="font-black text-[#ffffff] text-base mb-2">{b.titlu}</h3>
                <p className="text-sm text-[#c9ced5] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CUM VERIFICAM */}
        <section>
          <h2 className="text-2xl font-black text-[#ffffff] mb-6">Cum alegem și actualizăm ofertele?</h2>
          <p className="text-[#c9ced5] mb-8 leading-relaxed">
            Procesul automat preia ofertele de la rețelele de afiliere de trei ori pe zi și le scoate pe
            cele expirate după data lor. Codurile nu le testăm în coș, iar validitatea finală depinde de
            magazinul partener — vezi{" "}
            <Link href="/termeni" className="text-[#ddf93c] hover:text-[#c3dd2c] underline">Termenii și condițiile</Link>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PASI.map((p) => (
              <div key={p.nr} className="bg-[#14181c] rounded-xl border border-[#1f2329] p-6 shadow-sm flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#ddf93c] text-[#0c1000] font-black text-lg flex items-center justify-center shrink-0">
                  {p.nr}
                </div>
                <div>
                  <h3 className="font-bold text-[#ffffff] text-sm mb-1">{p.titlu}</h3>
                  <p className="text-xs text-[#c9ced5] leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CUM FOLOSESTI */}
        <section>
          <h2 className="text-2xl font-black text-[#ffffff] mb-6">Cum folosești un cod de reducere?</h2>
          <div className="bg-[#14181c] rounded-xl border border-[#1f2329] p-8 shadow-sm">
            <div className="space-y-4">
              {[
                { step: "01", text: "Găsește magazinul dorit pe AmCupon.ro și copiază codul de reducere activ." },
                { step: "02", text: "Deschide site-ul magazinului și adaugă produsele dorite în coșul de cumpărături." },
                { step: "03", text: `La finalizarea comenzii, caută câmpul „Cod promoțional", „Voucher" sau „Cupon".` },
                { step: "04", text: `Introdu codul copiat și apasă „Aplică". Reducerea se scade automat din total.` },
                { step: "05", text: "Finalizează comanda și bucură-te de economii!" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4">
                  <span className="text-[#ddf93c] font-black text-lg w-10 shrink-0">{s.step}</span>
                  <p className="text-[#c9ced5] leading-relaxed pt-0.5">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CIFRE */}
        <section className="bg-gradient-to-r from-[#ddf93c] to-[#c3dd2c] rounded-xl p-10 text-[#0c1000] text-center">
          <h2 className="text-2xl font-black mb-8">AmCupon.ro în cifre</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { nr: `${Math.floor(numarMagazine() / 100) * 100}+`, label: "Magazine partenere" },
              { nr: "100%", label: "Gratuit pentru tine" },
              { nr: "3×", label: "Actualizări pe zi" },
              { nr: "2026", label: "An de lansare" },
            ].map((c) => (
              <div key={c.label}>
                <div className="text-3xl md:text-4xl font-black mb-1">{c.nr}</div>
                <div className="text-[#c9ced5] text-sm">{c.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section>
          <h2 className="text-2xl font-black text-[#ffffff] mb-6">Contact</h2>
          <div className="bg-[#14181c] rounded-xl border border-[#1f2329] p-8 shadow-sm">
            <p className="text-[#c9ced5] mb-4 leading-relaxed">
              Ai o întrebare despre un cod de reducere, o ofertă expirată sau dorești să colaborezi cu noi?
              Ne poți contacta oricând pe email.
            </p>
            <a href="mailto:contact@amcupon.ro"
              className="inline-flex items-center gap-2 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-bold px-6 py-3 rounded-xl transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@amcupon.ro
            </a>
          </div>
        </section>

      </div>

      <div className="max-w-5xl mx-auto px-4 pb-10 text-center">
        <Link href="/" className="text-sm text-[#9399a0] hover:text-[#ddf93c] transition-colors">
          ← Înapoi la AmCupon.ro
        </Link>
      </div>
    </div>
  );
}
