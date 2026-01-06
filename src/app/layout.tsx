import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { GlobalErrorHandler } from "@/components/global-error-handler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Dashboard Uskup Surabaya",
  description: "Sistem Manajemen Data Uskup Keuskupan Surabaya",
  keywords: ["Dashboard", "Uskup", "Surabaya", "Keuskupan", "Katolik"],
  authors: [{ name: "Keuskupan Surabaya" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Dashboard Uskup Surabaya",
    description: "Sistem Manajemen Data Uskup Keuskupan Surabaya",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${playfairDisplay.variable} ${dmSerifDisplay.variable} antialiased bg-background text-foreground font-sans`}
        suppressHydrationWarning
      >
        <GlobalErrorHandler>
          <Providers>
            {children}
          </Providers>
        </GlobalErrorHandler>
      </body>
    </html>
  );
}
