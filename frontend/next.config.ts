import type { NextConfig } from "next";
import { REDIRECTURI } from "./lib/redirecturi";

const ALLOWED_ORIGINS = [
  "https://amcupon.ro",
  "https://www.amcupon.ro",
  // dev
  "http://localhost:3000",
];

const nextConfig: NextConfig = {
  images: {
    // Permite orice domeniu extern cu protocol https (logo-uri magazine)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // ── Redirecturi permanente ──────────────────────────────────────────────
  // Lista traieste in `lib/redirecturi.ts`, ca sa fie ACEEASI sursa citita si de
  // `app/sitemap.ts`. Doua liste manuale au divergat odata (21.08.2026: 7 URL-uri
  // redirectionate erau inca trimise la indexare) — de aia e un singur fisier.
  async redirects() {
    return REDIRECTURI;
  },

  // ── Security headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Click-jacking protection
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer — trimite origin complet doar pe acelasi site
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions (nu avem nevoie de camera/mic/geo)
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Strict-Transport-Security (HTTPS only, 1 an)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // CSP — permisiv pentru AdSense/GA4 dar fara inline scripts nesigure
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // va.vercel-scripts.com = Vercel Analytics + Speed Insights (importate in
              // layout.tsx). cdn.2performant.com = scriptul Link2 din AffiliateScript.tsx.
              // Lipseau amandoua din lista, deci propriul CSP le bloca la fiecare vizita:
              // analytics nu a inregistrat NIMIC de cand exista headerul, iar scriptul
              // retelei cu cele mai multe magazine nu a rulat niciodata. Un site care isi
              // blocheaza singur masurarea nu poate raspunde la "merita sau nu".
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.onesignal.com https://onesignal.com https://va.vercel-scripts.com https://cdn.2performant.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.brevo.com https://api.supabase.co https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://onesignal.com https:",
              "frame-src https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
              // Site-ul nu serveste niciun video sau audio (fluxul video zilnic a fost
              // scos pe 09.09.2026), deci 'none' e corect. Daca revine media pe site,
              // muta pe 'self' — altfel browserul refuza sa redea fisierul chiar daca
              // serverul il livreaza corect, si pe telefon pare fisier stricat.
              "media-src 'none'",
            ].join("; "),
          },
        ],
      },
      // ── Cache inteligent pe fisierele de date statice ─────────────────
      // Datele se actualizeaza la 4h (cron) → nu are sens re-descarcare la fiecare vizita.
      // 5 min proaspat, apoi serveste din cache si revalideaza in fundal (pana la 1h).
      // Vizite repetate = instant; banda economisita; Core Web Vitals mai bune.
      {
        source: "/:file(output|nav-index|blog-latest|products-home|products|banners|blog-posts|store-descriptions|top-produse).json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, stale-while-revalidate=3600",
          },
        ],
      },
      // ── CORS strict pe API routes ─────────────────────────────────────
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: ALLOWED_ORIGINS[0], // amcupon.ro in prod; override in dev daca e necesar
          },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default nextConfig;
