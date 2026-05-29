import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const ADMIN_PASSWORD  = process.env.ADMIN_PASSWORD || "";
const GITHUB_TOKEN    = process.env.ADMIN_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "";
const GITHUB_REPO     = process.env.GITHUB_REPO || "alexmarius855-gif/AmCupon";
const BREVO_API_KEY   = process.env.BREVO_API_KEY || "";
const BREVO_LIST_ID   = parseInt(process.env.BREVO_LIST_ID || "2", 10);

async function checkAuth(): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  return cookieStore.get("mc_session")?.value === ADMIN_PASSWORD;
}

async function getSiteStats() {
  try {
    const filePath = path.join(process.cwd(), "public", "output.json");
    const data: { magazin: string; are_promotie: boolean; cod_cupon: boolean; promotii: unknown[] }[] =
      JSON.parse(fs.readFileSync(filePath, "utf-8"));

    const totalMagazine   = data.length;
    const cuPromotii      = data.filter(m => m.are_promotie).length;
    const cuCod           = data.filter(m => m.cod_cupon).length;
    const totalPromotii   = data.reduce((a, m) => a + (m.promotii?.length || 0), 0);

    // Data de modificare a fisierului
    const stat       = fs.statSync(filePath);
    const lastUpdate = stat.mtime.toISOString();

    return { totalMagazine, cuPromotii, cuCod, totalPromotii, lastUpdate };
  } catch {
    return null;
  }
}

async function getGitHubActions() {
  if (!GITHUB_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept:        "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.workflow_runs?.map((r: {
      id: number; name: string; status: string; conclusion: string | null;
      created_at: string; updated_at: string; html_url: string;
    }) => ({
      id:         r.id,
      name:       r.name,
      status:     r.status,
      conclusion: r.conclusion,
      createdAt:  r.created_at,
      updatedAt:  r.updated_at,
      url:        r.html_url,
    })) || [];
  } catch {
    return null;
  }
}

async function getBrevoStats() {
  if (!BREVO_API_KEY) return null;
  try {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}`,
      {
        headers: { "api-key": BREVO_API_KEY, Accept: "application/json" },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      subscribers:    data.totalSubscribers || 0,
      blacklisted:    data.totalBlacklisted || 0,
      listName:       data.name || "Newsletter",
    };
  } catch {
    return null;
  }
}

async function getTopProduse() {
  try {
    const filePath = path.join(process.cwd(), "public", "top-produse.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return {
      categorii: data.categorii?.length || 0,
      produse:   data.categorii?.reduce((a: number, c: { produse: unknown[] }) => a + c.produse.length, 0) || 0,
      updated:   data.updated,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  if (!(await checkAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [siteStats, githubRuns, brevoStats, topProduse] = await Promise.all([
    getSiteStats(),
    getGitHubActions(),
    getBrevoStats(),
    getTopProduse(),
  ]);

  return Response.json({
    ok:          true,
    timestamp:   new Date().toISOString(),
    site:        siteStats,
    github:      githubRuns,
    brevo:       brevoStats,
    topProduse,
    env: {
      hasGithubToken: !!GITHUB_TOKEN,
      hasBrevoKey:    !!BREVO_API_KEY,
      hasAdminPass:   !!ADMIN_PASSWORD,
    },
  });
}
