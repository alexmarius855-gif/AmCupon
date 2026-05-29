"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const MAGAZINE_POPULARE = [
  { slug: "emag.ro",         label: "eMAG" },
  { slug: "fashiondays.ro",  label: "FashionDays" },
  { slug: "notino.ro",       label: "Notino" },
  { slug: "altex.ro",        label: "Altex" },
  { slug: "dedeman.ro",      label: "Dedeman" },
  { slug: "decathlon.ro",    label: "Decathlon" },
  { slug: "drmax.ro",        label: "Dr. Max" },
  { slug: "noriel.ro",       label: "Noriel" },
  { slug: "elefant.ro",      label: "Elefant" },
  { slug: "libris.ro",       label: "Libris" },
];

const CATEGORII = [
  { href: "/categorii/fashion",              label: "Fashion & Haine" },
  { href: "/categorii/electronics-itc",      label: "Electronice & IT" },
  { href: "/categorii/beauty",               label: "Frumusete & Beauty" },
  { href: "/categorii/home-garden",          label: "Casa & Gradina" },
  { href: "/categorii/pharma",               label: "Farmacie Online" },
  { href: "/categorii/sports-outdoors",      label: "Sport & Outdoor" },
  { href: "/categorii/babies-kids-toys",     label: "Copii & Jucarii" },
  { href: "/categorii/automotive",           label: "Auto & Moto" },
  { href: "/categorii/books",                label: "Carti & Educatie" },
  { href: "/categorii/hypermarket-groceries",label: "Hypermarket" },
];

const GHIDURI = [
  { href: "/farmacie",    label: "Farmacie Online" },
  { href: "/frumusete",   label: "Beauty & Cosmetice" },
  { href: "/sport",       label: "Sport & Fitness" },
  { href: "/copii",       label: "Copii & Bebelusi" },
  { href: "/calatorie",   label: "Vacante & Travel" },
  { href: "/gadgets",     label: "Gadgets & Tech" },
  { href: "/fashion",     label: "Moda & Tendinte" },
  { href: "/casa",        label: "Casa & Bricolaj" },
  { href: "/black-friday",label: "Black Friday" },
  { href: "/extensie",    label: "Extensie Chrome" },
];

const INFO = [
  { href: "/despre-noi",       label: "Despre noi" },
  { href: "/contact",          label: "Contact" },
  { href: "/blog",             label: "Blog & Ghiduri" },
  { href: "/newsletter",       label: "Newsletter gratuit" },
  { href: "/top-reduceri",     label: "Top reduceri" },
  { href: "/toate-magazinele", label: "Toate magazinele" },
  { href: "/confidentialitate",label: "Politica GDPR" },
  { href: "/termeni",          label: "Termeni si conditii" },
];

function NewsletterMini() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"ok"|"err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) { setStatus("err"); return; }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) { setStatus("ok"); } else { setStatus("err"); }
    } catch { setStatus("err"); }
  }

  if (status === "ok") {
    return (
      <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
        <span className="text-emerald-400">✓</span>
        Abonat! Ofertele vin pe email.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setStatus("idle"); }}
        placeholder="email@tau.ro"
        required
        className="flex-1 bg-slate-800 border border-slate-700 focus:border-orange-500 text-slate-200 placeholder-slate-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors min-w-0"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap shrink-0"
      >
        {status === "loading" ? "..." : "Abonare"}
      </button>
    </form>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const an = new Date().getFullYear();

  // Homepage are propriul footer complet
  if (pathname === "/") return null;

  return (
    <footer className="bg-[#070a0f] text-slate-400 border-t border-slate-800/60 mt-auto">

      {/* Newsletter banner */}
      <div className="border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-black text-lg">📧 Reduceri zilnice pe email</p>
            <p className="text-slate-400 text-sm mt-0.5">
              Fii primul care afla codurile active — gratuit, fara spam
            </p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[320px]">
            <NewsletterMini />
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

          {/* Brand col */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <a href="/" className="flex items-center gap-1.5 mb-4">
              <div className="bg-orange-500 text-white font-black text-sm px-2 py-0.5 rounded-lg">Am</div>
              <span className="font-black text-white text-xl">Cupon<span className="text-orange-500">.ro</span></span>
            </a>
            <p className="text-sm leading-relaxed text-slate-500 mb-5">
              Coduri de reducere verificate zilnic de la cele mai mari magazine online din Romania.
              100% gratuit.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { href: "https://www.facebook.com/amcupon.ro", label: "Facebook",
                  svg: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
                { href: "https://www.instagram.com/amcupon.ro", label: "Instagram",
                  svg: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
                { href: "https://www.tiktok.com/@amcupon.ro", label: "TikTok",
                  svg: <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5"/> },
              ].map(s => (
                <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors group">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    {s.svg}
                  </svg>
                </a>
              ))}
              <a href="https://chromewebstore.google.com/detail/mahfankpalkgognhnllkgdkjncmmkllb"
                target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-orange-500 flex items-center justify-center transition-colors" title="Extensie Chrome">
                <span className="text-sm">🧩</span>
              </a>
            </div>
          </div>

          {/* Magazine */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">Magazine populare</p>
            <ul className="space-y-2">
              {MAGAZINE_POPULARE.map(m => (
                <li key={m.slug}>
                  <a href={`/cod-reducere/${m.slug}`}
                    className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
                    Cod reducere {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorii */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">Categorii</p>
            <ul className="space-y-2">
              {CATEGORII.map(c => (
                <li key={c.href}>
                  <a href={c.href} className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Ghiduri */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">Ghiduri nisa</p>
            <ul className="space-y-2">
              {GHIDURI.map(g => (
                <li key={g.href}>
                  <a href={g.href} className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
                    {g.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-widest mb-4">Informatii</p>
            <ul className="space-y-2">
              {INFO.map(i => (
                <li key={i.href}>
                  <a href={i.href} className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
                    {i.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© {an} AmCupon.ro — Toate drepturile rezervate</p>
          <p className="text-center">
            AmCupon.ro conține linkuri de afiliere. Primim un comision din bugetul de marketing
            al magazinelor, fără costuri suplimentare pentru tine.
          </p>
          <div className="flex items-center gap-4">
            <a href="/confidentialitate" className="hover:text-slate-400 transition-colors">GDPR</a>
            <a href="/termeni" className="hover:text-slate-400 transition-colors">Termeni</a>
            <a href="/contact" className="hover:text-slate-400 transition-colors">Contact</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
