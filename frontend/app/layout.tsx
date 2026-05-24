import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AmCupon.ro - Coduri de reducere si oferte verificate",
  description: "Coduri de reducere verificate si oferte exclusive de la cele mai mari magazine online din Romania. Actualizat zilnic.",
  verification: {
    google: "UvsbX8yxIp1eGwFK5ESqVXzA6jT5wjcTartEIPG5mqw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ro"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src="https://cdn.2performant.com/l2/link2.js"
          id="linkTwoPerformant"
          data-id="l2/0/2/1/0/7/5/9/7/5/2"
          data-api-host="https://cdn.2performant.com"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
