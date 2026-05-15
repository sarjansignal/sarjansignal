import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sarjansignal.ezos.my"),
  title: "SARJAN SIGNAL",
  description: "Trading Disiplin, Arahan Sarjan.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/sarjan-tab-192.png", sizes: "192x192", type: "image/png" },
      { url: "/sarjan-tab-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "SARJAN SIGNAL",
    description: "Trading Disiplin, Arahan Sarjan.",
    url: "https://sarjansignal.ezos.my",
    siteName: "SARJAN SIGNAL",
    images: [
      {
        url: "/sarjan-logo-big.png",
        width: 1200,
        height: 1200,
        alt: "SARJAN SIGNAL",
      },
    ],
    locale: "ms_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SARJAN SIGNAL",
    description: "Trading Disiplin, Arahan Sarjan.",
    images: ["/sarjan-logo-big.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
