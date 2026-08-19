import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
import { checkAuth } from "../../../lib/adminAuth";
import SocialStudio, { type SocialItem } from "./SocialStudio";

export const metadata = {
  title: "Social Studio - AmCupon.ro",
  robots: "noindex, nofollow",
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function loadSocialItems(): SocialItem[] {
  const candidates = [
    path.join(process.cwd(), "..", "data", "postari-zilnice.json"),
    path.join(process.cwd(), "data", "postari-zilnice.json"),
  ];

  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return [];

  try {
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as SocialItem[];
    return parsed
      .filter((item) => item.link && item.nume)
      .filter((item) => typeof item.zile_ramase !== "number" || item.zile_ramase > 2)
      .slice(0, 24);
  } catch {
    return [];
  }
}

export default async function AdminSocialPage() {
  // BUG REPARAT 19.08.2026: aici se compara cookie-ul de sesiune DIRECT cu
  // `ADMIN_PASSWORD` in clar. Dar `login/route.ts` stocheaza un HASH derivat
  // (`deriveSessionToken()`), deci comparatia nu se putea potrivi NICIODATA —
  // pagina era inaccesibila cu orice parola. Exact acelasi bug a fost reparat
  // pe 06.08 in `app/admin/page.tsx`; supravietuise aici, necontrolat.
  // Regula: autentificarea de admin trece MEREU prin `checkAuth()`.
  const isAuth = await checkAuth();

  if (!ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen bg-[#06080b] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-black text-white mb-2">ADMIN_PASSWORD neconfigurat</h1>
          <p className="text-[#c9ced5] text-sm">Configureaza parola de admin in Vercel Environment Variables.</p>
        </div>
      </div>
    );
  }

  if (!isAuth) redirect("/admin");

  return <SocialStudio items={loadSocialItems()} />;
}
