import { checkAuth } from "@/lib/adminAuth";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";

export const metadata = {
  title: "Mission Control — AmCupon.ro",
  robots: "noindex, nofollow",
};

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export default async function AdminPage() {
  // Foloseste helper-ul comun din lib/adminAuth.ts (acelasi folosit deja de
  // /api/admin/status si /api/admin/trigger). Inainte, pagina asta compara
  // direct cookie-ul cu ADMIN_PASSWORD in clar — dar login/route.ts seteaza
  // cookie-ul ca hash SHA-256 (deriveSessionToken), nu parola in clar, de
  // cand s-a facut hardening-ul de securitate (comentariu in adminAuth.ts).
  // Rezultat: verificarea veche nu se potrivea NICIODATA, indiferent cat de
  // corecta era parola introdusa — bug gasit si reparat 06.08.2026.
  const isAuth = await checkAuth();

  if (!ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-black text-white mb-2">ADMIN_PASSWORD neconfigurat</h1>
          <p className="text-[#cbd5e1] text-sm">
            Adauga <code className="bg-[#0a0f1a] px-1.5 py-0.5 rounded text-orange-400">ADMIN_PASSWORD</code> in
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
