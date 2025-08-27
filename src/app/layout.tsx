import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fontInter = localFont({
  src: [
    { path: "../fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Condors Rides",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontInter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className="min-h-screen w-screen overflow-y-auto font-sans antialiased">
          <Toaster />
          {children}
        </div>
      </body>
    </html>
  );
}
