"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

export interface SocialItem {
  magazin: string;
  nume: string;
  categorie: string;
  cod?: string;
  procent?: string;
  zile_ramase?: number;
  link: string;
  story?: string;
  perete?: string;
  hashtags?: string;
}

type Tone = "evergreen" | "deal" | "newsletter";

const SITE = "https://amcupon.ro";

function withUtm(url: string, source: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `${SITE}${url.startsWith("/") ? "" : "/"}${url}`);
    u.searchParams.set("utm_source", source);
    u.searchParams.set("utm_medium", "organic_social");
    u.searchParams.set("utm_campaign", "admin_social_studio");
    return u.toString();
  } catch {
    return url;
  }
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function captionFor(item: SocialItem, tone: Tone, url: string) {
  if (tone === "newsletter") {
    return `Vrei cele mai bune reduceri fara sa le cauti manual?\n\nAm pus pe AmCupon.ro ofertele active si codurile verificate.\n\n${url}\n\n${item.hashtags || "#reduceri #oferte #romania #amcupon"}`;
  }

  if (tone === "deal") {
    return `${item.procent ? `${item.procent} ` : "Reducere "}la ${item.nume} - activ acum pe AmCupon.ro.\n\nVerifica oferta inainte sa cumperi:\n${url}\n\n${item.hashtags || "#reduceri #coduri #oferte #romania"}`;
  }

  return `Inainte sa cumperi online, verifica daca exista cod sau oferta activa.\n\nAzi am salvat ${item.nume} in lista de verificat pe AmCupon.ro.\n\n${url}\n\nSalveaza story-ul pentru urmatoarea comanda.`;
}

function storyTitle(item: SocialItem, tone: Tone) {
  if (tone === "newsletter") return "Reduceri fara cautat manual";
  if (tone === "deal") return item.procent ? `${item.procent} la ${item.nume}` : `Oferta la ${item.nume}`;
  return "Verifica reducerile inainte sa cumperi";
}

function storySubtitle(item: SocialItem, tone: Tone) {
  if (tone === "newsletter") return "Top oferte si coduri active, direct pe AmCupon.ro";
  if (tone === "deal") return item.cod ? `Cod: ${item.cod}` : "Fara cod necesar, vezi oferta activa";
  return `${item.nume} / ${item.categorie || "Oferte online"}`;
}

