import { Metadata } from "next";
import ComparatorClient from "./ComparatorClient";

export const metadata: Metadata = {
  title: "Comparator Magazine — AmCupon.ro",
  // 20.09.2026: descrierea promitea „trust score, cashback" — ambele eliminate pe
  // 07.09 fiindca erau fabricate (procent_succes random, respectiv comisionul nostru
  // afisat ca beneficiu al cumparatorului). Textul ramasese in urma.
  description: "Compară două magazine online side-by-side: oferte active, coduri de reducere și Deal Score calculat din date reale.",
  alternates: { canonical: "https://amcupon.ro/comparator" },
};

export default function ComparatorPage() {
  return <ComparatorClient />;
}
