import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
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
