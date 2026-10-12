import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "./providers";
import "./globals.css";

// Self-hosted: next/font/google produced mismatched class hashes between
// Vercel's server and client builds, leaving the page in the default serif.
const inter = localFont({
  src: "./fonts/InterVariable-latin.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jessie Wang — Portfolio",
  description:
    "Student developer. Projects, skills, and a playable Minesweeper game.",
  metadataBase: new URL("https://jessiewang.dev"),
  openGraph: {
    title: "Jessie Wang — Portfolio",
    description:
      "Student developer. Explore my projects and skills.",
    url: "https://jessiewang.dev",
    siteName: "Jessie Wang",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jessie Wang — Portfolio",
    description: "Student developer.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
