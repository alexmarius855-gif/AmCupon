"use client";

import Link from "next/link";

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
      if (res.status >= 500) {
        // Eroare server (ex: BREVO_API_KEY nesetat) — inchidem silentios, nu deranjam userul
        setVisible(false);
        return;
      }
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
      <div className="bg-[#14181c] border border-[#1f2329] rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="relative bg-[#06080b] overflow-hidden px-6 pt-6 pb-8 text-center">
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 0%, rgba(13,148,136,0.25) 0%, transparent 70%)" }} />
          <button
            onClick={close}
            className="absolute z-10 top-4 right-4 text-[#9399a0] hover:text-[#ffffff] transition-colors text-xl font-bold"
          >
            &#x2715;
          </button>
          <div className="relative z-10">
            <div className="text-4xl mb-2">&#127873;</div>
            <h2 className="text-xl font-black mb-1 text-[#ffffff]">Reduceri exclusive pe email</h2>
            <p className="text-[#c9ced5] text-sm">
              Fii primul care afla codurile zilei &mdash; gratuit, fara spam
            </p>
          </div>
        </div>

        {/* Beneficii */}
        <div className="px-6 py-4 bg-[#14181c] border-b border-[#1f2329]">
          <div className="flex flex-col gap-1.5 text-sm text-[#c9ced5]">
            {[
              "Coduri exclusive inainte de toti",
              "Alert instant cand apare o oferta buna",
              "Zero spam - dezabonare cu un click",
            ].map((b, i) => (
              <span key={i} className="font-medium flex items-center gap-1.5">
                <span className="text-emerald-400">&#10003;</span> {b}
              </span>
            ))}
          </div>
        </div>

        {/* Form / Success */}
        <div className="px-6 py-5">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">&#127881;</div>
              <p className="font-black text-[#ffffff] text-lg">Multumim!</p>
              <p className="text-[#c9ced5] text-sm mt-1">
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
                className="w-full bg-[#1f2329] border-2 border-[#2a2f36] text-[#ffffff] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ddf93c] transition-colors placeholder:text-[#9399a0]"
              />

              {status === "error" && errMsg && (
                <p className="text-red-400 text-xs">{errMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-[#ddf93c] hover:bg-[#ddf93c] disabled:opacity-60 text-[#0c1000] font-black py-3 rounded-xl text-sm transition-colors"
              >
                {status === "loading" ? "Se trimite..." : "Vreau reduceri exclusive →"}
              </button>

              <p className="text-xs text-[#9399a0] text-center">
                Prin abonare esti de acord cu{" "}
                <Link href="/confidentialitate" className="underline hover:text-[#ddf93c]">
                  politica de confidentialitate
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
