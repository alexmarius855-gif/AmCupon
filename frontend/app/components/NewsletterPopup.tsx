"use client";

import { useEffect, useState } from "react";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    // Nu arata daca deja s-a abonat sau a inchis de 2x
    const subscribed = localStorage.getItem("nl_subscribed");
    const closed = parseInt(localStorage.getItem("nl_closed") || "0");
    if (subscribed || closed >= 2) return;

    // Arata dupa 40 secunde pe site
    const t = setTimeout(() => setVisible(true), 40000);
    return () => clearTimeout(t);
  }, []);

  function close() {
    const closed = parseInt(localStorage.getItem("nl_closed") || "0");
    localStorage.setItem("nl_closed", String(closed + 1));
    setVisible(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");

    try {
      // Trimite la Formspree (gratuit, 50 emailuri/luna)
      // Inlocuieste FORMSPREE_ID cu ID-ul tau de la formspree.io
      const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID || "newsletter";
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "newsletter_popup" }),
      });

      if (res.ok) {
        setStatus("success");
        localStorage.setItem("nl_subscribed", "1");
        setTimeout(() => setVisible(false), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 pt-6 pb-8 text-white text-center relative">
          <button onClick={close}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl font-bold">
            ✕
          </button>
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-xl font-black mb-1">Reduceri exclusive pe email</h2>
          <p className="text-orange-100 text-sm">
            Fii primul care află codurile zilei — gratuit, fără spam
          </p>
        </div>

        {/* Beneficii */}
        <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
          <div className="flex flex-col gap-1.5 text-sm text-gray-700">
            {["✅ Coduri exclusive înainte de toți", "⚡ Alert instant când apare o ofertă bună", "🚫 Zero spam — dezabonare cu un click"].map(b => (
              <span key={b} className="font-medium">{b}</span>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-black text-gray-900 text-lg">Mulțumim!</p>
              <p className="text-gray-500 text-sm mt-1">Vei primi cele mai bune oferte pe email.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                placeholder="adresa@email.ro"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black py-3 rounded-2xl text-sm transition-colors">
                {status === "loading" ? "Se trimite..." : "Vreau reduceri exclusive →"}
              </button>
              {status === "error" && (
                <p className="text-red-500 text-xs text-center">Eroare — încearcă din nou</p>
              )}
              <p className="text-xs text-gray-400 text-center">
                Prin abonare ești de acord cu{" "}
                <a href="/confidentialitate" className="underline hover:text-orange-500">politica de confidențialitate</a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
