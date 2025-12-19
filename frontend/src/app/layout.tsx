import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

import type { ReactNode } from 'react'

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <div className="min-h-screen bg-gray-50 flex">
          {sidebar ?? defaultSidebar}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}