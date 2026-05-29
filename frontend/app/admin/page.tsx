import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export const metadata = {
  title: "Mission Control — AmCupon.ro",
  robots: "noindex, nofollow",
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session     = cookieStore.get("mc_session")?.value;
  const isAuth      = ADMIN_PASSWORD && session === ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-black text-white mb-2">ADMIN_PASSWORD neconfigurat</h1>
          <p className="text-slate-400 text-sm">
            Adauga <code className="bg-slate-800 px-1.5 py-0.5 rounded text-orange-400">ADMIN_PASSWORD</code> in
            Vercel Environment Variables, apoi redeploy.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return <AdminLogin />;
  }

  return <AdminDashboard />;
}
