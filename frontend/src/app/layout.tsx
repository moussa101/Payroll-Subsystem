import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Payroll Configuration System",
  description: "Payroll configuration and management system",
};

export default function RootLayout({
  children,
  sidebar,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
}>) {
  const defaultSidebar = (
    <aside className="w-64 border-r border-white/10 bg-slate-950 text-white px-4 py-6 hidden md:block">
      <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
        Navigation
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <Link
          href="/payroll-tracking"
          className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 font-semibold hover:bg-white/15"
        >
          <span>Payroll History</span>
          <span className="text-[10px] rounded-full bg-emerald-300/90 px-2 py-0.5 text-emerald-900">
            New
          </span>
        </Link>
        <Link
          href="/payroll-tracking/claims"
          className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10"
        >
          Claims
        </Link>
        <Link
          href="/payroll-tracking/disputes"
          className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10"
        >
          Disputes
        </Link>
        <Link
          href="/payroll-tracking/refunds"
          className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-white/10"
        >
          Refunds
        </Link>
      </div>
    </aside>
  );

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
