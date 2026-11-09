import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-main",
});

export const metadata: Metadata = {
  title: "Таблиця множення — вправи",
  description: "Тренажер для вивчення таблиці множення від 2 до 9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={manrope.variable}>
      <body>{children}</body>
    </html>
  );
}