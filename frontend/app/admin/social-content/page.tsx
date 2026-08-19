import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { checkAuth } from "../../../lib/adminAuth";
import PachetZilnic, { type Manifest } from "./PachetZilnic";

export const metadata = {
  title: "Pachet social zilnic — AmCupon.ro",
  robots: "noindex, nofollow",
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

/**
 * Manifestul zilei, scris de `scripts/social_content_factory.py`.
 * `latest.json` pointeaza mereu catre ultima rulare, deci pagina nu trebuie sa
 * ghiceasca data si nu se strica daca pipeline-ul sare o zi.
 */
function incarcaManifest(): Manifest | null {
  const cale = path.join(process.cwd(), "public", "daily-content", "latest.json");
  try {
    if (!fs.existsSync(cale)) return null;
    return JSON.parse(fs.readFileSync(cale, "utf-8")) as Manifest;
  } catch {
    return null;
  }
}

export default async function PaginaSocialContent() {
  if (!ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen bg-[#06080b] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-black text-white mb-2">ADMIN_PASSWORD neconfigurat</h1>
          <p className="text-[#c9ced5] text-sm">
            Configureaza parola de admin in Vercel Environment Variables.
          </p>
        </div>
      </div>
    );
  }

  if (!(await checkAuth())) redirect("/admin");

  return <PachetZilnic manifest={incarcaManifest()} />;
}
