import {
  Baby, BookOpen, Car, CreditCard, Dumbbell, Gamepad2, Gem, Gift, HeartPulse,
  Home, Laptop, MonitorSmartphone, PawPrint, Pill, Plane, Shirt, ShoppingBag,
  Smartphone, Sparkles, UtensilsCrossed, type LucideIcon,
} from "lucide-react";

/**
 * Iconografie unificata pentru categorii.
 *
 * De ce (08.08.2026): categoriile foloseau EMOJI mari (👗🏡💻) pe patrate cu
 * gradient saturat, in 16 nuante diferite. Doua probleme reale:
 *   1. Emoji-ul se randeaza diferit pe fiecare sistem de operare si nu poate fi
 *      stilizat (grosime, culoare, dimensiune optica) — arata ca un proiect de
 *      hobby, nu ca un produs.
 *   2. Cele 16 culori saturate se bat cap in cap. Ironic, CLAUDE.md documenteaza
 *      ca "curcubeul" de gradiente per-card a fost eliminat pe 30.06 — dar exact
 *      asta ramasese pe categorii.
 *
 * Solutia: iconita vectoriala (Lucide, deja in proiect) + paleta RESTRANSA de 5
 * familii cromatice in loc de 16 culori independente. Culoarea sustine iconita,
 * nu tipa peste ea: fundal neutru de card, accentul e doar pe simbol.
 */

// 5 familii, nu 16 culori. Categoriile inrudite impart aceeasi nuanta — asa
// paleta ramane coerenta si tot se pot distinge grupurile dintr-o privire.
const FAMILII = {
  tech:    "#38bdf8", // sky   — electronice, software, telecom
  moda:    "#f472b6", // pink  — fashion, beauty, bijuterii
  casa:    "#4ade80", // green — casa, animale, mancare
  viata:   "#c084fc", // purple— carti, copii, cadouri, calatorii
  brand:   "#ddf93c", // teal  — accentul site-ului: sanatate, financiar, restul
} as const;

interface CatVisual { icon: LucideIcon; color: string }

const MAP: Record<string, CatVisual> = {
  "fashion":          { icon: Shirt,             color: FAMILII.moda  },
  "beauty":           { icon: Sparkles,          color: FAMILII.moda  },
  "bijuterii":        { icon: Gem,               color: FAMILII.moda  },

  "electronice":      { icon: Laptop,            color: FAMILII.tech  },
  "software":         { icon: MonitorSmartphone, color: FAMILII.tech  },
  "telecom":          { icon: Smartphone,        color: FAMILII.tech  },

  "casa-gradina":     { icon: Home,              color: FAMILII.casa  },
  "animale":          { icon: PawPrint,          color: FAMILII.casa  },
  "mancare-bauturi":  { icon: UtensilsCrossed,   color: FAMILII.casa  },

  "carti-educatie":   { icon: BookOpen,          color: FAMILII.viata },
  "copii":            { icon: Baby,              color: FAMILII.viata },
  "cadouri-flori":    { icon: Gift,              color: FAMILII.viata },
  "calatorii":        { icon: Plane,             color: FAMILII.viata },

  "sanatate":         { icon: HeartPulse,        color: FAMILII.brand },
  "financiar":        { icon: CreditCard,        color: FAMILII.brand },
  "sport":            { icon: Dumbbell,          color: FAMILII.brand },
  "auto-moto":        { icon: Car,               color: FAMILII.brand },
  "marketplace":      { icon: ShoppingBag,       color: FAMILII.brand },

  // Aliasuri pentru categoriile de PRODUSE, care vin din generate_homepage_data.py
  // (CAT_META) cu sluguri in ENGLEZA — set diferit de cel al magazinelor, de mai sus.
  // Nu unifica cele doua liste: sunt taxonomii separate, documentate in CLAUDE.md.
  "electronics-itc":     { icon: Laptop,          color: FAMILII.tech  },
  "home-garden":         { icon: Home,            color: FAMILII.casa  },
  "sports-outdoors":     { icon: Dumbbell,        color: FAMILII.brand },
  "pharma":              { icon: Pill,            color: FAMILII.brand },
  "health-personal-care":{ icon: HeartPulse,      color: FAMILII.brand },
  "babies-kids-toys":    { icon: Baby,            color: FAMILII.viata },
  "automotive":          { icon: Car,             color: FAMILII.brand },
  "books":               { icon: BookOpen,        color: FAMILII.viata },
  "pet-supplies":        { icon: PawPrint,        color: FAMILII.casa  },
  "gifts-flowers":       { icon: Gift,            color: FAMILII.viata },
  "hypermarket-groceries": { icon: UtensilsCrossed, color: FAMILII.casa },
  "jewelry":             { icon: Gem,             color: FAMILII.moda  },
  "games":               { icon: Gamepad2,        color: FAMILII.viata },
  "online-mall":         { icon: ShoppingBag,     color: FAMILII.brand },
};

const IMPLICIT: CatVisual = { icon: ShoppingBag, color: FAMILII.brand };

export function categoryVisual(slug: string): CatVisual {
  return MAP[slug] || IMPLICIT;
}

/**
 * Iconita de categorie intr-o placa neutra. `size`:
 *   sm — chips / bara orizontala   md — grila secundara   lg — carduri mari
 */
export default function CategoryIcon({
  slug, size = "md", className = "",
}: { slug: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const { icon: Icon, color } = categoryVisual(slug);
  const box  = size === "lg" ? "w-12 h-12" : size === "md" ? "w-10 h-10" : "w-7 h-7";
  const glyph = size === "lg" ? "w-6 h-6"  : size === "md" ? "w-5 h-5"  : "w-4 h-4";

  return (
    <span
      className={`inline-flex items-center justify-center ${box} rounded-xl shrink-0 ${className}`}
      style={{
        // Tinta subtila din culoarea familiei, nu gradient saturat: cardul ramane
        // calm, iar simbolul e cel care poarta informatia.
        background: `${color}1a`,
        border: `1px solid ${color}33`,
      }}
    >
      <Icon className={glyph} style={{ color }} strokeWidth={2} />
    </span>
  );
}
