"use client";

import { useState } from "react";

interface ShareButtonProps {
  /** path relativ sau URL complet — ex: "/cod-reducere/emag.ro" */
  pageSlug: string;
  /** Titlul ofertei, afișat în mesajul de share */
  title: string;
  /** Textul mesajului (fără URL, se adaugă automat) */
  text: string;
  /** Dimensiune redusă pentru card-uri */
  small?: boolean;
  /** Label afișat lângă icon; default "Share" */
  label?: string;
  /** Temă vizuală: "dark" (default) sau "light" */
  theme?: "dark" | "light";
}

const BASE = "https://amcupon.ro";

export default function ShareButton({
  pageSlug,
  title,
  text,
  small = false,
  label = "Share",
  theme = "dark",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = pageSlug.startsWith("http") ? pageSlug : `${BASE}${pageSlug}`;
  const shareText = `${text}\n\n👉 ${fullUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(text)}`;

  async function toggle() {
    // Pe mobil foloseşte Web Share API nativ
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: fullUrl });
        return;
      } catch {
        // user a anulat sau browser nu suportă — fallback la dropdown
      }
    }
    setOpen((v) => !v);
  }

  function copyLink() {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(fullUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 2000);
  }

  const isDark = theme === "dark";
  const btnBase = small
    ? "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
    : "flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl";

  const btnColors = isDark
    ? "border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
    : "border border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-400";

  const dropdownBg = isDark
    ? "bg-slate-800 border-slate-700"
    : "bg-white border-gray-200";

  const itemHover = isDark ? "hover:bg-slate-700" : "hover:bg-gray-50";
  const dividerColor = isDark ? "border-slate-700" : "border-gray-200";
  const copyColor = isDark ? "text-slate-300" : "text-gray-600";

  return (
    <div className="relative inline-block">
      <button
        onClick={toggle}
        className={`${btnBase} ${btnColors} transition-colors`}
        title="Distribuie oferta"
        type="button"
      >
        {/* share icon */}
        <svg
          className={small ? "w-3 h-3" : "w-3.5 h-3.5"}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {!small && <span>{label}</span>}
      </button>

      {open && (
        <>
          {/* overlay transparent pentru click-afara */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* dropdown */}
          <div className={`absolute right-0 top-full mt-1.5 z-50 ${dropdownBg} border rounded-2xl shadow-2xl shadow-black/20 p-2 min-w-[170px]`}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-green-600 ${itemHover} transition-colors whitespace-nowrap`}
              onClick={() => setOpen(false)}
            >
              <span className="text-base">💬</span> WhatsApp
            </a>
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-600 ${itemHover} transition-colors whitespace-nowrap`}
              onClick={() => setOpen(false)}
            >
              <span className="text-base">📘</span> Facebook
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-sky-500 ${itemHover} transition-colors whitespace-nowrap`}
              onClick={() => setOpen(false)}
            >
              <span className="text-base">✈️</span> Telegram
            </a>
            <div className={`border-t ${dividerColor} my-1`} />
            <button
              onClick={copyLink}
              type="button"
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold ${copyColor} ${itemHover} transition-colors whitespace-nowrap`}
            >
              <span className="text-base">{copied ? "✅" : "🔗"}</span>
              {copied ? "Link copiat!" : "Copiaza link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
