import { ImageResponse } from "next/og";
import { criterii } from "@/lib/criterii";
import { numeAfisat } from "@/lib/numeMagazin";
import { imagineSigura, titluAfisat } from "@/lib/topFeed";

/**
 * `/api/story/<id>` — imaginea unui produs pentru Facebook si Instagram Stories, 1080x1920 (04.11.2026).
 * Doar produse din public/criterii.json, deci nu descarca adrese primite din afara. Pretul e cel din feed, cu data lui.
 */
export const runtime = "nodejs";

const lei = (n: number) => `${n.toLocaleString("ro-RO", { maximumFractionDigits: 0 })} lei`;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const cautat = decodeURIComponent(id || "");
  for (const c of criterii()) {
    const p = c.produse.find((x) => x.id === cautat);
    if (!p) continue;
    const vechi = typeof p.pret_vechi === "number" && p.pret_vechi > p.pret ? p.pret_vechi : null;
    const procent = vechi ? Math.round(((vechi - p.pret) / vechi) * 100) : 0;
    // Biblioteca de imagini nu citeste WebP: fara poza, dar cu preturile corecte.
    const img = imagineSigura(p.imagine);
    const poza = img && !/\.webp(\?|$)/i.test(img) ? img : null;
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0d1014", color: "white", padding: 80, fontFamily: "sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 52, fontWeight: 900 }}>
            <div style={{ display: "flex", background: "#ddf93c", color: "#0c1000", padding: "6px 18px", borderRadius: 16, marginRight: 12 }}>Am</div>
            Cupon.ro
          </div>
          <div style={{ display: "flex", flex: 1, marginTop: 70, background: "white", borderRadius: 40, alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {poza ? (
              // eslint-disable-next-line @next/next/no-img-element -- ImageResponse nu foloseste next/image
              <img src={poza} alt="" width={800} height={800} style={{ objectFit: "contain" }} />
            ) : null}
            {procent > 0 && (
              <div style={{ display: "flex", position: "absolute", top: 40, left: 40, background: "#ddf93c", color: "#0c1000", fontSize: 92, fontWeight: 900, padding: "14px 34px", borderRadius: 28 }}>-{procent}%</div>
            )}
          </div>
          <div style={{ display: "flex", marginTop: 60, fontSize: 52, fontWeight: 700, lineHeight: 1.2 }}>{titluAfisat(p.titlu).slice(0, 90)}</div>
          {vechi && <div style={{ display: "flex", marginTop: 40, fontSize: 56, color: "#9aa3ad", textDecoration: "line-through" }}>{lei(vechi)}</div>}
          <div style={{ display: "flex", marginTop: 10, fontSize: 130, fontWeight: 900, color: "#ddf93c" }}>{lei(p.pret)}</div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 38, color: "#c9ced5" }}>la {numeAfisat(p.magazin)} · preț din feed, {c.actualizat.split("-").reverse().join(".")}</div>
        </div>
      ),
      { width: 1080, height: 1920, headers: { "Cache-Control": "public, max-age=3600" } },
    );
  }
  return new Response("Produs necunoscut", { status: 404 });
}
