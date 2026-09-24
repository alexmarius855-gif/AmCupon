import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";

/**
 * Pagina extensiei Chrome.
 *
 * 24.09.2026, rescrisa: pagina spunea „E in review la Google chiar acum" (extensia n-a fost trimisa
 * niciodata — draft din 26.05), promitea „un cod exclusiv" la lansare (nu exista niciunul) si lista
 * eMAG, Altex, IKEA, Fashion Days si „1000+ magazine" — magazine fara program de afiliere la noi, pe
 * care extensia n-ar fi aratat nimic. Acum lista vine din acelasi fisier ca extensia
 * (public/extensie.json, scripts/genereaza_extensie.py), deci nu poate promite mai mult decat face.
 * Fara JSON-LD SoftwareApplication pana nu se poate instala: n-are rost sa descriem lui Google o
 * aplicatie pe care nimeni n-o poate descarca.
 */

export const metadata: Metadata = {
  title: "Extensia Chrome AmCupon | AmCupon.ro",
  description: "Extensia Chrome AmCupon îți arată ofertele și codurile active pentru magazinul pe care îl vizitezi. Nu e încă publicată: lasă-ți emailul și te anunțăm.",
  alternates: { canonical: "https://amcupon.ro/extensie" },
  openGraph: {
    title: "Extensia Chrome AmCupon",
    url: "https://amcupon.ro/extensie",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
    images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }],
  },
};

interface MagazinExtensie { nume: string; oferte: { cod: string }[] }

function loadMagazine(): [string, MagazinExtensie][] {
  try {
    const d = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", "extensie.json"), "utf-8"));
    return Object.entries((d.magazine || {}) as Record<string, MagazinExtensie>);
  } catch {
    return [];
  }
}

const PASII = [
  { nr: "1", titlu: "Instalezi extensia", desc: "Când e publicată, o adaugi în Chrome dintr-un clic. Nu cere cont.", icon: "⬇️" },
  { nr: "2", titlu: "Deschizi un magazin", desc: "Mergi pe site-ul magazinului, cum faci de obicei.", icon: "🛒" },
  { nr: "3", titlu: "Apeși pe iconiță", desc: "Vezi ofertele și codurile active acum. Dacă nu e niciuna, îți spune.", icon: "🎟" },
  { nr: "4", titlu: "Copiezi codul", desc: "Îl lipești la finalizarea comenzii, în câmpul pentru cod.", icon: "✂️" },
];

const FEATURES = [
  { icon: "🎯", titlu: "Doar ce e activ", desc: "Nu arată oferte expirate și nu inventează reduceri unde nu sunt." },
  { icon: "🔒", titlu: "Privat", desc: "Citește adresa tab-ului doar când deschizi extensia. Nu urmărește navigarea." },
  { icon: "🔄", titlu: "Actualizat", desc: "Ofertele se actualizează de trei ori pe zi, din rețelele de afiliere." },
  { icon: "🤝", titlu: "Spus deschis", desc: "Butoanele spre magazine sunt linkuri de afiliere, iar extensia scrie asta lângă ele." },
  { icon: "🆓", titlu: "Gratuit", desc: "Nu plătești nimic. Comisionul, când există, îl plătește magazinul." },
  { icon: "🧪", titlu: "Fără promisiuni", desc: "Nu testăm fiecare cod în coș. Dacă unul nu merge, spune-ne." },
];

export default function ExtensiePage() {
  const magazine = loadMagazine();
  // Magazinele romanesti intai, apoi cele cu cod: sunt cele pe care le cauta cititorul de aici.
  const exemple = magazine
    .slice()
    .sort(([a, x], [b, y]) =>
      Number(b.endsWith(".ro")) - Number(a.endsWith(".ro")) ||
      Number(y.oferte.some((o) => o.cod)) - Number(x.oferte.some((o) => o.cod)) ||
      a.localeCompare(b))
    .slice(0, 18);

  return (
    <div className="min-h-screen bg-[#06080b]">

      <nav className="bg-[#06080b] border-b border-[#1f2329]">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-[#9399a0]">
          <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>
          <span className="mx-1">/</span>
          <span className="text-[#c9ced5] font-medium">Extensie Chrome</span>
        </div>
      </nav>

      {/* HERO — fundal lime plin, deci textul e inchis */}
      <section className="bg-gradient-to-br from-[#c3dd2c] via-[#ddf93c] to-[#c3dd2c] text-[#0c1000] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#0c1000]/10 border border-[#0c1000]/20 text-[#0c1000] text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            Nu e încă publicată
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            Ofertele active,<br />pe magazinul pe care ești
          </h1>
          <p className="text-[#2a2f10] text-lg mb-8 max-w-xl mx-auto">
            Extensia AmCupon îți arată ofertele și codurile active pentru magazinul deschis în tab.
            Încă n-am trimis-o la Google. Lasă-ți emailul și îți scriem când o poți instala.
          </p>
          <Link href="/newsletter"
            className="inline-flex items-center gap-3 bg-[#0c1000] text-[#ddf93c] font-black px-8 py-4 rounded-xl text-base transition-colors hover:bg-[#1f2329]">
            📬 Anunță-mă când e disponibilă
          </Link>
        </div>
      </section>

      {/* CUM FUNCTIONEAZA */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-[#ffffff] mb-10 text-center">Cum funcționează</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PASII.map((p) => (
            <div key={p.nr} className="text-center">
              <div className="w-14 h-14 bg-[#14181c] border-2 border-[#1f2329] rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">
                {p.icon}
              </div>
              <div className="text-xs font-black text-[#ddf93c] mb-1">PAS {p.nr}</div>
              <h3 className="font-black text-[#ffffff] text-sm mb-2">{p.titlu}</h3>
              <p className="text-xs text-[#c9ced5] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-[#14181c] border-y border-[#1f2329] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-black text-[#ffffff] mb-10 text-center">Ce face, și ce nu face</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.titlu} className="bg-[#06080b] rounded-xl border border-[#1f2329] p-5 flex items-start gap-4">
                <div className="text-2xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-[#ffffff] text-sm mb-1">{f.titlu}</h3>
                  <p className="text-xs text-[#c9ced5]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAGAZINE CU OFERTA ACUM — din acelasi fisier ca extensia */}
      {magazine.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-black text-[#ffffff] mb-4 text-center">
            Azi ar arăta oferte la {magazine.length}
            {magazine.length % 100 >= 20 || magazine.length % 100 === 0 ? " de" : ""} magazine
          </h2>
          <p className="text-center text-[#c9ced5] text-sm mb-8">
            Lista se schimbă de trei ori pe zi, odată cu ofertele. Câteva dintre ele:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {exemple.map(([slug, m]) => (
              <Link key={slug} href={`/cod-reducere/${slug}`}
                className="bg-[#14181c] border border-[#1f2329] text-[#c9ced5] hover:text-[#ddf93c] text-sm font-semibold px-4 py-2 rounded-full">
                {m.nume}
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-[#1f2329] py-6 text-center text-xs text-[#9399a0]">
        © {new Date().getFullYear()} AmCupon.ro ·{" "}
        <Link href="/" className="hover:text-[#ddf93c]">Acasă</Link>{" · "}
        <Link href="/toate-magazinele" className="hover:text-[#ddf93c]">Magazine</Link>{" · "}
        <Link href="/categorii" className="hover:text-[#ddf93c]">Categorii</Link>
      </footer>
    </div>
  );
}
