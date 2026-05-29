"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.reload();
      } else {
        setError(data.error || "Parola incorecta");
      }
    } catch {
      setError("Eroare de conexiune");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl text-3xl mb-4 shadow-xl shadow-orange-500/30">
            🎛️
          </div>
          <h1 className="text-2xl font-black text-white">Mission Control</h1>
          <p className="text-slate-500 text-sm mt-1">AmCupon.ro · Admin Panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Parola admin
            </label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 placeholder-slate-600 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm flex items-center gap-2">
              <span>⚠</span> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-black py-3 rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/20"
          >
            {loading ? "Se verifica..." : "Intra in Mission Control →"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-700 mt-6">
          Session valabila 24h · Acces restricționat
        </p>
      </div>
    </div>
  );
}
