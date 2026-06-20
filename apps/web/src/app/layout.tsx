import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppChrome } from "@/components/layout/AppChrome";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SRRU Student Activities",
  description:
    "ลงทะเบียนและตรวจสอบผลการเข้าร่วมกิจกรรมนักศึกษา — มหาวิทยาลัยราชภัฏสุรินทร์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased text-[var(--foreground)] bg-[var(--background)]`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
