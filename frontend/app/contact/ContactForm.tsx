"use client";

import Link from "next/link";

import { useForm, ValidationError } from "@formspree/react";

const SUBIECTE = [
  "Cod expirat / incorect",
  "Adăugare magazin nou",
  "Parteneriat / afiliere",
  "Problemă tehnică",
  "Altele",
];

export default function ContactForm() {
  const [state, handleSubmit] = useForm("xpqnywer");

  if (state.succeeded) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-xl font-black text-white mb-2">Mesaj trimis!</h2>
        <p className="text-slate-400 text-sm">
          Îți vom răspunde în maxim 24h la adresa ta de email.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="font-black text-white text-lg mb-5">Trimite un mesaj</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nume */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide"
          >
            Numele tău *
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Prenume Nume"
            required
            className="w-full bg-slate-800 border-2 border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <ValidationError
            field="name"
            prefix="Numele"
            errors={state.errors}
            className="text-red-400 text-xs mt-1"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide"
          >
            Email *
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="adresa@email.ro"
            required
            className="w-full bg-slate-800 border-2 border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <ValidationError
            field="email"
            prefix="Email-ul"
            errors={state.errors}
            className="text-red-400 text-xs mt-1"
          />
        </div>

        {/* Subiect */}
        <div>
          <label
            htmlFor="subiect"
            className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide"
          >
            Subiect
          </label>
          <select
            id="subiect"
            name="subiect"
            className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {SUBIECTE.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Mesaj */}
        <div>
          <label
            htmlFor="message"
            className="block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wide"
          >
            Mesaj *
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Descrie-ne problema sau întrebarea ta..."
            required
            rows={5}
            className="w-full bg-slate-800 border-2 border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          <ValidationError
            field="message"
            prefix="Mesajul"
            errors={state.errors}
            className="text-red-400 text-xs mt-1"
          />
        </div>

        {/* Eroare generala */}
        <ValidationError
          errors={state.errors}
          className="text-red-400 text-xs text-center bg-red-950/40 border border-red-900/40 rounded-xl py-2 px-3"
        />

        <button
          type="submit"
          disabled={state.submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-black py-3 rounded-xl text-sm transition-colors"
        >
          {state.submitting ? "Se trimite..." : "Trimite mesajul →"}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Prin trimitere ești de acord cu{" "}
          <Link href="/confidentialitate" className="underline hover:text-indigo-400">
            politica de confidențialitate
          </Link>
        </p>
      </form>
    </div>
  );
}
