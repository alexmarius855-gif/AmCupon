import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Permite orice domeniu extern cu protocol https (logo-uri magazine)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Mareste cache la 30 de zile pentru logo-urile externe (default: 60s)
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
