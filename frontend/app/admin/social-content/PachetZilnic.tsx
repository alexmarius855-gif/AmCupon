"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Copy, Check, Images, LayoutList, Smartphone, Square } from "lucide-react";

/**
 * Pachetul social al zilei — descarcare 1-click.
 *
 * Materialele vin din `scripts/social_content_factory.py`, care scrie manifestul
 * la `public/daily-content/latest.json`. Pagina NU regenereaza nimic si nu
 * inventeaza nimic: daca manifestul lipseste, spune asta explicit si arata
 * comanda de rulat — nu afiseaza un pachet gol care pare functional.
 */

export interface Postare {
  pozitie: number;
  magazin: string;
  slug: string;
  categorie: string;
  eticheta: string;
  cod: string;
  link: string;
  story: string;
  square: string;
  text: { facebook: string; instagram: string; tiktok: string };
}

export interface Manifest {
  data: string;
  data_afisata: string;
  zi: string;
  generat_la: string;
  nr_postari: number;
  nr_slide: number;
  digest_single: string;
  carusel: string[];
  text_digest: string;
  postari: Postare[];
}

type Platforma = "facebook" | "instagram" | "tiktok";

function ButonCopiere({ text, eticheta }: { text: string; eticheta: string }) {
  const [copiat, setCopiat] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopiat(true);
        setTimeout(() => setCopiat(false), 1800);
      }}
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
        copiat
          ? "bg-[#ddf93c] text-[#0c1000] border-[#ddf93c]"
          : "bg-[#1f2329] text-[#c9ced5] border-[#2a2f36] hover:border-[#c9ced5] hover:text-white"
      }`}
    >
      {copiat ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copiat ? "Copiat" : eticheta}
    </button>
  );
}

/** Descarcarea foloseste `download` pe un `<a>` catre un fisier de pe ACELASI
 *  domeniu — same-origin, deci atributul chiar declanseaza salvarea. */
function ButonDescarcare({ href, eticheta, Icon }: { href: string; eticheta: string; Icon: typeof Download }) {
  return (
    <a
      href={href}
      download
      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1f2329] text-[#c9ced5] border border-[#2a2f36] hover:border-[#ddf93c] hover:text-[#ddf93c] transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
      {eticheta}
    </a>
  );
}

export default function PachetZilnic({ manifest }: { manifest: Manifest | null }) {
  const [platforma, setPlatforma] = useState<Platforma>("facebook");

  if (!manifest) {
    return (
      <div className="min-h-screen bg-[#06080b] text-white px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-black mb-3">Nu exista pachet generat inca</h1>
          <p className="text-[#c9ced5] text-sm mb-6">
            Uzina de continut nu a rulat inca (sau `latest.json` lipseste). Ruleaza:
          </p>
          <code className="block bg-[#14181c] border border-[#1f2329] rounded-xl px-4 py-3 text-[#ddf93c] text-sm">
            python scripts/social_content_factory.py
          </code>
          <Link href="/admin" className="inline-block mt-8 text-sm font-bold text-[#ddf93c] hover:text-[#c3dd2c]">
            &larr; Inapoi la admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080b] text-white">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ── Antet ──────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-[#6b7178] hover:text-[#c9ced5]">
              &larr; Admin
            </Link>
            <h1 className="text-2xl md:text-3xl font-black mt-1">Pachetul social al zilei</h1>
            <p className="text-[#9399a0] text-sm mt-1">
              {manifest.zi}, {manifest.data_afisata} · {manifest.nr_postari} postari ·
              carusel {manifest.nr_slide} slide-uri · generat {manifest.generat_la.replace("T", " ")}
            </p>
          </div>
          <p className="text-xs text-[#6b7178] max-w-xs">
            Toate ofertele au link de comision real si cifre parsate din textul promotiei —
            nimic estimat.
          </p>
        </div>

        {/* ── Digest colectiv ────────────────────────────────────────────── */}
        <section className="mb-10">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            <LayoutList className="w-5 h-5 text-[#ddf93c]" /> Digest colectiv
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4">
              <p className="text-sm font-bold mb-3">Format SINGLE — infografica Top 10</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={manifest.digest_single}
                alt="Digest Top 10 al zilei"
                className="w-full rounded-lg border border-[#1f2329] mb-3"
              />
              <div className="flex flex-wrap gap-2">
                <ButonDescarcare href={manifest.digest_single} eticheta="Descarca imaginea" Icon={Download} />
                <ButonCopiere text={manifest.text_digest} eticheta="Copiaza textul" />
              </div>
            </div>

            <div className="bg-[#14181c] border border-[#1f2329] rounded-xl p-4">
              <p className="text-sm font-bold mb-3">
                Format CARUSEL — {manifest.carusel.length} slide-uri
              </p>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {manifest.carusel.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`Slide ${i + 1}`}
                    className="w-full rounded-md border border-[#1f2329]"
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {manifest.carusel.map((src, i) => (
                  <ButonDescarcare key={src} href={src} eticheta={`${i + 1}`} Icon={Images} />
                ))}
              </div>
              <p className="text-[11px] text-[#6b7178] mt-2">
                Instagram pastreaza ordinea in care incarci fisierele — incarca-le 1 → {manifest.carusel.length}.
              </p>
            </div>
          </div>
        </section>

        {/* ── Postari individuale ────────────────────────────────────────── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#ddf93c]" /> {manifest.postari.length} postari individuale
            </h2>
            <div className="flex gap-1.5" role="group" aria-label="Platforma pentru text">
              {(["facebook", "instagram", "tiktok"] as Platforma[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatforma(p)}
                  aria-pressed={platforma === p}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border capitalize transition-colors ${
                    platforma === p
                      ? "bg-[#ddf93c] text-[#0c1000] border-[#ddf93c]"
                      : "bg-[#14181c] text-[#c9ced5] border-[#1f2329] hover:border-[#c9ced5]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {manifest.postari.map((p) => (
              <div key={p.slug} className="bg-[#14181c] border border-[#1f2329] rounded-xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.square} alt={`Banner ${p.magazin}`} className="w-full" />
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <p className="font-black">{p.magazin}</p>
                    <span className="text-[#ddf93c] font-black text-sm tabular-nums">{p.eticheta}</span>
                  </div>
                  <p className="text-[11px] text-[#6b7178] mb-3">{p.categorie}</p>

                  <pre className="text-[11px] text-[#c9ced5] whitespace-pre-wrap bg-[#06080b] border border-[#1f2329] rounded-lg p-3 mb-3 max-h-40 overflow-y-auto">
                    {p.text[platforma]}
                  </pre>

                  <div className="flex flex-wrap gap-2">
                    <ButonCopiere text={p.text[platforma]} eticheta="Text" />
                    <ButonDescarcare href={p.square} eticheta="Feed" Icon={Square} />
                    <ButonDescarcare href={p.story} eticheta="Story" Icon={Smartphone} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
