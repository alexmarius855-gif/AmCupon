"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Sectiune compacta de abonare, pentru inserare pe orice pagina de nisa.
 * Trimite direct catre /api/newsletter (acelasi endpoint ca pagina dedicata
 * /newsletter) — nu doar un link catre alta pagina, ca sa nu piarda userul.
 */
export default function NewsletterCTA({ titlu = "Nu rata cele mai bune reduceri" }: { titlu?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      setStatus(data.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-[#14181c] to-[#ddf93c]/10 border border-[#ddf93c]/20 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="text-4xl shrink-0">📬</div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-black text-[#ffffff] text-lg">{titlu}</h2>
          <p className="text-[#c9ced5] text-sm mt-1">Top coduri de reducere verificate, direct în inbox. Gratuit, zero spam, dezabonare oricând.</p>
        </div>
        {status === "success" ? (
          <p className="shrink-0 text-emerald-400 font-bold text-sm">🎉 Ești abonat!</p>
        ) : (
          <form onSubmit={handleSubmit} className="shrink-0 flex w-full sm:w-auto gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setStatus("idle"); }}
              placeholder="adresa@email.ro"
              required
              className="flex-1 sm:w-56 bg-[#1f2329] border border-[#2a2f36] text-[#ffffff] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ddf93c]/50 placeholder-[#9399a0]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 bg-[#ddf93c] hover:bg-[#ddf93c] disabled:opacity-60 text-[#0c1000] font-black px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
            >
              {status === "loading" ? "..." : "Abonează-mă →"}
            </button>
          </form>
        )}
      </div>
      {status === "error" && <p className="text-red-400 text-xs text-center sm:text-left mt-2 ml-1">Email invalid sau eroare de rețea — încearcă din nou.</p>}
    </section>
  );
}