async function createStoryBlob(item: SocialItem, tone: Tone, url: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponibil");

  const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
  grad.addColorStop(0, "#080712");
  grad.addColorStop(0.45, "#171008");
  grad.addColorStop(1, "#05060a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = "rgba(201,166,62,0.10)";
  ctx.beginPath();
  ctx.arc(900, 220, 380, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(184,145,46,0.12)";
  ctx.beginPath();
  ctx.arc(100, 1600, 430, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(201,166,62,0.55)";
  ctx.lineWidth = 4;
  ctx.strokeRect(70, 70, 940, 1780);

  ctx.fillStyle = "#14b8a6";
  ctx.font = "900 42px Arial";
  ctx.fillText("AmCupon.ro", 110, 170);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "700 30px Arial";
  ctx.fillText("story de salvat", 110, 220);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 82px Arial";
  const titleLines = wrapLines(ctx, storyTitle(item, tone), 830).slice(0, 5);
  let y = 480;
  for (const line of titleLines) {
    ctx.fillText(line, 110, y);
    y += 92;
  }

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "700 42px Arial";
  const subLines = wrapLines(ctx, storySubtitle(item, tone), 830).slice(0, 3);
  y += 28;
  for (const line of subLines) {
    ctx.fillText(line, 110, y);
    y += 54;
  }

  if (item.procent) {
    ctx.fillStyle = "#14b8a6";
    ctx.fillRect(110, y + 70, 320, 124);
    ctx.fillStyle = "#080712";
    ctx.font = "900 70px Arial";
    ctx.fillText(item.procent, 145, y + 152);
  }

  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(110, 1380, 860, 220);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 40px Arial";
  ctx.fillText("Link:", 150, 1455);
  ctx.fillStyle = "#cbd5e1";
  ctx.font = "700 34px Arial";
  const cleanUrl = url.replace(/^https?:\/\//, "");
  const urlLines = wrapLines(ctx, cleanUrl, 760).slice(0, 3);
  let uy = 1510;
  for (const line of urlLines) {
    ctx.fillText(line, 150, uy);
    uy += 44;
  }

  ctx.fillStyle = "rgba(255,255,255,0.70)";
  ctx.font = "700 30px Arial";
  ctx.fillText("Salveaza pentru urmatoarea comanda", 150, 1710);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Nu pot genera PNG")), "image/png", 0.96);
  });
}

export default function SocialStudio({ items }: { items: SocialItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tone, setTone] = useState<Tone>("evergreen");
  const [status, setStatus] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

  const item = items[selectedIndex] || null;
  const shareUrl = useMemo(() => item ? withUtm(item.link, "instagram_story") : "", [item]);
  const caption = useMemo(() => item ? captionFor(item, tone, shareUrl) : "", [item, tone, shareUrl]);

  async function copyText(text: string, message: string) {
    await navigator.clipboard.writeText(text);
    setStatus(message);
  }

  async function downloadStory() {
    if (!item) return;
    const blob = await createStoryBlob(item, tone, shareUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amcupon-story-${item.magazin || item.nume}.png`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Imagine descarcata. O poti posta in Story.");
  }

  async function shareStory() {
    if (!item) return;
    const blob = await createStoryBlob(item, tone, shareUrl);
    const file = new File([blob], `amcupon-story-${item.magazin || item.nume}.png`, { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };

    if (navigator.share && (!nav.canShare || nav.canShare({ files: [file] }))) {
      await navigator.share({ files: [file], title: "AmCupon.ro", text: caption });
      setStatus("Share sheet deschis.");
      return;
    }

    if (navigator.share) {
      await navigator.share({ title: "AmCupon.ro", text: caption, url: shareUrl });
      setStatus("Share sheet deschis cu text si link.");
      return;
    }

    await copyText(caption, "Caption copiat. Descarca imaginea si posteaza manual.");
  }

  if (!item) {
    return (
      <main className="min-h-screen bg-[#070a0f] text-white flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-black mb-3">Social Studio</h1>
          <p className="text-[#cbd5e1]">Nu am gasit postari in data/postari-zilnice.json.</p>
          <Link href="/admin" className="inline-block mt-6 text-[#cbd5e1] underline">Inapoi la admin</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070a0f] text-white">
      <div className="max-w-6xl mx-auto px-4 py-5 sm:py-8">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#14b8a6]">AmCupon.ro</p>
            <h1 className="text-2xl sm:text-4xl font-black">Social Studio</h1>
            <p className="text-sm text-[#cbd5e1] mt-1">Story evergreen pentru telefon: alege, genereaza, share.</p>
          </div>
          <Link href="/admin" className="shrink-0 rounded-xl border border-[#1e293b] px-4 py-2 text-sm font-bold text-[#cbd5e1]">Admin</Link>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-5 items-start">
          <section className="rounded-2xl border border-[#1e293b] bg-[#11100c] p-4 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#cbd5e1] mb-2">Oferta</label>
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(Number(e.target.value))}
                className="w-full rounded-xl bg-[#201c14] border border-[#1e293b] px-3 py-3 text-sm text-white"
              >
                {items.map((it, idx) => (
                  <option key={`${it.magazin}-${idx}`} value={idx}>{it.nume} {it.procent ? `(${it.procent})` : ""}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="block text-xs font-bold uppercase tracking-widest text-[#cbd5e1] mb-2">Tip story</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["evergreen", "Evergreen"],
                  ["deal", "Oferta"],
                  ["newsletter", "Newsletter"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setTone(value as Tone)}
                    className="rounded-xl border px-3 py-2 text-xs font-black"
                    style={{ borderColor: tone === value ? "#14b8a6" : "#1e293b", color: tone === value ? "#f8e7b0" : "#94a3b8", background: tone === value ? "#2a2110" : "#0a0f1a" }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#0a0f1a] border border-[#1e293b] p-3 text-sm text-[#c8bda2]">
              <p><span className="text-[#cbd5e1]">Magazin:</span> {item.nume}</p>
              <p><span className="text-[#cbd5e1]">Categorie:</span> {item.categorie || "-"}</p>
              <p><span className="text-[#cbd5e1]">Link:</span> {shareUrl.replace(/^https?:\/\//, "")}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#cbd5e1] mb-2">Caption</label>
              <textarea readOnly value={caption} className="h-44 w-full rounded-xl bg-[#201c14] border border-[#1e293b] px-3 py-3 text-sm text-[#cbd5e1]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => copyText(caption, "Caption copiat.")} className="rounded-xl bg-[#0a0f1a] px-3 py-3 text-sm font-black text-[#cbd5e1]">Copiaza caption</button>
              <button onClick={() => copyText(shareUrl, "Link copiat.")} className="rounded-xl bg-[#0a0f1a] px-3 py-3 text-sm font-black text-[#cbd5e1]">Copiaza link</button>
              <button onClick={downloadStory} className="rounded-xl bg-[#0d9488] px-3 py-3 text-sm font-black text-white">Descarca Story</button>
              <button onClick={shareStory} className="rounded-xl bg-[#f1f5f9] px-3 py-3 text-sm font-black text-[#0a0f1a]">Share telefon</button>
            </div>

            {status && <p className="rounded-xl border border-[#3d331e] bg-[#19150e] p-3 text-sm text-[#cbd5e1]">{status}</p>}
          </section>

          <section className="lg:sticky lg:top-6">
            <div className="mx-auto w-full max-w-[360px]">
              <div ref={previewRef} className="aspect-[9/16] overflow-hidden rounded-[2rem] border border-[#14b8a6]/40 bg-[#080712] p-7 shadow-2xl shadow-black/40">
                <div className="h-full rounded-[1.5rem] border border-[#14b8a6]/30 bg-[radial-gradient(circle_at_top_right,rgba(201,166,62,0.26),transparent_34%),linear-gradient(160deg,#070a0f,#171008_55%,#05060a)] p-6 flex flex-col">
                  <div>
                    <p className="text-[#14b8a6] font-black text-lg">AmCupon.ro</p>
                    <p className="text-white/60 text-xs font-bold mt-1">story de salvat</p>
                  </div>
                  <div className="mt-auto mb-auto">
                    <h2 className="text-4xl font-black leading-tight">{storyTitle(item, tone)}</h2>
                    <p className="mt-5 text-[#cbd5e1] text-lg font-bold leading-snug">{storySubtitle(item, tone)}</p>
                    {item.procent && <div className="mt-7 inline-flex bg-[#14b8a6] text-[#080712] px-5 py-3 rounded-xl text-3xl font-black">{item.procent}</div>}
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-white font-black text-sm">Link:</p>
                    <p className="text-[#cbd5e1] text-sm break-words mt-1">{shareUrl.replace(/^https?:\/\//, "")}</p>
                  </div>
                  <p className="text-white/70 text-xs font-bold mt-5">Salveaza pentru urmatoarea comanda</p>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-[#cbd5e1]">Preview. Butonul descarca PNG real 1080x1920.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
