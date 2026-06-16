import Link from "next/link";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import NisaProduse from "../components/NisaProduse";

interface Promotie { nume: string; cod_cupon: string; landing_page: string; zile_ramase: number; }
interface Magazin {
  magazin: string; url: string; url_afiliat: string; logo_url?: string;
  categorie: string; categorie_slug?: string; scor_final: number;
  are_promotie: boolean; cod_cupon: boolean; promotii: Promotie[]; trend: number;
}

export const metadata: Metadata = {
  title: "Smart Home Romania 2026 — Coduri Reducere eMAG, Philips Hue, Tuya | AmCupon.ro",
  description: "Cele mai bune oferte smart home Romania 2026: becuri inteligente, prize smart, camere supraveghere, termostate. Reduceri verificate zilnic la eMAG, Altex, Dedeman.",
  keywords: ["smart home romania", "bec inteligent ieftin", "priza smart reducere", "camera supraveghere wifi", "termostat inteligent", "emag smart home", "casa inteligenta romania"],
  alternates: { canonical: "https://amcupon.ro/smart-home" },
  openGraph: { title: "Smart Home Romania 2026 | AmCupon.ro", url: "https://amcupon.ro/smart-home", siteName: "AmCupon.ro", locale: "ro_RO", type: "website", images: [{ url: "https://amcupon.ro/og-image.png", width: 1200, height: 630 }] },
};

const TOP_SMART = ["emag.ro","altex.ro","dedeman.ro","flanco.ro","evomag.ro","cel.ro"];
const CAT_SMART = ["electronics","electronice","home","smart"];

const CATEGORII_SMART = [
  { emoji: "💡", titlu: "Becuri Inteligente", desc: "Philips Hue, IKEA TRADFRI, Tuya — control din aplicatie, 16M culori" },
  { emoji: "🔌", titlu: "Prize & Intrerupatoare Smart", desc: "Monitorizare consum, programare, control vocal Alexa/Google" },
  { emoji: "📷", titlu: "Camere Supraveghere", desc: "WiFi, detectie miscare, vedere nocturna, stocare cloud" },
  { emoji: "🌡️", titlu: "Termostate Inteligente", desc: "Tado, Honeywell — economie 23% la incalzire, control de oriunde" },
  { emoji: "🔊", titlu: "Boxe Smart", desc: "Amazon Echo, Google Nest — asistent vocal pentru toata casa" },
  { emoji: "🚪", titlu: "Siguranta Casa", desc: "Incuietori smart, senzori usa/fereastra, alarme WiFi" },
];

function numeAfisat(s: string) { return s.split(".")[0].replace(/-/g," ").split(" ").map(w=>w[0].toUpperCase()+w.slice(1)).join(" "); }
const CULORI = ["bg-amber-500","bg-teal-500","bg-blue-500","bg-red-500","bg-green-500","bg-purple-500"];
const jsonLd = { "@context":"https://schema.org","@type":"CollectionPage","name":"Smart Home Romania 2026","url":"https://amcupon.ro/smart-home","description":"Oferte smart home Romania 2026 — becuri, prize, camere, termostate inteligente" };

