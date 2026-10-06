import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/features/ui/components/header";
import { Footer } from "@/features/ui/components/footer";

// Self-hosted latin subset (SIL OFL): next/font/google hashes this CJK font
// differently on server and client, so the display variable never applied.
const display = localFont({
  src: "./fonts/dela-gothic-one-latin.woff2",
  weight: "400",
  variable: "--font-display",
});

const body = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Yusa Liu | Backend Engineer",
  description: "Portfolio and Blog of Yusa Liu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
