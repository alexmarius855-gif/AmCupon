"use client";

/** Arata ca un camp de cautare, deschide SearchModal: o singura implementare de cautare pe site. */
export default function ButonCautare({ text, className = "" }: { text: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("amcupon:cauta"))}
      className={`group flex items-center gap-3 w-full bg-[var(--surface-alt)] border border-[var(--border-strong)] hover:border-[var(--accent-text)]/50 rounded-full px-4 py-3 text-sm text-left transition-colors ${className}`}
    >
      <svg className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent-text)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>
      <span className="text-[var(--text-muted)] truncate">{text}</span>
    </button>
  );
}