export default function SmartHomePage() {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const all: Magazin[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const an = new Date().getFullYear();

  const topSmart = TOP_SMART.map(s => all.find(m => m.magazin === s)).filter(Boolean) as Magazin[];
  const restSmart = all.filter(m =>
    !TOP_SMART.includes(m.magazin) && m.are_promotie &&
    CAT_SMART.some(c => (m.categorie_slug||"").includes(c) || m.categorie.toLowerCase().includes(c))
  ).slice(0, 6);
  const magazine = [...topSmart, ...restSmart];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}} />
      <div className="min-h-screen bg-white">
        <nav className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-orange-500">Acasa</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700 font-medium">Smart Home</span>
          </div>
        </nav>

        <section className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 text-white py-14 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="text-5xl mb-4">🏠</div>
            <h1 className="text-3xl md:text-4xl font-black mb-3">Smart Home Romania {an}</h1>
            <p className="text-amber-100 text-lg mb-6 max-w-xl mx-auto">
              Becuri inteligente, prize smart, camere WiFi — transforma-ti casa cu coduri reducere verificate zilnic
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Alexa","Google Home","Apple HomeKit","Philips Hue","Tuya","Zigbee","Wi-Fi Direct"].map(c => (
                <span key={c} className="bg-white/15 text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/25">{c}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-black text-gray-900 mb-6 text-center">Categorii smart home populare</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORII_SMART.map(a => (
              <div key={a.titlu} className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="text-3xl mb-2">{a.emoji}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{a.titlu}</h3>
                <p className="text-xs text-gray-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-10">
          <h2 className="text-xl font-black text-gray-900 mb-5">Magazine smart home cu reduceri active</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {magazine.map((m, i) => {
              const nume = numeAfisat(m.magazin);
              const culoare = CULORI[i % CULORI.length];
              const promo = m.promotii[0];
              return (
                <a key={m.magazin} href={`/cod-reducere/${m.magazin}`}
                  className="group bg-white border border-gray-200 hover:border-amber-300 rounded-2xl p-4 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    {m.logo_url ? (
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.logo_url} alt={`Logo ${nume}`} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                    ) : (
                      <div className={`w-10 h-10 rounded-xl ${culoare} flex items-center justify-center text-white font-black text-lg shrink-0`}>
                        {nume[0]}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{nume}</p>
                      {m.are_promotie && m.cod_cupon && <span className="text-xs text-orange-500 font-bold">COD</span>}
                      {m.are_promotie && !m.cod_cupon && <span className="text-xs text-green-500 font-medium">Oferta</span>}
                    </div>
                  </div>
                  {promo ? (
                    <p className="text-gray-500 text-xs line-clamp-2">{promo.nume}</p>
                  ) : (
                    <p className="text-gray-400 text-xs italic">Verifica ofertele curente</p>
                  )}
                  <div className="flex justify-end mt-2">
                    <span className="text-xs text-amber-600 font-semibold group-hover:text-amber-700">Vezi &rarr;</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <NisaProduse
          merchantSlugs={["emag.ro","altex.ro","dedeman.ro","flanco.ro","evomag.ro"]}
          catSlug="electronice"
          titlu="Produse smart home populare cu reducere"
          culoareAccent="amber"
          limit={12}
        />

        <section className="bg-gray-50 border-t border-gray-200 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">Ghid: Cum incepi cu Smart Home in {an}</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Ecosistem: Alexa, Google Home sau Apple HomeKit?</h3>
                <p>Alexa (Amazon Echo) — cel mai mare ecosistem, compatibil cu 99% din dispozitivele smart. Google Home — integrat cu Android si serviciile Google. Apple HomeKit — securitate maxima, necesar iPhone. Recomandam Alexa sau Google pentru prima instalare — produsele sunt mai ieftine si mai disponibile in Romania.</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">De unde sa incepi</h3>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Becuri inteligente</strong> — cel mai simplu start, Tuya/Philips Hue, 30-60 lei/bec</li>
                  <li><strong>Priza smart</strong> — monitorizare consum, automatizare orice aparat</li>
                  <li><strong>Camera WiFi</strong> — supraveghere live pe telefon de oriunde</li>
                  <li><strong>Termostat</strong> — cel mai mare ROI: economii 20-30% la factura gaz/curent</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Protocol: Zigbee vs WiFi vs Z-Wave</h3>
                <p>WiFi e cel mai simplu (conectare directa, fara hub), dar poate incarca reteaua cu multe dispozitive. Zigbee (Philips Hue, IKEA) consuma putin curent si este mai stabil, dar necesita un hub/bridge. Pentru inceput, WiFi e alegerea pragmatica.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-base font-black text-gray-700 mb-4">Exploreaza si alte categorii</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/electronice", label: "📱 Electronice" },
              { href: "/casa", label: "🏡 Casa & Gradina" },
              { href: "/gadgets", label: "📡 Gadgets" },
              { href: "/gaming", label: "🎮 Gaming" },
              { href: "/oferte-azi", label: "🔥 Oferte de Azi" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="bg-gray-100 hover:bg-amber-50 hover:text-amber-600 text-gray-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors border border-gray-200 hover:border-amber-200">
                {l.label}
              </a>
            ))}
          </div>
        </section>

        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400 mt-4">
          &copy; {an} AmCupon.ro &middot;{" "}
          <Link href="/electronice" className="hover:text-orange-500">Electronice</Link>{" · "}
          <Link href="/casa" className="hover:text-orange-500">Casa & Gradina</Link>{" · "}
          <Link href="/categorii" className="hover:text-orange-500">Categorii</Link>
        </footer>
      </div>
    </>
  );
}
