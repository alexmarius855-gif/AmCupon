import type { NextConfig } from "next";

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
  // Uneltele de calcul (reduceri, salariu net, TVA, generator proforma) au fost
  // ELIMINATE 11.08.2026, decizie explicita Alex: cele fiscale dadeau cifre care
  // se schimba prin lege (cote CAS/CASS/impozit, cote TVA) si te pot expune daca
  // cineva isi calculeaza gresit obligatiile, iar generatorul de proforma producea
  // un document cu aspect oficial intr-un context in care e-Factura e obligatorie
  // din 2024. Nu au fost sterse pur si simplu: erau indexate si primeau trafic, deci
  // redirect 301 catre /servicii — semnalul SEO acumulat se transfera catre o pagina
  // utila, iar linkurile vechi (interne sau externe) nu ajung in 404.
  // Daca se reiau vreodata: NU repune calcule fiscale fara sursa oficiala verificata
  // la fiecare rulare + disclaimer explicit; varianta fara risc e aritmetica pura
  // (procente, reduceri), nu cote reglementate.
  async redirects() {
    return [
      { source: "/calculator",          destination: "/servicii", permanent: true },
      { source: "/calculator-salariu",  destination: "/servicii", permanent: true },
      { source: "/calculator-tva",      destination: "/servicii", permanent: true },
      { source: "/calculator-procente", destination: "/servicii", permanent: true },
      { source: "/generator-proforma",  destination: "/servicii", permanent: true },

      // ── Profitshare EXCLUS 19.08.2026 (cont respins) ──────────────────
      // Cele 60 de magazine au disparut din date. Astea sunt paginile care
      // ERAU in sitemap, deci indexate: fara 301 ar fi devenit 404-uri, adica
      // exact semnalul de calitate slaba pe care l-am reparat in august.
      // Destinatia e categoria reala a fiecaruia, nu homepage-ul.
      { source: "/cod-reducere/daedalusonline.eu", destination: "/categorii/casa-gradina", permanent: true },
      { source: "/cod-reducere/emag.ro", destination: "/categorii/marketplace", permanent: true },
      { source: "/cod-reducere/evrik.ro", destination: "/categorii/casa-gradina", permanent: true },
      { source: "/cod-reducere/exclusive-home.ro", destination: "/categorii/casa-gradina", permanent: true },
      { source: "/cod-reducere/fashiondays.ro", destination: "/categorii/fashion", permanent: true },
      { source: "/cod-reducere/giftspot.ro", destination: "/categorii/cadouri-flori", permanent: true },
      { source: "/cod-reducere/itgalaxy.ro", destination: "/categorii/electronice", permanent: true },
      { source: "/cod-reducere/libris.ro", destination: "/categorii/carti-educatie", permanent: true },
      { source: "/cod-reducere/mathaus.ro", destination: "/categorii/casa-gradina", permanent: true },
      { source: "/cod-reducere/pcmadd.com", destination: "/categorii/electronice", permanent: true },
      { source: "/cod-reducere/pint.ro", destination: "/categorii/auto-moto", permanent: true },
      { source: "/cod-reducere/vapetronic.ro", destination: "/categorii/marketplace", permanent: true },
      { source: "/cod-reducere/vegis.ro", destination: "/categorii/marketplace", permanent: true },
      { source: "/emag", destination: "/categorii/marketplace", permanent: true },
      { source: "/fashiondays", destination: "/fashion", permanent: true },
      { source: "/libris", destination: "/carti", permanent: true },
      { source: "/vegis", destination: "/sanatate", permanent: true },
    ];
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://cdn.onesignal.com https://onesignal.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://api.brevo.com https://api.supabase.co https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://onesignal.com https:",
              "frame-src https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
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
