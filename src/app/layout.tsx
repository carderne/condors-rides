import { CondorsHeader } from "@/components/header/header";
import { maybeGetMembership } from "@/dal/membership";
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
  const user = await maybeGetMembership();
  return (
    <html lang="en" className={`${fontInter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className="w-screen max-w-full overflow-y-scroll font-sans antialiased">
          <CondorsHeader user={user} />
          <div className="relative mx-auto h-screen w-full px-2 pt-4 md:max-w-[100ch] md:px-0 md:px-12">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
