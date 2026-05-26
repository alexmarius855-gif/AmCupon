/**
 * /ads.txt — cerut de Google AdSense pentru verificarea proprietatii
 * Inlocuieste pub-XXXXXXXXXXXXXXXX cu ID-ul tau din AdSense
 */
export const runtime = "edge";

export async function GET() {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-1744566936173747";
  const content   = `google.com, ${adsenseId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
