import { UsePullToRefresh } from "@/components/pwa/pull-refresh";
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
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Condors" />
        <link rel="manifest" href="/site.webmanifest" />

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.setAppPlatform = function(value) {
              window.__appPlatform = value;
            };
          `,
          }}
        />
      </head>
      <body>
        <div className="min-h-screen font-sans antialiased">
          <Toaster position="top-right" />
          <UsePullToRefresh />
          {children}
        </div>
      </body>
    </html>
  );
}
