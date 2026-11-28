import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

/**
 * Fonturile noului site (25.11.2026). `latin-ext` e obligatoriu: ă, ș, ț sunt in afara setului `latin`
 * (vechiul layout incarca doar `latin`, deci diacriticele cadeau pe fontul de rezerva, cu alta forma).
 *
 * - afisaj: Bricolage Grotesque, doar pentru titluri. Fara axele opsz/wdth: fisierul ar fi mai mare, iar la
 *   marimile noastre diferenta nu se vede.
 * - text: Geist (era deja fontul site-ului).
 * - mono: Geist Mono, pentru preturi, coduri si bon, cu cifre tabulare. Nu se preincarca: apare sub titlu,
 *   iar pana vine, randurile bonului au aceeasi latime (fallback ajustat de next/font).
 */
export const afisaj = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-afisaj",
  display: "swap",
});

export const text = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-text",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const clasaFonturi = `${afisaj.variable} ${text.variable} ${mono.variable}`;
