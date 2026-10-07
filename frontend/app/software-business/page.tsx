import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import { linkPlatit } from "@/lib/linkPlatit";

export const metadata: Metadata = {
  title: "Software Business 2026 — Unelte SaaS pentru Firme",
  description: "Unelte software pentru firme — SEO, design, email marketing, productivitate, securitate — și partenerii AmCupon din categoria software, cu ofertele lor active.",
  keywords: ["software facturare reducere", "facturis-online reducere", "saas romania reducere", "tools business reducere", "semrush reducere", "canva pro reducere"],
  alternates: { canonical: "https://amcupon.ro/software-business" },
  openGraph: { title: "Software Business 2026 | AmCupon.ro", url: "https://amcupon.ro/software-business", siteName: "AmCupon.ro", locale: "ro_RO", type: "website" },
};

// Adresele oficiale (sau linkul de afiliat dat de retea); linkPlatit() ia linkul platit din output.json.
// 07.10.2026: fara preturi scrise de mana — se schimba, iar pagina nu afla.
const TOOLS_INTL = [
  {
    categ: "Marketplace SaaS Deals",
    items: [
      { name: "AppSumo", desc: "Marketplace de oferte lifetime la unelte SaaS: plătești o dată și primești acces pe viață la planul cumpărat.", badge: "Oferte lifetime", url: "https://appsumo.com" },
    ],
  },
  {
    categ: "SEO & Marketing",
    items: [
      { name: "Semrush", desc: "Unealtă SEO completă: cercetare de cuvinte, audit de site, analiza concurenței.", badge: "SEO all-in-one", url: "https://www.semrush.com" },
      { name: "Canva Pro", desc: "Design online pentru social media, prezentări și materiale de marketing.", badge: "Design online", url: "https://www.canva.com" },
      { name: "GetResponse", desc: "Platformă de email marketing: newslettere, automatizări, landing pages și webinarii.", badge: "Email marketing", url: "https://www.awin1.com/cread.php?awinmid=3142111&awinaffid=101829567&clickref=" },
    ],
  },
  {
    categ: "Productivitate & Colaborare",
    items: [
      { name: "Notion", desc: "Spațiu de lucru: notițe, baze de date, managementul proiectelor, wiki intern.", badge: "Productivitate", url: "https://www.notion.so" },
      { name: "Grammarly", desc: "Corectură de gramatică și stil pentru textele în engleză.", badge: "Scriere în engleză", url: "https://www.grammarly.com" },
    ],
  },
  {
    categ: "Securitate & Utilitare PC",
    items: [
      { name: "NordPass", desc: "Manager de parole de la firma care face NordVPN: stocare criptată, autocompletare, alerte la scurgeri de date.", badge: "Parole & securitate", url: "https://www.awin1.com/cread.php?awinmid=5324242&awinaffid=101829567&clickref=" },
      { name: "Abelssoft", desc: "Utilitare pentru Windows: curățare, backup, dezinstalare completă, protecția datelor.", badge: "Utilitare PC", url: "https://www.awin1.com/cread.php?awinmid=6260179&awinaffid=101829567&clickref=" },
      { name: "O&O Software", desc: "Utilitare germane pentru Windows: defragmentare, ștergere sigură, backup și migrarea sistemului.", badge: "Optimizare Windows", url: "https://www.awin1.com/cread.php?awinmid=2381550&awinaffid=101829567&clickref=" },
    ],
  },
];

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Mag {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

const MAX_PARTENERI = 12;

export default function SoftwareBusinessPage() {
  const allMag: Mag[] = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "public", "output.json"), "utf-8")
  );

  // Partenerii din categoria software (potrivire EXACTA pe slug): intai cei cu oferta activa.
  const software = allMag
    .filter(m => m.categorie_slug === "software")
    .sort((a, b) => (b.are_promotie ? 1 : 0) - (a.are_promotie ? 1 : 0) || (b.scor_final || 0) - (a.scor_final || 0));
  const parteneri = software.slice(0, MAX_PARTENERI);

  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.10) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <Link href="/servicii" className="hover:text-[#c9ced5]">Servicii</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">Software Business</span>
          </nav>
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Software pentru <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>Business</span>
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto">
            Unelte SaaS pentru firme — SEO, design, email marketing, productivitate, securitate — și partenerii AmCupon din categoria software, cu ofertele lor active.
          </p>
        </div>
      </section>

      {/* Parteneri din categoria software */}
      {parteneri.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 className="text-xl font-black text-[#ffffff]">Parteneri AmCupon din categoria software</h2>
            {software.length > MAX_PARTENERI && (
              <Link href="/categorii/software" className="text-xs font-bold text-[#ddf93c] hover:text-[#c3dd2c] shrink-0">
                Toți cei {software.length} →
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {parteneri.map(m => <MagazinCard key={m.magazin} m={m} />)}
          </div>
        </section>
      )}

      {/* Tools internationale */}
      {TOOLS_INTL.map(group => (
        <section key={group.categ} className="max-w-5xl mx-auto px-4 py-6 border-t border-[#1f2329]">
          <h2 className="text-xl font-black text-[#ffffff] mb-5">{group.categ} — International</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.items.map(item => (
              <div key={item.name} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/20 rounded-xl p-5 flex flex-col gap-3 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-black text-[#ffffff]">{item.name}</span>
                    <span className="text-[10px] bg-[#ddf93c]/10 text-[#ddf93c] border border-[#ddf93c]/30 px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                  </div>
                  <p className="text-xs text-[#c9ced5]">{item.desc}</p>
                </div>
                <a href={linkPlatit(item.url)} target="_blank" rel="sponsored noopener noreferrer"
                  className="mt-auto bg-[#ddf93c] hover:bg-[#c3dd2c] text-[#0c1000] text-sm font-bold py-2.5 rounded-lg text-center transition-all hover:-translate-y-0.5">
                  Încearcă {item.name} →
                </a>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="max-w-5xl mx-auto px-4 pb-8">
        <p className="text-[#9399a0] text-xs text-center">Unele linkuri sunt linkuri de afiliat. AmCupon.ro primește un comision dacă faci o achiziție, fără cost suplimentar pentru tine. Prețurile și condițiile le vezi pe site-ul fiecărui serviciu.</p>
      </div>
    </div>
  );
}
