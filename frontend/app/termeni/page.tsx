import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții | AmCupon.ro",
  description: "Termenii și condițiile de utilizare ale platformei AmCupon.ro — coduri de reducere și oferte afiliate din România.",
};

export default function TermeniPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="bg-indigo-600 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-indigo-400 font-black text-xl">.ro</span>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-white mb-2">Termeni și Condiții</h1>
        <p className="text-sm text-slate-500 mb-8">Ultima actualizare: Mai 2026</p>

        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 space-y-8 text-slate-300 leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-white mb-3">1. Despre AmCupon.ro</h2>
            <p>
              AmCupon.ro este o platformă online care agregă și afișează coduri de reducere, promoții și oferte
              de la magazine partenere din România. Site-ul funcționează ca intermediar afiliat — atunci când
              accesezi un magazin prin linkurile noastre și efectuezi o achiziție, primim un comision de la
              magazin, fără niciun cost suplimentar pentru tine.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white mb-3">2. Linkuri de afiliere</h2>
            <p>
              Toate linkurile către magazinele partenere sunt linkuri de afiliat generate prin platforma
              2Performant (2performant.com). Prin utilizarea acestor linkuri, ești de acord să fii redirecționat
              prin sistemul lor de tracking. Comisionul primit nu afectează prețul sau calitatea produselor
              pe care le achiziționezi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white mb-3">3. Valabilitatea codurilor de reducere</h2>
            <p>
              AmCupon.ro încearcă să mențină toate codurile și ofertele actualizate. Cu toate acestea,
              nu garantăm că toate codurile sunt funcționale în momentul utilizării. Valabilitatea
              promoțiilor este stabilită exclusiv de magazinele partenere și poate fi modificată fără
              notificare prealabilă. Verifică întotdeauna condițiile de pe site-ul magazinului înainte
              de a finaliza o comandă.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white mb-3">4. Protecția datelor (GDPR)</h2>
            <p className="mb-3">
              AmCupon.ro respectă Regulamentul General privind Protecția Datelor (GDPR - UE 2016/679).
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Nu colectăm date personale fără consimțământul tău explicit.</li>
              <li>Formularul de newsletter colectează doar adresa de email, cu scopul trimiterii de oferte. Te poți dezabona oricând.</li>
              <li>Nu vindem și nu transmitem datele tale unor terțe părți în scop comercial.</li>
              <li>Folosim cookie-uri de analiză (Vercel Analytics) pentru a înțelege cum este utilizat site-ul, fără a identifica utilizatori individuali.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-white mb-3">5. Cookie-uri</h2>
            <p>
              Site-ul folosește cookie-uri tehnice necesare funcționării și cookie-uri de analiză anonimă
              (Vercel Analytics). Nu folosim cookie-uri de marketing sau tracking individual.
              Poți dezactiva cookie-urile din setările browserului tău, dar unele funcționalități
              ale site-ului pot fi afectate.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white mb-3">6. Răspundere</h2>
            <p>
              AmCupon.ro nu este responsabil pentru calitatea produselor, politica de returnare,
              livrare sau orice altă problemă apărută în urma achizițiilor efectuate la magazinele
              partenere. Orice litigiu cu un magazin trebuie rezolvat direct cu acesta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white mb-3">7. Contact</h2>
            <p>
              Pentru orice întrebare legată de acești termeni sau de datele tale personale,
              ne poți contacta la:{" "}
              <a href="mailto:contact@amcupon.ro" className="text-indigo-400 hover:underline">
                contact@amcupon.ro
              </a>
            </p>
          </section>

        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors">
            ← Înapoi la AmCupon.ro
          </Link>
        </div>
      </div>
    </div>
  );
}
