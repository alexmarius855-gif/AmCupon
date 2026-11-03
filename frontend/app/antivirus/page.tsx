import Link from "next/link";
import { Metadata } from "next";
import OferteNisa, { AntetNisa } from "../components/OferteNisa";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";
import { esteInCategorie } from "../../lib/categoriiNisa";
import { linkPlatit } from "@/lib/linkPlatit";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Antivirus România 2026 — Bitdefender, Norton, ESET",
  description: "Antivirus pentru PC, Mac și Android în 2026: Bitdefender, Norton, ESET, Kaspersky — ce include fiecare și cum alegi pachetul potrivit.",
  keywords: ["antivirus ieftin românia", "cod reducere bitdefender", "norton reducere", "eset reducere", "kaspersky cod reducere", "antivirus 2026", "antivirus pc ieftin"],
  alternates: { canonical: "https://amcupon.ro/antivirus" },
  openGraph: { title: "Antivirus România 2026 | AmCupon.ro", url: "https://amcupon.ro/antivirus", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_ANTIVIRUS = ["bitdefender.com","norton.com","eset.com","kaspersky.com","malwarebytes.com","altex.ro"];
// Sluguri REALE din output.json — potrivire EXACTA, nu subsir (vezi lib/categoriiNisa.ts)
const CAT_AV = ["software"];

const TIPURI_PROTECTIE = [
  { emoji: "🛡️", titlu: "Antivirus PC & Mac", desc: "Protecție în timp real impotriva virușilor, ransomware, spyware" },
  { emoji: "📱", titlu: "Antivirus Android & iOS", desc: "Securitate mobila, anti-furt, VPN integrat" },
  { emoji: "👨‍👩‍👧", titlu: "Parental Control", desc: "Filtru conținut, monitorizare timp ecran pentru copii" },
  { emoji: "🔐", titlu: "Password Manager", desc: "Stocare parole securizata, autentificare biometrica" },
  { emoji: "🌐", titlu: "VPN inclus", desc: "Navigare anonima, acces conținut restricționat geografic" },
  { emoji: "🔍", titlu: "Dark Web Monitor", desc: "Alerte când datele tale apar în breach-uri" },
];

// ── LINKURI AFILIATE ── inlocuieste cu linkurile tale dupa aprobare ────────
// Bitdefender: aplica prin Impact.com (cont existent AmCupon) — app.impact.com/campaign-promo-signup/Bitdefender.brand
// Norton: direct, formular propriu — us.norton.com/affiliates
// ESET: via CJ Affiliate (cont nou necesar) — eset.com/us/business/partner/online-affiliates
// Kaspersky: via CJ Affiliate (acelasi cont CJ ca ESET) — kaspersky.com/partners/affiliate
// 07.10.2026: reclama „C_RO_Bitdefender Homepage" (385378) — cea veche (1622667, „C_NL_PremiumSecurity")
// ducea un vizitator din Romania pe o pagina in OLANDEZA (verificat in browser).
const LINK_BITDEFENDER = "https://bitdefender.f9tmep.net/c/7401119/385378/4466";
// Norton/ESET/Kaspersky: fara program afiliat activ inca → linkuri curate (fara tracking fals)
const LINK_NORTON      = "https://us.norton.com";
const LINK_ESET        = "https://www.eset.com/ro/";
const LINK_KASPERSKY   = "https://www.kaspersky.com";
// ──────────────────────────────────────────────────────────────────────────

// 07.10.2026: fara preturi scrise de mana si fara superlative; culoare = fundal + text lizibil.
const COMPARATIV = [
  { brand: "Bitdefender", highlight: "Brand românesc, cu protecție anti-ransomware", culoare: "bg-red-600 text-white", url: LINK_BITDEFENDER },
  { brand: "Norton 360", highlight: "VPN inclus în pachetele Norton 360", culoare: "bg-yellow-500 text-[#0c1000]", url: LINK_NORTON },
  { brand: "ESET NOD32", highlight: "Gândit să consume puține resurse", culoare: "bg-[#ddf93c] text-[#0c1000]", url: LINK_ESET },
  { brand: "Kaspersky", highlight: "Protecție la plăți online (Safe Money)", culoare: "bg-emerald-700 text-white", url: LINK_KASPERSKY },
];

const CULORI_BADGE = ["bg-red-600","bg-yellow-500","bg-[#ddf93c]","bg-emerald-600","bg-[#ddf93c]","bg-[#ddf93c]","bg-[#ddf93c]"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Antivirus România 2026","url":"https://amcupon.ro/antivirus","description":"Antivirus pentru PC, Mac și Android — Bitdefender, Norton, ESET, Kaspersky" };

export default function AntivirusPage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topAV = TOP_ANTIVIRUS.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restAV = all.filter(m =>
    !TOP_ANTIVIRUS.includes(m.magazin) &&
    esteInCategorie(m, CAT_AV)
  ).sort((a,b)=>(b.are_promotie?1:0)-(a.are_promotie?1:0)||(b.scor_final||0)-(a.scor_final||0)).slice(0, 8);
  const magazine = [...topAV, ...restAV];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-[var(--background)]">

        {/* Breadcrumb */}
        <nav className="bg-[var(--surface)]/80 backdrop-blur-sm border-b border-[var(--border)]">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Link href="/" className="hover:text-[var(--accent-text)] transition-colors">Acasă</Link>
            <span>/</span>
            <span className="text-[var(--text-soft)] font-medium">Antivirus</span>
          </div>
        </nav>

        {/* Hero */}
        <AntetNisa titlu={<>Antivirus România {an}</>}>Bitdefender, Norton, ESET, Kaspersky — ce include fiecare și cum alegi pachetul potrivit</AntetNisa>
        <OferteNisa magazine={magazine} titlu="Unde găsești antivirus" />
        <NisaProduse
          merchantSlugs={["bitdefender.com","norton.com","eset.com","altex.ro","pcgarage.ro"]}
          catSlug=""
          titlu="Licențe antivirus de la parteneri"
          culoareAccent="red"
          limit={8}
        />

        {/* Comparativ */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-2">COMPARATIV</p>
            <h2 className="text-2xl font-black text-[var(--foreground)]">Antivirusuri populare în România, {an}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPARATIV.map(c => (
              <a key={c.brand} href={linkPlatit(c.url)} target="_blank" rel="sponsored noopener noreferrer"
                className="block bg-[var(--surface)] border border-[var(--border)] hover:border-red-500/40 rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/10">
                <div className={`w-11 h-11 ${c.culoare} rounded-xl flex items-center justify-center font-black text-sm mb-4`}>{c.brand[0]}</div>
                <h3 className="font-black text-[var(--foreground)] text-base mb-1">{c.brand}</h3>
                <p className="text-xs text-[var(--text-soft)] mb-3">{c.highlight}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--accent-text)] font-bold text-xs">Vezi pachetele pe site →</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Tipuri protectie */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="text-center mb-8">
            <p className="text-xs font-bold text-[var(--accent-text)] uppercase tracking-widest mb-2">FUNCȚII</p>
            <h2 className="text-2xl font-black text-[var(--foreground)]">Ce include un antivirus bun</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TIPURI_PROTECTIE.map((a, i) => (
              <div key={a.titlu} className="bg-[var(--surface)] border border-[var(--border)] hover:border-red-500/30 rounded-xl p-5 transition-all duration-200">
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
        

        

        {/* Ghid */}
        <section className="bg-[var(--surface)] border-t border-[var(--border)] py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">GHID ALEGERE</p>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-7">Ce antivirus sa alegi în {an}</h2>
            <div className="space-y-5">
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-base">Bitdefender — antivirusul românesc</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">Bitdefender e o companie românească, fondată în București, cu rezultate bune constant în testele independente de detecție (AV-Test, AV-Comparatives). Pachetele diferă prin numărul de dispozitive și prin extra-uri (VPN, control parental, protecția camerei web) — compară-le pe site înainte să alegi.</p>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-base">Norton 360 — VPN inclus</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">Pachetele Norton 360 includ VPN pe lângă antivirus — util dacă folosești des rețele Wi-Fi publice.</p>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border-strong)] rounded-xl p-5">
                <h3 className="font-bold text-[var(--foreground)] mb-2 text-base">Ai nevoie de antivirus pe telefon?</h3>
                <p className="text-sm text-[var(--text-soft)] leading-relaxed">Pe Android ajută, mai ales dacă instalezi aplicații din afara Google Play. Pe iOS aplicațiile sunt mai izolate; acolo contează mai mult protecția la phishing. Multe pachete pentru mai multe dispozitive includ și telefonul.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        <section className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">EXPLOREAZĂ SI</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/vpn", label: "🌐 VPN" },
              { href: "/hosting", label: "🖥️ Hosting" },
              { href: "/software-business", label: "💼 Software" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/electronice", label: "📱 Electronice" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-[var(--surface-alt)] hover:bg-[var(--surface-high)] border border-[var(--border-strong)] hover:border-red-500/40 text-[var(--text-soft)] hover:text-[var(--foreground)] text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        
      </div>
    </>
  );
}
