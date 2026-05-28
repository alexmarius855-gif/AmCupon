import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const GITHUB_TOKEN   = process.env.ADMIN_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "";
const GITHUB_REPO    = process.env.GITHUB_REPO || "alexmarius855/afiliere-site";

async function checkAuth(): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  return cookieStore.get("mc_session")?.value === ADMIN_PASSWORD;
}

const WORKFLOWS: Record<string, string> = {
  "update-data":    "update-data.yml",
  "run-agent":      "run-agent.yml",
};

export async function POST(request: Request) {
  if (!(await checkAuth())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!GITHUB_TOKEN) {
    return Response.json({ error: "ADMIN_GITHUB_TOKEN not configured" }, { status: 500 });
  }

  const { workflow, inputs } = await request.json().catch(() => ({ workflow: "", inputs: {} }));

  const workflowFile = WORKFLOWS[workflow];
  if (!workflowFile) {
    return Response.json({ error: `Workflow necunoscut: ${workflow}` }, { status: 400 });
  }

  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization:          `Bearer ${GITHUB_TOKEN}`,
        Accept:                 "application/vnd.github+json",
        "Content-Type":         "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref: "main", inputs: inputs || {} }),
    }
  );

  if (res.status === 204) {
    return Response.json({ ok: true, message: `Workflow '${workflow}' pornit cu succes!` });
  }
  const err = await res.json().catch(() => ({}));
  return Response.json(
    { error: err.message || "Eroare GitHub Actions" },
    { status: res.status }
  );
}
