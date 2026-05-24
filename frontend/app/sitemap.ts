import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

const BASE_URL = "https://amcupon.ro";

export default function sitemap(): MetadataRoute.Sitemap {
  const filePath = path.join(process.cwd(), "public", "output.json");
  const magazine: { magazin: string; are_promotie: boolean }[] = JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );

  const magazineRoutes: MetadataRoute.Sitemap = magazine.map((m) => ({
    url: `${BASE_URL}/reduceri/${m.magazin}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: m.are_promotie ? 0.8 : 0.5,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...magazineRoutes,
  ];
}
