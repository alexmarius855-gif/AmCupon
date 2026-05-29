import { Metadata } from "next";
import ComparatorClient from "./ComparatorClient";

export const metadata: Metadata = {
  title: "Comparator Magazine — AmCupon.ro",
  description: "Compară două magazine online side-by-side: oferte active, coduri reducere, trust score, cashback. Alege cel mai bun magazin pentru tine.",
  alternates: { canonical: "https://amcupon.ro/comparator" },
};

export default function ComparatorPage() {
  return <ComparatorClient />;
}
