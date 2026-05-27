"use client";

import { useState } from "react";
import { Metadata } from "next";

type Status = "idle" | "loading" | "success" | "error";

const BENEFICII = [
  { icon: "🎯", titlu: "Coduri exclusive", desc: "Primesti coduri de reducere inainte sa fie publice" },
  { icon: "⚡", titlu: "Alerte instant", desc: "Notificare cand apare o oferta buna la magazinele tale favorite" },
  { icon: "📅", titlu: "Rezumat saptamanal", desc: "Top 5 coduri active in fiecare saptamana, direct in inbox" },
  { icon: "🚫", titlu: "Zero spam", desc: "Dezabonare cu un singur click, oricand" },
];

export default function NewsletterPage() {
  const [email,  setEmail]  = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErrMsg("Adresa de email invalida.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrMsg("");
    try {
      const res  = await fetch("/api/newsletter", {
        method:  "POST",
        headers: { "content-type": "application/json" },
        body:    JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setStatus("success");
        localStorage.setItem("nl_subscribed", "1");
      } else {
        setErrMsg(data.error || "Eroare. Incearca din nou.");
        setStatus("error");
      }
    } catch {
      setErrMsg("Eroare de retea. Incearca din nou.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-1.5 shrink-0">
            <div className="bg-orange-500 text-white font-black text-base px-2 py-1 rounded-lg">Am</div>
            <span className="font-black text-white text-xl">Cupon</span>
            <span className="text-orange-500 font-black text-xl">.ro</span>
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-sm font-semibold text-slate-400">Newsletter</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 text-4xl mb-6 shadow-xl shadow-orange-500/30">
            🎁
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
            Reduceri exclusive pe email
          </h1>
          <p className="text-slate-400 text-lg">
            Peste <span className="text-white font-bold">600 magazine</span> monitorizate zilnic.
            Fii primul care afla codurile noi.
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl mb-8">

          {/* Beneficii */}
          <div className="p-8 border-b border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENEFICII.map((b) => (
                <div key={b.titlu} className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{b.icon}</span>
                  <div>
                    <p className="font-bold text-white text-sm">{b.titlu}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {status === "success" ? (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-black text-white mb-2">Esti abonat!</h2>
                <p className="text-slate-400 mb-6">
                  Vei primi cele mai bune coduri reducere direct in inbox.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                  Descopera ofertele de azi →
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                    Adresa ta de email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
                    placeholder="adresa@email.ro"
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-500 transition-all"
                  />
                </div>

                {status === "error" && errMsg && (
                  <p className="text-red-400 text-sm flex items-center gap-1.5">
                    <span>⚠</span> {errMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-black py-4 rounded-xl text-base transition-colors shadow-lg shadow-orange-500/25"
                >
                  {status === "loading" ? "Se proceseaza..." : "Aboneaza-ma gratuit →"}
                </button>

                <p className="text-xs text-slate-500 text-center leading-relaxed">
                  Prin abonare esti de acord cu{" "}
                  <a href="/confidentialitate" className="text-orange-400 hover:underline">
                    politica de confidentialitate
                  </a>
                  . Dezabonare oricand cu un click.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Social proof */}
        <div className="grid grid-cols-3 gap-4 text-center mb-8">
          {[
            { nr: "600+",  label: "Magazine monitorizate" },
            { nr: "Zilnic", label: "Actualizare coduri" },
            { nr: "100%",  label: "Gratuit pentru tine" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
              <p className="text-xl font-black text-orange-400">{s.nr}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Back link */}
        <div className="text-center">
          <a href="/" className="text-sm text-slate-500 hover:text-orange-400 transition-colors">
            ← Inapoi la homepage
          </a>
        </div>
      </div>
    </div>
  );
}
