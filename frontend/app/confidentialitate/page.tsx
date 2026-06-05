import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politică de Confidențialitate | AmCupon.ro",
  description: "Politica de confidențialitate AmCupon.ro — cum colectăm, folosim și protejăm datele tale personale conform GDPR.",
};

export default function ConfidentialitatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-gray-900 text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </Link>
          <span className="text-gray-300 mx-1">/</span>
          <span className="text-sm font-semibold text-gray-600">Politică de Confidențialitate</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Politică de Confidențialitate</h1>
        <p className="text-sm text-gray-400 mb-8">Ultima actualizare: Mai 2026 · Conform GDPR (Regulamentul UE 2016/679)</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">1. Cine suntem (Operatorul de date)</h2>
            <p>
              <strong>AmCupon.ro</strong> este o platformă de agregare a codurilor de reducere și ofertelor afiliate din România,
              operată prin platforma de afiliere <strong>2Performant</strong>.
            </p>
            <p className="mt-2">
              <strong>Contact:</strong>{" "}
              <a href="mailto:contact@amcupon.ro" className="text-orange-500 hover:underline">contact@amcupon.ro</a>
              <br />
              <strong>Website:</strong> https://amcupon.ro
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">2. Ce date colectăm</h2>
            <p className="mb-3">AmCupon.ro nu solicită crearea unui cont și nu colectează date personale identificabile în mod direct. Datele tehnice colectate automat includ:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Date de navigare anonime:</strong> paginile vizitate, durata sesiunii, tipul dispozitivului, țara de origine — colectate prin Vercel Analytics în mod agregat și anonim.</li>
              <li><strong>Adresa IP:</strong> prelucrată temporar de serverele Vercel pentru furnizarea serviciului; nu este stocată pe termen lung.</li>
              <li><strong>Cookie-uri tehnice:</strong> necesare funcționării site-ului (ex: preferința dark/light mode, magazinele favorite, consimțământul cookie).</li>
              <li><strong>Cookie-uri de tracking afiliat:</strong> setate de platforma 2Performant pentru atribuirea comisioanelor, <em>doar dacă ai acceptat cookie-urile</em>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">3. Scopul prelucrării datelor</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-bold">Date</th>
                  <th className="text-left p-3 border border-gray-200 font-bold">Scop</th>
                  <th className="text-left p-3 border border-gray-200 font-bold">Temei legal</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Date de navigare anonime", "Îmbunătățirea site-ului, înțelegerea comportamentului utilizatorilor", "Interes legitim (GDPR Art. 6(1)(f))"],
                  ["Cookie-uri tehnice", "Funcționarea corectă a site-ului, salvarea preferințelor", "Necesitate contractuală (GDPR Art. 6(1)(b))"],
                  ["Cookie-uri 2Performant", "Atribuirea comisioanelor afiliate la cumpărăturile efectuate", "Consimțământ (GDPR Art. 6(1)(a))"],
                  ["Adresa de email (dacă ne contactezi)", "Răspunsul la solicitări și suport", "Consimțământ (GDPR Art. 6(1)(a))"],
                ].map(([d, s, t]) => (
                  <tr key={d} className="border-b border-gray-100">
                    <td className="p-3 border border-gray-200 font-medium">{d}</td>
                    <td className="p-3 border border-gray-200">{s}</td>
                    <td className="p-3 border border-gray-200 text-xs text-gray-500">{t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">4. Durata stocării datelor</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Date Analytics Vercel:</strong> maxim 30 de zile, în mod agregat și anonim</li>
              <li><strong>Cookie-uri tehnice (localStorage):</strong> până la ștergerea manuală de către utilizator sau expirarea browserului</li>
              <li><strong>Cookie-uri 2Performant:</strong> conform politicii 2Performant (de obicei 30-90 de zile)</li>
              <li><strong>Emailuri de suport:</strong> maxim 2 ani de la ultima comunicare</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">5. Destinatarii datelor (cui le transmitem)</h2>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Vercel Inc.</strong> (SUA) — furnizor de hosting și analytics; operează sub Privacy Shield / Clauze Contractuale Standard UE</li>
              <li><strong>2Performant Network SRL</strong> (România, București) — platforma de afiliere prin care funcționăm</li>
              <li><strong>Nu vindem</strong> și nu transferăm datele tale către terți în scop publicitar</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">6. Drepturile tale (GDPR)</h2>
            <p className="mb-3">Conform GDPR, ai următoarele drepturi în legătură cu datele tale personale:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Dreptul de acces</strong> — poți solicita o copie a datelor pe care le deținem despre tine</li>
              <li><strong>Dreptul la rectificare</strong> — poți corecta datele inexacte</li>
              <li><strong>Dreptul la ștergere</strong> (dreptul de a fi uitat) — poți solicita ștergerea datelor</li>
              <li><strong>Dreptul la restricționarea prelucrării</strong> — poți limita modul în care folosim datele tale</li>
              <li><strong>Dreptul la portabilitate</strong> — poți primi datele într-un format structurat</li>
              <li><strong>Dreptul de opoziție</strong> — poți obiecta față de prelucrarea bazată pe interes legitim</li>
              <li><strong>Dreptul de a retrage consimțământul</strong> — în orice moment, fără a afecta prelucrările anterioare</li>
            </ul>
            <p className="mt-3">
              Pentru exercitarea acestor drepturi, contactează-ne la:{" "}
              <a href="mailto:contact@amcupon.ro" className="text-orange-500 hover:underline">contact@amcupon.ro</a>.
              Răspundem în maxim <strong>30 de zile</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">7. Cookie-uri</h2>
            <p className="mb-3">Site-ul folosește următoarele tipuri de cookie-uri:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Cookie-uri strict necesare:</strong> salvarea preferințelor (temă, favorite, consimțământ) în localStorage — nu necesită consimțământ</li>
              <li><strong>Cookie-uri de analiză:</strong> Vercel Analytics — anonime, activate la consimțământ</li>
              <li><strong>Cookie-uri de afiliere:</strong> 2Performant tracking — activate doar la acceptarea cookie-urilor</li>
            </ul>
            <p className="mt-3">Poți gestiona preferințele cookie prin bannerul afișat la prima vizită sau din setările browserului.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">8. Securitatea datelor</h2>
            <p>
              Site-ul funcționează exclusiv prin HTTPS (conexiune criptată). Nu stocăm parole, date de card sau date
              financiare. Infrastructura este găzduită pe Vercel, care respectă standardele SOC 2 Type 2.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">9. Plângeri și autoritate de supraveghere</h2>
            <p>
              Dacă consideri că drepturile tale au fost încălcate, poți depune o plângere la:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>
                <strong>ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal):{" "}
                <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                  www.dataprotection.ro
                </a>
              </li>
              <li>
                <strong>ANPC:</strong>{" "}
                <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                  anpc.ro
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">10. Modificări ale acestei politici</h2>
            <p>
              Ne rezervăm dreptul de a actualiza această politică. Modificările importante vor fi anunțate
              prin actualizarea datei din antetul acestei pagini. Continuarea utilizării site-ului după
              modificări constituie acceptarea noii politici.
            </p>
          </section>

        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-orange-500 transition-colors">
            ← Înapoi la AmCupon.ro
          </Link>
        </div>
      </div>
    </div>
  );
}
