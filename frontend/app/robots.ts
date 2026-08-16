import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // `/go/` = redirect de afiliere, nu continut. Nu are ce cauta in index,
        // iar crawl-ul lui ar consuma din bugetul (mic) al domeniului degeaba.
        disallow: ["/api/", "/_next/", "/admin", "/go/"],
      },
    ],
    sitemap: "https://amcupon.ro/sitemap.xml",
    host: "https://amcupon.ro",
  };
}
