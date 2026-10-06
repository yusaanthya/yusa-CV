import type { Metadata } from "next";
import { Bricolage_Grotesque, Dela_Gothic_One } from "next/font/google";
import "./globals.css";
import { Header } from "@/features/ui/components/header";
import { Footer } from "@/features/ui/components/footer";

const display = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
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
