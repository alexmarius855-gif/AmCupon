import { Metadata } from "next";
import Link from "next/link";
import { linkPlatit } from "@/lib/linkPlatit";

export const metadata: Metadata = {
  title: "Cele mai bune AI Tools 2026 — ghid complet pentru creatori",
  description:
    "16 unelte AI pentru text, video, voce, SEO și design: ce face fiecare și pentru cine e potrivită — Copy.ai, InVideo, ElevenLabs, Canva, Semrush și altele.",
  keywords: [
    "cele mai bune ai tools 2026",
    "unelte ai romania",
    "ai pentru video",
    "ai copywriting romana",
    "ai voce romaneasca",
    "canva pro reducere",
  ],
  alternates: { canonical: "https://amcupon.ro/ai-tools" },
  openGraph: {
    title: "Cele mai bune AI Tools 2026 — ghid pentru creatori | AmCupon.ro",
    description: "16 unelte AI pentru text, video, voce, SEO și design. Ce fac și pentru cine sunt potrivite.",
    url: "https://amcupon.ro/ai-tools",
    siteName: "AmCupon.ro",
    locale: "ro_RO",
    type: "website",
  },
};

interface Tool {
  name: string; emoji: string; cat: string; face: string;
  ideal: string; url: string;
}

const TOOLS: Tool[] = [
  { name: "Copy.ai", emoji: "✍️", cat: "Text & Copywriting", face: "Generează articole, descrieri de produs și texte de marketing cu AI, în zeci de limbi.", ideal: "Bloggeri, copywriteri, marketeri", url: "https://www.copy.ai" },
  { name: "Jasper AI", emoji: "🤖", cat: "Text & Copywriting", face: "Scriere AI avansată pentru articole lungi, campanii și conținut de brand.", ideal: "Agenții de conținut, echipe marketing", url: "https://www.jasper.ai" },
  { name: "Writesonic", emoji: "📝", cat: "Text & Copywriting", face: "Articole SEO, postări sociale și texte scurte generate rapid.", ideal: "SEO freelanceri, creatori", url: "https://writesonic.com" },
  { name: "InVideo AI", emoji: "🎬", cat: "Video AI", face: "Transformă un text într-un video montat automat, cu voce și subtitrări.", ideal: "YouTube, TikTok, social media", url: "https://invideo.io" },
  { name: "Synthesia", emoji: "🎭", cat: "Video AI", face: "Video cu prezentatori AI realiști din simplu text — fără cameră.", ideal: "eLearning, training corporate", url: "https://www.synthesia.io" },
  { name: "Pictory AI", emoji: "✂️", cat: "Video AI", face: "Taie clipuri scurte din video lungi și adaugă subtitrări automat.", ideal: "YouTuberi, creatori short-form", url: "https://pictory.ai" },
  { name: "Descript", emoji: "🎞️", cat: "Video AI", face: "Editezi video și podcast ca pe un document text — scoți cuvinte, editezi audio.", ideal: "Podcasteri, video editori", url: "https://www.descript.com" },
  { name: "ElevenLabs", emoji: "🎙️", cat: "Voce AI", face: "Voce AI naturală și clonare de voce, inclusiv în română.", ideal: "Podcasteri, YouTuberi, dublaj", url: "https://elevenlabs.io" },
  { name: "Murf AI", emoji: "🔊", cat: "Voce AI", face: "Voci AI profesionale pentru prezentări, cursuri și reclame.", ideal: "Instructori online, prezentatori", url: "https://murf.ai" },
  { name: "Semrush", emoji: "📈", cat: "SEO & Marketing", face: "Cercetare cuvinte cheie, audit site și analiza concurenței.", ideal: "SEO, consultanți, webmasteri", url: "https://www.semrush.com" },
  { name: "Surfer SEO", emoji: "🏄", cat: "SEO & Marketing", face: "Optimizează articolele pe cuvinte cheie ca să rankeze mai sus în Google.", ideal: "Bloggeri SEO, agenții", url: "https://surferseo.com" },
  { name: "Frase.io", emoji: "🔍", cat: "SEO & Marketing", face: "Cercetare + scriere de conținut SEO asistată de AI, într-un singur loc.", ideal: "Editori de conținut, freelanceri", url: "https://www.frase.io" },
  { name: "HubSpot", emoji: "🏆", cat: "CRM & Business", face: "CRM și marketing all-in-one: email, automatizări, pipeline de vânzări.", ideal: "B2B, consultanți, IMM-uri", url: "https://www.hubspot.com" },
  { name: "LiveChat", emoji: "💬", cat: "CRM & Business", face: "Chat live + AI pentru suport clienți pe magazinul tău online.", ideal: "eCommerce, echipe suport", url: "https://www.livechat.com" },
  { name: "Canva Pro", emoji: "🎨", cat: "Design AI", face: "Design grafic simplu cu AI: postări, prezentări, materiale de marketing.", ideal: "Orice creator de conținut vizual", url: "https://www.canva.com" },
  { name: "Wegic", emoji: "🪄", cat: "Website AI", face: "Construiești un site web complet vorbind cu un AI, fără cod.", ideal: "Antreprenori, freelanceri", url: "https://wegic.ai" },
];

