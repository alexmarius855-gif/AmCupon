"use client";

import { useState } from "react";

interface Props {
  magazin: string;
  numeMagazin: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function PriceAlert({ magazin, numeMagazin }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setErrMsg("Email invalid."); setStatus("error"); return;
    }
    setStatus("loading"); setErrMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed, tag: `alert_${magazin}`, source: "price_alert" }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.ok) {
        setStatus("success");
      } else {
        setErrMsg(data.error || "Eroare. Incearca din nou."); setStatus("error");
      }
    } catch {
      setErrMsg("Eroare de retea."); setStatus("error");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-[#c8bda2] hover:text-[#d8c091] border border-[#37301f] hover:border-[#c9a63e]/40 bg-[#26211a]/60 hover:bg-[#26211a] px-4 py-2.5 rounded-xl transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        Alertă ofertă nouă
      </button>
    );
  }

  return (
    <div className="bg-[#15120c] border border-[#c9a63e]/20 rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-black text-white text-sm">🔔 Alertă {numeMagazin}</p>
          <p className="text-xs text-[#a89a78] mt-0.5">Te notificăm când apare o ofertă nouă</p>
        </div>
        <button onClick={() => { setOpen(false); setStatus("idle"); setEmail(""); }}
          className="text-[#8c8064] hover:text-[#c8bda2] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2.5">
          <span className="text-emerald-400">✓</span>
          <p className="text-sm font-bold">Ești abonat! Te vom anunța când apare o ofertă {numeMagazin}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setStatus("idle"); setErrMsg(""); }}
            placeholder="email@tau.ro"
            required
            className="flex-1 border border-[#37301f] focus:border-[#d8c091] bg-[#26211a] text-white placeholder:text-[#8c8064] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a63e]/30"
          />
          <button type="submit" disabled={status === "loading"}
            className="bg-[#b8912e] hover:bg-[#c9a63e] disabled:opacity-60 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap">
            {status === "loading" ? "..." : "Abonare"}
          </button>
        </form>
      )}
      {status === "error" && errMsg && (
        <p className="text-red-400 text-xs mt-1.5">{errMsg}</p>
      )}
    </div>
  );
}
