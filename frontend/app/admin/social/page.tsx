import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";
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
  const cookieStore = await cookies();
  const session = cookieStore.get("mc_session")?.value;
  const isAuth = ADMIN_PASSWORD && session === ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-black text-white mb-2">ADMIN_PASSWORD neconfigurat</h1>
          <p className="text-[#cbd5e1] text-sm">Configureaza parola de admin in Vercel Environment Variables.</p>
        </div>
      </div>
    );
  }

  if (!isAuth) redirect("/admin");

  return <SocialStudio items={loadSocialItems()} />;
}