const CATS = ["Text & Copywriting", "Video AI", "Voce AI", "SEO & Marketing", "CRM & Business", "Design AI", "Website AI"];

const FAQ = [
  { q: "Care e cel mai bun AI tool pentru text?", a: "Pentru articole lungi și conținut de brand, Jasper și Copy.ai sunt gândite pentru echipe de marketing; pentru texte scurte, Writesonic. Încearcă întâi varianta gratuită sau perioada de probă, acolo unde există." },
  { q: "Ce AI folosesc pentru video fără să apar pe cameră?", a: "Synthesia creează video cu un prezentator AI realist din simplu text. InVideo AI montează automat un video complet dintr-un script, cu voce și subtitrări. Ambele se folosesc pentru cursuri și prezentări fără filmare; pe YouTube, verifică întâi regulile de monetizare pentru conținutul generat automat." },
  { q: "Există AI cu voce în română?", a: "Da. ElevenLabs are voci AI și în română, plus un plan gratuit pentru început. Murf AI are voci pentru prezentări și reclame." },
  { q: "Cum economisesc la abonamentele AI?", a: "Multe au un plan gratuit sau o perioadă de probă — începe cu ele. Pentru planurile plătite, abonamentul anual e de obicei mai ieftin decât cel lunar, iar reducerile apar frecvent de Black Friday. Verifică pe AmCupon.ro înainte de cumpărare." },
];

export default function AiToolsPage() {
  return (
    <div className="min-h-screen bg-[#06080b]">
      {/* Hero */}
      <section className="relative bg-[#06080b] border-b border-[#1f2329] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(13,148,136,0.10) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-10 text-center">
          <nav className="flex justify-center gap-2 text-xs text-[#9399a0] mb-8">
            <Link href="/" className="hover:text-[#c9ced5]">AmCupon.ro</Link>
            <span>/</span>
            <span className="text-[#c9ced5]">AI Tools</span>
          </nav>
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-4xl md:text-5xl font-black text-[#ffffff] mb-4">
            Cele mai bune <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #c3dd2c, #ddf93c)" }}>AI Tools</span> 2026
          </h1>
          <p className="text-[#c9ced5] text-lg max-w-2xl mx-auto mb-6">
            16 unelte AI pentru text, video, voce, SEO și design: ce face fiecare și pentru cine e potrivită. Prețurile se schimbă des — le vezi actualizate pe site-ul fiecăreia.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#c9ced5]">
            <span className="flex items-center gap-1.5"><span className="text-[#ddf93c]">✓</span> Ce face fiecare</span>
            <span className="flex items-center gap-1.5"><span className="text-[#ddf93c]">✓</span> Pentru cine e potrivită</span>
            <span className="flex items-center gap-1.5"><span className="text-[#ddf93c]">✓</span> Revizuit în octombrie 2026</span>
          </div>
        </div>
      </section>

      {/* Grid pe categorii */}
      {CATS.map((cat) => {
        const items = TOOLS.filter((t) => t.cat === cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="max-w-5xl mx-auto px-4 py-8 border-b border-[#1f2329]">
            <h2 className="text-xl font-black text-[#ffffff] mb-5">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((t) => (
                <div key={t.name} className="bg-[#14181c] border border-[#1f2329] hover:border-[#ddf93c]/40 rounded-xl p-5 flex flex-col transition-all hover:-translate-y-0.5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{t.emoji}</span>
                    <span className="font-black text-[#ffffff] text-lg">{t.name}</span>
                  </div>
                  <p className="text-sm text-[#c9ced5] flex-1 leading-relaxed">{t.face}</p>
                  <div className="mt-4 space-y-1.5 text-xs">
                    <p className="text-[#c9ced5]"><span className="text-[#9399a0]">Ideal pentru:</span> {t.ideal}</p>
                  </div>
                  <a href={linkPlatit(t.url)} target="_blank" rel="sponsored noopener noreferrer"
                    className="mt-4 bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] text-sm font-bold py-2.5 rounded-xl text-center transition-all">
                    Încearcă {t.name} →
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-10 border-t border-[#1f2329]">
        <h2 className="text-2xl font-black text-[#ffffff] mb-6">Întrebări frecvente</h2>
        <div className="space-y-4">
          {FAQ.map((item, i) => (
            <div key={i} className="bg-[#14181c] border border-[#1f2329] rounded-xl p-5">
              <h3 className="font-bold text-[#ffffff] mb-2">{item.q}</h3>
              <p className="text-[#c9ced5] text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="rounded-xl p-8 text-center border border-[#c3dd2c]/25" style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.10), rgba(20,184,166,0.04))" }}>
          <div className="text-4xl mb-3">🎁</div>
          <h2 className="text-2xl font-black text-[#ffffff] mb-3">Vezi toate ofertele la software</h2>
          <p className="text-[#c9ced5] mb-6 text-sm max-w-xl mx-auto">
            Coduri și reduceri la unelte AI, hosting, VPN și software de business, pe AmCupon.
          </p>
          <Link href="/software-business" className="inline-block bg-[#ddf93c] hover:bg-[#ddf93c] text-[#0c1000] font-black px-7 py-3 rounded-xl text-sm transition-all">
            Software cu reduceri →
          </Link>
        </div>
      </section>
    </div>
  );
}
