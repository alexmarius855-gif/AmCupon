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
      <div className="bg-gradient-to-r from-[#111827] to-[#0d9488]/10 border border-[#14b8a6]/20 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
        <div className="text-4xl shrink-0">📬</div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-black text-[#f1f5f9] text-lg">{titlu}</h2>
          <p className="text-[#cbd5e1] text-sm mt-1">Top coduri de reducere verificate, direct în inbox. Gratuit, zero spam, dezabonare oricând.</p>
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
              className="flex-1 sm:w-56 bg-[#1e293b] border border-[#334155] text-[#f1f5f9] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/50 placeholder-[#94a3b8]"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 bg-[#0d9488] hover:bg-[#14b8a6] disabled:opacity-60 text-white font-black px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
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
