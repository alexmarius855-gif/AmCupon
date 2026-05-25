"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

const SUBIECTE = [
  "Cod expirat / incorect",
  "Adăugare magazin nou",
  "Parteneriat / afiliere",
  "Problemă tehnică",
  "Altele",
];

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subiect, setSubiect] = useState(SUBIECTE[0]);
  const [mesaj, setMesaj] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !mesaj) return;
    setStatus("loading");

    try {
      const FORMSPREE_ID =
        process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID ||
        process.env.NEXT_PUBLIC_FORMSPREE_ID ||
        "contact";
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subiect, mesaj }),
      });
      if (res.ok) {
        setStatus("success");
        setName(""); setEmail(""); setMesaj(""); setSubiect(SUBIECTE[0]);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-black text-gray-900 mb-2">Mesaj trimis!</h2>
        <p className="text-gray-500 text-sm">
          Îți vom răspunde la <strong>{email || "adresa ta"}</strong> în maxim 24h.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-5 text-orange-500 hover:text-orange-600 text-sm font-medium underline underline-offset-2"
        >
          Trimite alt mesaj
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h2 className="font-black text-gray-900 text-lg mb-5">Trimite un mesaj</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Numele tău *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prenume Nume"
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="adresa@email.ro"
            required
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Subiect
          </label>
          <select
            value={subiect}
            onChange={(e) => setSubiect(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors bg-white"
          >
            {SUBIECTE.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Mesaj *
          </label>
          <textarea
            value={mesaj}
            onChange={(e) => setMesaj(e.target.value)}
            placeholder="Descrie-ne problema sau întrebarea ta..."
            required
            rows={5}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors resize-none"
          />
        </div>

        {status === "error" && (
          <p className="text-red-500 text-xs text-center bg-red-50 rounded-xl py-2">
            Eroare la trimitere — încearcă din nou sau scrie direct la contact@amcupon.ro
          </p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-black py-3 rounded-xl text-sm transition-colors"
        >
          {status === "loading" ? "Se trimite..." : "Trimite mesajul →"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Prin trimitere ești de acord cu{" "}
          <a href="/confidentialitate" className="underline hover:text-orange-500">
            politica de confidențialitate
          </a>
        </p>
      </form>
    </div>
  );
}
