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
          <span className={(hover || value) >= n ? "text-[#0f766e]" : "text-[#1e293b]"}>&#9733;</span>
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
    <section className="mt-10 pt-8 border-t border-[#e2e8f0]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-black text-[#0f172a]">Recenzii cumparatori</h2>
          {medieStele && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-[#0f766e]">{medieStele}</span>
              <Stele value={Math.round(Number(medieStele))} />
              <span className="text-xs text-[#64748b]">({reviews.length} {reviews.length === 1 ? "recenzie" : "recenzii"})</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista recenzii */}
      {loading ? (
        <div className="space-y-3 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="bg-[#ffffff] rounded-xl p-4 animate-pulse">
              <div className="h-3 w-24 bg-[#e2e8f0] rounded mb-2" />
              <div className="h-3 w-full bg-[#e2e8f0] rounded mb-1" />
              <div className="h-3 w-3/4 bg-[#e2e8f0] rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="space-y-3 mb-8">
          {reviews.map(r => (
            <div key={r.id} className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#0d9488]/20 flex items-center justify-center text-sm font-black text-[#0d9488]">
                    {r.nume.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0f172a]">{r.nume}</p>
                    <p className="text-[10px] text-[#64748b]">{formatData(r.created_at)}</p>
                  </div>
                </div>
                <Stele value={r.stele} />
              </div>
              <p className="text-sm text-[#475569] leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#64748b] italic mb-8">Fii primul care lasa o recenzie pentru acest magazin.</p>
      )}

      {/* Formular */}
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-5">
        <h3 className="font-black text-[#0f172a] text-sm mb-4">Lasa o recenzie</h3>
        {trimis ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">&#9989;</div>
            <p className="font-bold text-[#0f172a] text-sm">Multumim pentru recenzie!</p>
            <p className="text-xs text-[#475569] mt-1">Va aparea dupa aprobare (de obicei in 24h).</p>
            <button onClick={() => setTrimis(false)} className="mt-3 text-xs text-[#0d9488] hover:underline">
              Adauga alta recenzie
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-[#475569] mb-1.5">Rating *</p>
              <Stele value={stele} onChange={setStele} />
            </div>
            <div>
              <input
                type="text"
                placeholder="Numele tau (optional)"
                value={nume}
                onChange={e => setNume(e.target.value)}
                maxLength={50}
                className="w-full bg-[#e2e8f0] border border-[#cbd5e1] text-[#0f172a] placeholder:text-[#64748b] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6]"
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
                className="w-full bg-[#e2e8f0] border border-[#cbd5e1] text-[#0f172a] placeholder:text-[#64748b] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14b8a6] resize-none"
              />
              <p className="text-[10px] text-[#64748b] text-right mt-0.5">{text.length}/500</p>
            </div>
            {eroare && <p className="text-xs text-red-400 font-medium">{eroare}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#0d9488] hover:bg-[#14b8a6] disabled:bg-[#5a4718] text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
            >
              {submitting ? "Se trimite..." : "Trimite recenzia"}
            </button>
            <p className="text-[10px] text-[#64748b] text-center">
              Recenziile sunt moderate inainte de publicare.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
