import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AmCupon.ro — Coduri de reducere verificate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative orange circle top-right */}
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 320, height: 320, borderRadius: "50%",
          background: "#F97316", opacity: 0.08,
          display: "flex",
        }} />
        {/* Decorative green circle bottom-left */}
        <div style={{
          position: "absolute", bottom: -40, left: -40,
          width: 240, height: 240, borderRadius: "50%",
          background: "#10B981", opacity: 0.08,
          display: "flex",
        }} />

        {/* Top: Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 50 }}>
          <div style={{
            background: "#F97316", color: "white",
            fontWeight: 900, fontSize: 28, padding: "8px 14px",
            borderRadius: 12,
            display: "flex",
          }}>Am</div>
          <span style={{ color: "white", fontWeight: 900, fontSize: 38 }}>Cupon</span>
          <span style={{ color: "#F97316", fontWeight: 900, fontSize: 38 }}>.ro</span>
        </div>

        {/* Main text */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div style={{ color: "white", fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}>
            Coduri de reducere
          </div>
          <div style={{ color: "#FB923C", fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginBottom: 28 }}>
            verificate zilnic
          </div>
          <div style={{ color: "#94a3b8", fontSize: 26, marginBottom: 40 }}>
            Peste 300 magazine partenere · 100% gratuit
          </div>

          {/* Stats pills */}
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{
              background: "rgba(249,115,22,0.15)", color: "#FB923C",
              borderRadius: 24, padding: "10px 24px",
              fontSize: 18, fontWeight: 700,
              display: "flex",
            }}>✓ 300+ magazine</div>
            <div style={{
              background: "rgba(16,185,129,0.15)", color: "#34D399",
              borderRadius: 24, padding: "10px 24px",
              fontSize: 18, fontWeight: 700,
              display: "flex",
            }}>⚡ Actualizat zilnic</div>
            <div style={{
              background: "rgba(99,102,241,0.15)", color: "#818cf8",
              borderRadius: 24, padding: "10px 24px",
              fontSize: 18, fontWeight: 700,
              display: "flex",
            }}>🎯 Gratuit 100%</div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 20,
          color: "#64748b", fontSize: 16,
          display: "flex",
        }}>
          amcupon.ro · Coduri de reducere Romania
        </div>
      </div>
    ),
    { ...size }
  );
}
