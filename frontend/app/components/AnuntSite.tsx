"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Bara subtire de sus, pe toate paginile in afara de prima (acolo carligul e chiar pagina).
 * 03.11.2026: inlocuieste ticker-ul rotativ (AnuntAnimat), care descarca nav-index.json (~196 KB) la fiecare
 * pagina si a afisat pe primul rand al site-ului texte pentru afiliati din retele. Textul vine din layout, din date.
 */
export default function AnuntSite({ text, href }: { text: string; href: string }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === href) return null;
  return (
    <Link href={href} className="block bg-[var(--surface-alt)] border-b border-[var(--border)] px-4 py-1.5 text-center text-xs font-semibold text-[var(--text-soft)] hover:text-[var(--accent-text)] transition-colors">
      {text} <span className="text-[var(--accent-text)]" aria-hidden="true">→</span>
    </Link>
  );
}
