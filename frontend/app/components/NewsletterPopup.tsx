"use client";

import { useEffect, useState } from "react";
import { useForm, ValidationError } from "@formspree/react";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [state, handleSubmit] = useForm("xpqnywer");

  useEffect(() => {
    const subscribed = localStorage.getItem("nl_subscribed");
    const closed = parseInt(localStorage.getItem("nl_closed") || "0");
    if (subscribed || closed >= 2) return;

    const t = setTimeout(() => setVisible(true), 40000);
    return () => clearTimeout(t);
  }, []);

  // Inchide automat dupa succes si marcheaza abonat
  useEffect(() => {
    if (state.succeeded) {
      localStorage.setItem("nl_subscribed", "1");
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [state.succeeded]);

  function close() {
    const closed = parseInt(localStorage.getItem("nl_closed") || "0");
    localStorage.setItem("nl_closed", String(closed + 1));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 pt-6 pb-8 text-white text-center relative">
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors text-xl font-bold"
          >
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
            {[
              "✅ Coduri exclusive înainte de toți",
              "⚡ Alert instant când apare o ofertă bună",
              "🚫 Zero spam — dezabonare cu un click",
            ].map((b) => (
              <span key={b} className="font-medium">{b}</span>
            ))}
          </div>
        </div>

        {/* Form / Success */}
        <div className="px-6 py-5">
          {state.succeeded ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-black text-gray-900 text-lg">Mulțumim!</p>
              <p className="text-gray-500 text-sm mt-1">
                Vei primi cele mai bune oferte pe email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Camp ascuns ca sa stim sursa */}
              <input type="hidden" name="source" value="newsletter_popup" />

              <input
                type="email"
                name="email"
                placeholder="adresa@email.ro"
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />
              <ValidationError
                field="email"
                prefix="Email-ul"
                errors={state.errors}
                className="text-red-500 text-xs"
              />

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black py-3 rounded-2xl text-sm transition-colors"
              >
                {state.submitting ? "Se trimite..." : "Vreau reduceri exclusive →"}
              </button>

              <ValidationError
                errors={state.errors}
                className="text-red-500 text-xs text-center"
              />

              <p className="text-xs text-gray-400 text-center">
                Prin abonare ești de acord cu{" "}
                <a href="/confidentialitate" className="underline hover:text-orange-500">
                  politica de confidențialitate
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
