"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    window.dispatchEvent(new Event("cookie_consent_update"));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <span className="text-2xl shrink-0">🍪</span>

        {/* Text */}
        <div className="flex-1 text-sm">
          <p className="font-bold text-white mb-0.5">Folosim cookie-uri</p>
          <p className="text-gray-400 leading-relaxed">
            Folosim cookie-uri pentru analiza traficului (Google Analytics), publicitate (Google AdSense) si tracking afiliat (2Performant). Date anonime, fara vanzare catre terti.{" "}
            <Link href="/confidentialitate" className="text-indigo-400 hover:underline">
              Politica de confidentialitate
            </Link>
          </p>
        </div>

        {/* Butoane */}
        <div className="flex gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Refuz
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
