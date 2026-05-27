"use client";

import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterPopup() {
  const [visible, setVisible]   = useState(false);
  const [email,   setEmail]     = useState("");
  const [status,  setStatus]    = useState<Status>("idle");
  const [errMsg,  setErrMsg]    = useState("");

  useEffect(() => {
    const subscribed = localStorage.getItem("nl_subscribed");
    const closed     = parseInt(localStorage.getItem("nl_closed") || "0");
    if (subscribed || closed >= 2) return;

    let triggered = false;
    function show() {
      if (!triggered) { triggered = true; setVisible(true); }
    }

    // 1. Timer fallback — 25 secunde
    const timer = setTimeout(show, 25000);

    // 2. Exit-intent — mouse paraseste viewport prin sus
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 5) show();
    }
    document.addEventListener("mouseleave", onMouseLeave);

    // 3. Scroll 55% din pagina
    function onScroll() {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (pct >= 0.55) show();
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (status === "success") {
      localStorage.setItem("nl_subscribed", "1");
      const t = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(t);
    }
  }, [status]);

  function close() {
    const closed = parseInt(localStorage.getItem("nl_closed") || "0");
    localStorage.setItem("nl_closed", String(closed + 1));
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
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
      } else {
        setErrMsg(data.error || "Eroare. Incearca din nou.");
        setStatus("error");
      }
    } catch {
      setErrMsg("Eroare de retea. Incearca din nou.");
      setStatus("error");
    }
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
            &#x2715;
          </button>
          <div className="text-4xl mb-2">&#127873;</div>
          <h2 className="text-xl font-black mb-1">Reduceri exclusive pe email</h2>
          <p className="text-orange-100 text-sm">
            Fii primul care afla codurile zilei &mdash; gratuit, fara spam
          </p>
        </div>

        {/* Beneficii */}
        <div className="px-6 py-4 bg-orange-50 border-b border-orange-100">
          <div className="flex flex-col gap-1.5 text-sm text-gray-700">
            {[
              "Coduri exclusive inainte de toti",
              "Alert instant cand apare o oferta buna",
              "Zero spam - dezabonare cu un click",
            ].map((b, i) => (
              <span key={i} className="font-medium flex items-center gap-1.5">
                <span className="text-emerald-500">&#10003;</span> {b}
              </span>
            ))}
          </div>
        </div>

        {/* Form / Success */}
        <div className="px-6 py-5">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">&#127881;</div>
              <p className="font-black text-gray-900 text-lg">Multumim!</p>
              <p className="text-gray-500 text-sm mt-1">
                Vei primi cele mai bune oferte pe email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
                placeholder="adresa@email.ro"
                required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
              />

              {status === "error" && errMsg && (
                <p className="text-red-500 text-xs">{errMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black py-3 rounded-2xl text-sm transition-colors"
              >
                {status === "loading" ? "Se trimite..." : "Vreau reduceri exclusive →"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Prin abonare esti de acord cu{" "}
                <a href="/confidentialitate" className="underline hover:text-orange-500">
                  politica de confidentialitate
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
