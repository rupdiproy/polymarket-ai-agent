import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { DemoBadge } from "@/components/DemoBadge";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Polymarket AI Agent",
  description: "AI-powered automated trading on Polymarket",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background antialiased text-foreground relative overflow-x-hidden`}>
        <div className="fixed inset-0 -z-20 bg-[url('/candles-bg.png')] bg-cover bg-center bg-no-repeat opacity-30" />
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background/30 via-background/60 to-background/90 backdrop-blur-sm" />
        <Providers>
          {children}
          <Toaster position="top-right" theme="dark" />
          <DemoBadge />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
