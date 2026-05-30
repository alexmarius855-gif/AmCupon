"use client";

/**
 * BannerAd2P — Banner publicitar 2Performant
 * Afișează un banner afiliat cu tracking complet.
 * Eticheta "Publicitate" e obligatorie (Google AdSense policy + GDPR).
 */

interface Banner {
  id: number;
  image_url: string;
  landing_url: string;
  landing_raw: string;
  width: number;
  height: number;
  merchant: string;
  merchant_slug: string;
  name: string;
  category: string;
  b_type: string;
}

interface BannerAd2PProps {
  banner: Banner;
  /** Afișează eticheta "Publicitate" (default: true) */
  showLabel?: boolean;
  /** Aliniere: center | left | right (default: center) */
  align?: "center" | "left" | "right";
}

export default function BannerAd2P({
  banner,
  showLabel = true,
  align = "center",
}: BannerAd2PProps) {
  if (!banner?.image_url || !banner?.landing_url) return null;

  const alignClass =
    align === "left" ? "items-start" :
    align === "right" ? "items-end" :
    "items-center";

  // Limitam dimensiunea maxima pe ecrane mici
  const maxW = Math.min(banner.width, 336);
  const maxH = banner.width > 0
    ? Math.round((banner.height / banner.width) * maxW)
    : banner.height;

  return (
    <div className={`flex flex-col gap-1.5 ${alignClass}`}>
      {showLabel && (
        <span className="text-[10px] text-slate-600 font-medium uppercase tracking-widest">
          Publicitate
        </span>
      )}
      <a
        href={banner.landing_url}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        title={banner.merchant}
        onClick={() => {
          try {
            if (typeof window !== "undefined" && (window as unknown as {gtag?: (...a: unknown[]) => void}).gtag) {
              (window as unknown as {gtag: (...a: unknown[]) => void}).gtag("event", "banner_click", {
                event_category: "afiliere",
                event_label: banner.merchant,
                banner_id: banner.id,
                value: 1,
              });
            }
          } catch {}
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.image_url}
          alt={banner.merchant}
          title={banner.name || banner.merchant}
          width={maxW}
          height={maxH}
          loading="lazy"
          style={{
            maxWidth: "100%",
            height: "auto",
            border: 0,
            display: "block",
            borderRadius: "12px",
          }}
        />
      </a>
    </div>
  );
}
