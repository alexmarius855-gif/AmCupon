"use client";

import { useState, useEffect } from "react";
import { getSupabase, Review } from "../../../lib/supabase";

function Stele({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`text-2xl transition-transform ${onChange ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
          aria-label={`${n} stele`}
        >
          <span className={(hover || value) >= n ? "text-amber-400" : "text-slate-200"}>&#9733;</span>
        </button>
      ))}
    </div>
  );
}

function formatData(iso: string) {
  return new Date(iso).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReviewSection({ magazin }: { magazin: string }) {
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [loading, setLoading]   = useState(true);
  const [stele, setStele]       = useState(0);
  const [nume, setNume]         = useState("");
  const [text, setText]         = useState("");
  const [trimis, setTrimis]     = useState(false);
  const [eroare, setEroare]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sb = getSupabase();

  useEffect(() => {
    if (!sb) { setLoading(false); return; }
    sb
      .from("reviews")
      .select("id, magazin, nume, stele, text, created_at")
      .eq("magazin", magazin)
      .eq("aprobat", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }: { data: Review[] | null }) => {
        setReviews(data || []);
        setLoading(false);
      });
  }, [magazin, sb]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEroare("");
    if (!sb) { setEroare("Recenziile nu sunt disponibile momentan."); return; }
    if (stele === 0) { setEroare("Alege un rating (1-5 stele)."); return; }
    if (text.trim().length < 10) { setEroare("Scrie cel putin 10 caractere."); return; }
    setSubmitting(true);
    const { error } = await sb.from("reviews").insert({
      magazin,
      nume: nume.trim() || "Anonim",
      stele,
      text: text.trim(),
      aprobat: false,  // necesita moderare manuala in Supabase dashboard
    });
    setSubmitting(false);
    if (error) { setEroare("Eroare la trimitere. Incearca din nou."); return; }
    setTrimis(true);
    setStele(0); setNume(""); setText("");
  }

  // Daca supabase nu e configurat, ascunde sectiunea complet
  if (!sb) return null;

  const medieStele = reviews.length
    ? (reviews.reduce((s, r) => s + r.stele, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section className="mt-10 pt-8 border-t border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-gray-900">Recenzii cumparatori</h2>
          {medieStele && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-amber-500">{medieStele}</span>
              <Stele value={Math.round(Number(medieStele))} />
              <span className="text-xs text-gray-400">({reviews.length} {reviews.length === 1 ? "recenzie" : "recenzii"})</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista recenzii */}
      {loading ? (
        <div className="space-y-3 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 animate-pulse">
              <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded mb-1" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3 mb-8">
          {reviews.map(r => (
            <div key={r.id} className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-black text-orange-600">
                    {r.nume.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{r.nume}</p>
                    <p className="text-[10px] text-gray-400">{formatData(r.created_at)}</p>
                  </div>
                </div>
                <Stele value={r.stele} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic mb-8">Fii primul care lasa o recenzie pentru acest magazin.</p>
      )}

      {/* Formular */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
        <h3 className="font-black text-gray-900 text-sm mb-4">Lasa o recenzie</h3>
        {trimis ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">&#9989;</div>
            <p className="font-bold text-gray-900 text-sm">Multumim pentru recenzie!</p>
            <p className="text-xs text-gray-500 mt-1">Va aparea dupa aprobare (de obicei in 24h).</p>
            <button onClick={() => setTrimis(false)} className="mt-3 text-xs text-orange-500 hover:underline">
              Adauga alta recenzie
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1.5">Rating *</p>
              <Stele value={stele} onChange={setStele} />
            </div>
            <div>
              <input
                type="text"
                placeholder="Numele tau (optional)"
                value={nume}
                onChange={e => setNume(e.target.value)}
                maxLength={50}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
            </div>
            <div>
              <textarea
                placeholder="Experienta ta cu acest magazin... (minim 10 caractere)"
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                maxLength={500}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white resize-none"
              />
              <p className="text-[10px] text-gray-400 text-right mt-0.5">{text.length}/500</p>
            </div>
            {eroare && <p className="text-xs text-red-500 font-medium">{eroare}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              {submitting ? "Se trimite..." : "Trimite recenzia"}
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Recenziile sunt moderate inainte de publicare.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
