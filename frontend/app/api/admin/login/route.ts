import { cookies } from "next/headers";
import { COOKIE_NAME, COOKIE_MAX_AGE, deriveSessionToken, verifyPassword } from "@/lib/adminAuth";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));

  if (!ADMIN_PASSWORD) {
    return Response.json({ error: "ADMIN_PASSWORD not configured" }, { status: 500 });
  }
  if (!verifyPassword(password || "")) {
    return Response.json({ error: "Parola incorecta" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, deriveSessionToken(), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   COOKIE_MAX_AGE,
    path:     "/",
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return Response.json({ ok: true });
}
