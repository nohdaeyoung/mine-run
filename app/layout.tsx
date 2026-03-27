import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mine Run — Roguelike Minesweeper",
  description: "매 런마다 다른 아이템과 능력을 조합해 점점 위험한 지뢰밭을 돌파하는 로그라이크 지뢰찾기. 대담한 클릭일수록 큰 보상!",
  keywords: ["minesweeper", "roguelike", "지뢰찾기", "web game", "puzzle", "mine run"],
  authors: [{ name: "Mine Run" }],
  metadataBase: new URL("https://mine.324.ing"),
  openGraph: {
    title: "Mine Run — Roguelike Minesweeper",
    description: "Be Bold, Be Rewarded. 대담한 클릭으로 점점 위험한 지뢰밭을 돌파하라!",
    url: "https://mine.324.ing",
    siteName: "Mine Run",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mine Run — Roguelike Minesweeper",
    description: "Be Bold, Be Rewarded. 대담한 클릭으로 점점 위험한 지뢰밭을 돌파하라!",
  },
  icons: {
    icon: "/favicon.svg",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script src="/no-ctx.js" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
