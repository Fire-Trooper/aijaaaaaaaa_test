import type { Metadata } from "next";
import { Inter } from "next/font/google"; // แนะนำให้ใช้ฟอนต์ Noto Sans Thai หรือ Prompt นะครับถ้ามี
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ERP Estate Management",
  description: "ระบบจัดการอสังหาริมทรัพย์",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <Toaster position="top-center" />
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}