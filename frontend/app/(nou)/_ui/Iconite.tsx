/** Iconitele noului site: SVG in linie, fara biblioteca (lucide-react cantarea in fiecare pagina veche). */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function IconCauta() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...P}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconMeniu() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...P}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function IconBifa({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...P}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...P}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Semnul marcii: un bon cu marginea perforata si o bara de pret. */
export function SemnMarca() {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path
        d="M6 3h16v20.5l-2-1.6-2 1.6-2-1.6-2 1.6-2-1.6-2 1.6-2-1.6-2 1.6z"
        fill="currentColor"
        opacity=".18"
      />
      <path
        d="M6 3h16v20.5l-2-1.6-2 1.6-2-1.6-2 1.6-2-1.6-2 1.6-2-1.6-2 1.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 9h8M10 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17.5" cy="13" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function IconRegula({ tip }: { tip: "ceas" | "cos" | "termometru" | "ban" }) {
  if (tip === "ceas") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...P}>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    );
  }
  if (tip === "cos") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...P}>
        <path d="M4 5h2l2 10h9l2-7H7.2" />
        <circle cx="9.5" cy="19" r="1.3" />
        <circle cx="16.5" cy="19" r="1.3" />
      </svg>
    );
  }
  if (tip === "termometru") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...P}>
        <path d="M3 12h18" />
        <path d="M7 9v6M17 9v6" />
        <path d="M11 6.5 12.5 9 14 6.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...P}>
      <path d="M12 3v18M17 7.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2.2 2.6 5 3.2 5 1.4 5 3.3-2.2 3-5 3-5-1.1-5-3" />
    </svg>
  );
}
