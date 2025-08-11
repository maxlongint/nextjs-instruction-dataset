import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/main-layout";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "指令监督微调生成器",
  description: "通过上传的文本内容生成指令监督微调数据集",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning
      >
        {/* 根容器 - 包含所有页面内容 */}
        <div className="h-full flex flex-col bg-gray-50">
          <MainLayout>
            {children}
          </MainLayout>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
