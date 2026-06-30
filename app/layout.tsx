import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "テレアポ 切り返しAIアシスタント",
  description: "引越しテレアポ特化の切り返しトーク提案ツール",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
