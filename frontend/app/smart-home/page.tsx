import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import MagazinCard from "../components/MagazinCard";
import NewsletterCTA from "../components/NewsletterCTA";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie, NISA_CATEGORII } from "../../lib/categoriiNisa";
import { laParteneri } from "@/lib/cifreSite";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Smart Home Romania 2026 — Ghid și Oferte de la Parteneri",
  description: "Oferte smart home 2026: becuri inteligente, prize smart, camere de supraveghere, de la magazinele partenere AmCupon. Reduceri active, actualizate zilnic.",
  keywords: ["smart home romania", "bec inteligent ieftin", "priza smart reducere", "camera supraveghere wifi", "termostat inteligent", "emag smart home", "casa inteligenta romania"],
  alternates: { canonical: "https://amcupon.ro/smart-home" },
  openGraph: { title: "Smart Home Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/smart-home", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SMART = ["evomag.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_SMART = ["electronice", "casa-gradina"];

const CATEGORII_SMART = [
  { emoji: "💡", titlu: "Becuri Inteligente", desc: "Philips Hue, IKEA TRADFRI, Tuya — control din aplicatie, 16M culori" },
  { emoji: "🔌", titlu: "Prize & Intrerupatoare Smart", desc: "Monitorizare consum, programare, control vocal Alexa/Google" },
  { emoji: "📷", titlu: "Camere Supraveghere", desc: "WiFi, detectie miscare, vedere nocturna, stocare cloud" },
  { emoji: "🌡️", titlu: "Termostate Inteligente", desc: "Tado, Honeywell — programare si control de oriunde" },
  { emoji: "🔊", titlu: "Boxe Smart", desc: "Amazon Echo, Google Nest — asistent vocal pentru toata casa" },
  { emoji: "🚪", titlu: "Siguranta Casa", desc: "Incuietori smart, senzori usa/fereastra, alarme WiFi" },
];

const CULORI_BADGE = ["bg-[#ddf93c]"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Smart Home Romania 2026","url":"https://amcupon.ro/smart-home","description":"Oferte smart home Romania 2026 — becuri, prize, camere, termostate inteligente" };

export default function SmartHomePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSmart = TOP_SMART.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restSmart = all.filter(m =>
    !TOP_SMART.includes(m.magazin) &&
    esteInCategorie(m, CAT_SMART)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 6);
  const magazine = [...topSmart, ...restSmart];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* Breadcrumb */}
        <nav className="bg-[var(--surface)]/80 backdrop-blur-sm border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasa</Link>
            <span>/</span>
            <span className="text-[var(--text-soft)] font-medium">Smart Home</span>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--background)] py-16 px-4">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/3 w-80 h-80 bg-[#ddf93c]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-[#ddf93c]/15 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#ddf93c]/20 border border-[var(--accent-text)]/30 text-[var(--accent-text)] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddf93c] animate-pulse"/>
              Casa mai inteligenta
            </div>
            <div className="text-6xl mb-5 drop-shadow-2xl">🏠</div>
            <h1 className="text-4xl md:text-5xl font-black text-[var(--foreground)] mb-4 tracking-tight">
              Smart Home Romania <span className="text-transparent bg-clip-text" style={{backgroundImage:"linear-gradient(135deg, #c3dd2c, #ddf93c)"}}>{an}</span>
            </h1>
            <p className="text-[var(--text-soft)] text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Becuri inteligente, prize smart, camere WiFi — ghid de inceput si oferte {laParteneri(NISA_CATEGORII["smart-home"])}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Alexa","Google Home","Apple HomeKit","Philips Hue","Tuya","Zigbee","Wi-Fi Direct"].map(c => (
                <span key={c} className="bg-[var(--surface-alt)] border border-[var(--border-strong)] text-[var(--text-soft)] text-xs font-semibold px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Categorii smart */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-2">CATEGORII</p>
            <h2 className="text-2xl font-black text-[var(--foreground)]">Categorii smart home populare</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORII_SMART.map((a, i) => (
              <div key={a.titlu} className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent-text)]/40 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#ddf93c]/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${CULORI_BADGE[i % CULORI_BADGE.length]}`}>{a.emoji}</div>
                  <h3 className="font-bold text-[var(--foreground)] text-sm">{a.titlu}</h3>
                </div>
                <p className="text-xs text-[var(--text-soft)] leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-1">MAGAZINE PARTENERE</p>
              <h2 className="text-xl font-black text-[var(--foreground)]">Magazine smart home, electronice si casa</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {magazine.map((m) => (
              <MagazinCard key={m.magazin} m={m} />
            ))}
          </div>
        </section>
        <NewsletterCTA />


        <NisaProduse
          merchantSlugs={[]}
          teme={["aspiratoare-robot"]}
          titlu="Aspiratoare robot de la parteneri"
          culoareAccent="indigo"
          limit={12}
        />

        {/* Ghid */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-3">GHID INCEPUT</p>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-7">Cum incepi cu Smart Home in {an}</h2>
            <div className="space-y-5">
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-base">Ecosistem: Alexa, Google Home sau Apple HomeKit?</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">Alexa (Amazon Echo) si Google Home au cele mai multe dispozitive compatibile; Apple Home merge cu iPhone. Standardul Matter face tot mai multe dispozitive compatibile cu toate trei. Verifica daca asistentul vocal accepta limba romana — multe comenzi merg doar in engleza.</p>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-3 text-base">De unde sa incepi</h3>
                <ul className="space-y-2 text-sm text-[var(--text-soft)]">
                  {[
                    ["Becuri inteligente","cel mai simplu start: Tuya sau Philips Hue"],
                    ["Priza smart","monitorizare consum, automatizare orice aparat"],
                    ["Camera WiFi","supraveghere live pe telefon de oriunde"],
                    ["Termostat","programarea incalzirii; economiile depind de casa si de cum il setezi"],
                  ].map(([bold, text]) => (
                    <li key={bold} className="flex gap-2">
                      <span className="text-[var(--accent-text)] mt-0.5 shrink-0">→</span>
                      <span><strong className="text-[var(--foreground)]">{bold}</strong> — {text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-base">Protocol: Zigbee vs WiFi vs Z-Wave</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">WiFi e cel mai simplu (conectare directa, fara hub), dar poate incarca reteaua cu multe dispozitive. Zigbee (Philips Hue, IKEA) consuma putin curent si este mai stabil, dar necesita un hub/bridge. Pentru inceput, WiFi e alegerea pragmatica.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">EXPLOREAZA SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/casa", label: "🏡 Casa & Gradina" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] border border-[var(--border-strong)] hover:border-[var(--accent-text)]/40 text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-muted)]">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-[var(--accent-text)] transition-colors">Electronice</Link>{" · "}
          <Link href="/casa" className="hover:text-[var(--accent-text)] transition-colors">Casa & Gradina</Link>{" · "}
          <Link href="/categorii" className="hover:text-[var(--accent-text)] transition-colors">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
