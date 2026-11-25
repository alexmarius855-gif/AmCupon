import { permanentRedirect } from "next/navigation";
import fs from "fs";
import path from "path";

function loadSlugs(): string[] {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((m: { magazin: string }) => m.magazin);
}

export async function generateStaticParams() {
  return loadSlugs().map((magazin) => ({ magazin }));
}

export default async function RedirectMagazin({
  params,
}: {
  params: Promise<{ magazin: string }>;
}) {
  const { magazin } = await params;
  permanentRedirect(`/cod-reducere/${magazin}`);
}
