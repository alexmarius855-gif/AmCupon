import { cookies } from "next/headers";
import crypto from "crypto";

// Autentificare admin partajata intre /api/admin/login, /status, /trigger.
// Inainte: cookie-ul de sesiune era chiar parola in clar + comparatie
// directa (===) vulnerabila la timing attack. Acum: cookie-ul e un hash
// derivat (nu expune parola daca se scurge din vreun motiv), iar
// verificarea parolei introduse foloseste timingSafeEqual pe hash-uri
// de lungime fixa (timingSafeEqual cere lungimi egale).

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
export const COOKIE_NAME = "mc_session";
export const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function sha256(input: string): Buffer {
  return crypto.createHash("sha256").update(input).digest();
}

/** Token de sesiune derivat din parola — NU e parola insasi. */
export function deriveSessionToken(): string {
  return sha256(`${ADMIN_PASSWORD}:mc_session_v1`).toString("hex");
}

/** Comparatie constant-time — evita scurgerea parolei prin timing de raspuns. */
export function verifyPassword(candidate: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const a = sha256(candidate);
  const b = sha256(ADMIN_PASSWORD);
  return crypto.timingSafeEqual(a, b);
}

export async function checkAuth(): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false;
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;
  if (!cookieValue) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(cookieValue, "hex"), sha256(`${ADMIN_PASSWORD}:mc_session_v1`));
  } catch {
    return false; // cookie malformat (nu e hex de 64 caractere) -> neautentificat
  }
}
