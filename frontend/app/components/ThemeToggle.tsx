"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Citeste preferinta salvata
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  // Ascunde inainte de hydration ca sa evitam flash
  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl ${className}`} aria-hidden="true" />
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Activeaza modul luminos" : "Activeaza modul inchis"}
      title={dark ? "Mod luminos" : "Mod inchis"}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
        ${dark
          ? "bg-slate-700 hover:bg-slate-600 text-yellow-300"
          : "bg-gray-100 hover:bg-gray-200 text-gray-600"
        } ${className}`}
    >
      {dark ? (
        /* Sun icon */
        <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="5" strokeWidth="2"/>
          <path strokeLinecap="round" strokeWidth="2"
            d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
      ) : (
        /* Moon icon */
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
}
